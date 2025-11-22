"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
// Add official Gradio client per HF docs
import { Client } from "@gradio/client";

export const extractPDF = action({
  args: { storageId: v.id("_storage"), fileName: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Add request-scoped logger
    const REQUEST_ID = `ocr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const DEBUG = process.env.OCR_DEBUG === "1" || process.env.EXTRACTOR_DEBUG === "1";
    const log = (
      level: "info" | "warn" | "error",
      message: string,
      extra?: Record<string, any>
    ) => {
      const base = `[studyExtractor][${REQUEST_ID}] ${message}`;
      const payload = extra ? ` ${JSON.stringify(extra)}` : "";
      // Use console[level]
      if (level === "info") console.info(base + payload);
      else if (level === "warn") console.warn(base + payload);
      else console.error(base + payload);
    };

    log("info", "start_extraction", { storageId: String(args.storageId), providedFileName: args.fileName });

    // Fetch PDF from storage
    const pdfBlob = await ctx.storage.get(args.storageId);
    if (!pdfBlob) {
      log("error", "blob_not_found", { storageId: String(args.storageId) });
      throw new Error("PDF not found in storage");
    }
    log("info", "blob_loaded", { size: pdfBlob.size });

    // Convert to buffer for form-data upload
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    log("info", "buffer_ready", { byteLength: buffer.byteLength });

    // Use the provided fileName to signal file type to the Space (fall back to 'uploaded.pdf')
    const provided = (args.fileName || "").trim();
    const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const hasAllowedExt = allowedExts.some((ext) =>
      provided.toLowerCase().endsWith(ext)
    );
    const safeFileName = hasAllowedExt
      ? provided
      : (provided ? `${provided}.pdf` : "uploaded.pdf");
    log("info", "filename_determined", { safeFileName });

    // Required Mistral key for the Space
    const mistralApiKey = process.env.MISTRAL_API_KEY;
    if (!mistralApiKey) {
      log("error", "missing_mistral_api_key");
      throw new Error(
        "MISTRAL_API_KEY environment variable not configured. Please add it to backend environment variables."
      );
    }

    // Compute the Space base URL robustly from HF_SPACE_ID (supports full URL or owner/space)
    const hfSpaceIdRaw = (process.env.HF_SPACE_ID || "merterbak/Mistral-OCR").trim();
    const { spaceBase, hfSpaceIdNormalized, spaceOrigin } = resolveSpaceBase(hfSpaceIdRaw);
    log("info", "space_config", { hfSpaceIdRaw, hfSpaceIdNormalized, spaceBase, spaceOrigin });

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
      useUrl?: string
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
      const effectiveInputType = inputType === "Upload file" ? "FILE" : inputType;

      // Connect to the HF Space using the official client
      // Use normalized ID for best compatibility with docs ("owner/Space")
      const hfTokenRaw = (process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || "").trim();
      const hfToken = hfTokenRaw.startsWith("hf_") ? (hfTokenRaw as `hf_${string}`) : undefined;

      // We already computed hfSpaceIdNormalized and spaceOrigin earlier
      const client = await Client.connect(hfSpaceIdNormalized, hfToken ? { token: hfToken } : undefined);

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
          const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.floor(Math.random() * 200);
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
      const finalErr = lastErr ?? new Error("Failed to reach Mistral OCR Space");
      throw finalErr;
    };

    // Prefer URL first to bypass strict file-type checks; then fall back to file uploads
    let json: any;
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

    // Parse response (per official API: result.data = [plainText, markdown, gallery])
    const responseData = json?.data as any;
    const plainText = responseData?.[0] || "";
    const markdown = responseData?.[1] || "";
    const gallery = responseData?.[2];

    const images = Array.isArray(gallery)
      ? gallery.map((g: any, i: number) => ({
          id: `fig-${i}`,
          src: typeof g === "string" ? g : g?.url || g?.path || "",
          caption: `Figure ${i + 1}`,
        }))
      : [];

    const text = markdown || plainText;
    log("info", "ocr_parse_summary", {
      textLength: text.length,
      markdownLength: (markdown || "").length,
      plainTextLength: (plainText || "").length,
      imagesCount: images.length,
    });

    if (!text || text.trim().length < 50) {
      log("error", "extracted_text_too_short", { length: text?.trim().length || 0 });
      throw new Error(
        "Extracted text is too short. The PDF may be empty, image-only, or unreadable. Minimum 50 characters required."
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
    const embeddings = await embedChunks(chunks);

    // Parse sections from markdown
    const sections = parseMarkdownSections(markdown || plainText);

    log("info", "extraction_complete", {
      docId,
      chunks: chunks.length,
      isSTEM,
      pageCountEstimate: Math.ceil(text.length / 3000),
    });

    // Get or create user
    const identity = await ctx.auth.getUserIdentity();
    let userId;
    
    if (identity && identity.email) {
      const user = await ctx.runQuery(internal.study.getUserByEmail, { email: identity.email });
      if (user) {
        userId = user._id;
      } else {
        // User has identity but not in database yet, create anonymous user
        userId = await ctx.runMutation(internal.study.getOrCreateAnonymousUser, {});
      }
    } else {
      // No identity, create anonymous user
      userId = await ctx.runMutation(internal.study.getOrCreateAnonymousUser, {});
    }

    // Store document in database
    await ctx.runMutation(internal.studyMutations.storeDocument, {
      userId,
      docId,
      meta: {
        title: args.fileName || "Untitled Document",
        pages: Math.ceil(text.length / 3000),
        createdAt: new Date().toISOString(),
      },
      extracted: {
        text,
        sections,
        tables: [],
        figures: images,
      },
      summary: summaries,
      storageId: args.storageId,
      isSTEM,
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

    return {
      docId,
      text,
      sections,
      tables: [],
      figures: images,
      pageCount: Math.ceil(text.length / 3000),
      isSTEM,
      summaries,
      chunks: chunks.map((chunk, i) => ({
        chunkId: `${docId}_chunk_${i}`,
        text: chunk,
        embedding: embeddings[i],
      })),
    };
  },
});

function parseMarkdownSections(markdown: string): Array<{ id: string; title: string; text: string }> {
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

async function generateSummaries(text: string): Promise<{ short: string; detailed: string }> {
  const trimmed = text.slice(0, 12000);
  
  // Build provider chain: Gemini → Hugging Face → OpenRouter → Bytez → Puter → local fallback
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  const hfKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || "";
  const openrouterKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.VLY_OPENROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY ||
    "";
  const bytezKey = process.env.BYTEZ_API_KEY || process.env.VITE_BYTEZ_API_KEY || "";

  const providers = [];
  
  if (geminiKey) {
    providers.push({
      name: "Gemini",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
      apiKey: geminiKey,
      model: "gemini-2.0-flash-exp",
      useJson: false,
      isGemini: true,
      isHuggingFace: false,
    });
  }
  
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
  
  if (openrouterKey) {
    providers.push({
      name: "OpenRouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openrouterKey,
      model: "openai/gpt-4-turbo",
      useJson: true,
      isGemini: false,
      isHuggingFace: false,
    });
  }
  
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
  
  // Always add Puter as free fallback
  providers.push({
    name: "Puter",
    url: "https://api.puter.com/v1/chat/completions",
    apiKey: "",
    model: "gpt-5-mini",
    useJson: false,
    isGemini: false,
    isHuggingFace: false,
  });

  // Try each provider in sequence
  for (const provider of providers) {
    try {
      if (provider.isGemini) {
        // Gemini API format
        const systemPrompt = "Summarize for studying. Produce two parts labelled EXACTLY:\n" +
          "SHORT:\n" +
          "(2-4 sentences under 120 words)\n" +
          "---\n" +
          "DETAILED:\n" +
          "(Comprehensive markdown with headings, bullets, key terms, examples)";

        const r = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${systemPrompt}\n\nSummarize the following document:\n\n${trimmed}` }]
              }
            ],
            generationConfig: {
              temperature: 0.5,
              maxOutputTokens: 2200,
            },
          }),
        });

        if (r.ok) {
          const data = await r.json();
          const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

          const short = (content.split("DETAILED:")[0] || "").replace(/^SHORT:\s*/i, "").trim();
          const detailed = (content.split("DETAILED:")[1] || content).trim();
          if (short && detailed) {
            return { short, detailed };
          }
        }
      } else if (provider.isHuggingFace) {
        // Hugging Face Inference API format
        const systemPrompt = "Summarize for studying. Produce two parts labelled EXACTLY:\n" +
          "SHORT:\n" +
          "(2-4 sentences under 120 words)\n" +
          "---\n" +
          "DETAILED:\n" +
          "(Comprehensive markdown with headings, bullets, key terms, examples)";

        const r = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${provider.apiKey}`,
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

          const short = (content.split("DETAILED:")[0] || "").replace(/^SHORT:\s*/i, "").trim();
          const detailed = (content.split("DETAILED:")[1] || content).trim();
          if (short && detailed) {
            return { short, detailed };
          }
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
            "`detailed` = high-quality markdown notes with headings, bullet points, key terms, and examples. No prose outside JSON."
          : "Summarize for studying. Produce two parts labelled EXACTLY:\n" +
            "SHORT:\n" +
            "(2-4 sentences under 120 words)\n" +
            "---\n" +
            "DETAILED:\n" +
            "(Comprehensive markdown with headings, bullets, key terms, examples)";

        const r = await fetch(provider.url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Summarize the following document:\n\n${trimmed}` },
            ],
            temperature: 0.5,
            max_tokens: 2200,
          }),
        });

        if (r.ok) {
          const data = await r.json();
          const content = data?.choices?.[0]?.message?.content || "";

          if (provider.useJson) {
            const jsonMatch = content.match(/{[\s\S]*}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              if (parsed?.short && parsed?.detailed) {
                return { short: String(parsed.short), detailed: String(parsed.detailed) };
              }
            }
          } else {
            const short = (content.split("DETAILED:")[0] || "").replace(/^SHORT:\s*/i, "").trim();
            const detailed = (content.split("DETAILED:")[1] || content).trim();
            if (short && detailed) {
              return { short, detailed };
            }
          }
        }
      }

      console.warn(`${provider.name} summarization failed, trying next provider...`);
    } catch (e) {
      console.error(`${provider.name} summary error:`, e);
    }
  }

  // Final local fallback
  return {
    short: trimmed.slice(0, 480).split(/\.\s/).slice(0, 3).join(". ") + "...",
    detailed: trimmed.slice(0, 2000) + "...",
  };
}

