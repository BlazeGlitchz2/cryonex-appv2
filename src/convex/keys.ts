import { query } from "./_generated/server";

export const getApiKeys = query({
  args: {},
  handler: async (ctx) => {
    return {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    };
  },
});
