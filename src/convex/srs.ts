import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to get user ID
async function getUserId(ctx: any) {
  return await getAuthUserId(ctx);
}

// --- Spaced Repetition Algorithm (SM-2 inspired) ---

// Calculate next interval based on rating (1-4)
// 1: Wrong (reset)
// 2: Hard (small increase)
// 3: Good (standard increase)
// 4: Easy (large increase)
function calculateNextInterval(
  currentInterval: number,
  rating: number,
  reviewCount: number,
): number {
  const dayInMs = 24 * 60 * 60 * 1000;

  // First review
  if (reviewCount === 0) {
    switch (rating) {
      case 1:
        return 1 * dayInMs; // Wrong -> 1 day
      case 2:
        return 2 * dayInMs; // Hard -> 2 days
      case 3:
        return 4 * dayInMs; // Good -> 4 days
      case 4:
        return 7 * dayInMs; // Easy -> 7 days
      default:
        return 1 * dayInMs;
    }
  }

  // Subsequent reviews
  if (rating === 1) {
    return 1 * dayInMs; // Reset on wrong
  }

  // Ease factor multiplier
  let multiplier = 2.5;
  if (rating === 2) multiplier = 1.5; // Hard -> slower growth
  if (rating === 4) multiplier = 3.0; // Easy -> faster growth

  return Math.floor(currentInterval * multiplier);
}

export const getDueFlashcards = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const now = Date.now();
    const limit = args.limit || 50;

    const flashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter for cards due today or overdue
    // Also include cards that haven't been studied yet (nextReviewDate is undefined)
    const due = flashcards.filter((card) => {
      if (!card.nextReviewDate) return true; // New card
      return card.nextReviewDate <= now;
    });

    // Sort by due date (overdue first)
    return due
      .sort((a, b) => (a.nextReviewDate || 0) - (b.nextReviewDate || 0))
      .slice(0, limit);
  },
});

export const reviewFlashcard = mutation({
  args: {
    flashcardId: v.id("flashcards"),
    rating: v.union(v.literal(1), v.literal(2), v.literal(3), v.literal(4)), // 1=Wrong, 2=Hard, 3=Good, 4=Easy
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const card = await ctx.db.get(args.flashcardId);
    if (!card || card.userId !== userId)
      throw new Error("Card not found or unauthorized");

    const now = Date.now();
    const currentInterval =
      card.lastReviewedAt && card.nextReviewDate
        ? card.nextReviewDate - card.lastReviewedAt
        : 24 * 60 * 60 * 1000; // Default 1 day if new

    const nextInterval = calculateNextInterval(
      currentInterval,
      args.rating,
      card.reviewCount || 0,
    );
    const nextReviewDate = now + nextInterval;

    // Update status
    let status: "learning" | "mastered" = "learning";
    if (args.rating === 4 && (card.correctCount || 0) > 3) {
      status = "mastered";
    }

    await ctx.db.patch(args.flashcardId, {
      reviewCount: (card.reviewCount || 0) + 1,
      correctCount: (card.correctCount || 0) + (args.rating > 1 ? 1 : 0),
      lastReviewedAt: now,
      nextReviewDate,
      status,
    });

    // Update user stats
    const stats = await ctx.db
      .query("studyStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (stats) {
      await ctx.db.patch(stats._id, {
        flashcardsReviewed: stats.flashcardsReviewed + 1,
        totalPoints: stats.totalPoints + (args.rating > 1 ? 10 : 5),
        currentStreak: stats.currentStreak + 1, // Simple streak increment
      });
    }

    return {
      nextReviewDate,
      intervalDays: Math.round(nextInterval / (24 * 60 * 60 * 1000)),
    };
  },
});

export const getStudySchedule = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return { dueToday: 0, upcoming: [] };

    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const todayStart = Math.floor(now / dayInMs) * dayInMs;

    const flashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    let dueToday = 0;
    const upcoming: Record<string, number> = {};

    flashcards.forEach((card) => {
      if (!card.nextReviewDate) {
        dueToday++; // New cards count as due today
      } else if (card.nextReviewDate <= now) {
        dueToday++;
      } else {
        // Future reviews
        const daysFromNow = Math.floor((card.nextReviewDate - now) / dayInMs);
        if (daysFromNow <= 7) {
          // Look ahead 7 days
          const dateKey = new Date(card.nextReviewDate)
            .toISOString()
            .split("T")[0];
          upcoming[dateKey] = (upcoming[dateKey] || 0) + 1;
        }
      }
    });

    return {
      dueToday,
      upcoming: Object.entries(upcoming)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };
  },
});
