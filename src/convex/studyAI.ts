"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// UPDATED: Provider helper with Gemini → Hugging Face → OpenRouter → Bytez → Puter fallback chain
function getAIProvider() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const hfKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;
  const bytezKey = process.env.BYTEZ_API_KEY || process.env.VITE_BYTEZ_API_KEY;

  const providers = [];

  if (geminiKey) {
    providers.push({
      provider: "gemini" as const,
      apiKey: geminiKey,
      url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent",
      defaultModel: "gemini-2.0-flash-exp",
    });
  }
  if (hfKey) {
    providers.push({
      provider: "huggingface" as const,
      apiKey: hfKey,
      url: "https://api-inference.huggingface.co/models",
      defaultModel: "Qwen/Qwen2.5-14B-Instruct",
    });
  }
  if (openrouterKey) {
    providers.push({
      provider: "openrouter" as const,
      apiKey: openrouterKey,
      url: "https://openrouter.ai/api/v1/chat/completions",
      defaultModel: "openai/gpt-4-turbo",
    });
  }
  if (bytezKey) {
    providers.push({
      provider: "bytez" as const,
      apiKey: bytezKey,
      url: "https://api.bytez.com/v1/chat/completions",
      defaultModel: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    });
  }
  // Always add Puter as final fallback (free, no key required)
  providers.push({
    provider: "puter" as const,
    apiKey: "",
    url: "https://api.puter.com/v1/chat/completions",
    defaultModel: "gpt-5-mini",
  });

  if (providers.length === 1) {
    console.log("[studyAI] Only Puter available as fallback (no API keys configured)");
  }

  return providers;
}

