import { v } from "convex/values";
import {
  mutation,
  query,
  internalMutation,
  internalQuery,
  action,
} from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  PLAN_ALLOWANCES,
  getUnifiedCryoCredits,
  type AppTier,
} from "../lib/pricing";

const PRO_EMAILS = ["ratrampage324@gmail.com", "viralcentral092@gmail.com"];
const DEFAULT_USER_RECOVERY_FIELDS = {
  preferredLanguage: "en" as const,
  schoolNetworkOptIn: false,
  discoverableInSchool: false,
  profileVisibility: "private" as const,
};

// Helper to get user ID
async function getUserId(ctx: any) {
  return await getAuthUserId(ctx);
}

function getLevelFromPoints(totalPoints: number) {
  return Math.floor(totalPoints / 250) + 1;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ARABIC_COUNTRIES = new Set(["sa", "eg", "ae", "qa", "kw", "om", "bh"]);

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase();

const getEmailTier = (email?: string | null): AppTier => {
  if (!email) return "FREE";
  return PRO_EMAILS.includes(email.toLowerCase()) ? "PRO" : "FREE";
};

const resolveTier = (
  existingTier?: AppTier,
  email?: string | null,
): AppTier => {
  const emailTier = getEmailTier(email);
  if (emailTier === "PRO") {
    return "PRO";
  }

  return existingTier ?? "FREE";
};

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

function toMaterialKey(id: unknown) {
  return String(id ?? "");
}

function getUserCurriculum(user: any) {
  return user?.curriculumTrack || user?.curriculum || "general";
}

function inferPrimaryLanguage(user: any): "ar" | "en" {
  if (user?.isRTL) return "ar";
  const country = String(user?.country || "").toLowerCase();
  const region = String(user?.region || "").toLowerCase();
  if (ARABIC_COUNTRIES.has(country)) return "ar";
  if (region === "ksa" || region === "egypt" || region === "mena") return "ar";
  return "en";
}

function inferExamTrack(user: any) {
  const region = String(user?.region || "").toLowerCase();
  const country = String(user?.country || "").toLowerCase();
  const curriculum = String(getUserCurriculum(user) || "").toLowerCase();

  if (
    region === "ksa" ||
    curriculum.includes("qiyas") ||
    curriculum.includes("tahsili")
  ) {
    return "qiyas_tahsili";
  }

  if (region === "egypt" || curriculum.includes("thanaweyya")) {
    return "thanaweyya_amma";
  }

  if (
    region === "uae" ||
    country === "ae" ||
    curriculum.includes("emsat") ||
    curriculum.includes("uae")
  ) {
    return "emsat";
  }

  if (curriculum.includes("ib")) return "ib";
  if (curriculum.includes("british") || curriculum.includes("cambridge"))
    return "british";
  if (curriculum.includes("american") || curriculum.includes("ap"))
    return "american";

  return "general";
}

function getRegionalFocus(user: any, examTrack: string) {
  const region = String(
    user?.region || user?.country || "global",
  ).toLowerCase();
  const primaryLanguage = inferPrimaryLanguage(user);

  if (examTrack === "qiyas_tahsili") {
    return {
      title: "Saudi exam lane",
      badge: "GAT / SAAT",
      description:
        "Keep drills timed, Arabic-aware, and shaped for Saudi exam pressure instead of generic practice.",
      primaryLanguage,
      direction: user?.isRTL ? "rtl" : "ltr",
    };
  }

  if (examTrack === "thanaweyya_amma") {
    return {
      title: "Egypt ministry lane",
      badge: "Thanaweyya Amma",
      description:
        "Prioritize high-yield revision, Arabic-first explanations, and question styles that feel exam-real.",
      primaryLanguage,
      direction: user?.isRTL ? "rtl" : "ltr",
    };
  }

  if (examTrack === "emsat") {
    return {
      title: "UAE exam lane",
      badge: "EmSAT",
      description:
        "Surface guided practice and study prompts that fit UAE exam expectations and bilingual study habits.",
      primaryLanguage,
      direction: user?.isRTL ? "rtl" : "ltr",
    };
  }

  if (primaryLanguage === "ar" || region === "mena") {
    return {
      title: "Arabic-first study flow",
      badge: "RTL ready",
      description:
        "Make regional context visible in the main flow with Arabic, RTL, and curriculum cues instead of hiding them in settings.",
      primaryLanguage,
      direction: user?.isRTL ? "rtl" : "ltr",
    };
  }

  return {
    title: "Personalized study flow",
    badge: "Adaptive",
    description:
      "Guide the student from source to next action with grounded outputs and visible study momentum.",
    primaryLanguage,
    direction: user?.isRTL ? "rtl" : "ltr",
  };
}

// Internal query to get user by email
export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .first();
  },
});

