export type ModelProvider = "auto";

const PROVIDER_LABELS: Record<ModelProvider, string> = {
  auto: "Auto Select",
};

/**
 * Attempts to infer a provider from a stored model id.
 */
export function inferModelProvider(modelId?: string | null): ModelProvider {
  return "auto";
}

export function formatModelName(modelId?: string | null): string {
  if (!modelId || modelId === "auto") return "Auto Select";
  return modelId;
}

export function getModelDisplayMeta(modelId?: string | null, provider?: ModelProvider) {
  return {
    name: formatModelName(modelId),
    providerLabel: "Auto",
    provider: "auto",
  };
}