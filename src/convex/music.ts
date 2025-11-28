"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateMusic = action({
  args: {
    prompt: v.string(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.MUSIC_API_KEY;
    if (!apiKey) {
      throw new Error("MUSIC_API_KEY is not configured. Please add it in the Integrations tab.");
    }

    const response = await fetch("https://api.musicapi.ai/v1/music/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: args.prompt,
        duration: args.duration || 30,
        model: "suno",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MusicAPI error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    return result;
  },
});

export const getMusicTaskResult = action({
  args: {
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.MUSIC_API_KEY;
    if (!apiKey) {
      throw new Error("MUSIC_API_KEY is not configured.");
    }

    const response = await fetch(`https://api.musicapi.ai/v1/music/task/${args.taskId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MusicAPI polling error: ${errorText}`);
    }

    return await response.json();
  },
});