// Helper to try all providers in sequence
async function callWithFallback(
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const providers = getAIProvider();
  let lastError: Error | null = null;

  for (const provider of providers) {
    try {
      if (provider.provider === "gemini") {
        // Gemini uses a different API format
        const response = await fetch(`${provider.url}?key=${provider.apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: messages.map(m => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            })),
            generationConfig: {
              temperature,
              maxOutputTokens: maxTokens,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (content) {
            console.log(`[studyAI] Success with ${provider.provider}`);
            return content;
          }
        }

        const errorText = await response.text().catch(() => "");
        console.warn(`[studyAI] ${provider.provider} failed with status ${response.status}: ${errorText.substring(0, 200)}, trying next provider...`);
        lastError = new Error(`${provider.provider}: ${response.status} ${response.statusText}`);
      } else if (provider.provider === "huggingface") {
        // Hugging Face Inference API format
        const response = await fetch(`${provider.url}/${provider.defaultModel}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${provider.apiKey}`,
          },
          body: JSON.stringify({
            inputs: messages.map(m => `${m.role}: ${m.content}`).join("\n"),
            parameters: {
              temperature,
              max_new_tokens: maxTokens,
              return_full_text: false,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data[0]?.generated_text || data.generated_text;
          if (content) {
            console.log(`[studyAI] Success with ${provider.provider}`);
            return content;
          }
        }

        const errorText = await response.text().catch(() => "");
        console.warn(`[studyAI] ${provider.provider} failed with status ${response.status}: ${errorText.substring(0, 200)}, trying next provider...`);
        lastError = new Error(`${provider.provider}: ${response.status} ${response.statusText}`);
      } else {
        // OpenAI-compatible providers (OpenRouter, Bytez, Puter)
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        
        if (provider.apiKey) {
          headers["Authorization"] = `Bearer ${provider.apiKey}`;
        }

        const response = await fetch(provider.url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: provider.defaultModel,
            messages,
            temperature,
            max_tokens: maxTokens,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            console.log(`[studyAI] Success with ${provider.provider}`);
            return content;
          }
        }

        const errorText = await response.text().catch(() => "");
        console.warn(`[studyAI] ${provider.provider} failed with status ${response.status}: ${errorText.substring(0, 200)}, trying next provider...`);
        lastError = new Error(`${provider.provider}: ${response.status} ${response.statusText}`);
      }
    } catch (error: any) {
      console.warn(`[studyAI] ${provider.provider} error: ${error.message}, trying next provider...`);
      lastError = error;
    }
  }

  const errorMsg = lastError?.message || "All AI providers failed";
  console.error(`[studyAI] All providers exhausted. Last error: ${errorMsg}`);
  throw new Error(`Failed to generate content: ${errorMsg}. Please ensure at least one API key is configured or check provider status.`);
}

export const generateNotes = action({
  args: {
    content: v.string(),
    materialId: v.optional(v.id("studyMaterials")),
  },
  handler: async (ctx, args) => {
    const generatedNotes = await callWithFallback(
      [
        {
          role: "system",
          content: "You are an expert study assistant. Generate comprehensive, well-structured study notes from the provided content. Use markdown formatting with headings, bullet points, and emphasis where appropriate.",
        },
        {
          role: "user",
          content: `Generate detailed study notes from this content:\n\n${args.content}`,
        },
      ],
      0.7,
      2000
    );

    return generatedNotes;
  },
});

export const generateFlashcards = action({
  args: {
    content: v.string(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const count = args.count || 10;

    const content = await callWithFallback(
      [
        {
          role: "system",
          content: "You are an expert study assistant. Generate flashcards from the provided content. Return a JSON array of objects with 'front', 'back', and 'difficulty' (easy/medium/hard) fields.",
        },
        {
          role: "user",
          content: `Generate ${count} flashcards from this content:\n\n${args.content}`,
        },
      ],
      0.7,
      2000
    );

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse flashcards from AI response");
    }

    const flashcards = JSON.parse(jsonMatch[0]);
    return flashcards;
  },
});

export const generateQuiz = action({
  args: {
    content: v.string(),
    questionCount: v.optional(v.number()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
  },
  handler: async (ctx, args) => {
    const questionCount = args.questionCount || 5;
    const difficulty = args.difficulty || "medium";

    const content = await callWithFallback(
      [
        {
          role: "system",
          content: "You are an expert quiz creator. Generate quiz questions from the provided content. Return a JSON array of objects with 'question', 'type' (multiple_choice/true_false/fill_blank), 'options' (array for multiple choice), 'correctAnswer', and 'explanation' fields.",
        },
        {
          role: "user",
          content: `Generate ${questionCount} ${difficulty} difficulty quiz questions from this content:\n\n${args.content}`,
        },
      ],
      0.7,
      2000
    );

    // Parse JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse quiz from AI response");
    }

    const questions = JSON.parse(jsonMatch[0]);
    return questions;
  },
});

// UPDATED: Transcribe audio using Hugging Face Whisper
export const transcribeAudio = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error("Hugging Face API key not configured");
    }

    // Get the audio file from storage
    const audioUrl = await ctx.storage.getUrl(args.storageId);
    if (!audioUrl) {
      throw new Error("Audio file not found");
    }

    try {
      // Fetch the audio file
      const audioResponse = await fetch(audioUrl);
      const audioBlob = await audioResponse.blob();

      // Use Hugging Face Inference API for transcription
      const { HfInference } = require("@huggingface/inference");
      const client = new HfInference(apiKey);

      const result = await client.automaticSpeechRecognition({
        data: audioBlob,
        model: "openai/whisper-large-v3",
      });

      return result.text;
    } catch (error: any) {
      throw new Error(`Failed to transcribe audio: ${error.message}`);
    }
  },
});

// NEW: Extract YouTube transcript
export const extractYouTubeTranscript = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args) => {
    // Extract video ID from URL
    const videoIdMatch = args.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (!videoIdMatch) {
      throw new Error("Invalid YouTube URL");
    }
    const videoId = videoIdMatch[1];

    try {
      // Use youtube-transcript API (we'll need to install this package)
      // For now, return a placeholder that indicates we need the package
      throw new Error("YouTube transcript extraction requires 'youtube-transcript' package. Please install it: pnpm add youtube-transcript");
    } catch (error: any) {
      throw new Error(`Failed to extract YouTube transcript: ${error.message}`);
    }
  },
});

// NEW: Process PDF with OCR
export const processPDF = action({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get the PDF file from storage
    const pdfUrl = await ctx.storage.getUrl(args.storageId);
    if (!pdfUrl) {
      throw new Error("PDF file not found");
    }

    try {
      // Use pdf-parse (we'll need to install this package)
      throw new Error("PDF processing requires 'pdf-parse' package. Please install it: pnpm add pdf-parse");
    } catch (error: any) {
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  },
});

// NEW: Generate audio summary/podcast from notes
export const generateAudioSummary = action({
  args: {
    content: v.string(),
    voice: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    // First, generate a condensed summary
    const summaryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert at creating concise, engaging audio summaries. Condense the content into a clear, spoken-word format suitable for a podcast.",
          },
          {
            role: "user",
            content: `Create a 2-minute audio summary of this content:\n\n${args.content}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!summaryResponse.ok) {
      throw new Error(`Failed to generate summary: ${summaryResponse.statusText}`);
    }

    const summaryData = await summaryResponse.json();
    const summaryText = summaryData.choices[0].message.content;

    // Then, convert to speech using OpenAI TTS
    const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: args.voice || "alloy",
        input: summaryText,
      }),
    });

    if (!ttsResponse.ok) {
      throw new Error(`Failed to generate audio: ${ttsResponse.statusText}`);
    }

    const audioBlob = await ttsResponse.blob();
    
    // Store the audio file
    const audioBuffer = await audioBlob.arrayBuffer();
    const storageId = await ctx.storage.store(new Blob([audioBuffer], { type: "audio/mpeg" }));

    return { storageId, summaryText };
  },
});

