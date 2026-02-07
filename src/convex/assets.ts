import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const saveAsset = mutation({
  args: {
    type: v.union(v.literal("image"), v.literal("video"), v.literal("audio")),
    url: v.string(),
    prompt: v.string(),
    model: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const assetId = await ctx.db.insert("generatedAssets", {
      userId,
      type: args.type,
      url: args.url,
      prompt: args.prompt,
      model: args.model,
      metadata: args.metadata,
    });

    return assetId;
  },
});

export const listAssets = query({
  args: {
    type: v.optional(
      v.union(v.literal("image"), v.literal("video"), v.literal("audio")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let q = ctx.db
      .query("generatedAssets")
      .withIndex("by_user", (q) => q.eq("userId", userId));

    if (args.type) {
      q = ctx.db
        .query("generatedAssets")
        .withIndex("by_user_and_type", (q) =>
          q.eq("userId", userId).eq("type", args.type!),
        );
    }

    return await q.order("desc").take(50);
  },
});

export const deleteAsset = mutation({
  args: {
    assetId: v.id("generatedAssets"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const asset = await ctx.db.get(args.assetId);
    if (!asset || asset.userId !== userId) {
      throw new Error("Asset not found or unauthorized");
    }

    await ctx.db.delete(args.assetId);
  },
});
