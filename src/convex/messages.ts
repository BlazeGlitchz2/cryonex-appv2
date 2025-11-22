import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const list = query({
  args: { chatId: v.id("chats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});

export const listByBranch = query({
  args: {
    chatId: v.id("chats"),
    branchId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) return [];

    const branchId = args.branchId || "main";

    return await ctx.db
      .query("messages")
      .withIndex("by_branch", (q) => q.eq("chatId", args.chatId).eq("branchId", branchId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    chatId: v.id("chats"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    model: v.optional(v.string()),
    responseTime: v.optional(v.number()),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          name: v.string(),
          type: v.string(),
          size: v.number(),
        })
      )
    ),
    sources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          domain: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) {
      throw new Error("Chat not found or unauthorized");
    }

    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: user._id,
      role: args.role,
      content: args.content,
      model: args.model,
      responseTime: args.responseTime,
      attachments: args.attachments,
      sources: args.sources,
    });
  },
});

export const createInBranch = mutation({
  args: {
    chatId: v.id("chats"),
    branchId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    model: v.optional(v.string()),
    responseTime: v.optional(v.number()),
    parentMessageId: v.optional(v.id("messages")),
    attachments: v.optional(
      v.array(
        v.object({
          storageId: v.id("_storage"),
          name: v.string(),
          type: v.string(),
          size: v.number(),
        })
      )
    ),
    sources: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          domain: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) {
      throw new Error("Chat not found or unauthorized");
    }

    return await ctx.db.insert("messages", {
      chatId: args.chatId,
      userId: user._id,
      role: args.role,
      content: args.content,
      model: args.model,
      responseTime: args.responseTime,
      branchId: args.branchId,
      parentMessageId: args.parentMessageId,
      attachments: args.attachments,
      sources: args.sources,
    });
  },
});

export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    const chat = await ctx.db.get(message.chatId);
    if (!chat || chat.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.messageId);
  },
});

export const deleteMessagesFromIndex = mutation({
  args: {
    chatId: v.id("chats"),
    fromIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();

    const messagesToDelete = messages.slice(args.fromIndex);
    
    for (const msg of messagesToDelete) {
      await ctx.db.delete(msg._id);
    }
  },
});