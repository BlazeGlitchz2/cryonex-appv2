import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  PLAN_ALLOWANCES,
  getUnifiedCryoCredits,
  type AppTier,
} from "../lib/pricing";

const POLLINATIONS_IMAGE_BASE_CREDITS: Record<string, number> = {
  flux: 1.25,
  zimage: 1.8,
  gptimage: 2.4,
  "gptimage-large": 4.5,
  kontext: 3.2,
  nanobanana: 2.1,
  "nanobanana-2": 2.8,
  "nanobanana-pro": 5.5,
  seedream: 3.6,
  seedream5: 3.6,
  klein: 2.2,
  "imagen-4": 3.2,
  "flux-2-dev": 2.5,
  "grok-imagine": 3.4,
  dirtberry: 2.0,
  "dirtberry-pro": 2.8,
  "p-image": 2.6,
  "p-image-edit": 3.4,
};

const POLLINATIONS_VIDEO_BASE_PER_SECOND: Record<string, number> = {
  "grok-video": 0.65,
  "ltx-2": 0.9,
  seedance: 1.1,
  "seedance-pro": 1.35,
  "p-video": 1.5,
  wan: 2.0,
  veo: 3.5,
};
const STARTER_GRANT_VERSION = 3;
const STUDY_REFILL_INTERVAL_MS = 24 * 60 * 60 * 1000;

async function getUserId(ctx: any) {
  return await getAuthUserId(ctx);
}

function resolveWalletTier(user?: { tier?: AppTier | string | null } | null) {
  if (user?.tier === "PLUS" || user?.tier === "PRO") {
    return user.tier;
  }

  return "FREE" as AppTier;
}

function getStarterWalletBalances(
  user?: {
    tier?: AppTier | string | null;
    credits?: number | null;
    studyCredits?: number | null;
  } | null,
) {
  const allowance = PLAN_ALLOWANCES[resolveWalletTier(user)];
  const refillFloor = Math.max(0, Number(allowance.studyCredits ?? 0));
  const unifiedStarter = getUnifiedCryoCredits(allowance);
  const legacyUserBalance =
    Number(user?.credits ?? 0) + Number(user?.studyCredits ?? 0);

  return {
    cryoCredits: Math.max(0, unifiedStarter, legacyUserBalance),
    studyCredits: 0,
    refillFloor,
  };
}

async function getWalletForDisplay(ctx: any, userId: any) {
  const wallet = await ctx.db
    .query("wallet")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();
  const user = await ctx.db.get(userId);
  const starter = getStarterWalletBalances(user);

  if (!wallet) {
    return {
      _id: null,
      userId,
      cryoCredits: starter.cryoCredits,
      studyCredits: starter.studyCredits,
      totalFocusMinutes: 0,
      lastFocusDate: 0,
      currentStreak: 0,
      isVirtual: true,
    };
  }

  const currentCryo = Number(wallet.cryoCredits ?? 0);
  const currentStudy = Number((wallet as any)?.studyCredits ?? 0);
  const starterGrantVersion = Number((wallet as any)?.starterGrantVersion ?? 0);
  const nextWallet: any = { ...wallet };
  let isVirtual = false;
  let effectiveBalance = currentCryo;

  if (starterGrantVersion < STARTER_GRANT_VERSION) {
    const migratedBalance = currentCryo + currentStudy;
    nextWallet.cryoCredits = Math.max(migratedBalance, starter.cryoCredits);
    nextWallet.studyCredits = 0;
    nextWallet.starterGrantVersion = STARTER_GRANT_VERSION;
    isVirtual = true;
    effectiveBalance = nextWallet.cryoCredits;
  }

  const isFreeTier = resolveWalletTier(user) === "FREE";
  const lastStudyRefillAt = Number((wallet as any)?.lastStudyRefillAt ?? 0);
  const refillDue =
    isFreeTier &&
    starter.refillFloor > 0 &&
    effectiveBalance < starter.refillFloor &&
    (lastStudyRefillAt === 0 ||
      Date.now() - lastStudyRefillAt >= STUDY_REFILL_INTERVAL_MS);

  if (refillDue) {
    nextWallet.cryoCredits = Math.max(effectiveBalance, starter.refillFloor);
    nextWallet.studyCredits = 0;
    nextWallet.lastStudyRefillAt = Date.now();
    isVirtual = true;
  }

  return isVirtual ? { ...nextWallet, isVirtual: true } : wallet;
}

