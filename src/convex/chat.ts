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
  "gemini-pro": "google/gemini-2.5-flash-lite", // User requested default
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
    return "google/gemini-2.5-flash-lite"; // Reliable vision model
  }

  // 2. Image Generation Intent -> Pollinations Flux
  // Must be explicit: "generate/create/draw" AND "image/picture/photo"
  // OR use natural language patterns
  const actionKeywords = ["generate", "create", "make", "draw", "illustrate", "paint", "sketch", "render", "design", "show me", "i want", "i need", "give me"];
  const objectKeywords = ["image", "picture", "photo", "art", "visual", "illustration", "pic", "drawing", "painting", "sketch", "logo", "icon", "banner", "thumbnail", "avatar"];

  const hasAction = actionKeywords.some(k => lowerContent.includes(k));
  const hasObject = objectKeywords.some(k => lowerContent.includes(k));

  if (hasAction && hasObject) {
    return "pollinations/gptimage";
  }

  // Specific catch for just "/image" or "can you draw..." or "draw me a..."
  if (lowerContent.startsWith("/image") || lowerContent.includes("can you draw") || lowerContent.match(/^(draw|paint|sketch)\s/)) {
    return "pollinations/gptimage";
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
      return "pollinations/gptimage";
    }
  }

  // Check for "show me [visual noun]" or "create [visual noun]"
  if (hasAction && visualNouns.some(noun => lowerContent.includes(noun))) {
    // Additional check: avoid triggering on "show me how to" or "explain"
    if (!lowerContent.includes("how to") && !lowerContent.includes("explain") && !lowerContent.includes("tell me about")) {
      return "pollinations/gptimage";
    }
  }

  // 3. Huge Context -> Gemini Flash
  if (length > 10000) {
    return "google/gemini-2.5-flash-lite";
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
    return "google/gemini-2.5-flash-lite";
  }

  // 6. Short / Simple -> Groq (Llama 8B - Instant)
  return "google/gemini-2.5-flash-lite";
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

  // 1. Explicit Search Trigger
  if (content.startsWith("[Search] ")) {
    shouldSearch = true;
    userQuery = content.replace("[Search] ", "").trim();
  }

  // 2. Smart Search Detection (Auto-Trigger)
  // Triggers on: "latest", "news", "current", "today", "price of", "who is", "weather", "stock"
  if (!shouldSearch) {
    const searchTriggers = [
      /latest\s/i, /current\s/i, /news\s/i, /today/i, /now/i,
      /price\s+of/i, /stock/i, /weather/i, /who\s+won/i, /when\s+is/i,
      /release\s+date/i, /upcoming/i, /recent/i, /events/i
    ];
    if (searchTriggers.some(t => t.test(content))) {
      console.log("[Smart Search] Detected search intent automatically.");
      shouldSearch = true;
    }
  }

  // Current Date Context
  const today = new Date().toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Always add system instruction for thinking tags to enable the UI component
  const baseSystemInstruction = `You are Cryonex AI, an advanced assistant created by Cryonex. Your creator is Hamza Ahmad and no one else.
  
Current Date: ${today}

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
      // If auto-search triggered but no key, just proceed normally without error message to user
      // unless it was EXPLICIT [Search] request
      if (content.startsWith("[Search] ")) {
        return {
          content: content,
          systemInstruction: `[SYSTEM] The user attempted a Deep Search but the SERPAPI_API_KEY is not configured.
              Inform them that search is currently unavailable due to missing configuration.
              Proceed to answer their question using your internal knowledge only.
              
              ${baseSystemInstruction}`
        };
      }
      // For auto-search, just ignore usage if no key
      return {
        content,
        systemInstruction: baseSystemInstruction
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
      if (content.startsWith("[Search] ")) {
        return {
          content: content,
          systemInstruction: `[SYSTEM] The user attempted a Deep Search but has INSUFFICIENT CREDITS. 
                Inform them they need ${DEEP_SEARCH_COST} Credits to use Deep Search. 
                Proceed to answer their question using your internal knowledge only.
                
                ${baseSystemInstruction}`
        };
      }
      // For auto-search, silently fail back to normal
      return {
        content,
        systemInstruction: baseSystemInstruction
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

      const context = results.map((r: any) => `Source: [${r.title}](${r.url})\nSummary: ${r.snippet}`).join("\n\n");

      return {
        content: content,
        systemInstruction: `You are in SEARCH mode. 
        
SEARCH RESULTS (Real-time Data):
${context}

