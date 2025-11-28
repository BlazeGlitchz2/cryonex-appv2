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

    // Using the correct endpoint for Sonic (Suno) generation
    const response = await fetch("https://api.musicapi.ai/api/v1/sonic/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        custom_mode: false,
        gpt_description_prompt: args.prompt,
        mv: "sonic-v3-5", // Using the latest stable version
        make_instrumental: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MusicAPI error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    // The API returns { message: "success", task_id: "..." }
    // We map this to what the frontend expects
    return {
      taskId: result.task_id,
      status: "processing"
    };
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

    const response = await fetch(`https://api.musicapi.ai/api/v1/sonic/task/${args.taskId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MusicAPI polling error: ${errorText}`);
    }

    const result = await response.json();
    
    // The API returns { data: [{ state: "...", audio_url: "...", ... }] }
    const data = result.data?.[0];
    
    if (!data) {
      return { status: "processing" };
    }

    // Map API states to our internal status
    // API states: pending, running, succeeded, failed
    let status = "processing";
    if (data.state === "succeeded") status = "completed";
    if (data.state === "failed") status = "failed";

    return {
      status,
      audioUrl: data.audio_url,
      imageUrl: data.image_url,
      title: data.title,
      duration: data.duration,
      metadata: {
        tags: data.tags,
        lyrics: data.lyrics
      }
    };
  },
});