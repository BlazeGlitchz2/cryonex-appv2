import { create } from "zustand";

export interface Model {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  description: string;
  logo?: string;
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
    description:
      "Automatically selects the best model based on query complexity",
    logo: "/logo.png",
    tags: ["Smart", "Efficient", "Auto"],
    showcase: true,
  },
  // Offline Models (Native)
  {
    id: "offline/gemma-3-270m",
    name: "Gemma 3 (Offline)",
    provider: "Offline",
    contextWindow: 8192,
    description: "Runs entirely on your device. No internet required.",
    logo: "/logo.png", // Or a specific icon if available, reusing generic for now
    tags: ["Offline", "Privacy", "Fast"],
    showcase: true,
  },
  // Pollinations Models (Advanced)
  {
    id: "pollinations/gpt-4o-mini", // User calls this GPT 5 Mini
    name: "GPT-5 Mini",
    provider: "Pollinations",
    contextWindow: 128000,
    description: "Fast Vision-capable model via Pollinations",
    logo: "/logos/openai.png",
    tags: ["Pollinations", "Vision", "Fast"],
    showcase: true,
  },
  {
    id: "pollinations/gemini", // Mapped to Gemini 3 Flash per user request
    name: "Gemini 3 Flash",
    provider: "Pollinations",
    contextWindow: 2000000,
    description: "Next-gen Gemini with Vision, Search & Code",
    tags: ["Pollinations", "Vision", "Search", "Code"],
    showcase: true,
  },
  {
    id: "pollinations/moonshot-v1-8k",
    name: "Moonshot Kimi 2.5",
    provider: "Pollinations",
    contextWindow: 128000,
    description: "Advanced model with Vision and Reasoning",
    tags: ["Pollinations", "Vision", "Reasoning"],
    showcase: true,
  },
  {
    id: "pollinations/minimax-01",
    name: "MiniMax M2.1",
    provider: "Pollinations",
    contextWindow: 128000,
    description: "Efficient model with Reasoning capabilities",
    tags: ["Pollinations", "Reasoning"],
    showcase: true,
  },
  // Google Gemini Models (Backend/Legacy)
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Google Gemini 2.5 Flash Lite",
    provider: "Google",
    contextWindow: 1000000,
    description:
      "Fast, efficient modal with Vision & Search (Pollinations/Google)",
    tags: ["Google", "Flash Lite", "Vision"],
    showcase: false,
  },
  // Cerebras Models
  {
    id: "cerebras/llama-3.3-70b",
    name: "Llama 3.3 70B",
    provider: "Cerebras",
    contextWindow: 8192,
    description: "World's fastest inference for Llama 3.3 70B",
    tags: ["Cerebras", "Super Fast", "Llama 3.3"],
    showcase: true,
  },
  // SambaNova Models
  {
    id: "sambanova/Meta-Llama-3.1-8B-Instruct",
    name: "Llama 3.1 8B",
    provider: "SambaNova",
    contextWindow: 16384,
    description: "Fast Llama 3.1 8B via SambaNova",
    logo: "/logos/meta.png",
    tags: ["SambaNova", "Fast", "Llama 3.1"],
  },
  {
    id: "sambanova/Meta-Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B",
    provider: "SambaNova",
    contextWindow: 131072,
    description: "Powerful Llama 3.3 70B via SambaNova",
    logo: "/logos/meta.png",
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
    logo: "/logos/deepseek.png",
    tags: ["SambaNova", "Reasoning", "DeepSeek"],
    showcase: true,
  },
  {
    id: "sambanova/DeepSeek-V3.1",
    name: "DeepSeek V3.1",
    provider: "SambaNova",
    contextWindow: 131072,
    description: "Latest DeepSeek V3.1 model",
    logo: "/logos/deepseek.png",
    tags: ["SambaNova", "DeepSeek", "Advanced"],
  },
  // Groq Models
  {
    id: "groq/llama-3.1-8b-instant",
    name: "Llama 3.1 8B",
    provider: "Groq",
    contextWindow: 131072,
    description: "Ultra-fast Llama 3.1 8B via Groq LPU",
    logo: "/logos/meta.png",
    tags: ["Groq", "Fast", "Llama 3.1"],
  },
  {
    id: "groq/llama-3.3-70b-versatile",
    name: "Llama 3.3 70B",
    provider: "Groq",
    contextWindow: 131072,
    description: "Fast Llama 3.3 70B via Groq LPU",
    logo: "/logos/meta.png",
    tags: ["Groq", "Fast", "Llama 3.3"],
    showcase: true,
  },
  {
    id: "groq/meta-llama/llama-4-maverick-17b-128e-instruct",
    name: "Llama 4 Maverick",
    provider: "Groq",
    contextWindow: 131072,
    description: "Llama 4 Maverick via Groq LPU",
    logo: "/logos/meta.png",
    tags: ["Groq", "Llama 4", "Preview"],
  },
  {
    id: "groq/qwen/qwen3-32b",
    name: "Qwen 3 32B",
    provider: "Groq",
    contextWindow: 131072,
    description: "Qwen 3 32B via Groq LPU",
    tags: ["Groq", "Qwen", "Fast"],
  },
  // DeepSeek Models (via Pollinations/HF)
  {
    id: "pollinations/deepseek-r1",
    name: "DeepSeek V3.2", // Scaled up naming as formatted by user
    provider: "Pollinations",
    contextWindow: 128000,
    description: "DeepSeek V3.2 / R1 Reasoning Model",
    logo: "/logos/deepseek.png",
    tags: ["Pollinations", "DeepSeek", "Reasoning"],
    showcase: true,
  },
  {
    id: "huggingface/deepseek-ai/DeepSeek-V3",
    name: "DeepSeek V3",
    provider: "Hugging Face",
    contextWindow: 128000,
    description: "DeepSeek V3 MoE model (Open Source)",
    logo: "/logos/deepseek.png",
    tags: ["Hugging Face", "DeepSeek", "Open Source"],
    showcase: false,
  },
  // Pollinations Models (Free Tier)
  {
    id: "bytez/deepseek-ai/deepseek-llm-67b-chat",
    name: "DeepSeek 67B Chat",
    provider: "Bytez",
    contextWindow: 32000,
    description: "DeepSeek 67B Chat model via Bytez API",
    logo: "/logos/deepseek.png",
    tags: ["Bytez", "DeepSeek", "Powerful"],
    showcase: true,
  },
  {
    id: "bytez/deepseek-ai/deepseek-coder-33b-instruct",
    name: "DeepSeek Coder 33B",
    provider: "Bytez",
    contextWindow: 16384,
    description: "DeepSeek Coder 33B for coding tasks via Bytez",
    logo: "/logos/deepseek.png",
    tags: ["Bytez", "DeepSeek", "Coding"],
    showcase: true,
  },
  {
    id: "bytez/deepseek-ai/deepseek-coder-6.7b-instruct",
    name: "DeepSeek Coder 6.7B",
    provider: "Bytez",
    contextWindow: 16384,
    description: "Fast DeepSeek Coder 6.7B via Bytez - great for quick coding",
    logo: "/logos/deepseek.png",
    tags: ["Bytez", "DeepSeek", "Fast", "Coding"],
  },
  {
    id: "bytez/deepseek-ai/deepseek-math-7b-instruct",
    name: "DeepSeek Math 7B",
    provider: "Bytez",
    contextWindow: 4096,
    description: "DeepSeek Math 7B specialized for mathematical reasoning",
    logo: "/logos/deepseek.png",
    tags: ["Bytez", "DeepSeek", "Math", "Reasoning"],
  },
];

