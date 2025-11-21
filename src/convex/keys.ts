import { query } from "./_generated/server";

export const getApiKeys = query({
  args: {},
  handler: async (ctx) => {
    return {
      openRouter: process.env.OPENROUTER_API_KEY,
      bytez: process.env.BYTEZ_API_KEY,
      google: process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY,
      groq: process.env.GROQ_API_KEY,
      agentRouter: process.env.AGENTROUTER_API_KEY,
      zai: process.env.ZAI_API_KEY,
    };
  },
});
