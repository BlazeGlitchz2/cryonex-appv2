import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Authenticated helper
async function getUserId(ctx: any) {
    return await getAuthUserId(ctx);
}

// Get all essays for the current user
export const listEssays = query({
    args: {},
    handler: async (ctx) => {
        const userId = await getUserId(ctx);
        if (!userId) return [];

        return await ctx.db
            .query("essays")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .order("desc")
            .collect();
    },
});

export const getEssay = query({
    args: { id: v.id("essays") },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) return null;

        const essay = await ctx.db.get(args.id);
        if (!essay || essay.userId !== userId) return null;

        return essay;
    },
});

export const createEssay = mutation({
    args: {
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const now = Date.now();
        return await ctx.db.insert("essays", {
            userId,
            title: args.title,
            content: "",
            totalWordCount: 0,
            totalTimeSpentMs: 0,
            status: "draft",
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const updateEssay = mutation({
    args: {
        id: v.id("essays"),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        wordCountDelta: v.optional(v.number()),
        timeSpentDeltaMs: v.optional(v.number()),
        status: v.optional(v.union(v.literal("draft"), v.literal("completed"))),
    },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const essay = await ctx.db.get(args.id);
        if (!essay || essay.userId !== userId) throw new Error("Essay not found");

        const updates: any = { updatedAt: Date.now() };
        if (args.title !== undefined) updates.title = args.title;
        if (args.content !== undefined) updates.content = args.content;
        if (args.status !== undefined) updates.status = args.status;

        // Accumulate metrics
        if (args.wordCountDelta !== undefined) {
            // Re-calculate raw word count from content just to be sure
            const rawCount = (args.content || essay.content).split(/\s+/).filter((w) => w.length > 0).length;
            updates.totalWordCount = rawCount;
        }
        if (args.timeSpentDeltaMs !== undefined) {
            updates.totalTimeSpentMs = essay.totalTimeSpentMs + args.timeSpentDeltaMs;
        }

        await ctx.db.patch(args.id, updates);
    },
});

// The core engine function: logs chunks of typing efficiently
export const logRevisions = mutation({
    args: {
        essayId: v.id("essays"),
        revisions: v.array(
            v.object({
                chunk: v.string(),
                actionType: v.union(v.literal("insert"), v.literal("delete"), v.literal("paste")),
                timestamp: v.number(),
                timeSinceLastKeystrokeMs: v.number(),
            })
        ),
    },
    handler: async (ctx, args) => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Not authenticated");

        const essay = await ctx.db.get(args.essayId);
        if (!essay || essay.userId !== userId) throw new Error("Essay not found");

        // Insert all queued revisions
        for (const rev of args.revisions) {
            await ctx.db.insert("essayRevisions", {
                essayId: args.essayId,
                userId,
                chunk: rev.chunk,
                actionType: rev.actionType,
                timestamp: rev.timestamp,
                timeSinceLastKeystrokeMs: rev.timeSinceLastKeystrokeMs,
            });
        }
    },
});

// Fetch playback history for the Verify Portal
export const getEssayPlayback = query({
    args: { essayId: v.id("essays") },
    handler: async (ctx, args) => {
        // Note: Verify portal may need to be public eventually, but for now we authenticate it
        // or we check if the essay exists and is marked as "shared".
        // For this build, we will allow anyone with the essayId URL to fetch the playback.

        const essay = await ctx.db.get(args.essayId);
        if (!essay) throw new Error("Essay not found");

        const revisions = await ctx.db
            .query("essayRevisions")
            .withIndex("by_essay_timestamp", (q) => q.eq("essayId", args.essayId))
            .collect();

        return {
            essay,
            revisions,
        };
    },
});