async function getOrCreateWallet(ctx: any, userId: any) {
  let wallet = await ctx.db
    .query("wallet")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .first();

  if (!wallet) {
    const user = await ctx.db.get(userId);
    const starter = getStarterWalletBalances(user);
    const now = Date.now();
    const walletId = await ctx.db.insert("wallet", {
      userId,
      cryoCredits: starter.cryoCredits,
      studyCredits: 0,
      starterGrantVersion: STARTER_GRANT_VERSION,
      lastStudyRefillAt:
        resolveWalletTier(user) === "FREE" && starter.refillFloor > 0
          ? now
          : undefined,
      totalFocusMinutes: 0,
      lastFocusDate: 0,
      currentStreak: 0,
    } as any);
    wallet = await ctx.db.get(walletId);
  } else {
    const user = await ctx.db.get(userId);
    const starter = getStarterWalletBalances(user);
    const currentCryo = Number(wallet.cryoCredits ?? 0);
    const currentStudy = Number((wallet as any)?.studyCredits ?? 0);
    const starterGrantVersion = Number(
      (wallet as any)?.starterGrantVersion ?? 0,
    );

    if (starterGrantVersion < STARTER_GRANT_VERSION) {
      const nextCryo = Math.max(
        currentCryo + currentStudy,
        starter.cryoCredits,
      );
      const nextStudy = 0;

      if (
        nextCryo !== currentCryo ||
        nextStudy !== currentStudy ||
        starterGrantVersion !== STARTER_GRANT_VERSION
      ) {
        await ctx.db.patch(wallet._id, {
          cryoCredits: nextCryo,
          studyCredits: nextStudy,
          starterGrantVersion: STARTER_GRANT_VERSION,
        } as any);
        wallet = await ctx.db.get(wallet._id);
      }
    }

    const lastStudyRefillAt = Number((wallet as any)?.lastStudyRefillAt ?? 0);
    const currentBalance = Number(wallet?.cryoCredits ?? 0);
    const refillDue =
      resolveWalletTier(user) === "FREE" &&
      starter.refillFloor > 0 &&
      currentBalance < starter.refillFloor &&
      (lastStudyRefillAt === 0 ||
        Date.now() - lastStudyRefillAt >= STUDY_REFILL_INTERVAL_MS);

    if (refillDue) {
      await ctx.db.patch(wallet._id, {
        cryoCredits: Math.max(currentBalance, starter.refillFloor),
        studyCredits: 0,
        lastStudyRefillAt: Date.now(),
      } as any);
      wallet = await ctx.db.get(wallet._id);
    }
  }

  return wallet;
}

async function recordCreditUsage(
  ctx: any,
  userId: any,
  amount: number,
  type: string,
  description: string,
  balanceAfter: number,
  metadata?: any,
) {
  return await ctx.db.insert("creditUsage", {
    userId,
    amount,
    type,
    description,
    timestamp: Date.now(),
    balanceAfter,
    metadata,
  });
}

