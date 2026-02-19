import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const latestVersion = query({
    args: {
        platform: v.union(v.literal("ios"), v.literal("android")),
        currentVersion: v.string(),
    },
    handler: async (ctx, args) => {
        const latest = await ctx.db
            .query("app_versions")
            .withIndex("by_platform_createdAt", (q) =>
                q.eq("platform", args.platform)
            )
            .order("desc")
            .first();

        if (!latest) return null;

        // Simple string comparison for now. Ideally use semver.
        // If latest version is different from current, offer update.
        // In a real app, rely on a semver library or strict comparison.
        if (latest.version !== args.currentVersion) {
            return {
                version: latest.version,
                url: latest.url,
                notes: latest.notes,
                createdAt: latest.createdAt,
                mandatory: latest.mandatory,
            };
        }
        return null;
    },
});

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

export const registerVersion = mutation({
    args: {
        version: v.string(),
        platform: v.union(v.literal("ios"), v.literal("android")),
        storageId: v.id("_storage"),
        notes: v.optional(v.string()),
        mandatory: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const url = await ctx.storage.getUrl(args.storageId);
        if (!url) throw new Error("Invalid storage ID");

        await ctx.db.insert("app_versions", {
            version: args.version,
            platform: args.platform,
            storageId: args.storageId,
            url,
            notes: args.notes,
            mandatory: args.mandatory,
            createdAt: Date.now(),
        });
    },
});
