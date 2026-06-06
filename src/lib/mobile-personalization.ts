type ListValue = string | string[] | null | undefined;

interface LearnerShape {
  name?: string | null;
  country?: string | null;
  region?: string | null;
  curriculum?: string | null;
  curriculumTrack?: string | null;
  gradeLevel?: string | null;
  targetSubjects?: ListValue;
  targetExams?: ListValue;
  studyPace?: string | null;
  preferredLanguage?: string | null;
  schoolId?: string | null;
  isRTL?: boolean | null;
}

interface DashboardBriefInput {
  user?: LearnerShape | null;
  searchQuery?: string | null;
  recommendations?: {
    dueFlashcardsCount?: number | null;
    groundedStudy?: {
      averageReadiness?: number | null;
      materialsNeedingAssets?: number | null;
      totalRecentMaterials?: number | null;
    } | null;
    primaryAction?: { title?: string | null } | null;
    nextActions?: Array<{ title?: string | null }> | null;
  } | null;
  dailyGoals?: Array<{ isCompleted?: boolean | null }> | null;
  recentMaterials?: Array<{
    title?: string | null;
    type?: string | null;
  }> | null;
}

interface WorkspaceBriefInput {
  user?: LearnerShape | null;
  sourceTitle?: string | null;
  sourceWordCount?: number;
  studyTimeSeconds?: number;
  materialType?: string | null;
  hasSummary?: boolean;
}

interface WorkspaceCoachInput {
  user?: LearnerShape | null;
  sourceTitle?: string | null;
  activeToolLabel: string;
}

type RecentMaterial = NonNullable<DashboardBriefInput["recentMaterials"]>[number];

export type MobileDashboardActionId =
  | "upload"
  | "flashcards"
  | "quiz"
  | "focus";

function humanize(value?: string | null) {
  if (!value) return "";

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeList(value: ListValue) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => humanize(item)).filter(Boolean);
  }

  return value
    .split(/[|,/]/)
    .map((item) => humanize(item))
    .filter(Boolean);
}

function getFirstName(name?: string | null) {
  return (name || "").trim().split(/\s+/).filter(Boolean)[0] || "";
}

function getPaceDescriptor(studyPace?: string | null) {
  const normalized = (studyPace || "").toLowerCase();

  if (
    normalized.includes("fast") ||
    normalized.includes("intense") ||
    normalized.includes("sprint")
  ) {
    return {
      label: "Sprint pace",
      tone: "fast-moving",
      session: "short, sharp reps",
    };
  }

  if (
    normalized.includes("slow") ||
    normalized.includes("steady") ||
    normalized.includes("calm")
  ) {
    return {
      label: "Steady pace",
      tone: "steady",
      session: "calm, longer blocks",
    };
  }

  return {
    label: "Balanced pace",
    tone: "balanced",
    session: "mixed review blocks",
  };
}

function formatMaterialLabel(type?: string | null) {
  if (!type) return "source";
  return type === "pdf" ? "document" : humanize(type).toLowerCase();
}

function buildSourceSetSummary(
  recentMaterials?: DashboardBriefInput["recentMaterials"],
) {
  const sourceCount = recentMaterials?.length ?? 0;
  const selectedTitles =
    recentMaterials
      ?.map((material) => material.title?.trim())
      .filter((title): title is string => Boolean(title))
      .slice(0, 3) ?? [];

  if (sourceCount === 0) {
    return {
      label: "Selected source set",
      value: "No sources selected",
      detail:
        "Capture or paste one source so chat, flashcards, and quizzes stay grounded.",
    };
  }

  return {
    label: "Selected source set",
    value: `${sourceCount} source${sourceCount === 1 ? "" : "s"} ready`,
    detail: selectedTitles.length
      ? `Grounding review on ${selectedTitles.join(", ")}.`
      : "Grounding review on your latest study material.",
  };
}

