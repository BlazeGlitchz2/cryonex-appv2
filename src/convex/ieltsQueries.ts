import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveReview = mutation({
  args: {
    textTranscript: v.string(),
    estimatedBand: v.number(),
    fluencyFeedback: v.string(),
    vocabularyFeedback: v.string(),
    grammarFeedback: v.string(),
    generalAdvice: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    return await ctx.db.insert("ieltsReviews", {
      ...args,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const getUserReviews = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const q = ctx.db
      .query("ieltsReviews")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc");

    if (args.limit) {
      return await q.take(args.limit);
    }
    return await q.collect();
  },
});
