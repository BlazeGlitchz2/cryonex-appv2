"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateEmbedding } from "./embeddings";

export const chatWithPDF = action({
  args: {
    docId: v.string(),
    userMessage: v.string(),
    image: v.optional(v.string()), // New: Base64 or URL
    chatHistory: v.optional(
      v.array(
        v.object({
          role: v.string(),
          content: v.string(),
        }),
      ),
    ),
    mode: v.optional(
      v.union(
        v.literal("standard"),
        v.literal("socratic"),
        v.literal("feynman"),
      ),
    ),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    response: string;
    confidence: string;
    sources: Array<{ page: number; text: string; score: number }>;
    pdfUrl: string | null;
  }> => {
    // ... (existing document fetch & validation) ...
    const document: any = (await ctx.runQuery(
      internal.studyQuery.getDocumentInternal as any,
      { docId: args.docId },
    )) as any;
    if (!document) {
      throw new Error("Document not found");
    }

    const providerKeys = {
      openRouter: process.env.OPENROUTER_API_KEY,
      cerebras: process.env.CEREBRAS_API_KEY,
      groq: process.env.GROQ_API_KEY,
    };

    if (!providerKeys.openRouter && !providerKeys.cerebras && !providerKeys.groq) {
      throw new Error(
        "Grounded PDF chat is not configured. Add OPENROUTER_API_KEY, CEREBRAS_API_KEY, or GROQ_API_KEY.",
      );
    }

    // Generate embedding for user question (skip if only image, but usually text accompanies image)
    const questionEmbedding = await generateEmbedding(args.userMessage);

    // ... (existing vector search & context building) ...
    const vectorResults = await ctx.vectorSearch(
      "studyChunks",
      "by_embedding",
      {
        vector: questionEmbedding,
        limit: 20,
        filter: (q) => q.eq("docId", args.docId),
      },
    );

    const chunkIds = vectorResults.map((result) => result._id);
    const relevantChunks = await ctx.runQuery(
      internal.studyQuery.fetchChunksByIds,
      {
        ids: chunkIds.slice(0, 5),
      },
    );

    const chunksWithScores = relevantChunks.map((chunk) => {
      const vectorResult = vectorResults.find((r) => r._id === chunk._id);
      return {
        ...chunk,
        _score: vectorResult?._score || 0,
      };
    });

    // Build context
    const contextWithCitations = chunksWithScores
      .map((chunk: any, idx: number) => {
        const page = chunk.metadata?.page || "unknown";
        return `[Source ${idx + 1}, Page ${page}]:\n${chunk.text}`;
      })
      .join("\n\n");

    // Phase 6: Strict PDF Ingestion
    // We force the AI to cite the specific page/paragraph to empower the React Regex builder.
    const strictCitationRules = `
CRITICAL INSTRUCTION: You MUST ground every claim you make using the provided PDF context. 
If you find the answer, you MUST append a citation in the exact format: [Page X, Paragraph Y]. 
For example: "The patient showed signs of tachycardia [Page 4, Paragraph 2]."
If the context does not contain the answer, you must say "I can't find that in this PDF." Do NOT use outside knowledge.`;

    // Prompts
    const socraticPrompt = `You are a Socratic Tutor. Never give the answer directly. Ask guiding questions based strictly on the provided context.\n${strictCitationRules}`;
    const standardPrompt = `You are Cryonex, an elite AI study assistant. Answer questions clearly and concisely based ONLY on the provided context.\n${strictCitationRules}`;
    const feynmanPrompt = `You are a curious student. Act confused and ask the user to explain the concepts to you simply. Use the provided context to fact-check their explanations.\n${strictCitationRules}`;

    // Construct System Prompt
    const systemContent =
      args.mode === "socratic"
        ? socraticPrompt
        : args.mode === "feynman"
          ? feynmanPrompt
          : standardPrompt;

    // Construct Messages
    const messages: any[] = [
      { role: "system", content: systemContent },
      ...(args.chatHistory || []),
    ];

    // Handle User Message (Text + Optional Image)
    if (args.image) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `Context from PDF:\n${contextWithCitations}\n\nQuestion: ${args.userMessage}`,
          },
          { type: "image_url", image_url: { url: args.image } },
        ],
      });
    } else {
      messages.push({
        role: "user",
        content: `Context from PDF:\n${contextWithCitations}\n\nQuestion: ${args.userMessage}`,
      });
    }

    // Providers configuration
    const providers = [
      // Vision capable models first if image is present
      ...(args.image
        ? [
          {
            name: "OpenRouter Vision",
            url: "https://openrouter.ai/api/v1/chat/completions",
            key: process.env.OPENROUTER_API_KEY,
            model: "google/gemini-2.0-flash-exp:free",
          },
        ]
        : []),
      {
        name: "Cerebras",
        url: "https://api.cerebras.ai/v1/chat/completions",
        key: process.env.CEREBRAS_API_KEY,
        model: "llama-3.3-70b",
      },
      {
        name: "Groq",
        url: "https://api.groq.com/openai/v1/chat/completions",
        key: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
      },
      {
        name: "OpenRouter",
        url: "https://openrouter.ai/api/v1/chat/completions",
        key: process.env.OPENROUTER_API_KEY,
        model: "meta-llama/llama-3.3-70b-instruct",
      },
    ];

    let answer = "";
    // ... (rest of loop) ...

    answer = ""; // Reset answer if needed or just assign, do not re-declare
    let providerUsed = "";

    for (const provider of providers) {
      if (!provider.key) continue;

      try {
        const response: Response = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${provider.key}`,
          },
          body: JSON.stringify({
            model: provider.model,
            messages,
            temperature: 0.3,
            max_tokens: 600,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          answer = data.choices?.[0]?.message?.content || "";
          if (answer) {
            providerUsed = provider.name;
            console.log(`[pdfChat] Using ${provider.name} for response`);
            break;
          }
        } else {
          console.warn(
            `[pdfChat] ${provider.name} failed: ${response.status} ${response.statusText}`,
          );
        }
      } catch (e) {
        console.warn(`[pdfChat] ${provider.name} error:`, e);
      }
    }

    if (!answer) {
      throw new Error("All AI providers failed. Please check your API keys.");
    }

    // Check if AI couldn't find answer
    const lowConfidenceIndicators = [
      "can't find",
      "not mentioned",
      "doesn't say",
      "not in the",
      "no information",
    ];

    const isLowConfidence = lowConfidenceIndicators.some((indicator) =>
      answer.toLowerCase().includes(indicator),
    );

    // Calculate average similarity score
    const avgScore =
      chunksWithScores.reduce(
        (sum: number, c: any) => sum + (c._score || 0),
        0,
      ) / chunksWithScores.length;

    return {
      response: answer,
      confidence: isLowConfidence ? "low" : avgScore > 0.7 ? "high" : "medium",
      sources: chunksWithScores.map((chunk: any) => ({
        page: chunk.metadata?.page || 0,
        text: chunk.text.substring(0, 150) + "...",
        score: chunk._score || 0,
      })),
      pdfUrl: document.storageId
        ? await ctx.storage.getUrl(document.storageId)
        : null,
    };
  },
});
