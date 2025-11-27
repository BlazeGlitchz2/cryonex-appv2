"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
// Chat action with streaming support

export const sendMessage = action({
    args: {
        messages: v.array(v.object({
            role: v.string(),
            content: v.string(),
        })),
        model: v.string(),
        messageId: v.optional(v.id("messages")),
    },
    handler: async (ctx, args) => {
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            throw new Error("OpenRouter API key not configured on server");
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                    "HTTP-Referer": "https://cryonex.app",
                    "X-Title": "Cryonex Workspace",
                },
                body: JSON.stringify({
                    model: args.model,
                    messages: args.messages,
                    stream: !!args.messageId,
                    max_tokens: 4096,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
            }

            if (args.messageId) {
                if (!response.body) throw new Error("No response body");
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let done = false;
                let buffer = "";

                while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    done = doneReading;
                    const chunkValue = decoder.decode(value, { stream: true });
                    buffer += chunkValue;

                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

                    for (const line of lines) {
                        const trimmedLine = line.trim();
                        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;
                        if (trimmedLine.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(trimmedLine.slice(6));
                                const content = data.choices[0]?.delta?.content;
                                if (content) {
                                    await ctx.runMutation((api as any).messages.appendContent, {
                                        messageId: args.messageId,
                                        content
                                    });
                                }
                            } catch (e) {
                                console.error("Error parsing chunk", e);
                            }
                        }
                    }
                }
                return "Stream completed";
            } else {
                const data = await response.json();
                return data.choices[0]?.message?.content || "";
            }

        } catch (error: any) {
            console.error("Chat action error:", error);
            throw new Error(error.message || "Failed to generate response");
        }
    },
});
