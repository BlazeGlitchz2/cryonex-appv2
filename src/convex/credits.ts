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

        await ctx.db.patch(userId, {
            credits: currentCredits - args.amount,
        });

        return currentCredits - args.amount;
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
                .filter((q) => q.and(
                    q.eq(q.field("ip"), currentSession.ip),
                    q.neq(q.field("userId"), userId)
                ))
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
