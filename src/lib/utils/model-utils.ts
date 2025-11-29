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
    id: "agentrouter/gpt-5",
    name: "GPT-5",
    provider: "AgentRouter",
    contextWindow: 200000,
    description: "Latest GPT model with enhanced capabilities via AgentRouter",
    tags: ["Latest", "Advanced", "AgentRouter"],
  },
  {
    id: "agentrouter/gpt-5.1",
    name: "GPT-5.1",
    provider: "AgentRouter",
    contextWindow: 200000,
    description: "Next generation GPT-5.1 model via AgentRouter",
    tags: ["Latest", "Advanced", "AgentRouter"],
  },
  // Cerebras Models
  {
    id: "cerebras/llama-3.3-70b",
    name: "Llama 3.3 70B (Cerebras)",
    provider: "Cerebras",
    contextWindow: 8192,
    description: "World's fastest inference for Llama 3.3 70B",
    tags: ["Cerebras", "Super Fast", "Llama 3.3"],
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
    id: "agentrouter/deepseek-v3.1",
    name: "DeepSeek V3.1",
    provider: "AgentRouter",
    contextWindow: 64000,
    description: "Advanced reasoning model from DeepSeek via AgentRouter",
    tags: ["Reasoning", "Cost-Effective", "AgentRouter"],
  },
  {
    id: "agentrouter/deepseek-v3.2",
    name: "DeepSeek V3.2",
    provider: "AgentRouter",
    contextWindow: 64000,
    description: "Latest DeepSeek model with improved performance via AgentRouter",
    tags: ["Latest", "Reasoning", "AgentRouter"],
  },
  {
    id: "agentrouter/deepseek-r1-0528",
    name: "DeepSeek R1",
    provider: "AgentRouter",
    contextWindow: 64000,
    description: "DeepSeek R1 model via AgentRouter",
    tags: ["Reasoning", "AgentRouter"],
  },
  // GLM via AgentRouter
  {
    id: "agentrouter/glm-4.5",
    name: "GLM 4.5",
    provider: "AgentRouter",
    contextWindow: 128000,
    description: "Powerful Chinese language model via AgentRouter",
    tags: ["Multilingual", "Chinese", "AgentRouter"],
  },
  {
    id: "agentrouter/glm-4.6",
    name: "GLM 4.6",
    provider: "AgentRouter",
    contextWindow: 128000,
    description: "Latest GLM model with enhanced capabilities via AgentRouter",
    tags: ["Latest", "Multilingual", "AgentRouter"],
  },
  // Anthropic via AgentRouter
  {
    id: "agentrouter/claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    provider: "AgentRouter",
    contextWindow: 200000,
    description: "Next-gen fast Claude model via AgentRouter",
    tags: ["Fast", "AgentRouter"],
  },
  {
    id: "agentrouter/claude-sonnet-4-5-20250929",
    name: "Claude Sonnet 4.5",
    provider: "AgentRouter",
    contextWindow: 200000,
    description: "Next-gen balanced Claude model via AgentRouter",
    tags: ["Balanced", "AgentRouter"],
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
  // Google via AgentRouter
  {
    id: "agentrouter/gemini-3-pro-preview",
    name: "Gemini 3 Pro Preview",
    provider: "AgentRouter",
    contextWindow: 1000000,
    description: "Preview of Gemini 3 Pro via AgentRouter",
    tags: ["Multimodal", "Google", "AgentRouter"],
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
    id: "agentrouter/kimi-k2-thinking",
    name: "Kimi K2 Thinking",
    provider: "AgentRouter",
    contextWindow: 32000,
    description: "Kimi K2 with thinking capabilities via AgentRouter",
    tags: ["Reasoning", "AgentRouter"],
  },
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
  // AgentRouter Models
  {
    id: "agentrouter/gpt-4o",
    name: "GPT-4o (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 128000,
    description: "GPT-4o via AgentRouter gateway",
    tags: ["AgentRouter", "OpenAI", "Complex Tasks"],
  },
  {
    id: "agentrouter/claude-3-5-sonnet-20240620",
    name: "Claude 3.5 Sonnet (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 200000,
    description: "Claude 3.5 Sonnet via AgentRouter gateway",
    tags: ["AgentRouter", "Anthropic", "Reasoning"],
  },
  {
    id: "agentrouter/deepseek-chat",
    name: "DeepSeek V3 (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 64000,
    description: "DeepSeek V3 via AgentRouter gateway",
    tags: ["AgentRouter", "DeepSeek", "Coding"],
  },
  {
    id: "agentrouter/deepseek-coder",
    name: "DeepSeek Coder (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 64000,
    description: "DeepSeek Coder via AgentRouter gateway",
    tags: ["AgentRouter", "DeepSeek", "Coding"],
  },
  {
    id: "agentrouter/qwen-max",
    name: "Qwen Max (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 32000,
    description: "Qwen Max via AgentRouter gateway",
    tags: ["AgentRouter", "Qwen", "Alibaba"],
  },
  {
    id: "agentrouter/qwen-turbo",
    name: "Qwen Turbo (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 32000,
    description: "Qwen Turbo via AgentRouter gateway",
    tags: ["AgentRouter", "Qwen", "Fast"],
  },
  {
    id: "agentrouter/moonshot-v1-8k",
    name: "Moonshot V1 8K (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 8000,
    description: "Moonshot AI via AgentRouter gateway",
    tags: ["AgentRouter", "Moonshot", "Chinese"],
  },
  {
    id: "agentrouter/yi-34b-chat-0205",
    name: "Yi 34B Chat (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 200000,
    description: "01.AI Yi Model via AgentRouter gateway",
    tags: ["AgentRouter", "01.AI", "Long Context"],
  },
];

export const IMAGE_MODELS: Model[] = [
  // AgentRouter Image Models
  {
    id: "agentrouter/midjourney/mj-v6",
    name: "Midjourney V6 (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 0,
    description: "Midjourney V6 via AgentRouter",
    isImage: true,
    tags: ["AgentRouter", "Midjourney", "High Quality"],
  },
  {
    id: "agentrouter/black-forest-labs/flux-1.1-pro",
    name: "FLUX 1.1 Pro (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 0,
    description: "FLUX 1.1 Pro via AgentRouter",
    isImage: true,
    tags: ["AgentRouter", "FLUX", "High Quality"],
  },
  {
    id: "agentrouter/stabilityai/stable-diffusion-3",
    name: "Stable Diffusion 3 (AgentRouter)",
    provider: "AgentRouter",
    contextWindow: 0,
    description: "Stable Diffusion 3 via AgentRouter",
    isImage: true,
    tags: ["AgentRouter", "Stability AI", "Latest"],
  },
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

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Mistral" | "DeepSeek" | "GLM" | "Replicate" | "Bytez" | "Groq" | "Hugging Face" | "Cerebras" | "AgentRouter" | "Other";

export const inferModelProvider = (modelId: string): ModelProvider => {
  if (modelId.startsWith("cerebras/")) return "Cerebras";
  if (modelId.startsWith("agentrouter/")) return "AgentRouter";
  if (modelId.startsWith("huggingface/")) return "Hugging Face";
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