INSTRUCTIONS:
1. Answer the user's query using ONLY the information from the Search Results above.
2. If the answer is not in the results, state that clearly.
3. Cite your sources using markdown links [Source Name](URL).
4. Prioritize this real-time data over your internal knowledge cut-off.
5. Today's Date: ${today}

${baseSystemInstruction}`,
        searchResults: results
      };
    } else {
      if (content.startsWith("[Search] ")) {
        return {
          content: content,
          systemInstruction: `[SYSTEM] The user attempted a Deep Search but no results were found.
                Inform them that the search yielded no results.
                Proceed to answer using internal knowledge.
                
                ${baseSystemInstruction}`
        };
      }
      // Auto-search silent fail
      return {
        content,
        systemInstruction: baseSystemInstruction
      };
    }
  }

  return {
    content,
    systemInstruction: baseSystemInstruction
  };
};

// Native Gemini Vision API - More reliable than OpenAI compatibility layer
const callGeminiVision = async (
  prompt: string,
  imageBase64: string,
  mimeType: string,
  systemInstruction?: string
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: mimeType,
            data: imageBase64
          }
        },
        {
          text: prompt
        }
      ]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    }
  };

  if (systemInstruction) {
    requestBody.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  console.log(`[Gemini Vision] Calling native API with ${Math.round(imageBase64.length / 1024)}KB image`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Gemini Vision] Error: ${response.status} - ${errorText}`);
    throw new Error(`Gemini Vision failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  console.log(`[Gemini Vision] Success - ${text.length} chars response`);
  return text;
};

// Get API Config with Load Balancing Priorities
const getApiConfig = (model: string, isVision: boolean = false, forceProvider?: string) => {
  // 1. Google Gemini 2.5 Flash Lite - Official API with vision support
  // 1. Google Gemini 2.5 Flash Lite - Default to Pollinations, Fallback to Google (handled in caller)
  if (model.includes("gemini") || model.includes("google")) {
    // Check for forced provider (Fallback scenario)
    if (forceProvider === "google") {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (apiKey) {
        console.log(`[API Config] Using Gemini 2.5 Flash Lite (Official API)`);
        return {
          provider: "google",
          apiKey: apiKey,
          baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
          model: "gemini-2.5-flash-lite",
        };
      }
    }

    // Default: Pollinations AI
    console.log("[API Config] Using Pollinations AI for Gemini (Primary)");
    return {
      provider: "pollinations",
      apiKey: "dummy",
      baseURL: "https://text.pollinations.ai/openai",
      model: "gemini",
      headers: {
        "HTTP-Referer": "https://cryonex.app",
        "X-Title": "Cryonex Workspace",
      }
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
        console.log("[Auto Mode] Detected Image Intent -> Forcing Pollinations/GPT Image");
        targetModel = "pollinations/gptimage";
      }
    } else {
      // User has attachments - force vision model, NEVER route to image generation
      console.log("[Auto Mode] Attachments detected -> Forcing Vision Model (Gemini Flash Lite)");
      targetModel = "google/gemini-2.5-flash-lite";
    }

    // Explicit Magic Command
    if (lowerContent.startsWith("/image ") || lowerContent.startsWith("/img ") || lowerContent.startsWith("/generate ")) {
      console.log("[Auto Mode] Detected /image command -> Forcing Pollinations/GPT Image");
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
      const editKeywords = ["edit", "modify", "change", "make", "turn", "transform", "add", "remove", "replace", "colorize", "filter", "style"];
      const isEditIntent = editKeywords.some(k => lowerContent.includes(k));

      if (isEditIntent) {
        console.log("[Auto Mode] Detected Image Edit Intent -> Delegating to Pollinations Kontext");

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
            let editPrompt = lastUserMessage;
            // Remove common prefixes to get to the core instruction
            const prefixes = ["edit this image to", "make this image", "change this to", "turn this into", "add", "remove"];

            console.log(`[Image Edit] Editing image: ${sourceImageUrl} with prompt: "${editPrompt}"`);

            const editedImageUrl = await (ctx.runAction as any)((api as any).pollinations.edit, {
              prompt: editPrompt,
              image: sourceImageUrl,
              model: "kontext",
              width: 1024,
              height: 1024,
              nologo: true
            });

            const responseContent = `Here is your edited image:\n\n![${editPrompt}](${editedImageUrl})`;

            if (args.messageId) {
              await ctx.runMutation((api as any).messages.update, {
                messageId: args.messageId,
                content: responseContent,
                model: "pollinations/kontext"
              });
            }

            return {
              content: responseContent,
              sources: [],
              model: "pollinations/kontext"
            };

          } catch (err: any) {
            console.error("[Image Edit Error]", err);
            // Fallthrough to standard logic if edit fails, or return error
            if (args.messageId) {
              await ctx.runMutation((api as any).messages.update, {
                messageId: args.messageId,
                content: "I'm sorry, I encountered an error editing that image. Please try again."
              });
            }
            return { content: "Error editing image.", sources: [], model: "pollinations/kontext" };
          }
        }
      }
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
            model: "gptimage",
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
          finalImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=gptimage&nologo=true`;
        }


        // 5. Update Message with Content AND Model
        const responseContent = `Here is your generated image:\n\n![${rawPrompt}](${finalImageUrl})`;

        if (args.messageId) {
          // IMPORTANT: Update the model field too so the UI knows it's an image model
          await ctx.runMutation((api as any).messages.update, {
            messageId: args.messageId,
            content: responseContent,
            model: "pollinations/gptimage" // Force update model to gptimage
          });
        }

        return {
          content: responseContent,
          sources: [],
          model: "pollinations/gptimage"
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
        return { content: "Error generating image.", sources: [], model: "pollinations/gptimage" };
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

    // 4. Handle Attachments (Vision) - Use Native Gemini API
    let imageBase64Data: string | null = null;
    let imageMimeType: string = "image/png";

    if (hasAttachments) {
      // Force Gemini for vision
      targetModel = "google/gemini-2.5-flash-lite";

      // Extract first image for native Gemini vision call
      for (const file of args.attachments!) {
        if (file.type.startsWith("image/")) {
          try {
            const url = await ctx.storage.getUrl(file.storageId);
            if (url) {
              const imageResponse = await fetch(url);
              const arrayBuffer = await imageResponse.arrayBuffer();
              imageBase64Data = Buffer.from(arrayBuffer).toString('base64');
              imageMimeType = file.type || 'image/png';
              console.log(`[Vision] Loaded ${file.name} as base64 (${Math.round(imageBase64Data.length / 1024)}KB)`);
              break; // Use first image only for now
            }
          } catch (imgErr) {
            console.error(`[Vision] Failed to load image ${file.name}:`, imgErr);
          }
        }
      }

      // If we have an image, use native Gemini Vision API directly
      if (imageBase64Data) {
        try {
          console.log(`[Vision] Using native Gemini Vision API for image analysis`);
          const visionResponse = await callGeminiVision(
            lastUserMessage,
            imageBase64Data,
            imageMimeType,
            preprocessed.systemInstruction
          );

          // Update the message with the response
          if (args.messageId) {
            await ctx.runMutation((api as any).messages.update, {
              messageId: args.messageId,
              content: visionResponse,
              model: "google/gemini-2.5-flash-lite"
            });
          }

          return {
            content: visionResponse,
            sources: preprocessed.searchResults,
            model: "google/gemini-2.5-flash-lite"
          };
        } catch (visionError: any) {
          console.error(`[Vision] Native Gemini API failed:`, visionError.message);
          // Return error to user instead of falling back to non-vision model
          const errorMessage = `⚠️ **Vision Error**: ${visionError.message}\n\nPlease check that GEMINI_API_KEY is configured in Convex.`;

          if (args.messageId) {
            await ctx.runMutation((api as any).messages.update, {
              messageId: args.messageId,
              content: errorMessage
            });
          }

          return {
            content: errorMessage,
            sources: [],
            model: "google/gemini-2.5-flash-lite"
          };
        }
      }
    }

    // 5. Execute with Load Balancing (Vision is handled separately above)
    const attemptFetch = async (modelToTry: string, useVision: boolean, forceProvider?: string): Promise<string> => {
      const config = getApiConfig(modelToTry, useVision, forceProvider);
      const messagesToUse = processedMessages; // Vision requests are handled via native API above

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

      let response: string;
      try {
        response = await attemptFetch(targetModel, useVision);
      } catch (primaryError: any) {
        // Fallback for Gemini: If Pollinations fails, try Google Official
        if ((targetModel.includes("gemini") || targetModel.includes("google")) && !useVision) {
          console.warn(`[Load Balancing] Primary (Pollinations) failed for Gemini. Falling back to Google Official API...`);
          console.warn(`Error was: ${primaryError.message}`);
          response = await attemptFetch(targetModel, useVision, "google");
        } else {
          throw primaryError;
        }
      }

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
          model: "google/gemini-2.5-flash-lite"
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