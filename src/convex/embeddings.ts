"use node";

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

function requireEmbeddingModel() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Embeddings are not configured. Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.",
    );
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "text-embedding-004" });
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = requireEmbeddingModel();

  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("Failed to generate embedding with Gemini:", error);
    throw new Error(
      "Embeddings failed while preparing grounded study context. Please try again.",
    );
  }
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const model = requireEmbeddingModel();

  try {
    return await Promise.all(
      texts.map(async (text) => {
        const result = await model.embedContent(text);
        return result.embedding.values;
      }),
    );
  } catch (error) {
    console.error("Batch embedding failed:", error);
    throw new Error(
      "Embeddings failed while indexing this material. Please try again after fixing the embedding provider.",
    );
  }
}
