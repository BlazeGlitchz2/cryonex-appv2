export type ModelProvider = "auto" | "openrouter" | "bytez" | "puter" | "huggingface";

const PROVIDER_LABELS: Record<ModelProvider, string> = {
  auto: "Auto Select",
  openrouter: "OpenRouter",
  bytez: "Bytez",
  puter: "Puter",
  huggingface: "Hugging Face",
};

/**
 * Attempts to infer a provider from a stored model id.
 * Falls back to OpenRouter because that is the main supported provider.
 */
export function inferModelProvider(modelId?: string | null): ModelProvider {
  if (!modelId || modelId === "auto") return "auto";
  if (modelId.startsWith("puter/")) return "puter";
  if (modelId.startsWith("bytez/") || modelId.startsWith("bytez::")) return "bytez";
  if (modelId.startsWith("openai/") || modelId.startsWith("anthropic/") || modelId.startsWith("google/") || modelId.startsWith("x-ai/")) {
    return "openrouter";
  }
  return "openrouter";
}

export function formatModelName(modelId?: string | null): string {
  if (!modelId || modelId === "auto") return "Auto Select";
  const parts = modelId.split("/");
  const last = parts[parts.length - 1] || modelId;
  return last
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getModelDisplayMeta(modelId?: string | null, provider?: ModelProvider) {
  const resolvedProvider = provider ?? inferModelProvider(modelId);
  return {
    name: formatModelName(modelId),
    providerLabel: PROVIDER_LABELS[resolvedProvider],
    provider: resolvedProvider,
  };
}

export function isOpenRouterProvider(provider?: ModelProvider, modelId?: string | null) {
  const resolved = provider ?? inferModelProvider(modelId);
  return resolved === "openrouter";
}

export function isBytezProvider(provider?: ModelProvider, modelId?: string | null) {
  const resolved = provider ?? inferModelProvider(modelId);
  return resolved === "bytez";
}


