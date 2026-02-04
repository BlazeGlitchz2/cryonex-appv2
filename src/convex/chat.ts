"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";
// Note: responseCache functions are called via api.responseCache, not direct imports

// --------------------------------------------------------------------------
// Configuration & Constants
// --------------------------------------------------------------------------

const FALLBACK_MODEL_MAP: Record<string, string> = {
  // Map legacy/paid models to free equivalents
  "gpt-4-turbo": "sambanova/Meta-Llama-3.1-405B-Instruct",
  "gpt-3.5-turbo": "groq/llama-3.1-8b-instant",
  "claude-3-opus": "sambanova/Meta-Llama-3.1-405B-Instruct",
  "claude-3-sonnet": "cerebras/llama-3.3-70b",
  "claude-3-haiku": "groq/llama-3.3-70b-versatile",
  "gemini-pro": "google/gemini-1.5-flash", // Keep Flash for context
};

const MODEL_REDIRECTS: Record<string, string> = {
  "sambanova/Meta-Llama-3.1-405B-Instruct": "sambanova/Meta-Llama-3.3-70B-Instruct", // Redirect if 405B is unavailable
};

// --------------------------------------------------------------------------
// Helper Functions
// --------------------------------------------------------------------------

// Super Intelligent Auto Mode Router
const determineAutoModel = (content: string, hasAttachments: boolean): string => {
  const lowerContent = content.toLowerCase();
  const length = content.length;

  // 1. Priority: Attachments / Vision -> Gemini Flash (1M Context)
  // If user uploads an image, they likely want to talk about IT, not generate a new one.
  if (hasAttachments) {
    return "google/gemini-1.5-flash"; // Reliable vision model
  }

  // 2. Image Generation Intent -> Pollinations Flux
  // Must be explicit: "generate/create/draw" AND "image/picture/photo"
  // OR use natural language patterns
  const actionKeywords = ["generate", "create", "make", "draw", "illustrate", "paint", "sketch", "render", "design", "show me", "i want", "i need", "give me"];
  const objectKeywords = ["image", "picture", "photo", "art", "visual", "illustration", "pic", "drawing", "painting", "sketch", "logo", "icon", "banner", "thumbnail", "avatar"];

  const hasAction = actionKeywords.some(k => lowerContent.includes(k));
  const hasObject = objectKeywords.some(k => lowerContent.includes(k));

  if (hasAction && hasObject) {
    return "pollinations/flux";
  }

  // Specific catch for just "/image" or "can you draw..." or "draw me a..."
  if (lowerContent.startsWith("/image") || lowerContent.includes("can you draw") || lowerContent.match(/^(draw|paint|sketch)\s/)) {
    return "pollinations/flux";
  }

  // Natural language patterns for image generation
  // "show me a cat", "create a landscape", "make a robot"
  const naturalImagePatterns = [
    /^show\s+me\s+(?:a|an|the|some)?\s*/i,
    /^(?:can\s+you\s+)?(?:please\s+)?(?:create|make|generate|draw)\s+(?:a|an|the|some|me\s+a)?\s*/i,
    /what\s+(?:would|does|might)\s+.+\s+look\s+like/i,
    /^(?:i\s+want|i\s+need|give\s+me)\s+(?:a|an|the|some)?\s*(?:picture|image|photo|art)/i,
  ];

  // Visual nouns that suggest image generation when paired with creation verbs
  const visualNouns = ["cat", "dog", "landscape", "sunset", "portrait", "robot", "dragon", "fantasy", "space", "city", "car", "house", "forest", "ocean", "mountain", "person", "character", "scene", "background", "wallpaper"];

  // Check natural patterns
  for (const pattern of naturalImagePatterns) {
    if (pattern.test(lowerContent)) {
      return "pollinations/flux";
    }
  }

  // Check for "show me [visual noun]" or "create [visual noun]"
  if (hasAction && visualNouns.some(noun => lowerContent.includes(noun))) {
    // Additional check: avoid triggering on "show me how to" or "explain"
    if (!lowerContent.includes("how to") && !lowerContent.includes("explain") && !lowerContent.includes("tell me about")) {
      return "pollinations/flux";
    }
  }

  // 3. Huge Context -> Gemini Flash
  if (length > 10000) {
    return "google/gemini-1.5-flash";
  }

  // 4. Complex Reasoning / Math / Coding -> SambaNova (Llama 405B/70B)
  const complexityKeywords = [
    "code", "function", "script", "debug", "fix", "analyze", "reason",
    "explain", "why", "how", "compare", "difference", "summary", "summarize",
    "essay", "article", "blog", "creative", "story", "react", "typescript",
    "convex", "database", "schema", "architecture", "solve", "math", "calculus"
  ];

  if (complexityKeywords.some(k => lowerContent.includes(k))) {
    return "sambanova/Meta-Llama-3.1-405B-Instruct";
  }

  // 5. Medium Length -> Cerebras (Llama 70B - Fast)
  if (length > 200) {
    return "cerebras/llama-3.3-70b";
  }

  // 6. Short / Simple -> Groq (Llama 8B - Instant)
  return "groq/llama-3.1-8b-instant";
};

