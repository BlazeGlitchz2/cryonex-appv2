export type StudyWorkspaceSectionId =
  | "overview"
  | "key-ideas"
  | "notes"
  | "study-tools"
  | "evidence";

export type StudyWorkspaceLearningTabId =
  | "summary"
  | "chat"
  | "flashcards"
  | "quizzes"
  | "notes"
  | "mindmap"
  | "gaps"
  | "diagrams";

export type StudyWorkspaceMissionStepStatus =
  | "done"
  | "current"
  | "locked";

export interface StudyWorkspaceMissionStep {
  id: "understand" | "example" | "recall" | "exam-check";
  title: string;
  description: string;
  status: StudyWorkspaceMissionStepStatus;
  targetTab: StudyWorkspaceLearningTabId;
  actionLabel: string;
}

export interface StudyWorkspaceLearningExample {
  title: string;
  situation: string;
  learnerAction: string;
  sourceCue: string;
}

export interface StudyWorkspaceRecallPrompt {
  label: string;
  prompt: string;
  targetTab: StudyWorkspaceLearningTabId;
}

export interface StudyWorkspaceExamCheck {
  label: string;
  question: string;
  targetTab: StudyWorkspaceLearningTabId;
}

export interface StudyWorkspaceWeakSpot {
  label: string;
  detail: string;
  targetTab: StudyWorkspaceLearningTabId;
}

export interface StudyWorkspaceSourceEvidence {
  id: string;
  sectionTitle: string;
  snippet: string;
}

export interface StudyWorkspacePrimaryAction {
  label: string;
  helper: string;
  targetTab: StudyWorkspaceLearningTabId;
}

export interface StudyWorkspaceLearningPlan {
  readinessScore: number;
  missionSteps: StudyWorkspaceMissionStep[];
  realLifeExamples: StudyWorkspaceLearningExample[];
  recallPrompts: StudyWorkspaceRecallPrompt[];
  examChecks: StudyWorkspaceExamCheck[];
  weakSpots: StudyWorkspaceWeakSpot[];
  sourceEvidence: StudyWorkspaceSourceEvidence[];
  coachPrompts: string[];
  primaryAction: StudyWorkspacePrimaryAction;
}

export interface BuildStudyWorkspaceLearningPlanOptions {
  title: string;
  summary: string;
  transcriptText: string;
  flashcardCount: number;
  reviewedFlashcardCount: number;
  masteredFlashcardCount: number;
  quizCount: number;
  quizQuestionCount: number;
  sourceSections?: Array<{
    id?: string;
    title?: string;
    text?: string;
  }>;
}

export type StudyWorkspaceSectionItemStatus =
  | "available"
  | "unavailable"
  | "loading";

export interface StudyWorkspaceSectionItem {
  label: string;
  value: string;
  status: StudyWorkspaceSectionItemStatus;
}

export interface StudyWorkspaceSection {
  id: StudyWorkspaceSectionId;
  title: string;
  description: string;
  content: string;
  items: StudyWorkspaceSectionItem[];
}

export interface BuildStudyWorkspaceSectionsOptions {
  title: string;
  summary: string;
  transcriptText: string;
  flashcardCount: number;
  quizCount: number;
}

