export type StudyWorkspaceTabId =
  | "summary"
  | "chat"
  | "flashcards"
  | "quizzes"
  | "notes"
  | "mindmap"
  | "gaps"
  | "diagrams";

type WorkspaceRecommendationAction = {
  action?: string | null;
  description?: string | null;
  title?: string | null;
};

type WorkspaceOSState = {
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