// Internal query to get user by tokenIdentifier (for auth methods without email)
export const getUserByTokenIdentifier = internalQuery({
  args: { tokenIdentifier: v.string() },
  handler: async (ctx, args) => {
    // tokenIdentifier often looks like "provider|userid" - we check both the full identifier
    // and extract just the provider-specific ID part for matching
    const users = await ctx.db.query("users").collect();
    return (
      users.find((u) => {
        // Check tokenIdentifier field if user has one stored
        if ((u as any).tokenIdentifier === args.tokenIdentifier) return true;
        // Check if subject matches (for some providers)
        const subject = args.tokenIdentifier.split("|").pop();
        if (subject && (u as any).subject === subject) return true;
        return false;
      }) || null
    );
  },
});

// Internal mutation to ensure a user record exists for the given identity
// This is called from actions that can't use getAuthUserId directly
export const ensureUserInternal = internalMutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    pictureUrl: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);

    // First try to find user by tokenIdentifier (most reliable)
    if (args.tokenIdentifier) {
      const existingByToken = await ctx.db
        .query("users")
        .withIndex("by_tokenIdentifier", (q) =>
          q.eq("tokenIdentifier", args.tokenIdentifier),
        )
        .first();
      if (existingByToken) {
        const updates = Object.fromEntries(
          Object.entries({
            ...getRecoveryDefaults(existingByToken as any),
            email: normalizedEmail ?? undefined,
          }).filter(([, value]) => value !== undefined),
        );

        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(existingByToken._id, updates);
          return await ctx.db.get(existingByToken._id);
        }

        return existingByToken;
      }
    }

    // Then try to find user by email
    if (normalizedEmail) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", normalizedEmail))
        .first();
      if (existingUser) {
        const updates = Object.fromEntries(
          Object.entries({
            tokenIdentifier:
              args.tokenIdentifier && !(existingUser as any).tokenIdentifier
                ? args.tokenIdentifier
                : undefined,
            ...getRecoveryDefaults(existingUser as any),
          }).filter(([, value]) => value !== undefined),
        );

        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(existingUser._id, updates);
          return await ctx.db.get(existingUser._id);
        }

        return existingUser;
      }
    }

    // User not found, create a new one with tokenIdentifier
    const tier = resolveTier(undefined, normalizedEmail);
    const allowance = PLAN_ALLOWANCES[tier];
    const unifiedCredits = getUnifiedCryoCredits(allowance);
    const newUserId = await ctx.db.insert("users", {
      name: args.name || normalizedEmail?.split("@")[0] || "User",
      email: normalizedEmail,
      image: args.pictureUrl,
      tokenIdentifier: args.tokenIdentifier,
      credits: unifiedCredits,
      studyCredits: 0,
      tier,
      ...DEFAULT_USER_RECOVERY_FIELDS,
    });

    return await ctx.db.get(newUserId);
  },
});

// Internal mutations for server-side use (called from actions)
export const createNoteInternal = internalMutation({
  args: {
    userId: v.id("users"),
    materialId: v.optional(v.id("studyMaterials")),
    title: v.string(),
    content: v.string(),
    format: v.union(
      v.literal("markdown"),
      v.literal("html"),
      v.literal("text"),
    ),
    isAIGenerated: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("studyNotes", {
      ...args,
      visibility: "private",
      isPublic: false,
    });
  },
});

export const createFlashcardInternal = internalMutation({
  args: {
    userId: v.id("users"),
    noteId: v.optional(v.id("studyNotes")),
    materialId: v.optional(v.id("studyMaterials")),
    front: v.string(),
    back: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("flashcards", {
      ...args,
      reviewCount: 0,
      correctCount: 0,
    });
  },
});

export const createQuizInternal = internalMutation({
  args: {
    userId: v.id("users"),
    materialId: v.optional(v.id("studyMaterials")),
    title: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        type: v.union(
          v.literal("multiple_choice"),
          v.literal("true_false"),
          v.literal("fill_blank"),
          v.literal("essay"),
        ),
        options: v.optional(v.array(v.string())),
        correctAnswer: v.string(),
        explanation: v.optional(v.string()),
        topic: v.optional(v.string()),
      }),
    ),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizzes", args);
  },
});

