import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Authenticated helper
async function getUserId(ctx: any) {
  return await getAuthUserId(ctx);
}

// Simple balance getters used by UI components
export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return 0;
    const wallet = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return wallet?.cryoCredits ?? 0;
  },
});

export const getStudyBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return 0;
    const wallet = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return (wallet as any)?.studyCredits ?? 0;
  },
});

// Ensure every user has a wallet
export const getWallet = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    let wallet = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return wallet;
  },
});

// Create wallet if it doesn't exist (can be called on login or first focus session)
export const initWallet = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const existing = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existing) {
      return await ctx.db.insert("wallet", {
        userId,
        cryoCredits: 0,
        totalFocusMinutes: 0,
        lastFocusDate: 0,
        currentStreak: 0,
      });
    }
    return existing._id;
  },
});

// The Focus-to-Earn Minting Logic
export const logFocusSession = mutation({
  args: {
    durationMs: v.number(),
    interruptedCount: v.number(),
    status: v.union(v.literal("completed"), v.literal("failed_distracted")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let wallet = await ctx.db
      .query("wallet")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!wallet) {
      const newWalletId = await ctx.db.insert("wallet", {
        userId,
        cryoCredits: 0,
        totalFocusMinutes: 0,
        lastFocusDate: 0,
        currentStreak: 0,
      });
      wallet = await ctx.db.get(newWalletId);
    }

    // Core Economy Math
    // 1 CRYO Credit per 5 minutes of unbroken focus. 
    // If they interrupted >= 3 times, they get 0 (failed session).
    let creditsEarned = 0;
    const minutesFocused = Math.floor(args.durationMs / 60000);

    if (args.status === "completed" && args.interruptedCount < 3) {
      creditsEarned = Math.floor(minutesFocused / 5);

      // Streak Bonus
      const now = new Date();
      const lastFocus = new Date(wallet!.lastFocusDate);

      // Simple day boundary check (reset at midnight local time rough math)
      const isNextDay = now.getDate() !== lastFocus.getDate() && now.getTime() - lastFocus.getTime() < 86400000 * 2;

      let newStreak = wallet!.currentStreak;
      if (isNextDay) {
        newStreak += 1;
        // +1 bonus credit for maintaining a streak
        creditsEarned += 1;
      } else if (now.getTime() - lastFocus.getTime() > 86400000 * 2) {
        // Lost streak
        newStreak = 0;
      }

      await ctx.db.patch(wallet!._id, {
        cryoCredits: wallet!.cryoCredits + creditsEarned,
        totalFocusMinutes: wallet!.totalFocusMinutes + minutesFocused,
        lastFocusDate: now.getTime(),
        currentStreak: newStreak,
      });
    }

    // Log the session
    await ctx.db.insert("focusSessions", {
      userId,
      durationMs: args.durationMs,
      creditsEarned,
      interruptedCount: args.interruptedCount,
      status: args.status,
      timestamp: Date.now(),
    });

    return { creditsEarned, newTotal: (wallet!.cryoCredits + creditsEarned) };
  },
});
