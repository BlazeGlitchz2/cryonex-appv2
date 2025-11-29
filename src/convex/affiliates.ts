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

        let code = "";

        if (args.code) {
            // User provided a custom code
            code = args.code.toUpperCase().replace(/[^A-Z0-9]/g, "");
            if (code.length < 3) throw new Error("Code must be at least 3 characters.");
            
            const codeTaken = await ctx.db
                .query("affiliates")
                .withIndex("by_code", (q) => q.eq("code", code))
                .first();

            if (codeTaken) {
                throw new Error("Affiliate code already taken. Please try another.");
            }
        } else {
            // Generate a unique random code
            // 1. Get a clean 3-letter prefix from name or default to "USR"
            let baseName = (user.name || "USER").replace(/[^a-zA-Z]/g, "").toUpperCase();
            if (baseName.length < 3) baseName = "USER";
            const namePart = baseName.substring(0, 3);
            
            const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            
            // 2. Try up to 10 times to generate a unique code
            let isUnique = false;
            let attempts = 0;
            
            while (!isUnique && attempts < 10) {
                let randomPart = "";
                // Generate 5 random alphanumeric characters
                for (let i = 0; i < 5; i++) {
                    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                code = `${namePart}${randomPart}`;
                
                const existing = await ctx.db
                    .query("affiliates")
                    .withIndex("by_code", (q) => q.eq("code", code))
                    .first();
                
                if (!existing) {
                    isUnique = true;
                }
                attempts++;
            }
            
            // 3. Fallback if collision loop fails (extremely unlikely with 5 chars = ~60M combinations)
            if (!isUnique) {
                code = `${namePart}${Date.now().toString(36).toUpperCase().slice(-6)}`;
            }
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

export const getLeaderboard = query({
    args: {},
    handler: async (ctx) => {
        const affiliates = await ctx.db
            .query("affiliates")
            .collect();

        // Join with user names and sort by signups
        const leaderboard = await Promise.all(
            affiliates.map(async (aff) => {
                const user = await ctx.db.get(aff.userId);
                return {
                    id: aff._id,
                    name: user?.name || "Anonymous",
                    code: aff.code,
                    signups: aff.signups || 0,
                    clicks: aff.clicks || 0,
                };
            })
        );

        return leaderboard.sort((a, b) => b.signups - a.signups).slice(0, 10);
    },
});