import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery, action } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Helper to get user ID
async function getUserId(ctx: any) {
  return await getAuthUserId(ctx);
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

// Internal mutations for server-side use (called from actions)
export const createNoteInternal = internalMutation({
  args: {
    userId: v.id("users"),
    materialId: v.optional(v.id("studyMaterials")),
    title: v.string(),
    content: v.string(),
    format: v.union(v.literal("markdown"), v.literal("html"), v.literal("text")),
    isAIGenerated: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("studyNotes", args);
  },
});

export const createFlashcardInternal = internalMutation({
  args: {
    userId: v.id("users"),
    noteId: v.optional(v.id("studyNotes")),
    materialId: v.optional(v.id("studyMaterials")),
    front: v.string(),
    back: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
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
    questions: v.array(v.object({
      question: v.string(),
      type: v.union(
        v.literal("multiple_choice"),
        v.literal("true_false"),
        v.literal("fill_blank"),
        v.literal("essay")
      ),
      options: v.optional(v.array(v.string())),
      correctAnswer: v.string(),
      explanation: v.optional(v.string()),
      topic: v.optional(v.string()),
    })),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
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
      v.literal("youtube")
    ),
    storageId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    folderId: v.optional(v.id("studyFolders")),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    return await ctx.db.insert("studyMaterials", {
      userId,
      ...args,
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
      return materials.filter(m => m.userId === userId);
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
      return folders.filter(f => f.userId === userId);
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
    if (!userId) return { dueFlashcardsCount: 0, recentMaterials: [], suggestions: [] };

    // Get flashcards due for review
    const now = Date.now();
    const dueFlashcards = await ctx.db
      .query("flashcards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const dueSoon = dueFlashcards.filter(
      (card) => card.nextReviewDate && card.nextReviewDate <= now + 24 * 60 * 60 * 1000
    );

    // Get recent materials
    const recentMaterials = await ctx.db
      .query("studyMaterials")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(3);

    return {
      dueFlashcardsCount: dueSoon.length,
      recentMaterials: recentMaterials.map((m) => ({
        id: m._id,
        title: m.title,
        type: m.type,
      })),
      suggestions: [
        dueSoon.length > 0 ? `Review ${dueSoon.length} flashcards due today` : null,
        recentMaterials.length > 0 ? `Continue studying ${recentMaterials[0].title}` : null,
        "Upload new study material to generate flashcards",
      ].filter(Boolean),
    };
  },
});

// Study Notes
export const createNote = mutation({
  args: {
    materialId: v.optional(v.id("studyMaterials")),
    title: v.string(),
    content: v.string(),
    format: v.union(v.literal("markdown"), v.literal("html"), v.literal("text")),
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
      return notes.filter(n => n.userId === userId);
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
    if (!note || note.userId !== userId) throw new Error("Not found or unauthorized");

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
    if (!note || note.userId !== userId) throw new Error("Not found or unauthorized");

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
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
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
    if (!flashcard || flashcard.userId !== userId) throw new Error("Not found or unauthorized");

    await ctx.db.delete(args.flashcardId);
  },
});

export const updateFlashcard = mutation({
  args: {
    flashcardId: v.id("flashcards"),
    front: v.optional(v.string()),
    back: v.optional(v.string()),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const flashcard = await ctx.db.get(args.flashcardId);
    if (!flashcard || flashcard.userId !== userId) throw new Error("Not found or unauthorized");

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
      return flashcards.filter(f => f.userId === userId);
    }

    if (args.materialId) {
      const flashcards = await ctx.db
        .query("flashcards")
        .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
        .collect();
      return flashcards.filter(f => f.userId === userId);
    }

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
      await ctx.db.patch(stats._id, {
        totalStudyTime: stats.totalStudyTime + args.duration,
      });
    }
  },
});

