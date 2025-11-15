"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateImage = action({
  args: {
    model: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!apiToken) {
      throw new Error("REPLICATE_API_TOKEN not configured");
    }

    // Map model IDs to Replicate model owner/name format
    const modelMap: Record<string, string> = {
      "replicate/black-forest-labs/flux-schnell": "black-forest-labs/flux-schnell",
      "replicate/black-forest-labs/flux-dev": "black-forest-labs/flux-dev",
      "replicate/stability-ai/sdxl": "stability-ai/sdxl",
      "replicate/stability-ai/stable-diffusion": "stability-ai/stable-diffusion",
    };

    const modelPath = modelMap[args.model] || "black-forest-labs/flux-schnell";

    // Create prediction using model path (Replicate will use latest version)
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        "Prefer": "wait",
      },
      body: JSON.stringify({
        model: modelPath,
        input: {
          prompt: args.prompt,
        },
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Replicate API error: ${createResponse.statusText}`);
    }

    const prediction = await createResponse.json();
    
    // Poll for completion
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          "Authorization": `Bearer ${apiToken}`,
        },
      });
      
      result = await pollResponse.json();
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Image generation failed");
    }

    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    
    return { imageUrl: imageUrl as string };
  },
});

export const generateVideo = action({
  args: {
    model: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!apiToken) {
      throw new Error("REPLICATE_API_TOKEN not configured");
    }

    // Map model IDs to Replicate model owner/name format
    const modelMap: Record<string, string> = {
      "replicate/minimax/video-01": "minimax/video-01",
      "replicate/genmo/mochi-1-preview": "genmo/mochi-1-preview",
    };

    const modelPath = modelMap[args.model] || "minimax/video-01";

    // Create prediction using model path (Replicate will use latest version)
    const createResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        "Prefer": "wait",
      },
      body: JSON.stringify({
        model: modelPath,
        input: {
          prompt: args.prompt,
        },
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Replicate API error: ${createResponse.statusText}`);
    }

    const prediction = await createResponse.json();
    
    // Poll for completion
    let result = prediction;
    while (result.status !== "succeeded" && result.status !== "failed") {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          "Authorization": `Bearer ${apiToken}`,
        },
      });
      
      result = await pollResponse.json();
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Video generation failed");
    }

    const videoUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    
    return { videoUrl: videoUrl as string };
  },
});
