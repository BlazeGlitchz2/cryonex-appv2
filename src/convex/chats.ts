import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: {
    search: v.optional(v.string()),
    includeArchived: v.optional(v.boolean()),
    pinnedOnly: v.optional(v.boolean()),
    libraryItemId: v.optional(v.id("libraryItems")),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!user) return [];

    let baseQuery = ctx.db
      .query("chats")
      .withIndex("by_user", (q) => q.eq("userId", user._id));

    // Apply search filter if provided
    if (args.search) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("title"), args.search!));
    }

    // Filter by library item if provided
    if (args.libraryItemId) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("libraryItemId"), args.libraryItemId));
    }

    // Filter by project if provided
    if (args.projectId) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("projectId"), args.projectId));
    }

    // Filter archived if not including them
    if (!args.includeArchived) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("isArchived"), false));
    }

    // Filter pinned if requested
    if (args.pinnedOnly) {
      baseQuery = baseQuery.filter((q) => q.eq(q.field("isPinned"), true));
    }

    const allChats = await baseQuery.order("desc").collect();

    // Sort: pinned first, then by lastMessageAt or creation time
    return allChats.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aTime = a.lastMessageAt || a._creationTime;
      const bTime = b.lastMessageAt || b._creationTime;
      return bTime - aTime;
    });
  },
});

export const get = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) return null;

    return chat;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    model: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    libraryItemId: v.optional(v.id("libraryItems")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    const userId = args.userId || user?._id;
    if (!userId) throw new Error("User ID required");

    return await ctx.db.insert("chats", {
      userId: userId,
      title: args.title,
      model: args.model,
      projectId: args.projectId,
      libraryItemId: args.libraryItemId,
      isPinned: false,
      isArchived: false,
      lastMessageAt: Date.now(),
    });
  },
});

export const createBranch = mutation({
  args: {
    chatId: v.id("chats"),
    branchName: v.string(),
    parentMessageIndex: v.number(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    const branchId = `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const branches = chat.branches || [];

    const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    const color = args.color || colors[branches.length % colors.length];

    branches.push({
      id: branchId,
      name: args.branchName,
      color,
      parentMessageIndex: args.parentMessageIndex,
      createdAt: Date.now(),
      isFavorite: false,
      isArchived: false,
    });

    await ctx.db.patch(args.chatId, {
      branches,
      currentBranchId: branchId,
      timelinePosition: args.parentMessageIndex,
    });

    return branchId;
  },
});

export const updateBranch = mutation({
  args: {
    chatId: v.id("chats"),
    branchId: v.string(),
    name: v.optional(v.string()),
    isFavorite: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    const branches = chat.branches || [];
    const branchIndex = branches.findIndex(b => b.id === args.branchId);

    if (branchIndex === -1) throw new Error("Branch not found");

    if (args.name !== undefined) branches[branchIndex].name = args.name;
    if (args.isFavorite !== undefined) branches[branchIndex].isFavorite = args.isFavorite;
    if (args.isArchived !== undefined) branches[branchIndex].isArchived = args.isArchived;

    await ctx.db.patch(args.chatId, { branches });
  },
});

export const deleteBranch = mutation({
  args: {
    chatId: v.id("chats"),
    branchId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    if (args.branchId === "main") throw new Error("Cannot delete main branch");

    const branches = (chat.branches || []).filter(b => b.id !== args.branchId);

    await ctx.db.patch(args.chatId, {
      branches,
      currentBranchId: chat.currentBranchId === args.branchId ? "main" : chat.currentBranchId,
    });

    // Delete messages in this branch
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_branch", (q) => q.eq("chatId", args.chatId).eq("branchId", args.branchId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});

export const setTimelinePosition = mutation({
  args: {
    chatId: v.id("chats"),
    position: v.number(),
    branchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    const updates: any = { timelinePosition: args.position };
    if (args.branchId !== undefined) updates.currentBranchId = args.branchId;

    await ctx.db.patch(args.chatId, updates);
  },
});

export const update = mutation({
  args: {
    chatId: v.id("chats"),
    title: v.optional(v.string()),
    model: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
    isArchived: v.optional(v.boolean()),
    lastMessageAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.model !== undefined) updates.model = args.model;
    if (args.isPinned !== undefined) updates.isPinned = args.isPinned;
    if (args.isArchived !== undefined) updates.isArchived = args.isArchived;
    if (args.lastMessageAt !== undefined) updates.lastMessageAt = args.lastMessageAt;

    await ctx.db.patch(args.chatId, updates);
  },
});

export const rename = mutation({
  args: { chatId: v.id("chats"), title: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.chatId, { title: args.title });
  },
});

export const deleteChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    // Delete linked messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(args.chatId);
  },
});

export const shareChat = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    // Placeholder for share logic (e.g., generate public link or export)
    return { shareUrl: `/shared/${args.chatId}` };
  },
});

export const remove = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.delete(args.chatId);
  },
});

export const togglePin = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.chatId, {
      isPinned: !chat.isPinned,
    });
  },
});

export const toggleArchive = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.chatId, {
      isArchived: !chat.isArchived,
    });
  },
});

export const dismissActivity = mutation({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.chatId, {
      isDismissedFromActivity: true,
    });
  },
});