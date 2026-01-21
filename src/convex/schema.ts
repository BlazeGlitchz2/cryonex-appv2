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
      userRole: v.optional(v.string()), // Student, Professional, Creative
      goals: v.optional(v.array(v.string())),
      experienceLevel: v.optional(v.string()),
      interests: v.optional(v.array(v.string())),
      imageStorageId: v.optional(v.id("_storage")),
      source: v.optional(v.string()),
      affiliateCode: v.optional(v.string()),
      referredBy: v.optional(v.id("users")),
      affiliateId: v.optional(v.id("affiliates")),
      // Terms of Service and Privacy Policy acceptance
      tosAccepted: v.optional(v.boolean()),
      tosAcceptedAt: v.optional(v.number()),
      privacyPolicyAccepted: v.optional(v.boolean()),
      privacyPolicyAcceptedAt: v.optional(v.number()),
      credits: v.optional(v.number()),
    })
      .index("email", ["email"])
      .index("by_affiliateCode", ["affiliateCode"])
      .index("by_tokenIdentifier", ["tokenIdentifier"]),

    topicMastery: defineTable({
      userId: v.id("users"),
      topic: v.string(),
      masteryScore: v.number(), // 0-100
      lastUpdated: v.number(),
      status: v.union(v.literal("strong"), v.literal("average"), v.literal("weak")),
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
      branches: v.optional(v.array(v.object({
        id: v.string(),
        name: v.string(),
        color: v.string(),
        parentMessageIndex: v.number(),
        createdAt: v.number(),
        isFavorite: v.optional(v.boolean()),
        isArchived: v.optional(v.boolean()),
      }))),
    })
      .index("by_user", ["userId"])
      .index("by_project", ["projectId"])
      .index("by_library_item", ["libraryItemId"])
      .index("by_user_and_pinned", ["userId", "isPinned"])
      .index("by_user_and_archived", ["userId", "isArchived"]),

    messages: defineTable({
      chatId: v.id("chats"),
      userId: v.id("users"),
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      model: v.optional(v.string()),
      responseTime: v.optional(v.number()),
      branchId: v.optional(v.string()),
      parentMessageId: v.optional(v.id("messages")),
      attachments: v.optional(v.array(v.object({
        storageId: v.id("_storage"),
        name: v.string(),
        type: v.string(),
        size: v.number(),
      }))),
      sources: v.optional(v.array(v.object({
        title: v.string(),
        url: v.string(),
        domain: v.string(),
        snippet: v.optional(v.string()),
        image: v.optional(v.string()),
      }))),
    })
      .index("by_chat", ["chatId"])
      .index("by_branch", ["chatId", "branchId"]),

    projects: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.optional(v.string()),
    })
      .index("by_user", ["userId"]),

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
    })
      .index("by_user_date", ["userId", "date"]),

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
        sections: v.array(v.object({
          id: v.string(),
          title: v.string(),
          text: v.string(),
        })),
        tables: v.optional(v.array(v.object({
          id: v.string(),
          csv: v.string(),
        }))),
        figures: v.optional(v.array(v.object({
          id: v.string(),
          caption: v.string(),
        }))),
      }),
      summary: v.object({
        short: v.string(),
        detailed: v.string(),
        simple: v.optional(v.string()),
      }),
      flashcards: v.optional(v.array(v.any())),
      quizzes: v.optional(v.array(v.any())),
      podcast: v.optional(v.object({
        script: v.object({
          intro: v.string(),
          body: v.string(),
          outro: v.string(),
        }),
        audioUrl: v.optional(v.string()),
      })),
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
      metadata: v.optional(v.object({
        page: v.optional(v.number()),
        position: v.optional(v.number()),
      })),
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
        v.literal("link")
      ),
      storageId: v.optional(v.id("_storage")),
      url: v.optional(v.string()),
      content: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      folderId: v.optional(v.id("studyFolders")),
      docId: v.optional(v.string()),
      summary: v.optional(v.object({
        short: v.string(),
        detailed: v.string(),
        simple: v.optional(v.string()),
      })),
      shareId: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
    })
      .index("by_user", ["userId"])
      .index("by_folder", ["folderId"])
      .index("by_shareId", ["shareId"]),

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
      format: v.union(v.literal("markdown"), v.literal("html"), v.literal("text")),
      isAIGenerated: v.optional(v.boolean()),
      tags: v.optional(v.array(v.string())),
      citations: v.optional(v.array(v.object({
        text: v.string(),
        page: v.optional(v.number()),
        source: v.string(),
      }))),
      shareId: v.optional(v.string()),
      isPublic: v.optional(v.boolean()),
    })
      .index("by_user", ["userId"])
      .index("by_material", ["materialId"])
      .index("by_docId", ["docId"])
      .index("by_shareId", ["shareId"]),

    // Flashcards
    flashcards: defineTable({
      userId: v.id("users"),
      noteId: v.optional(v.id("studyNotes")),
      materialId: v.optional(v.id("studyMaterials")),
      front: v.string(),
      back: v.string(),
      difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
      tags: v.optional(v.array(v.string())),
      reviewCount: v.number(),
      correctCount: v.number(),
      nextReviewDate: v.optional(v.number()),
      lastReviewedAt: v.optional(v.number()),
      status: v.optional(v.union(
        v.literal("not_studied"),
        v.literal("learning"),
        v.literal("mastered")
      )),
    })
      .index("by_user", ["userId"])
      .index("by_note", ["noteId"])
      .index("by_material", ["materialId"]),

    // Quizzes
    quizzes: defineTable({
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
      activityType: v.union(
        v.literal("reading"),
        v.literal("note_taking"),
        v.literal("flashcards"),
        v.literal("quiz"),
        v.literal("diagram")
      ),
      startTime: v.number(),
      endTime: v.optional(v.number()),
      duration: v.optional(v.number()),
    }).index("by_user", ["userId"]),

    // Image Occlusion Data
    imageOcclusions: defineTable({
      userId: v.id("users"),
      materialId: v.optional(v.id("studyMaterials")),
      storageId: v.id("_storage"),
      title: v.string(),
      masks: v.array(v.object({
        id: v.string(),
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        label: v.optional(v.string()),
      })),
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
            status: v.optional(v.union(v.literal("open"), v.literal("done"), v.literal("blocked"))),
          }),
        ),
      ),
    })
      .index("by_user", ["userId"])
      .index("by_chat", ["chatId"]),

    mindMaps: defineTable({
      userId: v.string(),
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
      location: v.optional(v.object({
        country: v.optional(v.string()),
        city: v.optional(v.string()),
        region: v.optional(v.string()),
        lat: v.optional(v.number()),
        lon: v.optional(v.number()),
      })),
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
  },
  {
    schemaValidation: false,
  },
);

export default schema;