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
    description: "Automatically selects the best model based on query complexity",
    logo: "/logo.png",
    tags: ["Smart", "Efficient", "Auto"],
    showcase: true,
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
    logo: "/logos/meta.png",
    tags: ["SambaNova", "Fast", "Llama 3.1"],
  },
  {
    id: "sambanova/Meta-Llama-3.3-70B-Instruct",
    name: "Llama 3.3 70B (SambaNova)",
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
    name: "Llama 3.1 8B (Groq)",
    provider: "Groq",
    contextWindow: 131072,
    description: "Ultra-fast Llama 3.1 8B via Groq LPU",
    logo: "/logos/meta.png",
    tags: ["Groq", "Fast", "Llama 3.1"],
  },
  {
    id: "groq/llama-3.3-70b-versatile",
    name: "Llama 3.3 70B (Groq)",
    provider: "Groq",
    contextWindow: 131072,
    description: "Fast Llama 3.3 70B via Groq LPU",
    logo: "/logos/meta.png",
    tags: ["Groq", "Fast", "Llama 3.3"],
    showcase: true,
  },
  {
    id: "groq/meta-llama/llama-4-maverick-17b-128e-instruct",
    name: "Llama 4 Maverick (Groq)",
    provider: "Groq",
    contextWindow: 131072,
    description: "Llama 4 Maverick via Groq LPU",
    logo: "/logos/meta.png",
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
  // DeepSeek Models (via Hugging Face)
  {
    id: "huggingface/deepseek-ai/DeepSeek-V3",
    name: "DeepSeek V3 (HF)",
    provider: "Hugging Face",
    contextWindow: 128000,
    description: "DeepSeek V3 MoE model (Open Source)",
    logo: "/logos/deepseek.png",
    tags: ["Hugging Face", "DeepSeek", "Open Source"],
    showcase: true,
  },
  // Bytez Models (DeepSeek)
  {
    id: "bytez/deepseek-ai/deepseek-llm-67b-chat",
    name: "DeepSeek 67B Chat (Bytez)",
    provider: "Bytez",
    contextWindow: 32000,
    description: "DeepSeek 67B Chat model via Bytez API",
    logo: "/logos/deepseek.png",
    tags: ["Bytez", "DeepSeek", "Powerful"],
    showcase: true,
  },
  {
    id: "bytez/deepseek-ai/deepseek-coder-33b-instruct",
    name: "DeepSeek Coder 33B (Bytez)",
    provider: "Bytez",
    contextWindow: 16384,
    description: "DeepSeek Coder 33B for coding tasks via Bytez",
    logo: "/logos/deepseek.png",
    tags: ["Bytez", "DeepSeek", "Coding"],
    showcase: true,
  },
  {
    id: "bytez/deepseek-ai/deepseek-coder-6.7b-instruct",
    name: "DeepSeek Coder 6.7B (Bytez)",
    provider: "Bytez",
    contextWindow: 16384,
    description: "Fast DeepSeek Coder 6.7B via Bytez - great for quick coding",
    logo: "/logos/deepseek.png",
    tags: ["Bytez", "DeepSeek", "Fast", "Coding"],
  },
  {
    id: "bytez/deepseek-ai/deepseek-math-7b-instruct",
    name: "DeepSeek Math 7B (Bytez)",
    provider: "Bytez",
    contextWindow: 4096,
    description: "DeepSeek Math 7B specialized for mathematical reasoning",
    logo: "/logos/deepseek.png",
    tags: ["Bytez", "DeepSeek", "Math", "Reasoning"],
  },
];

