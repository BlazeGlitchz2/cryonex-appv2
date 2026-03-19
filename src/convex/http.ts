// @ts-nocheck
import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

auth.addHttpRoutes(http);

// Spotify OAuth callback handler
http.route({
  path: "/spotify/callback",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    try {
      const url = new URL(req.url);

      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `/integrations?error=${encodeURIComponent(error)}`,
          },
        });
      }

      if (!code) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/integrations?error=no_code",
          },
        });
      }

      // Exchange code for tokens
      const redirectUri = `${process.env.CONVEX_SITE_URL}/spotify/callback`;
      const tokens = await ctx.runAction(api.spotify.exchangeCode, {
        code,
        redirectUri,
      });

      // Store the connection (will be handled by a mutation)
      // For now, redirect with success
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/integrations?spotify=connected&access_token=${tokens.accessToken}`,
        },
      });
    } catch (error: any) {
      console.error("Spotify callback error:", error);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/integrations?error=${encodeURIComponent(error.message || "connection_failed")}`,
        },
      });
    }
  }),
});

// Helper for streaming chat
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
  "sambanova/Meta-Llama-3.1-405B-Instruct":
    "sambanova/Meta-Llama-3.3-70B-Instruct",
  "pollinations/claude": "pollinations/claude-airforce",
};

// Helper to determine model for Auto mode
const determineAutoModel = (content: string): string => {
  const lowerContent = content.toLowerCase();
  const length = content.length;

  const complexKeywords = [
    "code",
    "function",
    "script",
    "debug",
    "fix",
    "analyze",
    "reason",
    "explain",
    "why",
    "how",
    "compare",
    "difference",
    "summary",
    "summarize",
    "essay",
    "article",
    "blog",
    "creative",
    "story",
    "react",
    "typescript",
    "convex",
    "database",
    "schema",
    "architecture",
  ];

  const hasComplexKeyword = complexKeywords.some((k) =>
    lowerContent.includes(k),
  );

  if (length > 500 || hasComplexKeyword) {
    return "sambanova/DeepSeek-R1-Distill-Llama-70B";
  }
  if (length > 100) {
    return "groq/llama-3.3-70b-versatile";
  }
  return "groq/llama-3.1-8b-instant";
};

const getApiConfig = (model: string) => {
  if (model.startsWith("cerebras/")) {
    return {
      apiKey: process.env.CEREBRAS_API_KEY,
      baseURL: "https://api.cerebras.ai/v1",
      model: model.replace("cerebras/", ""),
      headers: { "Content-Type": "application/json" },
    };
  }
  if (model.startsWith("sambanova/")) {
    return {
      apiKey: process.env.SAMBANOVA_API_KEY,
      baseURL: "https://api.sambanova.ai/v1",
      model: model.replace("sambanova/", ""),
      headers: { "Content-Type": "application/json" },
    };
  }
  if (model.startsWith("huggingface/")) {
    return {
      apiKey: process.env.HF_TOKEN,
      baseURL: "https://router.huggingface.co/v1",
      model: model.replace("huggingface/", ""),
      headers: { "Content-Type": "application/json" },
    };
  }
  if (model.startsWith("groq/")) {
    return {
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      model: model.replace("groq/", ""),
      headers: { "Content-Type": "application/json" },
    };
  }

  let openRouterModel = model;
  if (!model.includes("/")) {
    if (FALLBACK_MODEL_MAP[model]) {
      openRouterModel = FALLBACK_MODEL_MAP[model];
    }
  }

  return {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
    model: openRouterModel,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "HTTP-Referer": "https://cryonex.app",
      "X-Title": "Cryonex Workspace",
    },
  };
};

http.route({
  path: "/chat/stream",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { messages, model, chatId, attachments } = await req.json();

      // Resolve model
      let targetModel = MODEL_REDIRECTS[model] || model;
      if (targetModel === "auto") {
        const lastUserMessage = messages[messages.length - 1].content;
        targetModel = determineAutoModel(lastUserMessage);
      }

      const config = getApiConfig(targetModel);

      if (!config.apiKey) {
        return new Response(
          JSON.stringify({ error: "API Key not configured" }),
          { status: 500 },
        );
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(config.headers as Record<string, string>),
      };

      const requestBody = {
        model: config.model || targetModel,
        messages,
        stream: true,
        max_tokens: 4096,
        temperature: 0.7,
      };

      const response = await fetch(`${config.baseURL}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({ error: `Upstream API Error: ${errorText}` }),
          { status: response.status },
        );
      }

      // Create a TransformStream to pass through the chunks AND accumulate them
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const reader = response.body?.getReader();
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      let accumulatedContent = "";

      // Process the stream
      (async () => {
        try {
          if (!reader) return;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Write to client immediately
            await writer.write(value);

            // Accumulate for DB
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
                try {
                  const data = JSON.parse(trimmed.slice(6));
                  const content = data.choices[0]?.delta?.content || "";
                  accumulatedContent += content;
                } catch (e) {
                  // ignore parse errors for partial chunks
                }
              }
            }
          }
        } catch (e) {
          console.error("Stream processing error", e);
        } finally {
          await writer.close();

          // Save to DB if chatId is present (User mode)
          if (chatId && accumulatedContent) {
            try {
              await ctx.runMutation(api.messages.saveAssistantMessage, {
                chatId,
                content: accumulatedContent,
                model: targetModel,
              });
            } catch (e) {
              console.error("Failed to save message to DB", e);
            }
          }
        }
      })();

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (error: any) {
      console.error("Stream error:", error);
      return new Response(
        JSON.stringify({
          error: error.message || "Unknown error",
          stack:
            process.env.NODE_ENV === "development" ? error.stack : undefined,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }),
});

export default http;
