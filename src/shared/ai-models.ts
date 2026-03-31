export type AiSurface = "text" | "image" | "video" | "audio";

export type AiProviderId =
  | "cryonex"
  | "offline"
  | "google"
  | "groq"
  | "sambanova"
  | "cerebras"
  | "openrouter"
  | "pollinations"
  | "huggingface"
  | "bytez"
  | "meta"
  | "minimax"
  | "nvidia"
  | "replicate"
  | "other";

export type ModelProvider =
  | "Cryonex"
  | "Offline"
  | "Google"
  | "Groq"
  | "SambaNova"
  | "Cerebras"
  | "OpenRouter"
  | "Pollinations"
  | "Hugging Face"
  | "Bytez"
  | "Meta"
  | "MiniMax"
  | "NVIDIA"
  | "Replicate"
  | "Other";

export interface AiModelDefinition {
  id: string;
  name: string;
  provider: ModelProvider;
  routeProvider: AiProviderId;
  surface: AiSurface;
  contextWindow: number;
  description: string;
  tags?: string[];
  showcase?: boolean;
  isImage?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  logo?: string;
  logoKey?: string;
}

export const MODEL_ALIASES: Record<string, string> = {
  "pollinations/claude": "pollinations/searchgpt",
  "pollinations/claude-airforce": "pollinations/searchgpt",
  "pollinations/minimax": "minimax/minimax-m2.5:free",
  "pollinations/minimax-01": "minimax/minimax-m2.5:free",
  "minimax/minimax-m2.5": "minimax/minimax-m2.5:free",
  "google/gemini-2.0-flash-exp": "google/gemini-2.5-flash-lite",
  "google/gemini-2.0-flash-exp:free": "openrouter/free",
  "groq/qwen-2.5-32b": "groq/qwen/qwen3-32b",
  "groq/llama-3.3-70b-versatile": "groq/openai/gpt-oss-120b",
  "groq/llama-3.1-8b-instant": "groq/openai/gpt-oss-20b",
  "sambanova/Meta-Llama-3.1-405B-Instruct":
    "sambanova/DeepSeek-V3.1",
  "sambanova/Llama-4-Maverick-17B-128E-Instruct": "sambanova/DeepSeek-V3.1",
  "groq/meta-llama/llama-4-maverick-17b-128e-instruct":
    "groq/openai/gpt-oss-120b",
  "gemini-pro": "google/gemini-2.5-pro",
  "gpt-4-turbo": "google/gemini-2.5-pro",
  "gpt-3.5-turbo": "groq/qwen/qwen3-32b",
  "claude-3-opus": "google/gemini-2.5-pro",
  "claude-3-sonnet": "groq/openai/gpt-oss-120b",
  "claude-3-haiku": "groq/qwen/qwen3-32b",
};

export function normalizeModelId(modelId: string) {
  return MODEL_ALIASES[modelId] || modelId;
}

