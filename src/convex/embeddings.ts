"use node";

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function generateEmbedding(text: string): Promise<number[]> {
    if (!GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY not found, returning zero vector for embedding");
        return new Array(768).fill(0);
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;
        return embedding;
    } catch (error) {
        console.error("Failed to generate embedding with Gemini:", error);
        return new Array(768).fill(0);
    }
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
    if (!GEMINI_API_KEY) {
        return texts.map(() => new Array(768).fill(0));
    }

    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

        // Process in parallel with a limit if needed, but for now Promise.all is fine for small batches
        const embeddings = await Promise.all(texts.map(async (text) => {
            try {
                const result = await model.embedContent(text);
                return result.embedding.values;
            } catch (e) {
                console.error("Single embedding failed in batch:", e);
                return new Array(768).fill(0);
            }
        }));

        return embeddings;
    } catch (error) {
        console.error("Batch embedding failed:", error);
        return texts.map(() => new Array(768).fill(0));
    }
}
