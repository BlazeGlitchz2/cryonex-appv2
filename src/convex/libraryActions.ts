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
                content: "You are an expert educator and content creator. Your goal is to generate a comprehensive, structured, and visually appealing educational guide on the provided topic. \n\nCRITICAL INSTRUCTIONS:\n1. DO NOT include the user's prompt, questions, or instructions in the output.\n2. Start directly with the content (e.g., Introduction, Definition, etc.).\n3. Use Markdown formatting with headers (#, ##, ###), bullet points, and bold text for readability.\n4. If the user asks a question (e.g., 'How does X work?'), answer it comprehensively as an article/guide about X.\n5. The Title provided is the main topic. The Context is for specific focus (e.g., 'explain like I'm 5').\n6. Do not say 'Here is an explanation' or 'Sure!'. Just output the educational content."
              },
              {
                role: "user",
                content: `Topic: ${title}\nContext/Instructions: ${currentPrompt || "General overview"}\n\nGenerate the educational content now.`
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