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

export default http;