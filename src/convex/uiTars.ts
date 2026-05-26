"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { requireAuthenticatedUser } from "./lib/requireAuth";

// OpenRouter: UI-TARS multimodal (image + instruction) via OpenAI-compatible chat API
export const tarsOpenRouter = action({
  args: {
    instruction: v.string(),
    // data URL (recommended) or https URL; both work with OpenRouter image_url
    image: v.string(),
    model: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthenticatedUser(ctx);
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing OPENROUTER_API_KEY. Add it in Integrations > OpenRouter.",
      );
    }

    const model = args.model ?? "bytedance/ui-tars-1.5-7b";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.SITE_URL ?? "https://cryonex.app",
        "X-Title": "Cryonex",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: args.instruction },
              { type: "image_url", image_url: { url: args.image } },
            ],
          },
        ],
        max_tokens: 400,
      }),
    });

    // Read once to avoid "Body is unusable" errors
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      throw new Error(`OpenRouter UI-TARS error ${res.status}: ${text}`);
    }
    return data;
  },
});

// Hugging Face Inference: Call a deployed UI-TARS Endpoint (TGI-style JSON schema)
export const tarsHf = action({
  args: {
    instruction: v.string(),
    // Send a data URL string: "data:<mime>;base64,<...>"
    imageBase64: v.string(),
    model: v.optional(v.string()), // e.g., "ByteDance-Seed/UI-TARS-1.5-7B"
  },
  handler: async (ctx, args) => {
    await requireAuthenticatedUser(ctx);
    const token = process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN;
    if (!token) {
      throw new Error(
        "Missing HUGGINGFACE_API_KEY (or HF_TOKEN). Add it in Integrations > Hugging Face Inference API.",
      );
    }

    const model = encodeURIComponent(
      args.model ?? "ByteDance-Seed/UI-TARS-1.5-7B",
    );
    const url = `https://router.huggingface.co/hf-inference/models/${model}`;

    // Many multimodal models deployed on HF Endpoints with TGI accept this chat-like JSON.
    // If your endpoint expects a different schema, adjust 'inputs' accordingly.
    const payload = {
      inputs: [
        {
          role: "user",
          content: [
            { type: "text", text: args.instruction },
            // Pass the image as a data URL; several TGI multimodal servers accept this
            { type: "image", image: args.imageBase64 },
          ],
        },
      ],
      parameters: { max_new_tokens: 400 },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // Read once to avoid "Body is unusable" errors
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    if (!res.ok) {
      throw new Error(`Hugging Face UI-TARS error ${res.status}: ${text}`);
    }
    return data;
  },
});
