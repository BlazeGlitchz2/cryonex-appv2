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
  showcase?: boolean;
}

export const AVAILABLE_MODELS: Model[] = [
  {
    id: "auto",
    name: "Auto (Smart Select)",
    provider: "Cryonex",
    contextWindow: 128000,
    description: "Automatically selects the best model based on query complexity",
    tags: ["Smart", "Efficient", "Auto"],
    showcase: true,
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5 (Preview)",
    provider: "OpenAI",
    contextWindow: 200000,
    description: "Next generation GPT model (Preview/Simulated)",
    tags: ["OpenAI", "Future", "Reasoning"],
    showcase: true,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "OpenAI",
    contextWindow: 128000,
    description: "Most capable GPT-4 model for complex tasks",
    tags: ["Complex Tasks", "Reasoning"],
    showcase: true,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    contextWindow: 16385,
    description: "Fast and cost-effective model for everyday tasks",
    tags: ["Fast", "Everyday"],
  },
  // Cerebras Models
  {
    id: "cerebras/llama-3.3-70b",
    name: "Llama 3.3 70B (Cerebras)",
    provider: "Cerebras",
    contextWindow: 8192,
    description: "World's fastest inference for Llama 3.3 70B",
    tags: ["Cerebras", "Super Fast", "Llama 3.3"],
    showcase: true,
  },
  // SambaNova Models
  {
    id: "sambanova/Meta-Llama-3.1-8B-Instruct",
    name: "Llama 3.1 8B (SambaNova)",
    provider: "SambaNova",
    contextWindow: 16384,
    description: "Fast Llama 3.1 8B via SambaNova",
    tags: ["SambaNova", "Fast", "Llama 3.1"],
  },
  {
    id: "sambanova/Meta-Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B (SambaNova)",
    provider: "SambaNova",
    contextWindow: 131072,
    description: "Powerful Llama 3.3 70B via SambaNova",
    tags: ["SambaNova", "Complex Tasks", "Llama 3.3"],
    showcase: true,
  },
  {
    id: "sambanova/Llama-4-Maverick-17B-128E-Instruct",
    name: "Llama 4 Maverick 17B",
    provider: "SambaNova",
    contextWindow: 131072,
    description: "Next-gen Llama 4 architecture (Preview)",
    tags: ["SambaNova", "Llama 4", "Preview"],
    showcase: true,
  },
  {
    id: "sambanova/DeepSeek-R1-Distill-Llama-70B",
    name: "DeepSeek R1 Distill 70B",
    provider: "SambaNova",
    contextWindow: 131072,
    description: "DeepSeek R1 distilled into Llama 70B",
    tags: ["SambaNova", "Reasoning", "DeepSeek"],
    showcase: true,
  },
  {
    id: "sambanova/DeepSeek-V3.1",
    name: "DeepSeek V3.1",
    provider: "SambaNova",
    contextWindow: 131072,
    description: "Latest DeepSeek V3.1 model",
    tags: ["SambaNova", "DeepSeek", "Advanced"],
  },
  // Groq Models
  {
    id: "groq/llama-3.1-8b-instant",
    name: "Llama 3.1 8B (Groq)",
    provider: "Groq",
    contextWindow: 131072,
    description: "Ultra-fast Llama 3.1 8B via Groq LPU",
    tags: ["Groq", "Fast", "Llama 3.1"],
  },
  {
    id: "groq/llama-3.3-70b-versatile",
    name: "Llama 3.3 70B (Groq)",
    provider: "Groq",
    contextWindow: 131072,
    description: "Fast Llama 3.3 70B via Groq LPU",
    tags: ["Groq", "Fast", "Llama 3.3"],
    showcase: true,
  },
  {
    id: "groq/meta-llama/llama-4-maverick-17b-128e-instruct",
    name: "Llama 4 Maverick (Groq)",
    provider: "Groq",
    contextWindow: 131072,
    description: "Llama 4 Maverick via Groq LPU",
    tags: ["Groq", "Llama 4", "Preview"],
  },
  {
    id: "groq/qwen/qwen3-32b",
    name: "Qwen 3 32B (Groq)",
    provider: "Groq",
    contextWindow: 131072,
    description: "Qwen 3 32B via Groq LPU",
    tags: ["Groq", "Qwen", "Fast"],
  },
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
  {
    id: "google/gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    contextWindow: 1000000,
    description: "Fast, cost-efficient multimodal model with massive context",
    tags: ["Google", "Fast", "Long Context"],
  },
  {
    id: "google/gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    contextWindow: 2000000,
    description: "Mid-size multimodal model for complex reasoning",
    tags: ["Google", "Reasoning", "Long Context"],
    showcase: true,
  },
  {
    id: "google/gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash (Preview)",
    provider: "Google",
    contextWindow: 1000000,
    description: "Next generation fast model (Preview)",
    tags: ["Google", "Preview", "Fast"],
    showcase: true,
  },
  {
    id: "google/gemini-3-pro",
    name: "Gemini 3 Pro",
    provider: "Google",
    contextWindow: 2000000,
    description: "Future generation multimodal model",
    tags: ["Google", "Future", "Advanced"],
    showcase: true,
  },
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
    showcase: true,
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
  // Hugging Face Models
  {
    id: "huggingface/moonshotai/Kimi-K2-Instruct-0905",
    name: "Kimi K2 Instruct",
    provider: "Hugging Face",
    contextWindow: 32000,
    description: "Moonshot AI's Kimi K2 Instruct model via Hugging Face",
    tags: ["Hugging Face", "Open Source"],
  },
  {
    id: "huggingface/meta-llama/Meta-Llama-3-8B-Instruct",
    name: "Llama 3 8B (HF)",
    provider: "Hugging Face",
    contextWindow: 8192,
    description: "Meta Llama 3 8B Instruct via Hugging Face",
    tags: ["Hugging Face", "Llama"],
  },
  {
    id: "huggingface/mistralai/Mistral-7B-Instruct-v0.3",
    name: "Mistral 7B v0.3 (HF)",
    provider: "Hugging Face",
    contextWindow: 32000,
    description: "Mistral 7B Instruct v0.3 via Hugging Face",
    tags: ["Hugging Face", "Mistral"],
  },
  // Bytez Models
  {
    id: "bytez/gpt-4o",
    name: "GPT-4o (Bytez)",
    provider: "Bytez",
    contextWindow: 128000,
    description: "GPT-4 Omni via Bytez API",
    tags: ["Bytez", "Multimodal"],
  },
  {
    id: "bytez/meta-llama/Meta-Llama-3-8B-Instruct",
    name: "Llama 3 8B (Bytez)",
    provider: "Bytez",
    contextWindow: 8192,
    description: "Meta Llama 3 8B Instruct via Bytez",
    tags: ["Bytez", "Open Source", "Fast"],
  },
  {
    id: "bytez/mistralai/Mistral-7B-Instruct-v0.3",
    name: "Mistral 7B v0.3 (Bytez)",
    provider: "Bytez",
    contextWindow: 32000,
    description: "Mistral 7B Instruct v0.3 via Bytez",
    tags: ["Bytez", "Mistral"],
  },
  {
    id: "bytez/microsoft/Phi-3-mini-4k-instruct",
    name: "Phi-3 Mini (Bytez)",
    provider: "Bytez",
    contextWindow: 4096,
    description: "Microsoft Phi-3 Mini via Bytez",
    tags: ["Bytez", "Small", "Efficient"],
  },
  {
    id: "bytez/Qwen/Qwen2-72B-Instruct",
    name: "Qwen2 72B (Bytez)",
    provider: "Bytez",
    contextWindow: 32000,
    description: "Qwen2 72B Instruct via Bytez",
    tags: ["Bytez", "Qwen", "Powerful"],
  },
  {
    id: "bytez/claude-3-opus",
    name: "Claude 3 Opus (Bytez)",
    provider: "Bytez",
    contextWindow: 200000,
    description: "Claude 3 Opus via Bytez API",
    tags: ["Bytez", "Reasoning"],
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
    id: "microsoft/phi-3-medium-128k-instruct",
    name: "Phi-3 Medium",
    provider: "Microsoft",
    contextWindow: 128000,
    description: "High reasoning capability in a small package",
    tags: ["Open Source", "Reasoning"],
  },
];

