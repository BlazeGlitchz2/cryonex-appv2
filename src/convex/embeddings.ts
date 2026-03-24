"use node";

import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const GEMINI_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;

function requireEmbeddingModel() {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Embeddings are not configured. Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.",
    );
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
}

function buildEmbeddingRequest(text: string, taskType: TaskType) {
  return {
    content: {
      role: "user",
      parts: [{ text }],
    },
    taskType,
    outputDimensionality: EMBEDDING_DIMENSIONS,
  } as any;
}

function assertEmbeddingDimensions(values: number[], context: string) {
  if (values.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected ${EMBEDDING_DIMENSIONS}-dimensional embedding for ${context}, received ${values.length}.`,
    );
  }

  return values;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = requireEmbeddingModel();

  try {
    const result = await model.embedContent(
      buildEmbeddingRequest(text, TaskType.RETRIEVAL_QUERY),
    );
    return assertEmbeddingDimensions(result.embedding.values, "query");
  } catch (error) {
    console.error("Failed to generate embedding with Gemini:", error);
    throw new Error(
      `Embeddings failed while preparing grounded study context with ${GEMINI_EMBEDDING_MODEL}. Please try again.`,
    );
  }
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const model = requireEmbeddingModel();

  try {
    const result = await model.batchEmbedContents({
      requests: texts.map((text) =>
        buildEmbeddingRequest(text, TaskType.RETRIEVAL_DOCUMENT),
      ),
    });

    if (result.embeddings.length !== texts.length) {
      throw new Error(
        `Expected ${texts.length} embeddings, received ${result.embeddings.length}.`,
      );
    }

    return result.embeddings.map((embedding, index) =>
      assertEmbeddingDimensions(
        embedding.values,
        `document chunk ${index + 1}`,
      ),
    );
  } catch (error) {
    console.error("Batch embedding failed:", error);
    throw new Error(
      `Embeddings failed while indexing this material with ${GEMINI_EMBEDDING_MODEL}. Please try again after fixing the embedding provider.`,
    );
  }
}
