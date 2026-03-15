import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to get user ID
async function getUserId(ctx: any) {
  return await getAuthUserId(ctx);
}

function getLevelFromPoints(totalPoints: number) {
  return Math.floor(totalPoints / 250) + 1;
}

// --- FSRS-4.5 (Free Spaced Repetition Scheduler) ---
// Industry-leading algorithm matching Anki's FSRS.
// Uses stability (S), difficulty (D), and retrievability (R).

// Default FSRS-4.5 parameters (optimized from research)
const FSRS_W = [
  0.4,    // w0: initial stability for Again
  0.6,    // w1: initial stability for Hard
  2.4,    // w2: initial stability for Good
  5.8,    // w3: initial stability for Easy
  4.93,   // w4: difficulty mean reversion speed
  0.94,   // w5: difficulty mean reversion target
  0.86,   // w6: difficulty update based on grade
  0.01,   // w7: stability after recall constant
  1.49,   // w8: stability after recall base
  0.14,   // w9: stability decay exponent
  0.94,   // w10: retrievability factor
  2.18,   // w11: stability after lapse
  0.05,   // w12: difficulty penalty on lapse
  0.34,   // w13: stability scaling on lapse
  1.26,   // w14: retrievability factor on lapse
  0.29,   // w15: hard penalty
  2.61,   // w16: easy bonus
];

const DAY_MS = 24 * 60 * 60 * 1000;

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

// Calculate initial difficulty from first rating
function initDifficulty(rating: number): number {
  return clamp(FSRS_W[4] - (rating - 3) * FSRS_W[5], 1, 10);
}

// Calculate initial stability from first rating
function initStability(rating: number): number {
  return Math.max(FSRS_W[rating - 1], 0.1);
}

// Retrievability: probability of recall after `elapsedDays` days
function retrievability(stability: number, elapsedDays: number): number {
  return Math.pow(1 + elapsedDays / (9 * stability), -1);
}

// Update difficulty after review
function nextDifficulty(d: number, rating: number): number {
  const newD = d - FSRS_W[6] * (rating - 3);
  // Mean reversion toward w4
  const meanReverted = FSRS_W[4] * (1 - FSRS_W[5]) + FSRS_W[5] * newD;
  return clamp(meanReverted, 1, 10);
}

// Stability after successful recall (rating >= 2)
function nextRecallStability(d: number, s: number, r: number, rating: number): number {
  let hardPenalty = 1;
  let easyBonus = 1;
  if (rating === 2) hardPenalty = FSRS_W[15];
  if (rating === 4) easyBonus = FSRS_W[16];

  return s * (
    1 + Math.exp(FSRS_W[8]) *
    (11 - d) *
    Math.pow(s, -FSRS_W[9]) *
    (Math.exp(FSRS_W[10] * (1 - r)) - 1) *
    hardPenalty *
    easyBonus
  );
}

// Stability after lapse (rating === 1)
function nextForgetStability(d: number, s: number, r: number): number {
  return Math.max(
    FSRS_W[11] *
    Math.pow(d, -FSRS_W[12]) *
    (Math.pow(s + 1, FSRS_W[13]) - 1) *
    Math.exp(FSRS_W[14] * (1 - r)),
    0.1
  );
}

// Desired retention → interval in days
function stabilityToInterval(stability: number, requestedRetention: number = 0.9): number {
  return Math.max(Math.round(9 * stability * (1 / requestedRetention - 1)), 1);
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
    const isFirstReview = !card.lastReviewedAt;

    // Get current FSRS state from card, or initialize
    let d = (card as any).fsrsDifficulty ?? 5.0;
    let s = (card as any).fsrsStability ?? 0;

    if (isFirstReview) {
      // First review: initialize FSRS parameters
      d = initDifficulty(args.rating);
      s = initStability(args.rating);
    } else {
      // Subsequent reviews: compute elapsed time and retrievability
      const elapsedMs = now - (card.lastReviewedAt || now);
      const elapsedDays = Math.max(elapsedMs / DAY_MS, 0.01);
      const r = retrievability(s, elapsedDays);

      // Update difficulty
      d = nextDifficulty(d, args.rating);

      // Update stability
      if (args.rating === 1) {
        s = nextForgetStability(d, s, r);
      } else {
        s = nextRecallStability(d, s, r, args.rating);
      }
    }

    // Calculate next review interval
    const intervalDays = stabilityToInterval(s);
    const nextReviewDate = now + intervalDays * DAY_MS;

    // Update status
    let status: "not_studied" | "learning" | "mastered" = "learning";
    if (args.rating === 4 && (card.correctCount || 0) > 3 && s > 20) {
      status = "mastered";
    }
    if (args.rating === 1) {
      status = "learning";
    }

    await ctx.db.patch(args.flashcardId, {
      reviewCount: (card.reviewCount || 0) + 1,
      correctCount: (card.correctCount || 0) + (args.rating > 1 ? 1 : 0),
      lastReviewedAt: now,
      nextReviewDate,
      status,
      // Store FSRS state on the card (schemaValidation: false allows this)
      fsrsDifficulty: d,
      fsrsStability: s,
    } as any);

    // Update user stats
    const stats = await ctx.db
      .query("studyStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (stats) {
      const totalPoints = stats.totalPoints + (args.rating > 1 ? 10 : 5);
      await ctx.db.patch(stats._id, {
        flashcardsReviewed: stats.flashcardsReviewed + 1,
        totalPoints,
        level: getLevelFromPoints(totalPoints),
        currentStreak: stats.currentStreak + 1,
      });
    }

    return {
      nextReviewDate,
      intervalDays,
      stability: Math.round(s * 100) / 100,
      difficulty: Math.round(d * 100) / 100,
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
