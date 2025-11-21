"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

export const chat = action({
  args: {
    messages: v.array(
      v.object({
        role: v.union(v.literal("system"), v.literal("user"), v.literal("assistant")),
        content: v.string(),
      })
    ),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const client = new OpenAI({
      apiKey: process.env.BYTEZ_API_KEY,
      baseURL: process.env.BYTEZ_API_BASE_URL || "https://api.bytez.com/models/v2/openai/v1",
      defaultHeaders: {
        Authorization: process.env.BYTEZ_API_KEY || "",
        "provider-key": process.env.PROVIDER_API_KEY || "",
      },
    });

    const response = await client.chat.completions.create({
      model: args.model,
      messages: args.messages,
      max_tokens: 4096,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  },
});
