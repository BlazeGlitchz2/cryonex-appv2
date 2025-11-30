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
    
    // 1. Generate Enhanced Content using OpenRouter (or available LLM key)
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    let enhancedContent = currentPrompt || "";
    
    if (openRouterKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://cryonex.app",
            "X-Title": "Cryonex Workspace",
          },
          body: JSON.stringify({
            model: "anthropic/claude-3.5-sonnet", // High quality model
            messages: [
              {
                role: "system",
                content: "You are an expert educator and content creator. Your goal is to take a topic or brief prompt and expand it into a comprehensive, easy-to-understand explanation or guide. Use Markdown formatting with headers, bullet points, and clear sections. Keep it engaging and educational."
              },
              {
                role: "user",
                content: `Please research and explain the following topic/prompt in detail:\n\nTitle: ${title}\nContext: ${currentPrompt || "No additional context provided."}\n\nProvide a structured, detailed explanation.`
              }
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          enhancedContent = data.choices[0]?.message?.content || enhancedContent;
        } else {
            console.error("LLM generation failed", await response.text());
        }
      } catch (error) {
        console.error("Error generating content:", error);
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
            "Authorization": `Token ${replicateToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input: {
              prompt: `High quality, educational illustration, modern style, minimal, 4k, abstract representation of: ${title}`,
              aspect_ratio: "16:9",
              output_format: "webp",
              output_quality: 80
            }
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
              headers: { "Authorization": `Token ${replicateToken}` }
            });
            
            if (pollResponse.ok) {
              prediction = await pollResponse.json();
            }
          }

          if (prediction.status === "succeeded" && prediction.output) {
            imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
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
      imageUrl: imageUrl
    };
  },
});
