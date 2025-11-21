import { create } from "zustand";

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  description: string;
  isImage?: boolean;
  isVideo?: boolean;
}

export const AVAILABLE_MODELS: Model[] = [
  // OpenAI
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextWindow: 128000,
    description: "Most capable GPT-4 model for complex tasks",
  },
  {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    contextWindow: 16385,
    description: "Fast and cost-effective model for everyday tasks",
  },
  // Anthropic
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Most powerful Claude model for highly complex tasks",
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Balanced model for enterprise workloads",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Fastest and most compact model for near-instant responsiveness",
  },
  // Google
  {
    id: "google/gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    contextWindow: 32000,
    description: "Google's capable multimodal model",
  },
  // Meta
  {
    id: "meta-llama/llama-3-70b-instruct",
    name: "Llama 3 70B",
    provider: "Meta",
    contextWindow: 8192,
    description: "Most capable open model from Meta",
  },
  // Mistral
  {
    id: "mistralai/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B",
    provider: "Mistral",
    contextWindow: 32000,
    description: "High-performance open mixture-of-experts model",
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

export const getModelById = (id: string) => {
  return (
    AVAILABLE_MODELS.find((m) => m.id === id) ||
    IMAGE_MODELS.find((m) => m.id === id) ||
    VIDEO_MODELS.find((m) => m.id === id) ||
    AVAILABLE_MODELS[0]
  );
};