export const generatePodcastSummary = action({
  args: {
    content: v.string(),
    voice: v.optional(v.union(v.literal("alloy"), v.literal("echo"), v.literal("fable"), v.literal("onyx"), v.literal("nova"), v.literal("shimmer"))),
    speed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    try {
      // First, generate a podcast-style script
      const scriptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: "You are a podcast host. Convert the following study material into an engaging, conversational podcast script. Use a friendly tone, add transitions, and explain concepts clearly as if teaching a friend.",
            },
            {
              role: "user",
              content: `Create a podcast summary of this content:\n\n${args.content.substring(0, 8000)}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const scriptData = await scriptResponse.json();
      const script = scriptData.choices[0].message.content;

      // Generate audio using OpenAI TTS
      const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "tts-1",
          voice: args.voice || "alloy",
          input: script,
          speed: args.speed || 1.0,
        }),
      });

      const audioBuffer = await ttsResponse.arrayBuffer();
      const audioBlob = new Blob([audioBuffer], { type: "audio/mpeg" });

      // Store audio in Convex storage
      const storageId = await ctx.storage.store(audioBlob);

      return {
        script,
        audioStorageId: storageId,
      };
    } catch (error: any) {
      throw new Error(`Failed to generate podcast: ${error.message}`);
    }
  },
});

/**
 * Generate dyslexia-friendly, beginner-first notes from content.
 * Keeps language simple, short sentences, bullet points, and high readability.
 */
export const generateAccessibleNotes = action({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const content = await callWithFallback(
      [
        {
          role: "system",
          content:
            "You are an expert educator creating dyslexia-friendly study notes. Use very clear language, short sentences, simple words, and high-contrast markdown. Prefer headings, bullet lists, checklists, key terms, and TL;DR summaries. Avoid jargon. Explain as if to a beginner who barely studies. Keep it encouraging and structured.",
        },
        {
          role: "user",
          content: `Create dyslexia-friendly notes from this content:\n\n${args.content}`,
        },
      ],
      0.5,
      2000
    );

    return content;
  },
});

// NEW: Generate image using Hugging Face Inference API
export const generateImageHF = action({
  args: {
    model: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error("Hugging Face API key not configured");
    }

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${args.model}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: args.prompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Response is a blob (image)
      const imageBlob = await response.blob();
      
      // Store the image in Convex storage
      const storageId = await ctx.storage.store(imageBlob);
      
      // Get URL for the stored image
      const imageUrl = await ctx.storage.getUrl(storageId);
      
      return { imageUrl: imageUrl || "", storageId };
    } catch (error: any) {
      throw new Error(`Failed to generate image with Hugging Face: ${error.message}`);
    }
  },
});

// NEW: Generate video using Hugging Face Inference API
export const generateVideoHF = action({
  args: {
    model: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      throw new Error("Hugging Face API key not configured");
    }

    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${args.model}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: args.prompt,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`Hugging Face API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Response is a blob (video)
      const videoBlob = await response.blob();
      
      // Store the video in Convex storage
      const storageId = await ctx.storage.store(videoBlob);
      
      // Get URL for the stored video
      const videoUrl = await ctx.storage.getUrl(storageId);
      
      return { videoUrl: videoUrl || "", storageId };
    } catch (error: any) {
      throw new Error(`Failed to generate video with Hugging Face: ${error.message}`);
    }
  },
});