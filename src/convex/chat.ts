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

  // 1. Attachments / Huge Context -> Gemini Flash (1M Context)
  if (hasAttachments || length > 10000) {
    return "google/gemini-1.5-flash";
  }

  // 2. Complex Reasoning / Math / Coding -> SambaNova (Llama 405B/70B)
  const complexityKeywords = [
    "code", "function", "script", "debug", "fix", "analyze", "reason",
    "explain", "why", "how", "compare", "difference", "summary", "summarize",
    "essay", "article", "blog", "creative", "story", "react", "typescript",
    "convex", "database", "schema", "architecture", "solve", "math", "calculus"
  ];

  if (complexityKeywords.some(k => lowerContent.includes(k))) {
    return "sambanova/Meta-Llama-3.1-405B-Instruct";
  }

  // 3. Medium Length -> Cerebras (Llama 70B - Fast)
  if (length > 200) {
    return "cerebras/llama-3.3-70b";
  }

  // 4. Short / Simple -> Groq (Llama 8B - Instant)
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

// Helper to detect search intent (using fast Groq model)
const detectSearchIntent = async (lastMessage: string): Promise<boolean> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: `Analyze if the user's last message requires an external web search. Return JSON: { "shouldSearch": boolean }` },
          { role: "user", content: lastMessage }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0]?.message?.content);
    return !!parsed.shouldSearch;
  } catch {
    return false;
  }
};

