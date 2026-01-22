"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { generateEmbedding } from "./embeddings";



export const chatWithPDF = action({
  args: {
    docId: v.string(),
    userMessage: v.string(),
    chatHistory: v.optional(v.array(v.object({
      role: v.string(),
      content: v.string(),
    }))),
    mode: v.optional(v.union(v.literal("standard"), v.literal("socratic"), v.literal("feynman"))),
  },
  handler: async (ctx, args): Promise<{
    response: string;
    confidence: string;
    sources: Array<{ page: number; text: string; score: number }>;
    pdfUrl: string | null;
  }> => {
    // Get document from database
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

    const socraticPrompt = `You are a Socratic Tutor. NEVER give direct answers.
Instead:
1. Ask clarifying questions to help the student find the answer.
2. Point to relevant sections: "What do you notice on page X?"
3. Guide discovery: "Based on the diagram, what might happen if...?"
4. Encourage reasoning: "Why do you think that is?"
5. Be encouraging but firm about not giving the answer away.
6. Use the provided context to form your guiding questions.`;

    const standardPrompt = `You are Cryonex, a helpful AI study assistant created by Cryonex. Your creator is Hamza Ahmad and no one else. Answer questions based on the provided PDF context with citations. When referencing information, cite the source number (e.g., "According to Source 1..."). If the answer is not in the context, say "I can't find that in this PDF." Be concise and accurate. Do NOT hallucinate.

**FORMATTING**: Use **Bold** for key terms, **Headers** for sections, and **Lists** for clarity. Use LaTeX for math ($E=mc^2$).`;

    // Build chat messages
    const feynmanPrompt = `You are a curious, slightly confused student. The user is your teacher.
    Your goal is to test the user's understanding by asking "Why?" and "How?" questions.
    1. Pretend you don't fully understand the concept.
    2. Ask them to explain it simply, "like I'm 5".
    3. If they use jargon, ask what it means.
    4. If their explanation is good, say "Oh, I get it now!" and ask a follow-up.
    5. If vague, ask for clarification.
    6. Use the context to know what the correct answer IS, so you can ask the right questions to expose gaps.`;

    const messages: Array<{ role: string; content: string }> = [
      {
        role: "system",
        content: args.mode === "socratic" ? socraticPrompt : args.mode === "feynman" ? feynmanPrompt : standardPrompt,
      },
      ...(args.chatHistory || []),
      {
        role: "user",
        content: `Context from PDF:\n${contextWithCitations}\n\nQuestion: ${args.userMessage}`,
      },
    ];

    // Try multiple providers in order of preference (free tiers first)
    const providers = [
      { name: "Cerebras", url: "https://api.cerebras.ai/v1/chat/completions", key: process.env.CEREBRAS_API_KEY, model: "llama-3.3-70b" },
      { name: "SambaNova", url: "https://api.sambanova.ai/v1/chat/completions", key: process.env.SAMBANOVA_API_KEY, model: "Meta-Llama-3.1-70B-Instruct" },
      { name: "Groq", url: "https://api.groq.com/openai/v1/chat/completions", key: process.env.GROQ_API_KEY, model: "llama-3.3-70b-versatile" },
      { name: "OpenRouter", url: "https://openrouter.ai/api/v1/chat/completions", key: process.env.OPENROUTER_API_KEY, model: "meta-llama/llama-3.3-70b-instruct" },
    ];

    let answer = "";
    let providerUsed = "";

    for (const provider of providers) {
      if (!provider.key) continue;

      try {
        const response: Response = await fetch(provider.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${provider.key}`,
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
          console.warn(`[pdfChat] ${provider.name} failed: ${response.status} ${response.statusText}`);
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