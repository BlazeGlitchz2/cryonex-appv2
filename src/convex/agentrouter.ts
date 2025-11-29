"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateImage = action({
  args: {
    prompt: v.string(),
    model: v.string(),
    size: v.optional(v.string()),
    n: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.AGENT_ROUTER_API_KEY || process.env.AGENT_ROUTER_TOKEN;
    if (!apiKey) {
      throw new Error("AGENT_ROUTER_API_KEY is not configured. Please add it in the Integrations tab.");
    }

    // Remove prefix if present
    const modelId = args.model.replace("agentrouter/", "");

    const baseUrl = "https://agentrouter.org/v1";
    const url = `${baseUrl}/images/generations`;

    console.log(`Starting AgentRouter image generation with model: ${modelId}`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://cryonex.app",
        "X-Title": "Cryonex Workspace",
      },
      body: JSON.stringify({
        prompt: args.prompt,
        model: modelId,
        size: args.size || "1024x1024",
        n: args.n || 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AgentRouter Image API Error:", errorText);
      throw new Error(`AgentRouter Image API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    // AgentRouter (OpenAI compatible) returns data: [{ url: "..." }]
    if (data.data && data.data.length > 0 && data.data[0].url) {
        return data.data[0].url;
    }
    
    throw new Error("No image URL returned from AgentRouter API");
  },
});
