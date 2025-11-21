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
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://cryonex.app", // Optional: for rankings
        "X-Title": "Cryonex Workspace", // Optional: for rankings
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