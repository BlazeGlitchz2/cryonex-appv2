"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const chat = action({
  args: {
    model: v.string(),
    messages: v.array(v.object({
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
    })),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    stream: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.BYTEZ_API_KEY;
    if (!apiKey) {
      throw new Error("BYTEZ_API_KEY is not configured. Please add it in the Integrations tab.");
    }

    const response = await fetch("https://api.bytez.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: args.model,
        messages: args.messages,
        temperature: args.temperature ?? 0.7,
        max_tokens: args.maxTokens ?? 2000,
        stream: args.stream ?? false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("Bytez rate limit exceeded. Please try again later.");
      } else if (response.status === 401) {
        throw new Error("Invalid Bytez API key. Please check your configuration.");
      } else if (response.status === 400) {
        throw new Error(errorData.error?.message || "Bad request to Bytez API.");
      } else {
        throw new Error(`Bytez API Error: ${errorData.error?.message || response.statusText}`);
      }
    }

    return await response.json();
  },
});