function buildGroundingStatus(
  groundedStudy?: NonNullable<
    DashboardBriefInput["recommendations"]
  >["groundedStudy"],
  fallbackSourceCount = 0,
) {
  const totalSources = groundedStudy?.totalRecentMaterials ?? fallbackSourceCount;

  if (totalSources <= 0) {
    return {
      label: "Grounded readiness",
      value: "No sources yet",
      detail: "Add one source to unlock summaries, notes, recall, and quizzes.",
      tone: "empty" as const,
    };
  }

  if (!groundedStudy) {
    return {
      label: "Grounded readiness",
      value: `${totalSources} source${totalSources === 1 ? "" : "s"} detected`,
      detail:
        "Study assets are still being checked, so keep the latest sources visible before review.",
      tone: "steady" as const,
    };
  }

  const readiness = Math.max(
    0,
    Math.min(100, Math.round(groundedStudy?.averageReadiness ?? 0)),
  );
  const missingCount = Math.max(groundedStudy?.materialsNeedingAssets ?? 0, 0);

  if (missingCount === 0) {
    return {
      label: "Grounded readiness",
      value: `${readiness}% ready`,
      detail: `${totalSources} source${totalSources === 1 ? "" : "s"} have the core study assets ready.`,
      tone: "ready" as const,
    };
  }

  return {
    label: "Grounded readiness",
    value: `${readiness}% ready`,
    detail: `${missingCount} of ${totalSources} source${totalSources === 1 ? "" : "s"} still need study assets.`,
    tone: readiness >= 75 ? ("steady" as const) : ("needs-work" as const),
  };
}

function buildMicroSessionPlan({
  dueFlashcards,
  pendingGoalCount,
  groundedStudy,
  latestMaterial,
  profile,
}: {
  dueFlashcards: number;
  pendingGoalCount: number;
  groundedStudy?: NonNullable<
    DashboardBriefInput["recommendations"]
  >["groundedStudy"];
  latestMaterial?: RecentMaterial;
  profile: ReturnType<typeof buildMobileLearnerProfile>;
}) {
  const missingSourceAssets = Math.max(
    groundedStudy?.materialsNeedingAssets ?? 0,
    0,
  );
  const steps: string[] = [];

  if (dueFlashcards > 0) {
    steps.push(
      `Review ${dueFlashcards} due card${dueFlashcards === 1 ? "" : "s"}.`,
    );
  }

  if (missingSourceAssets > 0) {
    steps.push(
      `Build missing assets for ${missingSourceAssets} source${missingSourceAssets === 1 ? "" : "s"}.`,
    );
  }

  if (pendingGoalCount > 0) {
    steps.push(
      `Close ${pendingGoalCount} open goal${pendingGoalCount === 1 ? "" : "s"}.`,
    );
  }

  if (steps.length === 0 && latestMaterial?.title) {
    steps.push(`Quiz yourself on ${latestMaterial.title}.`);
  }

  if (steps.length === 0) {
    steps.push(`Capture one ${profile.focusSubject.toLowerCase()} source.`);
  }

  const title =
    dueFlashcards > 0 && missingSourceAssets > 0
      ? "Clear recall, then finish the source setup"
      : dueFlashcards > 0
        ? "Clear recall while the material is warm"
        : missingSourceAssets > 0
          ? "Finish grounding your latest sources"
          : pendingGoalCount > 0
            ? "Close today's open goal"
            : latestMaterial?.title
              ? "Pressure-test the latest source"
              : "Capture the first source";

  const cta =
    dueFlashcards > 0
      ? "Start with recall"
      : missingSourceAssets > 0
        ? "Build study assets"
        : pendingGoalCount > 0
          ? "Open focus block"
          : latestMaterial?.title
            ? "Run a quick quiz"
            : "Capture a source";
  const actionId: MobileDashboardActionId =
    dueFlashcards > 0 || missingSourceAssets > 0
      ? "flashcards"
      : pendingGoalCount > 0
        ? "focus"
        : latestMaterial?.title
          ? "quiz"
          : "upload";

  return {
    label: "Next 10 minutes",
    title,
    steps: steps.slice(0, 3),
    cta,
    actionId,
  };
}

function buildStarterPrompts({
  profile,
  routedFocus,
  primaryAction,
  dueFlashcards,
  latestMaterial,
}: {
  profile: ReturnType<typeof buildMobileLearnerProfile>;
  routedFocus: string;
  primaryAction: { label: string; detail: string };
  dueFlashcards: number;
  latestMaterial?: RecentMaterial;
}) {
  const focusPrompt = `Start with one diagnostic question about ${routedFocus}, then guide me through the next best study step.`;
  const actionPrompt =
    dueFlashcards > 0
      ? `Help me clear ${dueFlashcards} due flashcards with short explanations after each answer.`
      : `${primaryAction.label}. ${primaryAction.detail}`;
  const sourcePrompt = latestMaterial?.title
    ? `Use ${latestMaterial.title} as the selected source and make a ${profile.paceTone} review plan.`
    : `Help me capture one source for ${profile.focusSubject} and turn it into flashcards and a quiz.`;

  return [focusPrompt, actionPrompt, sourcePrompt];
}