export const IMAGE_MODELS: Model[] = [
  // Hugging Face Image Models
  {
    id: "huggingface/black-forest-labs/FLUX.1-dev",
    name: "FLUX.1 Dev (HF)",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "High-quality FLUX.1 Dev model via Hugging Face",
    isImage: true,
    tags: ["Hugging Face", "High Quality"],
  },
  {
    id: "huggingface/stabilityai/stable-diffusion-3.5-large",
    name: "Stable Diffusion 3.5 Large (HF)",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Latest Stable Diffusion 3.5 Large model",
    isImage: true,
    tags: ["Hugging Face", "Stable Diffusion"],
  },
  // Replicate Image Models
  {
    id: "black-forest-labs/flux-1.1-pro",
    name: "FLUX 1.1 Pro",
    provider: "Replicate",
    contextWindow: 0,
    description: "State-of-the-art image generation with exceptional quality",
    isImage: true,
    tags: ["Latest", "High Quality"],
    showcase: true,
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
    showcase: true,
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
    showcase: true,
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
    showcase: true,
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
    showcase: true,
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

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Mistral" | "DeepSeek" | "GLM" | "Replicate" | "Bytez" | "Groq" | "Hugging Face" | "Cerebras" | "SambaNova" | "Other";

export const inferModelProvider = (modelId: string): ModelProvider => {
  if (modelId.startsWith("cerebras/")) return "Cerebras";
  if (modelId.startsWith("sambanova/")) return "SambaNova";
  if (modelId.startsWith("huggingface/")) return "Hugging Face";
  if (modelId.startsWith("groq/")) return "Groq";
  if (modelId.startsWith("anthropic/") || modelId.startsWith("claude-")) return "Anthropic";
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