// Helper to perform SerpAPI Search
const performSerpApiSearch = async (query: string) => {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&engine=google`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("[SerpAPI] Request failed:", error);
    return null;
  }
};

// Pre-processing filter
const preprocessQuery = async (ctx: any, content: string, messages: any[] = []): Promise<{ content: string; systemInstruction?: string; searchResults?: any[] }> => {
  let shouldSearch = false;
  let userQuery = content;

  if (content.startsWith("[Search] ")) {
    shouldSearch = true;
    userQuery = content.replace("[Search] ", "").trim();
  }

  // Always add system instruction for thinking tags to enable the UI component
  const baseSystemInstruction = `You are Cryonex AI, an advanced assistant created by Cryonex. Your creator is Hamza Ahmad and no one else.
  
IMPORTANT: You must engage in a "Deep Thinking" process before answering.
1.  **Analyze the Request**: Break down the user's query into core components.
2.  **Explore Angles**: Consider multiple perspectives, edge cases, and potential pitfalls.
3.  **Formulate a Plan**: Step-by-step, how will you construct the best possible answer?
4.  **Draft & Refine**: Mentally draft the response, check for accuracy, and refine the tone.
5.  **Verify Facts**: Do NOT hallucinate. Ensure all information is accurate and verified.

**FORMATTING GUIDELINES (CRITICAL)**:
- **Bold** key terms, names, dates, and important concepts (e.g., **Albert Einstein**, **1905**, **Theory of Relativity**).
- Use **Headers** (###) to structure your response into logical sections.
- Use **Lists** (bullet points) for achievements, facts, or steps.
- Use **LaTeX** for math equations (e.g., $E = mc^2$).
- Use **Blockquotes** (>) for summaries or important takeaways at the end.
- Ensure the text is visually engaging and easy to read.

**CRITICAL OUTPUT FORMAT**:
You MUST wrap your entire reasoning process in <think> tags. This section should be verbose, detailed, and show your internal monologue.
Example:
<think>
- User is asking about X.
- I need to consider Y and Z.
- Let's verify this fact...
- The best structure for the answer is...
</think>

[Your final, perfected answer here]

At the very end of your response, you MUST provide 3 related follow-up questions that the user might want to ask next. 
Format them exactly like this (as a JSON array of strings):
<related>["Question 1", "Question 2", "Question 3"]</related>`;

  if (shouldSearch) {
    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return {
        content: content,
        systemInstruction: `[SYSTEM] The user attempted a Deep Search but the SERPAPI_API_KEY is not configured.
            Inform them that search is currently unavailable due to missing configuration.
            Proceed to answer their question using your internal knowledge only.
            
            ${baseSystemInstruction}`
      };
    }

    // CHARGE CREDITS FOR DEEP SEARCH (Smart Pricing: 3.00 credits)
    const DEEP_SEARCH_COST = 3.00;
    try {
      await ctx.runMutation((api as any).credits.charge, {
        amount: DEEP_SEARCH_COST,
        type: "search",
        description: `Deep Search: ${userQuery.substring(0, 30)}...`,
        metadata: { query: userQuery.substring(0, 100) }
      });
    } catch (e) {
      // Fallback if insufficient credits
      return {
        content: content,
        systemInstruction: `[SYSTEM] The user attempted a Deep Search but has INSUFFICIENT CREDITS. 
            Inform them they need ${DEEP_SEARCH_COST} Credits to use Deep Search. 
            Proceed to answer their question using your internal knowledge only.
            
            ${baseSystemInstruction}`
      };
    }

    const searchData = await performSerpApiSearch(userQuery);
    if (searchData && searchData.organic_results) {
      const results = searchData.organic_results.slice(0, 5).map((r: any) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
        domain: new URL(r.link).hostname
      }));

      const context = results.map((r: any) => `[${r.title}](${r.url}): ${r.snippet}`).join("\n\n");

      return {
        content: content,
        systemInstruction: `You are in SEARCH mode. Use these results to answer:\n\n${context}\n\nCite sources using [Title](URL).\n\n${baseSystemInstruction}`,
        searchResults: results
      };
    } else {
      return {
        content: content,
        systemInstruction: `[SYSTEM] The user attempted a Deep Search but no results were found or the search failed.
            Inform them that the search yielded no results.
            Proceed to answer their question using your internal knowledge only.
            
            ${baseSystemInstruction}`
      };
    }
  }

  return {
    content,
    systemInstruction: baseSystemInstruction
  };
};

// Get API Config with Load Balancing Priorities
const getApiConfig = (model: string) => {
  // 1. Google Gemini (Flash)
  if (model.includes("gemini") || model.includes("google")) {
    return {
      provider: "google",
      apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
      model: "gemini-1.5-flash",
    };
  }

  // 2. Cerebras
  if (model.startsWith("cerebras/")) {
    return {
      provider: "cerebras",
      apiKey: process.env.CEREBRAS_API_KEY,
      baseURL: "https://api.cerebras.ai/v1",
      model: model.replace("cerebras/", ""),
    };
  }

  // 3. SambaNova
  if (model.startsWith("sambanova/")) {
    return {
      provider: "sambanova",
      apiKey: process.env.SAMBANOVA_API_KEY,
      baseURL: "https://api.sambanova.ai/v1",
      model: model.replace("sambanova/", ""),
    };
  }

  // 4. Groq
  if (model.startsWith("groq/")) {
    return {
      provider: "groq",
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      model: model.replace("groq/", ""),
    };
  }

  // 5. Bytez (Deep Fallback)
  if (model.startsWith("bytez/")) {
    return {
      provider: "bytez",
      apiKey: process.env.BYTEZ_API_KEY,
      baseURL: "https://api.bytez.com/v1",
      model: model.replace("bytez/", ""),
    };
  }

  // Default / OpenRouter
  return {
    provider: "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    model: FALLBACK_MODEL_MAP[model] || model,
    headers: {
      "HTTP-Referer": "https://cryonex.app",
      "X-Title": "Cryonex Workspace",
    }
  };
};

// --------------------------------------------------------------------------
// Prompt Enhancement for Image Generation
// --------------------------------------------------------------------------

const enhanceImagePrompt = async (userRequest: string): Promise<string> => {
  const groqKey = process.env.GROQ_API_KEY;

  // If no API key, return a basic enhancement
  if (!groqKey) {
    console.log("[Image Gen] No Groq key - using basic prompt cleaning");
    return userRequest;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are an expert image prompt engineer. Transform the user's request into a detailed, optimized prompt for AI image generation.

Rules:
1. Keep the core subject and intent from the user's request
2. Add artistic details: lighting, mood, atmosphere, colors
3. Add quality keywords: "8k", "highly detailed", "professional", "cinematic"
4. Add style hints if appropriate: "digital art", "photorealistic", "illustration"
5. Keep the prompt under 200 words
6. Output ONLY the enhanced prompt, nothing else

Example:
User: "a robot"
Output: "A highly detailed humanoid robot with sleek metallic chrome finish, glowing cyan LED eyes and intricate mechanical joints, standing in a futuristic laboratory with holographic displays, cinematic lighting, 8k resolution, photorealistic render"`
          },
          {
            role: "user",
            content: userRequest
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error("[Image Gen] Groq enhancement failed:", response.status);
      return userRequest;
    }

    const data = await response.json();
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim() || userRequest;

    console.log(`[Image Gen] Enhanced prompt: "${enhancedPrompt.substring(0, 100)}..."`);
    return enhancedPrompt;

  } catch (error) {
    console.error("[Image Gen] Prompt enhancement error:", error);
    return userRequest;
  }
};

