"use node";
import { action } from "./_generated/server";
import OpenAI from "openai";

export const listModels = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.BYTEZ_API_KEY;
    if (!apiKey) {
      console.log("BYTEZ_API_KEY not found");
      return;
    }

    const client = new OpenAI({
      apiKey,
      baseURL: process.env.BYTEZ_API_BASE_URL || "https://api.bytez.com/v1",
    });

    try {
      const models = await client.models.list();
      console.log("Bytez Models:", JSON.stringify(models.data, null, 2));
      return models.data;
    } catch (error) {
      console.error("Error fetching models:", error);
      throw error;
    }
  },
});
