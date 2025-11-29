import { create } from "zustand";

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  description: string;
  isImage?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  tags?: string[];
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextWindow: 128000,
    description: "Most capable GPT-4 model for complex tasks",
    tags: ["Complex Tasks", "Reasoning"],
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    contextWindow: 16385,
    description: "Fast and cost-effective model for everyday tasks",
    tags: ["Fast", "Everyday"],
  },
  {
    id: "gpt-5",
    name: "GPT-5",
    provider: "OpenAI",
    contextWindow: 200000,
    description: "Latest GPT model with enhanced capabilities",
    tags: ["Latest", "Advanced"],
  },
  // Groq Models
  {
    id: "groq/llama3-8b-8192",
    name: "Llama 3 8B (Groq)",
    provider: "Groq",
    contextWindow: 8192,
    description: "Ultra-fast Llama 3 8B via Groq LPU",
    tags: ["Groq", "Fast", "Open Source"],
  },
  {
    id: "groq/llama3-70b-8192",
    name: "Llama 3 70B (Groq)",
    provider: "Groq",
    contextWindow: 8192,
    description: "Ultra-fast Llama 3 70B via Groq LPU",
    tags: ["Groq", "Fast", "Complex Tasks"],
  },
  {
    id: "groq/mixtral-8x7b-32768",
    name: "Mixtral 8x7B (Groq)",
    provider: "Groq",
    contextWindow: 32768,
    description: "Ultra-fast Mixtral via Groq LPU",
    tags: ["Groq", "Fast", "Long Context"],
  },
  {
    id: "groq/gemma-7b-it",
    name: "Gemma 7B (Groq)",
    provider: "Groq",
    contextWindow: 8192,
    description: "Ultra-fast Gemma via Groq LPU",
    tags: ["Groq", "Fast", "Google"],
  },
  // DeepSeek via AgentRouter
  {
    id: "deepseek-v3.1",
    name: "DeepSeek V3.1",
    provider: "DeepSeek",
    contextWindow: 64000,
    description: "Advanced reasoning model from DeepSeek",
    tags: ["Reasoning", "Cost-Effective"],
  },
  {
    id: "deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "DeepSeek",
    contextWindow: 64000,
    description: "Latest DeepSeek model with improved performance",
    tags: ["Latest", "Reasoning"],
  },
  // GLM via AgentRouter
  {
    id: "glm-4.5",
    name: "GLM 4.5",
    provider: "GLM",
    contextWindow: 128000,
    description: "Powerful Chinese language model",
    tags: ["Multilingual", "Chinese"],
  },
  {
    id: "glm-4.6",
    name: "GLM 4.6",
    provider: "GLM",
    contextWindow: 128000,
    description: "Latest GLM model with enhanced capabilities",
    tags: ["Latest", "Multilingual"],
  },
  // Anthropic via AgentRouter
  {
    id: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Most powerful Claude model for highly complex tasks",
    tags: ["Reasoning", "Coding"],
  },
  {
    id: "claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Balanced model for enterprise workloads",
    tags: ["Balanced", "Enterprise"],
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Fastest and most compact model for near-instant responsiveness",
    tags: ["Fast", "Compact"],
  },
  // Google via AgentRouter
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    contextWindow: 32000,
    description: "Google's capable multimodal model",
    tags: ["Multimodal", "Google"],
  },
  // OpenRouter Models
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo (OpenRouter)",
    provider: "OpenAI",
    contextWindow: 128000,
    description: "GPT-4 Turbo via OpenRouter",
    tags: ["OpenRouter", "Complex Tasks"],
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Latest Claude model with enhanced capabilities",
    tags: ["OpenRouter", "Latest"],
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    provider: "Google",
    contextWindow: 1000000,
    description: "Extended context window Gemini model",
    tags: ["OpenRouter", "Long Context"],
  },
  {
    id: "meta-llama/llama-3.1-405b-instruct",
    name: "Llama 3.1 405B",
    provider: "Meta",
    contextWindow: 128000,
    description: "Most powerful open-source model",
    tags: ["OpenRouter", "Open Source"],
  },
  {
    id: "mistralai/mistral-large",
    name: "Mistral Large",
    provider: "Mistral",
    contextWindow: 128000,
    description: "Flagship Mistral model for complex tasks",
    tags: ["OpenRouter", "Enterprise"],
  },
  // Bytez Models
  {
    id: "bytez/gpt-4o",
    name: "GPT-4o (Bytez)",
    provider: "OpenAI",
    contextWindow: 128000,
    description: "GPT-4 Omni via Bytez API",
    tags: ["Bytez", "Multimodal"],
  },
  {
    id: "bytez/claude-3-opus",
    name: "Claude 3 Opus (Bytez)",
    provider: "Anthropic",
    contextWindow: 200000,
    description: "Claude 3 Opus via Bytez API",
    tags: ["Bytez", "Reasoning"],
  },
  {
    id: "bytez/gemini-1.5-pro",
    name: "Gemini 1.5 Pro (Bytez)",
    provider: "Google",
    contextWindow: 1000000,
    description: "Gemini 1.5 Pro via Bytez API",
    tags: ["Bytez", "Long Context"],
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
    id: "google/gemma-7b-it:free",
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
  // Replicate Image Models
  {
    id: "black-forest-labs/flux-1.1-pro",
    name: "FLUX 1.1 Pro",
    provider: "Replicate",
    contextWindow: 0,
    description: "State-of-the-art image generation with exceptional quality",
    isImage: true,
    tags: ["Latest", "High Quality"],
  },
  {
    id: "black-forest-labs/flux-schnell",
    name: "FLUX Schnell",
    provider: "Replicate",
    contextWindow: 0,
    description: "Ultra-fast image generation in 1-4 steps",
    isImage: true,
    tags: ["Fast", "Efficient"],
  },
  {
    id: "stability-ai/sdxl",
    name: "Stable Diffusion XL",
    provider: "Replicate",
    contextWindow: 0,
    description: "High-quality image generation with SDXL",
    isImage: true,
    tags: ["Popular", "Versatile"],
  },
  {
    id: "bytedance/sdxl-lightning-4step",
    name: "SDXL Lightning",
    provider: "Replicate",
    contextWindow: 0,
    description: "Lightning-fast SDXL in 4 steps",
    isImage: true,
    tags: ["Fast", "Quality"],
  },
  {
    id: "recraft-ai/recraft-v3",
    name: "Recraft V3",
    provider: "Replicate",
    contextWindow: 0,
    description: "Advanced image generation with style control",
    isImage: true,
    tags: ["Style Control", "Professional"],
  },
];

