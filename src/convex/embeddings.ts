"use node";

import { GoogleGenerativeAI, TaskType } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const GEMINI_EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const GEMINI_BATCH_SIZE = 24;
const GEMINI_MAX_RETRIES = 2;

export type EmbeddingProvider = "gemini" | "local-hash";

type QueryEmbeddingOptions = {
  provider?: EmbeddingProvider;
  allowLocalFallback?: boolean;
};

type BatchEmbeddingResult = {
  embeddings: number[][];
  provider: EmbeddingProvider;
  degraded: boolean;
};

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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getErrorStatus(error: any) {
  return Number(
    error?.status ?? error?.statusCode ?? error?.response?.status ?? 0,
  );
}

function isRetryableGeminiError(error: any) {
  const status = getErrorStatus(error);
  if ([408, 409, 429, 500, 502, 503, 504].includes(status)) {
    return true;
  }

  const message = String(error?.message || "").toLowerCase();
  return /quota|rate limit|too many requests|timed out|temporar|socket|network/.test(
    message,
  );
}

async function withGeminiRetries<T>(
  label: string,
  operation: () => Promise<T>,
): Promise<T> {
  let lastError: any = null;

  for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt >= GEMINI_MAX_RETRIES || !isRetryableGeminiError(error)) {
        break;
      }

      const waitMs =
        400 * 2 ** attempt + Math.floor(Math.random() * 200) + attempt * 100;
      console.warn(
        `[embeddings] ${label} attempt ${attempt + 1} failed, retrying in ${waitMs}ms`,
        error,
      );
      await sleep(waitMs);
    }
  }

  throw lastError;
}

function hashString(value: string, seed: number) {
  let hash = 2166136261 ^ seed;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalizeVector(values: number[]) {
  const magnitude = Math.sqrt(
    values.reduce((sum, value) => sum + value * value, 0),
  );
  if (!Number.isFinite(magnitude) || magnitude === 0) {
    values[0] = 1;
    return values;
  }

  return values.map((value) => value / magnitude);
}

function buildLocalHashEmbedding(text: string) {
  const values = new Array<number>(EMBEDDING_DIMENSIONS).fill(0);
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  const wordTokens = normalized.match(/[a-z0-9]{2,}/g) ?? [];

  for (const token of wordTokens) {
    const index = hashString(token, 0) % EMBEDDING_DIMENSIONS;
    const sign = hashString(token, 1) % 2 === 0 ? 1 : -1;
    values[index] += sign * (1 + Math.min(token.length, 12) / 12);
  }

  const compact = normalized.replace(/\s+/g, "");
  for (let i = 0; i <= compact.length - 3; i++) {
    const trigram = compact.slice(i, i + 3);
    const index = hashString(trigram, 2) % EMBEDDING_DIMENSIONS;
    const sign = hashString(trigram, 3) % 2 === 0 ? 1 : -1;
    values[index] += sign * 0.35;
  }

  return assertEmbeddingDimensions(normalizeVector(values), "local-hash");
}

export async function generateEmbedding(
  text: string,
  options: QueryEmbeddingOptions = {},
): Promise<number[]> {
  const provider = options.provider ?? "gemini";
  const allowLocalFallback = options.allowLocalFallback ?? true;

  if (provider === "local-hash") {
    return buildLocalHashEmbedding(text);
  }

  try {
    const model = requireEmbeddingModel();
    const result = await withGeminiRetries("query embedding", () =>
      model.embedContent(buildEmbeddingRequest(text, TaskType.RETRIEVAL_QUERY)),
    );
    return assertEmbeddingDimensions(result.embedding.values, "query");
  } catch (error) {
    console.error("Failed to generate embedding with Gemini:", error);
    if (allowLocalFallback) {
      console.warn(
        "[embeddings] Falling back to local hash embedding for query generation",
      );
      return buildLocalHashEmbedding(text);
    }

    throw new Error(
      `Embeddings are temporarily unavailable with ${GEMINI_EMBEDDING_MODEL}. Please try again shortly.`,
    );
  }
}

function buildLocalBatch(texts: string[]): BatchEmbeddingResult {
  return {
    embeddings: texts.map((text) => buildLocalHashEmbedding(text)),
    provider: "local-hash",
    degraded: true,
  };
}

export async function embedBatch(
  texts: string[],
): Promise<BatchEmbeddingResult> {
  if (texts.length === 0) {
    return { embeddings: [], provider: "local-hash", degraded: false };
  }

  if (!GEMINI_API_KEY) {
    console.warn(
      "[embeddings] Gemini embedding key missing, using local hash embeddings",
    );
    return buildLocalBatch(texts);
  }

  const model = requireEmbeddingModel();

  try {
    const embeddings: number[][] = [];

    for (let start = 0; start < texts.length; start += GEMINI_BATCH_SIZE) {
      const batch = texts.slice(start, start + GEMINI_BATCH_SIZE);
      const result = await withGeminiRetries(
        `document embedding batch ${start / GEMINI_BATCH_SIZE + 1}`,
        () =>
          model.batchEmbedContents({
            requests: batch.map((text) =>
              buildEmbeddingRequest(text, TaskType.RETRIEVAL_DOCUMENT),
            ),
          }),
      );

      if (result.embeddings.length !== batch.length) {
        throw new Error(
          `Expected ${batch.length} embeddings, received ${result.embeddings.length}.`,
        );
      }

      embeddings.push(
        ...result.embeddings.map((embedding, index) =>
          assertEmbeddingDimensions(
            embedding.values,
            `document chunk ${start + index + 1}`,
          ),
        ),
      );
    }

    return {
      embeddings,
      provider: "gemini",
      degraded: false,
    };
  } catch (error) {
    console.error("Batch embedding failed:", error);
    console.warn(
      `[embeddings] Falling back to local hash embeddings after ${GEMINI_EMBEDDING_MODEL} failure`,
    );
    return buildLocalBatch(texts);
  }
}