export const IMAGE_MODELS: Model[] = [
  {
    id: "auto",
    name: "Auto (Smart Select)",
    provider: "Cryonex",
    contextWindow: 0,
    description: "Automatically selects the best model (Flux 1 via Pollinations)",
    isImage: true,
    logo: "/logo.png",
    tags: ["Smart", "Auto", "Flux 1"],
    showcase: true,
  },
  // Hugging Face Image Models
  {
    id: "huggingface/black-forest-labs/FLUX.1-dev",
    name: "FLUX.1 Dev",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "High-quality FLUX.1 Dev model via Hugging Face",
    isImage: true,
    tags: ["Hugging Face", "High Quality"],
    showcase: true,
  },
  {
    id: "huggingface/black-forest-labs/FLUX.1-schnell",
    name: "FLUX.1 Schnell",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Ultra-fast FLUX.1 model - generates in 1-4 steps",
    isImage: true,
    tags: ["Hugging Face", "Fast", "Free"],
    showcase: true,
  },
  {
    id: "huggingface/stabilityai/stable-diffusion-3.5-large",
    name: "SD 3.5 Large",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Latest Stable Diffusion 3.5 Large model",
    isImage: true,
    tags: ["Hugging Face", "Stable Diffusion"],
  },
  {
    id: "huggingface/stabilityai/stable-diffusion-xl-base-1.0",
    name: "SDXL Base 1.0",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Stable Diffusion XL Base model",
    isImage: true,
    tags: ["Hugging Face", "SDXL", "Popular"],
    showcase: true,
  },
  {
    id: "huggingface/ByteDance/SDXL-Lightning",
    name: "SDXL Lightning",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Ultra-fast SDXL Lightning by ByteDance",
    isImage: true,
    tags: ["Hugging Face", "Fast", "ByteDance"],
  },
  {
    id: "huggingface/ByteDance/Hyper-SD",
    name: "Hyper-SD",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "High-speed image generation by ByteDance",
    isImage: true,
    tags: ["Hugging Face", "Fast"],
  },
  {
    id: "huggingface/Lykon/dreamshaper-xl-lightning",
    name: "DreamShaper XL",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "DreamShaper XL Lightning for creative images",
    isImage: true,
    tags: ["Hugging Face", "Creative"],
  },
  {
    id: "huggingface/segmind/SSD-1B",
    name: "Segmind SSD-1B",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Fast distilled SDXL model by Segmind",
    isImage: true,
    tags: ["Hugging Face", "Fast", "Distilled"],
  },
  {
    id: "huggingface/runwayml/stable-diffusion-v1-5",
    name: "SD 1.5 Classic",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Classic Stable Diffusion 1.5 model",
    isImage: true,
    tags: ["Hugging Face", "Classic"],
  },
  {
    id: "huggingface/prompthero/openjourney-v4",
    name: "Openjourney v4",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Midjourney-style image generation",
    isImage: true,
    tags: ["Hugging Face", "Artistic"],
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
  {
    id: "pollinations/flux",
    name: "FLUX.1 (Free)",
    provider: "Pollinations",
    contextWindow: 0,
    description: "High-quality FLUX.1 model via Pollinations.ai (Free)",
    isImage: true,
    tags: ["Free", "High Quality"],
    showcase: true,
  },
  {
    id: "pollinations/turbo",
    name: "Turbo (Free)",
    provider: "Pollinations",
    contextWindow: 0,
    description: "Ultra-fast image generation via Pollinations.ai (Free)",
    isImage: true,
    tags: ["Free", "Fast"],
    showcase: true,
  },
  {
    id: "pollinations/gptimage",
    name: "GPTImage (Free)",
    provider: "Pollinations",
    contextWindow: 0,
    description: "General purpose image generation (Free)",
    isImage: true,
    tags: ["Free", "General"],
  },
  {
    id: "pollinations/kontext",
    name: "Kontext (Free)",
    provider: "Pollinations",
    contextWindow: 0,
    description: "Context-aware image generation (Free)",
    isImage: true,
    tags: ["Free", "Smart"],
  },
  {
    id: "pollinations/seedream",
    name: "Seedream (Free)",
    provider: "Pollinations",
    contextWindow: 0,
    description: "Artistic and creative image generation (Free)",
    isImage: true,
    tags: ["Free", "Artistic"],
  },
  {
    id: "pollinations/nanobanana",
    name: "Nanobanana (Free)",
    provider: "Pollinations",
    contextWindow: 0,
    description: "Fast and lightweight image generation (Free)",
    isImage: true,
    tags: ["Free", "Fast"],
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
    name: "Zeroscope v2 (HF)",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Watermark-free video generation (Free)",
    isVideo: true,
    tags: ["Hugging Face", "Free", "Video"],
    showcase: true,
  },
  {
    id: "huggingface/stabilityai/stable-video-diffusion-img2vid-xt",
    name: "SVD XT (HF)",
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
    name: "MusicGen Small (HF)",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Generate music from text (Free)",
    isAudio: true,
    tags: ["Hugging Face", "Music", "Free"],
    showcase: true,
  },
  {
    id: "huggingface/facebook/musicgen-medium",
    name: "MusicGen Medium (HF)",
    provider: "Hugging Face",
    contextWindow: 0,
    description: "Higher quality music generation (Free)",
    isAudio: true,
    tags: ["Hugging Face", "Music", "Quality"],
  },
  {
    id: "suno/bark",
    name: "Bark (Suno)",
    provider: "Replicate",
    contextWindow: 0,
    description: "Realistic text-to-audio/speech",
    isAudio: true,
    tags: ["Speech", "Audio"],
  },
];

export type ModelProvider = "OpenAI" | "Anthropic" | "Google" | "Meta" | "Mistral" | "DeepSeek" | "GLM" | "Replicate" | "Bytez" | "Groq" | "Hugging Face" | "Cerebras" | "SambaNova" | "Pollinations" | "Cryonex" | "Other";

export const inferModelProvider = (modelId: string): ModelProvider => {
  if (modelId === "auto") return "Cryonex";
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