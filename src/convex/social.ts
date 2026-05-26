import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import {
  buildStudentClassLabel,
  getCanonicalSchoolId,
  getSchoolConfig,
} from "../lib/schoolConfig";

const DEFAULT_LIMIT = 8;
const DEFAULT_ACTIVITY_LIMIT = 8;

function normalizeRegion(user: any) {
  return String(user?.region || user?.country || "global").toLowerCase();
}

function normalizeCurriculum(user: any) {
  return String(user?.curriculumTrack || user?.curriculum || "general");
}

function extractDescription(source: any) {
  if (!source) return undefined;
  if (source.description) return source.description;
  if (source.summary?.short) return source.summary.short;
  if (source.content) return String(source.content).slice(0, 180);
  return undefined;
}

function createShareId() {
  return Math.random().toString(36).slice(2, 14);
}

function getSchoolHubContext(user: any) {
  const schoolId = getCanonicalSchoolId(user?.schoolId);
  const classSection = user?.classSection
    ? String(user.classSection).trim().toUpperCase()
    : null;

  return {
    schoolId,
    schoolName: schoolId ? getSchoolConfig(schoolId)?.name || schoolId : "School",
    country: user?.country || null,
    gradeLevel: user?.gradeLevel || null,
    classSection,
    curriculumTrack: user?.curriculumTrack || user?.curriculum || null,
    schoolNetworkOptIn: user?.schoolNetworkOptIn !== false,
  };
}

function hasSchoolHubAccess(user: any) {
  const context = getSchoolHubContext(user);
  return Boolean(context.schoolId && context.schoolNetworkOptIn);
}

