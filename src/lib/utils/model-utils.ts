export type ModelProvider = "auto" | "bytez";

const PROVIDER_LABELS: Record<ModelProvider, string> = {
  auto: "Auto Select",
  bytez: "Bytez",
};

export interface Model {
  id: string;
  name: string;
  provider: ModelProvider;
  description?: string;
  contextWindow?: number;
  maxOutput?: number;
  tags?: string[];
}

export const BYTEZ_MODELS: Model[] = [
  {
    id: "Qwen/Qwen2.5-72B-Instruct",
    name: "Qwen 2.5 72B",
    provider: "bytez",
    description: "High performance open model by Alibaba Cloud",
    tags: ["smart", "coding", "chat"],
  },
  {
    id: "deepseek-ai/DeepSeek-V3",
    name: "DeepSeek V3",
    provider: "bytez",
    description: "Advanced open model with strong reasoning capabilities",
    tags: ["reasoning", "coding", "math"],
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B",
    provider: "bytez",
    description: "Latest large language model from Meta",
    tags: ["chat", "general", "fast"],
  },
  {
    id: "mistralai/Mistral-Large-Instruct-2411",
    name: "Mistral Large",
    provider: "bytez",
    description: "Flagship model from Mistral AI",
    tags: ["smart", "multilingual"],
  },
  {
    id: "google/gemma-2-27b-it",
    name: "Gemma 2 27B",
    provider: "bytez",
    description: "Efficient and capable model by Google",
    tags: ["fast", "efficient"],
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "bytez",
    description: "OpenAI's flagship multimodal model",
    tags: ["smart", "vision", "premium"],
  },
  {
    id: "anthropic/claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "bytez",
    description: "Anthropic's most intelligent model",
    tags: ["smart", "coding", "writing", "premium"],
  },
];

/**
 * Attempts to infer a provider from a stored model id.
 */
export function inferModelProvider(modelId?: string | null): ModelProvider {
  if (!modelId) return "auto";
  return "bytez";
}

export function formatModelName(modelId?: string | null): string {
  if (!modelId || modelId === "auto") return "Auto Select";
  const model = BYTEZ_MODELS.find((m) => m.id === modelId);
  return model ? model.name : modelId.split("/").pop() || modelId;
}

export function getModelDisplayMeta(modelId?: string | null, provider?: ModelProvider) {
  const model = BYTEZ_MODELS.find((m) => m.id === modelId);
  return {
    name: model ? model.name : formatModelName(modelId),
    providerLabel: "Bytez",
    provider: "bytez",
  };
}