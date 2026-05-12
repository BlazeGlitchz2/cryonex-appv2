export type StudyWorkspaceSummaryContent =
  | string
  | {
      simple?: unknown;
      detailed?: unknown;
      short?: unknown;
    }
  | null
  | undefined;

function usableText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim() ? value : "";
}

export function resolveStudyWorkspaceSummaryContent(
  summary: StudyWorkspaceSummaryContent,
  simpleMode: boolean,
) {
  if (typeof summary === "string") {
    return usableText(summary);
  }

  if (!summary) {
    return "";
  }

  const preferredOrder = simpleMode
    ? [summary.simple, summary.detailed, summary.short]
    : [summary.detailed, summary.simple, summary.short];

  return preferredOrder.map(usableText).find(Boolean) || "";
}
