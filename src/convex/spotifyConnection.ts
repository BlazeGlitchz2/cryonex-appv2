import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  hashSpotifyOAuthState,
  sanitizeSpotifyConnection,
} from "./lib/spotifySecurity";

// Save Spotify connection for a user
export const saveConnection = mutation({
  args: {
    accessToken: v.string(),
    refreshToken: v.string(),
    expiresAt: v.number(),
    spotifyUserId: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Check if connection already exists
    const existing = await ctx.db
      .query("spotifyConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.replace(existing._id, {
        userId,
        expiresAt: args.expiresAt,
        spotifyUserId: args.spotifyUserId,
        displayName: args.displayName,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("spotifyConnections", {
        userId,
        expiresAt: args.expiresAt,
        spotifyUserId: args.spotifyUserId,
        displayName: args.displayName,
      });
    }
  },
});

// Get user's Spotify connection
export const getConnection = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const connection = await ctx.db
      .query("spotifyConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return sanitizeSpotifyConnection(connection);
  },
});

// Disconnect Spotify account
export const disconnect = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const connection = await ctx.db
      .query("spotifyConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (connection) {
      await ctx.db.delete(connection._id);
    }
  },
});

// Save a playlist reference
export const savePlaylist = mutation({
  args: {
    spotifyPlaylistId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    trackCount: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("spotifyPlaylists", {
      userId,
      spotifyPlaylistId: args.spotifyPlaylistId,
      name: args.name,
      description: args.description,
      imageUrl: args.imageUrl,
      trackCount: args.trackCount,
      isPublic: args.isPublic,
    });
  },
});

// Get user's playlists
export const getUserPlaylists = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("spotifyPlaylists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const storeOAuthState = internalMutation({
  args: {
    userId: v.id("users"),
    stateHash: v.string(),
    redirectUri: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existingStates = await ctx.db
      .query("spotifyOAuthStates")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const state of existingStates) {
      await ctx.db.delete(state._id);
    }

    return await ctx.db.insert("spotifyOAuthStates", args);
  },
});

export const consumeOAuthState = mutation({
  args: {
    state: v.string(),
    redirectUri: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const stateHash = await hashSpotifyOAuthState(args.state);
    const record = await ctx.db
      .query("spotifyOAuthStates")
      .withIndex("by_stateHash", (q) => q.eq("stateHash", stateHash))
      .first();

    if (!record || record.userId !== userId) {
      throw new Error("Invalid Spotify OAuth state");
    }

    if (record.redirectUri !== args.redirectUri) {
      throw new Error("Spotify OAuth redirect mismatch");
    }

    if (record.expiresAt < Date.now()) {
      await ctx.db.delete(record._id);
      throw new Error("Spotify OAuth state expired");
    }

    await ctx.db.delete(record._id);
    return true;
  },
});
