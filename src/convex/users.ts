import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  PLAN_ALLOWANCES,
  getUnifiedCryoCredits,
  type AppTier,
} from "../lib/pricing";

const PRO_EMAILS = ["ratrampage324@gmail.com", "viralcentral092@gmail.com"];

const getEmailTier = (email?: string): AppTier => {
  if (!email) return "FREE";
  return PRO_EMAILS.includes(email.toLowerCase()) ? "PRO" : "FREE";
};

const resolveTier = (existingTier?: AppTier, email?: string): AppTier => {
  const emailTier = getEmailTier(email);
  if (emailTier === "PRO") {
    return "PRO";
  }

  return existingTier ?? "FREE";
};

const DEFAULT_USER_RECOVERY_FIELDS = {
  preferredLanguage: "en" as const,
  schoolNetworkOptIn: false,
  discoverableInSchool: false,
  profileVisibility: "private" as const,
};

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase();

async function findUserByIdentity(
  ctx: QueryCtx | any,
  identity: {
    tokenIdentifier?: string | null;
    email?: string | null;
  } | null,
) {
  if (!identity) {
    return null;
  }

  if (identity.tokenIdentifier) {
    const byTokenIdentifier = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q: any) =>
        q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .first();

    if (byTokenIdentifier) {
      return byTokenIdentifier;
    }
  }

  const normalizedEmail = normalizeEmail(identity.email);
  if (!normalizedEmail) {
    return null;
  }

  return await ctx.db
    .query("users")
    .withIndex("email", (q: any) => q.eq("email", normalizedEmail))
    .first();
}

function getIdentityPatch(identity: {
  tokenIdentifier?: string | null;
  email?: string | null;
  name?: string | null;
  pictureUrl?: string | null;
}) {
  const normalizedEmail = normalizeEmail(identity.email);

  return {
    tokenIdentifier: identity.tokenIdentifier ?? undefined,
    email: normalizedEmail,
    name:
      identity.name ??
      (normalizedEmail ? normalizedEmail.split("@")[0] : undefined),
    image: identity.pictureUrl ?? undefined,
  };
}

function getRecoveryDefaults(existingUser?: {
  preferredLanguage?: "en" | "ar";
  schoolNetworkOptIn?: boolean;
  discoverableInSchool?: boolean;
  profileVisibility?: "private" | "school" | "public";
  tier?: AppTier;
  email?: string;
}) {
  const updates: Record<string, unknown> = {};

  if (!existingUser?.preferredLanguage) {
    updates.preferredLanguage = DEFAULT_USER_RECOVERY_FIELDS.preferredLanguage;
  }
  if (existingUser?.schoolNetworkOptIn === undefined) {
    updates.schoolNetworkOptIn =
      DEFAULT_USER_RECOVERY_FIELDS.schoolNetworkOptIn;
  }
  if (existingUser?.discoverableInSchool === undefined) {
    updates.discoverableInSchool =
      DEFAULT_USER_RECOVERY_FIELDS.discoverableInSchool;
  }
  if (!existingUser?.profileVisibility) {
    updates.profileVisibility = DEFAULT_USER_RECOVERY_FIELDS.profileVisibility;
  }

  const correctTier = resolveTier(existingUser?.tier, existingUser?.email);
  if (existingUser?.tier !== correctTier) {
    updates.tier = correctTier;
  }

  return updates;
}

async function syncSchoolMembership(
  ctx: any,
  userId: any,
  {
    schoolId,
    country,
    curriculumTrack,
    status,
    source,
  }: {
    schoolId?: string;
    country?: string;
    curriculumTrack?: string;
    status?: "unverified" | "verified";
    source: string;
  },
) {
  if (!schoolId) return;

  const existingMembership = await ctx.db
    .query("schoolMemberships")
    .withIndex("by_user_school", (q: any) =>
      q.eq("userId", userId).eq("schoolId", schoolId),
    )
    .first();

  const payload = {
    country,
    curriculumTrack,
    status: status || "unverified",
    source,
  };

  if (existingMembership) {
    await ctx.db.patch(existingMembership._id, payload);
    return;
  }

  await ctx.db.insert("schoolMemberships", {
    userId,
    schoolId,
    joinedAt: Date.now(),
    ...payload,
  });
}

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    // Resolve image URL if storage ID exists
    if (user.imageStorageId) {
      const imageUrl = await ctx.storage.getUrl(user.imageStorageId);
      if (imageUrl) {
        return { ...user, image: imageUrl };
      }
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId !== null) {
    const user = await ctx.db.get(userId);
    if (user) {
      return user;
    }
  }

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return await findUserByIdentity(ctx, identity);
};

