export type StudyWorkspaceTabId =
  | "summary"
  | "chat"
  | "flashcards"
  | "quizzes"
  | "notes"
  | "mindmap"
  | "gaps"
  | "diagrams";

export type WorkspaceRecommendationAction = {
  action?: string | null;
  description?: string | null;
  title?: string | null;
};

export type WorkspaceOSState = {
  flowState?: "deep-focus" | "fatigue" | "learning" | "review" | null;
} | null;

interface BuildStudyWorkspaceFlowInput {
  hasSummary?: boolean;
  osState?: WorkspaceOSState;
  recommendations?: {
    dueFlashcardsCount?: number | null;
    primaryAction?: WorkspaceRecommendationAction | null;
    nextActions?: WorkspaceRecommendationAction[] | null;
  } | null;
  sourceWordCount?: number;
  sourceTitle?: string | null;
  flashcardsCount?: number;
  reviewedFlashcardsCount?: number;
  masteredFlashcardsCount?: number;
  quizzesCount?: number;
  quizQuestionCount?: number;
}

export interface StudyWorkspaceFlow {
  label: string;
  reason: string;
  targetTab: StudyWorkspaceTabId;
  badge: string;
}

const ACTION_TO_TAB: Record<string, StudyWorkspaceTabId> = {
  build_summary: "summary",
  complete_daily_goal: "summary",
  create_daily_goal: "summary",
  generate_flashcards: "flashcards",
  generate_notes: "notes",
  generate_quiz: "quizzes",
  open_flashcards: "flashcards",
  open_regional_trainer: "gaps",
  resume_practice: "flashcards",
  start_focus_mode: "summary",
};

function getPrimaryRecommendation(
  recommendations?: BuildStudyWorkspaceFlowInput["recommendations"],
) {
  return (
    recommendations?.primaryAction ||
    recommendations?.nextActions?.find((action) => action?.action) ||
    null
  );
}

export function buildStudyWorkspaceFlow({
  hasSummary = false,
  osState = null,
  recommendations,
  sourceWordCount = 0,
  sourceTitle,
  flashcardsCount = 0,
  reviewedFlashcardsCount = 0,
  masteredFlashcardsCount = 0,
  quizzesCount = 0,
  quizQuestionCount = 0,
}: BuildStudyWorkspaceFlowInput): StudyWorkspaceFlow {
  const primaryRecommendation = getPrimaryRecommendation(recommendations);

  if (osState?.flowState === "fatigue") {
    return {
      label: "Open Simple Summary",
      reason:
        "Student OS noticed fatigue, so the best next move is a lighter reading pass with fewer switches.",
      targetTab: "summary",
      badge: "Simple mode recommended",
    };
  }

  if (primaryRecommendation?.action) {
    return {
      label: primaryRecommendation.title || "Next best action",
      reason:
        primaryRecommendation.description ||
        `Keep moving through ${sourceTitle || "this source"} with the clearest next step.`,
      targetTab: ACTION_TO_TAB[primaryRecommendation.action] || "summary",
      badge:
        primaryRecommendation.action === "open_flashcards"
          ? `${recommendations?.dueFlashcardsCount || 0} due now`
          : "Recommended next",
    };
  }

  if (!hasSummary && sourceWordCount > 0) {
    return {
      label: "Build the summary first",
      reason:
        "A clear summary will make every later tool feel faster and easier to trust.",
      targetTab: "summary",
      badge: "Ground the source",
    };
  }

  if (hasSummary && flashcardsCount === 0) {
    return {
      label: "Create active recall cards",
      reason:
        "The source is summarized, so the next learning step is retrieval practice before another chat pass.",
      targetTab: "flashcards",
      badge: "Retrieval practice",
    };
  }

  if (flashcardsCount > reviewedFlashcardsCount) {
    return {
      label: `Review ${flashcardsCount - reviewedFlashcardsCount} cards`,
      reason:
        "Unreviewed flashcards are waiting, so close the recall loop before moving into harder checks.",
      targetTab: "flashcards",
      badge: `${flashcardsCount - reviewedFlashcardsCount} unreviewed`,
    };
  }

  if (reviewedFlashcardsCount > 0 && quizzesCount === 0) {
    return {
      label: "Run an exam check",
      reason:
        "You have completed recall practice, so pressure-test the source with applied questions.",
      targetTab: "quizzes",
      badge: "Knowledge check",
    };
  }

  if (quizzesCount > 0 && masteredFlashcardsCount < flashcardsCount) {
    return {
      label: "Repair weak spots",
      reason: `${quizQuestionCount || "Quiz"} checks can now point to the flashcards that still need work.`,
      targetTab: "gaps",
      badge: "Gap repair",
    };
  }

  if (sourceWordCount > 2200) {
    return {
      label: "Open the concept map",
      reason:
        "Dense material is easier to navigate once the structure is visible at a glance.",
      targetTab: "mindmap",
      badge: "Reduce scrolling",
    };
  }

  return {
    label: "Ask the source-linked coach",
    reason:
      "You already have enough structure here, so the fastest next step is targeted clarification.",
    targetTab: "chat",
    badge: "Stay in flow",
  };
}
