import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const user = await ctx.db.get(userId);
    return user?.credits || 0;
  },
});

export const addCredits = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(), // For logging/audit in future
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const currentCredits = user.credits || 0;
    await ctx.db.patch(args.userId, {
      credits: currentCredits + args.amount,
    });

    return currentCredits + args.amount;
  },
});

export const spendCredits = mutation({
  args: {
    amount: v.number(),
    reason: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const currentCredits = user.credits || 0;
    if (currentCredits < args.amount) {
      throw new Error("Insufficient credits");
    }

    const newBalance = Math.round((currentCredits - args.amount) * 100) / 100;

    await ctx.db.patch(userId, {
      credits: newBalance,
    });

    // Log usage to creditUsage table for analytics
    await ctx.db.insert("creditUsage", {
      userId,
      amount: args.amount,
      type: extractUsageType(args.reason),
      description: args.reason,
      timestamp: Date.now(),
      balanceAfter: newBalance,
      metadata: args.metadata,
    });

    return newBalance;
  },
});

// Helper to extract usage type from reason string
function extractUsageType(reason: string): string {
  const lowerReason = reason.toLowerCase();
  if (lowerReason.includes("chat") || lowerReason.includes("message"))
    return "chat";
  if (lowerReason.includes("search")) return "search";
  if (lowerReason.includes("study") || lowerReason.includes("pdf"))
    return "study";
  if (lowerReason.includes("flashcard")) return "flashcards";
  if (lowerReason.includes("quiz")) return "quiz";
  if (lowerReason.includes("image")) return "image";
  return "other";
}

// Smart charge mutation with context-aware pricing and logging
export const charge = mutation({
  args: {
    amount: v.number(), // Credit cost (supports decimals like 0.25)
    type: v.string(), // "chat", "search", "study", etc.
    description: v.string(), // Human-readable description
    metadata: v.optional(v.any()), // Model, tokens, features, etc.
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const currentCredits = user.credits || 0;

    // Round to 2 decimal places for comparison
    const chargeAmount = Math.round(args.amount * 100) / 100;

    if (currentCredits < chargeAmount) {
      throw new Error(
        `Insufficient credits. You need ${chargeAmount} credits but only have ${currentCredits.toFixed(2)}.`,
      );
    }

    const newBalance = Math.round((currentCredits - chargeAmount) * 100) / 100;

    await ctx.db.patch(userId, {
      credits: newBalance,
    });

    // Log to creditUsage for analytics
    await ctx.db.insert("creditUsage", {
      userId,
      amount: chargeAmount,
      type: args.type,
      description: args.description,
      timestamp: Date.now(),
      balanceAfter: newBalance,
      metadata: args.metadata,
    });

    return {
      success: true,
      charged: chargeAmount,
      newBalance,
    };
  },
});

// Query to get credit usage history
export const getUsageHistory = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 50;

    return await ctx.db
      .query("creditUsage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

// Query to get usage statistics
export const getUsageStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const usage = await ctx.db
      .query("creditUsage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const stats: Record<string, { count: number; total: number }> = {};
    let totalSpent = 0;

    for (const entry of usage) {
      if (!stats[entry.type]) {
        stats[entry.type] = { count: 0, total: 0 };
      }
      stats[entry.type].count++;
      stats[entry.type].total += entry.amount;
      totalSpent += entry.amount;
    }

    return {
      totalSpent: Math.round(totalSpent * 100) / 100,
      byType: stats,
      totalActions: usage.length,
    };
  },
});

export const getStudyBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const user = await ctx.db.get(userId);
    return user?.studyCredits || 0;
  },
});

export const addStudyCredits = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const currentCredits = user.studyCredits || 0;
    await ctx.db.patch(args.userId, {
      studyCredits: currentCredits + args.amount,
    });

    return currentCredits + args.amount;
  },
});

export const spendStudyCredits = mutation({
  args: {
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const currentCredits = user.studyCredits || 0;
    if (currentCredits < args.amount) {
      throw new Error("Insufficient study credits");
    }

    await ctx.db.patch(userId, {
      studyCredits: currentCredits - args.amount,
    });

    return currentCredits - args.amount;
  },
});

export const redeemReferral = mutation({
  args: {
    referralCode: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Check if user has already been referred
    if (user.referredBy) {
      throw new Error("You have already redeemed a referral code");
    }

    // Find the referrer
    const referrerAffiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q) => q.eq("code", args.referralCode))
      .first();

    if (!referrerAffiliate) {
      // Fallback: check if it's a direct user affiliate code (if we implement that)
      // For now, assume affiliate code maps to affiliates table
      throw new Error("Invalid referral code");
    }

    const referrerUser = await ctx.db.get(referrerAffiliate.userId);
    if (!referrerUser) throw new Error("Referrer not found");

    if (referrerUser._id === userId) {
      throw new Error("You cannot refer yourself");
    }

    // IP Check to prevent abuse
    const currentSession = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (currentSession && currentSession.ip) {
      const existingReferralWithIp = await ctx.db
        .query("sessions")
        .filter((q) =>
          q.and(
            q.eq(q.field("ip"), currentSession.ip),
            q.neq(q.field("userId"), userId),
          ),
        )
        .first();

      // Note: This is a strict check, might block legitimate users on same wifi.
      // For now, we'll just log it or maybe allow it but flag it?
      // The user asked for "detects IP so no one just uses their other phone".
      // If we find another session with same IP that is NOT this user, it might be suspicious.
      // However, many users are behind NAT.
      // Let's implement a simple check: if the REFERRER has the same IP, block it.

      const referrerSession = await ctx.db
        .query("sessions")
        .withIndex("by_user", (q) => q.eq("userId", referrerUser._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();

      if (referrerSession && referrerSession.ip === currentSession.ip) {
        throw new Error("Cannot redeem referral from the same network address");
      }
    }

    // Award credits
    const REFERRAL_BONUS = 10;

    // Update Referrer
    const referrerCredits = referrerUser.credits || 0;
    await ctx.db.patch(referrerUser._id, {
      credits: referrerCredits + REFERRAL_BONUS,
    });

    // Update Referee (Current User)
    const userCredits = user.credits || 0;
    await ctx.db.patch(userId, {
      credits: userCredits + REFERRAL_BONUS,
      referredBy: referrerUser._id,
    });

    return { success: true, message: "Referral redeemed! You got 10 credits." };
  },
});

export const claimAdReward = mutation({
  args: {
    creditType: v.union(v.literal("main"), v.literal("study")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const REWARD_AMOUNT = 5;

    if (args.creditType === "main") {
      const currentCredits = user.credits || 0;
      await ctx.db.patch(userId, {
        credits: currentCredits + REWARD_AMOUNT,
      });
      return { newBalance: currentCredits + REWARD_AMOUNT };
    } else {
      const currentCredits = user.studyCredits || 0;
      await ctx.db.patch(userId, {
        studyCredits: currentCredits + REWARD_AMOUNT,
      });
      return { newBalance: currentCredits + REWARD_AMOUNT };
    }
  },
});
