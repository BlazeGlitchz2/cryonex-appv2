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

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    userRole: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    affiliateCode: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: any = {};
    if (args.name) updates.name = args.name;
    if (args.email) updates.email = args.email;
    if (args.userRole) updates.userRole = args.userRole;
    if (args.goals) updates.goals = args.goals;
    if (args.source) updates.source = args.source;
    if (args.onboardingCompleted !== undefined) updates.onboardingCompleted = args.onboardingCompleted;

    // Handle affiliate code linking
    if (args.affiliateCode) {
      const affiliate = await ctx.db
        .query("affiliates")
        .withIndex("by_code", (q) => q.eq("code", args.affiliateCode!))
        .first();

      if (affiliate && affiliate.userId !== userId) {
        updates.referredBy = affiliate.userId;
        // Increment signups for the affiliate
        await ctx.db.patch(affiliate._id, {
          signups: (affiliate.signups || 0) + 1
        });
      }
    }

    await ctx.db.patch(userId, updates);
  },
});

export const deleteUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real app, you'd delete related data too (cascading delete)
    // For now, just deleting the user record
    await ctx.db.delete(userId);
  },
});

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (user) return user;

    // User record missing but authenticated (e.g. deleted or sync issue)
    // Try to recover from identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Re-create user
    const newUserId = await ctx.db.insert("users", {
      name: identity.name || identity.email?.split("@")[0] || "User",
      email: identity.email,
      image: identity.pictureUrl,
      // Add other default fields if needed
    });

    return await ctx.db.get(newUserId);
  },
});