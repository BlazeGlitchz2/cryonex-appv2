import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useChatStore } from "@/lib/stores/chat-store";
import { ModelProvider } from "@/lib/utils/model-utils";
import { useAuth } from "@/hooks/use-auth";
import { useState, useMemo } from "react";
import { Search, Sparkles, Image, Video, CheckCircle2, Lock, Zap, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ModelBrowserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const textModels = [
  // Auto Model - Intelligent Selection (MUST BE FIRST)
  { id: "auto", name: "Auto", provider: "Cryonex", description: "Intelligently selects the best model based on your query complexity and type", comingSoon: false },
  
  // Hugging Face Models (Free OSS)
  { id: "Qwen/Qwen2.5-14B-Instruct", name: "Qwen 2.5 14B Instruct", provider: "Hugging Face (Free)", description: "Powerful instruction-following model", comingSoon: false },
  { id: "Qwen/Qwen2.5-7B-Instruct", name: "Qwen 2.5 7B Instruct", provider: "Hugging Face (Free)", description: "Efficient instruction model", comingSoon: false },
  { id: "Qwen/Qwen2.5-3B-Instruct", name: "Qwen 2.5 3B Instruct", provider: "Hugging Face (Free)", description: "Compact instruction model" },
  { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B Instruct", provider: "Hugging Face (Free)", description: "Latest Meta Llama model" },
  { id: "meta-llama/Llama-3.1-8B-Instruct", name: "Llama 3.1 8B Instruct", provider: "Hugging Face (Free)", description: "Efficient Llama variant" },
  { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B Instruct", provider: "Hugging Face (Free)", description: "Fast and capable 7B model" },
  { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B Instruct", provider: "Hugging Face (Free)", description: "Mixture of experts model" },
  { id: "mistralai/Mixtral-8x22B-Instruct-v0.1", name: "Mixtral 8x22B Instruct", provider: "Hugging Face (Free)", description: "Large MoE model" },
  { id: "google/gemma-2-9b-it", name: "Gemma 2 9B IT", provider: "Hugging Face (Free)", description: "Google's instruction-tuned model" },
  { id: "google/gemma-2-27b-it", name: "Gemma 2 27B IT", provider: "Hugging Face (Free)", description: "Larger Gemma variant" },
  { id: "microsoft/Phi-3-mini-128k-instruct", name: "Phi-3 Mini 128K", provider: "Hugging Face (Free)", description: "Microsoft's compact model with long context" },
  { id: "microsoft/Phi-3-medium-128k-instruct", name: "Phi-3 Medium 128K", provider: "Hugging Face (Free)", description: "Mid-size Phi model" },
  { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", provider: "Hugging Face (Free)", description: "Advanced reasoning model" },
  { id: "deepseek-ai/deepseek-coder-33b-instruct", name: "DeepSeek Coder 33B", provider: "Hugging Face (Free)", description: "Code-specialized model" },
  { id: "01-ai/Yi-34B-Chat", name: "Yi 34B Chat", provider: "Hugging Face (Free)", description: "Bilingual chat model" },
  { id: "tiiuae/falcon-180B-chat", name: "Falcon 180B Chat", provider: "Hugging Face (Free)", description: "Large open-source model" },
  { id: "tiiuae/falcon-40b-instruct", name: "Falcon 40B Instruct", provider: "Hugging Face (Free)", description: "Mid-size Falcon model" },
  { id: "bigscience/bloom-7b1", name: "BLOOM 7B", provider: "Hugging Face (Free)", description: "Multilingual model" },
  { id: "EleutherAI/gpt-neox-20b", name: "GPT-NeoX 20B", provider: "Hugging Face (Free)", description: "Open-source GPT alternative" },
  { id: "stabilityai/stablelm-2-12b-chat", name: "StableLM 2 12B Chat", provider: "Hugging Face (Free)", description: "Stability AI's chat model" },
  
  // Puter.js Models (Free, No API Key)
  { id: "puter/gpt-5", name: "GPT-5", provider: "Puter (Free)", description: "Latest GPT-5 model, no API key required", comingSoon: true },
  { id: "puter/gpt-5-mini", name: "GPT-5 Mini", provider: "Puter (Free)", description: "Compact GPT-5 variant", comingSoon: true },
  { id: "puter/gpt-5-nano", name: "GPT-5 Nano", provider: "Puter (Free)", description: "Ultra-fast GPT-5 nano", comingSoon: true },
  { id: "puter/gpt-5-chat-latest", name: "GPT-5 Chat Latest", provider: "Puter (Free)", description: "Latest chat-optimized GPT-5", comingSoon: true },
  { id: "puter/gpt-4o", name: "GPT-4o", provider: "Puter (Free)", description: "Optimized GPT-4", },
  { id: "puter/gpt-4o-mini", name: "GPT-4o Mini", provider: "Puter (Free)", description: "Compact GPT-4o", },
  { id: "puter/o1", name: "o1", provider: "Puter (Free)", description: "OpenAI o1 reasoning model" },
  { id: "puter/o1-mini", name: "o1 Mini", provider: "Puter (Free)", description: "Compact o1 model" },
  { id: "puter/o1-pro", name: "o1 Pro", provider: "Puter (Free)", description: "Professional o1 model" },
  { id: "puter/o3", name: "o3", provider: "Puter (Free)", description: "OpenAI o3 model", comingSoon: true },
  { id: "puter/o3-mini", name: "o3 Mini", provider: "Puter (Free)", description: "Compact o3 model", comingSoon: true },
  { id: "puter/o4-mini", name: "o4 Mini", provider: "Puter (Free)", description: "Latest o4 mini model", comingSoon: true },
  
  // OpenRouter Models (Requires API Key)
  { id: "openai/gpt-4-turbo", name: "GPT-4 Turbo", provider: "OpenRouter", description: "Most capable model for complex tasks" },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenRouter", description: "Optimized for speed and efficiency" },
  { id: "openai/gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenRouter", description: "Fast and cost-effective" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "OpenRouter", description: "Balanced performance and speed" },
  { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", provider: "OpenRouter", description: "Most capable Claude model" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "OpenRouter", description: "Fastest Claude model" },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "OpenRouter", description: "Advanced multimodal model" },
  { id: "google/gemini-flash-1.5", name: "Gemini Flash 1.5", provider: "OpenRouter", description: "Fast and efficient" },
  { id: "x-ai/grok-beta", name: "Grok Beta", provider: "OpenRouter", description: "Real-time knowledge and wit" },
  
  // Bytez Open-Source Models (Requires API Key)
  // Meta Llama Models
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "Bytez", description: "Latest Llama 3.3 model" },
  { id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 3.1 405B", provider: "Bytez", description: "Largest Llama model" },
  { id: "meta-llama/llama-3.1-70b-instruct", name: "Llama 3.1 70B", provider: "Bytez", description: "Balanced Llama model" },
  { id: "meta-llama/llama-3.1-8b-instruct", name: "Llama 3.1 8B", provider: "Bytez", description: "Compact Llama model" },
  { id: "meta-llama/llama-3.2-1b-instruct", name: "Llama 3.2 1B", provider: "Bytez", description: "Ultra-compact Llama" },
  { id: "meta-llama/llama-3.2-3b-instruct", name: "Llama 3.2 3B", provider: "Bytez", description: "Small Llama model" },
  { id: "meta-llama/llama-3.2-11b-vision-instruct", name: "Llama 3.2 11B Vision", provider: "Bytez", description: "Vision-capable Llama" },
  { id: "meta-llama/llama-3.2-90b-vision-instruct", name: "Llama 3.2 90B Vision", provider: "Bytez", description: "Large vision model" },
  
  // DeepSeek Models
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1", provider: "Bytez", description: "Latest reasoning model" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek Chat", provider: "Bytez", description: "Optimized for conversation" },
  { id: "deepseek/deepseek-coder", name: "DeepSeek Coder", provider: "Bytez", description: "Specialized for coding" },
  { id: "deepseek/deepseek-r1-distill-llama-70b", name: "DeepSeek R1 Distill Llama 70B", provider: "Bytez", description: "Distilled reasoning model" },
  { id: "deepseek/deepseek-r1-distill-qwen-32b", name: "DeepSeek R1 Distill Qwen 32B", provider: "Bytez", description: "Compact distilled model" },
  
  // Qwen Models
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", provider: "Bytez", description: "Large Qwen model" },
  { id: "qwen/qwen-2.5-32b-instruct", name: "Qwen 2.5 32B", provider: "Bytez", description: "Mid-size Qwen model" },
  { id: "qwen/qwen-2.5-14b-instruct", name: "Qwen 2.5 14B", provider: "Bytez", description: "Compact Qwen model" },
  { id: "qwen/qwen-2.5-7b-instruct", name: "Qwen 2.5 7B", provider: "Bytez", description: "Small Qwen model" },
  { id: "qwen/qwen-2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B", provider: "Bytez", description: "Coding specialist" },
  { id: "qwen/qvq-72b-preview", name: "QvQ 72B Preview", provider: "Bytez", description: "Vision-language model" },
  { id: "alibaba/qwen-qwq-32b-preview", name: "Qwen QwQ 32B", provider: "Bytez", description: "Alibaba's Qwen variant" },
  
  // Mistral Models
  { id: "mistralai/mistral-7b-instruct", name: "Mistral 7B", provider: "Bytez", description: "Efficient 7B model" },
  { id: "mistralai/mistral-nemo", name: "Mistral Nemo", provider: "Bytez", description: "Compact Mistral variant" },
  { id: "mistralai/pixtral-12b", name: "Pixtral 12B", provider: "Bytez", description: "Vision-capable Mistral" },
  { id: "mistralai/mixtral-8x7b-instruct-v0.1", name: "Mixtral 8x7B", provider: "Bytez", description: "Mixture of experts" },
  { id: "mistralai/mixtral-8x22b-instruct", name: "Mixtral 8x22B", provider: "Bytez", description: "Large MoE model" },
  
  // Google Models
  { id: "google/gemma-2-9b-it", name: "Gemma 2 9B", provider: "Bytez", description: "Google's open model" },
  { id: "google/gemma-2-27b-it", name: "Gemma 2 27B", provider: "Bytez", description: "Larger Gemma variant" },
  
  // Microsoft Models
  { id: "microsoft/phi-3-mini-128k-instruct", name: "Phi-3 Mini", provider: "Bytez", description: "Compact Microsoft model" },
  { id: "microsoft/phi-3-medium-128k-instruct", name: "Phi-3 Medium", provider: "Bytez", description: "Mid-size Phi model" },
  { id: "microsoft/phi-4", name: "Phi-4", provider: "Bytez", description: "Latest Phi model" },
  
  // Nvidia Models
  { id: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron 70B", provider: "Bytez", description: "Nvidia's optimized Llama" },
  
  // Cohere Models
  { id: "cohere/command-r", name: "Command R", provider: "Bytez", description: "Cohere's command model" },
  { id: "cohere/command-r-08-2024", name: "Command R (Aug 2024)", provider: "Bytez", description: "Updated Command R" },
  { id: "cohere/aya-expanse-8b", name: "Aya Expanse 8B", provider: "Bytez", description: "Multilingual model" },
  { id: "cohere/aya-expanse-32b", name: "Aya Expanse 32B", provider: "Bytez", description: "Large multilingual model" },
  
  // 01.AI Models
  { id: "01-ai/yi-large", name: "Yi Large", provider: "Bytez", description: "Large Yi model" },
  { id: "01-ai/yi-lightning", name: "Yi Lightning", provider: "Bytez", description: "Fast Yi model" },
  
  // Community & Fine-tuned Models
  { id: "nousresearch/hermes-3-llama-3.1-405b", name: "Hermes 3 Llama 405B", provider: "Bytez", description: "Fine-tuned Llama" },
  { id: "nousresearch/hermes-3-llama-3.1-70b", name: "Hermes 3 Llama 70B", provider: "Bytez", description: "Mid-size Hermes" },
  { id: "nousresearch/nous-hermes-2-mixtral-8x7b-dpo", name: "Nous Hermes 2 Mixtral DPO", provider: "Bytez", description: "DPO-trained Mixtral" },
  { id: "nousresearch/nous-hermes-2-mistral-7b-dpo", name: "Nous Hermes 2 Mistral DPO", provider: "Bytez", description: "DPO-trained Mistral" },
  { id: "nousresearch/nous-capybara-7b", name: "Nous Capybara 7B", provider: "Bytez", description: "Capybara variant" },
  
  // Specialized Models
  { id: "liquid/lfm-40b", name: "LFM 40B", provider: "Bytez", description: "Liquid AI model" },
  { id: "databricks/dbrx-instruct", name: "DBRX Instruct", provider: "Bytez", description: "Databricks model" },
  { id: "upstage/solar-pro", name: "Solar Pro", provider: "Bytez", description: "Upstage's model" },
  { id: "inflection/inflection-3-pi", name: "Inflection 3 Pi", provider: "Bytez", description: "Inflection's Pi model" },
  { id: "inflection/inflection-3-productivity", name: "Inflection 3 Productivity", provider: "Bytez", description: "Productivity-focused" },
  
  // Vision Models
  { id: "haotian-liu/llava-v1.6-34b", name: "LLaVA 1.6 34B", provider: "Bytez", description: "Vision-language model" },
  { id: "liuhaotian/llava-yi-34b", name: "LLaVA Yi 34B", provider: "Bytez", description: "Yi-based vision model" },
  
  // Code Models
  { id: "meta-llama/codellama-70b-instruct", name: "CodeLlama 70B", provider: "Bytez", description: "Large code model" },
  { id: "meta-llama/codellama-34b-instruct", name: "CodeLlama 34B", provider: "Bytez", description: "Mid-size code model" },
  { id: "phind/phind-codellama-34b", name: "Phind CodeLlama 34B", provider: "Bytez", description: "Phind's code model" },
  { id: "wizardlm/wizardcoder-python-34b", name: "WizardCoder Python 34B", provider: "Bytez", description: "Python specialist" },
  
  // Creative & Roleplay Models
  { id: "sao10k/l3-euryale-70b", name: "L3 Euryale 70B", provider: "Bytez", description: "Creative writing model" },
  { id: "sao10k/l3.1-euryale-70b", name: "L3.1 Euryale 70B", provider: "Bytez", description: "Updated Euryale" },
  { id: "eva-unit-01/eva-llama-3.33-70b", name: "EVA Llama 3.33 70B", provider: "Bytez", description: "EVA fine-tune" },
  { id: "anthracite-org/magnum-v4-72b", name: "Magnum v4 72B", provider: "Bytez", description: "Roleplay specialist" },
  { id: "sophosympatheia/midnight-rose-70b", name: "Midnight Rose 70B", provider: "Bytez", description: "Creative model" },
  { id: "neversleep/llama-3-lumimaid-70b", name: "Lumimaid 70B", provider: "Bytez", description: "Roleplay model" },
  { id: "neversleep/llama-3-lumimaid-8b", name: "Lumimaid 8B", provider: "Bytez", description: "Compact roleplay" },
  { id: "neversleep/noromaid-20b", name: "Noromaid 20B", provider: "Bytez", description: "Roleplay variant" },
  { id: "lizpreciatior/lzlv-70b-fp16-hf", name: "LZLV 70B", provider: "Bytez", description: "Creative writing" },
  { id: "gryphe/mythomax-l2-13b", name: "MythoMax L2 13B", provider: "Bytez", description: "Mythology specialist" },
  { id: "gryphe/mythomist-7b", name: "MythoMist 7B", provider: "Bytez", description: "Compact mythology" },
  { id: "undi95/remm-slerp-l2-13b", name: "ReMM SLERP L2 13B", provider: "Bytez", description: "Merged model" },
  { id: "undi95/remm-slerp-l2-13b-6k", name: "ReMM SLERP L2 13B 6K", provider: "Bytez", description: "Extended context" },
  { id: "undi95/toppy-m-7b", name: "Toppy M 7B", provider: "Bytez", description: "Compact creative" },
  { id: "pygmalionai/mythalion-13b", name: "Mythalion 13B", provider: "Bytez", description: "Pygmalion variant" },
  { id: "mancer/weaver", name: "Weaver", provider: "Bytez", description: "Story weaving" },
  
  // Dolphin Models
  { id: "cognitivecomputations/dolphin-2.9.2-qwen2-72b", name: "Dolphin Qwen2 72B", provider: "Bytez", description: "Uncensored Qwen" },
  { id: "cognitivecomputations/dolphin-mixtral-8x22b", name: "Dolphin Mixtral 8x22B", provider: "Bytez", description: "Uncensored Mixtral" },
  
  // Other Notable Models
  { id: "teknium/openhermes-2.5-mistral-7b", name: "OpenHermes 2.5", provider: "Bytez", description: "Hermes variant" },
  { id: "openchat/openchat-7b", name: "OpenChat 7B", provider: "Bytez", description: "Chat-optimized" },
  { id: "openchat/openchat-8b", name: "OpenChat 8B", provider: "Bytez", description: "Larger OpenChat" },
  { id: "koboldai/psyfighter-13b-2", name: "Psyfighter 13B", provider: "Bytez", description: "KoboldAI model" },
  { id: "intel/neural-chat-7b", name: "Neural Chat 7B", provider: "Bytez", description: "Intel's chat model" },
  { id: "alpindale/goliath-120b", name: "Goliath 120B", provider: "Bytez", description: "Massive merged model" },
  { id: "xwin-lm/xwin-lm-70b", name: "Xwin LM 70B", provider: "Bytez", description: "Xwin fine-tune" },
  { id: "rwkv/rwkv-5-world-3b", name: "RWKV 5 World 3B", provider: "Bytez", description: "RWKV architecture" },
  { id: "recursal/eagle-7b", name: "Eagle 7B", provider: "Bytez", description: "Recursal model" },
  { id: "snowflake/arctic-instruct", name: "Arctic Instruct", provider: "Bytez", description: "Snowflake's model" },
  { id: "fireworks/firellava-13b", name: "FireLLaVA 13B", provider: "Bytez", description: "Vision model" },
  { id: "austism/chronos-hermes-13b", name: "Chronos Hermes 13B", provider: "Bytez", description: "Time-aware model" },
  { id: "togethercomputer/stripedhyena-nous-7b", name: "StripedHyena Nous 7B", provider: "Bytez", description: "Hyena architecture" },
  { id: "togethercomputer/stripedhyena-hessian-7b", name: "StripedHyena Hessian 7B", provider: "Bytez", description: "Hessian variant" },
];

const imageModels = [
  // Hugging Face Image Models (Free OSS)
  { id: "stabilityai/stable-diffusion-xl-base-1.0", name: "SDXL Base 1.0", provider: "Hugging Face (Free)", description: "High-quality image generation" },
  { id: "stabilityai/sdxl-turbo", name: "SDXL Turbo", provider: "Hugging Face (Free)", description: "Fast SDXL variant" },
  { id: "stabilityai/stable-diffusion-2-1", name: "Stable Diffusion 2.1", provider: "Hugging Face (Free)", description: "Classic SD model" },
  { id: "runwayml/stable-diffusion-v1-5", name: "Stable Diffusion 1.5", provider: "Hugging Face (Free)", description: "Original SD model" },
  { id: "Salesforce/blip-image-captioning-large", name: "BLIP Captioning", provider: "Hugging Face (Free)", description: "Image to text captioning" },
  { id: "facebook/detr-resnet-50", name: "DETR Object Detection", provider: "Hugging Face (Free)", description: "Object detection model" },
  
  // Bytez Image Models (Requires API Key)
  { id: "black-forest-labs/flux-1.1-pro", name: "FLUX 1.1 Pro", provider: "Bytez", description: "State-of-the-art image generation" },
  { id: "black-forest-labs/flux-pro", name: "FLUX Pro", provider: "Bytez", description: "Professional image generation" },
  { id: "black-forest-labs/flux-dev", name: "FLUX Dev", provider: "Bytez", description: "Development version" },
  { id: "stability-ai/stable-diffusion-3", name: "Stable Diffusion 3", provider: "Bytez", description: "Latest SD model" },
  { id: "stability-ai/sdxl-turbo", name: "SDXL Turbo", provider: "Bytez", description: "Fast generation" },
  { id: "openai/dall-e-3", name: "DALL-E 3", provider: "Bytez", description: "High-quality image generation", comingSoon: false },
  { id: "midjourney/v6", name: "Midjourney v6", provider: "Bytez", description: "Artistic image generation", comingSoon: true },
  
  // Replicate Image Models
  { id: "replicate/black-forest-labs/flux-schnell", name: "FLUX Schnell", provider: "Replicate", description: "Fast FLUX model" },
  { id: "replicate/black-forest-labs/flux-dev", name: "FLUX Dev", provider: "Replicate", description: "FLUX development model" },
  { id: "replicate/stability-ai/sdxl", name: "SDXL", provider: "Replicate", description: "Stable Diffusion XL" },
  { id: "replicate/stability-ai/stable-diffusion", name: "Stable Diffusion", provider: "Replicate", description: "Classic SD model" },
];

const videoModels = [
  // Hugging Face Video Models (Free OSS)
  { id: "ali-vilab/text-to-video-ms-1.7b", name: "ModelScope T2V 1.7B", provider: "Hugging Face (Free)", description: "Text to video generation" },
  
  // Puter Video Models (Free, No API Key)
  { id: "puter/sora-2", name: "Sora 2", provider: "Puter (Free)", description: "High-quality video generation, no API key required" },
  
  { id: "google/veo-2", name: "Veo 2", provider: "Bytez", description: "Advanced video generation", comingSoon: true },
  { id: "runway/gen-3-alpha", name: "Gen-3 Alpha", provider: "Bytez", description: "Professional video generation", comingSoon: false },
  { id: "stability-ai/stable-video-diffusion", name: "Stable Video Diffusion", provider: "Bytez", description: "Open-source video generation", comingSoon: false },
  { id: "pika/pika-1.0", name: "Pika 1.0", provider: "Bytez", description: "Creative video generation", comingSoon: true },
  
  // Replicate Video Models
  { id: "replicate/minimax/video-01", name: "MiniMax Video-01", provider: "Replicate", description: "High-quality video generation" },
  { id: "replicate/genmo/mochi-1-preview", name: "Mochi 1", provider: "Replicate", description: "Creative video model" },
];

const providerKeyFromLabel = (label: string, modelId: string): ModelProvider => {
  const lower = label.toLowerCase();
  if (modelId === "auto") return "auto";
  if (lower.includes("openrouter")) return "openrouter";
  if (lower.includes("bytez")) return "bytez";
  if (lower.includes("puter")) return "puter";
  if (lower.includes("hugging")) return "huggingface";
  return "openrouter";
};

export function ModelBrowser({ open, onOpenChange }: ModelBrowserProps) {
  const { activeModel, activeModelProvider, setActiveModel, setActiveModelProvider, activeImageModel, setActiveImageModel, activeVideoModel, setActiveVideoModel } = useChatStore();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("text");

  // Check if API key is configured
  const hasApiKey = !!import.meta.env.VITE_BYTEZ_API_KEY;

  // Helper function to check if a model requires authentication
  const requiresAuthentication = (modelId: string): boolean => {
    return modelId.startsWith("puter/gpt-5");
  };

  // Helper function to check if user can access a model
  const canAccessModel = (modelId: string): boolean => {
    if (requiresAuthentication(modelId)) {
      return !!user;
    }
    return true;
  };

  // Memoize filtered models to avoid recalculation on every render
  const filteredTextModels = useMemo(() => {
    if (!searchQuery) return textModels;
    const query = searchQuery.toLowerCase();
    return textModels.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredImageModels = useMemo(() => {
    if (!searchQuery) return imageModels;
    const query = searchQuery.toLowerCase();
    return imageModels.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredVideoModels = useMemo(() => {
    if (!searchQuery) return videoModels;
    const query = searchQuery.toLowerCase();
    return videoModels.filter(
      (model) =>
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectModel = async (modelId: string, type: string, providerLabel: string) => {
    // Authentication check for GPT-5 models
    if (requiresAuthentication(modelId) && !user) {
      // Use toast instead of alert for better UX
      toast.error("GPT-5 models require authentication. Please sign in to Cryonex to access GPT-5 models.");
      return;
    }
    
    // For GPT-5 models, ensure Puter authentication is also active
    if (requiresAuthentication(modelId) && user) {
      try {
        const puterWindow = window as any;
        if (!puterWindow.puter) {
          toast.error("Puter.js is not loaded. Please refresh the page.");
          return;
        }
        
        const isSignedIn = await puterWindow.puter.auth.isSignedIn();
        
        if (!isSignedIn) {
          try {
            await puterWindow.puter.auth.signIn();
            toast.success("Authenticated with Puter for GPT-5 access");
          } catch (error) {
            toast.error("Failed to authenticate with Puter. GPT-5 models require Puter authentication.");
            return;
          }
        }
      } catch (error) {
        console.error("Puter auth check error:", error);
        toast.error("Unable to verify Puter authentication. Please try again.");
        return;
      }
    }
    
    // Skip API key checks for Puter models (they're free)
    if (modelId.startsWith("puter/")) {
      if (type === "text") {
        setActiveModel(modelId, "puter");
        setActiveModelProvider("puter");
      } else if (type === "image") {
        setActiveImageModel(modelId);
      } else if (type === "video") {
        setActiveVideoModel(modelId);
      }
      onOpenChange(false);
      return;
    }
    
    // Check API key for Replicate models (both image and video)
    if (modelId.startsWith("replicate/")) {
      const hasReplicateKey = !!import.meta.env.VITE_REPLICATE_API_TOKEN;
      if (!hasReplicateKey) {
        toast.error("Please configure your REPLICATE_API_TOKEN in the API Keys tab (Frontend section) to use Replicate models");
        return;
      }
    }
    
    // Check API key for Bytez models (image/video, excluding Replicate and Puter)
    if ((type === "image" || type === "video") && !modelId.startsWith("replicate/") && !modelId.startsWith("puter/")) {
      const isBytezModel =
        modelId.includes("black-forest-labs/") ||
        modelId.includes("stability-ai/") ||
        modelId.includes("openai/dall-e") ||
        modelId.includes("midjourney/") ||
        modelId.includes("google/veo") ||
        modelId.includes("runway/") ||
        modelId.includes("pika/");
      
      if (isBytezModel && !hasApiKey) {
        toast.error("Please configure your BYTEZ_API_KEY in the API Keys tab (Backend section) to use Bytez image/video generation");
        return;
      }
    }
    
    // Require OpenRouter key ONLY for OpenRouter text models (OpenAI, Anthropic, Gemini, xAI via OpenRouter)
    const needsOpenRouterKey =
      modelId.startsWith("openai/") ||
      modelId.startsWith("anthropic/") ||
      modelId.startsWith("google/") ||
      modelId.startsWith("x-ai/");
    if (type === "text" && needsOpenRouterKey) {
      const hasOpenRouterKey = !!import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!hasOpenRouterKey) {
        toast.error("Please configure your OPENROUTER_API_KEY in the API Keys tab (Frontend section) to use OpenRouter models");
        return;
      }
    }
    
    const providerKey = providerKeyFromLabel(providerLabel, modelId);
    if (type === "text") {
      setActiveModel(modelId, providerKey);
      setActiveModelProvider(providerKey);
    } else if (type === "image") {
      setActiveImageModel(modelId);
    } else if (type === "video") {
      setActiveVideoModel(modelId);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] sm:h-[80vh] p-0 bg-[#0f0f0f] border-[#2a2a2a] w-[95vw] sm:w-full">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-[#2a2a2a]">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-white flex items-center gap-2">
            Browse Models
            <span className="text-sm font-normal text-[#6b6b6b]">Free & Premium</span>
          </DialogTitle>
          <div className="relative mt-3 sm:mt-4">
            <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-[#6b6b6b]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search models..."
              className="pl-9 bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#6b6b6b] text-sm sm:text-base h-9 sm:h-10"
            />
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 sm:mx-6 mt-3 sm:mt-4 bg-[#1a1a1a] border border-[#2a2a2a] grid grid-cols-3 w-auto">
            <TabsTrigger value="text" className="gap-1 sm:gap-2 data-[state=active]:bg-[#2a2a2a] text-xs sm:text-sm px-2 sm:px-3">
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Text</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-1 sm:gap-2 data-[state=active]:bg-[#2a2a2a] text-xs sm:text-sm px-2 sm:px-3">
              <Image className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1 sm:gap-2 data-[state=active]:bg-[#2a2a2a] text-xs sm:text-sm px-2 sm:px-3">
              <Video className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Video</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
            <TabsContent value="text" className="mt-0 space-y-2">
              {filteredTextModels.map((model, index) => {
                const isLocked = requiresAuthentication(model.id) && !user;
                const providerKey = providerKeyFromLabel(model.provider, model.id);
                const isActive = activeModel === model.id && activeModelProvider === providerKey;
                const isComingSoon = model.comingSoon ?? false;
                
                return (
                <motion.button
                  key={model.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => !isComingSoon && handleSelectModel(model.id, "text", model.provider)}
                  disabled={isComingSoon}
                  className={`model-card w-full p-4 rounded-lg border transition-all text-left ${
                    isComingSoon
                      ? "border-[#2a2a2a] bg-[#0f0f0f] opacity-60 cursor-not-allowed"
                      : isActive
                      ? "model-card-selected border-white bg-[#2a2a2a]"
                      : "border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
                  }`}
                >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{model.name}</h3>
                          {isActive && <CheckCircle2 className="h-4 w-4 text-white" />}
                          {isLocked && <Lock className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <p className="text-sm text-[#aaaaaa] mt-1">{model.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs border-[#3a3a3a] text-[#aaaaaa]">
                            {model.provider}
                          </Badge>
                          {isComingSoon && (
                            <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                              Coming Soon
                            </Badge>
                          )}
                          {isLocked && !isComingSoon && (
                            <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">
                              🔒 Sign in required
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </TabsContent>

            <TabsContent value="image" className="mt-0 space-y-2">
              {filteredImageModels.map((model, index) => {
                const isComingSoon = model.comingSoon ?? false;
                return (
                <motion.button
                  key={model.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => !isComingSoon && handleSelectModel(model.id, "image", model.provider)}
                  disabled={isComingSoon}
                  className={`model-card w-full p-4 rounded-lg border transition-all text-left ${
                    isComingSoon
                      ? "border-[#2a2a2a] bg-[#0f0f0f] opacity-60 cursor-not-allowed"
                      : activeImageModel === model.id
                      ? "model-card-selected border-white bg-[#2a2a2a]"
                      : "border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{model.name}</h3>
                        {activeImageModel === model.id && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      <p className="text-sm text-[#aaaaaa] mt-1">{model.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs border-[#3a3a3a] text-[#aaaaaa]">
                          {model.provider}
                        </Badge>
                        {isComingSoon && (
                          <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
              })}
            </TabsContent>

            <TabsContent value="video" className="mt-0 space-y-2">
              {filteredVideoModels.map((model, index) => {
                const isComingSoon = model.comingSoon ?? false;
                return (
                <motion.button
                  key={model.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => !isComingSoon && handleSelectModel(model.id, "video", model.provider)}
                  disabled={isComingSoon}
                  className={`model-card w-full p-4 rounded-lg border transition-all text-left ${
                    isComingSoon
                      ? "border-[#2a2a2a] bg-[#0f0f0f] opacity-60 cursor-not-allowed"
                      : activeVideoModel === model.id
                      ? "model-card-selected border-white bg-[#2a2a2a]"
                      : "border-[#2a2a2a] hover:border-[#3a3a3a] hover:bg-[#1a1a1a]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{model.name}</h3>
                        {activeVideoModel === model.id && <CheckCircle2 className="h-4 w-4 text-white" />}
                      </div>
                      <p className="text-sm text-[#aaaaaa] mt-1">{model.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs border-[#3a3a3a] text-[#aaaaaa]">
                          {model.provider}
                        </Badge>
                        {isComingSoon && (
                          <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
              })}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}