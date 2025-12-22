"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const FALLBACK_MODEL_MAP: Record<string, string> = {
  "gpt-4-turbo": "openai/gpt-4-turbo",
  "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
  "deepseek-v3.1": "deepseek/deepseek-chat",
  "deepseek-v3.2": "deepseek/deepseek-chat",
  "claude-3-opus": "anthropic/claude-3-opus",
  "claude-3-sonnet": "anthropic/claude-3-sonnet",
  "claude-3-haiku": "anthropic/claude-3-haiku",
  "glm-4.5": "zhipu/glm-4",
  "glm-4.6": "zhipu/glm-4",
};

const MODEL_REDIRECTS: Record<string, string> = {
  "sambanova/Meta-Llama-3.1-405B-Instruct": "sambanova/Meta-Llama-3.3-70B-Instruct",
};

// Helper to determine model for Auto mode
const determineAutoModel = (content: string): string => {
  const lowerContent = content.toLowerCase();
  const length = content.length;

  // Complex keywords indicating need for reasoning/coding
  const complexKeywords = [
    "code", "function", "script", "debug", "fix", "analyze", "reason",
    "explain", "why", "how", "compare", "difference", "summary", "summarize",
    "essay", "article", "blog", "creative", "story", "react", "typescript",
    "convex", "database", "schema", "architecture"
  ];

  const hasComplexKeyword = complexKeywords.some(k => lowerContent.includes(k));

  // Tier 3: High Complexity (Coding, Reasoning, Long Content)
  if (length > 500 || hasComplexKeyword) {
    return "sambanova/DeepSeek-R1-Distill-Llama-70B"; // Top tier reasoning/coding (Free)
  }

  // Tier 2: Medium Complexity (General questions, moderate length)
  if (length > 100) {
    return "groq/llama-3.3-70b-versatile"; // Fast but capable
  }

  // Tier 1: Low Complexity (Short, factual, greetings)
  return "groq/llama-3.1-8b-instant"; // Ultra fast
};

// Helper to perform SerpAPI Search
const performSerpApiSearch = async (query: string) => {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    console.error("[SerpAPI] SERPAPI_API_KEY is missing from Convex Environment Variables.");
    return null;
  }

  console.log(`[SerpAPI] Calling API for query: "${query}"`);

  try {
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&engine=google`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SerpAPI] API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    // Extract organic results
    return data.organic_results || [];
  } catch (error) {
    console.error("[SerpAPI] Request failed:", error);
    return null;
  }
};

// Helper to generate related queries using a fast LLM
const generateSearchQueries = async (userPrompt: string): Promise<string[]> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.log("[Deep Search] No Groq key, using raw prompt");
    return [userPrompt];
  }

  try {
    console.log("[Deep Search] Generating queries with Groq...");
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are an expert search query generator. Your goal is to generate 1-3 specific, high-quality Google search queries that will gather the necessary information to answer the user's request comprehensively.
            
            Rules:
            1. Analyze the user's intent.
            2. If the user asks about themselves (e.g., "my profile"), generate queries to find public info if possible, or generic best practices.
            3. Return ONLY a JSON object with a "queries" key containing an array of strings.
            4. Do not include numbering or bullets.`
          },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    let queries: string[] = [];
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed.queries)) {
        queries = parsed.queries;
      } else if (Array.isArray(parsed)) {
        queries = parsed;
      }
    } catch (parseError) {
      console.warn("[Deep Search] Failed to parse JSON, falling back to text split", content);
      queries = content.split("\n").filter((q: string) => q.trim().length > 0);
    }

    // Fallback if empty
    if (queries.length === 0) queries = [userPrompt];

    return queries.slice(0, 3); // Limit to 3 queries
  } catch (error) {
    console.error("[Deep Search] Query generation failed:", error);
    return [userPrompt];
  }
};

// Helper to detect search intent
const detectSearchIntent = async (lastMessage: string, history: any[]): Promise<boolean> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return false;

  try {
    // Simplified history for context (last 2 turns)
    const context = history.slice(-2).map(m => `${m.role}: ${m.content}`).join("\n");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `Analyze if the user's last message requires an external web search to answer correctly.
            Return JSON: { "shouldSearch": boolean }
            
            Criteria for True:
            - Asking for current events, news, weather, stock prices.
            - Asking for facts that might have changed recently.
            - Asking about specific people, companies, or products (unless very famous/historical).
            - Asking for "latest" or "recent" info.
            - Explicitly asking to "search" or "find".
            - Questions where the answer is likely not in the LLM's training data (e.g. specific local info).
            
            Criteria for False:
            - Coding questions (unless about a new library version).
            - Creative writing.
            - General knowledge / historical facts.
            - Greetings / chit-chat.
            - References to previous conversation context (unless asking to verify it).`
          },
          { role: "user", content: `Context:\n${context}\n\nLast Message: ${lastMessage}` }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0]?.message?.content);
    return !!parsed.shouldSearch;
  } catch (e) {
    console.error("Intent detection failed:", e);
    return false;
  }
};