// Study Materials
export const createMaterial = mutation({
  args: {
    title: v.string(),
    type: v.union(
      v.literal("pdf"),
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("text"),
      v.literal("youtube"),
      v.literal("link"),
    ),
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    folderId: v.optional(v.id("studyFolders")),
    docId: v.optional(v.string()),
    visibility: v.optional(
      v.union(v.literal("private"), v.literal("school"), v.literal("public")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    return await ctx.db.insert("studyMaterials", {
      userId,
      ...args,
      visibility: args.visibility || "private",
      isPublic: args.visibility === "public",
    });
  },
});

export const listMaterials = query({
  args: { folderId: v.optional(v.id("studyFolders")) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    if (args.folderId) {
      const materials = await ctx.db
        .query("studyMaterials")
        .withIndex("by_folder", (q) => q.eq("folderId", args.folderId))
        .collect();
      // Ensure these belong to user
      return materials.filter((m) => m.userId === userId);
    }

    return await ctx.db
      .query("studyMaterials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getRecentMaterials = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 5;

    return await ctx.db
      .query("studyMaterials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

export const createFolder = mutation({
  args: {
    name: v.string(),
    color: v.optional(v.string()),
    parentId: v.optional(v.id("studyFolders")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    return await ctx.db.insert("studyFolders", {
      userId,
      ...args,
    });
  },
});

export const listFolders = query({
  args: { parentId: v.optional(v.id("studyFolders")) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    if (args.parentId) {
      const folders = await ctx.db
        .query("studyFolders")
        .withIndex("by_parent", (q) => q.eq("parentId", args.parentId))
        .collect();
      return folders.filter((f) => f.userId === userId);
    }

    return await ctx.db
      .query("studyFolders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getStudyRecommendations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return {
        recommendationsVersion: 2,
        dueFlashcardsCount: 0,
        recentMaterials: [],
        suggestions: [],
        nextActions: [],
        primaryAction: null,
        activeRecall: {
          dueNowCount: 0,
          dueTodayCount: 0,
          newCardsCount: 0,
          masteredRate: 0,
        },
        groundedStudy: {
          averageReadiness: 0,
          materialsNeedingAssets: 0,
          totalRecentMaterials: 0,
        },
        personalization: {
          region: "global",
          country: "global",
          curriculum: "general",
          examTrack: "general",
          primaryLanguage: "en",
          direction: "ltr",
          schoolId: null,
        },
        materialInsights: [],
      };
    }

    const now = Date.now();
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = now + DAY_MS;
    const dayAgo = now - DAY_MS;

    const user = await ctx.db.get(userId);

    // Grounded source data
    const allFlashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const allNotes = await ctx.db
      .query("studyNotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const allQuizzes = await ctx.db
      .query("quizzes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const recentSessions = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("startTime"), dayAgo))
      .collect();

    const todayGoals = await ctx.db
      .query("dailyGoals")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", today),
      )
      .collect();

    // Active recall readiness
    const dueNow = allFlashcards.filter(
      (card) => (card.nextReviewDate || 0) > 0 && card.nextReviewDate! <= now,
    );
    const dueSoon = allFlashcards.filter(
      (card) =>
        (card.nextReviewDate || 0) > 0 && card.nextReviewDate! <= tomorrow,
    );
    const newCards = allFlashcards.filter(
      (card) => (card.reviewCount || 0) === 0,
    );
    const masteredCards = allFlashcards.filter(
      (card) => card.status === "mastered",
    );

    const masteredRate =
      allFlashcards.length > 0
        ? Math.round((masteredCards.length / allFlashcards.length) * 100)
        : 0;

    // Get recent materials for grounded "next action" guidance
    const recentMaterials = await ctx.db
      .query("studyMaterials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(5);

    const flashcardsByMaterial = new Map<string, number>();
    for (const card of allFlashcards) {
      const key = toMaterialKey(card.materialId);
      if (!key) continue;
      flashcardsByMaterial.set(key, (flashcardsByMaterial.get(key) || 0) + 1);
    }

    const notesByMaterial = new Map<string, number>();
    for (const note of allNotes) {
      const key = toMaterialKey(note.materialId);
      if (!key) continue;
      notesByMaterial.set(key, (notesByMaterial.get(key) || 0) + 1);
    }

    const quizzesByMaterial = new Map<string, number>();
    for (const quiz of allQuizzes) {
      const key = toMaterialKey(quiz.materialId);
      if (!key) continue;
      quizzesByMaterial.set(key, (quizzesByMaterial.get(key) || 0) + 1);
    }

    const materialInsights = recentMaterials.map((material) => {
      const key = toMaterialKey(material._id);
      const hasSummary = Boolean(
        material.summary?.short || material.summary?.detailed,
      );
      const notesCount = notesByMaterial.get(key) || 0;
      const flashcardsCount = flashcardsByMaterial.get(key) || 0;
      const quizzesCount = quizzesByMaterial.get(key) || 0;

      const readinessParts = [
        hasSummary ? 1 : 0,
        notesCount > 0 ? 1 : 0,
        flashcardsCount > 0 ? 1 : 0,
        quizzesCount > 0 ? 1 : 0,
      ];
      const readiness = Math.round(
        (readinessParts.reduce((sum, val) => sum + val, 0) /
          readinessParts.length) *
          100,
      );

      const missing: string[] = [];
      if (!hasSummary) missing.push("summary");
      if (notesCount === 0) missing.push("notes");
      if (flashcardsCount === 0) missing.push("flashcards");
      if (quizzesCount === 0) missing.push("quizzes");

      let nextStep:
        | "build_summary"
        | "generate_notes"
        | "generate_flashcards"
        | "generate_quiz"
        | "resume_practice" = "resume_practice";

      if (!hasSummary) nextStep = "build_summary";
      else if (notesCount === 0) nextStep = "generate_notes";
      else if (flashcardsCount === 0) nextStep = "generate_flashcards";
      else if (quizzesCount === 0) nextStep = "generate_quiz";

      return {
        id: material._id,
        title: material.title,
        type: material.type,
        readiness,
        missing,
        nextStep,
        flashcardsCount,
        notesCount,
        quizzesCount,
      };
    });

    const leastReadyMaterial = [...materialInsights].sort(
      (a, b) => a.readiness - b.readiness,
    )[0];

    const dayStudyMinutes = Math.round(
      recentSessions.reduce(
        (sum, session) => sum + (session.duration || 0),
        0,
      ) / 60000,
    );
    const completedGoals = todayGoals.filter((goal) => goal.isCompleted).length;

    const nextActions: Array<{
      id: string;
      title: string;
      description: string;
      priority: "high" | "medium" | "low";
      action: string;
      materialId?: string;
      track?: string;
    }> = [];

    if (dueNow.length > 0) {
      nextActions.push({
        id: "review_due_cards",
        title: `Review ${dueNow.length} due flashcards`,
        description:
          "Your active-recall window is open now. Clearing this first protects retention.",
        priority: "high",
        action: "open_flashcards",
      });
    }

    if (leastReadyMaterial && leastReadyMaterial.readiness < 75) {
      nextActions.push({
        id: "ground_material",
        title: `Ground ${leastReadyMaterial.title}`,
        description:
          leastReadyMaterial.missing.length > 0
            ? `Missing: ${leastReadyMaterial.missing.join(", ")}. Build these from this source before moving on.`
            : "Strengthen this source with one more active-recall artifact.",
        priority: "high",
        action: leastReadyMaterial.nextStep,
        materialId: leastReadyMaterial.id,
      });
    }

    if (todayGoals.length === 0) {
      nextActions.push({
        id: "set_goal",
        title: "Set today's study goal",
        description:
          "Students who define one target task early are more likely to finish the session loop.",
        priority: "medium",
        action: "create_daily_goal",
      });
    } else if (completedGoals < todayGoals.length) {
      nextActions.push({
        id: "finish_goal",
        title: "Close today's open goal",
        description:
          "Keep your completion loop tight by finishing one active goal before starting another lane.",
        priority: "medium",
        action: "complete_daily_goal",
      });
    }

    if (recentMaterials.length > 0 && dayStudyMinutes < 30) {
      nextActions.push({
        id: "focus_block",
        title: "Run a 25-minute focus block",
        description:
          "You have study materials ready, but recent focused time is low. One sprint will restore momentum.",
        priority: "medium",
        action: "start_focus_mode",
      });
    }

    const examTrack = inferExamTrack(user);
    if (
      examTrack === "qiyas_tahsili" ||
      examTrack === "thanaweyya_amma" ||
      examTrack === "emsat"
    ) {
      nextActions.push({
        id: "regional_track",
        title:
          examTrack === "qiyas_tahsili"
            ? "Open Qiyas/Tahsili training lane"
            : examTrack === "thanaweyya_amma"
              ? "Open Thanaweyya training lane"
              : "Open EmSAT training lane",
        description:
          examTrack === "emsat"
            ? "Use UAE-specific practice to keep revision aligned with EmSAT expectations."
            : "Use region-specific practice to keep review aligned with your local exam format.",
        priority: "low",
        action: "open_regional_trainer",
        track: examTrack,
      });
    }

    const averageReadiness =
      materialInsights.length > 0
        ? Math.round(
            materialInsights.reduce(
              (sum, material) => sum + material.readiness,
              0,
            ) / materialInsights.length,
          )
        : 0;

    const materialsNeedingAssets = materialInsights.filter(
      (material) => material.missing.length > 0,
    ).length;

    return {
      recommendationsVersion: 2,
      dueFlashcardsCount: dueSoon.length,
      recentMaterials: recentMaterials.map((m) => ({
        id: m._id,
        title: m.title,
        type: m.type,
      })),
      suggestions: nextActions.slice(0, 4).map((action) => action.title),
      nextActions,
      primaryAction: nextActions[0] || null,
      activeRecall: {
        dueNowCount: dueNow.length,
        dueTodayCount: dueSoon.length,
        newCardsCount: newCards.length,
        masteredRate,
      },
      groundedStudy: {
        averageReadiness,
        materialsNeedingAssets,
        totalRecentMaterials: materialInsights.length,
      },
      personalization: {
        region: user?.region || "global",
        country: user?.country || "global",
        curriculum: getUserCurriculum(user),
        examTrack,
        primaryLanguage: inferPrimaryLanguage(user),
        direction: user?.isRTL ? "rtl" : "ltr",
        schoolId: user?.schoolId || null,
      },
      regionalFocus: getRegionalFocus(user, examTrack),
      trustSignals: [
        "Ground answers in the student's own uploaded material whenever possible.",
        "Prefer active-recall next steps over generic summaries.",
        inferPrimaryLanguage(user) === "ar"
          ? "Keep Arabic and RTL visible in the main study flow."
          : "Keep the next best action visible after every upload.",
      ],
      materialInsights,
      sessionContext: {
        dayStudyMinutes,
        goalsToday: todayGoals.length,
        goalsCompleted: completedGoals,
      },
    };
  },
});

// Study Notes
export const createNote = mutation({
  args: {
    materialId: v.optional(v.id("studyMaterials")),
    title: v.string(),
    content: v.string(),
    format: v.union(
      v.literal("markdown"),
      v.literal("html"),
      v.literal("text"),
    ),
    isAIGenerated: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    return await ctx.db.insert("studyNotes", {
      userId,
      ...args,
    });
  },
});

export const listNotes = query({
  args: { materialId: v.optional(v.id("studyMaterials")) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    if (args.materialId) {
      const notes = await ctx.db
        .query("studyNotes")
        .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
        .collect();
      return notes.filter((n) => n.userId === userId);
    }

    return await ctx.db
      .query("studyNotes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const updateNote = mutation({
  args: {
    noteId: v.id("studyNotes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId)
      throw new Error("Not found or unauthorized");

    const { noteId, ...updates } = args;
    await ctx.db.patch(noteId, updates);
  },
});

export const deleteNote = mutation({
  args: { noteId: v.id("studyNotes") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== userId)
      throw new Error("Not found or unauthorized");

    await ctx.db.delete(args.noteId);
  },
});

// Flashcards
export const createFlashcard = mutation({
  args: {
    noteId: v.optional(v.id("studyNotes")),
    materialId: v.optional(v.id("studyMaterials")),
    front: v.string(),
    back: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    return await ctx.db.insert("flashcards", {
      userId,
      reviewCount: 0,
      correctCount: 0,
      ...args,
    });
  },
});

export const deleteFlashcard = mutation({
  args: { flashcardId: v.id("flashcards") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const flashcard = await ctx.db.get(args.flashcardId);
    if (!flashcard || flashcard.userId !== userId)
      throw new Error("Not found or unauthorized");

    await ctx.db.delete(args.flashcardId);
  },
});

export const updateFlashcard = mutation({
  args: {
    flashcardId: v.id("flashcards"),
    front: v.optional(v.string()),
    back: v.optional(v.string()),
    difficulty: v.optional(
      v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const flashcard = await ctx.db.get(args.flashcardId);
    if (!flashcard || flashcard.userId !== userId)
      throw new Error("Not found or unauthorized");

    const { flashcardId, ...updates } = args;
    await ctx.db.patch(flashcardId, updates);
  },
});

export const listFlashcards = query({
  args: {
    noteId: v.optional(v.id("studyNotes")),
    materialId: v.optional(v.id("studyMaterials")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    if (args.noteId) {
      const flashcards = await ctx.db
        .query("flashcards")
        .withIndex("by_note", (q) => q.eq("noteId", args.noteId))
        .collect();
      return flashcards.filter((f) => f.userId === userId);
    }

    if (args.materialId) {
      const flashcards = await ctx.db
        .query("flashcards")
        .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
        .collect();
      return flashcards.filter((f) => f.userId === userId);
    }

    return await ctx.db
      .query("flashcards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const listAllFlashcards = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("flashcards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const recordStudySession = mutation({
  args: {
    duration: v.number(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    // Create session record
    await ctx.db.insert("studySessions", {
      userId: user._id,
      startTime: Date.now(),
      duration: args.duration,
      endTime: Date.now(),
      activityType: "reading",
    });

    // Update stats
    const stats = await ctx.db
      .query("studyStats")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (stats) {
      const totalPoints =
        stats.totalPoints + Math.floor(args.duration / 60000) * 5;
      await ctx.db.patch(stats._id, {
        totalStudyTime: stats.totalStudyTime + args.duration,
        totalPoints,
        level: getLevelFromPoints(totalPoints),
      });
    }
  },
});

export const updateFlashcardReview = mutation({
  args: {
    flashcardId: v.id("flashcards"),
    rating: v.union(
      v.literal("wrong"),
      v.literal("hard"),
      v.literal("good"),
      v.literal("easy"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const flashcard = await ctx.db.get(args.flashcardId);
    if (!flashcard) throw new Error("Flashcard not found");
    if (flashcard.userId !== userId) throw new Error("Unauthorized");

    const reviewCount = (flashcard.reviewCount || 0) + 1;
    const isCorrect = args.rating !== "wrong";
    const correctCount = (flashcard.correctCount || 0) + (isCorrect ? 1 : 0);

    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    // SuperMemo-2 (SM-2) Algorithm implementation
    let easeFactor = flashcard.easeFactor || 2.5;
    let interval = flashcard.interval || 0; // interval in days

    // Convert rating to quality scalar (0-5)
    // wrong = 0, hard = 3, good = 4, easy = 5
    let quality: number;
    switch (args.rating) {
      case "wrong":
        quality = 0;
        break;
      case "hard":
        quality = 3;
        break;
      case "good":
        quality = 4;
        break;
      case "easy":
        quality = 5;
        break;
      default:
        quality = 0;
    }

    if (quality < 3) {
      // Failed card. Reset interval but try to preserve some ease
      interval = 1;
    } else {
      // Calculate next interval
      if (reviewCount === 1) {
        interval = 1;
      } else if (reviewCount === 2) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    }

    // Update ease factor safely
    easeFactor =
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReviewDate = now + interval * dayInMs;

    // Determine status based on performance
    let status: "not_studied" | "learning" | "mastered" = "learning";
    if (reviewCount === 0) {
      status = "not_studied";
    } else if (quality >= 4 && interval > 21) {
      status = "mastered";
    } else if (reviewCount > 0) {
      status = "learning";
    }

    await ctx.db.patch(args.flashcardId, {
      reviewCount,
      correctCount,
      nextReviewDate,
      lastReviewedAt: now,
      easeFactor,
      interval,
      status,
    });

    // Update stats
    const stats = await ctx.db
      .query("studyStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (stats) {
      const totalPoints = stats.totalPoints + (isCorrect ? 10 : 5);
      await ctx.db.patch(stats._id, {
        flashcardsReviewed: stats.flashcardsReviewed + 1,
        totalPoints,
        level: getLevelFromPoints(totalPoints),
      });
    }
  },
});

// Study Stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const stats = await ctx.db
      .query("studyStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return stats;
  },
});

export const initializeStats = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // Check if stats already exist
    const existingStats = await ctx.db
      .query("studyStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingStats) {
      return existingStats._id;
    }

    // Create initial stats
    return await ctx.db.insert("studyStats", {
      userId,
      totalStudyTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPoints: 0,
      level: 1,
      materialsCompleted: 0,
      quizzesCompleted: 0,
      flashcardsReviewed: 0,
    });
  },
});

export const startStudySession = mutation({
  args: {
    materialId: v.optional(v.id("studyMaterials")),
    noteId: v.optional(v.id("studyNotes")),
    activityType: v.union(
      v.literal("reading"),
      v.literal("note_taking"),
      v.literal("flashcards"),
      v.literal("quiz"),
      v.literal("diagram"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    return await ctx.db.insert("studySessions", {
      userId,
      startTime: Date.now(),
      ...args,
    });
  },
});

export const endStudySession = mutation({
  args: {
    sessionId: v.id("studySessions"),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");
    if (session.userId !== userId) throw new Error("Unauthorized");

    const endTime = Date.now();
    const duration = endTime - session.startTime;

    await ctx.db.patch(args.sessionId, {
      endTime,
      duration,
    });

    // Update stats
    const stats = await ctx.db
      .query("studyStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (stats) {
      const totalPoints = stats.totalPoints + Math.floor(duration / 60000) * 5;
      await ctx.db.patch(stats._id, {
        totalStudyTime: stats.totalStudyTime + duration,
        totalPoints,
        level: getLevelFromPoints(totalPoints),
      });
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const createQuiz = mutation({
  args: {
    materialId: v.optional(v.id("studyMaterials")),
    title: v.string(),
    questions: v.array(
      v.object({
        question: v.string(),
        type: v.union(
          v.literal("multiple_choice"),
          v.literal("true_false"),
          v.literal("fill_blank"),
          v.literal("essay"),
        ),
        options: v.optional(v.array(v.string())),
        correctAnswer: v.string(),
        explanation: v.optional(v.string()),
        topic: v.optional(v.string()),
      }),
    ),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    return await ctx.db.insert("quizzes", {
      userId,
      ...args,
    });
  },
});

export const listQuizzes = query({
  args: { materialId: v.optional(v.id("studyMaterials")) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    if (args.materialId) {
      const quizzes = await ctx.db
        .query("quizzes")
        .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
        .collect();
      return quizzes.filter((q) => q.userId === userId);
    }

    return await ctx.db
      .query("quizzes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getMaterialByDocId = query({
  args: { docId: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const materials = await ctx.db
      .query("studyMaterials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return materials.find((m) => m.docId === args.docId);
  },
});

export const getRecentStudyPacks = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const limit = args.limit || 4;

    return await ctx.db
      .query("studyPacks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

export const getStudyPack = query({
  args: { packId: v.id("studyPacks") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const pack = await ctx.db.get(args.packId);
    if (!pack || pack.userId !== userId) return null;

    return pack;
  },
});

// Internal query to get material (for autoGenerate to access userId)
export const getMaterial = internalQuery({
  args: { materialId: v.id("studyMaterials") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.materialId);
  },
});

// Add public mutation to save or update a note by docId (used by StudyWorkspace autosave)
export const saveOrUpdateNote: any = mutation({
  args: {
    docId: v.string(),
    content: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const existingNote = await ctx.db
      .query("studyNotes")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    if (existingNote) {
      if (existingNote.userId !== userId) throw new Error("Unauthorized");
      return await ctx.db.patch(existingNote._id, {
        content: args.content,
        title: args.title,
      });
    }

    return await ctx.db.insert("studyNotes", {
      userId,
      docId: args.docId,
      title: args.title,
      content: args.content,
      format: "markdown",
      visibility: "private",
      isPublic: false,
    });
  },
});

export const updateMaterialSummary = internalMutation({
  args: {
    materialId: v.id("studyMaterials"),
    summary: v.object({
      short: v.string(),
      detailed: v.string(),
      simple: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.materialId, {
      summary: args.summary,
    });
  },
});

export const upsertStudyPackInternal = internalMutation({
  args: {
    materialId: v.id("studyMaterials"),
    noteId: v.id("studyNotes"),
    quizId: v.id("quizzes"),
    conceptMapId: v.optional(v.id("mindMaps")),
    title: v.string(),
    description: v.optional(v.string()),
    focusPrompt: v.optional(v.string()),
    summary: v.object({
      short: v.string(),
      detailed: v.string(),
      simple: v.optional(v.string()),
    }),
    keyPoints: v.array(v.string()),
    practicePlan: v.array(v.string()),
    flashcardsCount: v.number(),
    quizQuestionsCount: v.number(),
    estimatedMinutes: v.number(),
    packStyle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.materialId);
    if (!material) {
      throw new Error("Material not found");
    }

    const existingPack = await ctx.db
      .query("studyPacks")
      .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
      .first();

    const packPayload = {
      userId: material.userId,
      materialId: args.materialId,
      noteId: args.noteId,
      quizId: args.quizId,
      conceptMapId: args.conceptMapId,
      title: args.title,
      sourceTitle: material.title,
      sourceKind: material.type,
      sourceDocId: material.docId,
      description:
        args.description ||
        args.summary.short ||
        `Source-grounded study pack for ${material.title}.`,
      focusPrompt: args.focusPrompt,
      summary: args.summary,
      keyPoints: args.keyPoints,
      practicePlan: args.practicePlan,
      flashcardsCount: args.flashcardsCount,
      quizQuestionsCount: args.quizQuestionsCount,
      estimatedMinutes: args.estimatedMinutes,
      packStyle: args.packStyle,
      tags: material.tags,
      updatedAt: Date.now(),
      visibility: existingPack?.visibility || material.visibility || "private",
      isPublic: existingPack?.isPublic || material.isPublic || false,
      shareId: existingPack?.shareId,
    };

    if (existingPack) {
      await ctx.db.patch(existingPack._id, packPayload);
      return existingPack._id;
    }

    return await ctx.db.insert("studyPacks", packPayload);
  },
});

// --- Daily Goals ---

export const getDailyGoals = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("dailyGoals")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", userId).eq("date", args.date),
      )
      .collect();
  },
});

export const getMindMap = query({
  args: { materialId: v.optional(v.id("studyMaterials")) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    if (!args.materialId) return null;

    return await ctx.db
      .query("mindMaps")
      .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
      .first();
  },
});

export const completeGoal = mutation({
  args: { goalId: v.id("dailyGoals"), isCompleted: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== userId)
      throw new Error("Goal not found or unauthorized");

    await ctx.db.patch(args.goalId, {
      isCompleted: args.isCompleted,
    });

    // Also update stats
    if (args.isCompleted) {
      const stats = await ctx.db
        .query("studyStats")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (stats) {
        const totalPoints = stats.totalPoints + 20;
        await ctx.db.patch(stats._id, {
          totalPoints,
          level: getLevelFromPoints(totalPoints),
        });
      }
    }
  },
});

export const createGoal = mutation({
  args: { text: v.string(), date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    return await ctx.db.insert("dailyGoals", {
      userId,
      text: args.text,
      isCompleted: false,
      date: args.date,
      createdAt: Date.now(),
    });
  },
});

export const generateDailyGoals = action({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // 1. Get recent materials for context
    // Note: We can't query directly in action, would need to call internal query
    return "Goals generated";
  },
});

export const getWeeklyActivity = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Fetch sessions from the last 7 days
    // Note: We don't have an index on startTime yet, so we'll filter in memory for now
    // Ideally, add an index on `by_user_startTime`
    const sessions = await ctx.db
      .query("studySessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.gte(q.field("startTime"), sevenDaysAgo))
      .collect();

    // Aggregate by day
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const activityMap = new Map<string, number>();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayName = days[date.getDay()];
      activityMap.set(dayName, 0);
    }

    sessions.forEach((session) => {
      const date = new Date(session.startTime);
      const dayName = days[date.getDay()];
      if (activityMap.has(dayName)) {
        activityMap.set(
          dayName,
          (activityMap.get(dayName) || 0) + (session.duration || 0),
        );
      }
    });

    // Convert to array format for Recharts
    return Array.from(activityMap.entries()).map(([name, ms]) => ({
      name,
      hours: Math.round((ms / (1000 * 60 * 60)) * 10) / 10, // Convert ms to hours, 1 decimal
    }));
  },
});

export const createDailyGoalsInternal = internalMutation({
  args: { userId: v.id("users"), goals: v.array(v.string()), date: v.string() },
  handler: async (ctx, args) => {
    for (const goalText of args.goals) {
      // Check if already exists to avoid dupes
      const existing = await ctx.db
        .query("dailyGoals")
        .withIndex("by_user_date", (q) =>
          q.eq("userId", args.userId).eq("date", args.date),
        )
        .filter((q) => q.eq(q.field("text"), goalText))
        .first();

      if (!existing) {
        await ctx.db.insert("dailyGoals", {
          userId: args.userId,
          text: goalText,
          isCompleted: false,
          date: args.date,
          createdAt: Date.now(),
        });
      }
    }
  },
});