export const TEXT_MODELS: AiModelDefinition[] = [
  {
    id: "auto",
    name: "Auto Router",
    provider: "Cryonex",
    routeProvider: "cryonex",
    surface: "text",
    contextWindow: 128000,
    description:
      "Routes each request to the strongest available provider for the task.",
    tags: ["Smart", "Recommended", "Fallbacks"],
    showcase: true,
    logoKey: "cryonex",
  },
  {
    id: "offline/gemma-3-270m",
    name: "Gemma 3 Offline",
    provider: "Offline",
    routeProvider: "offline",
    surface: "text",
    contextWindow: 8192,
    description: "Runs locally on-device when offline-first privacy matters.",
    tags: ["Offline", "Private"],
    showcase: true,
    logoKey: "offline",
  },
  {
    id: "cerebras/gpt-oss-120b",
    name: "GPT-OSS 120B",
    provider: "Cerebras",
    routeProvider: "cerebras",
    surface: "text",
    contextWindow: 131072,
    description:
      "Cerebras route tuned for strict JSON, structured outputs, and long-context study synthesis.",
    tags: ["Structured", "Reasoning", "Study"],
    showcase: true,
    logoKey: "cerebras",
  },
  {
    id: "groq/qwen/qwen3-32b",
    name: "Qwen3 32B",
    provider: "Groq",
    routeProvider: "groq",
    surface: "text",
    contextWindow: 131072,
    description: "Fast Groq workhorse for coding, tool use, and reliable structured outputs.",
    tags: ["Fast", "Coding", "JSON"],
    logoKey: "groq",
  },
  {
    id: "groq/openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    provider: "Groq",
    routeProvider: "groq",
    surface: "text",
    contextWindow: 131072,
    description: "Groq's strongest stable route here for premium reasoning, debugging, and complex coding.",
    tags: ["Reasoning", "Analysis", "Fast"],
    showcase: true,
    logoKey: "groq",
  },
  {
    id: "groq/openai/gpt-oss-20b",
    name: "GPT-OSS 20B",
    provider: "Groq",
    routeProvider: "groq",
    surface: "text",
    contextWindow: 131072,
    description: "Fast stable Groq route for lightweight coding, rewriting, and utility prompts.",
    tags: ["Fast", "Utility", "Coding"],
    logoKey: "groq",
  },
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    provider: "Google",
    routeProvider: "google",
    surface: "text",
    contextWindow: 1000000,
    description: "Google's fastest and most budget-friendly 2.5 multimodal model for everyday chat and utility work.",
    tags: ["Fast", "Vision", "General"],
    showcase: true,
    logoKey: "google",
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    routeProvider: "google",
    surface: "text",
    contextWindow: 1048576,
    description: "Google's strongest stable model for long documents, deep reasoning, and premium study generation.",
    tags: ["Reasoning", "Long Context", "Study"],
    showcase: true,
    logoKey: "google",
  },
  {
    id: "nvidia/nemotron-nano-12b-v2-vl:free",
    name: "Nemotron Nano VL Free",
    provider: "NVIDIA",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 128000,
    description: "Free multimodal OpenRouter fallback for image-heavy prompts.",
    tags: ["Vision", "Free", "Fallback"],
    logoKey: "nvidia",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B Free",
    provider: "Google",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 131072,
    description: "Free OpenRouter route for broad general reasoning with solid fallback coverage.",
    tags: ["Free", "Fallback", "General"],
    logoKey: "google",
  },
  {
    id: "sambanova/Meta-Llama-3.1-8B-Instruct",
    name: "Llama 3.1 8B Instruct",
    provider: "SambaNova",
    routeProvider: "sambanova",
    surface: "text",
    contextWindow: 16384,
    description: "Efficient SambaNova option for prompt cleanup and small tasks.",
    tags: ["Fast", "Utility"],
    logoKey: "sambanova",
  },
  {
    id: "sambanova/Meta-Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B Instruct",
    provider: "SambaNova",
    routeProvider: "sambanova",
    surface: "text",
    contextWindow: 131072,
    description: "Reliable production fallback on SambaNova for long-form writing and study generation.",
    tags: ["Chat", "Study"],
    showcase: true,
    logoKey: "sambanova",
  },
  {
    id: "sambanova/DeepSeek-V3.1",
    name: "DeepSeek V3.1",
    provider: "SambaNova",
    routeProvider: "sambanova",
    surface: "text",
    contextWindow: 131072,
    description: "SambaNova's best stable reasoning fallback here for analytical and long-form study work.",
    tags: ["Reasoning", "Analytical"],
    showcase: true,
    logoKey: "deepseek",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    routeProvider: "google",
    surface: "text",
    contextWindow: 1000000,
    description: "Balanced Google multimodal model for fast reasoning, file-heavy prompts, and vision tasks.",
    tags: ["Vision", "Search", "Fast"],
    showcase: true,
    logoKey: "google",
  },
  {
    id: "openrouter/auto",
    name: "OpenRouter Auto",
    provider: "OpenRouter",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 200000,
    description: "Delegates model choice to OpenRouter's auto router.",
    tags: ["Router", "Fallbacks"],
    showcase: true,
    logoKey: "openrouter",
  },
  {
    id: "minimax/minimax-m2.5:free",
    name: "MiniMax M2.5 Free",
    provider: "MiniMax",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 196608,
    description: "Free OpenRouter-backed reasoning and coding option.",
    tags: ["Free", "Reasoning"],
    showcase: true,
    logoKey: "minimax",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B Free",
    provider: "Meta",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 131072,
    description: "Free long-form fallback through OpenRouter.",
    tags: ["Free", "Fallback"],
    logoKey: "meta",
  },
  {
    id: "openrouter/free",
    name: "Free Models Router",
    provider: "OpenRouter",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 131072,
    description: "OpenRouter's free router as the no-key-pressure fallback layer.",
    tags: ["Free", "Router"],
    logoKey: "openrouter",
  },
  {
    id: "pollinations/gemini",
    name: "Pollinations Gemini",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 1000000,
    description: "Free Pollinations text and vision backup with simple integration.",
    tags: ["Free", "Fallback", "Vision"],
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/qwen-vision",
    name: "Pollinations Qwen Vision",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 1000000,
    description: "Free multimodal backup for image understanding tasks.",
    tags: ["Free", "Vision"],
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/searchgpt",
    name: "Pollinations SearchGPT",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 128000,
    description: "Pollinations route tuned for online search-style answers.",
    tags: ["Search", "Fallback"],
    logoKey: "pollinations",
  },
];

