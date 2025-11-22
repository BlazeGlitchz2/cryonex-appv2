import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    title: v.string(),
    materialId: v.optional(v.id("studyMaterials")),
    nodes: v.array(v.any()),
    edges: v.array(v.any()),
    layout: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const mindMapId = await ctx.db.insert("mindMaps", {
      userId,
      title: args.title,
      materialId: args.materialId,
      nodes: args.nodes,
      edges: args.edges,
      layout: args.layout || "hierarchical",
      metadata: args.metadata || {},
    });

    return mindMapId;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const mindMaps = await ctx.db
      .query("mindMaps")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();

    return mindMaps;
  },
});

export const get = query({
  args: { id: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const mindMap = await ctx.db.get(args.id);

    if (!mindMap) {
      return null;
    }

    if (mindMap.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return mindMap;
  },
});

export const update = mutation({
  args: {
    id: v.id("mindMaps"),
    title: v.optional(v.string()),
    nodes: v.optional(v.array(v.any())),
    edges: v.optional(v.array(v.any())),
    layout: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const mindMap = await ctx.db.get(args.id);
    if (!mindMap || mindMap.userId !== userId) {
      throw new Error("Unauthorized");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.nodes !== undefined) updates.nodes = args.nodes;
    if (args.edges !== undefined) updates.edges = args.edges;
    if (args.layout !== undefined) updates.layout = args.layout;
    if (args.metadata !== undefined) updates.metadata = args.metadata;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("mindMaps") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const mindMap = await ctx.db.get(args.id);
    if (!mindMap || mindMap.userId !== userId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});
