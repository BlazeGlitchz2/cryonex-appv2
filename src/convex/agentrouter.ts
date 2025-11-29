"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateImage = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    size: v.optional(v.string()),
    n: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.AGENT_ROUTER_API_KEY || process.env.AGENT_ROUTER_TOKEN;
    if (!apiKey) {
      throw new Error("AGENT_ROUTER_API_KEY is not configured. Please add it in the Integrations tab.");
    }

    const baseUrl = "https://agentrouter.org/v1";
    // Using the standard OpenAI-compatible image generation endpoint
    const url = `${baseUrl}/images/generations`;

    console.log(`Starting AgentRouter image generation with model: ${args.model || "default"}`);

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
        model: args.model || "stabilityai/stable-diffusion-xl-base-1.0",
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
    
    // Return the array of image objects (usually containing 'url')
    return data.data;
  },
});
