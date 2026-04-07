"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
// Add official Gradio client per HF docs
import { Client } from "@gradio/client";
import { embedBatch } from "./embeddings";
import { PDFDocument } from "pdf-lib";
import { getAiProviderKeys } from "./lib/aiRouting";
// import * as pdfjsLib from "pdfjs-dist"; // DISABLED: causes DOMMatrix error in Node.js

// Polyfill for pdfjs-dist in Node environment if needed, though usually standard import works for text
// We might need to set workerSrc if it complains, but let's try without first.

export const extractPDF = action({
  args: {
    storageId: v.id("_storage"),
    fileName: v.optional(v.string()),
    pageRange: v.optional(v.object({ start: v.number(), end: v.number() })),
    smartMode: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Add request-scoped logger
    const REQUEST_ID = `ocr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const DEBUG =
      process.env.OCR_DEBUG === "1" || process.env.EXTRACTOR_DEBUG === "1";
    const log = (
      level: "info" | "warn" | "error",
      message: string,
      extra?: Record<string, any>,
    ) => {
      const base = `[studyExtractor][${REQUEST_ID}] ${message}`;
      const payload = extra ? ` ${JSON.stringify(extra)}` : "";
      // Use console[level]
      if (level === "info") console.info(base + payload);
      else if (level === "warn") console.warn(base + payload);
      else console.error(base + payload);
    };

    // Authenticate immediately - support multiple auth methods
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required to upload documents");
    }

    // Ensure user exists or create one - this handles the case where the user
    // is authenticated but their record doesn't exist yet
    const user = await ctx.runMutation(internal.study.ensureUserInternal, {
      email: identity.email,
      name: identity.name,
      pictureUrl: identity.pictureUrl,
      tokenIdentifier: identity.tokenIdentifier,
    });

    if (!user) {
      throw new Error(
        "Failed to create or find user record. Please try signing out and signing in again.",
      );
    }
    const userId = user._id;

    // Deduct Cryo Credits for PDF extraction when available.
    // A low balance should not break ingestion; it only disables the paid charge.
    const STUDY_COST = 10;
    try {
      const chargeStatus = await ctx.runQuery(
        internal.credits.getStudyCreditChargeStatus,
        {
          userId,
          amount: STUDY_COST,
        },
      );

      if (chargeStatus.canAfford) {
        await ctx.runMutation(internal.credits.spendStudyCredits, {
          userId,
          amount: STUDY_COST,
          reason: `PDF Upload: ${args.fileName || "Untitled"}`,
          metadata: {
            storageId: String(args.storageId),
            fileName: args.fileName || "Untitled",
          },
        });
      } else {
        log("warn", "cryo_credit_charge_skipped", {
          balance: chargeStatus.balance,
          required: STUDY_COST,
        });
      }
    } catch (e: any) {
      const message =
        e instanceof Error ? e.message : String(e || "Unknown error");
      if (
        message.includes("Insufficient Cryo Credits") ||
        message.includes("requires 10 Cryo Credits")
      ) {
        log("warn", "cryo_credit_charge_skipped", { error: message });
      } else {
        log("error", "cryo_credit_charge_failed", { error: message });
        throw new Error(message);
      }
    }

    log("info", "start_extraction", {
      storageId: String(args.storageId),
      providedFileName: args.fileName,
    });

    // Fetch PDF from storage
    const pdfBlob = await ctx.storage.get(args.storageId);
    if (!pdfBlob) {
      log("error", "blob_not_found", { storageId: String(args.storageId) });
      throw new Error("PDF not found in storage");
    }
    log("info", "blob_loaded", { size: pdfBlob.size });

    // Convert to buffer for form-data upload
    const arrayBuffer = await pdfBlob.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    log("info", "buffer_ready", { byteLength: buffer.byteLength });

    // --- Smart Page Detection & Slicing ---
    let offset = 0;
    const originalPageCount = 0;

    // 1. Smart Offset Detection
    if (args.smartMode && args.pageRange) {
      try {
        log("info", "starting_smart_offset_detection");
        // Load document with pdfjs-dist for text extraction
        // We need to pass data as Uint8Array
        const uint8Array = new Uint8Array(arrayBuffer);
        // const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
        // const pdf = await loadingTask.promise;
        // originalPageCount = pdf.numPages;

        // const scanPages = Math.min(pdf.numPages, 20);
        // let extractedText = "";

        // for (let i = 1; i <= scanPages; i++) {
        //   const page = await pdf.getPage(i);
        //   const content = await page.getTextContent();
        //   const strings = content.items.map((item: any) => item.str);
        //   extractedText += `--- PDF Page Index ${i - 1} (Physical Page ${i}) ---\n${strings.join(" ")}\n\n`;
        // }

        // Ask Gemini to find the offset
        const extractedText = ""; // Placeholder since smart mode is disabled
        const detectedOffset = await detectPageOffset(extractedText);
        if (detectedOffset !== null) {
          offset = detectedOffset;
          log("info", "smart_offset_detected", {
            offset,
            explanation: "Gemini found the start of the book",
          });
        } else {
          log("info", "smart_offset_no_result", {
            explanation: "Gemini could not determine offset, defaulting to 0",
          });
        }
      } catch (e) {
        log("warn", "smart_offset_failed", { error: String(e) });
      }
    }

    // 2. Slicing
    if (args.pageRange) {
      try {
        const srcDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = srcDoc.getPageCount();

        // Calculate actual indices
        // User input: start=19, end=27.
        // If offset=0: indices 18 to 26.
        // If offset=12 (Preface is 12 pages): indices 18+12=30 to 26+12=38.

        // User's "Page 19" corresponds to (19 - 1) + offset
        const startIdx = Math.max(0, args.pageRange.start - 1 + offset);
        // User's "Page 27" corresponds to (27 - 1) + offset
        // We want to include the end page, so we go up to endIdx inclusive
        const endIdx = Math.min(
          totalPages - 1,
          args.pageRange.end - 1 + offset,
        );

        if (startIdx <= endIdx) {
          const newDoc = await PDFDocument.create();
          const indices = [];
          for (let i = startIdx; i <= endIdx; i++) {
            indices.push(i);
          }

          const copiedPages = await newDoc.copyPages(srcDoc, indices);
          copiedPages.forEach((page) => newDoc.addPage(page));

          const newPdfBytes = await newDoc.save();
          buffer = Buffer.from(newPdfBytes);

          log("info", "pdf_sliced", {
            originalPages: totalPages,
            newPages: newDoc.getPageCount(),
            userRange: args.pageRange,
            calculatedIndices: [startIdx, endIdx],
            offset,
          });
        } else {
          log("warn", "invalid_slice_range", { startIdx, endIdx, totalPages });
        }
      } catch (e) {
        log("error", "slicing_failed", { error: String(e) });
        throw new Error("Failed to slice PDF page range.");
      }
    }
    // --- End Slicing ---

    // Use the provided fileName to signal file type to the Space (fall back to 'uploaded.pdf')
    const provided = (args.fileName || "").trim();
    const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const hasAllowedExt = allowedExts.some((ext) =>
      provided.toLowerCase().endsWith(ext),
    );
    const safeFileName = hasAllowedExt
      ? provided
      : provided
        ? `${provided}.pdf`
        : "uploaded.pdf";
    log("info", "filename_determined", { safeFileName });

    // Required Mistral key for the Space
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
      log("error", "missing_mistral_api_key");
      throw new Error(
        "MISTRAL_API_KEY environment variable not configured. Please add it to backend environment variables.",
      );
    }

    // Compute the Space base URL robustly from HF_SPACE_ID (supports full URL or owner/space)
    const hfSpaceIdRaw = (
      process.env.HF_SPACE_ID || "merterbak/Mistral-OCR"
    ).trim();
    const { spaceBase, hfSpaceIdNormalized, spaceOrigin } =
      resolveSpaceBase(hfSpaceIdRaw);
    log("info", "space_config", {
      hfSpaceIdRaw,
      hfSpaceIdNormalized,
      spaceBase,
      spaceOrigin,
    });

    // Add simple retry/backoff constants
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 800;

    // Attempt logs for diagnostics
    const attemptLogs: Array<Record<string, any>> = [];

    // Warmup flag to avoid repeating wake-up
    let spaceWarmed = false;

    // Helper: perform OCR using the official @gradio/client API for the Space (with simple retries & backoff)
    const doFormRequest = async (
      inputType: "FILE" | "Upload file" | "URL",
      useUrl?: string,
    ) => {
      // Warm up the Space (wake sleeping spaces) on the first request
      if (!spaceWarmed) {
        try {
          if (DEBUG) log("info", "waking_space", { origin: spaceOrigin });
          const warm = await fetch(spaceOrigin, { method: "GET" });
          if (DEBUG) log("info", "woke_space", { status: warm.status });
        } catch (e: any) {
          if (DEBUG) log("warn", "wake_failed", { error: String(e) });
        } finally {
          spaceWarmed = true;
        }
      }

      // Prepare inputs for /do_ocr per API docs
      const fileBlob = new Blob([buffer], { type: "application/pdf" });
      const effectiveInputType =
        inputType === "Upload file" ? "FILE" : inputType;

      // Connect to the HF Space using the official client
      // Use normalized ID for best compatibility with docs ("owner/Space")
      const hfTokenRaw = (
        process.env.HF_TOKEN ||
        process.env.HUGGINGFACE_API_KEY ||
        ""
      ).trim();
      const hfToken = hfTokenRaw.startsWith("hf_")
        ? (hfTokenRaw as `hf_${string}`)
        : undefined;

      // We already computed hfSpaceIdNormalized and spaceOrigin earlier
      const client = await Client.connect(
        hfSpaceIdNormalized,
        hfToken ? { token: hfToken } : undefined,
      );

      let lastErr: Error | null = null;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        const meta = {
          attempt,
          endpoint: "/do_ocr",
          inputType: effectiveInputType,
          hasUrl: !!useUrl,
        };

        try {
          if (DEBUG) log("info", "ocr_attempt", meta);

          const result = await client.predict("/do_ocr", {
            input_type: effectiveInputType,
            url: useUrl ?? "",
            file: effectiveInputType === "URL" ? null : fileBlob,
            api_key: mistralApiKey ?? "",
          });

          const okEntry = { ...meta, status: 200 };
          attemptLogs.push(okEntry);
          if (DEBUG) log("info", "ocr_success", okEntry);
          return result; // result.data is [plainText, markdown, gallery]
        } catch (e: any) {
          const err = e instanceof Error ? e : new Error(String(e));
          lastErr = err;
          // Backoff on failure (covers transient 5xx, rate limits, network hiccups)
          const delay =
            BASE_DELAY_MS * Math.pow(2, attempt) +
            Math.floor(Math.random() * 200);
          const entry = { ...meta, error: err.message, backoffMs: delay };
          attemptLogs.push(entry);
          if (DEBUG) log("warn", "client_predict_retry", entry);
          if (attempt < MAX_RETRIES - 1) {
            await sleep(delay);
          }
        }
      }

      // Exhausted retries, construct detailed error
      log("error", "ocr_exhausted_retries", { attempts: attemptLogs });
      const finalErr =
        lastErr ?? new Error("Failed to reach Mistral OCR Space");
      throw finalErr;
    };

    // --- Direct Gemini PDF Extraction (Primary & Most Robust) ---
    let extractedText = "";
    const geminiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    
    if (geminiKey) {
      const MAX_GEMINI_RETRIES = 3;
      const BASE_GEMINI_DELAY = 2000;

      for (let attempt = 0; attempt < MAX_GEMINI_RETRIES; attempt++) {
        try {
          if (attempt > 0) {
            const delay = BASE_GEMINI_DELAY * Math.pow(2, attempt - 1);
            if (DEBUG) log("info", "gemini_direct_retry_delay", { attempt, delay });
            await sleep(delay);
          }

          log("info", "trying_gemini_direct_extraction", { attempt });
          const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
          
          const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { inline_data: { mime_type: "application/pdf", data: buffer.toString("base64") } },
                  { text: "Extract ALL text from this PDF document. Identify every single lesson, chapter, and section. Provide the output in clean Markdown format. DO NOT include image placeholders like [img.jpg], [Figure], or (Figure 1). Focus strictly on educational text content." }
                ]
              }],
              generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 8192,
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            extractedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (extractedText.length > 500) {
              log("info", "gemini_direct_success", { textLength: extractedText.length });
              break; // Success!
            }
          } else {
            const errText = await response.text();
            const status = response.status;
            log("warn", "gemini_direct_failed", { status, error: errText.slice(0, 200) });
            
            // If it's not a retryable error (like 400), don't bother retrying
            if (status < 500 && status !== 429) {
              break;
            }
          }
        } catch (e) {
          log("error", "gemini_direct_error", { error: String(e) });
          if (attempt === MAX_GEMINI_RETRIES - 1) break;
        }
      }
    }

    // --- Fallback to OCR (Mistral OCR) if Gemini failed ---
    let json: any;
    if (!extractedText || extractedText.length < 500) {
      try {
        const signedUrl = await ctx.storage.getUrl(args.storageId);
        if (!signedUrl) {
          log("warn", "signed_url_unavailable");
          throw new Error("Failed to obtain signed URL for storage file");
        }
        log("info", "trying_url_mode", { signedUrlPresent: true });
        json = await doFormRequest("URL", signedUrl);
      } catch (e1: any) {
        log("warn", "url_mode_failed", { error: String(e1) });
        try {
          log("info", "trying_file_mode", { fileName: safeFileName });
          json = await doFormRequest("FILE");
        } catch (e2: any) {
          log("warn", "file_mode_failed", { error: String(e2) });
          log("info", "trying_upload_file_mode");
          json = await doFormRequest("Upload file");
        }
      }
    }

    // Parse response (per official API: result.data = [plainText, markdown, gallery])
    let images: any[] = [];
    if (!extractedText) {
      const responseData = json?.data;
      if (Array.isArray(responseData)) {
        // Some spaces return [page1Markdown, page2Markdown, ...]
        // Others return [allMarkdown, allPlainText, gallery]
        // We carefully check the structure
        if (typeof responseData[0] === "string" && responseData[0].length > 1000) {
           // Case 1: Concatenate long strings (likely pages)
           // But check for redundancy first: some spaces return the FULL doc for every page
           const uniqueStrings: string[] = [];
           for (const str of responseData) {
             if (typeof str !== "string" || str.length < 50) continue;
             // Check if this string is significantly different from the last one or all previous ones
             const isDuplicate = uniqueStrings.some(existing => {
               // Fast containment check: if a large middle chunk of this string is already present 
               // in an existing string, it's likely a redundant full-doc return
               if (str.length > 2000 && existing.length > 2000) {
                 const sample = str.slice(Math.floor(str.length / 4), Math.floor(str.length / 4) + 1000);
                 if (existing.includes(sample)) return true;
               }
               // Fallback: prefix + length check
               if (Math.abs(existing.length - str.length) < 100 && existing.slice(0, 100) === str.slice(0, 100)) {
                 return true;
               }
               return false;
             });
             
             if (!isDuplicate) {
               uniqueStrings.push(str);
             }
           }
           extractedText = uniqueStrings.join("\n\n---\n\n");
        } else {
           // Case 2: Take the largest text block (likely the full markdown)
           // and fallback to plain text if needed
           const md = String(responseData[1] || "");
           const pt = String(responseData[0] || "");
           extractedText = md.length > pt.length ? md : pt;
        }
      } else {
        extractedText = String(json?.data?.[1] || json?.data?.[0] || "");
      }
      
      const gallery = json?.data?.[2];
      images = Array.isArray(gallery)
          ? gallery
              .map((g: any, i: number) => ({
                id: `fig-${i}`,
                src: typeof g === "string" ? g : g?.url || g?.path || "",
                caption: `Figure ${i + 1}`,
              }))
              .filter((img) => img.src.length < 2000) // Filter out large base64 images
          : [];
          
      log("info", "ocr_parse_summary", {
        textLength: extractedText.length,
        imagesCount: images.length,
      });
    }

    const text = extractedText;

    if (!text || text.trim().length < 50) {
      log("error", "extracted_text_too_short", {
        length: text?.trim().length || 0,
      });
      throw new Error(
        "Extracted text is too short. The PDF may be empty, image-only, or unreadable. Minimum 50 characters required.",
      );
    }

    // Detect STEM content
    const isSTEM = /\[.*?\]|\$\$.*?\$\$|\$.*?\$|\\begin{equation}/.test(text);

    // Generate summaries using Bytez AI (graceful fallback if not configured)
    const summaries = await generateSummaries(text);

    // Create document ID
    const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Chunk and embed text
    const chunks = chunkText(text, 500);
    const embeddingResult = await embedBatch(chunks);
    const embeddings = embeddingResult.embeddings;

    // Parse sections from extracted text
    const sections = parseMarkdownSections(text);

    log("info", "extraction_complete", {
      docId,
      chunks: chunks.length,
      isSTEM,
      embeddingProvider: embeddingResult.provider,
      embeddingFallback: embeddingResult.degraded,
      pageCountEstimate: Math.ceil(text.length / 3000),
    });

    // User already authenticated at start

    // Store document in database
    // Limit text size to avoid exceeding Convex's 1 MiB document limit
    const textPreview =
      text.length > 20000
        ? text.slice(0, 20000) + "\n\n[...Full text available in chunks...]"
        : text;

    await ctx.runMutation(internal.studyMutations.storeDocument, {
      userId,
      docId,
      meta: {
        title: args.fileName || "Untitled Document",
        pages: Math.ceil(text.length / 3000),
        createdAt: new Date().toISOString(),
      },
      extracted: {
        text: textPreview,
        sections: sections
          .slice(0, 10)
          .map((s) => ({ ...s, text: s.text.slice(0, 2000) })),
        tables: [],
        figures: images.slice(0, 5),
      },
      summary: summaries,
      storageId: args.storageId,
      isSTEM,
      embeddingProvider: embeddingResult.provider,
    });

    // Store chunks
    for (let i = 0; i < chunks.length; i++) {
      await ctx.runMutation(internal.studyMutations.storeChunk, {
        docId,
        chunkId: `${docId}_chunk_${i}`,
        text: chunks[i],
        embedding: embeddings[i],
      });
    }

    log("info", "document_stored", { docId, userId: String(userId) });

    // Return a lightweight payload to the frontend client.
    // Full text & embeddings are already stored server-side in chunks.
    // The frontend only needs enough text for generateAllAssets (which handles larger chunks now).
    const TEXT_RETURN_CAP = 100000;
    const cappedText = text.length > TEXT_RETURN_CAP
      ? text.slice(0, TEXT_RETURN_CAP) + "\n\n[...truncated for transfer...]"
      : text;

    return {
      docId,
      text: cappedText,
      sections: sections.slice(0, 5),
      tables: [],
      figures: images.slice(0, 3),
      pageCount: Math.ceil(text.length / 3000),
      isSTEM,
      summaries,
      chunks: chunks.map((chunk, i) => ({
        chunkId: `${docId}_chunk_${i}`,
        text: chunk.slice(0, 200),
      })),
    };
  },
});

function parseMarkdownSections(
  markdown: string,
): Array<{ id: string; title: string; text: string }> {
  const sections: Array<{ id: string; title: string; text: string }> = [];
  const lines = markdown.split("\n");
  let currentSection: { id: string; title: string; text: string } | null = null;
  let sectionIndex = 0;

  for (const line of lines) {
    // Check for markdown headers (# ## ###)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      // Save previous section
      if (currentSection) {
        sections.push(currentSection);
      }
      // Start new section
      sectionIndex++;
      currentSection = {
        id: `sec${sectionIndex}`,
        title: headerMatch[2].trim(),
        text: "",
      };
    } else if (currentSection) {
      currentSection.text += line + "\n";
    }
  }

  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

async function generateSummaries(
  text: string,
): Promise<{ short: string; detailed: string }> {
  // Increased limit for models like Gemini 2 Flash / Mistral Large 
  const trimmed = text.slice(0, 48000); // Increased from 12k to 48k (~24-30 pages)
  const {
    openrouter: openrouterKey,
    cerebras: cerebrasKey,
    sambanova: sambanovaKey,
    google: geminiKey,
    groq: groqKey,
    huggingface: hfKey,
    bytez: bytezKey,
  } = getAiProviderKeys();

  const parseStructuredSummary = (content: string) => {
    const detailed = content.trim();
    if (!detailed) return null;

    const overviewMatch = detailed.match(
      /\*\*Brief Overview\*\*:\s*(.*?)(?=\n\n|\n\d\.|\n\*)/s,
    );
    const short = overviewMatch
      ? overviewMatch[1].trim()
      : `${detailed.slice(0, 200).trim()}...`;

    return { short: short || "Document summary generated.", detailed };
  };

  const openRouterSystemPrompt =
    "You are an expert study assistant. Create a stunning, highly organized study guide from the provided text.\n" +
    "The document may contain multiple lessons or chapters. Use rich aesthetics with emojis and clear structure.\n" +
    "MANDATORY FORMATTING RULES:\n" +
    '1. Use Markdown headers with emojis (e.g., "# Lesson Summary 📄").\n' +
    '2. Use ✍️ for introductory context or "System" notes.\n' +
    '3. Use 🔹 for main definitions or sections (e.g., "🔹 **Concept**: Definition").\n' +
    "4. Use 🧠 **ركز (Focus)**: followed by a list for the most critical points the student must memorize.\n" +
    "5. Use 🔥 **أهم الأسئلة المتوقعة (Expected Questions)** at the end of each major section for potential exam questions.\n" +
    '6. Format headers using ordinal numbering if applicable (e.g., "أولاً: ...", "ثانياً: ...").\n' +
    "7. Always respond in the language of the source text (e.g., if Hebrew, use Hebrew; if Arabic, use Arabic; if English, use English).\n\n" +
    "Section Structure:\n" +
    "1. **Brief Overview**: Concise document summary.\n" +
    "2. **Key Lessons**: List of detected chapters.\n" +
    "3. **Detailed Notes**: Deep dive with the aesthetics mentioned above.\n\n" +
    "CRITICAL: Never mention graphics, image placeholders, or missing figures. Focus only on high-value academic concepts.";

  if (openrouterKey) {
    const openRouterModels = [
      {
        name: "Step 3.5 Flash Free",
        model: "stepfun/step-3.5-flash:free",
      },
      {
        name: "GLM 4.5 Air Free",
        model: "z-ai/glm-4.5-air:free",
      },
      { name: "Free Models Router", model: "openrouter/free" },
    ];

    for (const candidate of openRouterModels) {
      try {
        const response = await fetch(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${openrouterKey}`,
              "HTTP-Referer": "https://www.cryonex.app",
              "X-Title": "Cryonex Study Uploads",
            },
            body: JSON.stringify({
              model: candidate.model,
              messages: [
                { role: "system", content: openRouterSystemPrompt },
                {
                  role: "user",
                  content: `Please identify all specific lessons and chapters in this material and summarize every single one of them:\n\n${trimmed}`,
                },
              ],
              temperature: 0.4,
              max_tokens: 3000,
            }),
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `${candidate.model} failed: ${response.status} ${errorText.slice(0, 280)}`,
          );
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content || "";
        const parsed = parseStructuredSummary(content);
        if (parsed) {
          console.log(
            `[studyExtractor] OpenRouter summary succeeded with ${candidate.name} (${data?.model || candidate.model})`,
          );
          return parsed;
        }
      } catch (error) {
        console.warn(
          `[studyExtractor] OpenRouter ${candidate.name} failed:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }
  }

  // Build provider chain: Cerebras → SambaNova → Groq → Gemini → HuggingFace → OpenRouter → Bytez → Puter → local fallback
  const providers: Array<{
    name: string;
    url: string;
    apiKey: string;
    model: string;
    useJson: boolean;
    isGemini: boolean;
    isHuggingFace: boolean;
    isCerebras?: boolean;
    isSambaNova?: boolean;
    isGroq?: boolean;
  }> = [];

  // Primary: Cerebras (fast inference)
  if (cerebrasKey) {
    providers.push({
      name: "Cerebras",
      url: "https://api.cerebras.ai/v1/chat/completions",
      apiKey: cerebrasKey,
      model: "gpt-oss-120b",
      useJson: false,
      isGemini: false,
      isHuggingFace: false,
      isCerebras: true,
    });
  }

  // Primary: SambaNova (fast inference)
  if (sambanovaKey) {
    providers.push({
      name: "SambaNova",
      url: "https://api.sambanova.ai/v1/chat/completions",
      apiKey: sambanovaKey,
      model: "DeepSeek-V3.1",
      useJson: false,
      isGemini: false,
      isHuggingFace: false,
      isSambaNova: true,
    });
  }

  // Secondary: Groq (fast, stable, good value)
  if (groqKey) {
    providers.push({
      name: "Groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: "openai/gpt-oss-120b",
      useJson: false,
      isGemini: false,
      isHuggingFace: false,
      isGroq: true,
    });
  }

  // Tertiary: Gemini
  if (geminiKey) {
    providers.push({
      name: "Gemini",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      apiKey: geminiKey,
      model: "gemini-2.5-flash",
      useJson: false,
      isGemini: true,
      isHuggingFace: false,
    });
  }

  // Fallback: HuggingFace
  if (hfKey) {
    providers.push({
      name: "Hugging Face",
      url: "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-14B-Instruct",
      apiKey: hfKey,
      model: "Qwen/Qwen2.5-14B-Instruct",
      useJson: false,
      isGemini: false,
      isHuggingFace: true,
    });
  }

  // Fallback: OpenRouter
  if (openrouterKey) {
    providers.push({
      name: "OpenRouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openrouterKey,
      model: "stepfun/step-3.5-flash:free",
      useJson: false,
      isGemini: false,
      isHuggingFace: false,
      isGroq: false,
    });
  }

  // Fallback: Bytez
  if (bytezKey) {
    providers.push({
      name: "Bytez",
      url: "https://api.bytez.com/v1/chat/completions",
      apiKey: bytezKey,
      model: "gpt-4o-mini",
      useJson: false,
      isGemini: false,
      isHuggingFace: false,
    });
  }

  // Final fallback: Puter (free)
  providers.push({
    name: "Puter",
    url: "https://api.puter.com/v1/chat/completions",
    apiKey: "",
    model: "gpt-4o-mini",
    useJson: false,
    isGemini: false,
    isHuggingFace: false,
  });

  // Try each provider in sequence
  for (const provider of providers) {
    try {
      if (provider.isGemini) {
        // Gemini API format
        const systemPrompt =
          "You are an expert study assistant. Create a stunning, highly organized study guide from the provided text.\n" +
          "Use rich aesthetics with emojis and clear structure.\n" +
          "MANDATORY FORMATTING Rules:\n" +
          '1. Use # with 📄 header (e.g., "# Lesson Summary 📄").\n' +
          "2. Use 🔹 for concepts and definitions.\n" +
          "3. Use 🧠 **ركز (Focus)**: for critical concepts.\n" +
          "4. Use 🔥 **أهم الأسئلة المتوقعة (Expected Questions)** for exam readiness.\n" +
          "5. Match the source text language for the output.\n\n" +
          "Structure the Markdown with a 1. **Brief Overview**, 2. **Key Points**, and 3. **Detailed Notes** using the aesthetics above.";

        const r = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: `${systemPrompt}\n\nPlease identify all specific lessons and chapters in this material and summarize every single one of them:\n\n${trimmed}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 2200,
            },
          }),
        });

        if (r.ok) {
          const data = await r.json();
          const content =
            data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
          console.log(
            "[studyExtractor] Gemini response length:",
            content.length,
          );

          let short = "";
          const detailed = content;

          // Extract Brief Overview for short summary
          const overviewMatch = content.match(
            /\*\*Brief Overview\*\*:\s*(.*?)(?=\n\n|\n\d\.|\n\*)/s,
          );
          if (overviewMatch) {
            short = overviewMatch[1].trim();
          } else {
            short = content.slice(0, 200).trim() + "...";
          }

          if (detailed) {
            console.log("[studyExtractor] Gemini summary parsed successfully");
            return { short: short || "Document summary generated.", detailed };
          }
        } else {
          console.warn(
            "[studyExtractor] Gemini request failed:",
            r.status,
            r.statusText,
          );
        }
      } else if (provider.isHuggingFace) {
        // Hugging Face Inference API format
        const systemPrompt =
          "You are an expert study assistant. Create a stunning, highly organized study guide from the provided text.\n" +
          "Use rich aesthetics with emojis and clear structure.\n" +
          "MANDATORY FORMATTING Rules:\n" +
          '1. Use # with 📄 header (e.g., "# Lesson Summary 📄").\n' +
          "2. Use 🔹 for concepts and definitions.\n" +
          "3. Use 🧠 **ركز (Focus)**: for critical concepts.\n" +
          "4. Use 🔥 **أهم الأسئلة المتوقعة (Expected Questions)** for exam readiness.\n" +
          "5. Match the source text language for the output.\n\n" +
          "Structure the Markdown with a 1. **Brief Overview**, 2. **Key Points**, and 3. **Detailed Notes** using the aesthetics above.";

        const r = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.apiKey}`,
          },
          body: JSON.stringify({
            inputs: `${systemPrompt}\n\nSummarize the following document:\n\n${trimmed}`,
            parameters: {
              temperature: 0.5,
              max_new_tokens: 2200,
              return_full_text: false,
            },
          }),
        });

        if (r.ok) {
          const data = await r.json();
          const content = data[0]?.generated_text || data.generated_text || "";
          console.log(
            "[studyExtractor] HuggingFace response length:",
            content.length,
          );

          let short = "";
          const detailed = content;

          // Extract Brief Overview for short summary
          const overviewMatch = content.match(
            /\*\*Brief Overview\*\*:\s*(.*?)(?=\n\n|\n\d\.|\n\*)/s,
          );
          if (overviewMatch) {
            short = overviewMatch[1].trim();
          } else {
            short = content.slice(0, 200).trim() + "...";
          }

          if (detailed) {
            console.log(
              "[studyExtractor] HuggingFace summary parsed successfully",
            );
            return { short: short || "Document summary generated.", detailed };
          }
        } else {
          console.warn(
            "[studyExtractor] HuggingFace request failed:",
            r.status,
          );
        }
      } else {
        // OpenAI-compatible providers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (provider.apiKey) {
          headers["Authorization"] = `Bearer ${provider.apiKey}`;
        }

        const systemPrompt = provider.useJson
          ? "You are a world-class study summarizer. Return STRICT JSON with keys `short` and `detailed`. " +
            "`short` = 2-4 crisp sentences under 120 words. " +
            "`detailed` = stunning, highly organized Markdown study guide with 🔹 definitions, 🧠 Focus (ركز) points, and 🔥 Expected Questions."
          : "You are an expert study assistant. Create a stunning, highly organized study guide from the provided text.\n" +
            "MANDATORY FORMATTING: Use 🔹 for definitions, 🧠 **ركز (Focus)**: for core points, and 🔥 **أهم الأسئلة المتوقعة (Expected Questions)**.\n" +
            "Match the source text language and use emojis like 📄 and 🔹 for structure.";

        const r = await fetch(provider.url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Summarize the following document:\n\n${trimmed}`,
              },
            ],
            temperature: 0.5,
            max_tokens: 2200,
          }),
        });

        if (r.ok) {
          const data = await r.json();
          const content = data?.choices?.[0]?.message?.content || "";
          console.log(
            `[studyExtractor] ${provider.name} response length:`,
            content.length,
          );

          if (provider.useJson) {
            try {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed?.short && parsed?.detailed) {
                  console.log(
                    `[studyExtractor] ${provider.name} JSON parsed successfully`,
                  );
                  return {
                    short: String(parsed.short),
                    detailed: String(parsed.detailed),
                  };
                }
              }
            } catch (e) {
              console.warn(
                `[studyExtractor] ${provider.name} JSON parse failed, using text fallback`,
              );
            }
          }

          // Try text parsing (works for JSON failures too)
          let short = "";
          const detailed = content;

          // Extract Brief Overview for short summary
          const overviewMatch = content.match(
            /\*\*Brief Overview\*\*:\s*(.*?)(?=\n\n|\n\d\.|\n\*)/s,
          );
          if (overviewMatch) {
            short = overviewMatch[1].trim();
          } else {
            short = content.slice(0, 200).trim() + "...";
          }

          if (detailed) {
            console.log(
              `[studyExtractor] ${provider.name} summary parsed successfully`,
            );
            return { short: short || "Document summary generated.", detailed };
          }
        } else {
          console.warn(
            `[studyExtractor] ${provider.name} request failed:`,
            r.status,
          );
        }
      }

      console.warn(
        `${provider.name} summarization failed, trying next provider...`,
      );
    } catch (e) {
      console.error(`${provider.name} summary error:`, e);
    }
  }

  // Final local fallback - create a structured summary from the text
  const sentences = trimmed
    .split(/[.!?]+\s+/)
    .filter((s) => s.trim().length > 20);
  const shortSummary =
    sentences.slice(0, 3).join(". ").trim() +
    (sentences.length > 3 ? "..." : ".");

  // Create a basic markdown summary with key points
  const keyPoints = sentences
    .slice(0, 10)
    .map((s) => `- ${s.trim()}`)
    .join("\n");
  const detailedSummary = `## Document Overview

This document has been processed but AI summarization was not available. Here's an overview based on the extracted content:

### Key Points
${keyPoints}

### Full Extracted Text Preview
${trimmed.slice(0, 1500)}${trimmed.length > 1500 ? "..." : ""}

---
*Note: Click "Generate" to create an AI-powered summary with flashcards, quizzes, and more.*`;

  console.warn("Using local fallback summary - no AI providers succeeded");
  return {
    short: shortSummary || "Document processed. Click Generate for AI summary.",
    detailed: detailedSummary,
  };
}