export const VIDEO_MODELS: Model[] = [
  // Replicate Video Models
  {
    id: "minimax/video-01",
    name: "MiniMax Video-01",
    provider: "Replicate",
    contextWindow: 0,
    description: "Text and image to 6-second video generation",
    isVideo: true,
    tags: ["Text-to-Video", "Latest"],
  },
  {
    id: "lightricks/ltx-video",
    name: "LTX Video",
    provider: "Replicate",
    contextWindow: 0,
    description: "Fast video generation with high quality",
    isVideo: true,
    tags: ["Fast", "Quality"],
  },
  {
    id: "tencent/hunyuan-video",
    name: "Hunyuan Video",
    provider: "Replicate",
    contextWindow: 0,
    description: "Advanced text-to-video generation",
    isVideo: true,
    tags: ["Text-to-Video", "Advanced"],
  },
  {
    id: "genmo/mochi-1-preview",
    name: "Mochi 1",
    provider: "Replicate",
    contextWindow: 0,
    description: "High-quality video generation",
    isVideo: true,
    tags: ["Quality", "Preview"],
  },
];

export const AUDIO_MODELS: Model[] = [
  {
    id: "suno-v3",
    name: "Suno AI v3",
    provider: "MusicAPI",
    contextWindow: 0,
    description: "Generate high-quality music from text descriptions",
    isAudio: true,
    tags: ["Music Generation", "AI Composition"],
  },
  {
    id: "suno/bark",
    name: "Bark",
    provider: "Replicate",
    contextWindow: 0,
    description: "Realistic text-to-audio generation",
    isAudio: true,
    tags: ["Text-to-Speech", "Audio"],
  },
  {
    id: "meta/musicgen",
    name: "MusicGen",
    provider: "Replicate",
    contextWindow: 0,
    description: "Generate music from text descriptions",
    tags: ["Music", "Meta"],
  },
  {
    id: "openai/whisper",
    name: "Whisper",
    provider: "OpenAI",
    contextWindow: 0,
    description: "Robust speech recognition model",
    tags: ["Speech-to-Text", "OpenAI"],
  },
];

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Mistral" | "DeepSeek" | "GLM" | "Replicate" | "Bytez" | "Groq" | "Other";

export const inferModelProvider = (modelId: string): ModelProvider => {
  if (modelId.startsWith("openai/") || modelId.startsWith("gpt-")) return "OpenAI";
  if (modelId.startsWith("groq/")) return "Groq";
  if (modelId.startsWith("anthropic/") || modelId.startsWith("claude-")) return "Anthropic";
  if (modelId.startsWith("google/") || modelId.startsWith("gemini-")) return "Google";
  if (modelId.startsWith("meta-llama/") || modelId.includes("llama")) return "Meta";
  if (modelId.startsWith("mistralai/") || modelId.includes("mistral") || modelId.includes("mixtral")) return "Mistral";
  if (modelId.startsWith("deepseek-") || modelId.includes("deepseek")) return "DeepSeek";
  if (modelId.startsWith("glm-") || modelId.includes("glm")) return "GLM";
  if (modelId.startsWith("bytez/")) return "Bytez";
  if (modelId.includes("black-forest-labs") || modelId.includes("stability-ai") || modelId.includes("minimax") || modelId.includes("lightricks") || modelId.includes("tencent") || modelId.includes("genmo") || modelId.includes("suno")) return "Replicate";
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
    AUDIO_MODELS.find((m) => m.id === id) ||
    AVAILABLE_MODELS[0]
  );
};