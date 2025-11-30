import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("libraryItems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    prompt: v.string(),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("libraryItems", {
      userId: user._id,
      title: args.title,
      prompt: args.prompt,
      category: args.category || "General", // Default category if none provided
      imageUrl: args.imageUrl,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("libraryItems"),
    title: v.string(),
    prompt: v.string(),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== user._id) {
      throw new Error("Item not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      title: args.title,
      prompt: args.prompt,
      category: args.category || "General",
      imageUrl: args.imageUrl,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("libraryItems") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== user._id) {
      throw new Error("Item not found or unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});