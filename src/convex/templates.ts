import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const q = ctx.db.query("promptTemplates").withIndex("by_user", (q) =>
      q.eq("userId", userId)
    );
    const results = await q.order("desc").collect();
    return results;
  },
});

export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const q = ctx.db
      .query("promptTemplates")
      .withIndex("by_isPublic", (q) => q.eq("isPublic", true));
    const results = await q.order("desc").collect();
    return results;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const _id = await ctx.db.insert("promptTemplates", {
      userId,
      title: args.title.trim(),
      content: args.content,
      category: args.category,
      tags: args.tags,
      isPublic: !!args.isPublic,
      usageCount: 0,
      updatedAt: Date.now(),
    });
    return _id;
  },
});

export const update = mutation({
  args: {
    id: v.id("promptTemplates"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Template not found");
    if (existing.userId !== userId) throw new Error("Forbidden");

    await ctx.db.patch(args.id, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.content !== undefined ? { content: args.content } : {}),
      ...(args.category !== undefined ? { category: args.category } : {}),
      ...(args.tags !== undefined ? { tags: args.tags } : {}),
      ...(args.isPublic !== undefined ? { isPublic: args.isPublic } : {}),
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const remove = mutation({
  args: { id: v.id("promptTemplates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("Template not found");
    if (existing.userId !== userId) throw new Error("Forbidden");
    await ctx.db.delete(args.id);
    return true;
  },
});

export const incrementUsage = mutation({
  args: { id: v.id("promptTemplates") },
  handler: async (ctx, args) => {
    const tmpl = await ctx.db.get(args.id);
    if (!tmpl) return false;
    await ctx.db.patch(args.id, {
      usageCount: (tmpl.usageCount ?? 0) + 1,
      updatedAt: Date.now(),
    });
    return true;
  },
});