function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    // If a single sentence is longer than the chunkSize, we must split it by characters
    if (sentence.length > chunkSize) {
      // First, flush the current chunk if it exists
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = "";
      }
      
      // Split the long sentence into character-based sub-chunks
      for (let i = 0; i < sentence.length; i += chunkSize) {
        const subChunk = sentence.slice(i, i + chunkSize);
        if (subChunk.trim().length > 0) {
          chunks.push(subChunk.trim());
        }
        // Safety break for extremely long strings to prevent infinite loops or memory issues
        if (chunks.length > 10000) break;
      }
      if (chunks.length > 10000) break;
      continue;
    }

    if (
      (currentChunk + sentence).length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

function resolveSpaceBase(hfSpaceId: string) {
  // Normalize "owner/space" -> "https://owner-space.hf.space"
  // If full URL provided, use it.
  let hfSpaceIdNormalized = hfSpaceId;
  let spaceBase = "";
  let spaceOrigin = "";

  if (hfSpaceId.startsWith("http")) {
    spaceOrigin = hfSpaceId;
    // Try to extract owner/space from URL if possible, else just use URL as ID (client might handle it)
    // But @gradio/client usually wants "owner/space" or a direct URL.
    // Let's assume if it's a URL, we pass it as is to client.connect?
    // Actually client.connect prefers "owner/space".
    // Let's try to extract it.
    const match = hfSpaceId.match(/hf\.space\/(?:call\/)?([^/]+)\/([^/]+)/);
    if (match) {
      // It's a bit complex to reverse engineer the owner/space from the subdomain (owner-space).
      // So if the user provided a URL, we might just use it as the "space" for client.connect if it supports it.
      // Documentation says: client.connect("user/space-name") or client.connect("https://user-space-name.hf.space")
      hfSpaceIdNormalized = hfSpaceId;
    }
  } else {
    // It's "owner/space"
    const parts = hfSpaceId.split("/");
    if (parts.length === 2) {
      const subdomain = `${parts[0]}-${parts[1]}`.toLowerCase();
      spaceOrigin = `https://${subdomain}.hf.space`;
    } else {
      // Fallback
      spaceOrigin = `https://${hfSpaceId.replace("/", "-")}.hf.space`;
    }
  }
  spaceBase = spaceOrigin; // They are effectively the same for our usage
  return { spaceBase, hfSpaceIdNormalized, spaceOrigin };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function detectPageOffset(text: string): Promise<number | null> {
  const geminiKey = getAiProviderKeys().google;
  if (!geminiKey) return null;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a PDF structure analyzer. I will provide text extracted from the first 20 pages of a book PDF. 
            Your task is to identify the "Page Offset". 
            
            Many books have introductory pages (i, ii, iii...) before "Page 1" of the actual content starts.
            The "Page Offset" is the number of physical pages BEFORE the book's labeled "Page 1".
            
            Example:
            - If "Page 1" is on the 5th physical page (index 4), the offset is 4.
            - If "Page 1" is on the 1st physical page (index 0), the offset is 0.
            
            Look for:
            - Table of Contents ending
            - "Chapter 1" or "Introduction" starting with page number 1
            - Headers/Footers containing "1"
            
            Return ONLY a JSON object: { "offset": number, "reason": "string" }`,
                },
                {
                  text: text,
                },
              ],
            },
          ],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );

    if (r.ok) {
      const data = await r.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (content) {
        const parsed = JSON.parse(content);
        return typeof parsed.offset === "number" ? parsed.offset : 0;
      }
    }
  } catch (e) {
    console.error("Error detecting page offset:", e);
  }
  return null;
}
