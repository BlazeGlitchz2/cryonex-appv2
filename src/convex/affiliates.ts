import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { getCurrentUser } from "./users";
import { api } from "./_generated/api";
// Affiliate system functions

// Create or get affiliate profile
export const create = mutation({
    args: {
        code: v.optional(v.string()), // User can suggest a code
    },
    handler: async (ctx, args) => {
        const user = await getCurrentUser(ctx);
        if (!user) throw new Error("Not authenticated");

        const existingAffiliate = await ctx.db
            .query("affiliates")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (existingAffiliate) return existingAffiliate;

        // Generate code if not provided or if provided code is taken
        let code = args.code?.toUpperCase().replace(/[^A-Z0-9]/g, "") || "";

        if (!code || code.length < 3) {
            // Generate random code: 3 chars of name + 3 random numbers
            const namePart = (user.name || "USER").substring(0, 3).toUpperCase();
            const randomPart = Math.floor(100 + Math.random() * 900).toString();
            code = `${namePart}${randomPart}`;
        }

        // Check uniqueness
        const codeTaken = await ctx.db
            .query("affiliates")
            .withIndex("by_code", (q) => q.eq("code", code))
            .first();

        if (codeTaken) {
            throw new Error("Affiliate code already taken. Please try another.");
        }

        const affiliateId = await ctx.db.insert("affiliates", {
            userId: user._id,
            code,
            clicks: 0,
            signups: 0,
            earnings: 0,
            isActive: true,
        });

        // Link back to user
        await ctx.db.patch(user._id, {
            affiliateId,
            affiliateCode: code,
        });

        return { _id: affiliateId, code };
    },
});

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const user = await getCurrentUser(ctx);
        if (!user) return null;

        const affiliate = await ctx.db
            .query("affiliates")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .first();

        if (!affiliate) return null;

        // Get referrals
        const referrals = await ctx.db
            .query("users")
            .withIndex("by_affiliateCode", (q) => q.eq("affiliateCode", affiliate.code))
            .collect();

        // Filter out self (just in case)
        const validReferrals = referrals.filter(r => r._id !== user._id);

        return {
            ...affiliate,
            referralCount: validReferrals.length,
            referrals: validReferrals.map(r => ({
                name: r.name || "Anonymous",
                date: r._creationTime,
                status: "Active" // Placeholder
            })).slice(0, 10) // Limit to 10 for now
        };
    },
});

export const trackClick = action({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        // This would ideally be a mutation, but we want it public and fast
        // For now, we'll just use a mutation via runMutation
        await ctx.runMutation((api as any).affiliates.incrementClick, { code: args.code });
    },
});

export const incrementClick = mutation({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const affiliate = await ctx.db
            .query("affiliates")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        if (affiliate) {
            await ctx.db.patch(affiliate._id, {
                clicks: affiliate.clicks + 1,
            });
        }
    },
});

export const validateCode = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const affiliate = await ctx.db
            .query("affiliates")
            .withIndex("by_code", (q) => q.eq("code", args.code))
            .first();

        return !!affiliate;
    },
});
