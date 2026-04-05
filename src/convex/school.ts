import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { COUNTRIES } from "../lib/countryConfig";
import {
  isAlhussanSchool,
  buildStudentClassLabel,
  getAvailableClassSections,
} from "../lib/schoolConfig";

const DAY_MS = 24 * 60 * 60 * 1000;

type Timeframe = "all-time" | "weekly" | "daily";
type ViewMode = "overall" | "class" | "individual";
type MetricSnapshot = {
  studyPacksCreated: number;
  studyMinutes: number;
  quizQuestionsCorrect: number;
  quizQuestionsAnswered: number;
  quizzesCompleted: number;
};

function getSchoolName(schoolId?: string | null, countryId?: string | null) {
  if (countryId && COUNTRIES[countryId]) {
    const school = COUNTRIES[countryId].schools.find(
      (entry) => entry.id === schoolId,
    );
    if (school) return school.name;
  }

  for (const country of Object.values(COUNTRIES)) {
    const school = country.schools.find((entry) => entry.id === schoolId);
    if (school) return school.name;
  }

  return schoolId || "School";
}

function canViewProfile(viewer: any, profileUser: any) {
  if (!profileUser) return false;
  if (viewer && String(viewer._id) === String(profileUser._id)) return true;

  const visibility = profileUser.profileVisibility || "private";
  if (visibility === "public") return true;

  if (visibility === "school") {
    return Boolean(
      viewer?.schoolId &&
        profileUser.schoolId &&
        viewer.schoolId === profileUser.schoolId &&
        profileUser.schoolNetworkOptIn !== false,
    );
  }

  return false;
}

function buildProfilePath(userId: string) {
  return `/school/profiles/${userId}`;
}

function getWindowStart(timeframe: Timeframe) {
  const now = Date.now();
  if (timeframe === "daily") return now - DAY_MS;
  if (timeframe === "weekly") return now - 7 * DAY_MS;
  return null;
}

async function getUserMetricsForTimeframe(
  ctx: any,
  user: any,
  timeframe: Timeframe,
): Promise<MetricSnapshot> {
  const windowStart = getWindowStart(timeframe);

  const [packs, sessions, quizAttempts] = await Promise.all([
    ctx.db
      .query("studyPacks")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("studySessions")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect(),
    ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q: any) => q.eq("userId", user._id))
      .collect(),
  ]);

  const filteredPacks = windowStart
    ? packs.filter((pack: any) => Number(pack.updatedAt || 0) >= windowStart)
    : packs;
  const filteredSessions = windowStart
    ? sessions.filter((session: any) => Number(session.startTime || 0) >= windowStart)
    : sessions;
  const filteredAttempts = windowStart
    ? quizAttempts.filter(
        (attempt: any) => Number(attempt.completedAt || 0) >= windowStart,
      )
    : quizAttempts;

  return {
    studyPacksCreated: filteredPacks.length,
    studyMinutes: Math.round(
      filteredSessions.reduce(
        (sum: number, session: any) => sum + Number(session.duration || 0),
        0,
      ) /
        60000,
    ),
    quizQuestionsCorrect: filteredAttempts.reduce(
      (sum: number, attempt: any) => sum + Number(attempt.correctAnswers || 0),
      0,
    ),
    quizQuestionsAnswered: filteredAttempts.reduce(
      (sum: number, attempt: any) => sum + Number(attempt.totalQuestions || 0),
      0,
    ),
    quizzesCompleted: filteredAttempts.length,
  };
}

function buildScoreSet(
  metrics: MetricSnapshot,
  maxima: {
    studyPacksCreated: number;
    studyMinutes: number;
    quizQuestionsCorrect: number;
  },
) {
  const studyPacks = Math.round(
    (metrics.studyPacksCreated / Math.max(1, maxima.studyPacksCreated)) * 100,
  );
  const studyTime = Math.round(
    (metrics.studyMinutes / Math.max(1, maxima.studyMinutes)) * 100,
  );
  const quizAccuracy = Math.round(
    (metrics.quizQuestionsCorrect / Math.max(1, maxima.quizQuestionsCorrect)) *
      100,
  );
  const overall = Math.round(
    studyPacks * 0.35 + studyTime * 0.35 + quizAccuracy * 0.3,
  );

  return {
    overall,
    studyPacks,
    studyTime,
    quizAccuracy,
  };
}

function toStudentEntry(user: any, metrics: MetricSnapshot) {
  return {
    userId: String(user._id),
    name: user.name || "Student",
    image: user.image || null,
    bio: user.bio || null,
    interests: user.interests || [],
    schoolId: user.schoolId || null,
    schoolName: getSchoolName(user.schoolId, user.country),
    gradeLevel: user.gradeLevel || null,
    curriculumTrack: user.curriculumTrack || user.curriculum || null,
    classSection: user.classSection || null,
    profilePath: buildProfilePath(String(user._id)),
    isCurrentUser: false,
    metrics,
  };
}

