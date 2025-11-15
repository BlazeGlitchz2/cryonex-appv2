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

http.route({
  path: "/chat/stream",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { model, messages, temperature = 0.7 } = await req.json();

      // Accept missing model; default to Claude 3 Haiku via OpenRouter
      const defaultModel = "anthropic/claude-3-haiku";
      const selectedModel = model || defaultModel;

      if (!Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: "invalid_request" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Enforce reasonable token cap to avoid runaway spend
      const MAX_TOKENS = 1024;

      // Helper: Fallback to Anthropic API streaming if OpenRouter fails or key is missing
      const anthropicFallback = async (): Promise<Response> => {
        const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
        if (!ANTHROPIC_API_KEY) {
          return new Response(
            JSON.stringify({
              error: "missing_anthropic_key",
              message:
                "ANTHROPIC_API_KEY is not configured. Add it in the API Keys tab (Backend).",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        // Extract optional system prompt and conversation messages
        const systemPrompt =
          messages
            .filter((m: any) => m.role === "system")
            .map((m: any) => m.content)
            .join("\n") || undefined;

        const conversation = messages
          .filter((m: any) => m.role === "user" || m.role === "assistant")
          .map((m: any) => ({
            role: m.role,
            content: m.content,
          }));

        // Map to Anthropic model id (force haiku as requested)
        const anthropicModel = "claude-3-haiku-20240307";

        const resp = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
            Accept: "text/event-stream",
          },
          body: JSON.stringify({
            model: anthropicModel,
            max_tokens: MAX_TOKENS,
            temperature,
            system: systemPrompt,
            messages: conversation,
            stream: true,
          }),
        });

        if (resp.ok && resp.body) {
          return new Response(resp.body, {
            status: 200,
            headers: {
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
              "Transfer-Encoding": "chunked",
              "Access-Control-Allow-Origin": "*",
            },
          });
        }

        const detail = await resp.text().catch(() => "");
        return new Response(
          JSON.stringify({ error: "anthropic_error", detail }),
          { status: resp.status || 500, headers: { "Content-Type": "application/json" } }
        );
      };

      // Only OpenRouter SSE proxy (primary), with Anthropic fallback
      const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
      if (!OPENROUTER_API_KEY) {
        // No OpenRouter key; use Anthropic fallback
        return await anthropicFallback();
      }

      // Upstream request with enforced max_tokens, defaulting to Claude 3 Haiku
      const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.CONVEX_SITE_URL || "https://cryonex.app",
          "X-Title": "Cryonex Workspace",
        },
        body: JSON.stringify({
          model: selectedModel, // e.g., "anthropic/claude-3-haiku"
          messages,
          stream: true,
          temperature,
          max_tokens: MAX_TOKENS,
        }),
      });

      // If upstream rejects (e.g., token/context length issue), attempt a concise fallback
      if (!upstream.ok || !upstream.body) {
        const detail = await upstream.text().catch(() => "");
        const lower = detail.toLowerCase();

        const looksLikeTokenLimit =
          lower.includes("maximum context length") ||
          lower.includes("too many tokens") ||
          lower.includes("context_length") ||
          lower.includes("max tokens") ||
          lower.includes("token limit") ||
          lower.includes("length") ||
          upstream.status === 400 ||
          upstream.status === 422;

        if (looksLikeTokenLimit) {
          const fallbackMessages = [
            { role: "system", content: "Respond concisely in under 100 words." },
            ...messages,
          ];
          const fallback = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": process.env.CONVEX_SITE_URL || "https://cryonex.app",
              "X-Title": "Cryonex Workspace",
            },
            body: JSON.stringify({
              model: selectedModel,
              messages: fallbackMessages,
              stream: true,
              temperature: Math.min(temperature, 0.6),
              max_tokens: 256, // extra-short fallback
            }),
          });

          if (fallback.ok && fallback.body) {
            return new Response(fallback.body, {
              status: 200,
              headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "Transfer-Encoding": "chunked",
                "Access-Control-Allow-Origin": "*",
              },
            });
          }

          // If OpenRouter fallback also fails, try Anthropic fallback
          return await anthropicFallback();
        }

        // Non-token error -> try Anthropic fallback
        return await anthropicFallback();
      }

      // Proxy the SSE stream directly to the client
      return new Response(upstream.body, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "Transfer-Encoding": "chunked",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err: any) {
      console.error("chat/stream error:", err);
      // Last-chance Anthropic fallback on unexpected errors
      try {
        const { messages, temperature = 0.7 } = await req.json().catch(() => ({ messages: [], temperature: 0.7 }));
        if (Array.isArray(messages)) {
          // minimal inline fallback instance reusing the above logic
          const MAX_TOKENS = 1024;
          const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
          if (ANTHROPIC_API_KEY) {
            const systemPrompt =
              messages
                .filter((m: any) => m.role === "system")
                .map((m: any) => m.content)
                .join("\n") || undefined;
            const conversation = messages
              .filter((m: any) => m.role === "user" || m.role === "assistant")
              .map((m: any) => ({ role: m.role, content: m.content }));
            const resp = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
                Accept: "text/event-stream",
              },
              body: JSON.stringify({
                model: "claude-3-haiku-20240307",
                max_tokens: MAX_TOKENS,
                temperature,
                system: systemPrompt,
                messages: conversation,
                stream: true,
              }),
            });
            if (resp.ok && resp.body) {
              return new Response(resp.body, {
                status: 200,
                headers: {
                  "Content-Type": "text/event-stream; charset=utf-8",
                  "Cache-Control": "no-cache, no-transform",
                  Connection: "keep-alive",
                  "Transfer-Encoding": "chunked",
                  "Access-Control-Allow-Origin": "*",
                },
              });
            }
          }
        }
      } catch (_) {
        // swallow fallback error and return JSON below
      }
      return new Response(
        JSON.stringify({
          error: "chat_stream_failed",
          message: err?.message || "Unknown error",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Bytez API streaming proxy to avoid CORS issues
http.route({
  path: "/bytez/stream",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { model, messages, temperature = 0.7, max_tokens = 2000 } = await req.json();

      if (!Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: "invalid_request" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;
      if (!BYTEZ_API_KEY) {
        return new Response(
          JSON.stringify({ error: "BYTEZ_API_KEY not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Call Bytez API with streaming
      // Bytez uses "Key" instead of "Bearer" for authorization
      // Bytez supports OpenAI-compatible chat completions endpoint
      // Model format: org/model-name (e.g., "deepseek/deepseek-r1", "meta-llama/llama-3.1-70b-instruct")
      const upstream = await fetch("https://api.bytez.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Key ${BYTEZ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model, // Model ID in format: org/model-name
          messages,
          stream: true,
          temperature,
          max_tokens,
        }),
      });

      if (!upstream.ok) {
        let errorDetail = "";
        try {
          const errorJson = await upstream.json().catch(() => null);
          if (errorJson) {
            errorDetail = JSON.stringify({
              message: errorJson.error?.message || errorJson.message || "Unknown Bytez API error",
              type: errorJson.error?.type || errorJson.error?.code,
              status: upstream.status,
            });
          } else {
            const errorText = await upstream.text().catch(() => "");
            errorDetail = errorText || `HTTP ${upstream.status}`;
          }
        } catch {
          errorDetail = `HTTP ${upstream.status} ${upstream.statusText}`;
        }
        
        return new Response(
          JSON.stringify({ 
            error: "bytez_error", 
            detail: errorDetail,
            status: upstream.status 
          }),
          { 
            status: upstream.status || 500, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }

      if (upstream.body) {
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return new Response(
        JSON.stringify({ error: "no_body" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: "internal_error", detail: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// Groq API streaming proxy (OpenAI-compatible)
http.route({
  path: "/groq/stream",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { model, messages, temperature = 0.7, max_tokens = 2000 } = await req.json();

      if (!Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: "invalid_request" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      if (!GROQ_API_KEY) {
        return new Response(
          JSON.stringify({ error: "GROQ_API_KEY not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Call Groq API (OpenAI-compatible endpoint)
      const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature,
          max_tokens,
        }),
      });

      if (!upstream.ok) {
        let errorDetail = "";
        try {
          const errorJson = await upstream.json().catch(() => null);
          if (errorJson) {
            errorDetail = JSON.stringify({
              message: errorJson.error?.message || errorJson.message || "Unknown Groq API error",
              type: errorJson.error?.type || errorJson.error?.code,
              status: upstream.status,
            });
          } else {
            const errorText = await upstream.text().catch(() => "");
            errorDetail = errorText || `HTTP ${upstream.status}`;
          }
        } catch {
          errorDetail = `HTTP ${upstream.status} ${upstream.statusText}`;
        }
        
        return new Response(
          JSON.stringify({ 
            error: "groq_error", 
            detail: errorDetail,
            status: upstream.status 
          }),
          { 
            status: upstream.status || 500, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }

      if (upstream.body) {
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return new Response(
        JSON.stringify({ error: "no_body" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: "internal_error", detail: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

// AgentRouter API streaming proxy
http.route({
  path: "/agentrouter/stream",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    try {
      const { model, messages, temperature = 0.7, max_tokens = 2000 } = await req.json();

      if (!Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: "invalid_request" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const AGENTROUTER_API_KEY = process.env.AGENTROUTER_API_KEY;
      if (!AGENTROUTER_API_KEY) {
        return new Response(
          JSON.stringify({ error: "AGENTROUTER_API_KEY not configured" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // AgentRouter uses OpenAI-compatible API
      // Base URL: https://api.agentrouter.org/v1 (or similar - adjust based on actual API)
      // For now, using a generic OpenAI-compatible endpoint
      // Note: Update the base URL once AgentRouter API documentation is confirmed
      const baseUrl = process.env.AGENTROUTER_BASE_URL || "https://api.agentrouter.org/v1";
      
      const upstream = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AGENTROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature,
          max_tokens,
        }),
      });

      if (!upstream.ok) {
        let errorDetail = "";
        try {
          const errorJson = await upstream.json().catch(() => null);
          if (errorJson) {
            errorDetail = JSON.stringify({
              message: errorJson.error?.message || errorJson.message || "Unknown AgentRouter API error",
              type: errorJson.error?.type || errorJson.error?.code,
              status: upstream.status,
            });
          } else {
            const errorText = await upstream.text().catch(() => "");
            errorDetail = errorText || `HTTP ${upstream.status}`;
          }
        } catch {
          errorDetail = `HTTP ${upstream.status} ${upstream.statusText}`;
        }
        
        return new Response(
          JSON.stringify({ 
            error: "agentrouter_error", 
            detail: errorDetail,
            status: upstream.status 
          }),
          { 
            status: upstream.status || 500, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }

      if (upstream.body) {
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "Transfer-Encoding": "chunked",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return new Response(
        JSON.stringify({ error: "no_body" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({ error: "internal_error", detail: error.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }),
});

export default http;