// Pre-processing filter to detect specific queries and inject instructions
const preprocessQuery = async (content: string, messages: any[] = []): Promise<{ content: string; systemInstruction?: string; searchResults?: any[] }> => {
  const lowerContent = content.toLowerCase();
  let shouldSearch = false;
  let userQuery = content;

  // 1. Explicit Search
  if (content.startsWith("[Search] ")) {
    shouldSearch = true;
    userQuery = content.replace("[Search] ", "").trim();
  }
  // 2. Auto-Search Detection
  else {
    shouldSearch = await detectSearchIntent(content, messages);
    if (shouldSearch) {
      console.log(`[Auto-Search] Intent detected for: "${content}"`);
    }
  }

  // Deep Search Integration (SerpAPI)
  if (shouldSearch) {
    console.log(`[Deep Search] Detected query: "${userQuery}"`);

    // 1. Generate Intelligent Queries
    const queries = await generateSearchQueries(userQuery);
    console.log(`[Deep Search] Generated queries: ${JSON.stringify(queries)}`);

    // 2. Parallel Search
    const resultsPromises = queries.map(q => performSerpApiSearch(q));
    const resultsArrays = await Promise.all(resultsPromises);

    // 3. Aggregate & Deduplicate
    const allResults = resultsArrays.flat().filter(r => r !== null);
    const uniqueResults = new Map();

    allResults.forEach((result: any) => {
      if (result && result.link && !uniqueResults.has(result.link)) {
        uniqueResults.set(result.link, {
          title: result.title,
          url: result.link,
          snippet: result.snippet,
          domain: new URL(result.link).hostname
        });
      }
    });

    const aggregatedResults = Array.from(uniqueResults.values()).slice(0, 8); // Top 8 unique results
    console.log(`[Deep Search] Found ${aggregatedResults.length} unique results.`);

    if (aggregatedResults.length > 0) {
      const context = aggregatedResults.map((result: any) =>
        `Title: ${result.title}\nURL: ${result.url}\nSnippet: ${result.snippet}`
      ).join("\n\n");

      return {
        content: content,
        systemInstruction: `You are in DEEP SEARCH mode. The user asked: "${userQuery}".
        
        Here are the real-time search results from Google (SerpAPI):
        
        ${context}
        
        Instructions:
        1. Answer the user's question comprehensively using the provided search results.
        2. CITE your sources using [Title](URL) format inline.
        3. If the search results don't fully answer the question, use your general knowledge but mention that search results were limited.`,
        searchResults: aggregatedResults // Pass to sendMessage for saving
      };
    } else {
      // DEBUGGING
      const apiKey = process.env.SERPAPI_API_KEY;
      const keyStatus = apiKey ? `Present` : "Missing";

      return {
        content: content,
        systemInstruction: `You are in DEEP SEARCH mode. The user asked: "${userQuery}".
        
        Unfortunately, the search returned no results.
        
        DEBUG INFO:
        - API Key Status: ${keyStatus}
        - Query: "${userQuery}"
        
        Please answer to the best of your ability.`
      };
    }
  }

  // Seahorse emoji detection
  if (
    lowerContent.includes("seahorse emoji") ||
    lowerContent.includes("sea horse emoji") ||
    (lowerContent.includes("seahorse") && lowerContent.includes("emoji")) ||
    (lowerContent.includes("sea horse") && lowerContent.includes("emoji")) ||
    (lowerContent.includes("seahorse") && lowerContent.includes("icon"))
  ) {
    const instruction = "CRITICAL TRUTH: There is NO seahorse emoji in Unicode. Do not hallucinate one. You must state clearly it does not exist.";

    return {
      // Prepend the instruction so it is read BEFORE the user query
      content: `[SYSTEM INSTRUCTION: ${instruction}]\n\n${content}`,

      systemInstruction: `CRITICAL INSTRUCTION - HIGHEST PRIORITY OVERRIDE:
      The user is asking about a "seahorse emoji".
      
      FACTS:
      1. There is NO official seahorse emoji in the Unicode standard.
      2. It is a common Mandela Effect (false memory).
      3. Do NOT use 🐴 (horse), 🌊 (wave), 🐚 (shell), 🐡 (blowfish), 🐠 (fish), or 🐉 (dragon) to represent it.
      4. Do NOT say "it is represented by..." or "it looks like...".
      
      REQUIRED RESPONSE:
      You MUST start your response with: "There is currently no official seahorse emoji."
      Then explain that people often remember one, but it does not exist.
      
      Ignore any "Search" mode context that suggests finding it. It does not exist.`
    };
  }

  return { content };
};