export const updateFlashcardReview = mutation({
  args: {
    flashcardId: v.id("flashcards"),
    rating: v.union(v.literal("wrong"), v.literal("hard"), v.literal("good"), v.literal("easy")),
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
    
    // Spaced repetition intervals based on rating
    let interval: number;
    switch (args.rating) {
      case "wrong":
        interval = 1 * dayInMs; // 1 day
        break;
      case "hard":
        interval = 2 * dayInMs; // 2 days
        break;
      case "good":
        interval = 4 * dayInMs; // 4 days
        break;
      case "easy":
        interval = 8 * dayInMs; // 8 days
        break;
      default:
        interval = 1 * dayInMs;
    }
    
    const nextReviewDate = now + interval;

    // Determine status based on performance
    let status: "not_studied" | "learning" | "mastered" = "learning";
    if (reviewCount === 0) {
      status = "not_studied";
    } else if (correctCount >= 3 && args.rating === "easy") {
      status = "mastered";
    } else if (reviewCount > 0) {
      status = "learning";
    }

    await ctx.db.patch(args.flashcardId, {
      reviewCount,
      correctCount,
      nextReviewDate,
      status,
      lastReviewedAt: now,
    });
    
    // Update stats
    const stats = await ctx.db
      .query("studyStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    if (stats) {
      await ctx.db.patch(stats._id, {
        flashcardsReviewed: stats.flashcardsReviewed + 1,
        totalPoints: stats.totalPoints + (isCorrect ? 10 : 5),
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
      v.literal("diagram")
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
      await ctx.db.patch(stats._id, {
        totalStudyTime: stats.totalStudyTime + duration,
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
    questions: v.array(v.object({
      question: v.string(),
      type: v.union(
        v.literal("multiple_choice"),
        v.literal("true_false"),
        v.literal("fill_blank"),
        v.literal("essay")
      ),
      options: v.optional(v.array(v.string())),
      correctAnswer: v.string(),
      explanation: v.optional(v.string()),
      topic: v.optional(v.string()),
    })),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
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
      return quizzes.filter(q => q.userId === userId);
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
    });
  },
});

export const updateMaterialSummary = internalMutation({
  args: {
    materialId: v.id("studyMaterials"),
    summary: v.object({
      short: v.string(),
      detailed: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.materialId, {
      summary: args.summary,
    });
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
      .withIndex("by_user_date", (q) => q.eq("userId", userId).eq("date", args.date))
      .collect();
  },
});

export const completeGoal = mutation({
  args: { goalId: v.id("dailyGoals"), isCompleted: v.boolean() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const goal = await ctx.db.get(args.goalId);
    if (!goal || goal.userId !== userId) throw new Error("Goal not found or unauthorized");

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
            await ctx.db.patch(stats._id, {
                totalPoints: stats.totalPoints + 20, // Points for completing a goal
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
    // But for now we'll just simulate the AI generation based on "Mock Data" or simple heuristics
    // In a real app, we'd call an internalQuery to get recent materials, then send to Gemma

    // Simulating "Gemma" response based on user's likely study needs
    const suggestedGoals = [
      "Review recent flashcards for 15 minutes",
      "Complete one practice quiz",
      "Read 10 pages of your latest material",
    ];

    // Insert goals via internal mutation (or public mutation if we call it from client, but better here)
    // Since we can't easily call mutation from action without `runMutation`, we will return the suggestions
    // and let the client insert them, OR we use `ctx.runMutation`.
    
    await ctx.runMutation(internal.study.createDailyGoalsInternal, {
        userId,
        goals: suggestedGoals,
        date: args.date
    });

    return suggestedGoals;
  },
});

export const createDailyGoalsInternal = internalMutation({
    args: { userId: v.id("users"), goals: v.array(v.string()), date: v.string() },
    handler: async (ctx, args) => {
        for (const goalText of args.goals) {
            // Check if already exists to avoid dupes
            const existing = await ctx.db
                .query("dailyGoals")
                .withIndex("by_user_date", q => q.eq("userId", args.userId).eq("date", args.date))
                .filter(q => q.eq(q.field("text"), goalText))
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
    }
});
