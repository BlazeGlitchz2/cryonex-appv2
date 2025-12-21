import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to get user ID
async function getUserId(ctx: any) {
    return await getAuthUserId(ctx);
}

// Track quiz results by topic and update mastery
export const updateQuizResult = mutation({
    args: {
        quizId: v.id("quizzes"),
        results: v.array(v.object({
            questionIndex: v.number(),
            isCorrect: v.boolean(),
            topic: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args): Promise<{ success: boolean }> => {
        const userId = await getUserId(ctx);
        if (!userId) throw new Error("Authentication required");

        // Group results by topic
        const topicStats = new Map<string, { correct: number; total: number }>();

        for (const result of args.results) {
            if (result.topic) {
                const current = topicStats.get(result.topic) || { correct: 0, total: 0 };
                current.total++;
                if (result.isCorrect) current.correct++;
                topicStats.set(result.topic, current);
            }
        }

        // Update mastery for each topic
        for (const [topic, stats] of topicStats.entries()) {
            const score = Math.round((stats.correct / stats.total) * 100);

            const existing = await ctx.db
                .query("topicMastery")
                .withIndex("by_user_topic", (q) => q.eq("userId", userId).eq("topic", topic))
                .first();

            let newScore = score;
            // Simple moving average if existing data (weight new result 30%)
            if (existing) {
                newScore = Math.round(existing.masteryScore * 0.7 + score * 0.3);
            }

            const status: "strong" | "average" | "weak" =
                newScore >= 80 ? "strong" :
                    newScore >= 60 ? "average" : "weak";

            if (existing) {
                await ctx.db.patch(existing._id, {
                    masteryScore: newScore,
                    lastUpdated: Date.now(),
                    status,
                });
            } else {
                await ctx.db.insert("topicMastery", {
                    userId,
                    topic,
                    masteryScore: newScore,
                    lastUpdated: Date.now(),
                    status,
                });
            }
        }

        return { success: true };
    },
});

// Analyze weak areas based on real mastery data
export const getKnowledgeGaps = query({
    args: {},
    handler: async (ctx): Promise<Array<{ topic: string; score: number; status: "strong" | "weak" | "average" }>> => {
        const userId = await getUserId(ctx);
        if (!userId) return [];

        const mastery = await ctx.db
            .query("topicMastery")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        if (mastery.length === 0) {
            // Return empty or onboarding state
            return [];
        }

        return mastery.map(m => ({
            topic: m.topic,
            score: m.masteryScore,
            status: m.status as "strong" | "weak" | "average",
        })).sort((a, b) => a.score - b.score); // Sort by weakest first
    },
});

// Generate targeted review content for weak areas
export const generateTargetedReview = action({
    args: {
        topics: v.array(v.string()),
        materialId: v.id("studyMaterials"),
    },
    handler: async (ctx, args): Promise<string> => {
        // @ts-expect-error - internal types might be missing during initial build
        const material: any = await ctx.runQuery(internal.study.getMaterial as any, { materialId: args.materialId });
        if (!material || !material.content) {
            throw new Error("Material not found or empty");
        }

        const prompt: string = `Create a targeted review guide for the following weak topics: ${args.topics.join(", ")}.
    Focus ONLY on these topics.
    For each topic:
    1. Explain the core concept simply
    2. Address common misconceptions
    3. Provide a concrete example
    4. Add 2 practice questions with answers
    
    Base this on the following content:
    ${material.content.substring(0, 8000)}`;

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) throw new Error("OpenRouter API key not configured");

        const response: Response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "openai/gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            }),
        });

        const data: any = await response.json();
        return data.choices[0].message.content;
    },
});