export const incrementSearchCount = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const today = new Date().toISOString().split("T")[0];
    const lastSearchDate = user.lastSearchDate || "";
    const currentCount =
      lastSearchDate === today ? user.dailySearchCount || 0 : 0;

    await ctx.db.patch(userId, {
      dailySearchCount: currentCount + 1,
      lastSearchDate: today,
    });

    return { remaining: Math.max(0, 3 - (currentCount + 1)) };
  },
});

export const getSearchCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { count: 0, remaining: 3 };
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return { count: 0, remaining: 3 };
    }

    const today = new Date().toISOString().split("T")[0];
    const lastSearchDate = user.lastSearchDate || "";
    const currentCount =
      lastSearchDate === today ? user.dailySearchCount || 0 : 0;

    return { count: currentCount, remaining: Math.max(0, 3 - currentCount) };
  },
});

export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    userRole: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    source: v.optional(v.string()),
    affiliateCode: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
    experienceLevel: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    imageStorageId: v.optional(v.id("_storage")),
    region: v.optional(v.string()),
    curriculum: v.optional(v.string()),
    // Personalization
    country: v.optional(v.string()),
    schoolId: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    curriculumTrack: v.optional(v.string()),
    isRTL: v.optional(v.boolean()),
    enableCountryTheme: v.optional(v.boolean()),
    preferredLanguage: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    targetSubjects: v.optional(v.array(v.string())),
    targetExams: v.optional(v.array(v.string())),
    studyPace: v.optional(
      v.union(
        v.literal("light"),
        v.literal("balanced"),
        v.literal("intensive"),
      ),
    ),
    schoolNetworkOptIn: v.optional(v.boolean()),
    discoverableInSchool: v.optional(v.boolean()),
    profileVisibility: v.optional(
      v.union(v.literal("private"), v.literal("school"), v.literal("public")),
    ),
    schoolMembershipStatus: v.optional(
      v.union(v.literal("unverified"), v.literal("verified")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: any = {};
    if (args.name) updates.name = args.name;
    if (args.email) updates.email = args.email;
    if (args.image) updates.image = args.image;
    if (args.userRole) updates.userRole = args.userRole;
    if (args.goals) updates.goals = args.goals;
    if (args.source) updates.source = args.source;
    if (args.onboardingCompleted !== undefined)
      updates.onboardingCompleted = args.onboardingCompleted;
    if (args.experienceLevel) updates.experienceLevel = args.experienceLevel;
    if (args.interests) updates.interests = args.interests;
    if (args.imageStorageId) updates.imageStorageId = args.imageStorageId;
    if (args.region) updates.region = args.region;
    if (args.curriculum) updates.curriculum = args.curriculum;
    if (args.country) updates.country = args.country;
    if (args.schoolId) updates.schoolId = args.schoolId;
    if (args.gradeLevel) updates.gradeLevel = args.gradeLevel;
    if (args.curriculumTrack) updates.curriculumTrack = args.curriculumTrack;
    if (args.isRTL !== undefined) updates.isRTL = args.isRTL;
    if (args.enableCountryTheme !== undefined)
      updates.enableCountryTheme = args.enableCountryTheme;
    if (args.preferredLanguage)
      updates.preferredLanguage = args.preferredLanguage;
    if (args.targetSubjects) updates.targetSubjects = args.targetSubjects;
    if (args.targetExams) updates.targetExams = args.targetExams;
    if (args.studyPace) updates.studyPace = args.studyPace;
    if (args.schoolNetworkOptIn !== undefined)
      updates.schoolNetworkOptIn = args.schoolNetworkOptIn;
    if (args.discoverableInSchool !== undefined)
      updates.discoverableInSchool = args.discoverableInSchool;
    if (args.profileVisibility)
      updates.profileVisibility = args.profileVisibility;
    if (args.schoolMembershipStatus)
      updates.schoolMembershipStatus = args.schoolMembershipStatus;

    // Handle affiliate code linking
    if (args.affiliateCode) {
      const affiliate = await ctx.db
        .query("affiliates")
        .withIndex("by_code", (q) => q.eq("code", args.affiliateCode!))
        .first();

      if (affiliate && affiliate.userId !== userId) {
        updates.referredBy = affiliate.userId;
        // Increment signups for the affiliate
        await ctx.db.patch(affiliate._id, {
          signups: (affiliate.signups || 0) + 1,
        });
      }
    }

    await ctx.db.patch(userId, updates);

    await syncSchoolMembership(ctx, userId, {
      schoolId: args.schoolId,
      country: args.country,
      curriculumTrack: args.curriculumTrack,
      status: args.schoolMembershipStatus,
      source: "profile_update",
    });
  },
});

