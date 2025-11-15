import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./users";

export const list = query({
  args: { chatId: v.optional(v.id("chats")) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    if (!args.chatId) return [];

    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== user._id) return [];

    return await ctx.db
      .query("kanbanBoards")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId!))
      .collect();
  },
});