function formatDurationMs(durationMs?: number) {
  if (!durationMs || durationMs <= 0) return undefined;
  const minutes = Math.max(1, Math.round(durationMs / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function summarizeActivityEvent(event: any) {
  const durationLabel = formatDurationMs(event.durationMs);
  switch (event.eventType) {
    case "study_session_started":
      return {
        title: event.title || "Started a study session",
        description:
          event.description ||
          "A student kicked off a focused study session.",
      };
    case "study_session_completed":
      return {
        title: event.title || "Completed a study session",
        description:
          event.description ||
          (durationLabel
            ? `Completed a ${durationLabel} study session.`
            : "Completed a study session."),
      };
    case "study_session_quit_early":
      return {
        title: event.title || "Quit a session early",
        description:
          event.description ||
          (durationLabel
            ? `Left the session early after ${durationLabel}.`
            : "Left the session early."),
      };
    default:
      return {
        title: event.title || "Study update",
        description: event.description || undefined,
      };
  }
}

function canSeeSchoolPost(viewer: any, post: any) {
  if (!viewer || !post) return false;
  const viewerHub = getSchoolHubContext(viewer);
  if (!viewerHub.schoolId || !viewerHub.schoolNetworkOptIn) return false;
  if (String(viewerHub.schoolId) !== String(post.schoolId)) return false;
  if (post.audience === "class") {
    return Boolean(
      viewerHub.classSection &&
        post.classSection &&
        String(viewerHub.classSection) === String(post.classSection),
    );
  }
  return true;
}

function canSeeSchoolActivity(viewer: any, event: any) {
  if (!viewer || !event) return false;
  const viewerHub = getSchoolHubContext(viewer);
  if (!viewerHub.schoolId || !viewerHub.schoolNetworkOptIn) return false;
  if (String(viewerHub.schoolId) !== String(event.schoolId)) return false;
  if (event.audience === "class") {
    return Boolean(
      viewerHub.classSection &&
        event.classSection &&
        String(viewerHub.classSection) === String(event.classSection),
    );
  }
  return true;
}

export function canSeeShare(user: any, share: any, followingIds: Set<string>) {
  if (!share) return false;
  if (share.userId === user?._id) return true;
  if (share.visibility === "public") return true;

  // School Hub access: User must be in school network, have opted in, and match schoolId
  if (
    share.visibility === "school" &&
    user?.schoolId &&
    user?.schoolNetworkOptIn &&
    user?.schoolId === share.schoolId
  ) {
    return true;
  }

  return false;
}

async function getFollowingIds(ctx: any, userId: any) {
  const follows = await ctx.db
    .query("userFollows")
    .withIndex("by_follower", (q: any) => q.eq("followerUserId", userId))
    .collect();

  return new Set<string>(
    follows.map((follow: any) => String(follow.followingUserId)),
  );
}

async function getShareBySource(ctx: any, args: any) {
  if (args.type === "material") {
    return await ctx.db
      .query("studyShares")
      .withIndex("by_source_material", (q: any) => q.eq("materialId", args.id))
      .first();
  }

  if (args.type === "pack") {
    return await ctx.db
      .query("studyShares")
      .withIndex("by_source_pack", (q: any) => q.eq("studyPackId", args.id))
      .first();
  }

  return await ctx.db
    .query("studyShares")
    .withIndex("by_source_note", (q: any) => q.eq("noteId", args.id))
    .first();
}

async function enrichShareCard(ctx: any, share: any) {
  if (!share) return share;

  if (share.sourceType === "pack" && share.studyPackId) {
    const pack = await ctx.db.get(share.studyPackId);
    return {
      ...share,
      authorProfileUrl: `/school/profiles/${share.userId}`,
      targetUrl: pack ? `/study/packs/${pack._id}` : undefined,
      shareUrl: share.shareId ? `/share/pack/${share.shareId}` : undefined,
      flashcardsCount: pack?.flashcardsCount || 0,
      quizQuestionsCount: pack?.quizQuestionsCount || 0,
      packStyle: pack?.packStyle,
    };
  }

  if (share.sourceType === "material" && share.materialId) {
    const material = await ctx.db.get(share.materialId);
    return {
      ...share,
      authorProfileUrl: `/school/profiles/${share.userId}`,
      targetUrl: material?.docId
        ? `/study/workspace/${material.docId}`
        : share.shareId
          ? `/share/material/${share.shareId}`
          : undefined,
      shareUrl: share.shareId ? `/share/material/${share.shareId}` : undefined,
    };
  }

  if (share.sourceType === "note" && share.noteId) {
    const note = await ctx.db.get(share.noteId);
    const material = note?.materialId
      ? await ctx.db.get(note.materialId)
      : null;
    return {
      ...share,
      authorProfileUrl: `/school/profiles/${share.userId}`,
      targetUrl: material?.docId
        ? `/study/workspace/${material.docId}`
        : share.shareId
          ? `/share/note/${share.shareId}`
          : undefined,
      shareUrl: share.shareId ? `/share/note/${share.shareId}` : undefined,
    };
  }

  return share;
}

async function enrichSchoolBoardPost(ctx: any, post: any) {
  if (!post) return post;
  const author = await ctx.db.get(post.userId);
  return {
    ...post,
    kind: "post" as const,
    sortAt: post.createdAt,
    authorName: author?.name || "Student",
    authorImage: author?.image || null,
    authorProfileUrl: `/school/profiles/${post.userId}`,
    classLabel: buildStudentClassLabel({
      gradeLevel: post.gradeLevel,
      classSection: post.classSection,
    }),
  };
}

async function enrichSchoolActivityEvent(ctx: any, event: any) {
  if (!event) return event;
  const author = await ctx.db.get(event.userId);
  const summary = summarizeActivityEvent(event);
  return {
    ...event,
    kind: "activity" as const,
    sortAt: event.occurredAt,
    authorName: author?.name || "Student",
    authorImage: author?.image || null,
    authorProfileUrl: `/school/profiles/${event.userId}`,
    classLabel: buildStudentClassLabel({
      gradeLevel: event.gradeLevel,
      classSection: event.classSection,
    }),
    ...summary,
  };
}

export const publishStudyAsset = mutation({
  args: {
    id: v.union(v.id("studyMaterials"), v.id("studyNotes"), v.id("studyPacks")),
    type: v.union(v.literal("material"), v.literal("note"), v.literal("pack")),
    visibility: v.union(
      v.literal("private"),
      v.literal("school"),
      v.literal("public"),
    ),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    subject: v.optional(v.string()),
    curriculumTag: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const source = await ctx.db.get(args.id);
    if (!source || source.userId !== userId) {
      throw new Error("Not found or unauthorized");
    }

    const shareId =
      args.visibility === "public"
        ? (source.shareId as string | undefined) || createShareId()
        : undefined;

    const patchPayload = {
      visibility: args.visibility,
      isPublic: args.visibility === "public",
      shareId,
    };

    await ctx.db.patch(args.id, patchPayload);

    const existingShare = await getShareBySource(ctx, args);
    const sharePayload: any = {
      userId,
      sourceType: args.type,
      materialId: args.type === "material" ? (args.id as any) : undefined,
      noteId: args.type === "note" ? (args.id as any) : undefined,
      studyPackId: args.type === "pack" ? (args.id as any) : undefined,
      shareId,
      title: args.title || source.title,
      description: args.description || extractDescription(source),
      subject: args.subject,
      curriculumTag: args.curriculumTag || normalizeCurriculum(user),
      region: normalizeRegion(user),
      country: user.country,
      schoolId: user.schoolId,
      visibility: args.visibility,
      createdAt: Date.now(),
      coverImageUrl: args.coverImageUrl,
      authorName: user.name,
      authorImage: user.image,
      contentType:
        args.type === "pack"
          ? "study pack"
          : (source as any).type || (source as any).format || args.type,
      assetStats:
        args.type === "pack"
          ? {
              flashcardsCount: (source as any).flashcardsCount,
              quizQuestionsCount: (source as any).quizQuestionsCount,
              estimatedMinutes: (source as any).estimatedMinutes,
            }
          : undefined,
    };

    if (existingShare) {
      await ctx.db.patch(existingShare._id, sharePayload);
      return { shareId, shareDocId: existingShare._id };
    }

    const shareDocId = await ctx.db.insert("studyShares", sharePayload);
    return { shareId, shareDocId };
  },
});

export const createSchoolBoardPost = mutation({
  args: {
    title: v.optional(v.string()),
    content: v.string(),
    audience: v.optional(v.union(v.literal("school"), v.literal("class"))),
    postType: v.optional(
      v.union(
        v.literal("update"),
        v.literal("check_in"),
        v.literal("question"),
        v.literal("celebration"),
        v.literal("accountability"),
      ),
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const hub = getSchoolHubContext(user);
    if (!hasSchoolHubAccess(user) || !hub.schoolId) {
      throw new Error("School hub access required");
    }

    const content = args.content.trim();
    if (!content) {
      throw new Error("Post content is required");
    }

    if (args.audience === "class" && !hub.classSection) {
      throw new Error("Class posts require a class section");
    }

    const db = ctx.db as any;
    const postId = await db.insert("schoolBoardPosts", {
      userId,
      schoolId: hub.schoolId,
      audience: args.audience || "school",
      postType: args.postType || "update",
      title: args.title?.trim() || undefined,
      content,
      tags: args.tags,
      country: hub.country,
      gradeLevel: hub.gradeLevel,
      classSection: hub.classSection || undefined,
      curriculumTrack: hub.curriculumTrack || undefined,
      createdAt: Date.now(),
    });

    const post = await db.get(postId);
    return {
      postId,
      post: await enrichSchoolBoardPost(ctx, post),
    };
  },
});

export const recordSchoolActivityEvent = mutation({
  args: {
    eventType: v.union(
      v.literal("study_session_started"),
      v.literal("study_session_completed"),
      v.literal("study_session_quit_early"),
    ),
    sessionId: v.optional(v.id("studySessions")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    durationMs: v.optional(v.number()),
    audience: v.optional(v.union(v.literal("school"), v.literal("class"))),
    occurredAt: v.optional(v.number()),
    details: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const hub = getSchoolHubContext(user);
    if (!hasSchoolHubAccess(user) || !hub.schoolId) {
      throw new Error("School hub access required");
    }

    if (args.audience === "class" && !hub.classSection) {
      throw new Error("Class activity requires a class section");
    }

    const occurredAt = args.occurredAt || Date.now();
    const db = ctx.db as any;
    const eventId = await db.insert("schoolActivityEvents", {
      userId,
      schoolId: hub.schoolId,
      eventType: args.eventType,
      sessionId: args.sessionId,
      title: args.title?.trim() || undefined,
      description: args.description?.trim() || undefined,
      durationMs: args.durationMs,
      audience: args.audience || "school",
      country: hub.country,
      gradeLevel: hub.gradeLevel,
      classSection: hub.classSection || undefined,
      curriculumTrack: hub.curriculumTrack || undefined,
      details: args.details,
      occurredAt,
      createdAt: Date.now(),
    });

    const event = await db.get(eventId);
    return {
      eventId,
      event: await enrichSchoolActivityEvent(ctx, event),
    };
  },
});

export const getSchoolBoardFeed = query({
  args: {
    limit: v.optional(v.number()),
    activityLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    const hub = getSchoolHubContext(user);
    if (!user || !hasSchoolHubAccess(user) || !hub.schoolId) {
      return {
        schoolId: null,
        schoolName: null,
        classSection: null,
        posts: [],
        activityEvents: [],
        items: [],
      };
    }

    const limit = Math.max(1, Math.min(args.limit || DEFAULT_LIMIT, 50));
    const activityLimit = Math.max(
      1,
      Math.min(args.activityLimit || DEFAULT_ACTIVITY_LIMIT, 50),
    );
    const db = ctx.db as any;

    const [posts, events] = await Promise.all([
      db
        .query("schoolBoardPosts")
        .withIndex("by_school_createdAt", (q: any) =>
          q.eq("schoolId", hub.schoolId),
        )
        .order("desc")
        .take(limit * 3),
      db
        .query("schoolActivityEvents")
        .withIndex("by_school_occurredAt", (q: any) =>
          q.eq("schoolId", hub.schoolId),
        )
        .order("desc")
        .take(activityLimit * 3),
    ]);

    const visiblePosts = posts.filter((post: any) => canSeeSchoolPost(user, post));
    const visibleEvents = events.filter((event: any) =>
      canSeeSchoolActivity(user, event),
    );

    const enrichedPosts = await Promise.all(
      visiblePosts.slice(0, limit).map((post: any) => enrichSchoolBoardPost(ctx, post)),
    );
    const enrichedEvents = await Promise.all(
      visibleEvents
        .slice(0, activityLimit)
        .map((event: any) => enrichSchoolActivityEvent(ctx, event)),
    );

    const items = [...enrichedPosts, ...enrichedEvents]
      .sort((a, b) => Number(b.sortAt || 0) - Number(a.sortAt || 0))
      .slice(0, limit + activityLimit);

    return {
      schoolId: hub.schoolId,
      schoolName: hub.schoolName,
      classSection: hub.classSection,
      posts: enrichedPosts,
      activityEvents: enrichedEvents,
      items,
    };
  },
});

export const toggleFollowUser = mutation({
  args: {
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    if (String(userId) === String(args.targetUserId)) {
      throw new Error("You cannot follow yourself");
    }

    const existing = await ctx.db
      .query("userFollows")
      .withIndex("by_pair", (q: any) =>
        q.eq("followerUserId", userId).eq("followingUserId", args.targetUserId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { following: false };
    }

    await ctx.db.insert("userFollows", {
      followerUserId: userId,
      followingUserId: args.targetUserId,
      createdAt: Date.now(),
    });

    return { following: true };
  },
});

export const getSuggestedSchoolmates = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (
      !user ||
      !user.schoolId ||
      user.schoolNetworkOptIn === false ||
      user.discoverableInSchool === false
    ) {
      return [];
    }

    const follows = await ctx.db
      .query("userFollows")
      .withIndex("by_follower", (q: any) => q.eq("followerUserId", user._id))
      .collect();
    const followingIds = new Set(
      follows.map((follow: any) => String(follow.followingUserId)),
    );

    const schoolmates = await ctx.db
      .query("users")
      .withIndex("by_schoolId", (q: any) => q.eq("schoolId", user.schoolId))
      .collect();

    const limit = args.limit || 4;

    const suggestions = await Promise.all(
      schoolmates
        .filter((candidate: any) => String(candidate._id) !== String(user._id))
        .filter((candidate: any) => candidate.schoolNetworkOptIn !== false)
        .filter((candidate: any) => candidate.discoverableInSchool !== false)
        .filter((candidate: any) => candidate.profileVisibility !== "private")
        .slice(0, limit)
        .map(async (candidate: any) => {
          const shares = await ctx.db
            .query("studyShares")
            .withIndex("by_user", (q: any) => q.eq("userId", candidate._id))
            .collect();
          const visibleShares = shares.filter(
            (share: any) =>
              share.visibility === "public" || share.visibility === "school",
          );

          return {
            _id: candidate._id,
            name: candidate.name || "Student",
            image: candidate.image,
            bio: candidate.bio,
            interests: candidate.interests || [],
            gradeLevel: candidate.gradeLevel,
            classSection: candidate.classSection,
            curriculumTrack: candidate.curriculumTrack || candidate.curriculum,
            schoolId: candidate.schoolId,
            country: candidate.country,
            publicSharesCount: visibleShares.length,
            isFollowing: followingIds.has(String(candidate._id)),
            profileUrl: `/school/profiles/${candidate._id}`,
          };
        }),
    );

    return suggestions;
  },
});

export const getLocalizedTrendingAssets = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const region = normalizeRegion(user);
    const limit = args.limit || DEFAULT_LIMIT;

    const shares =
      region && region !== "global"
        ? await ctx.db
            .query("studyShares")
            .withIndex("by_region_createdAt", (q: any) =>
              q.eq("region", region),
            )
            .order("desc")
            .take(limit * 2)
        : await ctx.db
            .query("studyShares")
            .withIndex("by_visibility_createdAt", (q: any) =>
              q.eq("visibility", "public"),
            )
            .order("desc")
            .take(limit * 2);

    return await Promise.all(
      shares
        .filter((share: any) => share.visibility === "public")
        .slice(0, limit)
        .map((share: any) => enrichShareCard(ctx, share)),
    );
  },
});

