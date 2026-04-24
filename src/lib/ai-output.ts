const REASONING_BLOCK_TAGS = [
  "think",
  "thinking",
  "reasoning",
  "analysis",
  "chain_of_thought",
  "scratchpad",
  "internal_monologue",
  "tool_call",
];

const REASONING_LABEL_RE =
  /(^|\n)\s*(?:#{1,6}\s*)?(?:private\s+)?(?:reasoning|thinking|chain[-\s]?of[-\s]?thought|scratchpad|analysis)\s*:?\s*([\s\S]*?)(?=\n\s*(?:#{1,6}\s*)?(?:final(?:\s+answer)?|answer|response)\s*:|\n\s*#{1,6}\s+|\n{2,}|$)/gi;

export function stripReasoningBlocks(value: string | null | undefined) {
  let output = String(value || "");

  for (const tag of REASONING_BLOCK_TAGS) {
    const complete = new RegExp(
      `<${tag}(?:\\s+[^>]*)?>[\\s\\S]*?<\\/${tag}>`,
      "gi",
    );
    const open = new RegExp(`<${tag}(?:\\s+[^>]*)?>[\\s\\S]*$`, "gi");
    output = output.replace(complete, "").replace(open, "");
  }

  return output
    .replace(REASONING_LABEL_RE, "\n")
    .replace(/<\/?final_answer(?:\s+[^>]*)?>/gi, "")
    .replace(/^\s*(?:final(?:\s+answer)?|answer|response)\s*:?\s*/i, "")
    .trim();
}

export function sanitizeAiOutput(value: string | null | undefined) {
  return stripReasoningBlocks(value)
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

export function buildAiReceipt({
  sourceTitle,
  sourceType = "User-provided material",
  provider,
  model,
  timestamp = Date.now(),
}: {
  sourceTitle: string;
  sourceType?: string;
  provider?: string;
  model?: string;
  timestamp?: number;
}) {
  const generatedAt = new Date(timestamp).toLocaleString("en", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return [
    "## Receipt",
    `- Source: ${sourceTitle || "Untitled source"}`,
    `- Source type: ${sourceType}`,
    `- Model route: ${[provider, model].filter(Boolean).join(" / ") || "Cryonex auto route"}`,
    `- Generated: ${generatedAt}`,
    "- Provenance: Built from the material in this node. Verify details against the original source before submitting schoolwork.",
  ].join("\n");
}
