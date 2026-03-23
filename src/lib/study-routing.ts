export type StudyPrimaryIntent =
  | "summary"
  | "flashcards"
  | "quizzes"
  | "notes"
  | "chat";

export type StudyIntensity = "light" | "balanced" | "intense";

export type StudyRouteStatus = "processing" | "complete" | "error";

export interface StudyRouteCardPayload {
  version: 1;
  jobId: string;
  status: StudyRouteStatus;
  fileName: string;
  request: string;
  primaryIntent: StudyPrimaryIntent;
  intensity: StudyIntensity;
  intentLabel: string;
  summary: string;
  dashboardUrl?: string;
  workspaceUrl?: string;
  topic?: string;
}

export interface StudyIntentProfile {
  isStudyRelated: boolean;
  shouldRoutePdf: boolean;
  hasPdf: boolean;
  primaryIntent: StudyPrimaryIntent;
  intensity: StudyIntensity;
  preferredTab: "summary" | "flashcards" | "quizzes" | "notes" | "chat";
  intentLabel: string;
  summary: string;
  topic?: string;
  matchedKeywords: string[];
}

interface FileLikeAttachment {
  name?: string;
  type?: string;
}

const STUDY_KEYWORDS = [
  "study",
  "summarize",
  "summary",
  "train me",
  "flashcard",
  "flash card",
  "quiz",
  "test me",
  "exam",
  "revise",
  "revision",
  "memorize",
  "learn",
  "teach me",
  "lesson",
  "lecture",
  "homework",
  "notes",
  "study guide",
  "practice",
  "worksheet",
  "pdf",
];

const TOPIC_PATTERNS = [
  /(?:about|on|for)\s+([a-z0-9][a-z0-9\s/&+-]{2,40})/i,
  /(?:study|learn|revise|review)\s+([a-z0-9][a-z0-9\s/&+-]{2,40})/i,
];

function cleanText(text: string) {
  return text.replace(/^\[(Search|Think|Canvas)\]\s*/i, "").trim();
}

function hasPdfAttachment(files?: FileLikeAttachment[]) {
  return (files || []).some((file) => {
    const lowerName = String(file.name || "").toLowerCase();
    const lowerType = String(file.type || "").toLowerCase();
    return lowerType === "application/pdf" || lowerName.endsWith(".pdf");
  });
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function inferTopic(text: string) {
  for (const pattern of TOPIC_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1]
        .replace(/\b(this|that|the|my|a|an|pdf)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    }
  }
  return undefined;
}

function inferPrimaryIntent(text: string): StudyPrimaryIntent {
  const lower = text.toLowerCase();

  if (
    lower.includes("quiz") ||
    lower.includes("test me") ||
    lower.includes("exam") ||
    lower.includes("drill me") ||
    lower.includes("practice me")
  ) {
    return "quizzes";
  }

  if (
    lower.includes("flashcard") ||
    lower.includes("flash card") ||
    lower.includes("memorize")
  ) {
    return "flashcards";
  }

  if (
    lower.includes("notes") ||
    lower.includes("study guide") ||
    lower.includes("outline")
  ) {
    return "notes";
  }

  if (
    lower.includes("summarize") ||
    lower.includes("summary") ||
    lower.includes("explain") ||
    lower.includes("overview")
  ) {
    return "summary";
  }

  return "chat";
}

function inferIntensity(text: string): StudyIntensity {
  const lower = text.toLowerCase();
  if (
    lower.includes("heavily") ||
    lower.includes("intense") ||
    lower.includes("hardcore") ||
    lower.includes("drill") ||
    lower.includes("aggressive") ||
    lower.includes("exam mode")
  ) {
    return "intense";
  }

  if (
    lower.includes("quick") ||
    lower.includes("brief") ||
    lower.includes("fast") ||
    lower.includes("short")
  ) {
    return "light";
  }

  return "balanced";
}

function buildIntentLabel(
  primaryIntent: StudyPrimaryIntent,
  intensity: StudyIntensity,
) {
  if (primaryIntent === "summary") return "Summary lane";
  if (primaryIntent === "flashcards") {
    return intensity === "intense" ? "Heavy memorization mode" : "Flashcard lane";
  }
  if (primaryIntent === "quizzes") {
    return intensity === "intense" ? "Heavy training mode" : "Quiz lane";
  }
  if (primaryIntent === "notes") return "Study guide lane";
  return intensity === "intense" ? "Deep coaching mode" : "Guided study lane";
}

function buildSummary(
  primaryIntent: StudyPrimaryIntent,
  intensity: StudyIntensity,
) {
  if (primaryIntent === "summary") {
    return "Summary, notes, flashcards, and quizzes are prepared around the document.";
  }
  if (primaryIntent === "flashcards") {
    return intensity === "intense"
      ? "Flashcards and reinforcement assets are tuned for repeated recall."
      : "Flashcards and review assets are ready from the document.";
  }
  if (primaryIntent === "quizzes") {
    return intensity === "intense"
      ? "The workspace is tuned for drills, recall pressure, and practice rounds."
      : "Practice questions and review assets are ready from the document.";
  }
  if (primaryIntent === "notes") {
    return "Notes, structure, and follow-up review assets are ready from the document.";
  }
  return "The document is routed into a grounded study workspace with prepared assets.";
}

function mapIntentToTab(
  primaryIntent: StudyPrimaryIntent,
): StudyIntentProfile["preferredTab"] {
  if (primaryIntent === "summary") return "summary";
  if (primaryIntent === "flashcards") return "flashcards";
  if (primaryIntent === "quizzes") return "quizzes";
  if (primaryIntent === "notes") return "notes";
  return "chat";
}

export function parseStudyIntent(
  rawText: string,
  files?: FileLikeAttachment[],
): StudyIntentProfile {
  const text = cleanText(rawText);
  const lower = text.toLowerCase();
  const matchedKeywords = unique(
    STUDY_KEYWORDS.filter((keyword) => lower.includes(keyword)),
  );
  const hasPdf = hasPdfAttachment(files);
  const isStudyRelated = hasPdf || matchedKeywords.length > 0;
  const primaryIntent = inferPrimaryIntent(text);
  const intensity = inferIntensity(text);
  const preferredTab = mapIntentToTab(primaryIntent);
  const intentLabel = buildIntentLabel(primaryIntent, intensity);
  const summary = buildSummary(primaryIntent, intensity);

  return {
    isStudyRelated,
    shouldRoutePdf: hasPdf && isStudyRelated,
    hasPdf,
    primaryIntent,
    intensity,
    preferredTab,
    intentLabel,
    summary,
    topic: inferTopic(text),
    matchedKeywords,
  };
}

export function buildStudyWorkspaceUrl(
  docId: string,
  intent: Pick<StudyIntentProfile, "preferredTab">,
) {
  return `/study/workspace/${docId}?tab=${intent.preferredTab}`;
}

export function serializeStudyRouteCard(payload: StudyRouteCardPayload) {
  return `<study-route>${JSON.stringify(payload)}</study-route>`;
}

export function extractStudyRouteCards(content: string) {
  const cards: StudyRouteCardPayload[] = [];
  const cleanedContent = content.replace(
    /<study-route>([\s\S]*?)<\/study-route>/gi,
    (_fullMatch, rawPayload) => {
      try {
        const parsed = JSON.parse(rawPayload) as StudyRouteCardPayload;
        if (parsed?.version === 1) {
          cards.push(parsed);
        }
      } catch (error) {
        console.warn("Failed to parse study route card", error);
      }

      return "";
    },
  );

  return {
    cards,
    content: cleanedContent.trim(),
  };
}