function getModelKey(model: string): string {
  return String(model || "")
    .replace(/^pollinations\//, "")
    .trim()
    .toLowerCase();
}

function roundCredits(value: number): number {
  return Math.max(0.1, Number(value.toFixed(2)));
}

function calculateGenerationCost(args: {
  mediaType: "image" | "video";
  model: string;
  width?: number;
  height?: number;
  duration?: number;
  audio?: boolean;
  hasReference?: boolean;
}) {
  const modelKey = getModelKey(args.model);

  if (args.mediaType === "image") {
    const base = POLLINATIONS_IMAGE_BASE_CREDITS[modelKey] ?? 2.0;
    const width = Math.max(256, Math.min(2048, args.width ?? 1024));
    const height = Math.max(256, Math.min(2048, args.height ?? 1024));
    const pixelMultiplier = (width * height) / (1024 * 1024);
    const referenceMultiplier = args.hasReference ? 1.2 : 1.0;
    const total = roundCredits(base * pixelMultiplier * referenceMultiplier);

    return {
      amount: total,
      breakdown: {
        base,
        pixelMultiplier: Number(pixelMultiplier.toFixed(2)),
        referenceMultiplier,
      },
    };
  }

  const duration = Math.max(1, Math.min(15, args.duration ?? 6));
  const basePerSecond = POLLINATIONS_VIDEO_BASE_PER_SECOND[modelKey] ?? 1.0;
  const audioMultiplier = args.audio ? 1.15 : 1.0;
  const total = roundCredits(basePerSecond * duration * audioMultiplier);

  return {
    amount: total,
    breakdown: {
      basePerSecond,
      duration,
      audioMultiplier,
    },
  };
}

export const getBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return 0;
    const wallet = await getWalletForDisplay(ctx, userId);
    return wallet?.cryoCredits ?? 0;
  },
});

export const getStudyBalance = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return 0;
    const wallet = await getWalletForDisplay(ctx, userId);
    return wallet?.cryoCredits ?? 0;
  },
});

export const getWallet = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    return await getWalletForDisplay(ctx, userId);
  },
});

export const getCreditSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return {
        main: 0,
        study: 0,
        focusMinutes: 0,
        streak: 0,
        status: "empty" as const,
      };
    }

    const wallet = await getWalletForDisplay(ctx, userId);
    const main = wallet?.cryoCredits ?? 0;
    const study = main;

    return {
      main,
      study,
      focusMinutes: wallet?.totalFocusMinutes ?? 0,
      streak: wallet?.currentStreak ?? 0,
      status:
        main <= 0
          ? ("empty" as const)
          : main < 1
            ? ("low" as const)
            : ("healthy" as const),
    };
  },
});

export const getRecentActivity = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("creditUsage")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 8);
  },
});

export const initWallet = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;
    const wallet = await getOrCreateWallet(ctx, userId);
    return wallet?._id ?? null;
  },
});

export const charge = mutation({
  args: {
    amount: v.number(),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const wallet = await getOrCreateWallet(ctx, userId);
    if (!wallet) throw new Error("Wallet unavailable");

    const amount = Math.max(0, Number(args.amount) || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid credit amount");
    }

    if (wallet.cryoCredits < amount) {
      throw new Error("Insufficient credits");
    }

    const nextBalance = Math.max(
      0,
      Number((wallet.cryoCredits - amount).toFixed(2)),
    );
    await ctx.db.patch(wallet._id, { cryoCredits: nextBalance });

    await recordCreditUsage(
      ctx,
      userId,
      -amount,
      args.type ?? "chat",
      args.description ?? `Charge: ${args.type ?? "chat"}`,
      nextBalance,
      args.metadata ?? null,
    );

    return {
      success: true,
      amount,
      type: args.type ?? "chat",
      description: args.description ?? "",
      metadata: args.metadata ?? null,
      balanceBefore: wallet.cryoCredits,
      balanceAfter: nextBalance,
    };
  },
});

export const estimateGenerationCost = query({
  args: {
    mediaType: v.union(v.literal("image"), v.literal("video")),
    model: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    audio: v.optional(v.boolean()),
    hasReference: v.optional(v.boolean()),
  },
  handler: async (_ctx, args) => {
    return calculateGenerationCost({
      mediaType: args.mediaType,
      model: args.model,
      width: args.width,
      height: args.height,
      duration: args.duration,
      audio: args.audio,
      hasReference: args.hasReference,
    });
  },
});

