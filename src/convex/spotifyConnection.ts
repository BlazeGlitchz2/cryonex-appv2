import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

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
      // Update existing connection
      await ctx.db.patch(existing._id, {
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
        expiresAt: args.expiresAt,
        spotifyUserId: args.spotifyUserId,
        displayName: args.displayName,
      });
      return existing._id;
    } else {
      // Create new connection
      return await ctx.db.insert("spotifyConnections", {
        userId,
        accessToken: args.accessToken,
        refreshToken: args.refreshToken,
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

    return await ctx.db
      .query("spotifyConnections")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
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
