"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Determine which API to use based on model
const getApiConfig = (model: string) => {
  // AgentRouter models (DeepSeek, GLM, GPT-5, Claude, Gemini)
  const agentRouterModels = [
    "gpt-5", "gpt-4-turbo", "gpt-3.5-turbo",
    "deepseek-v3.1", "deepseek-v3.2",
    "glm-4.5", "glm-4.6",
    "claude-3-opus", "claude-3-sonnet", "claude-3-haiku",
    "gemini-pro"
  ];

  // Check if model matches any AgentRouter model (case-insensitive, partial match)
  const isAgentRouterModel = agentRouterModels.some(m => 
    model.toLowerCase().includes(m.toLowerCase())
  );

  if (isAgentRouterModel) {
    // Extract just the model name without provider prefix
    const cleanModel = model.includes('/') ? model.split('/')[1] : model;
    
    return {
      apiKey: process.env.AGENT_ROUTER_TOKEN,
      baseURL: "https://agentrouter.org/v1",
      model: cleanModel, // Use cleaned model name
      headers: {
        "Content-Type": "application/json",
      }
    };
  }

  // Default to OpenRouter for other models
  return {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    model: model, // Keep original model name for OpenRouter
    headers: {
      "Content-Type": "application/json",
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
        const config = getApiConfig(args.model);

        if (!config.apiKey) {
            const isAgentRouter = config.baseURL.includes("agentrouter");
            const keyName = isAgentRouter ? "AGENT_ROUTER_TOKEN" : "OPENROUTER_API_KEY";
            throw new Error(`${keyName} not configured. Please add it in the API Keys tab (Backend section).`);
        }

        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${config.apiKey}`,
            };

            // Add optional headers only if they exist
            if (config.headers["HTTP-Referer"]) {
                headers["HTTP-Referer"] = config.headers["HTTP-Referer"];
            }
            if (config.headers["X-Title"]) {
                headers["X-Title"] = config.headers["X-Title"];
            }

            const requestBody = {
                model: config.model || args.model, // Use cleaned model name from config
                messages: args.messages,
                stream: !!args.messageId,
                max_tokens: 4096,
                temperature: 0.7,
            };

            const apiUrl = `${config.baseURL}/chat/completions`;
            
            console.log("API Request Details:", {
                url: apiUrl,
                originalModel: args.model,
                cleanedModel: config.model || args.model,
                hasAuth: !!config.apiKey,
                authPrefix: config.apiKey?.substring(0, 7),
                headers: Object.keys(headers),
                bodyKeys: Object.keys(requestBody),
                isAgentRouter: config.baseURL.includes("agentrouter")
            });

            const response = await fetch(apiUrl, {
                method: "POST",
                headers,
                body: JSON.stringify(requestBody),
            });

            const contentType = response.headers.get("content-type");
            console.log("API Response Details:", {
                status: response.status,
                statusText: response.statusText,
                contentType,
                ok: response.ok
            });

            // If we got HTML instead of JSON, log the response body
            if (contentType?.includes("text/html")) {
                const htmlText = await response.text();
                console.error("Received HTML instead of JSON:", htmlText.substring(0, 500));
                throw new Error(`API returned HTML instead of JSON. Status: ${response.status}. This usually means the endpoint or authentication is incorrect. Check your AGENT_ROUTER_TOKEN.`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error("API Error Response:", errorText);
                throw new Error(`API Error (${response.status}): ${errorText}`);
            }

            if (args.messageId) {
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
            } else {
                const data = await response.json();
                return data.choices[0]?.message?.content || "";
            }

        } catch (error: any) {
            console.error("Chat action error:", error);
            throw new Error(error.message || "Failed to generate response");
        }
    },
});