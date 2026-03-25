import {
  IGCSE_DEMAND_SIGNALS,
  getIgcseTrack,
  getTopicLookup,
} from "@/lib/igcse/catalog";
import type { IgcsePlanDraft } from "@/lib/igcse/types";

export function buildIgcseMaterialTitle(plan: IgcsePlanDraft) {
  return (
    plan.title.trim() ||
    `${plan.boardLabel} ${plan.subjectLabel} mixed-source study pack`
  );
}

export function buildIgcseMaterialTags(plan: IgcsePlanDraft) {
  return Array.from(
    new Set(
      [
        "igcse",
        plan.boardId,
        plan.subjectId,
        ...plan.selectedTopicIds,
        ...plan.weakTopicIds,
      ].filter(Boolean),
    ),
  );
}

export function buildIgcseStudyBrief(plan: IgcsePlanDraft) {
  const track = getIgcseTrack(plan.boardId, plan.subjectId);
  const topicLookup = getTopicLookup(track);
  const topicTitles =
    plan.selectedTopicIds.length > 0
      ? plan.selectedTopicIds.map(
          (topicId) => topicLookup.get(topicId)?.title || topicId,
        )
      : track.topics.slice(0, 3).map((topic) => topic.title);

  const weakTopicTitles =
    plan.weakTopicIds.length > 0
      ? plan.weakTopicIds.map(
          (topicId) => topicLookup.get(topicId)?.title || topicId,
        )
      : [];

  const bookLines = plan.selectedBooks.map((book) => {
    const startPage = Math.max(1, Math.min(book.startPage, book.pageCount));
    const endPage = Math.max(startPage, Math.min(book.endPage, book.pageCount));
    const linkedTopics =
      book.topicIds
        .map((topicId) => topicLookup.get(topicId)?.title)
        .filter(Boolean)
        .join(", ") || "Mixed topics";

    return [
      `- ${book.title} (${book.publisher}, ${book.edition})`,
      `  Pages: ${startPage}-${endPage} of ${book.pageCount}`,
      `  Linked topics: ${linkedTopics}`,
      `  Summary focus: ${book.summaryFocus}`,
    ].join("\n");
  });

  const paperLines = plan.selectedPastPapers.map((paper) => {
    const linkedTopics =
      paper.topicIds
        .map((topicId) => topicLookup.get(topicId)?.title)
        .filter(Boolean)
        .join(", ") || "Mixed topics";

    return [
      `- ${paper.title} (${paper.paperCode}, ${paper.sessionLabel})`,
      `  Component: ${paper.component} | Duration: ${paper.duration}`,
      `  Linked topics: ${linkedTopics}`,
      `  Question focus: ${paper.questionFocus.join(", ")}`,
      `  Mark scheme focus: ${paper.markSchemeFocus}`,
    ].join("\n");
  });

  const outcomeLines =
    plan.targetOutcomes.length > 0
      ? plan.targetOutcomes.map((outcome) => `- ${outcome}`)
      : ["- one-page summary", "- flashcards", "- topical practice plan"];

  const signalLines = IGCSE_DEMAND_SIGNALS.map(
    (signal) => `- ${signal.title}: ${signal.detail}`,
  );

  return [
    `Title: ${buildIgcseMaterialTitle(plan)}`,
    `Exam board: ${plan.boardLabel}`,
    `Subject: ${plan.subjectLabel}`,
    `Focus topic: ${plan.focusTopic || "Use the selected topics to drive the pack."}`,
    `Selected topics: ${topicTitles.join(", ")}`,
    `Weak topics to revisit: ${weakTopicTitles.length ? weakTopicTitles.join(", ") : "None explicitly tagged yet."}`,
    `Study templates: ${plan.selectedTemplateTitles.length ? plan.selectedTemplateTitles.join(", ") : "Mixed-source pack"}`,
    `Estimated study time: ${plan.totalEstimatedMinutes} minutes`,
    "",
    "Why this pack should feel like a strong IGCSE workflow:",
    ...signalLines,
    "",
    "Selected books and page windows:",
    ...(bookLines.length > 0
      ? bookLines
      : ["- No textbook selected yet. Build the pack around past papers and board-specific recall."]),
    "",
    "Selected past papers:",
    ...(paperLines.length > 0
      ? paperLines
      : ["- No past paper selected yet. Add board-specific practice and mark-scheme advice."]),
    "",
    "Target outcomes:",
    ...outcomeLines,
    "",
    "Student notes and pack direction:",
    plan.notes.trim()
      ? plan.notes.trim()
      : "Keep the pack concise, board-aware, and revision-first rather than textbook-heavy.",
    "",
    "Output instructions:",
    "- Build a short board-specific summary first.",
    "- Follow it with flashcards that test understanding, not just memorisation.",
    "- Add a paper strategy section that tells the student how to use the selected past papers.",
    "- Call out common mark-scheme traps and weak-topic misconceptions.",
    "- End with a 30 to 60 minute revision run that mixes summary, recall, and practice.",
  ].join("\n");
}
