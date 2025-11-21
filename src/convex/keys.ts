import { query } from "./_generated/server";

export const getApiKeys = query({
  args: {},
  handler: async (ctx) => {
    return {
      openRouterApiKey: process.env.OPENROUTER_API_KEY,
      bytezApiKey: process.env.BYTEZ_API_KEY,
      providerApiKey: process.env.PROVIDER_API_KEY, // For closed source models via Bytez
      googleApiKey: process.env.GOOGLE_API_KEY,
    };
  },
});