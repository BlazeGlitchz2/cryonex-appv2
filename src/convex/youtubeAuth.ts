import { v } from "convex/values";
import { action, internalMutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Get authorization URL for OAuth flow
export const getAuthUrl = action({
  args: {
    redirectUri: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const clientId = process.env.YOUTUBE_CLIENT_ID;

    if (!clientId) {
      throw new Error("YouTube Client ID is not configured");
    }

    const scopes = [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube.force-ssl",
    ].join(" ");

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: args.redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      prompt: "consent",
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  },
});

// Exchange authorization code for tokens
export const exchangeCode = action({
  args: {
    code: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clientId = process.env.YOUTUBE_CLIENT_ID;
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("YouTube API credentials are not configured");
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code: args.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: args.redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Failed to exchange code: ${error}`);
    }

    const tokens = await tokenResponse.json();
    
    // Get user profile/channel info
    const profileResponse = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    let channelId = undefined;
    let channelTitle = undefined;

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      if (profileData.items && profileData.items.length > 0) {
        channelId = profileData.items[0].id;
        channelTitle = profileData.items[0].snippet.title;
      }
    }

    // Save connection
    await ctx.runMutation(internal.youtubeAuth.saveConnection, {
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      channelId,
      channelTitle,
    });

    return { success: true };
  },
});

// Internal mutation to save connection details
export const saveConnection = internalMutation({
  args: {
    userId: v.id("users"),
    accessToken: v.string(),
    refreshToken: v.optional(v.string()),
    expiresIn: v.number(),
    channelId: v.optional(v.string()),
    channelTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expiresAt = Date.now() + args.expiresIn * 1000;
    
    const existing = await ctx.db
      .query("youtubeConnections")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken || existing.refreshToken, // Keep old refresh token if new one isn't provided
        expiresAt,
        channelId: args.channelId,
        channelTitle: args.channelTitle,
      });
    } else {
      await ctx.db.insert("youtubeConnections", {
        userId: args.userId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt,
        channelId: args.channelId,
        channelTitle: args.channelTitle,
      });
    }
  },
});

// Check connection status
export const getConnectionStatus = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const connection = await ctx.db
      .query("youtubeConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!connection) return null;

    return {
      isConnected: true,
      channelTitle: connection.channelTitle,
    };
  },
});

