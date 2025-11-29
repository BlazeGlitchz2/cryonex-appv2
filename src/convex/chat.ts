"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const FALLBACK_MODEL_MAP: Record<string, string> = {
  "gpt-4-turbo": "openai/gpt-4-turbo",
  "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
  "deepseek-v3.1": "deepseek/deepseek-chat",
  "deepseek-v3.2": "deepseek/deepseek-chat",
  "claude-3-opus": "anthropic/claude-3-opus",
  "claude-3-sonnet": "anthropic/claude-3-sonnet",
  "claude-3-haiku": "anthropic/claude-3-haiku",
  "gemini-pro": "google/gemini-pro",
  "glm-4.5": "zhipu/glm-4",
  "glm-4.6": "zhipu/glm-4",
};

// Pre-processing filter to detect specific queries and inject instructions
const preprocessQuery = (content: string): { content: string; systemInstruction?: string } => {
  const lowerContent = content.toLowerCase();
  
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
        messages: v.array(v.object({
            role: v.string(),
            content: v.string(),
        })),
        model: v.string(),
        messageId: v.optional(v.id("messages")),
    },
    handler: async (ctx, args) => {
        // Pre-process the last user message
        const lastMessage = args.messages[args.messages.length - 1];
        const preprocessed = preprocessQuery(lastMessage.content);
        
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

        let config = getApiConfig(args.model);

        // Helper to perform the fetch and validation
        const performFetch = async (currentConfig: any) => {
            const isBytez = currentConfig.baseURL.includes("bytez");
            const isGroq = currentConfig.baseURL.includes("groq");
            const isHuggingFace = currentConfig.baseURL.includes("huggingface");
            const isCerebras = currentConfig.baseURL.includes("cerebras");

            if (!currentConfig.apiKey) {
                let keyName = "OPENROUTER_API_KEY";
                if (isBytez) keyName = "BYTEZ_API_KEY";
                if (isGroq) keyName = "GROQ_API_KEY";
                if (isHuggingFace) keyName = "HF_TOKEN";
                if (isCerebras) keyName = "CEREBRAS_API_KEY";
                
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
                model: currentConfig.model || args.model,
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
                isCerebras
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
            } else if (!response.ok) {
                throw new Error(`API Error (${response.status}): ${responseText}`);
            }

            return { response, responseText };
        };

        try {
            // Try primary config
            try {
                const { response, responseText } = await performFetch(config);
                
                // Check if response is HTML
                if (
                    responseText.trim().startsWith("<") || 
                    responseText.includes("<!DOCTYPE") ||
                    (response.headers.get("content-type")?.includes("text/html"))
                ) {
                    const htmlContent = `[System: API returned HTML content (likely verification)]\n\n${responseText.substring(0, 1500)}...`;
                    
                    if (args.messageId) {
                        await ctx.runMutation((api as any).messages.appendContent, {
                            messageId: args.messageId,
                            content: htmlContent
                        });
                        return "HTML content received";
                    }
                    return htmlContent;
                }

                // Process successful response
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

            } catch (error: any) {
                throw error;
            }

        } catch (error: any) {
            console.error("Chat action error:", error);
            throw new Error(error.message || "Failed to generate response");
        }
    },
});