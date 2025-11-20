import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getUserIdOrThrow(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export const create = mutation({
  args: {
    name: v.string(),
    term: v.optional(v.string()),
    examDate: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    return await ctx.db.insert("courses", {
      userId,
      ...args,
    });
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserIdOrThrow(ctx);
    return await ctx.db
      .query("courses")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const update = mutation({
  args: {
    courseId: v.id("courses"),
    name: v.optional(v.string()),
    term: v.optional(v.string()),
    examDate: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    const { courseId, ...updates } = args;
    
    const course = await ctx.db.get(courseId);
    if (!course || course.userId !== userId) {
      throw new Error("Course not found or unauthorized");
    }
    
    await ctx.db.patch(courseId, updates);
  },
});

export const remove = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const userId = await getUserIdOrThrow(ctx);
    
    const course = await ctx.db.get(args.courseId);
    if (!course || course.userId !== userId) {
      throw new Error("Course not found or unauthorized");
    }
    
    await ctx.db.delete(args.courseId);
  },
});