export const completeOnboarding = mutation({
  args: {
    name: v.string(),
    userRole: v.string(),
    goals: v.array(v.string()),
    image: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    experienceLevel: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    affiliateCode: v.optional(v.string()),
    region: v.optional(v.string()),
    curriculum: v.optional(v.string()),
    country: v.optional(v.string()),
    schoolId: v.optional(v.string()),
    gradeLevel: v.optional(v.string()),
    curriculumTrack: v.optional(v.string()),
    isRTL: v.optional(v.boolean()),
    preferredLanguage: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    targetSubjects: v.optional(v.array(v.string())),
    targetExams: v.optional(v.array(v.string())),
    studyPace: v.optional(
      v.union(
        v.literal("light"),
        v.literal("balanced"),
        v.literal("intensive"),
      ),
    ),
    schoolNetworkOptIn: v.optional(v.boolean()),
    discoverableInSchool: v.optional(v.boolean()),
    profileVisibility: v.optional(
      v.union(v.literal("private"), v.literal("school"), v.literal("public")),
    ),
    schoolMembershipStatus: v.optional(
      v.union(v.literal("unverified"), v.literal("verified")),
    ),
    tosAccepted: v.boolean(),
    privacyPolicyAccepted: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Validate ToS and Privacy Policy acceptance
    if (!args.tosAccepted) {
      throw new Error("You must accept the Terms of Service to continue");
    }
    if (!args.privacyPolicyAccepted) {
      throw new Error("You must accept the Privacy Policy to continue");
    }

    const now = Date.now();

    // Check if user already has credits (not a new user)
    const existingUser = await ctx.db.get(userId);
    const isNewUser =
      existingUser &&
      (existingUser.credits === undefined || existingUser.credits === null);

    const updates: any = {
      name: args.name,
      userRole: args.userRole,
      goals: args.goals,
      onboardingCompleted: true,
      tosAccepted: true,
      tosAcceptedAt: now,
      privacyPolicyAccepted: true,
      privacyPolicyAcceptedAt: now,
      tier: resolveTier(
        existingUser?.tier as AppTier | undefined,
        existingUser?.email,
      ),
    };

    const starterAllowance = PLAN_ALLOWANCES[updates.tier as AppTier];

    // Give new users the current starter balance
    if (isNewUser) {
      updates.credits = getUnifiedCryoCredits(starterAllowance);
      updates.studyCredits = 0;
    }

    if (args.image) updates.image = args.image;
    if (args.imageStorageId) updates.imageStorageId = args.imageStorageId;
    if (args.experienceLevel) updates.experienceLevel = args.experienceLevel;
    if (args.interests) updates.interests = args.interests;
    if (args.region) updates.region = args.region;
    if (args.curriculum) updates.curriculum = args.curriculum;
    if (args.country) updates.country = args.country;
    if (args.schoolId) updates.schoolId = args.schoolId;
    if (args.gradeLevel) updates.gradeLevel = args.gradeLevel;
    if (args.curriculumTrack) updates.curriculumTrack = args.curriculumTrack;
    if (args.isRTL !== undefined) updates.isRTL = args.isRTL;
    if (args.preferredLanguage)
      updates.preferredLanguage = args.preferredLanguage;
    if (args.targetSubjects) updates.targetSubjects = args.targetSubjects;
    if (args.targetExams) updates.targetExams = args.targetExams;
    if (args.studyPace) updates.studyPace = args.studyPace;
    if (args.schoolNetworkOptIn !== undefined)
      updates.schoolNetworkOptIn = args.schoolNetworkOptIn;
    if (args.discoverableInSchool !== undefined)
      updates.discoverableInSchool = args.discoverableInSchool;
    if (args.profileVisibility)
      updates.profileVisibility = args.profileVisibility;
    if (args.schoolMembershipStatus)
      updates.schoolMembershipStatus = args.schoolMembershipStatus;

    // Handle affiliate code linking
    if (args.affiliateCode) {
      const affiliate = await ctx.db
        .query("affiliates")
        .withIndex("by_code", (q) => q.eq("code", args.affiliateCode!))
        .first();

      if (affiliate && affiliate.userId !== userId) {
        updates.referredBy = affiliate.userId;
        updates.affiliateCode = args.affiliateCode;
        // Increment signups for the affiliate
        await ctx.db.patch(affiliate._id, {
          signups: (affiliate.signups || 0) + 1,
        });
      }
    }

    await ctx.db.patch(userId, updates);

    await syncSchoolMembership(ctx, userId, {
      schoolId: args.schoolId,
      country: args.country,
      curriculumTrack: args.curriculumTrack,
      status: args.schoolMembershipStatus,
      source: "onboarding",
    });
  },
});