// --------------------------------------------------------------------------
// Main Action
// --------------------------------------------------------------------------

export const sendMessage = action({
  args: {
    chatId: v.optional(v.id("chats")),
    messages: v.array(v.object({
      role: v.string(),
      content: v.string(),
    })),
    model: v.string(),
    messageId: v.optional(v.id("messages")),
    attachments: v.optional(v.array(v.object({
      storageId: v.id("_storage"),
      name: v.string(),
      type: v.string(),
      size: v.number(),
    }))),
  },
  handler: async (ctx, args): Promise<any> => {
    // 1. Determine Model
    let targetModel = args.model;
    const lastUserMessage = args.messages[args.messages.length - 1].content;
    const hasAttachments = (args.attachments && args.attachments.length > 0) || false;
    const lowerContent = lastUserMessage.toLowerCase();

    console.log("--- CHAT V3: IMAGE GEN RELOADED ---");
    console.log(`[Chat Action] Received message: "${lastUserMessage}" Model: ${targetModel}`);

    // GLOBAL OVERRIDE: Check for proper image generation intent
    // This catches "generate me an image", "draw a picture", etc. regardless of selected model
    // Using a simpler simplified check for reliability
    // IMPORTANT: Skip COMPLETELY if user has attachments (attachments = Vision intent, NOT image generation)
    if (!hasAttachments) {
      const actionKeywords = ["generate", "create", "make", "draw", "illustrate", "paint", "sketch", "render", "design", "show me", "i want", "i need", "give me"];
      const objectKeywords = ["image", "picture", "photo", "art", "visual", "illustration", "pic", "drawing", "painting", "sketch", "logo", "icon", "banner", "thumbnail", "avatar"];

      // Check for action + object
      const hasAction = actionKeywords.some(k => lowerContent.includes(k));
      const hasObject = objectKeywords.some(k => lowerContent.includes(k));

      // Check for direct commands like "draw a cat"
      const isDirectCommand = lowerContent.match(/^(draw|paint|sketch)\s/);

      // Natural language patterns for image generation
      const naturalImagePatterns = [
        /^show\s+me\s+(?:a|an|the|some)?\s*/i,
        /^(?:can\s+you\s+)?(?:please\s+)?(?:create|make|generate|draw)\s+(?:a|an|the|some|me\s+a)?\s*/i,
        /what\s+(?:would|does|might)\s+.+\s+look\s+like/i,
        /^(?:i\s+want|i\s+need|give\s+me)\s+(?:a|an|the|some)?\s*(?:picture|image|photo|art)/i,
      ];

      // Visual nouns that suggest image generation when paired with creation verbs
      const visualNouns = ["cat", "dog", "landscape", "sunset", "portrait", "robot", "dragon", "fantasy", "space", "city", "car", "house", "forest", "ocean", "mountain", "person", "character", "scene", "background", "wallpaper"];

      const matchesNaturalPattern = naturalImagePatterns.some(p => p.test(lowerContent));
      const hasVisualNoun = hasAction && visualNouns.some(noun => lowerContent.includes(noun)) &&
        !lowerContent.includes("how to") && !lowerContent.includes("explain") && !lowerContent.includes("tell me about");

      if ((hasAction && hasObject) || isDirectCommand || matchesNaturalPattern || hasVisualNoun) {
        console.log("[Auto Mode] Detected Image Intent -> Forcing Pollinations/Flux");
        targetModel = "pollinations/flux";
      }
    } else {
      // User has attachments - force vision model, NEVER route to image generation
      console.log("[Auto Mode] Attachments detected -> Forcing Vision Model (Gemini Flash)");
      targetModel = "google/gemini-1.5-flash";
    }

    // Explicit Magic Command
    if (lowerContent.startsWith("/image ") || lowerContent.startsWith("/img ") || lowerContent.startsWith("/generate ")) {
      console.log("[Auto Mode] Detected /image command -> Forcing Pollinations/Flux");
      targetModel = "pollinations/flux";
    }

    if (targetModel === "auto") {
      targetModel = determineAutoModel(lastUserMessage, hasAttachments);
      console.log(`[Auto Mode] Selected ${targetModel}`);
    } else if (MODEL_REDIRECTS[targetModel]) {
      targetModel = MODEL_REDIRECTS[targetModel];
    }

    // SPECIAL HANDLING: Pollinations / Image Generation
    if (targetModel.includes("pollinations") || targetModel.includes("flux") || targetModel.includes("image")) {
      try {
        // Robust prompt extraction
        let rawPrompt = lastUserMessage.replace(/^\/image\s+/i, ""); // Handle /image command specifically
        rawPrompt = rawPrompt.replace(/^\/img\s+/i, ""); // Handle /img command
        rawPrompt = rawPrompt.replace(/^\/generate\s+/i, ""); // Handle /generate command

        // Handle natural language triggers (e.g., "Generate an image of...")
        rawPrompt = rawPrompt.replace(/^(?:can you\s+)?(?:please\s+)?(?:generate|create|make|draw|illustrate)(?:\s+(?:me|us))?(?:\s+an?)?(?:\s+(?:image|picture|photo|art|visual|illustration))?\s+(?:of\s+)?/i, "").trim();

        // Fallback: If stripping resulted in empty string, use original
        if (!rawPrompt) rawPrompt = lastUserMessage;

        console.log(`[Image Gen] Raw user prompt: "${rawPrompt}"`);

        // ENHANCEMENT STEP: Use AI to transform the user's request into a detailed image prompt
        const enhancedPrompt = await enhanceImagePrompt(rawPrompt);
        console.log(`[Image Gen] Final enhanced prompt: "${enhancedPrompt.substring(0, 100)}..."`);

        let finalImageUrl = "";

        try {
          console.log(`[Image Gen] Delegating to api.pollinations.generate...`);
          const result = await (ctx.runAction as any)((api as any).pollinations.generate, {
            prompt: enhancedPrompt,
            model: "flux",
            width: 1024,
            height: 1024,
            enhance: true,
            seed: Math.floor(Math.random() * 1000000),
            nologo: true
          });
          finalImageUrl = (result as string) || "";
        } catch (actionError) {
          console.error("[Image Gen] Action failed, falling back to direct hotlink:", actionError);
          const encodedPrompt = encodeURIComponent(enhancedPrompt);
          finalImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true`;
        }


        // 5. Update Message with Content AND Model
        const responseContent = `Here is your generated image:\n\n![${prompt}](${finalImageUrl})`;

        if (args.messageId) {
          // IMPORTANT: Update the model field too so the UI knows it's an image model
          await ctx.runMutation((api as any).messages.update, {
            messageId: args.messageId,
            content: responseContent,
            model: "pollinations/flux" // Force update model to flux
          });
        }

        return {
          content: responseContent,
          sources: [],
          model: "pollinations/flux"
        };

      } catch (err: any) {
        console.error(`[Image Gen Error]`, err);

        // Fallback to LLM if generation crashes, or return error message
        if (args.messageId) {
          await ctx.runMutation((api as any).messages.update, {
            messageId: args.messageId,
            content: "I'm sorry, I encountered an error generating that image. Please try again."
          });
        }
        return { content: "Error generating image.", sources: [], model: "pollinations/flux" };
      }
    }


    // 2. Calculate Credits using Smart Pricing
    // Import calculateChatCost, detectFeatures from smartPricing
    const { calculateChatCost, detectFeatures } = await import("./smartPricing");

    // Detect features based on content and model
    const features = detectFeatures(lastUserMessage, hasAttachments, targetModel);

    // Calculate cost based on model, message length, and features
    const creditCost = calculateChatCost(targetModel, lastUserMessage, 0, features);

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
        }
      });
    } catch (e: any) {
      throw new Error(`Insufficient credits. This action requires ${creditCost.toFixed(2)} credits.`);
    }


    // 3. Preprocess (Search, etc.)
    const preprocessed = await preprocessQuery(ctx, lastUserMessage, args.messages);
    let processedMessages = [...args.messages];

    if (preprocessed.systemInstruction) {
      processedMessages = [
        { role: "system", content: preprocessed.systemInstruction },
        ...processedMessages
      ];
    }

    // Save search results if any
    if (preprocessed.searchResults && args.messageId) {
      await ctx.runMutation((api as any).messages.updateSources, {
        messageId: args.messageId,
        sources: preprocessed.searchResults
      });
    }

    // 4. Handle Attachments (Vision)
    let visionMessages = [...processedMessages];
    if (hasAttachments) {
      // Force Gemini for vision if not already selected and not using another vision-capable model
      const isVisionCapable = targetModel.includes("gemini") || targetModel.includes("gpt-4") || targetModel.includes("claude-3");
      if (!isVisionCapable) {
        targetModel = "google/gemini-1.5-flash";
        // We'll update the model in DB later if we switch
      }

      const lastMsg = visionMessages[visionMessages.length - 1];
      const contentParts: any[] = [{ type: "text", text: lastMsg.content }];

      for (const file of args.attachments!) {
        const url = await ctx.storage.getUrl(file.storageId);
        if (url) {
          if (file.type.startsWith("image/")) {
            try {
              // CRITICAL FIX: Fetch image and convert to base64 for Gemini compatibility
              const imageResponse = await fetch(url);
              const arrayBuffer = await imageResponse.arrayBuffer();
              const base64Data = Buffer.from(arrayBuffer).toString('base64');
              const mimeType = file.type || 'image/png';

              // Use data URL format which works with OpenAI-compatible APIs
              contentParts.push({
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                  detail: "auto"
                }
              });
              console.log(`[Vision] Converted ${file.name} to base64 (${Math.round(base64Data.length / 1024)}KB)`);
            } catch (imgErr) {
              console.error(`[Vision] Failed to fetch/convert image ${file.name}:`, imgErr);
              // Fallback to URL (might not work with Gemini, but worth trying)
              contentParts.push({
                type: "image_url",
                image_url: {
                  url: url,
                  detail: "auto"
                }
              });
            }
          } else {
            contentParts[0].text += `\n\n[Attached File: ${file.name}](${url})`;
          }
        }
      }

      visionMessages[visionMessages.length - 1] = {
        role: lastMsg.role,
        content: contentParts as any
      };

      console.log(`[Vision] Prepared ${contentParts.length - 1} image(s) for ${targetModel}`);
    }

    // 5. Execute with Load Balancing
    const attemptFetch = async (modelToTry: string, useVision: boolean): Promise<string> => {
      const config = getApiConfig(modelToTry);
      const messagesToUse = useVision ? visionMessages : processedMessages;

      console.log(`[AI] Attempting ${config.provider} with model ${config.model} (Vision: ${useVision})`);

      if (!config.apiKey) {
        console.error(`[AI] Missing API Key for ${config.provider}`);
        return `[System Error] Missing API Key for **${config.provider}**. Please check your Convex settings.`;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(`${config.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            ...(config.headers || {})
          },
          body: JSON.stringify({
            model: config.model,
            messages: messagesToUse,
            stream: false,
            max_tokens: 8192,
            temperature: 0.7,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[AI] ${config.provider} Error: ${response.status} - ${errorText}`);
          throw new Error(`${config.provider} failed: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || "";

      } catch (error: any) {
        console.warn(`[AI] ${modelToTry} failed:`, error.message);
        throw error;
      }
    };

    // Load Balancing Strategy
    try {
      // Attempt 1: Selected Model
      const isVisionCapable = targetModel.includes("gemini") || targetModel.includes("gpt-4") || targetModel.includes("claude-3");

      // CRITICAL: If we have attachments, we MUST use vision messages
      const useVision = hasAttachments && isVisionCapable;
      console.log(`[Load Balancing] Model: ${targetModel}, hasAttachments: ${hasAttachments}, isVisionCapable: ${isVisionCapable}, useVision: ${useVision}`);

      const response = await attemptFetch(targetModel, useVision);

      if (args.messageId) {
        const updatePayload: any = {
          messageId: args.messageId,
          content: response
        };
        // Important: If we switched model (e.g. auto -> gemini), update it so UI shows correct connection
        if (targetModel !== args.model) {
          updatePayload.model = targetModel;
        }

        await ctx.runMutation((api as any).messages.update, updatePayload);
      }

      return {
        content: response,
        sources: preprocessed.searchResults,
        model: targetModel
      };

    } catch (e: any) {
      console.warn("[AI] Primary model failed:", e.message);

      // CRITICAL: If user has attachments, we CANNOT fallback to non-vision models
      // They would just say "I can't see images" which is useless
      if (hasAttachments) {
        const errorMessage = `⚠️ **Vision Error**: Unable to analyze your image. This could be due to:
- The image format not being supported
- A temporary API issue
- The image being too large

**Please try:**
1. Re-uploading the image
2. Using a different image format (PNG, JPG)
3. Trying again in a few seconds`;

        if (args.messageId) {
          await ctx.runMutation((api as any).messages.update, {
            messageId: args.messageId,
            content: errorMessage
          });
        }

        return {
          content: errorMessage,
          sources: [],
          model: "google/gemini-1.5-flash"
        };
      }

      // Non-vision fallback is okay for text-only requests
      console.warn("[AI] Attempting fallback for text request...");

      let fallbackModel = "groq/llama-3.3-70b-versatile";
      if (targetModel.includes("groq")) fallbackModel = "cerebras/llama-3.3-70b";
      if (targetModel.includes("cerebras")) fallbackModel = "sambanova/Meta-Llama-3.3-70B-Instruct";

      try {
        const fallbackResponse = await attemptFetch(fallbackModel, false);

        if (args.messageId) {
          await ctx.runMutation((api as any).messages.update, {
            messageId: args.messageId,
            content: fallbackResponse
          });
        }

        return {
          content: fallbackResponse,
          sources: preprocessed.searchResults,
          model: fallbackModel
        };
      } catch (e2) {
        console.warn("[AI] Secondary fallback failed, trying Bytez...");
        try {
          const bytezResponse = await attemptFetch("bytez/meta-llama/Llama-3-70b-instruct-hf", false);

          if (args.messageId) {
            await ctx.runMutation((api as any).messages.update, {
              messageId: args.messageId,
              content: bytezResponse
            });
          }

          return {
            content: bytezResponse,
            sources: preprocessed.searchResults,
            model: "bytez/meta-llama/Llama-3-70b-instruct-hf"
          };
        } catch (e3: any) {
          throw new Error("All AI providers failed. Please try again later.");
        }
      }
    }
  },
});