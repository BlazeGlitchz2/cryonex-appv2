import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const incrementSearchCount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date().toISOString().split('T')[0];
    const lastSearchDate = user.lastSearchDate || "";
    const currentCount = lastSearchDate === today ? (user.dailySearchCount || 0) : 0;

    await ctx.db.patch(userId, {
      dailySearchCount: currentCount + 1,
      lastSearchDate: today,
    });

    return { remaining: Math.max(0, 3 - (currentCount + 1)) };
  },
});

export const getSearchCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { count: 0, remaining: 3 };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return { count: 0, remaining: 3 };
    }

    const today = new Date().toISOString().split('T')[0];
    const lastSearchDate = user.lastSearchDate || "";
    const currentCount = lastSearchDate === today ? (user.dailySearchCount || 0) : 0;

    return { count: currentCount, remaining: Math.max(0, 3 - currentCount) };
  },
});