function addScores(entries: any[]) {
  const maxima = entries.reduce(
    (acc, entry) => ({
      studyPacksCreated: Math.max(
        acc.studyPacksCreated,
        Number(entry.metrics.studyPacksCreated || 0),
      ),
      studyMinutes: Math.max(acc.studyMinutes, Number(entry.metrics.studyMinutes || 0)),
      quizQuestionsCorrect: Math.max(
        acc.quizQuestionsCorrect,
        Number(entry.metrics.quizQuestionsCorrect || 0),
      ),
    }),
    {
      studyPacksCreated: 1,
      studyMinutes: 1,
      quizQuestionsCorrect: 1,
    },
  );

  return entries.map((entry) => ({
    ...entry,
    scores: buildScoreSet(entry.metrics, maxima),
  }));
}

function aggregateClassEntries(entries: any[]) {
  const groups = new Map<string, any>();

  for (const entry of entries) {
    const classLabel =
      buildStudentClassLabel({
        gradeLevel: entry.gradeLevel,
        classSection: entry.classSection,
      }) || "Unassigned class";

    const existing = groups.get(classLabel) || {
      userId: `class:${classLabel}`,
      name: classLabel,
      image: null,
      bio: `${classLabel} combined performance lane.`,
      interests: [],
      schoolId: entry.schoolId,
      schoolName: entry.schoolName,
      gradeLevel: entry.gradeLevel,
      curriculumTrack: entry.curriculumTrack,
      classSection: entry.classSection,
      profilePath: null,
      metrics: {
        studyPacksCreated: 0,
        studyMinutes: 0,
        quizQuestionsCorrect: 0,
        quizQuestionsAnswered: 0,
        quizzesCompleted: 0,
      },
      memberCount: 0,
    };

    existing.metrics.studyPacksCreated += Number(
      entry.metrics.studyPacksCreated || 0,
    );
    existing.metrics.studyMinutes += Number(entry.metrics.studyMinutes || 0);
    existing.metrics.quizQuestionsCorrect += Number(
      entry.metrics.quizQuestionsCorrect || 0,
    );
    existing.metrics.quizQuestionsAnswered += Number(
      entry.metrics.quizQuestionsAnswered || 0,
    );
    existing.metrics.quizzesCompleted += Number(
      entry.metrics.quizzesCompleted || 0,
    );
    existing.memberCount += 1;
    existing.bio = `${existing.memberCount} students in this class lane.`;

    groups.set(classLabel, existing);
  }

  return addScores(Array.from(groups.values()));
}

function sortEntries(entries: any[], mode: ViewMode) {
  return entries
    .slice()
    .sort((a, b) => {
      const primary =
        mode === "overall"
          ? Number(b.scores?.overall || 0) - Number(a.scores?.overall || 0)
          : Number(b.scores?.overall || 0) - Number(a.scores?.overall || 0);
      if (primary !== 0) return primary;

      return (
        Number(b.metrics.studyMinutes || 0) - Number(a.metrics.studyMinutes || 0)
      );
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

async function buildBoardsForSchool(ctx: any, schoolUsers: any[]) {
  const timeframes: Timeframe[] = ["all-time", "weekly", "daily"];
  const boards: any[] = [];

  for (const timeframe of timeframes) {
    const studentEntries = addScores(
      await Promise.all(
        schoolUsers.map(async (user) =>
          toStudentEntry(user, await getUserMetricsForTimeframe(ctx, user, timeframe)),
        ),
      ),
    );

    const individualEntries = sortEntries(studentEntries, "individual");
    const classEntries = sortEntries(
      aggregateClassEntries(studentEntries),
      "class",
    );

    boards.push({
      timeframe,
      view: "overall",
      title:
        timeframe === "all-time"
          ? "All-time overall"
          : timeframe === "weekly"
            ? "Weekly overall"
            : "Daily overall",
      description: "Combined score across study packs, study time, and quiz accuracy.",
      entries: individualEntries,
    });
    boards.push({
      timeframe,
      view: "class",
      title:
        timeframe === "all-time"
          ? "All-time class performance"
          : timeframe === "weekly"
            ? "Weekly class performance"
            : "Daily class performance",
      description: "Aggregated performance by grade and section.",
      entries: classEntries,
    });
    boards.push({
      timeframe,
      view: "individual",
      title:
        timeframe === "all-time"
          ? "All-time individual performance"
          : timeframe === "weekly"
            ? "Weekly individual performance"
            : "Daily individual performance",
      description: "Student-by-student leaderboard for the selected time window.",
      entries: individualEntries,
    });
  }

  return boards;
}

export const getSchoolLeaderboards = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await getCurrentUser(ctx);
    if (!viewer?.schoolId) {
      return {
        schoolName: "School",
        boards: [],
        classSections: [],
      };
    }

    const schoolUsers = await ctx.db
      .query("users")
      .withIndex("by_schoolId", (q: any) => q.eq("schoolId", viewer.schoolId))
      .collect();

    const eligibleUsers = schoolUsers.filter(
      (user: any) =>
        user.schoolNetworkOptIn !== false && user.profileVisibility !== "private",
    );

    const boards = await buildBoardsForSchool(ctx, eligibleUsers);
    const limit = Math.max(1, Math.min(args.limit || 50, 100));
    const limitedBoards = boards.map((board) => ({
      ...board,
      entries: board.entries.slice(0, limit),
    }));

    const sectionsFromData = Array.from(
      new Set(
        eligibleUsers
          .map((user: any) => user.classSection)
          .filter(Boolean)
          .map((section: string) => String(section)),
      ),
    );

    const fallbackSections = isAlhussanSchool(viewer.schoolId)
        ? getAvailableClassSections(viewer.schoolId, viewer.gradeLevel)
        : [];
    const classSections = Array.from(
      new Set([...sectionsFromData, ...fallbackSections]),
    ).map((sectionId) => ({
      id: sectionId,
      label: sectionId,
      description:
        sectionId === "A" ? "American curriculum section" : undefined,
    }));

    return {
      schoolName: getSchoolName(viewer.schoolId, viewer.country),
      boards: limitedBoards,
      classSections,
    };
  },
});