function buildStarterPromptActions({
  prompts,
  dueFlashcards,
  latestMaterial,
}: {
  prompts: string[];
  dueFlashcards: number;
  latestMaterial?: RecentMaterial;
}) {
  const formatChipLabel = (prefix: string, value?: string | null) => {
    const maxLength = 22;
    const cleanValue = value?.trim();
    if (!cleanValue) return prefix.trim();

    const fullLabel = `${prefix}${cleanValue}`;
    if (fullLabel.length <= maxLength) return fullLabel;

    const availableValueLength = Math.max(
      0,
      maxLength - prefix.length - "...".length,
    );
    return `${prefix}${cleanValue.slice(0, availableValueLength).trimEnd()}...`;
  };

  const sourceLabel = latestMaterial?.title?.trim()
    ? formatChipLabel("Use ", latestMaterial.title)
    : "Capture a source";

  return [
    {
      label: "Ask a diagnostic",
      prompt: prompts[0],
    },
    {
      label:
        dueFlashcards > 0
          ? `Clear ${dueFlashcards} card${dueFlashcards === 1 ? "" : "s"}`
          : "Plan next step",
      prompt: prompts[1],
    },
    {
      label: sourceLabel,
      prompt: prompts[2],
    },
  ];
}

export function buildMobileLearnerProfile(user?: LearnerShape | null) {
  const subjects = normalizeList(user?.targetSubjects);
  const exams = normalizeList(user?.targetExams);
  const curriculum =
    humanize(user?.curriculumTrack) || humanize(user?.curriculum) || "General";
  const focusSubject = subjects[0] || curriculum;
  const checkpoint =
    exams[0] || humanize(user?.gradeLevel) || "your next checkpoint";
  const pace = getPaceDescriptor(user?.studyPace);
  const country = humanize(user?.country) || "Global";
  const school = humanize(user?.schoolId) || "Private lane";
  const language =
    humanize(user?.preferredLanguage) ||
    (user?.isRTL ? "Arabic-first" : "English-first");

  return {
    firstName: getFirstName(user?.name),
    focusSubject,
    checkpoint,
    paceLabel: pace.label,
    paceTone: pace.tone,
    sessionStyle: pace.session,
    school,
    language,
    chips: [country, curriculum, school].filter(Boolean),
    profileTitle: `${focusSubject} on a ${pace.tone} lane`,
    profileSummary: `Cryonex can shape capture, coaching, and practice around ${focusSubject} while keeping ${checkpoint.toLowerCase()} visible.`,
  };
}

