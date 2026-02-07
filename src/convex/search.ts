"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

export const deepSearch = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      throw new Error("SERPAPI_API_KEY is not configured");
    }

    try {
      const { getJson } = await import("serpapi");

      const response = await getJson({
        engine: "google",
        q: args.query,
        api_key: apiKey,
        num: 5,
      });

      const organicResults = response.organic_results || [];

      // Include optional imageUrl and make domain extraction safe
      return organicResults.slice(0, 5).map((result: any) => {
        let domain = "";
        try {
          domain =
            result.displayed_link ||
            (result.link ? new URL(result.link).hostname : "");
        } catch {
          domain = result.displayed_link || "";
        }

        const imageUrl =
          result.thumbnail ||
          result.thumbnail_url ||
          (result.inline_images && result.inline_images[0]?.thumbnail) ||
          undefined;

        return {
          title: result.title || "",
          url: result.link || "",
          domain,
          snippet: result.snippet || "",
          imageUrl, // new optional field
        };
      });
    } catch (error: any) {
      console.error("SerpAPI error:", error);
      throw new Error(`Search failed: ${error.message}`);
    }
  },
});