function chunkText(text: string, chunkSize: number): string[] {
  const chunks: string[] = [];
  const sentences = text.split(/[.!?]+\s+/);
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? " " : "") + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function embedChunks(chunks: string[]): Promise<number[][]> {
  // Simple embedding placeholder - returns zero vectors
  return chunks.map(() => new Array(768).fill(0));
}

function resolveSpaceBase(hfSpaceId: string): {
  spaceBase: string;
  hfSpaceIdNormalized: string;
  spaceOrigin: string;
} {
  // Accept either:
  // - "owner/SpaceName"  => https://owner-spacename.hf.space
  // - "https://owner-spacename.hf.space[/...]" => normalize to origin
  let origin = "";
  let normalized = hfSpaceId;

  if (/^https?:\/\//i.test(hfSpaceId)) {
    try {
      const u = new URL(hfSpaceId);
      origin = u.origin;
      // Try to reconstruct owner/space from host: owner-spacename.hf.space
      // Fallback to raw if not parseable.
      const host = u.hostname; // e.g., owner-spacename.hf.space
      const m = host.match(/^([a-z0-9-]+)\.hf\.space$/);
      if (m) {
        normalized = m[1].replace("-", "/");
      }
    } catch {
      // If parsing fails, fallback to default
      origin = "https://merterbak-mistral-ocr.hf.space";
      normalized = "merterbak/Mistral-OCR";
    }
  } else {
    // owner/space format
    const host = hfSpaceId.replace("/", "-").toLowerCase();
    origin = `https://${host}.hf.space`;
    normalized = hfSpaceId;
  }

  return {
    spaceBase: `${origin}`,
    hfSpaceIdNormalized: normalized,
    spaceOrigin: origin,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}