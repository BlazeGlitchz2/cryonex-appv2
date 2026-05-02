// @ts-nocheck
import { httpRouter } from "convex/server";
import { auth } from "./auth";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";
import {
  determineAutoChatModel,
  getOpenAiCompatConfig,
  normalizeModelId,
} from "./lib/aiRouting";

const http = httpRouter();

auth.addHttpRoutes(http);

const getAppSiteUrl = () =>
  process.env.SITE_URL ||
  process.env.APP_URL ||
  process.env.PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "";

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
      await ctx.runAction(api.spotify.exchangeCode, {
        code,
        redirectUri,
      });

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/integrations?spotify=connected",
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

// Helper to determine model for Auto mode
const determineAutoModel = (content: string): string => {
  return determineAutoChatModel(content, false);
};

const getApiConfig = (model: string) => {
  const config = getOpenAiCompatConfig(model, {
    preferGoogleForGemini: true,
  });
  return {
    apiKey: config.apiKey,
    baseURL: config.baseURL,
    model: config.model,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(config.headers || {}),
    },
  };
};

http.route({
  path: "/chat/stream",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { messages, model, chatId, attachments } = await req.json();
      if (
        !Array.isArray(messages) ||
        messages.length === 0 ||
        messages.length > 64
      ) {
        return new Response(JSON.stringify({ error: "Invalid messages" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Resolve model
      let targetModel = normalizeModelId(model);
      if (targetModel === "auto") {
        const lastUserMessage = String(messages[messages.length - 1].content || "");
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
              await ctx.runMutation(api.messages.create, {
                chatId,
                role: "assistant",
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

// Fallback any accidental frontend navigation on the Convex host
// back to the real app domain instead of returning a Convex 404 page.
http.route({
  pathPrefix: "/",
  method: "GET",
  handler: httpAction(async (_ctx, req) => {
    const siteUrl = getAppSiteUrl().replace(/\/$/, "");

    if (!siteUrl) {
      return new Response("SITE_URL is not configured", { status: 500 });
    }

    const requestUrl = new URL(req.url);
    const destination = `${siteUrl}${requestUrl.pathname}${requestUrl.search}`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: destination,
        "Cache-Control": "no-store",
      },
    });
  }),
});

export default http;
