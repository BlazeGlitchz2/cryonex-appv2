export type ModelProvider = "auto" | "bytez";

export const PROVIDER_LABELS: Record<ModelProvider, string> = {
  auto: "Auto Select",
  bytez: "Bytez",
};

export interface Model {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  contextWindow?: number;
  tags?: string[];
}

export const BYTEZ_MODELS: Model[] = [
  // Open Source
  { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B", provider: "bytez", description: "Powerful open model by Alibaba", tags: ["open-source", "smart"] },
  { id: "Qwen/Qwen2.5-Coder-32B-Instruct", name: "Qwen 2.5 Coder 32B", provider: "bytez", description: "Specialized for coding tasks", tags: ["coding", "open-source"] },
  { id: "deepseek-ai/DeepSeek-V3", name: "DeepSeek V3", provider: "bytez", description: "Strong reasoning capabilities", tags: ["open-source", "reasoning"] },
  { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", provider: "bytez", description: "Latest reasoning model", tags: ["open-source", "reasoning"] },
  { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B", provider: "bytez", description: "Meta's latest large model", tags: ["open-source", "chat"] },
  { id: "mistralai/Mistral-Large-Instruct-2411", name: "Mistral Large", provider: "bytez", description: "High performance European model", tags: ["open-source", "chat"] },
  { id: "google/gemma-2-27b-it", name: "Gemma 2 27B", provider: "bytez", description: "Google's open model", tags: ["open-source", "chat"] },
  
  // Closed Source (via Bytez)
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "bytez", description: "OpenAI's flagship model", tags: ["closed-source", "smart"] },
  { id: "anthropic/claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", provider: "bytez", description: "Anthropic's latest model", tags: ["closed-source", "smart"] },
];

/**
 * Attempts to infer a provider from a stored model id.
 */
export function inferModelProvider(modelId?: string | null): ModelProvider {
  if (!modelId || modelId === "auto") return "auto";
  return "bytez";
}

export function formatModelName(modelId?: string | null): string {
  if (!modelId || modelId === "auto") return "Auto Select";
  const model = BYTEZ_MODELS.find(m => m.id === modelId);
  return model ? model.name : modelId;
}

export function getModelDisplayMeta(modelId?: string | null, provider?: ModelProvider) {
  const p = provider || inferModelProvider(modelId);
  return {
    name: formatModelName(modelId),
    providerLabel: PROVIDER_LABELS[p] || "Auto",
    provider: p,
  };
}