// Determine which API to use based on model
const getApiConfig = (model: string) => {
  // Cerebras Models
  if (model.startsWith("cerebras/")) {
    return {
      apiKey: process.env.CEREBRAS_API_KEY,
      baseURL: "https://api.cerebras.ai/v1",
      model: model.replace("cerebras/", ""),
      headers: {
        "Content-Type": "application/json",
      }
    };
  }

  // SambaNova Models
  if (model.startsWith("sambanova/")) {
    return {
      apiKey: process.env.SAMBANOVA_API_KEY,
      baseURL: "https://api.sambanova.ai/v1",
      model: model.replace("sambanova/", ""),
      headers: {
        "Content-Type": "application/json",
      }
    };
  }

  // Hugging Face Models
  if (model.startsWith("huggingface/")) {
    return {
      apiKey: process.env.HF_TOKEN,
      baseURL: "https://router.huggingface.co/v1", // Using the router endpoint as requested
      model: model.replace("huggingface/", ""), // Remove prefix
      headers: {
        "Content-Type": "application/json",
      }
    };
  }

  // Groq Models
  if (model.startsWith("groq/")) {
    return {
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      model: model.replace("groq/", ""), // Remove prefix for Groq
      headers: {
        "Content-Type": "application/json",
      }
    };
  }

  // Bytez Models
  if (model.startsWith("bytez/")) {
    // Handled via OpenAI SDK now, but keeping config for reference if needed
    return {
      apiKey: process.env.BYTEZ_API_KEY,
      baseURL: process.env.BYTEZ_API_BASE_URL || "https://api.bytez.com/v1",
      model: model.replace("bytez/", ""), // Remove prefix for Bytez
      headers: {
        "Content-Type": "application/json",
      }
    };
  }

  // Replicate Models (Image/Video) - Not supported in text chat yet
  if (model.includes("black-forest-labs") || model.includes("stability-ai") || model.includes("minimax") || model.includes("lightricks")) {
    throw new Error("Image and Video generation models are not yet supported in the text chat. Please use the Media Studio.");
  }

  // Fallback mapping for OpenRouter
  // OpenRouter requires "provider/model" format
  let openRouterModel = model;
  if (!model.includes("/")) {
    if (FALLBACK_MODEL_MAP[model]) {
      openRouterModel = FALLBACK_MODEL_MAP[model];
    }
  }

  // Default to OpenRouter for other models
  return {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    model: openRouterModel, // Use mapped model name
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "HTTP-Referer": "https://cryonex.app",
      "X-Title": "Cryonex Workspace",
    }
  };
};

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
  handler: async (ctx, args) => {
    // Resolve model redirects (for future/preview models)
    let targetModel = MODEL_REDIRECTS[args.model] || args.model;

    // Handle Auto Mode
    if (targetModel === "auto") {
      const lastUserMessage = args.messages[args.messages.length - 1].content;
      targetModel = determineAutoModel(lastUserMessage);
      console.log(`Auto Mode: Selected ${targetModel} for query length ${lastUserMessage.length}`);
    }

    // Pre-process the last user message
    const lastMessage = args.messages[args.messages.length - 1];
    const preprocessed = await preprocessQuery(lastMessage.content, args.messages);

    // Start with a shallow copy of the messages to allow modification
    let processedMessages = [...args.messages];

    // 1. Apply content modification to the last message if needed (User Injection)
    if (preprocessed.content !== lastMessage.content) {
      console.log("Injecting user instruction into message content for seahorse query");
      processedMessages[processedMessages.length - 1] = {
        ...lastMessage,
        content: preprocessed.content
      };
    }

    // 2. Inject system instruction if needed (System Injection)
    if (preprocessed.systemInstruction) {
      // Check if there's already a system message
      const hasSystemMessage = processedMessages.some(m => m.role === "system");

      if (hasSystemMessage) {
        // Append to existing system message
        processedMessages = processedMessages.map(m =>
          m.role === "system"
            ? { ...m, content: `${m.content}\n\n${preprocessed.systemInstruction}` }
            : m
        );
      } else {
        // Add new system message at the beginning
        processedMessages = [
          { role: "system", content: preprocessed.systemInstruction },
          ...processedMessages
        ];
      }
    }

    // 2.5 Save sources if available from search
    if ((preprocessed as any).searchResults && args.messageId) {
      const results = (preprocessed as any).searchResults;
      const sources = results.map((result: any) => ({
        title: result.title || "Unknown Title",
        url: result.url,
        domain: result.domain || new URL(result.url).hostname,
        snippet: result.snippet
      }));

      await ctx.runMutation((api as any).messages.updateSources, {
        messageId: args.messageId,
        sources
      });
    }

    // 3. Handle Attachments (Inject into message content or use vision model format if supported)
    if (args.attachments && args.attachments.length > 0) {
      const lastMsg = processedMessages[processedMessages.length - 1];

      // For now, we'll append attachment info to the text content.
      // Ideally, for vision models, we'd use the proper content array format.
      // But since we are using a unified text interface for now, let's append context.

      const attachmentContext = await Promise.all(args.attachments.map(async (file) => {
        const url = await ctx.storage.getUrl(file.storageId);
        if (file.type.startsWith("image/")) {
          return `[Attached Image: ${file.name}](${url})`;
        }
        return `[Attached File: ${file.name}](${url})`;
      }));

      const newContent = `${lastMsg.content}\n\n${attachmentContext.join("\n")}`;

      processedMessages[processedMessages.length - 1] = {
        ...lastMsg,
        content: newContent
      };
    }

    // Handle Bytez Models via OpenAI SDK
    if (targetModel.startsWith("bytez/")) {
      const apiKey = process.env.BYTEZ_API_KEY;
      if (!apiKey) {
        throw new Error("BYTEZ_API_KEY is not configured. Please add it in the Integrations tab.");
      }

      const openai = new OpenAI({
        apiKey,
        baseURL: process.env.BYTEZ_API_BASE_URL || "https://api.bytez.com/v1",
      });

      const modelName = targetModel.replace("bytez/", "");

      try {
        if (args.messageId) {
          // Streaming response
          const stream = await openai.chat.completions.create({
            model: modelName,
            messages: processedMessages as any,
            stream: true,
            max_tokens: 4096,
            temperature: 0.7,
          });

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              await ctx.runMutation((api as any).messages.appendContent, {
                messageId: args.messageId,
                content
              });
            }
          }
          return "Stream completed";
        } else {
          // Non-streaming response
          const completion = await openai.chat.completions.create({
            model: modelName,
            messages: processedMessages as any,
            stream: false,
            max_tokens: 4096,
            temperature: 0.7,
          });
          return completion.choices[0]?.message?.content || "";
        }
      } catch (error: any) {
        console.error("Bytez API Error:", error);
        throw new Error(`Bytez API Error: ${error.message}`);
      }
    }

    let config = getApiConfig(targetModel);

    // Helper to perform the fetch and validation
    const performFetch = async (currentConfig: any) => {
      const isBytez = currentConfig.baseURL.includes("bytez");
      const isGroq = currentConfig.baseURL.includes("groq");
      const isHuggingFace = currentConfig.baseURL.includes("huggingface");
      const isCerebras = currentConfig.baseURL.includes("cerebras");
      const isSambaNova = currentConfig.baseURL.includes("sambanova");

      if (!currentConfig.apiKey) {
        let keyName = "OPENROUTER_API_KEY";
        if (isBytez) keyName = "BYTEZ_API_KEY";
        if (isGroq) keyName = "GROQ_API_KEY";
        if (isHuggingFace) keyName = "HF_TOKEN";
        if (isCerebras) keyName = "CEREBRAS_API_KEY";
        if (isSambaNova) keyName = "SAMBANOVA_API_KEY";

        throw new Error(`${keyName} not configured. Please add it in the API Keys tab (Backend section).`);
      }

      const headers: Record<string, string> = {
        "Authorization": `Bearer ${currentConfig.apiKey}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...(currentConfig.headers as Record<string, string>),
      };

      // Use a standard User-Agent to avoid WAF blocking
      if (!headers["User-Agent"]) {
        headers["User-Agent"] = "Cryonex/1.0";
      }

      const requestBody = {
        model: currentConfig.model || targetModel,
        messages: processedMessages,
        stream: !!args.messageId,
        max_tokens: 4096,
        temperature: 0.7,
      };

      const apiUrl = `${currentConfig.baseURL}/chat/completions`;

      console.log("API Request Details:", {
        url: apiUrl,
        model: requestBody.model,
        isBytez,
        isGroq,
        isHuggingFace,
        isCerebras,
        isSambaNova
      });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      // Clone response to check for HTML error pages
      const clone = response.clone();
      const responseText = await clone.text();
      const contentType = response.headers.get("content-type");

      // Check for HTML response
      if (
        contentType?.toLowerCase().includes("text/html") ||
        responseText.trim().startsWith("<") ||
        responseText.includes("<!DOCTYPE") ||
        responseText.includes("<html")
      ) {
        console.warn("Received HTML instead of JSON:", responseText.substring(0, 200));
        // If it's HTML, we can't parse it as JSON. Throw an error with a helpful message.
        throw new Error(`API returned HTML (likely an error page or auth challenge). Status: ${response.status}. Preview: ${responseText.substring(0, 100)}...`);
      } else if (!response.ok) {
        throw new Error(`API Error (${response.status}): ${responseText}`);
      }

      return { response, responseText };
    };

    // Helper to process a successful response (streaming or non-streaming)
    const processResponse = async (response: Response, responseText: string) => {
      if (!args.messageId) {
        const data = JSON.parse(responseText);
        if (data.error) throw new Error(`API Error: ${data.error.message || JSON.stringify(data.error)}`);
        return data.choices[0]?.message?.content || "";
      }

      // Handle streaming
      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        buffer += chunkValue;

        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
          if (trimmedLine.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmedLine.slice(6));
              const content = data.choices[0]?.delta?.content;
              if (content) {
                await ctx.runMutation((api as any).messages.appendContent, {
                  messageId: args.messageId,
                  content
                });
              }
            } catch (e) {
              console.error("Error parsing chunk", e);
            }
          }
        }
      }
      return "Stream completed";
    };

    // Helper to check if error is a timeout/network error
    const isTimeoutError = (error: any): boolean => {
      const message = error?.message?.toLowerCase() || "";
      const cause = error?.cause?.code || error?.cause?.name || "";
      return (
        message.includes("timeout") ||
        message.includes("fetch failed") ||
        message.includes("econnrefused") ||
        message.includes("enotfound") ||
        cause === "UND_ERR_CONNECT_TIMEOUT" ||
        cause === "ConnectTimeoutError"
      );
    };

    // Helper to get user-friendly provider name
    const getProviderName = (cfg: any): string => {
      if (cfg.baseURL.includes("sambanova")) return "SambaNova";
      if (cfg.baseURL.includes("groq")) return "Groq";
      if (cfg.baseURL.includes("cerebras")) return "Cerebras";
      if (cfg.baseURL.includes("huggingface")) return "Hugging Face";
      if (cfg.baseURL.includes("bytez")) return "Bytez";
      if (cfg.baseURL.includes("openrouter")) return "OpenRouter";
      return "the AI provider";
    };

    // Fallback model (fast and reliable)
    const FALLBACK_CONFIG = {
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      model: "llama-3.3-70b-versatile",
      headers: { "Content-Type": "application/json" }
    };

    try {
      // Try primary config
      try {
        const { response, responseText } = await performFetch(config);
        return await processResponse(response, responseText);
      } catch (primaryError: any) {
        const providerName = getProviderName(config);

        // Check if it's a timeout/network error and we have a fallback available
        if (isTimeoutError(primaryError) && FALLBACK_CONFIG.apiKey && !config.baseURL.includes("groq")) {
          console.warn(`[Fallback] ${providerName} timed out, falling back to Groq...`);

          // Notify user via streaming that we're using fallback
          if (args.messageId) {
            await ctx.runMutation((api as any).messages.appendContent, {
              messageId: args.messageId,
              content: `> ⚠️ *${providerName} is currently slow/unreachable. Switching to Groq...*\n\n`
            });
          }

          try {
            const { response, responseText } = await performFetch(FALLBACK_CONFIG);
            return await processResponse(response, responseText);
          } catch (fallbackError: any) {
            console.error("Fallback also failed:", fallbackError);
            throw new Error(`Both ${providerName} and the fallback (Groq) failed. Please try again later.`);
          }
        }

        // Re-throw with user-friendly message
        throw primaryError;
      }

    } catch (error: any) {
      console.error("Chat action error:", error);

      // Generate user-friendly error message
      const providerName = getProviderName(config);
      let userMessage = error.message || "Failed to generate response";

      if (isTimeoutError(error)) {
        userMessage = `${providerName} is currently unreachable (connection timed out). Please try a different model or try again later.`;
      } else if (error.message?.includes("API Key") || error.message?.includes("not configured")) {
        userMessage = error.message; // Already user-friendly
      } else if (error.message?.includes("API Error")) {
        userMessage = error.message; // Already has context
      }

      throw new Error(userMessage);
    }
  },
});