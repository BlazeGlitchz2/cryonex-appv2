import { query } from "./_generated/server";

export const getApiKeys = query({
  args: {},
  handler: async (ctx) => {
    return {
      BYTEZ_API_KEY: process.env.BYTEZ_API_KEY,
      PROVIDER_API_KEY: process.env.PROVIDER_API_KEY,
    };
  },
});