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
