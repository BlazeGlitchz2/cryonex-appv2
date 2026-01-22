import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const PRO_EMAILS = [
  "ratrampage324@gmail.com",
  "viralcentral092@gmail.com",
];

const getTier = (email?: string) => {
  if (!email) return "FREE";
  return PRO_EMAILS.includes(email.toLowerCase()) ? "PRO" : "FREE";
};

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

    // Resolve image URL if storage ID exists
    if (user.imageStorageId) {
      const imageUrl = await ctx.storage.getUrl(user.imageStorageId);
      if (imageUrl) {
        return { ...user, image: imageUrl };
      }
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
    image: v.optional(v.string()),
    userRole: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    affiliateCode: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
    experienceLevel: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    imageStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: any = {};
    if (args.name) updates.name = args.name;
    if (args.email) updates.email = args.email;
    if (args.image) updates.image = args.image;
    if (args.userRole) updates.userRole = args.userRole;
    if (args.goals) updates.goals = args.goals;
    if (args.source) updates.source = args.source;
    if (args.onboardingCompleted !== undefined) updates.onboardingCompleted = args.onboardingCompleted;
    if (args.experienceLevel) updates.experienceLevel = args.experienceLevel;
    if (args.interests) updates.interests = args.interests;
    if (args.imageStorageId) updates.imageStorageId = args.imageStorageId;

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

export const completeOnboarding = mutation({
  args: {
    name: v.string(),
    userRole: v.string(),
    goals: v.array(v.string()),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    experienceLevel: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    affiliateCode: v.optional(v.string()),
    tosAccepted: v.boolean(),
    privacyPolicyAccepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate ToS and Privacy Policy acceptance
    if (!args.tosAccepted) {
      throw new Error("You must accept the Terms of Service to continue");
    }
    if (!args.privacyPolicyAccepted) {
      throw new Error("You must accept the Privacy Policy to continue");
    }

    const now = Date.now();

    // Check if user already has credits (not a new user)
    const existingUser = await ctx.db.get(userId);
    const isNewUser = existingUser && (existingUser.credits === undefined || existingUser.credits === null);

    const updates: any = {
      name: args.name,
      userRole: args.userRole,
      goals: args.goals,
      onboardingCompleted: true,
      tosAccepted: true,
      tosAcceptedAt: now,
      privacyPolicyAccepted: true,
      privacyPolicyAcceptedAt: now,
      tier: getTier(existingUser?.email),
    };

    // Give new users 100 starting credits
    if (isNewUser) {
      updates.credits = 100;
      updates.studyCredits = 100;
    }

    if (args.image) updates.image = args.image;
    if (args.imageStorageId) updates.imageStorageId = args.imageStorageId;
    if (args.experienceLevel) updates.experienceLevel = args.experienceLevel;
    if (args.interests) updates.interests = args.interests;

    // Handle affiliate code linking
    if (args.affiliateCode) {
      const affiliate = await ctx.db
        .query("affiliates")
        .withIndex("by_code", (q) => q.eq("code", args.affiliateCode!))
        .first();

      if (affiliate && affiliate.userId !== userId) {
        updates.referredBy = affiliate.userId;
        updates.affiliateCode = args.affiliateCode;
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
    if (user) {
      if (user.tier === undefined) {
        await ctx.db.patch(userId, { tier: getTier(user.email) });
        return await ctx.db.get(userId);
      }
      return user;
    }

    // User record missing but authenticated (e.g. deleted or sync issue)
    // Try to recover from identity
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    // Re-create user with 100 starting credits
    const newUserId = await ctx.db.insert("users", {
      name: identity.name || identity.email?.split("@")[0] || "User",
      email: identity.email,
      image: identity.pictureUrl,
      credits: 100,
      studyCredits: 100,
      tier: getTier(identity.email),
    });

    return await ctx.db.get(newUserId);
  },
});