import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { ROLES } from "./schema";

export const getOrCreateChat = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existingChat = await ctx.db
      .query("supportChats")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("status"), "open"))
      .first();

    if (existingChat) {
      return existingChat._id;
    }

    return await ctx.db.insert("supportChats", {
      userId: user._id,
      status: "open",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getMessages = query({
  args: { chatId: v.id("supportChats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const chat = await ctx.db.get(args.chatId);
    if (!chat) return [];

    const isAdmin = user.role === ROLES.ADMIN;
    if (chat.userId !== user._id && !isAdmin) {
      return [];
    }

    return await ctx.db
      .query("supportMessages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});

export const sendMessage = mutation({
  args: {
    chatId: v.id("supportChats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error("Chat not found");

    const isAdmin = user.role === ROLES.ADMIN;
    if (chat.userId !== user._id && !isAdmin) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.chatId, {
      updatedAt: Date.now(),
      status: "open",
    });

    return await ctx.db.insert("supportMessages", {
      chatId: args.chatId,
      senderId: user._id,
      content: args.content,
      createdAt: Date.now(),
      isAdmin: isAdmin,
    });
  },
});

export const adminListChats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.ADMIN) {
      return [];
    }

    const chats = await ctx.db
      .query("supportChats")
      .order("desc") // default ordering by creation usually if no index applied for descending
      .collect();

    // Fetch user details for each chat
    return Promise.all(
      chats.map(async (chat) => {
        const chatUser = (await ctx.db.get(chat.userId)) as any;
        return {
          ...chat,
          userName: chatUser?.name || chatUser?.email || "Unknown User",
          userImage: (chatUser?.image as string) || null,
        };
      })
    );
  },
});

export const adminCloseChat = mutation({
  args: { chatId: v.id("supportChats") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.chatId, {
      status: "resolved",
      updatedAt: Date.now(),
    });
  },
});
