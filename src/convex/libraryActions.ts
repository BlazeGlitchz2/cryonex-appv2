"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";

export const enhanceContent = action({
  args: {
    title: v.string(),
    currentPrompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { title, currentPrompt } = args;

    // Use free AI providers first, then fall back to OpenRouter
    const providers = [
      {
        name: "Cerebras",
        url: "https://api.cerebras.ai/v1/chat/completions",
        key: process.env.CEREBRAS_API_KEY,
        model: "llama-3.3-70b",
      },
      {
        name: "SambaNova",
        url: "https://api.sambanova.ai/v1/chat/completions",
        key: process.env.SAMBANOVA_API_KEY,
        model: "Meta-Llama-3.1-70B-Instruct",
      },
      {
        name: "Groq",
        url: "https://api.groq.com/openai/v1/chat/completions",
        key: process.env.GROQ_API_KEY,
        model: "llama-3.3-70b-versatile",
      },
      {
        name: "OpenRouter",
        url: "https://openrouter.ai/api/v1/chat/completions",
        key: process.env.OPENROUTER_API_KEY,
        model: "meta-llama/llama-3.3-70b-instruct",
      },
    ];

    let enhancedContent = currentPrompt || "";

    const systemPrompt =
      "You are an expert educator and content creator. Your goal is to generate a comprehensive, structured, and visually appealing educational guide on the provided topic. \n\nCRITICAL INSTRUCTIONS:\n1. DO NOT include the user's prompt, questions, or instructions in the output.\n2. Start directly with the content (e.g., Introduction, Definition, etc.).\n3. Use Markdown formatting with headers (#, ##, ###), bullet points, and bold text for readability.\n4. If the user asks a question (e.g., 'How does X work?'), answer it comprehensively as an article/guide about X.\n5. The Title provided is the main topic. The Context is for specific focus (e.g., 'explain like I'm 5').\n6. Do not say 'Here is an explanation' or 'Sure!'. Just output the educational content.";

    const userPrompt = `Topic: ${title}\nContext/Instructions: ${currentPrompt || "General overview"}\n\nGenerate the educational content now.`;

    for (const provider of providers) {
      if (!provider.key) continue;

      try {
        const headers: Record<string, string> = {
          Authorization: `Bearer ${provider.key}`,
          "Content-Type": "application/json",
        };

        // Add additional headers for OpenRouter
        if (provider.name === "OpenRouter") {
          headers["HTTP-Referer"] = "https://cryonex.app";
          headers["X-Title"] = "Cryonex Workspace";
        }

        const response = await fetch(provider.url, {
          method: "POST",
          headers,
          body: JSON.stringify({
            model: provider.model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            enhancedContent = content;
            console.log(
              `[libraryActions] Used ${provider.name} for content enhancement`,
            );
            break;
          }
        } else {
          console.warn(
            `[libraryActions] ${provider.name} failed: ${response.status}`,
          );
        }
      } catch (error) {
        console.warn(`[libraryActions] ${provider.name} error:`, error);
      }
    }

    // 2. Generate Image using Replicate
    const replicateToken = process.env.REPLICATE_API_TOKEN;
    let imageUrl = "";

    if (replicateToken) {
      try {
        // Using FLUX-schnell for fast generation
        const model = "black-forest-labs/flux-schnell";
        const apiUrl = `https://api.replicate.com/v1/models/${model}/predictions`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            Authorization: `Token ${replicateToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: {
              prompt: `High quality, educational illustration, modern style, minimal, 4k, abstract representation of: ${title}`,
              aspect_ratio: "16:9",
              output_format: "webp",
              output_quality: 80,
            },
          }),
        });

        if (response.ok) {
          let prediction = await response.json();

          // Poll for completion
          const maxAttempts = 30;
          let attempts = 0;

          while (
            prediction.status !== "succeeded" &&
            prediction.status !== "failed" &&
            prediction.status !== "canceled" &&
            attempts < maxAttempts
          ) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            attempts++;

            const pollResponse = await fetch(prediction.urls.get, {
              headers: { Authorization: `Token ${replicateToken}` },
            });

            if (pollResponse.ok) {
              prediction = await pollResponse.json();
            }
          }

          if (prediction.status === "succeeded" && prediction.output) {
            imageUrl = Array.isArray(prediction.output)
              ? prediction.output[0]
              : prediction.output;
          }
        } else {
          console.error("Image generation failed", await response.text());
        }
      } catch (error) {
        console.error("Error generating image:", error);
      }
    }

    return {
      content: enhancedContent,
      imageUrl: imageUrl,
    };
  },
});
