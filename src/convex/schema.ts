import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const visibilityValidator = v.union(
  v.literal("private"),
  v.literal("school"),
  v.literal("public"),
);

export const schoolMembershipStatusValidator = v.union(
  v.literal("unverified"),
  v.literal("verified"),
);

export const preferredLanguageValidator = v.union(
  v.literal("en"),
  v.literal("ar"),
);

export const studyPaceValidator = v.union(
  v.literal("light"),
  v.literal("balanced"),
  v.literal("intensive"),
);

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      dailySearchCount: v.optional(v.number()),
      lastSearchDate: v.optional(v.string()),
      // Auth identifier for reliable user matching
      tokenIdentifier: v.optional(v.string()),
      // Onboarding & Affiliate fields
      onboardingCompleted: v.optional(v.boolean()),
      onboardingVersion: v.optional(v.number()),
      userRole: v.optional(v.string()), // Student, Professional, Creative
      goals: v.optional(v.array(v.string())),
      experienceLevel: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
      bio: v.optional(v.string()),
      imageStorageId: v.optional(v.id("_storage")),
      source: v.optional(v.string()),
      region: v.optional(v.string()), // KSA, Egypt, Global
      curriculum: v.optional(v.string()), // Local school systems

      // Personalization Fields
      schoolId: v.optional(v.string()), // e.g. "alhussan_jubail"
      gradeLevel: v.optional(v.string()),
      classSection: v.optional(v.string()),
      curriculumTrack: v.optional(v.string()), // 'american', 'british', 'ib'
      isRTL: v.optional(v.boolean()),
      country: v.optional(v.string()), // 'sa', 'eg', 'uk', 'us', 'global'
      enableCountryTheme: v.optional(v.boolean()),
      preferredLanguage: v.optional(preferredLanguageValidator),
      targetSubjects: v.optional(v.array(v.string())),
      targetExams: v.optional(v.array(v.string())),
      studyPace: v.optional(studyPaceValidator),
      schoolNetworkOptIn: v.optional(v.boolean()),
      discoverableInSchool: v.optional(v.boolean()),
      profileVisibility: v.optional(visibilityValidator),
      schoolMembershipStatus: v.optional(schoolMembershipStatusValidator),

      affiliateCode: v.optional(v.string()),

      referredBy: v.optional(v.id("users")),
      affiliateId: v.optional(v.id("affiliates")),
      // Terms of Service and Privacy Policy acceptance
      tosAccepted: v.optional(v.boolean()),
      tosAcceptedAt: v.optional(v.number()),
      privacyPolicyAccepted: v.optional(v.boolean()),
      privacyPolicyAcceptedAt: v.optional(v.number()),
      credits: v.optional(v.number()),
      studyCredits: v.optional(v.number()),
      tier: v.optional(
        v.union(v.literal("FREE"), v.literal("PLUS"), v.literal("PRO")),
      ),
    })
      .index("email", ["email"])
      .index("by_affiliateCode", ["affiliateCode"])
      .index("by_tokenIdentifier", ["tokenIdentifier"])
      .index("by_schoolId", ["schoolId"])
      .index("by_country", ["country"])
      .index("by_curriculumTrack", ["curriculumTrack"]),

    schoolMemberships: defineTable({
      userId: v.id("users"),
      schoolId: v.string(),
      country: v.optional(v.string()),
      curriculumTrack: v.optional(v.string()),
      status: schoolMembershipStatusValidator,
      joinedAt: v.number(),
      source: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_school", ["schoolId"])
      .index("by_user_school", ["userId", "schoolId"]),

    userFollows: defineTable({
      followerUserId: v.id("users"),
      followingUserId: v.id("users"),
      createdAt: v.number(),
    })
      .index("by_follower", ["followerUserId"])
      .index("by_following", ["followingUserId"])
      .index("by_pair", ["followerUserId", "followingUserId"]),

    topicMastery: defineTable({
      userId: v.id("users"),
      topic: v.string(),
      masteryScore: v.number(), // 0-100
      lastUpdated: v.number(),
      status: v.union(
        v.literal("strong"),
        v.literal("average"),
        v.literal("weak"),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_user_topic", ["userId", "topic"]),

    affiliates: defineTable({
      userId: v.id("users"),
      code: v.string(),
      clicks: v.number(),
      signups: v.number(),
      earnings: v.number(),
      isActive: v.optional(v.boolean()),
    })
      .index("by_user", ["userId"])
      .index("by_code", ["code"]),

    chats: defineTable({
      userId: v.id("users"),
      title: v.string(),
      model: v.optional(v.string()),
      projectId: v.optional(v.id("projects")),
      libraryItemId: v.optional(v.id("libraryItems")),
      isPinned: v.optional(v.boolean()),
      isArchived: v.optional(v.boolean()),
      isDismissedFromActivity: v.optional(v.boolean()),
      lastMessageAt: v.optional(v.number()),
      currentBranchId: v.optional(v.string()),
      timelinePosition: v.optional(v.number()),
      branches: v.optional(
        v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            color: v.string(),
            parentMessageIndex: v.number(),
            createdAt: v.number(),
            isFavorite: v.optional(v.boolean()),
            isArchived: v.optional(v.boolean()),
          }),
        ),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_project", ["projectId"])
      .index("by_library_item", ["libraryItemId"])
      .index("by_user_and_pinned", ["userId", "isPinned"])
      .index("by_user_and_archived", ["userId", "isArchived"])
      .index("by_user_and_lastMessageAt", ["userId", "lastMessageAt"]),

    messages: defineTable({
      chatId: v.id("chats"),
      userId: v.id("users"),
      role: v.union(
        v.literal("user"),
        v.literal("assistant"),
        v.literal("system"),
      ),
      content: v.string(),
      model: v.optional(v.string()),
      responseTime: v.optional(v.number()),
      branchId: v.optional(v.string()),
      parentMessageId: v.optional(v.id("messages")),
      attachments: v.optional(
        v.array(
          v.object({
            storageId: v.id("_storage"),
            name: v.string(),
            type: v.string(),
            size: v.number(),
          }),
        ),
      ),
      sources: v.optional(
        v.array(
          v.object({
            title: v.string(),
            url: v.string(),
            domain: v.optional(v.string()),
            snippet: v.optional(v.string()),
            image: v.optional(v.string()),
          }),
        ),
      ),
      relatedQuestions: v.optional(v.array(v.string())),
    })
      .index("by_chat", ["chatId"])
      .index("by_branch", ["chatId", "branchId"]),

    projects: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    libraryItems: defineTable({
      userId: v.id("users"),
      title: v.string(),
      prompt: v.string(),
      category: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      imageUrl: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    codexFiles: defineTable({
      userId: v.id("users"),
      name: v.string(),
      content: v.string(),
      language: v.optional(v.string()),
      projectId: v.optional(v.id("projects")),
    }),

    gpts: defineTable({
      userId: v.id("users"),
      name: v.string(),
      emoji: v.string(),
      description: v.string(),
      systemPrompt: v.string(),
      isPublic: v.optional(v.boolean()),
    }).index("by_user", ["userId"]),

    spotifyConnections: defineTable({
      userId: v.id("users"),
      accessToken: v.string(),
      refreshToken: v.string(),
      expiresAt: v.number(),
      spotifyUserId: v.optional(v.string()),
      displayName: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    spotifyPlaylists: defineTable({
      userId: v.id("users"),
      spotifyPlaylistId: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      trackCount: v.optional(v.number()),
      isPublic: v.optional(v.boolean()),
    }).index("by_user", ["userId"]),

    // Daily Goals
    dailyGoals: defineTable({
      userId: v.id("users"),
      text: v.string(),
      isCompleted: v.boolean(),
      date: v.string(), // YYYY-MM-DD to track daily goals
      createdAt: v.number(),
    }).index("by_user_date", ["userId", "date"]),

    // Study App Foundation - Structured RAG PDF
    studyDocuments: defineTable({
      userId: v.id("users"),
      docId: v.string(),
      meta: v.object({
        title: v.string(),
        pages: v.number(),
        tags: v.optional(v.array(v.string())),
        createdAt: v.string(),
      }),
      extracted: v.object({
        text: v.string(),
        sections: v.array(
          v.object({
            id: v.string(),
            title: v.string(),
            text: v.string(),
          }),
        ),
        tables: v.optional(
          v.array(
            v.object({
              id: v.string(),
              csv: v.string(),
            }),
          ),
        ),
        figures: v.optional(
          v.array(
            v.object({
              id: v.string(),
              caption: v.string(),
            }),
          ),
        ),
      }),
      summary: v.object({
        short: v.string(),
        detailed: v.string(),
        simple: v.optional(v.string()),
      }),
      embeddingProvider: v.optional(
        v.union(v.literal("gemini"), v.literal("local-hash")),
      ),
      flashcards: v.optional(v.array(v.any())),
      quizzes: v.optional(v.array(v.any())),
      podcast: v.optional(
        v.object({
          script: v.object({
            intro: v.string(),
            body: v.string(),
            outro: v.string(),
          }),
          audioUrl: v.optional(v.string()),
        }),
      ),
      storageId: v.optional(v.id("_storage")),
      isSTEM: v.optional(v.boolean()),
    })
      .index("by_user", ["userId"])
      .index("by_docId", ["docId"]),

    studyChunks: defineTable({
      docId: v.string(),
      chunkId: v.string(),
      text: v.string(),
      embedding: v.array(v.float64()),
      sectionId: v.optional(v.string()),
      metadata: v.optional(
        v.object({
          page: v.optional(v.number()),
          position: v.optional(v.number()),
        }),
      ),
    })
      .index("by_docId", ["docId"])
      .index("by_chunkId", ["chunkId"])
      .searchIndex("search_text", {
        searchField: "text",
        filterFields: ["docId"],
      })
      .vectorIndex("by_embedding", {
        vectorField: "embedding",
        dimensions: 768,
        filterFields: ["docId"],
      }),

    // Courses
    courses: defineTable({
      userId: v.id("users"),
      name: v.string(),
      term: v.optional(v.string()),
      examDate: v.optional(v.string()),
      color: v.optional(v.string()),
    }).index("by_user", ["userId"]),

    // Study Materials
    studyMaterials: defineTable({
      courseId: v.optional(v.id("courses")),
      userId: v.id("users"),
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
      summary: v.optional(
        v.object({
          short: v.string(),
          detailed: v.string(),
          simple: v.optional(v.string()),
        }),
      ),
      shareId: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      visibility: v.optional(visibilityValidator),
      assetGenerationStatus: v.optional(
        v.union(
          v.literal("running"),
          v.literal("complete"),
          v.literal("failed"),
        ),
      ),
      assetGenerationStartedAt: v.optional(v.number()),
      assetGenerationCompletedAt: v.optional(v.number()),
      assetGenerationError: v.optional(v.string()),
    })
      .index("by_user", ["userId"])
      .index("by_folder", ["folderId"])
      .index("by_shareId", ["shareId"])
      .index("by_user_and_type", ["userId", "type"])
      .index("by_visibility", ["visibility"]),

    studyFolders: defineTable({
      userId: v.id("users"),
      name: v.string(),
      color: v.optional(v.string()),
      parentId: v.optional(v.id("studyFolders")),
    })
      .index("by_user", ["userId"])
      .index("by_parent", ["parentId"]),

    // Study Notes
    studyNotes: defineTable({
      userId: v.id("users"),
      materialId: v.optional(v.id("studyMaterials")),
      docId: v.optional(v.string()),
      title: v.string(),
      content: v.string(),
      format: v.union(
        v.literal("markdown"),
        v.literal("html"),
        v.literal("text"),
      ),
      isAIGenerated: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
      citations: v.optional(
        v.array(
          v.object({
            text: v.string(),
            page: v.optional(v.number()),
            source: v.string(),
          }),
        ),
      ),
      shareId: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      visibility: v.optional(visibilityValidator),
    })
      .index("by_user", ["userId"])
      .index("by_material", ["materialId"])
      .index("by_docId", ["docId"])
      .index("by_shareId", ["shareId"])
      .index("by_visibility", ["visibility"]),

    studyPacks: defineTable({
      userId: v.id("users"),
      materialId: v.optional(v.id("studyMaterials")),
      noteId: v.optional(v.id("studyNotes")),
      quizId: v.optional(v.id("quizzes")),
      conceptMapId: v.optional(v.id("mindMaps")),
      title: v.string(),
      sourceTitle: v.string(),
      sourceKind: v.optional(v.string()),
      sourceDocId: v.optional(v.string()),
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
      tags: v.optional(v.array(v.string())),
      shareId: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
      visibility: v.optional(visibilityValidator),
      schoolId: v.optional(v.string()),
      gradeLevel: v.optional(v.string()),
      classSection: v.optional(v.string()),
      curriculumTrack: v.optional(v.string()),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_material", ["materialId"])
      .index("by_shareId", ["shareId"])
      .index("by_visibility", ["visibility"])
      .index("by_school_updatedAt", ["schoolId", "updatedAt"]),

    studyShares: defineTable({
      userId: v.id("users"),
      sourceType: v.union(
        v.literal("material"),
        v.literal("note"),
        v.literal("pack"),
      ),
      materialId: v.optional(v.id("studyMaterials")),
      noteId: v.optional(v.id("studyNotes")),
      studyPackId: v.optional(v.id("studyPacks")),
      shareId: v.optional(v.string()),
      title: v.string(),
      description: v.optional(v.string()),
      subject: v.optional(v.string()),
      curriculumTag: v.optional(v.string()),
      region: v.optional(v.string()),
      country: v.optional(v.string()),
      schoolId: v.optional(v.string()),
      visibility: visibilityValidator,
      createdAt: v.number(),
      coverImageUrl: v.optional(v.string()),
      authorName: v.optional(v.string()),
      authorImage: v.optional(v.string()),
      contentType: v.optional(v.string()),
      assetStats: v.optional(
        v.object({
          flashcardsCount: v.optional(v.number()),
          quizQuestionsCount: v.optional(v.number()),
          estimatedMinutes: v.optional(v.number()),
        }),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_school_createdAt", ["schoolId", "createdAt"])
      .index("by_visibility_createdAt", ["visibility", "createdAt"])
      .index("by_region_createdAt", ["region", "createdAt"])
      .index("by_curriculum_createdAt", ["curriculumTag", "createdAt"])
      .index("by_source_material", ["materialId"])
      .index("by_source_note", ["noteId"])
      .index("by_source_pack", ["studyPackId"]),

    // Flashcards
    flashcards: defineTable({
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
      reviewCount: v.number(),
      correctCount: v.number(),
      nextReviewDate: v.optional(v.number()),
      lastReviewedAt: v.optional(v.number()),
      easeFactor: v.optional(v.number()),
      interval: v.optional(v.number()),
      status: v.optional(
        v.union(
          v.literal("not_studied"),
          v.literal("learning"),
          v.literal("mastered"),
        ),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_note", ["noteId"])
      .index("by_material", ["materialId"]),

    // Quizzes
    quizzes: defineTable({
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
    })
      .index("by_user", ["userId"])
      .index("by_material", ["materialId"]),

    // Study Stats
    studyStats: defineTable({
      userId: v.id("users"),
      totalStudyTime: v.number(),
      currentStreak: v.number(),
      longestStreak: v.number(),
      totalPoints: v.number(),
      level: v.number(),
      materialsCompleted: v.number(),
      quizzesCompleted: v.number(),
      flashcardsReviewed: v.number(),
    }).index("by_user", ["userId"]),

    // Study Sessions
    studySessions: defineTable({
      userId: v.id("users"),
      materialId: v.optional(v.id("studyMaterials")),
      noteId: v.optional(v.id("studyNotes")),
      schoolId: v.optional(v.string()),
      gradeLevel: v.optional(v.string()),
      classSection: v.optional(v.string()),
      curriculumTrack: v.optional(v.string()),
      activityType: v.union(
        v.literal("reading"),
        v.literal("note_taking"),
        v.literal("flashcards"),
        v.literal("quiz"),
        v.literal("diagram"),
      ),
      startTime: v.number(),
      endTime: v.optional(v.number()),
      duration: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_school_startTime", ["schoolId", "startTime"])
      .index("by_startTime", ["startTime"]),

    quizAttempts: defineTable({
      userId: v.id("users"),
      quizId: v.id("quizzes"),
      materialId: v.optional(v.id("studyMaterials")),
      schoolId: v.optional(v.string()),
      gradeLevel: v.optional(v.string()),
      classSection: v.optional(v.string()),
      curriculumTrack: v.optional(v.string()),
      totalQuestions: v.number(),
      correctAnswers: v.number(),
      incorrectAnswers: v.number(),
      accuracy: v.number(),
      durationMs: v.optional(v.number()),
      completedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_quiz", ["quizId"])
      .index("by_completedAt", ["completedAt"])
      .index("by_user_completedAt", ["userId", "completedAt"])
      .index("by_school_completedAt", ["schoolId", "completedAt"]),

    // Image Occlusion Data
    imageOcclusions: defineTable({
      userId: v.id("users"),
      materialId: v.optional(v.id("studyMaterials")),
      storageId: v.id("_storage"),
      title: v.string(),
      masks: v.array(
        v.object({
          id: v.string(),
          x: v.number(),
          y: v.number(),
          width: v.number(),
          height: v.number(),
          label: v.optional(v.string()),
        }),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_material", ["materialId"]),

    // Prompt Templates
    promptTemplates: defineTable({
      userId: v.id("users"),
      title: v.string(),
      content: v.string(),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      isPublic: v.optional(v.boolean()),
      usageCount: v.optional(v.number()),
      updatedAt: v.optional(v.number()),
    })
      .index("by_user", ["userId"])
      .index("by_isPublic", ["isPublic"]),

    // Kanban boards table for listing by chat and user
    kanbanBoards: defineTable({
      userId: v.id("users"),
      chatId: v.id("chats"),
      name: v.string(),
      description: v.optional(v.string()),
      columns: v.optional(
        v.array(
          v.object({
            id: v.string(),
            title: v.string(),
            order: v.number(),
          }),
        ),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_chat", ["chatId"]),

    // Meeting Notes table for listing by chat and user
    meetingNotes: defineTable({
      userId: v.id("users"),
      chatId: v.id("chats"),
      title: v.string(),
      summary: v.optional(v.string()),
      attendees: v.optional(v.array(v.string())),
      agenda: v.optional(v.array(v.string())),
      discussion: v.optional(
        v.array(
          v.object({
            topic: v.string(),
            points: v.array(v.string()),
          }),
        ),
      ),
      decisions: v.optional(v.array(v.string())),
      actionItems: v.optional(
        v.array(
          v.object({
            description: v.string(),
            assignee: v.optional(v.string()),
            dueDate: v.optional(v.string()),
            status: v.optional(
              v.union(
                v.literal("open"),
                v.literal("done"),
                v.literal("blocked"),
              ),
            ),
          }),
        ),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_chat", ["chatId"]),

    mindMaps: defineTable({
      userId: v.id("users"),
      title: v.string(),
      materialId: v.optional(v.id("studyMaterials")),
      nodes: v.array(v.any()),
      edges: v.array(v.any()),
      layout: v.string(),
      metadata: v.any(),
    })
      .index("by_user", ["userId"])
      .index("by_material", ["materialId"]),

    generatedAssets: defineTable({
      userId: v.id("users"),
      type: v.union(v.literal("image"), v.literal("video"), v.literal("audio")),
      url: v.string(),
      prompt: v.string(),
      model: v.string(),
      storageId: v.optional(v.id("_storage")),
      metadata: v.optional(v.any()),
    })
      .index("by_user", ["userId"])
      .index("by_type", ["type"])
      .index("by_user_and_type", ["userId", "type"]),

    // Session/Device tracking for security
    sessions: defineTable({
      userId: v.id("users"),
      deviceInfo: v.object({
        browser: v.string(),
        os: v.string(),
        device: v.string(),
        userAgent: v.optional(v.string()),
      }),
      ip: v.optional(v.string()),
      location: v.optional(
        v.object({
          country: v.optional(v.string()),
          city: v.optional(v.string()),
          region: v.optional(v.string()),
          lat: v.optional(v.number()),
          lon: v.optional(v.number()),
        }),
      ),
      createdAt: v.number(),
      lastActiveAt: v.number(),
      isActive: v.boolean(),
    })
      .index("by_user", ["userId"])
      .index("by_active", ["isActive"]),

    // Audit logs for admin actions
    auditLogs: defineTable({
      adminId: v.id("users"),
      action: v.string(),
      targetType: v.string(),
      targetId: v.optional(v.string()),
      details: v.optional(v.any()),
      timestamp: v.number(),
    })
      .index("by_admin", ["adminId"])
      .index("by_timestamp", ["timestamp"]),

    // Credit usage tracking for analytics
    creditUsage: defineTable({
      userId: v.id("users"),
      amount: v.number(),
      type: v.string(), // "chat", "search", "study", "study_materials", etc.
      description: v.string(),
      timestamp: v.number(),
      balanceAfter: v.number(),
      metadata: v.optional(v.any()), // Additional context (model, tokens, etc.)
    })
      .index("by_user", ["userId"])
      .index("by_timestamp", ["timestamp"])
      .index("by_type", ["type"])
      .index("by_user_and_timestamp", ["userId", "timestamp"]),

    // Vault / Receipts Engine (Anti-Detector)
    essays: defineTable({
      userId: v.id("users"),
      title: v.string(),
      content: v.string(),
      totalWordCount: v.number(),
      totalTimeSpentMs: v.number(),
      status: v.union(v.literal("draft"), v.literal("completed")),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_status", ["status"]),

    essayRevisions: defineTable({
      essayId: v.id("essays"),
      userId: v.id("users"),
      chunk: v.string(), // The string of text typed in this burst or the diff
      actionType: v.union(
        v.literal("insert"),
        v.literal("delete"),
        v.literal("paste"),
      ),
      timestamp: v.number(),
      timeSinceLastKeystrokeMs: v.number(),
      index: v.optional(v.number()),
      insertedText: v.optional(v.string()),
      removedText: v.optional(v.string()),
      contentAfter: v.optional(v.string()),
    })
      .index("by_essay", ["essayId"])
      .index("by_user", ["userId"])
      .index("by_essay_timestamp", ["essayId", "timestamp"]),

    // Phase 5: Focus-to-Earn Economy
    wallet: defineTable({
      userId: v.id("users"),
      cryoCredits: v.number(), // The virtual currency
      studyCredits: v.optional(v.number()),
      starterGrantVersion: v.optional(v.number()),
      lastStudyRefillAt: v.optional(v.number()),
      totalFocusMinutes: v.number(),
      lastFocusDate: v.number(), // For tracking daily streaks
      currentStreak: v.number(),
    }).index("by_user", ["userId"]),

    focusSessions: defineTable({
      userId: v.id("users"),
      durationMs: v.number(), // Total time this session was active
      creditsEarned: v.number(),
      interruptedCount: v.number(), // How many times they clicked off the app/tab
      status: v.union(v.literal("completed"), v.literal("failed_distracted")),
      timestamp: v.number(),
    }).index("by_user", ["userId"]),

    // App Versions for OTA Updates
    app_versions: defineTable({
      version: v.string(),
      platform: v.union(v.literal("ios"), v.literal("android")),
      url: v.string(), // URL to download the update
      storageId: v.optional(v.id("_storage")),
      notes: v.optional(v.string()),
      createdAt: v.number(),
      mandatory: v.optional(v.boolean()),
    })
      .index("by_platform_version", ["platform", "version"])
      .index("by_platform_createdAt", ["platform", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
