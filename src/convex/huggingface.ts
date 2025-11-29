"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generate = action({
  args: {
    model: v.string(),
    prompt: v.string(),
    negative_prompt: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const token = process.env.HF_TOKEN;
    if (!token) {
      throw new Error("HF_TOKEN is not configured. Please add it in the Integrations tab.");
    }

    // Remove 'huggingface/' prefix if present
    const modelId = args.model.replace("huggingface/", "");
    const apiUrl = `https://api-inference.huggingface.co/models/${modelId}`;

    console.log(`Starting Hugging Face generation for model: ${modelId}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-use-cache": "false"
      },
      body: JSON.stringify({
        inputs: args.prompt,
        parameters: {
          negative_prompt: args.negative_prompt,
          width: args.width,
          height: args.height,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API Error:", errorText);
      throw new Error(`Hugging Face generation failed (${response.status}): ${errorText}`);
    }

    const blob = await response.blob();
    
    // Store the generated image in Convex Storage
    const storageId = await ctx.storage.store(blob);
    const url = await ctx.storage.getUrl(storageId);
    
    if (!url) {
        throw new Error("Failed to generate storage URL for the generated image");
    }

    return url;
  },
});