export function buildMobileDashboardBrief({
  user,
  searchQuery,
  recommendations,
  dailyGoals,
  recentMaterials,
}: DashboardBriefInput) {
  const profile = buildMobileLearnerProfile(user);
  const dueFlashcards = recommendations?.dueFlashcardsCount ?? 0;
  const completedGoals =
    dailyGoals?.filter((goal) => goal.isCompleted).length ?? 0;
  const totalGoals = dailyGoals?.length ?? 0;
  const pendingGoalCount = Math.max(totalGoals - completedGoals, 0);
  const latestMaterial = recentMaterials?.[0];
  const recentMaterialCount = recentMaterials?.length ?? 0;
  const routedFocus =
    searchQuery?.trim() ||
    recommendations?.primaryAction?.title ||
    recommendations?.nextActions?.[0]?.title ||
    latestMaterial?.title ||
    profile.focusSubject;
  const primaryAction =
    dueFlashcards > 0
      ? {
          id: "flashcards" as const,
          label: `Review ${dueFlashcards} card${dueFlashcards === 1 ? "" : "s"}`,
          detail: "Clear the due queue while the material is still warm.",
        }
      : pendingGoalCount > 0
        ? {
            id: "focus" as const,
            label: "Open today's focus block",
            detail:
              "Keep the phone shell pointed at the goals you still need to close.",
          }
        : latestMaterial
          ? {
              id: "quiz" as const,
              label: "Run a quick quiz",
              detail: `Pressure-test your latest ${formatMaterialLabel(latestMaterial.type)} before moving on.`,
            }
          : {
              id: "upload" as const,
              label: "Capture a new source",
              detail:
                "Upload, scan, or paste one source to unlock the rest of the study flow.",
            };
  const secondaryAction =
    pendingGoalCount > 0
      ? {
          label: `${pendingGoalCount} goal${pendingGoalCount === 1 ? "" : "s"} still open`,
          detail:
            "Keep the dashboard pointed at today instead of the whole week.",
        }
      : latestMaterial
        ? {
            label: `Continue ${latestMaterial.title || "latest source"}`,
            detail:
              "Resume from the source the rest of your mobile tools already understand.",
          }
        : {
            label: "Start a focus sprint",
            detail:
              "Use a short session to build momentum once your material is ready.",
          };
  const starterPrompts = buildStarterPrompts({
    profile,
    routedFocus,
    primaryAction,
    dueFlashcards,
    latestMaterial,
  });

  return {
    greeting:
      !profile.firstName || profile.firstName === "Learner"
        ? "Welcome back"
        : `Welcome back, ${profile.firstName}`,
    headline:
      profile.firstName && profile.firstName !== "Learner"
        ? `${profile.firstName}, your mobile study lane is ready.`
        : "Your mobile study lane is ready.",
    subheadline: searchQuery?.trim()
      ? `Built around "${searchQuery.trim()}" so capture, coaching, and review stay aligned.`
      : !profile.firstName || profile.firstName === "Learner"
        ? "Capture one source and Cryonex will tune this phone dashboard around your next review step."
        : `Keep this phone view tuned for ${profile.checkpoint.toLowerCase()}, quick capture, and one-handed revision.`,
    momentumLabel:
      dueFlashcards > 0
        ? `${dueFlashcards} cards due`
        : latestMaterial
          ? `Latest source: ${latestMaterial.title || "ready to resume"}`
          : "No source loaded yet",
    coachPrompt:
      searchQuery?.trim() ||
      latestMaterial?.title ||
      `Build a calm ${profile.focusSubject.toLowerCase()} revision plan for me`,
    primaryAction,
    secondaryAction,
    insightCards: [
      {
        label: "Curriculum",
        value:
          humanize(user?.curriculumTrack) ||
          humanize(user?.curriculum) ||
          "General",
        detail: "Used to personalize practice lanes and pacing.",
      },
      {
        label: "Region",
        value: humanize(user?.country) || "Global",
        detail: "Keeps the mobile brief aligned with your school context.",
      },
      {
        label: "Today",
        value:
          totalGoals > 0
            ? `${completedGoals}/${totalGoals} goals done`
            : "Goals ready to set",
        detail:
          totalGoals > 0
            ? "Daily progress stays visible at a glance."
            : "Add a goal to turn the dashboard into a daily control surface.",
      },
    ],
    focusLabel: routedFocus,
    sourceSet: buildSourceSetSummary(recentMaterials),
    groundingStatus: buildGroundingStatus(
      recommendations?.groundedStudy,
      recentMaterialCount,
    ),
    microSessionPlan: buildMicroSessionPlan({
      dueFlashcards,
      pendingGoalCount,
      groundedStudy: recommendations?.groundedStudy,
      latestMaterial,
      profile,
    }),
    starterPrompts,
    starterPromptActions: buildStarterPromptActions({
      prompts: starterPrompts,
      dueFlashcards,
      latestMaterial,
    }),
    momentumSummary:
      pendingGoalCount > 0
        ? `${pendingGoalCount} goal${pendingGoalCount === 1 ? "" : "s"} still open today.`
        : `Use ${profile.sessionStyle} to keep momentum without stretching the session.`,
    cards: [
      {
        id: "capture",
        eyebrow: "Capture",
        title: "Bring in a fresh source",
        description: `Scan ${profile.focusSubject.toLowerCase()} notes, worksheets, or a whiteboard before the next review.`,
        meta:
          recentMaterialCount > 0
            ? `${recentMaterialCount} recent source${recentMaterialCount === 1 ? "" : "s"}`
            : "No recent sources yet",
      },
      {
        id: "flashcards",
        eyebrow: "Recall",
        title:
          dueFlashcards > 0
            ? `Clear ${dueFlashcards} due card${dueFlashcards === 1 ? "" : "s"}`
            : "Build a fresh recall set",
        description: `Keep ${profile.checkpoint.toLowerCase()} in reach with one-thumb spaced review.`,
        meta: dueFlashcards > 0 ? "Ready now" : "Generate on demand",
      },
      {
        id: "quiz",
        eyebrow: "Pressure test",
        title: `Quiz ${profile.focusSubject}`,
        description: `Check weak spots before ${profile.checkpoint.toLowerCase()} using short adaptive questions.`,
        meta: "Exam rehearsal",
      },
      {
        id: "focus",
        eyebrow: "Deep work",
        title: "Start a clean session",
        description: `Match the workspace to your ${profile.paceTone} pace and finish one clear block.`,
        meta: profile.paceLabel,
      },
    ],
  };
}