function getKeyIdeas(summary: string) {
  return summary
    .split(/\n+/)
    .map((line) => line.replace(/^[-*#\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 3);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cleanSnippet(text: string, maxLength = 180) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
}

function includesAny(text: string, needles: string[]) {
  const normalized = text.toLowerCase();
  return needles.some((needle) => normalized.includes(needle));
}

function getPrimaryIdea(title: string, summary: string) {
  const [firstIdea] = getKeyIdeas(summary);
  return firstIdea || title || "this concept";
}

function getPrimaryAction({
  hasSummary,
  flashcardCount,
  reviewedFlashcardCount,
  masteredFlashcardCount,
  quizCount,
  quizQuestionCount,
}: {
  hasSummary: boolean;
  flashcardCount: number;
  reviewedFlashcardCount: number;
  masteredFlashcardCount: number;
  quizCount: number;
  quizQuestionCount: number;
}): StudyWorkspacePrimaryAction {
  if (!hasSummary) {
    return {
      label: "Build the source summary",
      helper: "Start with a grounded reading pass.",
      targetTab: "summary",
    };
  }

  if (flashcardCount === 0) {
    return {
      label: "Create active recall cards",
      helper: "Turn the main ideas into retrieval practice.",
      targetTab: "flashcards",
    };
  }

  if (reviewedFlashcardCount < flashcardCount) {
    return {
      label: `Review ${flashcardCount - reviewedFlashcardCount} cards`,
      helper: "Close the recall loop before testing.",
      targetTab: "flashcards",
    };
  }

  if (quizCount === 0) {
    return {
      label: "Run an exam check",
      helper: "Pressure-test the source with questions.",
      targetTab: "quizzes",
    };
  }

  if (masteredFlashcardCount < flashcardCount) {
    return {
      label: "Repair weak spots",
      helper: `${quizQuestionCount || "Quiz"} checks can now point to gaps.`,
      targetTab: "gaps",
    };
  }

  return {
    label: "Ask for a final oral check",
    helper: "Explain the topic back to the coach.",
    targetTab: "chat",
  };
}

export function buildStudyWorkspaceLearningPlan({
  title,
  summary,
  transcriptText,
  flashcardCount,
  reviewedFlashcardCount,
  masteredFlashcardCount,
  quizCount,
  quizQuestionCount,
  sourceSections = [],
}: BuildStudyWorkspaceLearningPlanOptions): StudyWorkspaceLearningPlan {
  const hasSummary = Boolean(summary.trim());
  const combinedText = `${title}\n${summary}\n${transcriptText}`;
  const primaryIdea = getPrimaryIdea(title, summary);
  const mentionsMembrane = includesAny(combinedText, [
    "membrane",
    "osmosis",
    "diffusion",
    "transport",
  ]);
  const mentionsDehydration = includesAny(combinedText, [
    "dehydration",
    "water",
    "osmosis",
  ]);
  const mentionsMitochondria = includesAny(combinedText, [
    "mitochondria",
    "mitochondrion",
    "atp",
  ]);
  const recallDone =
    flashcardCount > 0 && reviewedFlashcardCount >= flashcardCount;
  const readinessScore = Math.round(
    ((hasSummary ? 1 : 0) +
      (flashcardCount > 0 ? 1 : 0) +
      (quizCount > 0 ? 1 : 0) +
      (flashcardCount > 0
        ? clamp(reviewedFlashcardCount / flashcardCount, 0, 1)
        : 0)) *
      25,
  );

  const realLifeExamples: StudyWorkspaceLearningExample[] = [
    mentionsMembrane
      ? {
          title: "Airport security for the cell membrane",
          situation: mentionsDehydration
            ? "During dehydration, a cell has to manage water movement instead of letting everything pass freely."
            : "A cell membrane works like a security checkpoint that allows useful materials in and keeps risky movement controlled.",
          learnerAction:
            "Name what gets allowed through, what needs a channel, and what should stay out.",
          sourceCue:
            cleanSnippet(transcriptText || summary, 150) ||
            "Source mentions membrane control and selective movement.",
        }
      : {
          title: `Everyday anchor for ${title || "this source"}`,
          situation:
            "Connect the abstract idea to a daily decision, object, or process you already understand.",
          learnerAction:
            "Write one sentence that starts with 'This works like...' and then test where the analogy breaks.",
          sourceCue: cleanSnippet(transcriptText || summary, 150),
        },
  ];

  const recallPrompts: StudyWorkspaceRecallPrompt[] = [
    {
      label: "Blank-page recall",
      prompt: `Without looking, explain ${primaryIdea.toLowerCase()} in three bullets and include one source detail.`,
      targetTab: "notes",
    },
    {
      label: "Teach-back",
      prompt: `Teach ${title || "this topic"} to a friend in 60 seconds, then ask what part still sounds vague.`,
      targetTab: "chat",
    },
  ];

  const examChecks: StudyWorkspaceExamCheck[] = [
    {
      label: "Applied question",
      question: mentionsDehydration
        ? "A student experiences dehydration after exercise. Explain what happens to water movement across the cell membrane and why selective permeability matters."
        : `Explain one real-life situation where ${primaryIdea.toLowerCase()} changes the outcome, then justify it using the source.`,
      targetTab: "quizzes",
    },
  ];

  const weakSpots: StudyWorkspaceWeakSpot[] = [
    ...(mentionsMitochondria
      ? [
          {
            label: "Mitochondria misconception",
            detail:
              "Do not stop at 'powerhouse'. Link ATP production to glucose, oxygen, and the cell's energy demand.",
            targetTab: "gaps" as const,
          },
        ]
      : []),
    ...(flashcardCount > 0 && masteredFlashcardCount < flashcardCount
      ? [
          {
            label: "Recall not mastered yet",
            detail: `${masteredFlashcardCount}/${flashcardCount} cards are mastered. Revisit the missed prompts before the next quiz.`,
            targetTab: "flashcards" as const,
          },
        ]
      : []),
  ];

  const sourceEvidence =
    sourceSections
      .filter((section) => section.title || section.text)
      .slice(0, 4)
      .map((section, index) => ({
        id: section.id || `source-${index}`,
        sectionTitle: section.title || `Source section ${index + 1}`,
        snippet:
          cleanSnippet(section.text || "", 180) ||
          "Open the source section to connect this step back to the original material.",
      })) ||
    [];

  const fallbackEvidence: StudyWorkspaceSourceEvidence[] = transcriptText.trim()
    ? [
        {
          id: "source",
          sectionTitle: title || "Source",
          snippet: cleanSnippet(transcriptText, 180),
        },
      ]
    : [];

  return {
    readinessScore,
    missionSteps: [
      {
        id: "understand",
        title: "Understand",
        description: "Read the grounded summary and mark what the source is actually saying.",
        status: hasSummary ? "done" : "current",
        targetTab: "summary",
        actionLabel: hasSummary ? "Review summary" : "Build summary",
      },
      {
        id: "example",
        title: "Example",
        description: "Attach the concept to a real-life situation before memorizing it.",
        status: hasSummary
          ? flashcardCount > 0 || reviewedFlashcardCount > 0
            ? "done"
            : "current"
          : "locked",
        targetTab: "summary",
        actionLabel: "Use example",
      },
      {
        id: "recall",
        title: "Recall",
        description: "Close the book and retrieve the idea from memory.",
        status: recallDone
          ? "done"
          : flashcardCount > 0 || hasSummary
            ? "current"
            : "locked",
        targetTab: "flashcards",
        actionLabel: flashcardCount > 0 ? "Review cards" : "Create cards",
      },
      {
        id: "exam-check",
        title: "Exam check",
        description: "Answer one applied question and repair the weak spot.",
        status: quizCount > 0
          ? "current"
          : reviewedFlashcardCount > 0
            ? "current"
            : "locked",
        targetTab: "quizzes",
        actionLabel: quizCount > 0 ? "Practice quiz" : "Create quiz",
      },
    ],
    realLifeExamples,
    recallPrompts,
    examChecks,
    weakSpots,
    sourceEvidence: sourceEvidence.length > 0 ? sourceEvidence : fallbackEvidence,
    coachPrompts: [
      `Ask me one question that tests whether I understand ${primaryIdea.toLowerCase()}.`,
      `Give me a real-life example for ${title || "this source"} and then challenge my explanation.`,
      `Turn my weakest point into a two-minute quiz.`,
    ],
    primaryAction: getPrimaryAction({
      hasSummary,
      flashcardCount,
      reviewedFlashcardCount,
      masteredFlashcardCount,
      quizCount,
      quizQuestionCount,
    }),
  };
}

export function buildStudyWorkspaceSections({
  title,
  summary,
  transcriptText,
  flashcardCount,
  quizCount,
}: BuildStudyWorkspaceSectionsOptions): StudyWorkspaceSection[] {
  const keyIdeas = getKeyIdeas(summary);
  const transcriptPreview = transcriptText.trim()
    ? transcriptText.trim().slice(0, 220)
    : "Source grounding snippets will appear here once content is available.";

  return [
    {
      id: "overview",
      title: "Overview",
      description: "A quick brief before you dive deeper.",
      content: summary.trim() || "Your AI summary will appear here as soon as it is ready.",
      items: [
        {
          label: "Document",
          value: title,
          status: "available",
        },
      ],
    },
    {
      id: "key-ideas",
      title: "Key Ideas",
      description: "The concepts worth holding onto.",
      content:
        keyIdeas.join("\n") ||
        "Key ideas will be extracted here when the notebook has enough material.",
      items: keyIdeas.map((idea) => ({
        label: "Concept",
        value: idea,
        status: "available",
      })),
    },
    {
      id: "notes",
      title: "Notes",
      description: "A space to keep the study thread in your own words.",
      content:
        summary.trim() ||
        "Start writing or pin an AI answer here to begin your notebook.",
      items: [
        {
          label: "Mode",
          value: "Notebook-first",
          status: "available",
        },
      ],
    },
    {
      id: "study-tools",
      title: "Study Tools",
      description: "Power tools, kept nearby rather than in the way.",
      content:
        "Use the quick actions to open flashcards, quizzes, concept maps, or gap analysis without leaving the notebook.",
      items: [
        {
          label: "Flashcards",
          value:
            flashcardCount > 0 ? `${flashcardCount} ready` : "Not generated yet",
          status: flashcardCount > 0 ? "available" : "unavailable",
        },
        {
          label: "Quizzes",
          value: quizCount > 0 ? `${quizCount} ready` : "Not generated yet",
          status: quizCount > 0 ? "available" : "unavailable",
        },
        {
          label: "Concept map",
          value: "Open on demand",
          status: "available",
        },
        {
          label: "Knowledge gaps",
          value: "Review progress",
          status: "available",
        },
      ],
    },
    {
      id: "evidence",
      title: "Evidence",
      description: "Grounded source context to keep AI answers honest.",
      content: transcriptPreview,
      items: [
        {
          label: "Source",
          value: transcriptText.trim() ? "Connected" : "Waiting for source text",
          status: transcriptText.trim() ? "available" : "loading",
        },
      ],
    },
  ];
}