export const chargeGeneration = mutation({
  args: {
    mediaType: v.union(v.literal("image"), v.literal("video")),
    model: v.string(),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    audio: v.optional(v.boolean()),
    hasReference: v.optional(v.boolean()),
    promptLength: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const wallet = await getOrCreateWallet(ctx, userId);
    if (!wallet) throw new Error("Wallet unavailable");

    const cost = calculateGenerationCost({
      mediaType: args.mediaType,
      model: args.model,
      width: args.width,
      height: args.height,
      duration: args.duration,
      audio: args.audio,
      hasReference: args.hasReference,
    });

    if (wallet.cryoCredits < cost.amount) {
      throw new Error(
        `Insufficient credits. This ${args.mediaType} generation requires ${cost.amount.toFixed(2)} credits.`,
      );
    }

    const nextBalance = Math.max(
      0,
      Number((wallet.cryoCredits - cost.amount).toFixed(2)),
    );
    await ctx.db.patch(wallet._id, { cryoCredits: nextBalance });

    const usageId = await recordCreditUsage(
      ctx,
      userId,
      -cost.amount,
      `generation_${args.mediaType}`,
      `${args.mediaType.toUpperCase()} generation: ${args.model}`,
      nextBalance,
      {
        model: args.model,
        mediaType: args.mediaType,
        width: args.width,
        height: args.height,
        duration: args.duration,
        audio: args.audio,
        hasReference: args.hasReference,
        promptLength: args.promptLength ?? 0,
        breakdown: cost.breakdown,
        refunded: false,
      },
    );

    return {
      success: true,
      amount: cost.amount,
      balanceBefore: wallet.cryoCredits,
      balanceAfter: nextBalance,
      usageId,
      breakdown: cost.breakdown,
    };
  },
});

