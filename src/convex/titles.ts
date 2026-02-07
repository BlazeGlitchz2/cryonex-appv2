"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const generateTitle = action({
  args: {
    chatId: v.id("chats"),
    firstMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    // Provider configurations
    const providers = [
      {
        name: "Groq",
        key: process.env.GROQ_API_KEY,
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama-3.1-8b-instant",
      },
      {
        name: "OpenRouter",
        key: process.env.OPENROUTER_API_KEY,
        url: "https://openrouter.ai/api/v1/chat/completions",
        model: "meta-llama/llama-3-8b-instruct",
      },
      {
        name: "Sambanova",
        key: process.env.SAMBANOVA_API_KEY,
        url: "https://api.sambanova.ai/v1/chat/completions",
        model: "Meta-Llama-3.1-8B-Instruct",
      },
    ];

    let title = "New Chat";
    let success = false;

    for (const provider of providers) {
      if (!provider.key) {
        console.log(`[Title] Skipping ${provider.name} (No API Key)`);
        continue;
      }

      try {
        console.log(`[Title] Attempting generation with ${provider.name}...`);

        const response = await fetch(provider.url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: provider.model,
            messages: [
              {
                role: "system",
                content:
                  "Generate a very short, concise title (max 5 words) for this chat based on the user's message. Do not use quotes. Do not be chatty. Just output the title.",
              },
              { role: "user", content: userMessage },
            ],
            max_tokens: 20,
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error(
            `[Title] ${provider.name} failed: ${response.status} - ${errText}`,
          );
          continue;
        }

        const data = await response.json();
        const generatedTitle = data.choices?.[0]?.message?.content?.trim();

        if (generatedTitle) {
          title = generatedTitle.replace(/^["']|["']$/g, "");
          success = true;
          console.log(`[Title] Success with ${provider.name}: "${title}"`);
          break;
        }
      } catch (error) {
        console.error(`[Title] Error with ${provider.name}:`, error);
      }
    }

    if (!success) {
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