// Pre-processing filter
const preprocessQuery = async (ctx: any, content: string, messages: any[] = []): Promise<{ content: string; systemInstruction?: string; searchResults?: any[] }> => {
  let shouldSearch = false;
  let userQuery = content;

  if (content.startsWith("[Search] ")) {
    shouldSearch = true;
    userQuery = content.replace("[Search] ", "").trim();
  } else {
    // Only auto-search if explicitly enabled or highly likely (saving costs)
    // For now, we are conservative to save SerpAPI credits
    // shouldSearch = await detectSearchIntent(content); 
  }

  // Always add system instruction for thinking tags to enable the UI component
  const baseSystemInstruction = `You are Cryonex AI, an advanced assistant created by Cryonex. Your creator is Hamza Ahmad and no one else.
  
IMPORTANT: You must engage in a "Deep Thinking" process before answering.
1.  **Analyze the Request**: Break down the user's query into core components.
2.  **Explore Angles**: Consider multiple perspectives, edge cases, and potential pitfalls.
3.  **Formulate a Plan**: Step-by-step, how will you construct the best possible answer?
4.  **Draft & Refine**: Mentally draft the response, check for accuracy, and refine the tone.
5.  **Verify Facts**: Do NOT hallucinate. Ensure all information is accurate and verified.

**CRITICAL OUTPUT FORMAT**:
You MUST wrap your entire reasoning process in <think> tags. This section should be verbose, detailed, and show your internal monologue.
Example:
<think>
- User is asking about X.
- I need to consider Y and Z.
- Let's verify this fact...
- The best structure for the answer is...
</think>

[Your final, perfected answer here]`;

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

    if (targetModel === "auto") {
      targetModel = determineAutoModel(lastUserMessage, hasAttachments);
      console.log(`[Auto Mode] Selected ${targetModel}`);
    } else if (MODEL_REDIRECTS[targetModel]) {
      targetModel = MODEL_REDIRECTS[targetModel];
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
    if (hasAttachments) {
      // Force Gemini for vision if not already selected and not using another vision-capable model
      const isVisionCapable = targetModel.includes("gemini") || targetModel.includes("gpt-4") || targetModel.includes("claude-3");
      if (!isVisionCapable) {
        targetModel = "google/gemini-1.5-flash";
      }

      const lastMsg = processedMessages[processedMessages.length - 1];

      // Construct the content array for the last message
      // We use 'any' type here because the Convex schema enforces string, 
      // but the OpenAI API supports an array of content parts.
      const contentParts: any[] = [
        { type: "text", text: lastMsg.content }
      ];

      for (const file of args.attachments!) {
        const url = await ctx.storage.getUrl(file.storageId);
        if (url) {
          if (file.type.startsWith("image/")) {
            contentParts.push({
              type: "image_url",
              image_url: {
                url: url
              }
            });
          } else {
            // For non-image files, append as a link to the text part
            contentParts[0].text += `\n\n[Attached File: ${file.name}](${url})`;
          }
        }
      }

      // Update the last message with the structured content
      (processedMessages as any)[processedMessages.length - 1] = {
        role: lastMsg.role,
        content: contentParts
      };
    }

    // 5. Execute with Load Balancing
    const attemptFetch = async (modelToTry: string): Promise<string> => {
      const config = getApiConfig(modelToTry);

      console.log(`[AI] Attempting ${config.provider} with model ${config.model}`);
      console.log(`[AI] API Key present: ${!!config.apiKey}`);

      if (!config.apiKey) {
        console.error(`[AI] Missing API Key for ${config.provider}`);
        // Return a friendly error message to the chat instead of throwing
        return `[System Error] Missing API Key for **${config.provider}**. 
        
Please ensure you have set the corresponding API key (e.g., \`OPENROUTER_API_KEY\`, \`GEMINI_API_KEY\`) in your Convex Dashboard settings.
        
Current Model: \`${config.model}\`
Provider: \`${config.provider}\``;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        const response = await fetch(`${config.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${config.apiKey}`,
            "Content-Type": "application/json",
            ...(config.headers || {})
          },
          body: JSON.stringify({
            model: config.model,
            messages: processedMessages,
            stream: false,
            max_tokens: 8192, // Increased for Deep Thinking
            temperature: 0.7,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[AI] Provider ${config.provider} failed: ${response.status} - ${errorText}`);
          throw new Error(`Provider ${config.provider} failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`[AI] Success from ${config.provider}`);
        const rawContent = data.choices[0]?.message?.content || "";
        console.log(`[AI] Raw Content Preview: ${rawContent.substring(0, 200)}...`);
        return rawContent;

      } catch (error) {
        console.warn(`[AI] Failed with ${modelToTry}:`, error);
        throw error;
      }
    };

    // Load Balancing Strategy
    try {
      // Attempt 1: Selected Model
      console.log(`[AI] Starting request for ${targetModel}`);
      const response = await attemptFetch(targetModel);

      // Save response to database if messageId is provided
      if (args.messageId) {
        await ctx.runMutation((api as any).messages.update, {
          messageId: args.messageId,
          content: response
        });
      }

      return {
        content: response,
        sources: preprocessed.searchResults
      };

    } catch (e) {
      console.warn("[AI] Primary model failed, attempting fallback...");

      // Attempt 2: Fallback (Cerebras -> Groq -> Bytez)
      let fallbackModel = "groq/llama-3.3-70b-versatile";
      if (targetModel.includes("groq")) fallbackModel = "cerebras/llama-3.3-70b";
      if (targetModel.includes("cerebras")) fallbackModel = "sambanova/Meta-Llama-3.1-405B-Instruct";

      try {
        const fallbackResponse = await attemptFetch(fallbackModel);

        if (args.messageId) {
          await ctx.runMutation((api as any).messages.update, {
            messageId: args.messageId,
            content: fallbackResponse
          });
        }

        return {
          content: fallbackResponse,
          sources: preprocessed.searchResults
        };
      } catch (e2) {
        console.warn("[AI] Secondary fallback failed, trying Bytez...");
        // Attempt 3: Bytez (Deep Fallback)
        try {
          const bytezResponse = await attemptFetch("bytez/meta-llama/Llama-3-70b-instruct-hf");

          if (args.messageId) {
            await ctx.runMutation((api as any).messages.update, {
              messageId: args.messageId,
              content: bytezResponse
            });
          }

          return {
            content: bytezResponse,
            sources: preprocessed.searchResults
          };
        } catch (e3) {
          throw new Error("All AI providers failed. Please try again later.");
        }
      }
    }
  },
});