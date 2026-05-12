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
  "pollinations/claude": "pollinations/gemini-search",
  "pollinations/claude-airforce": "pollinations/gemini-search",
  "pollinations/deepseek-v3.2": "pollinations/qwen-large",
  "pollinations/qwen3-coder-30b": "pollinations/qwen-coder-large",
  "pollinations/searchgpt": "pollinations/gemini-search",
  "pollinations/moonshot-v1-8k": "pollinations/qwen-large",
  "groq/qwen-2.5-32b": "groq/qwen/qwen3-32b",
  "groq/llama-3.3-70b-versatile": "groq/openai/gpt-oss-120b",
  "groq/llama-3.1-8b-instant": "groq/openai/gpt-oss-20b",
  "google/gemini-2.0-flash-exp:free": "stepfun/step-3.5-flash:free",
  "qwen/qwen3-next-80b-a3b-instruct:free": "stepfun/step-3.5-flash:free",
  "google/gemma-3-27b-it:free": "z-ai/glm-4.5-air:free",
  "sambanova/Meta-Llama-3.1-405B-Instruct":
    "sambanova/DeepSeek-V3.1",
  "sambanova/Llama-4-Maverick-17B-128E-Instruct":
    "sambanova/DeepSeek-V3.1",
  "groq/meta-llama/llama-4-maverick-17b-128e-instruct":
    "groq/openai/gpt-oss-120b",
  "pollinations/gptimage": "pollinations/gptimage-large",
  "pollinations/grok-video": "pollinations/seedance",
  "pollinations/wan": "pollinations/seedance",
  "gemini-pro": "google/gemini-2.5-pro",
  "gpt-4-turbo": "google/gemini-2.5-pro",
  "gpt-3.5-turbo": "groq/openai/gpt-oss-20b",
  "claude-3-opus": "google/gemini-2.5-pro",
  "claude-3-sonnet": "groq/openai/gpt-oss-120b",
  "claude-3-haiku": "groq/openai/gpt-oss-20b",
  "study-primary": "google/gemma-4-31b-it:free",
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
      "Defaults to Pollinations Gemini Fast, then upgrades for search, vision, code, and ambiguous reasoning.",
    tags: ["Smart", "Recommended", "Search"],
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
    id: "groq/openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    provider: "Groq",
    routeProvider: "groq",
    surface: "text",
    contextWindow: 131072,
    description:
      "Groq's strongest stable route here for premium reasoning, debugging, and complex coding.",
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
    description:
      "Fast stable Groq route for lightweight coding, rewriting, and utility prompts.",
    tags: ["Fast", "Utility", "Coding"],
    logoKey: "groq",
  },
  {
    id: "groq/qwen/qwen3-32b",
    name: "Qwen3 32B",
    provider: "Groq",
    routeProvider: "groq",
    surface: "text",
    contextWindow: 131072,
    description:
      "Fast Groq workhorse for coding, tools, and reliable structured outputs.",
    tags: ["Fast", "Coding", "JSON"],
    logoKey: "groq",
  },
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    provider: "Google",
    routeProvider: "google",
    surface: "text",
    contextWindow: 1000000,
    description:
      "Google's lowest-cost stable 2.5 model for titles, rewrites, and fast utility chat.",
    tags: ["Fast", "Budget", "General"],
    logoKey: "google",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    routeProvider: "google",
    surface: "text",
    contextWindow: 1000000,
    description:
      "Balanced multimodal model for fast chat, attachments, and vision-heavy prompts.",
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
    description:
      "Google's strongest stable model for long documents, deep reasoning, and premium study generation.",
    tags: ["Reasoning", "Long Context", "Study"],
    showcase: true,
    logoKey: "google",
  },
  {
    id: "google/gemma-4-31b-it:free",
    name: "Gemma 4 31B It (Free)",
    provider: "OpenRouter",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 128000,
    description:
      "Primary stable route for study OCR, PDF analysis, and multimodal video chat.",
    tags: ["Study", "Multimodal", "Video"],
    showcase: true,
    logoKey: "google",
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B It (Free)",
    provider: "OpenRouter",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 128000,
    description: "Multimodal route for images and PDF study materials.",
    tags: ["Vision", "Study"],
    logoKey: "google",
  },
  {
    id: "sambanova/Meta-Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B Instruct",
    provider: "SambaNova",
    routeProvider: "sambanova",
    surface: "text",
    contextWindow: 131072,
    description:
      "Reliable production fallback on SambaNova for long-form writing and study generation.",
    tags: ["Chat", "Study"],
    showcase: true,
    logoKey: "sambanova",
  },
  {
    id: "sambanova/Meta-Llama-3.1-8B-Instruct",
    name: "Llama 3.1 8B Instruct",
    provider: "SambaNova",
    routeProvider: "sambanova",
    surface: "text",
    contextWindow: 16384,
    description:
      "Efficient SambaNova option for lightweight rewrites and prompt cleanup.",
    tags: ["Fast", "Utility"],
    logoKey: "sambanova",
  },
  {
    id: "sambanova/MiniMax-M2.5",
    name: "MiniMax M2.5",
    provider: "SambaNova",
    routeProvider: "sambanova",
    surface: "text",
    contextWindow: 160000,
    description:
      "SambaNova's most cost-effective current production route for high-volume general chat, drafting, and study rewrites.",
    tags: ["Production", "Writing", "Value"],
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
    description:
      "SambaNova's best stable long-form reasoning and analytical writing fallback.",
    tags: ["Reasoning", "Analytical"],
    showcase: true,
    logoKey: "deepseek",
  },
  {
    id: "sambanova/DeepSeek-R1-0528",
    name: "DeepSeek R1 0528",
    provider: "SambaNova",
    routeProvider: "sambanova",
    surface: "text",
    contextWindow: 131072,
    description:
      "SambaNova's strongest current production reasoning model for hard analytical prompts and coding-heavy investigation.",
    tags: ["Reasoning", "Coding", "Production"],
    showcase: true,
    logoKey: "deepseek",
  },
  {
    id: "sambanova/Qwen3-235B-A22B-Instruct-2507",
    name: "Qwen3 235B A22B",
    provider: "SambaNova",
    routeProvider: "sambanova",
    surface: "text",
    contextWindow: 64000,
    description:
      "SambaNova preview model for heavyweight reasoning and coding exploration.",
    tags: ["Preview", "Reasoning", "Coding"],
    showcase: true,
    logoKey: "sambanova",
  },
  {
    id: "cerebras/gpt-oss-120b",
    name: "GPT-OSS 120B",
    provider: "Cerebras",
    routeProvider: "cerebras",
    surface: "text",
    contextWindow: 131072,
    description:
      "Cerebras route tuned for strict JSON and structured study synthesis when prompts stay within budget.",
    tags: ["Structured", "Reasoning", "Study"],
    showcase: true,
    logoKey: "cerebras",
  },
  {
    id: "cerebras/llama3.1-8b",
    name: "Llama 3.1 8B",
    provider: "Cerebras",
    routeProvider: "cerebras",
    surface: "text",
    contextWindow: 8192,
    description:
      "Cerebras' cheapest current stable option when ultra-fast lightweight text is enough.",
    tags: ["Fast", "Budget", "Utility"],
    logoKey: "cerebras",
  },
  {
    id: "cerebras/qwen-3-235b-a22b-instruct-2507",
    name: "Qwen3 235B A22B",
    provider: "Cerebras",
    routeProvider: "cerebras",
    surface: "text",
    contextWindow: 64000,
    description:
      "Cerebras preview model for frontier coding and non-thinking long-form reasoning at very high speed.",
    tags: ["Preview", "Reasoning", "Coding"],
    showcase: true,
    logoKey: "cerebras",
  },
  {
    id: "stepfun/step-3.5-flash:free",
    name: "Step 3.5 Flash Free",
    provider: "OpenRouter",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 256000,
    description:
      "Best current explicit free OpenRouter route for broad chat, drafting, and coding-friendly fallback traffic.",
    tags: ["Free", "Fallback", "General"],
    showcase: true,
    logoKey: "openrouter",
  },
  {
    id: "minimax/minimax-m2.5:free",
    name: "MiniMax M2.5 Free",
    provider: "OpenRouter",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 197000,
    description:
      "Best-value free OpenRouter model for productivity, coding help, and document-heavy assistant work.",
    tags: ["Free", "Coding", "Productivity"],
    showcase: true,
    logoKey: "openrouter",
  },
  {
    id: "z-ai/glm-4.5-air:free",
    name: "GLM 4.5 Air Free",
    provider: "OpenRouter",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 131072,
    description:
      "Free OpenRouter route suited to longer reasoning, synthesis, and structured fallback work.",
    tags: ["Free", "Fallback", "Reasoning"],
    logoKey: "openrouter",
  },
  {
    id: "nvidia/nemotron-nano-12b-v2-vl:free",
    name: "Nemotron Nano VL Free",
    provider: "NVIDIA",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 128000,
    description: "Free multimodal fallback for image-heavy prompts.",
    tags: ["Vision", "Free", "Fallback"],
    logoKey: "nvidia",
  },
  {
    id: "openrouter/free",
    name: "Free Models Router",
    provider: "OpenRouter",
    routeProvider: "openrouter",
    surface: "text",
    contextWindow: 131072,
    description: "Final zero-cost OpenRouter fallback router.",
    tags: ["Free", "Router"],
    logoKey: "openrouter",
  },
  {
    id: "pollinations/gpt-5",
    name: "Pollinations GPT-5",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 128000,
    description:
      "High-end Pollinations flagship for premium reasoning and polished long-form writing when paid models are enabled.",
    tags: ["Premium", "Reasoning"],
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/grok-reasoning",
    name: "Pollinations Grok Reasoning",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 2000000,
    description:
      "High-end Pollinations reasoning route with very large context for deep research-style prompts and complex analysis.",
    tags: ["Premium", "Reasoning", "Long Context"],
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/qwen-large",
    name: "Pollinations Qwen Large",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 1000000,
    description:
      "Strong free Pollinations general-text model for long-context chat, drafting, and multilingual assistant work.",
    tags: ["Free", "Chat", "Long Context"],
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/qwen-coder-large",
    name: "Pollinations Qwen Coder Large",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 1000000,
    description:
      "Strong free Pollinations coding model for code generation, repo reasoning, and technical assistance.",
    tags: ["Free", "Coding", "Long Context"],
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/gemini-fast",
    name: "Pollinations Gemini Fast",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 1000000,
    description:
      "Default Auto model with search-capable tooling, code execution, and vision support through Pollinations.",
    tags: ["Default", "Fast", "Vision"],
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/gemini-large",
    name: "Pollinations Gemini Large",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 1000000,
    description:
      "Stronger Pollinations Gemini route for ambiguous prompts, harder reasoning, and high-stakes analysis.",
    tags: ["Reasoning", "Long Context", "Vision"],
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/gemini",
    name: "Pollinations Gemini",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 1000000,
    description:
      "Pollinations text and vision backup with simple integration when you want a low-friction multimodal route.",
    tags: ["Fallback", "Vision"],
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
    description:
      "Free multimodal Pollinations model for image understanding and long-context visual assistant tasks.",
    tags: ["Free", "Vision", "Long Context"],
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/gemini-search",
    name: "Pollinations Gemini + Search",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "text",
    contextWindow: 128000,
    description:
      "Pollinations route tuned for recency-heavy prompts that benefit from a search-style answer path.",
    tags: ["Search", "Recency"],
    showcase: true,
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
    description:
      "Routes image generation to cost-effective Pollinations media defaults.",
    tags: ["Smart", "Image"],
    showcase: true,
    isImage: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/flux",
    name: "Flux",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "image",
    contextWindow: 0,
    description:
      "Default cost-effective image model with strong composition and style range.",
    tags: ["Default", "Image"],
    isImage: true,
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/gptimage-large",
    name: "GPT Image Large",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "image",
    contextWindow: 0,
    description:
      "Premium high-fidelity image generation for the strongest creative output.",
    tags: ["Premium", "Image"],
    isImage: true,
    showcase: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/seedream",
    name: "Seedream",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "image",
    contextWindow: 0,
    description:
      "Higher-end Pollinations image model for stylized creative work and premium visual polish.",
    tags: ["Premium", "Image", "Creative"],
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
    description:
      "Default editing model for attached-image transformation and context-aware edits.",
    tags: ["Edit", "Image"],
    isImage: true,
    showcase: true,
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
    id: "pollinations/seedance",
    name: "Seedance",
    provider: "Pollinations",
    routeProvider: "pollinations",
    surface: "video",
    contextWindow: 0,
    description: "Default Pollinations video model for balanced quality and cost.",
    tags: ["Video"],
    showcase: true,
    isVideo: true,
    logoKey: "pollinations",
  },
  {
    id: "pollinations/veo",
    name: "Veo",
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
  if (
    normalized.startsWith("openrouter/") ||
    normalized.startsWith("stepfun/") ||
    normalized.startsWith("z-ai/")
  ) {
    return "OpenRouter";
  }
  if (normalized.startsWith("groq/")) return "Groq";
  if (normalized.startsWith("sambanova/")) return "SambaNova";
  if (normalized.startsWith("cerebras/")) return "Cerebras";
  if (normalized.startsWith("google/") || normalized.includes("gemini")) {
    return "Google";
  }
  if (normalized.startsWith("minimax/")) return "MiniMax";
  if (normalized.startsWith("meta-llama/") || normalized.includes("llama")) {
    return "Meta";
  }
  if (normalized.startsWith("huggingface/")) return "Hugging Face";
  if (normalized.startsWith("bytez/")) return "Bytez";
  return "Other";
}
