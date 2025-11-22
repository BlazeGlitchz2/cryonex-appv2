import { create } from "zustand";

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  description: string;
  isImage?: boolean;
  isVideo?: boolean;
  tags?: string[];
}

export const AVAILABLE_MODELS: Model[] = [
  // OpenAI
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextWindow: 128000,
    description: "Most capable GPT-4 model for complex tasks",
    tags: ["Complex Tasks", "Reasoning"],
  },
  {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    contextWindow: 16385,
    description: "Fast and cost-effective model for everyday tasks",
    tags: ["Fast", "Everyday"],
  },
  // Anthropic
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Most powerful Claude model for highly complex tasks",
    tags: ["Reasoning", "Coding"],
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Balanced model for enterprise workloads",
    tags: ["Balanced", "Enterprise"],
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Fastest and most compact model for near-instant responsiveness",
    tags: ["Fast", "Compact"],
  },
  // Google
  {
    id: "google/gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    contextWindow: 32000,
    description: "Google's capable multimodal model",
    tags: ["Multimodal", "Google"],
  },
  // Meta
  {
    id: "meta-llama/llama-3-70b-instruct",
    name: "Llama 3 70B",
    provider: "Meta",
    contextWindow: 8192,
    description: "Most capable open model from Meta",
    tags: ["Open Source", "Meta"],
  },
  // Mistral
  {
    id: "mistralai/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B",
    provider: "Mistral",
    contextWindow: 32000,
    description: "High-performance open mixture-of-experts model",
    tags: ["Open Source", "Mistral"],
  },
  // Open Source / Free
  {
    id: "google/gemma-7b-it",
    name: "Gemma 7B",
    provider: "Google",
    contextWindow: 8192,
    description: "Lightweight open model from Google",
    tags: ["Open Source", "Lightweight"],
  },
  {
    id: "microsoft/phi-3-medium-128k-instruct",
    name: "Phi-3 Medium",
    provider: "Microsoft",
    contextWindow: 128000,
    description: "High reasoning capability in a small package",
    tags: ["Open Source", "Reasoning"],
  },
];

export const IMAGE_MODELS: Model[] = [
  {
    id: "stabilityai/stable-diffusion-xl-base-1.0",
    name: "Stable Diffusion XL",
    provider: "Stability AI",
    contextWindow: 0,
    description: "High-quality image generation",
    isImage: true,
  },
];

export const VIDEO_MODELS: Model[] = [
  {
    id: "stabilityai/stable-video-diffusion",
    name: "Stable Video Diffusion",
    provider: "Stability AI",
    contextWindow: 0,
    description: "Image-to-video generation",
    isVideo: true,
  },
];

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Mistral" | "Other";

export const inferModelProvider = (modelId: string): ModelProvider => {
  if (modelId.startsWith("openai/") || modelId.startsWith("gpt-")) return "OpenAI";
  if (modelId.startsWith("anthropic/") || modelId.startsWith("claude-")) return "Anthropic";
  if (modelId.startsWith("google/") || modelId.startsWith("gemini-")) return "Google";
  if (modelId.startsWith("meta-llama/") || modelId.includes("llama")) return "Meta";
  if (modelId.startsWith("mistralai/") || modelId.includes("mistral") || modelId.includes("mixtral")) return "Mistral";
  return "Other";
};

export const getModelDisplayMeta = (modelId: string, provider?: string) => {
  const model = getModelById(modelId);
  return {
    name: model?.name || modelId,
    provider: provider || model?.provider || inferModelProvider(modelId),
  };
};

export const getModelById = (id: string) => {
  return (
    AVAILABLE_MODELS.find((m) => m.id === id) ||
    IMAGE_MODELS.find((m) => m.id === id) ||
    VIDEO_MODELS.find((m) => m.id === id) ||
    AVAILABLE_MODELS[0]
  );
};