"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Generate embedding using Hugging Face
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error("Hugging Face API key not configured");
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text }),
    }
  );

  if (!response.ok) {
    throw new Error(`Embedding generation failed: ${response.statusText}`);
  }

  const embedding = await response.json();
  return embedding;
}

export const chatWithPDF = action({
  args: {
    docId: v.string(),
    userMessage: v.string(),
    chatHistory: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string(),
    }))),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    confidence: string;
    sources: Array<{ page: number; text: string; score: number }>;
    pdfUrl: string | null;
  }> => {
    // Get document from database
    // @ts-expect-error - Convex 1.29.0 type instantiation depth issue
    const document: any = await ctx.runQuery(internal.studyQuery.getDocumentInternal as any, { docId: args.docId }) as any;
    if (!document) {
      throw new Error("Document not found");
    }
    
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured");
    }

    // Generate embedding for user question
    const questionEmbedding = await generateEmbedding(args.userMessage);

    // Use vector search to find relevant chunks (vector search only works in actions)
    const vectorResults = await ctx.vectorSearch("studyChunks", "by_embedding", {
      vector: questionEmbedding,
      limit: 20, // Get more results to filter by docId
      filter: (q) => q.eq("docId", args.docId),
    });

    // Fetch the actual chunk documents
    const chunkIds = vectorResults.map((result) => result._id);
    const relevantChunks = await ctx.runQuery(internal.studyQuery.fetchChunksByIds, {
      ids: chunkIds.slice(0, 5), // Take top 5
    });

    // Add scores from vector search to chunks
    const chunksWithScores = relevantChunks.map((chunk) => {
      const vectorResult = vectorResults.find((r) => r._id === chunk._id);
      return {
        ...chunk,
        _score: vectorResult?._score || 0,
      };
    });

    // If no relevant chunks found, return low confidence message
    if (relevantChunks.length === 0) {
      return {
        response: "I can't find that information in this PDF. Could you rephrase your question or ask about something else from the document?",
        confidence: "low",
        sources: [],
        pdfUrl: document.storageId ? await ctx.storage.getUrl(document.storageId) : null,
      };
    }

    // Build context with citations
    const contextWithCitations = chunksWithScores
      .map((chunk: any, idx: number) => {
        const page = chunk.metadata?.page || "unknown";
        return `[Source ${idx + 1}, Page ${page}]:\n${chunk.text}`;
      })
      .join("\n\n");

    // Build chat messages
    const messages: Array<{ role: string; content: string }> = [
      {
        role: "system",
        content: `You are Cryonex, a helpful AI study assistant. Answer questions based on the provided PDF context with citations. When referencing information, cite the source number (e.g., "According to Source 1..."). If the answer is not in the context, say "I can't find that in this PDF." Be concise and accurate.`,
      },
      ...(args.chatHistory || []),
      {
        role: "user",
        content: `Context from PDF:\n${contextWithCitations}\n\nQuestion: ${args.userMessage}`,
      },
    ];

    const response: Response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4-turbo",
        messages,
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get AI response: ${response.statusText}`);
    }

    const data: any = await response.json();
    const answer: string = data.choices[0].message.content;

    // Check if AI couldn't find answer
    const lowConfidenceIndicators = [
      "can't find",
      "not mentioned",
      "doesn't say",
      "not in the",
      "no information",
    ];
    
    const isLowConfidence = lowConfidenceIndicators.some(indicator => 
      answer.toLowerCase().includes(indicator)
    );

    // Calculate average similarity score
    const avgScore = chunksWithScores.reduce((sum: number, c: any) => sum + (c._score || 0), 0) / chunksWithScores.length;

    return {
      response: answer,
      confidence: isLowConfidence ? "low" : (avgScore > 0.7 ? "high" : "medium"),
      sources: chunksWithScores.map((chunk: any) => ({
        page: chunk.metadata?.page || 0,
        text: chunk.text.substring(0, 150) + "...",
        score: chunk._score || 0,
      })),
      pdfUrl: document.storageId ? await ctx.storage.getUrl(document.storageId) : null,
    };
  },
});