export function buildMobileWorkspaceBrief({
  user,
  sourceTitle,
  sourceWordCount = 0,
  materialType,
  hasSummary,
}: WorkspaceBriefInput) {
  const curriculum =
    humanize(user?.curriculumTrack) || humanize(user?.curriculum) || "General";
  const language = humanize(user?.preferredLanguage) || "English";
  const recommendedTool =
    hasSummary && sourceWordCount > 2200
      ? {
          id: "mindmap",
          label: "Open the concept map",
          reason:
            "You already have summary coverage, so a structure-first pass will reduce mobile scrolling.",
        }
      : sourceWordCount > 1400
        ? {
            id: "summary",
            label: "Refine the summary first",
            reason:
              "Longer sources read better on mobile once the key ideas are compressed.",
          }
        : hasSummary
          ? {
              id: "chat",
              label: "Ask the source-linked coach",
              reason:
                "Shorter sources are ready for questions, clarification, and follow-up drills.",
            }
          : {
              id: "notes",
              label: "Generate notes first",
              reason:
                "Create a lighter scaffold before switching into deeper tools.",
            };

  return {
    headline: sourceTitle || "Your study workspace",
    subheadline: `This ${formatMaterialLabel(materialType)} is now arranged for phone-first reading, faster tab switching, and clearer next steps.`,
    focusLabel:
      sourceWordCount > 0
        ? `${sourceWordCount.toLocaleString()} words grounded`
        : "Source ready for review",
    recommendedToolId: recommendedTool.id,
    recommendedToolLabel: recommendedTool.label,
    recommendedToolReason: recommendedTool.reason,
    badges: [
      curriculum,
      language,
      user?.region
        ? `Region ${String(user.region).toUpperCase()}`
        : "Global track",
    ],
  };
}

export function buildMobileWorkspaceToolBriefs({
  user,
  sourceTitle,
  sourceWordCount = 0,
  studyTimeSeconds = 0,
}: WorkspaceBriefInput) {
  const profile = buildMobileLearnerProfile(user);
  const sourceLabel = sourceTitle || "this source";
  const sourceMetric =
    sourceWordCount > 0
      ? `${sourceWordCount.toLocaleString()} words`
      : "Source ready";
  const liveMetric =
    studyTimeSeconds > 0
      ? `${Math.max(1, Math.round(studyTimeSeconds / 60))} min live`
      : "Session ready";

  return {
    summary: {
      eyebrow: "Read fast",
      description: `Compress ${sourceLabel} into ${profile.sessionStyle} that still respect the original source.`,
      metric: sourceMetric,
    },
    chat: {
      eyebrow: "Ask grounded",
      description: `Question ${sourceLabel} and keep the answers anchored to ${profile.focusSubject.toLowerCase()}.`,
      metric: "Copilot linked",
    },
    flashcards: {
      eyebrow: "Recall reps",
      description: `Turn the source into repeatable prompts for ${profile.checkpoint.toLowerCase()}.`,
      metric: profile.paceLabel,
    },
    quizzes: {
      eyebrow: "Test depth",
      description: `Pressure-test the hard parts before ${profile.checkpoint.toLowerCase()} catches up with you.`,
      metric: "Adaptive checks",
    },
    notes: {
      eyebrow: "Rewrite clearly",
      description: `Restate the source in a ${profile.language.toLowerCase()} study voice you can scan quickly.`,
      metric: "Own words",
    },
    mindmap: {
      eyebrow: "See structure",
      description: `Map how the ideas connect when ${sourceLabel.toLowerCase()} starts to feel dense.`,
      metric: sourceMetric,
    },
    gaps: {
      eyebrow: "Find weak spots",
      description: `Spot the concepts that still need another pass before the next session.`,
      metric: liveMetric,
    },
    diagrams: {
      eyebrow: "Hide and recall",
      description: `Use occlusion drills when labels, formulas, or diagrams need pure memory work.`,
      metric: "Visual recall",
    },
  };
}

export function buildMobileWorkspaceCoach({
  user,
  sourceTitle,
  activeToolLabel,
}: WorkspaceCoachInput) {
  const profile = buildMobileLearnerProfile(user);
  const sourceLabel = sourceTitle || "this source";
  const title = `${activeToolLabel} with ${profile.focusSubject}`;
  const prompt = `Help me use the ${activeToolLabel.toLowerCase()} view on ${sourceLabel}. Ask me one diagnostic question first, guide me step by step, and check my understanding before giving the final answer. Focus on ${profile.focusSubject}, keep it ${profile.paceTone}, and optimize for a mobile study session before ${profile.checkpoint.toLowerCase()}.`;

  return {
    title,
    description: `Ask the assistant to tailor ${activeToolLabel.toLowerCase()} work for ${profile.focusSubject.toLowerCase()} and keep the plan tight enough for mobile study.`,
    prompt,
  };
}
