"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { generateTextWithFallback } from "./lib/aiRouting";
import { requireAuthenticatedUser } from "./lib/requireAuth";

export const generateTitle = action({
  args: {
    chatId: v.id("chats"),
    firstMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuthenticatedUser(ctx);
    let userMessage = args.firstMessage;

    if (!userMessage) {
      // Small delay to allow message to be written
      await new Promise((resolve) => setTimeout(resolve, 500));

      const messages = await ctx.runQuery((api as any).messages.list, {
        chatId: args.chatId,
      });
      if (messages.length < 1) {
        console.log("[Title] No messages found for chat:", args.chatId);
        return;
      }
      userMessage = messages[0].content;
    }

    if (!userMessage) {
      console.log("[Title] No message content found to generate title");
      return;
    }

    // Truncate message if too long to save tokens
    if (userMessage.length > 500) {
      userMessage = userMessage.substring(0, 500) + "...";
    }

    let title = "New Chat";
    try {
      const { content, provider, model } = await generateTextWithFallback({
        workload: "title",
        messages: [
          {
            role: "system",
            content:
              "Generate a very short, concise title (max 5 words) for this chat based on the user's message. Do not use quotes. Do not be chatty. Just output the title.",
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        maxTokens: 20,
      });

      title = content.replace(/^["']|["']$/g, "").trim() || title;
      console.log(`[Title] Success with ${provider}/${model}: "${title}"`);
    } catch (error) {
      console.error("[Title] All providers failed to generate title", error);
      console.error("[Title] All providers failed to generate title");
      // Fallback to first few words of message if all else fails
      const words = userMessage.split(" ");
      if (words.length > 0) {
        title = words.slice(0, 4).join(" ");
        if (title.length > 30) title = title.substring(0, 30) + "...";
      }
    }

    await ctx.runMutation((api as any).chats.rename, {
      chatId: args.chatId,
      title,
    });
  },
});
