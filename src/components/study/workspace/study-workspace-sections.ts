export type StudyWorkspaceSectionId =
  | "overview"
  | "key-ideas"
  | "notes"
  | "study-tools"
  | "evidence";

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
