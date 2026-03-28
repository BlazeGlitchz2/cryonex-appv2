"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";
// Note: responseCache functions are called via api.responseCache, not direct imports

import { FALLBACK_MODEL_MAP, MODEL_REDIRECTS, determineAutoModel, callGeminiVision, enhanceImagePrompt, performChatCompletion, preprocessQuery } from "./chatHelpers";
// --------------------------------------------------------------------------
// Main Action
// --------------------------------------------------------------------------

export const sendMessage = action({
  args: {
    chatId: v.optional(v.id("chats")),
    messages: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      }),
    ),
    model: v.string(),
    messageId: v.optional(v.id("messages")),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          name: v.string(),
          type: v.string(),
          size: v.number(),
        }),
      ),
    ),
  },
  handler: async (ctx, args): Promise<any> => {
    const dedupeModels = (models: string[]) =>
      Array.from(new Set(models.filter(Boolean)));

    const appendSearchStatus = (content: string, searchQuery?: string) =>
      searchQuery ? `<search>${searchQuery}</search>\n\n${content}` : content;

    const buildVisionMessages = (
      messages: { role: string; content: string }[],
      imageBase64: string,
      mimeType: string,
    ) =>
      messages.map((message, index) => {
        if (message.role !== "user" || index !== messages.length - 1) {
          return message;
        }

        return {
          ...message,
          content: [
            { type: "text", text: message.content },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        };
      });

    const buildTextFallbackOrder = (primaryModel: string) =>
      dedupeModels([
        primaryModel,
        FALLBACK_MODEL_MAP[primaryModel],
        MODEL_REDIRECTS[primaryModel],
        "minimax/minimax-m2.5:free",
        "google/gemma-3-27b-it:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "openrouter/free",
        "groq/llama-3.3-70b-versatile",
        "cerebras/llama-3.3-70b",
        "sambanova/Meta-Llama-3.3-70B-Instruct",
        "bytez/meta-llama/Llama-3-70b-instruct-hf",
      ]);

    const buildVisionFallbackOrder = (primaryModel: string) =>
      dedupeModels([
        primaryModel,
        "pollinations/qwen-vision",
        "pollinations/gemini",
        "nvidia/nemotron-nano-12b-v2-vl:free",
        "google/gemma-3-27b-it:free",
      ]);

    // 1. Determine Model
    let targetModel = args.model;
    const lastUserMessage = args.messages[args.messages.length - 1].content;
    const hasAttachments =
      (args.attachments && args.attachments.length > 0) || false;
    const lowerContent = lastUserMessage.toLowerCase();

    console.log("--- CHAT V3: IMAGE GEN RELOADED ---");
    console.log(
      `[Chat Action] Received message: "${lastUserMessage}" Model: ${targetModel}`,
    );

    // IMAGE GENERATION INTENT DETECTION
    // Precise compound-keyword detection is handled by `determineAutoModel` below
    // (e.g. "create image", "generate picture", "/image", "/img").
    // We intentionally do NOT use broad individual keyword matching here
    // to avoid false positives on normal text queries like "create a study plan".

    // ALWAYS override if attachments are present (unless specifically handled as image editing)
    if (hasAttachments && targetModel === "auto") {
      console.log("[Chat Action] Attachments detected in Auto mode -> Forcing Vision Model");
      targetModel = "pollinations/qwen-vision";
    }

    // Explicit Magic Command
    if (
      lowerContent.startsWith("/image ") ||
      lowerContent.startsWith("/img ") ||
      lowerContent.startsWith("/generate ")
    ) {
      console.log(
        "[Auto Mode] Detected /image command -> Forcing Pollinations/GPT Image",
      );
      targetModel = "pollinations/gptimage";
    }

    if (targetModel === "auto") {
      targetModel = determineAutoModel(lastUserMessage, hasAttachments);
      console.log(`[Auto Mode] Selected ${targetModel}`);
    } else if (MODEL_REDIRECTS[targetModel]) {
      targetModel = MODEL_REDIRECTS[targetModel];
    }

    // SPECIAL HANDLING: Image Editing (Attached Image + Edit Intent)
    if (hasAttachments) {
      const editKeywords = [
        "edit",
        "modify",
        "change",
        "make",
        "turn",
        "transform",
        "add",
        "remove",
        "replace",
        "colorize",
        "filter",
        "style",
      ];
      const isEditIntent = editKeywords.some((k) => lowerContent.includes(k));

      if (isEditIntent) {
        console.log(
          "[Auto Mode] Detected Image Edit Intent -> Delegating to Pollinations Kontext",
        );

        // Find the first image attachment
        let sourceImageUrl: string | null = null;
        for (const file of args.attachments!) {
          if (file.type.startsWith("image/")) {
            try {
              // Get URL from storage
              const url = await ctx.storage.getUrl(file.storageId);
              if (url) {
                sourceImageUrl = url;
                break;
              }
            } catch (e) {
              console.error("Failed to get image URL for editing:", e);
            }
          }
        }

        if (sourceImageUrl) {
          try {
            // Clean prompt for editing
            const editPrompt = lastUserMessage;
            // Remove common prefixes to get to the core instruction
            const prefixes = [
              "edit this image to",
              "make this image",
              "change this to",
              "turn this into",
              "add",
              "remove",
            ];

            console.log(
              `[Image Edit] Editing image: ${sourceImageUrl} with prompt: "${editPrompt}"`,
            );

            const editedImageUrl = await (ctx.runAction as any)(
              (api as any).pollinations.edit,
              {
                prompt: editPrompt,
                image: sourceImageUrl,
                model: "kontext",
                width: 1024,
                height: 1024,
                nologo: true,
              },
            );

            const responseContent = `Here is your edited image:\n\n![${editPrompt}](${editedImageUrl})`;

            if (args.messageId) {
              await ctx.runMutation((api as any).messages.update, {
                messageId: args.messageId,
                content: responseContent,
                model: "pollinations/kontext",
              });
            }

            return {
              content: responseContent,
              sources: [],
              model: "pollinations/kontext",
            };
          } catch (err: any) {
            console.error("[Image Edit Error]", err);
            // Fallthrough to standard logic if edit fails, or return error
            if (args.messageId) {
              await ctx.runMutation((api as any).messages.update, {
                messageId: args.messageId,
                content:
                  "I'm sorry, I encountered an error editing that image. Please try again.",
              });
            }
            return {
              content: "Error editing image.",
              sources: [],
              model: "pollinations/kontext",
            };
          }
        }
      }
    }

    // SPECIAL HANDLING: Pollinations / Image Generation
    // List of explicit Pollinations image models
    const POLLINATIONS_IMAGE_MODELS = [
      "pollinations/flux",
      "pollinations/turbo",
      "pollinations/kontext",
      "pollinations/gptimage",
      "pollinations/seedream",
      "pollinations/nanobanana",
    ];

    const isExplicitImageModel =
      POLLINATIONS_IMAGE_MODELS.includes(targetModel) ||
      (targetModel.startsWith("pollinations/") && (
        targetModel.includes("flux") ||
        targetModel.includes("gptimage") ||
        targetModel.includes("seedream") ||
        targetModel.includes("nanobanana") ||
        targetModel.includes("sdxl")
      ));

    if (isExplicitImageModel) {
      try {
        // Robust prompt extraction
        let rawPrompt = lastUserMessage.replace(/^\/image\s+/i, ""); // Handle /image command specifically
        rawPrompt = rawPrompt.replace(/^\/img\s+/i, ""); // Handle /img command
        rawPrompt = rawPrompt.replace(/^\/generate\s+/i, ""); // Handle /generate command

        // Handle natural language triggers (e.g., "Generate an image of...")
        rawPrompt = rawPrompt
          .replace(
            /^(?:can you\s+)?(?:please\s+)?(?:generate|create|make|draw|illustrate)(?:\s+(?:me|us))?(?:\s+an?)?(?:\s+(?:image|picture|photo|art|visual|illustration))?\s+(?:of\s+)?/i,
            "",
          )
          .trim();

        // Fallback: If stripping resulted in empty string, use original
        if (!rawPrompt) rawPrompt = lastUserMessage;

        console.log(`[Image Gen] Raw user prompt: "${rawPrompt}"`);

        // ENHANCEMENT STEP: Use AI to transform the user's request into a detailed image prompt
        const enhancedPrompt = await enhanceImagePrompt(rawPrompt);
        console.log(
          `[Image Gen] Final enhanced prompt: "${enhancedPrompt.substring(0, 100)}..."`,
        );

        let finalImageUrl = "";

        try {
          console.log(`[Image Gen] Delegating to api.pollinations.generate...`);
          const result = await (ctx.runAction as any)(
            (api as any).pollinations.generate,
            {
              prompt: enhancedPrompt,
              model: "gptimage",
              width: 1024,
              height: 1024,
              enhance: true,
              seed: Math.floor(Math.random() * 1000000),
              nologo: true,
            },
          );
          finalImageUrl = (result as string) || "";
        } catch (actionError) {
          console.error(
            "[Image Gen] Action failed, falling back to direct hotlink:",
            actionError,
          );
          const encodedPrompt = encodeURIComponent(enhancedPrompt);
          finalImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=gptimage&nologo=true`;
        }

        // 5. Update Message with Content AND Model
        const responseContent = `Here is your generated image:\n\n![${rawPrompt}](${finalImageUrl})`;

        if (args.messageId) {
          // IMPORTANT: Update the model field too so the UI knows it's an image model
          await ctx.runMutation((api as any).messages.update, {
            messageId: args.messageId,
            content: responseContent,
            model: "pollinations/gptimage", // Force update model to gptimage
          });
        }

        return {
          content: responseContent,
          sources: [],
          model: "pollinations/gptimage",
        };
      } catch (err: any) {
        console.error(`[Image Gen Error]`, err);

        // Fallback to LLM if generation crashes, or return error message
        if (args.messageId) {
          await ctx.runMutation((api as any).messages.update, {
            messageId: args.messageId,
            content:
              "I'm sorry, I encountered an error generating that image. Please try again.",
          });
        }
        return {
          content: "Error generating image.",
          sources: [],
          model: "pollinations/gptimage",
        };
      }
    }

    // 2. Calculate Credits using Smart Pricing
    // Import calculateChatCost, detectFeatures from smartPricing
    const { calculateChatCost, detectFeatures } = await import(
      "./smartPricing"
    );

    // Detect features based on content and model
    const features = detectFeatures(
      lastUserMessage,
      hasAttachments,
      targetModel,
    );

    // Calculate cost based on model, message length, and features
    const creditCost = calculateChatCost(
      targetModel,
      lastUserMessage,
      0,
      features,
    );

    const viewerIdentity = await ctx.auth.getUserIdentity();
    if (viewerIdentity) {
      try {
        await ctx.runMutation((api as any).credits.charge, {
          amount: creditCost,
          type: "chat",
          description: `Chat: ${targetModel}`,
          metadata: {
            model: targetModel,
            inputLength: lastUserMessage.length,
            features,
            hasAttachments,
          },
        });
      } catch (error: any) {
        const message = String(error?.message || "");
        if (message.includes("Insufficient credits")) {
          throw new Error(
            message.includes("Requires")
              ? message
              : `Insufficient credits. This action requires ${creditCost.toFixed(2)} credits.`,
          );
        }
        if (message.includes("Could not find public function")) {
          throw new Error(
            "The credit system on Convex is out of date. Run `npx convex dev` or redeploy Convex, then try sending again.",
          );
        }

        throw new Error(message || "Unable to charge credits for this message right now.");
      }
    } else {
      console.log("[Chat Action] Guest session detected -> skipping credit charge");
    }

    // 3. Preprocess (Search, etc.)
    const preprocessed = await preprocessQuery(
      ctx,
      lastUserMessage,
      args.messageId,
      args.messages,
      targetModel,
    );
    let processedMessages = [...args.messages];

    if (preprocessed.systemInstruction) {
      processedMessages = [
        { role: "system", content: preprocessed.systemInstruction },
        ...processedMessages,
      ];
    }

    // Save search results if any
    if (preprocessed.searchResults && args.messageId) {
      await ctx.runMutation((api as any).messages.updateSources, {
        messageId: args.messageId,
        sources: preprocessed.searchResults,
      });
    }

    // 4. Handle Attachments (Vision) - Use Native Gemini API
    let imageBase64Data: string | null = null;
    let imageMimeType: string = "image/png";

    if (hasAttachments) {
      // Extract first image for native Gemini vision call
      for (const file of args.attachments!) {
        if (file.type.startsWith("image/")) {
          try {
            const url = await ctx.storage.getUrl(file.storageId);
            if (url) {
              const imageResponse = await fetch(url);
              const arrayBuffer = await imageResponse.arrayBuffer();
              imageBase64Data = Buffer.from(arrayBuffer).toString("base64");
              imageMimeType = file.type || "image/png";
              console.log(
                `[Vision] Loaded ${file.name} as base64 (${Math.round(imageBase64Data.length / 1024)}KB)`,
              );
              break; // Use first image only for now
            }
          } catch (imgErr) {
            console.error(
              `[Vision] Failed to load image ${file.name}:`,
              imgErr,
            );
          }
        }
      }

      // If we have an image, use native Gemini Vision API directly
      if (imageBase64Data) {
        try {
          console.log(
            `[Vision] Using native Gemini Vision API for image analysis`,
          );
          const visionResponse = await callGeminiVision(
            lastUserMessage,
            imageBase64Data,
            imageMimeType,
            preprocessed.systemInstruction,
          );

          // Update the message with the response
          if (args.messageId) {
            await ctx.runMutation((api as any).messages.update, {
              messageId: args.messageId,
              content: visionResponse,
              model: "google/gemini-2.5-flash-lite",
            });
          }

          return {
            content: visionResponse,
            sources: preprocessed.searchResults,
            model: "google/gemini-2.5-flash-lite",
          };
        } catch (visionError: any) {
          console.error(
            `[Vision] Native Gemini API failed:`,
            visionError.message,
          );
          console.warn("[Vision] Falling back to multimodal provider chain.");
        }
      }
    }

    try {
      const hasVisionPayload = Boolean(hasAttachments && imageBase64Data);
      const requestMessages = hasVisionPayload
        ? buildVisionMessages(processedMessages, imageBase64Data!, imageMimeType)
        : processedMessages;
      const modelAttemptOrder = hasVisionPayload
        ? buildVisionFallbackOrder(targetModel)
        : buildTextFallbackOrder(targetModel);

      console.log(
        `[Load Balancing] Attempting ${modelAttemptOrder.length} model routes (vision=${hasVisionPayload})`,
      );

      for (const modelCandidate of modelAttemptOrder) {
        try {
          let response = await performChatCompletion(
            modelCandidate,
            requestMessages,
            hasVisionPayload,
          );

          if (
            !hasVisionPayload &&
            (!response || !response.trim()) &&
            (modelCandidate.includes("gemini") || modelCandidate.includes("google"))
          ) {
            response = await performChatCompletion(
              modelCandidate,
              requestMessages,
              false,
              "google",
            );
          }

          if (!response || !response.trim()) {
            throw new Error("Received empty response");
          }

          const finalResponse = appendSearchStatus(
            response,
            preprocessed.searchQuery,
          );

          if (args.messageId) {
            await ctx.runMutation((api as any).messages.update, {
              messageId: args.messageId,
              content: finalResponse,
              model: modelCandidate,
            });
          }

          return {
            content: finalResponse,
            sources: preprocessed.searchResults,
            model: modelCandidate,
          };
        } catch (providerError: any) {
          console.warn(
            `[Load Balancing] ${modelCandidate} failed: ${providerError.message}`,
          );
        }
      }

      throw new Error("All configured providers failed.");
    } catch (e: any) {
      console.warn("[AI] Primary model failed:", e.message);

      if (hasAttachments) {
        const errorMessage = `⚠️ **Vision Error**: I couldn't route your image through the available multimodal providers right now.

**Please try:**
1. Re-uploading the image
2. Using a different image format (PNG, JPG)
3. Trying again in a few seconds
4. Switching to a smaller image if the file is very large`;

        if (args.messageId) {
          await ctx.runMutation((api as any).messages.update, {
            messageId: args.messageId,
            content: errorMessage,
          });
        }

        return {
          content: errorMessage,
          sources: [],
          model: "pollinations/qwen-vision",
        };
      }
      throw new Error("All AI providers failed. Please try again later.");
    }
  },
});