export const IMAGE_MODELS: Model[] = [
  {
    id: "auto-image",
    name: "Auto (GPT Image)",
    provider: "Pollinations",
    contextWindow: 0,
    description: "Automatically uses GPT Image via Pollinations (Free)",
    isImage: true,
    logo: "/logo.png",
    tags: ["Smart", "Auto", "GPT Image", "Free"],
    showcase: true,
  },
  {
    id: "pollinations/flux",
    name: "Flux 1",
    provider: "Pollinations",
    contextWindow: 0,
    description: "Advanced Flux 1 model - best for detailed images (Free)",
    isImage: true,
    tags: ["Free", "Flux 1", "High Quality", "Recommended"],
    showcase: true,
  },
  {
    id: "pollinations/turbo",
    name: "Turbo",
    provider: "Pollinations",
    contextWindow: 0,
    description:
      "Ultra-fast image generation - great for quick iterations (Free)",
    isImage: true,
    tags: ["Free", "Fast", "Quick"],
    showcase: true,
  },
  {
    id: "pollinations/kontext",
    name: "Kontext (Edit)",
    provider: "Pollinations",
    contextWindow: 0,
    description: "Context-aware image editing - modify existing images (Free)",
    isImage: true,
    tags: ["Free", "Edit", "Img2Img"],
    showcase: true,
  },
  {
    id: "pollinations/gptimage",
    name: "GPT Image",
    provider: "Pollinations",
    contextWindow: 0,
    description:
      "General purpose image generation with GPT understanding (Free)",
    isImage: true,
    tags: ["Free", "General", "Versatile"],
  },
  {
    id: "pollinations/seedream",
    name: "Seedream",
    provider: "Pollinations",
    contextWindow: 0,
    description: "Artistic and creative image generation (Free)",
    isImage: true,
    tags: ["Free", "Artistic", "Creative"],
  },
  {
    id: "pollinations/nanobanana",
    name: "Nanobanana",
    provider: "Pollinations",
    contextWindow: 0,
    description: "Fast and lightweight image generation (Free)",
    isImage: true,
    tags: ["Free", "Fast", "Lightweight"],
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
  {
    id: "huggingface/cerspense/zeroscope_v2_576w",
    name: "Zeroscope v2",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Watermark-free video generation (Free)",
    isVideo: true,
    tags: ["Hugging Face", "Free", "Video"],
    showcase: true,
  },
  {
    id: "huggingface/stabilityai/stable-video-diffusion-img2vid-xt",
    name: "SVD XT",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Stable Video Diffusion XT (Free)",
    isVideo: true,
    tags: ["Hugging Face", "Free", "Quality"],
    showcase: true,
  },
];

export const AUDIO_MODELS: Model[] = [
  {
    id: "huggingface/facebook/musicgen-small",
    name: "MusicGen Small",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Generate music from text (Free)",
    isAudio: true,
    tags: ["Hugging Face", "Music", "Free"],
    showcase: true,
  },
  {
    id: "huggingface/facebook/musicgen-medium",
    name: "MusicGen Medium",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Higher quality music generation (Free)",
    isAudio: true,
    tags: ["Hugging Face", "Music", "Quality"],
  },
  {
    id: "suno/bark",
    name: "Bark",
    provider: "Replicate",
    contextWindow: 0,
    description: "Realistic text-to-audio/speech",
    isAudio: true,
    tags: ["Speech", "Audio"],
  },
];

export type ModelProvider =
  | "OpenAI"
  | "Anthropic"
  | "Google"
  | "Meta"
  | "Mistral"
  | "DeepSeek"
  | "GLM"
  | "Replicate"
  | "Bytez"
  | "Groq"
  | "Hugging Face"
  | "Cerebras"
  | "SambaNova"
  | "Pollinations"
  | "Cryonex"
  | "Other";

export const inferModelProvider = (modelId: string): ModelProvider => {
  if (modelId === "auto") return "Cryonex";
  if (modelId.startsWith("offline/")) return "Cryonex"; // Or "Offline" if added to type, but Cryonex fits "Native"
  if (modelId.startsWith("cerebras/")) return "Cerebras";
  if (modelId.startsWith("sambanova/")) return "SambaNova";
  if (modelId.startsWith("huggingface/")) return "Hugging Face";
  if (modelId.startsWith("groq/")) return "Groq";
  if (modelId.startsWith("anthropic/") || modelId.startsWith("claude-"))
    return "Anthropic";
  if (modelId.startsWith("meta-llama/") || modelId.includes("llama"))
    return "Meta";
  if (
    modelId.startsWith("mistralai/") ||
    modelId.includes("mistral") ||
    modelId.includes("mixtral")
  )
    return "Mistral";
  if (modelId.startsWith("deepseek-") || modelId.includes("deepseek"))
    return "DeepSeek";
  if (modelId.startsWith("glm-") || modelId.includes("glm")) return "GLM";
  if (modelId.startsWith("bytez/")) return "Bytez";
  if (
    modelId.includes("black-forest-labs") ||
    modelId.includes("stability-ai") ||
    modelId.includes("minimax") ||
    modelId.includes("lightricks") ||
    modelId.includes("tencent") ||
    modelId.includes("genmo") ||
    modelId.includes("suno")
  )
    return "Replicate";
  if (modelId.startsWith("pollinations/")) return "Pollinations";
  return "Other";
};

export const getModelDisplayMeta = (modelId: string, provider?: string) => {
  const model = getModelById(modelId);
  return {
    name: model?.name || modelId,
    provider: provider || model?.provider || inferModelProvider(modelId),
    logo: model?.logo,
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
