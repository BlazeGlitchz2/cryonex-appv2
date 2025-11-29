"use node";
import { action } from "./_generated/server";

export const listGroqModels = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return "No GROQ_API_KEY";
    try {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      const data = await response.json();
      return data;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }
});

export const listSambaNovaModels = action({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.SAMBANOVA_API_KEY;
    if (!apiKey) return "No SAMBANOVA_API_KEY";
    try {
      const response = await fetch("https://api.sambanova.ai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      const data = await response.json();
      return data;
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }
});