export const getSchoolFeed = query({
  args: {
    scope: v.union(
      v.literal("school"),
      v.literal("curriculum"),
      v.literal("following"),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const limit = args.limit || DEFAULT_LIMIT;
    const followingIds = await getFollowingIds(ctx, user._id);
    let shares: any[] = [];

    if (args.scope === "school") {
      if (!user.schoolId || user.schoolNetworkOptIn === false) return [];
      shares = await ctx.db
        .query("studyShares")
        .withIndex("by_school_createdAt", (q: any) =>
          q.eq("schoolId", user.schoolId),
        )
        .order("desc")
        .take(limit * 3);
    } else if (args.scope === "curriculum") {
      const curriculum = normalizeCurriculum(user);
      shares = await ctx.db
        .query("studyShares")
        .withIndex("by_curriculum_createdAt", (q: any) =>
          q.eq("curriculumTag", curriculum),
        )
        .order("desc")
        .take(limit * 3);
    } else {
      const followed = await ctx.db
        .query("userFollows")
        .withIndex("by_follower", (q: any) => q.eq("followerUserId", user._id))
        .collect();

      const followedShares = await Promise.all(
        followed.map((entry: any) =>
          ctx.db
            .query("studyShares")
            .withIndex("by_user", (q: any) =>
              q.eq("userId", entry.followingUserId),
            )
            .collect(),
        ),
      );
      shares = followedShares.flat();
    }

    return await Promise.all(
      shares
        .filter((share: any) => canSeeShare(user, share, followingIds))
        .sort((a: any, b: any) => b.createdAt - a.createdAt)
        .slice(0, limit)
        .map((share: any) => enrichShareCard(ctx, share)),
    );
  },
});

export const getDashboardRails = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return {
        personalization: null,
        popularAtSchool: [],
        trendingRegional: [],
        curriculumPicks: [],
        followingPicks: [],
      };
    }

    const limit = args.limit || 4;
    const followingIds = await getFollowingIds(ctx, user._id);
    const curriculum = normalizeCurriculum(user);
    const region = normalizeRegion(user);

    const [schoolShares, regionalShares, curriculumShares, followingEntries] =
      await Promise.all([
        user.schoolId
          ? ctx.db
              .query("studyShares")
              .withIndex("by_school_createdAt", (q: any) =>
                q.eq("schoolId", user.schoolId),
              )
              .order("desc")
              .take(limit * 3)
          : [],
        region && region !== "global"
          ? ctx.db
              .query("studyShares")
              .withIndex("by_region_createdAt", (q: any) =>
                q.eq("region", region),
              )
              .order("desc")
              .take(limit * 3)
          : ctx.db
              .query("studyShares")
              .withIndex("by_visibility_createdAt", (q: any) =>
                q.eq("visibility", "public"),
              )
              .order("desc")
              .take(limit * 3),
        curriculum
          ? ctx.db
              .query("studyShares")
              .withIndex("by_curriculum_createdAt", (q: any) =>
                q.eq("curriculumTag", curriculum),
              )
              .order("desc")
              .take(limit * 3)
          : [],
        ctx.db
          .query("userFollows")
          .withIndex("by_follower", (q: any) =>
            q.eq("followerUserId", user._id),
          )
          .collect(),
      ]);

    const followingShareGroups = await Promise.all(
      followingEntries.map((entry: any) =>
        ctx.db
          .query("studyShares")
          .withIndex("by_user", (q: any) =>
            q.eq("userId", entry.followingUserId),
          )
          .collect(),
      ),
    );

    const followingShares = followingShareGroups
      .flat()
      .filter((share: any) => canSeeShare(user, share, followingIds))
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .slice(0, limit);

    return {
      personalization: {
        country: user.country || "global",
        region,
        curriculum,
        schoolId: user.schoolId || null,
        gradeLevel: user.gradeLevel || null,
        preferredLanguage: user.preferredLanguage || (user.isRTL ? "ar" : "en"),
        profileVisibility: user.profileVisibility || "private",
        schoolNetworkOptIn: user.schoolNetworkOptIn ?? false,
      },
      popularAtSchool: await Promise.all(
        schoolShares
          .filter((share: any) => canSeeShare(user, share, followingIds))
          .slice(0, limit)
          .map((share: any) => enrichShareCard(ctx, share)),
      ),
      trendingRegional: await Promise.all(
        regionalShares
          .filter((share: any) => canSeeShare(user, share, followingIds))
          .slice(0, limit)
          .map((share: any) => enrichShareCard(ctx, share)),
      ),
      curriculumPicks: await Promise.all(
        curriculumShares
          .filter((share: any) => canSeeShare(user, share, followingIds))
          .slice(0, limit)
          .map((share: any) => enrichShareCard(ctx, share)),
      ),
      followingPicks: await Promise.all(
        followingShares.map((share: any) => enrichShareCard(ctx, share)),
      ),
    };
  },
});