export const refundGenerationCharge = mutation({
  args: {
    usageId: v.id("creditUsage"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const wallet = await getOrCreateWallet(ctx, userId);
    if (!wallet) throw new Error("Wallet unavailable");

    const usage = await ctx.db.get(args.usageId);
    if (!usage || usage.userId !== userId) {
      throw new Error("Generation charge record not found");
    }

    if (!String(usage.type).startsWith("generation_") || usage.amount >= 0) {
      throw new Error("This usage record is not a generation charge");
    }

    if (usage.metadata?.refunded) {
      return {
        success: true,
        alreadyRefunded: true,
        amount: -usage.amount,
      };
    }

    const refundAmount = Math.abs(usage.amount);
    const nextBalance = Number((wallet.cryoCredits + refundAmount).toFixed(2));
    await ctx.db.patch(wallet._id, { cryoCredits: nextBalance });

    await ctx.db.patch(usage._id, {
      metadata: {
        ...(usage.metadata || {}),
        refunded: true,
        refundedAt: Date.now(),
        refundReason: args.reason ?? "Generation failed",
      },
    });

    await recordCreditUsage(
      ctx,
      userId,
      refundAmount,
      "generation_refund",
      `Refund: ${usage.description}`,
      nextBalance,
      {
        originalUsageId: usage._id,
        reason: args.reason ?? "Generation failed",
      },
    );

    return {
      success: true,
      amount: refundAmount,
      balanceAfter: nextBalance,
    };
  },
});

export const logFocusSession = mutation({
  args: {
    durationMs: v.number(),
    interruptedCount: v.number(),
    status: v.union(v.literal("completed"), v.literal("failed_distracted")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const wallet = await getOrCreateWallet(ctx, userId);
    if (!wallet) throw new Error("Wallet unavailable");

    let creditsEarned = 0;
    const minutesFocused = Math.floor(args.durationMs / 60000);

    if (args.status === "completed" && args.interruptedCount < 3) {
      creditsEarned = Math.floor(minutesFocused / 5);

      const now = new Date();
      const lastFocus = new Date(wallet.lastFocusDate);
      const isNextDay =
        now.getDate() !== lastFocus.getDate() &&
        now.getTime() - lastFocus.getTime() < 86400000 * 2;

      let newStreak = wallet.currentStreak;
      if (isNextDay) {
        newStreak += 1;
        creditsEarned += 1;
      } else if (now.getTime() - lastFocus.getTime() > 86400000 * 2) {
        newStreak = 0;
      }

      const nextBalance = wallet.cryoCredits + creditsEarned;
      await ctx.db.patch(wallet._id, {
        cryoCredits: nextBalance,
        totalFocusMinutes: wallet.totalFocusMinutes + minutesFocused,
        lastFocusDate: now.getTime(),
        currentStreak: newStreak,
      });

      if (creditsEarned > 0) {
        await recordCreditUsage(
          ctx,
          userId,
          creditsEarned,
          "focus_reward",
          `Focus session reward (${minutesFocused} min)`,
          nextBalance,
          {
            interruptedCount: args.interruptedCount,
            status: args.status,
          },
        );
      }
    }

    await ctx.db.insert("focusSessions", {
      userId,
      durationMs: args.durationMs,
      creditsEarned,
      interruptedCount: args.interruptedCount,
      status: args.status,
      timestamp: Date.now(),
    });

    return { creditsEarned, newTotal: wallet.cryoCredits + creditsEarned };
  },
});

export const redeemReferral = mutation({
  args: { referralCode: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const code = args.referralCode.trim().toUpperCase();
    if (!code) throw new Error("Please enter a referral code");

    const affiliate = await ctx.db
      .query("affiliates")
      .withIndex("by_code", (q: any) => q.eq("code", code))
      .first();

    if (!affiliate) throw new Error("Invalid referral code");
    if (affiliate.userId === userId) {
      throw new Error("You can't use your own referral code");
    }

    const wallet = await getOrCreateWallet(ctx, userId);
    const redeemerBalance = wallet.cryoCredits + 10;
    await ctx.db.patch(wallet._id, {
      cryoCredits: redeemerBalance,
    });
    await recordCreditUsage(
      ctx,
      userId,
      10,
      "referral_reward",
      `Referral code redeemed: ${code}`,
      redeemerBalance,
      { referralCode: code },
    );

    const referrerWallet = await getOrCreateWallet(ctx, affiliate.userId);
    const referrerBalance = referrerWallet.cryoCredits + 10;
    await ctx.db.patch(referrerWallet._id, {
      cryoCredits: referrerBalance,
    });
    await recordCreditUsage(
      ctx,
      affiliate.userId,
      10,
      "referral_bonus",
      `Referral signup reward: ${code}`,
      referrerBalance,
      { referredUserId: userId },
    );

    await ctx.db.patch(affiliate._id, {
      signups: (affiliate.signups || 0) + 1,
      earnings: (affiliate.earnings || 0) + 10,
    });

    return {
      message: "You earned 10 credits, and your referrer also got 10 credits.",
    };
  },
});

export const claimAdReward = mutation({
  args: { creditType: v.union(v.literal("main"), v.literal("study")) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const wallet = await getOrCreateWallet(ctx, userId);
    const reward = args.creditType === "study" ? 10 : 5;

    const nextBalance = Number((wallet.cryoCredits + reward).toFixed(2));
    await ctx.db.patch(wallet._id, {
      cryoCredits: nextBalance,
      studyCredits: 0,
    } as any);
    await recordCreditUsage(
      ctx,
      userId,
      reward,
      args.creditType === "study" ? "study_reward" : "ad_reward",
      args.creditType === "study"
        ? "Ad reward claimed for Cryo Credits (study flow)"
        : "Ad reward claimed for Cryo Credits",
      nextBalance,
      { creditType: args.creditType },
    );

    return { creditsEarned: reward };
  },
});

export const spendStudyCredits = internalMutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    reason: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const wallet = await getOrCreateWallet(ctx, args.userId);
    if (!wallet) {
      throw new Error("Credit wallet unavailable");
    }

    const amount = Math.max(0, Number(args.amount) || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid Cryo Credit amount");
    }

    const currentBalance = Number(wallet.cryoCredits ?? 0);
    if (currentBalance < amount) {
      throw new Error(
        `Insufficient Cryo Credits. This action requires ${amount} Cryo Credits.`,
      );
    }

    const nextBalance = Number((currentBalance - amount).toFixed(2));
    await ctx.db.patch(wallet._id, {
      cryoCredits: nextBalance,
      studyCredits: 0,
    } as any);

    await recordCreditUsage(
      ctx,
      args.userId,
      -amount,
      "cryo_charge",
      args.reason ?? "Cryo Credits spent",
      nextBalance,
      {
        creditType: "main",
        ...(args.metadata ?? {}),
      },
    );

    return {
      success: true,
      amount,
      balanceBefore: currentBalance,
      balanceAfter: nextBalance,
    };
  },
});
