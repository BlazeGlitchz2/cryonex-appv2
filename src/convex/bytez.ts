"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

// Determine which API to use based on model
const getClient = (model: string) => {
  // AgentRouter models
  const agentRouterModels = [
    "gpt-5", "gpt-4-turbo", "gpt-3.5-turbo",
    "deepseek-v3.1", "deepseek-v3.2",
    "glm-4.5", "glm-4.6",
    "claude-3-opus", "claude-3-sonnet", "claude-3-haiku",
    "gemini-pro"
  ];

  if (agentRouterModels.some(m => model.includes(m))) {
    return new OpenAI({
      apiKey: process.env.AGENT_ROUTER_TOKEN,
      baseURL: "https://agentrouter.org/v1",
    });
  }

  // Default to OpenRouter
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    defaultHeaders: {
      "HTTP-Referer": "https://cryonex.app",
      "X-Title": "Cryonex Workspace",
    },
  });
};

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
    const client = getClient(args.model);

    const response = await client.chat.completions.create({
      model: args.model,
      messages: args.messages,
      max_tokens: 4096,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  },
});