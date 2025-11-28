"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import OpenAI from "openai";

// Determine which API to use based on model
const getClient = (model: string) => {
  // Bytez Models
  if (model.startsWith("bytez/")) {
    return new OpenAI({
      apiKey: process.env.BYTEZ_API_KEY,
      baseURL: process.env.BYTEZ_API_BASE_URL || "https://api.bytez.com/v1",
    });
  }

  // AgentRouter models
  const agentRouterModels = [
    "gpt-5", "gpt-4-turbo", "gpt-3.5-turbo",
    "deepseek-v3.1", "deepseek-v3.2",
    "glm-4.5", "glm-4.6",
    "claude-3-opus", "claude-3-sonnet", "claude-3-haiku",
    "gemini-pro"
  ];

  // Only match if it DOES NOT contain a slash (to avoid capturing openai/gpt-4-turbo etc)
  // AND if AgentRouter token is configured
  if (
    agentRouterModels.some(m => model.toLowerCase().includes(m.toLowerCase())) && 
    !model.includes("/") && 
    process.env.AGENT_ROUTER_TOKEN
  ) {
    return new OpenAI({
      apiKey: process.env.AGENT_ROUTER_TOKEN,
      baseURL: "https://agentrouter.org/v1",
      defaultHeaders: {
        "Accept": "application/json",
      },
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
    
    // Clean model name for Bytez and AgentRouter
    let modelName = args.model;
    if (args.model.startsWith("bytez/")) {
      modelName = args.model.replace("bytez/", "");
    } else if (!args.model.includes("/")) {
      // Check if we are using AgentRouter (token exists)
      if (process.env.AGENT_ROUTER_TOKEN) {
         modelName = args.model;
      } else {
         // Fallback to OpenRouter mapping
         const fallbackMap: Record<string, string> = {
          "gpt-4-turbo": "openai/gpt-4-turbo",
          "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
          "gpt-5": "openai/gpt-4-turbo",
          "deepseek-v3.1": "deepseek/deepseek-chat",
          "deepseek-v3.2": "deepseek/deepseek-chat",
          "claude-3-opus": "anthropic/claude-3-opus",
          "claude-3-sonnet": "anthropic/claude-3-sonnet",
          "claude-3-haiku": "anthropic/claude-3-haiku",
          "gemini-pro": "google/gemini-pro",
          "glm-4.5": "zhipu/glm-4",
          "glm-4.6": "zhipu/glm-4",
        };
        if (fallbackMap[args.model]) {
          modelName = fallbackMap[args.model];
        }
      }
    }

    const response = await client.chat.completions.create({
      model: modelName,
      messages: args.messages,
      max_tokens: 4096,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  },
});