export const deleteUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // In a real app, you'd delete related data too (cascading delete)
    // For now, just deleting the user record
    await ctx.db.delete(userId);
  },
});

export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const user = await ctx.db.get(userId);
      if (user) {
        const recoveryDefaults = getRecoveryDefaults(user);
        if (Object.keys(recoveryDefaults).length > 0) {
          await ctx.db.patch(userId, recoveryDefaults);
          return await ctx.db.get(userId);
        }
        return user;
      }
    }

    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const recoveredUser = await findUserByIdentity(ctx, identity);
    if (recoveredUser) {
      const identityPatch = getIdentityPatch(identity);
      const recoveryDefaults = getRecoveryDefaults(recoveredUser);
      const updates = Object.fromEntries(
        Object.entries({
          ...identityPatch,
          ...recoveryDefaults,
        }).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(recoveredUser._id, updates);
        return await ctx.db.get(recoveredUser._id);
      }

      return recoveredUser;
    }

    const tier = getEmailTier(identity.email);
    const allowance = PLAN_ALLOWANCES[tier];
    const unifiedCredits = getUnifiedCryoCredits(allowance);

    const newUserId = await ctx.db.insert("users", {
      ...getIdentityPatch(identity),
      credits: unifiedCredits,
      studyCredits: 0,
      tier,
      ...DEFAULT_USER_RECOVERY_FIELDS,
    });

    return await ctx.db.get(newUserId);
  },
});

export const upgradeToKimiGuest = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    await ctx.db.patch(userId, {
      name: "Kimi Guest",
      credits: 2000,
      studyCredits: 0,
      onboardingCompleted: true,
    });

    return { success: true };
  },
});

export const upgradeUserByEmail = mutation({
  args: {
    email: v.string(),
    tier: v.union(v.literal("FREE"), v.literal("PLUS"), v.literal("PRO")),
  },
  handler: async (ctx, args) => {
    // This is a dev/admin utility
    const users = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email.toLowerCase()))
      .collect();

    if (users.length === 0) {
      return { success: false, message: "User not found" };
    }

    const allowance = PLAN_ALLOWANCES[args.tier];
    const unifiedCredits = getUnifiedCryoCredits(allowance);

    for (const user of users) {
      await ctx.db.patch(user._id, {
        tier: args.tier,
        credits: Math.max(
          Number(user.credits || 0) + Number(user.studyCredits || 0),
          unifiedCredits,
        ),
        studyCredits: 0,
      });
    }

    return { success: true, count: users.length };
  },
});
export const checkProStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const correctTier = resolveTier(
      user.tier as AppTier | undefined,
      user.email,
    );
    if (user.tier !== correctTier) {
      await ctx.db.patch(userId, { tier: correctTier });
      return await ctx.db.get(userId);
    }
    return user;
  },
});
