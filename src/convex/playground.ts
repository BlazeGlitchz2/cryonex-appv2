"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

export const chat = action({
  args: {
    model: v.string(),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      }),
    ),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not configured on server");
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://cryonex.app",
          "X-Title": "Cryonex Playground",
        },
        body: JSON.stringify({
          model: args.model,
          messages: args.messages,
          temperature: args.temperature ?? 0.7,
          max_tokens: args.maxTokens ?? 2000,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API Error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  },
});
