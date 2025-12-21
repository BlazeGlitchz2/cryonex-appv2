"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
// Add official Gradio client per HF docs
import { Client } from "@gradio/client";
import { embedBatch } from "./embeddings";

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
      throw new Error("Failed to create or find user record. Please try signing out and signing in again.");
    }
    const userId = user._id;

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

    // User already authenticated at start

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

  // Build provider chain: Cerebras → SambaNova → Gemini → Groq → HuggingFace → OpenRouter → Bytez → Puter → local fallback
  const cerebrasKey = process.env.CEREBRAS_API_KEY || "";
  const sambanovaKey = process.env.SAMBANOVA_API_KEY || "";
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
  const groqKey = process.env.GROQ_API_KEY || "";
  const hfKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || "";
  const openrouterKey =
    process.env.OPENROUTER_API_KEY ||
    process.env.VLY_OPENROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY ||
    "";
  const bytezKey = process.env.BYTEZ_API_KEY || process.env.VITE_BYTEZ_API_KEY || "";

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
      model: "llama-3.3-70b",
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
      model: "Meta-Llama-3.1-70B-Instruct",
      useJson: false,
      isGemini: false,
      isHuggingFace: false,
      isSambaNova: true,
    });
  }

  // Secondary: Gemini
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

  // Tertiary: Groq (fast, free tier)
  if (groqKey) {
    providers.push({
      name: "Groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: groqKey,
      model: "llama-3.3-70b-versatile",
      useJson: false,
      isGemini: false,
      isHuggingFace: false,
      isGroq: true,
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
      model: "meta-llama/llama-3.3-70b-instruct",
      useJson: false,
      isGemini: false,
      isHuggingFace: false,
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
          console.log("[studyExtractor] Gemini response length:", content.length);

          // Try to parse with labels first
          let short = "";
          let detailed = "";

          if (content.includes("DETAILED:")) {
            short = (content.split("DETAILED:")[0] || "").replace(/^SHORT:\s*/i, "").replace(/---\s*$/m, "").trim();
            detailed = (content.split("DETAILED:")[1] || "").trim();
          } else if (content.includes("##") || content.includes("###")) {
            // If AI returned markdown without labels, use the first paragraph as short
            // and the full content as detailed
            const lines = content.split("\n").filter((l: string) => l.trim());
            short = lines.slice(0, 3).join(" ").replace(/^#+\s*/, "").trim();
            detailed = content;
          } else {
            // Just split the content - first 200 chars as short, rest as detailed
            short = content.slice(0, 200).trim() + (content.length > 200 ? "..." : "");
            detailed = content;
          }

          if (detailed) {
            console.log("[studyExtractor] Gemini summary parsed successfully");
            return { short: short || "Document summary generated.", detailed };
          }
        } else {
          console.warn("[studyExtractor] Gemini request failed:", r.status, r.statusText);
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
          console.log("[studyExtractor] HuggingFace response length:", content.length);

          let short = "";
          let detailed = "";

          if (content.includes("DETAILED:")) {
            short = (content.split("DETAILED:")[0] || "").replace(/^SHORT:\s*/i, "").replace(/---\s*$/m, "").trim();
            detailed = (content.split("DETAILED:")[1] || "").trim();
          } else if (content.length > 100) {
            short = content.slice(0, 200).trim() + "...";
            detailed = content;
          }

          if (detailed) {
            console.log("[studyExtractor] HuggingFace summary parsed successfully");
            return { short: short || "Document summary generated.", detailed };
          }
        } else {
          console.warn("[studyExtractor] HuggingFace request failed:", r.status);
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
          console.log(`[studyExtractor] ${provider.name} response length:`, content.length);

          if (provider.useJson) {
            try {
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed?.short && parsed?.detailed) {
                  console.log(`[studyExtractor] ${provider.name} JSON parsed successfully`);
                  return { short: String(parsed.short), detailed: String(parsed.detailed) };
                }
              }
            } catch (e) {
              console.warn(`[studyExtractor] ${provider.name} JSON parse failed, using text fallback`);
            }
          }

          // Try text parsing (works for JSON failures too)
          let short = "";
          let detailed = "";

          if (content.includes("DETAILED:")) {
            short = (content.split("DETAILED:")[0] || "").replace(/^SHORT:\s*/i, "").replace(/---\s*$/m, "").trim();
            detailed = (content.split("DETAILED:")[1] || "").trim();
          } else if (content.length > 100) {
            short = content.slice(0, 200).trim() + "...";
            detailed = content;
          }

          if (detailed) {
            console.log(`[studyExtractor] ${provider.name} summary parsed successfully`);
            return { short: short || "Document summary generated.", detailed };
          }
        } else {
          console.warn(`[studyExtractor] ${provider.name} request failed:`, r.status);
        }
      }

      console.warn(`${provider.name} summarization failed, trying next provider...`);
    } catch (e) {
      console.error(`${provider.name} summary error:`, e);
    }
  }

  // Final local fallback - create a structured summary from the text
  const sentences = trimmed.split(/[.!?]+\s+/).filter(s => s.trim().length > 20);
  const shortSummary = sentences.slice(0, 3).join(". ").trim() + (sentences.length > 3 ? "..." : ".");

  // Create a basic markdown summary with key points
  const keyPoints = sentences.slice(0, 10).map(s => `- ${s.trim()}`).join("\n");
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
  return embedBatch(chunks);
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