export const getStudentProfile = query({
  args: {
    profileUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const viewer = await getCurrentUser(ctx);
    const profileUser = await ctx.db.get(args.profileUserId);
    if (!profileUser || !canViewProfile(viewer, profileUser)) {
      return null;
    }

    const schoolUsers = profileUser.schoolId
      ? await ctx.db
          .query("users")
          .withIndex("by_schoolId", (q: any) =>
            q.eq("schoolId", profileUser.schoolId),
          )
          .collect()
      : [profileUser];

    const eligibleUsers = schoolUsers.filter(
      (user: any) =>
        user.schoolNetworkOptIn !== false && user.profileVisibility !== "private",
    );
    const boards = await buildBoardsForSchool(ctx, eligibleUsers);

    const profileBoards = boards.map((board) => ({
      ...board,
      entries: board.entries.filter(
        (entry: any) =>
          entry.userId === String(profileUser._id) ||
          entry.classSection === profileUser.classSection,
      ),
    }));

    const allTimeMetrics = await getUserMetricsForTimeframe(
      ctx,
      profileUser,
      "all-time",
    );

    const allTimeOverallBoard = boards.find(
      (board) => board.timeframe === "all-time" && board.view === "overall",
    );
    const weeklyClassBoard = boards.find(
      (board) => board.timeframe === "weekly" && board.view === "class",
    );
    const weeklyIndividualBoard = boards.find(
      (board) => board.timeframe === "weekly" && board.view === "individual",
    );

    const individualEntry = allTimeOverallBoard?.entries.find(
      (entry: any) => entry.userId === String(profileUser._id),
    );
    const classLabel = buildStudentClassLabel({
      gradeLevel: profileUser.gradeLevel,
      classSection: profileUser.classSection,
    });
    const classEntry = weeklyClassBoard?.entries.find(
      (entry: any) => entry.name === classLabel,
    );
    const weeklyIndividualEntry = weeklyIndividualBoard?.entries.find(
      (entry: any) => entry.userId === String(profileUser._id),
    );

    return {
      profile: {
        userId: String(profileUser._id),
        name: profileUser.name || "Student",
        image: profileUser.image || null,
        bio: profileUser.bio || null,
        interests: profileUser.interests || [],
        schoolId: profileUser.schoolId || null,
        schoolName: getSchoolName(profileUser.schoolId, profileUser.country),
        gradeLevel: profileUser.gradeLevel || null,
        curriculumTrack:
          profileUser.curriculumTrack || profileUser.curriculum || null,
        classSection: profileUser.classSection || null,
        profilePath: buildProfilePath(String(profileUser._id)),
        profileVisibility: profileUser.profileVisibility || "private",
        isCurrentUser:
          viewer && String(viewer._id) === String(profileUser._id),
      },
      leaderboardSummary: {
        overallScore: individualEntry?.scores?.overall || 0,
        studyPacksCreated: allTimeMetrics.studyPacksCreated,
        studyMinutes: allTimeMetrics.studyMinutes,
        quizQuestionsCorrect: allTimeMetrics.quizQuestionsCorrect,
        quizQuestionsAnswered: allTimeMetrics.quizQuestionsAnswered,
        classRanking: classEntry?.rank,
        individualRanking: weeklyIndividualEntry?.rank,
        categoryRatings: individualEntry?.scores || {},
        boards: profileBoards,
      },
    };
  },
});
