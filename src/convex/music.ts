"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateMusic = action({
  args: {
    prompt: v.string(),
    duration: v.optional(v.number()),
    model: v.optional(v.string()),
    instrumental: v.optional(v.boolean()),
    style: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.MUSIC_API_KEY;
    if (!apiKey) {
      throw new Error("MUSIC_API_KEY is not configured. Please add it in the Integrations tab.");
    }

    // Map internal model IDs to Kie AI model names
    let modelVersion = "V3_5"; // Default
    const model = args.model || "";
    if (model.includes("suno-v4")) modelVersion = "V4";
    else if (model.includes("suno-v3.5")) modelVersion = "V3_5";
    else if (model.includes("suno-v3")) modelVersion = "V3_5"; // Fallback for v3 to v3.5 if needed

    // Determine mode based on provided arguments
    // If style or title is provided, we use custom mode (usually)
    // However, following the user's example structure which uses customMode: true
    const isCustom = !!args.style || !!args.title;

    // Using the correct endpoint for Kie AI (Suno) generation
    const response = await fetch("https://api.kie.ai/api/v1/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: args.prompt,
        customMode: isCustom,
        instrumental: args.instrumental ?? false,
        model: modelVersion,
        style: args.style || "",
        title: args.title || "",
        mv: modelVersion === "V3_5" ? "chirp-v3-5" : undefined // mv might be needed for v3.5
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MusicAPI error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    
    // The API returns { code: 200, msg: "success", data: { taskId: "..." } }
    if (result.code !== 200 || !result.data?.taskId) {
        throw new Error(`MusicAPI response error: ${JSON.stringify(result)}`);
    }

    return {
      taskId: result.data.taskId,
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

    const response = await fetch(`https://api.kie.ai/api/v1/generate/record-info?taskId=${args.taskId}`, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`MusicAPI polling error: ${errorText}`);
      throw new Error(`MusicAPI polling error: ${errorText}`);
    }

    const result = await response.json();
    
    if (result.code !== 200) {
       // Handle specific error codes if needed
       if (result.code === 404) return { status: "processing" }; // Task might not be ready yet
       return { status: "failed", error: result.msg || "Unknown error" };
    }

    const data = result.data;
    if (!data) {
      return { status: "processing" };
    }

    // Map API states to our internal status
    // API states: PENDING, TEXT_SUCCESS, FIRST_SUCCESS, SUCCESS, CREATE_TASK_FAILED, GENERATE_AUDIO_FAILED
    let status = "processing";
    if (data.status === "SUCCESS" || data.status === "FIRST_SUCCESS") status = "completed";
    if (data.status === "CREATE_TASK_FAILED" || data.status === "GENERATE_AUDIO_FAILED" || data.status === "SENSITIVE_WORD_ERROR") status = "failed";

    // Extract the first track if available
    const track = data.response?.sunoData?.[0];

    if (status === "completed" && track) {
        return {
            status,
            audioUrl: track.audioUrl,
            imageUrl: track.imageUrl,
            title: track.title,
            duration: track.duration,
            metadata: {
                tags: track.tags,
                lyrics: null // Lyrics might be available in a separate call or property, but basic info is here
            }
        };
    }

    return { status, error: data.errorMessage };
  },
});