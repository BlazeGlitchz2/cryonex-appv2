import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const selectedBookValidator = v.object({
  resourceId: v.string(),
  title: v.string(),
  publisher: v.string(),
  edition: v.string(),
  pageCount: v.number(),
  topicIds: v.array(v.string()),
  startPage: v.number(),
  endPage: v.number(),
  summaryFocus: v.string(),
  selectedPresetId: v.optional(v.string()),
});

const selectedPastPaperValidator = v.object({
  resourceId: v.string(),
  title: v.string(),
  paperCode: v.string(),
  sessionLabel: v.string(),
  component: v.string(),
  duration: v.string(),
  topicIds: v.array(v.string()),
  questionFocus: v.array(v.string()),
  markSchemeFocus: v.string(),
});

export const listRecentPlans = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = Math.max(1, Math.min(args.limit || 3, 12));
    const plans = await ctx.db
      .query("igcsePlans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return plans
      .sort(
        (left, right) =>
          (right.updatedAt || right._creationTime) -
          (left.updatedAt || left._creationTime),
      )
      .slice(0, limit);
  },
});

export const getPlan = query({
  args: { planId: v.id("igcsePlans") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== userId) {
      return null;
    }

    return plan;
  },
});

export const upsertPlan = mutation({
  args: {
    planId: v.optional(v.id("igcsePlans")),
    title: v.string(),
    boardId: v.string(),
    boardLabel: v.string(),
    subjectId: v.string(),
    subjectLabel: v.string(),
    focusTopic: v.optional(v.string()),
    notes: v.optional(v.string()),
    selectedTopicIds: v.array(v.string()),
    selectedTopicTitles: v.array(v.string()),
    weakTopicIds: v.array(v.string()),
    weakTopicTitles: v.array(v.string()),
    selectedTemplateIds: v.array(v.string()),
    selectedTemplateTitles: v.array(v.string()),
    targetOutcomes: v.array(v.string()),
    totalEstimatedMinutes: v.number(),
    selectedBooks: v.array(selectedBookValidator),
    selectedPastPapers: v.array(selectedPastPaperValidator),
    status: v.union(
      v.literal("draft"),
      v.literal("saved"),
      v.literal("pack_ready"),
    ),
    materialId: v.optional(v.id("studyMaterials")),
    docId: v.optional(v.string()),
    packId: v.optional(v.id("studyPacks")),
    lastBuiltAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const now = Date.now();
    const payload = {
      userId,
      title: args.title,
      boardId: args.boardId,
      boardLabel: args.boardLabel,
      subjectId: args.subjectId,
      subjectLabel: args.subjectLabel,
      focusTopic: args.focusTopic,
      notes: args.notes,
      selectedTopicIds: args.selectedTopicIds,
      selectedTopicTitles: args.selectedTopicTitles,
      weakTopicIds: args.weakTopicIds,
      weakTopicTitles: args.weakTopicTitles,
      selectedTemplateIds: args.selectedTemplateIds,
      selectedTemplateTitles: args.selectedTemplateTitles,
      targetOutcomes: args.targetOutcomes,
      totalEstimatedMinutes: args.totalEstimatedMinutes,
      selectedBooks: args.selectedBooks,
      selectedPastPapers: args.selectedPastPapers,
      status: args.status,
      materialId: args.materialId,
      docId: args.docId,
      packId: args.packId,
      updatedAt: now,
      lastBuiltAt: args.lastBuiltAt,
    };

    if (args.planId) {
      const existingPlan = await ctx.db.get(args.planId);
      if (!existingPlan || existingPlan.userId !== userId) {
        throw new Error("Plan not found");
      }

      await ctx.db.patch(args.planId, payload);
      return args.planId;
    }

    return await ctx.db.insert("igcsePlans", {
      ...payload,
      createdAt: now,
    });
  },
});