export const IMAGE_MODELS: AiModelDefinition[] = [
  {
    id: "auto-image",
    name: "Auto Image",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "image",
    contextWindow: 0,
    description: "Routes image generation to the strongest Pollinations model.",
    tags: ["Smart", "Image"],
    showcase: true,
    isImage: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/gptimage",
    name: "GPT Image",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "image",
    contextWindow: 0,
    description: "General-purpose image generation with strong prompt following.",
    tags: ["General", "Image"],
    isImage: true,
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/kontext",
    name: "Kontext Edit",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "image",
    contextWindow: 0,
    description: "Context-aware image editing for attached images.",
    tags: ["Edit", "Image"],
    isImage: true,
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/flux",
    name: "Flux 1",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "image",
    contextWindow: 0,
    description: "Detailed image generation with strong composition quality.",
    tags: ["Detail", "Creative"],
    isImage: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/turbo",
    name: "Turbo",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "image",
    contextWindow: 0,
    description: "Fast image iterations for quick preview workflows.",
    tags: ["Fast", "Preview"],
    isImage: true,
    logoKey: "pollinations",
  },
];

export const VIDEO_MODELS: AiModelDefinition[] = [
  {
    id: "pollinations/grok-video",
    name: "Grok Video",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "video",
    contextWindow: 0,
    description: "Primary text-to-video option through Pollinations.",
    tags: ["Video"],
    showcase: true,
    isVideo: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/wan",
    name: "Wan 2.6",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "video",
    contextWindow: 0,
    description: "Text or image to video with audio-capable workflows.",
    tags: ["Video", "Audio"],
    isVideo: true,
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/veo",
    name: "Veo Fast",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "video",
    contextWindow: 0,
    description: "Higher-end video generation when premium models are enabled.",
    tags: ["Video", "Premium"],
    isVideo: true,
    logoKey: "pollinations",
  },
];

export const AUDIO_MODELS: AiModelDefinition[] = [
  {
    id: "huggingface/facebook/musicgen-small",
    name: "MusicGen Small",
    provider: "Hugging Face",
    routeProvider: "huggingface",
    surface: "audio",
    contextWindow: 0,
    description: "Lightweight music generation baseline.",
    tags: ["Music"],
    isAudio: true,
    showcase: true,
    logoKey: "huggingface",
  },
  {
    id: "huggingface/facebook/musicgen-medium",
    name: "MusicGen Medium",
    provider: "Hugging Face",
    routeProvider: "huggingface",
    surface: "audio",
    contextWindow: 0,
    description: "Higher-quality music generation through Hugging Face.",
    tags: ["Music", "Quality"],
    isAudio: true,
    logoKey: "huggingface",
  },
];

export const ALL_MODELS = [
  ...TEXT_MODELS,
  ...IMAGE_MODELS,
  ...VIDEO_MODELS,
  ...AUDIO_MODELS,
];

export const MODEL_BY_ID = new Map(
  ALL_MODELS.map((model) => [model.id, model] as const),
);

export function getModelDefinition(modelId: string) {
  return MODEL_BY_ID.get(normalizeModelId(modelId));
}

export function inferModelProvider(modelId: string): ModelProvider {
  const model = getModelDefinition(modelId);
  if (model) {
    return model.provider;
  }

  const normalized = normalizeModelId(modelId).toLowerCase();
  if (normalized === "auto") return "Cryonex";
  if (normalized.startsWith("pollinations/")) return "Pollinations";
  if (normalized.startsWith("openrouter/")) return "OpenRouter";
  if (normalized.startsWith("groq/")) return "Groq";
  if (normalized.startsWith("sambanova/")) return "SambaNova";
  if (normalized.startsWith("cerebras/")) return "Cerebras";
  if (normalized.startsWith("google/") || normalized.includes("gemini"))
    return "Google";
  if (normalized.startsWith("minimax/")) return "MiniMax";
  if (normalized.startsWith("meta-llama/") || normalized.includes("llama"))
    return "Meta";
  if (normalized.startsWith("huggingface/")) return "Hugging Face";
  if (normalized.startsWith("bytez/")) return "Bytez";
  return "Other";
}
