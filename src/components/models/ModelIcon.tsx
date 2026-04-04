import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const OpenAIIcon = ({ className }: { className?: string }) => (
  <img
    src="/logos/openai.png"
    alt="OpenAI"
    className={cn("object-contain", className)}
  />
);

const MetaIcon = ({ className }: { className?: string }) => (
  <img
    src="/logos/meta.png"
    alt="Meta"
    className={cn("object-contain", className)}
  />
);

const AnthropicIcon = ({ className }: { className?: string }) => (
  <img
    src="/logos/anthropic.png"
    alt="Anthropic"
    className={cn("object-contain", className)}
  />
);

const DeepSeekIcon = ({ className }: { className?: string }) => (
  <img
    src="/logos/deepseek.png"
    alt="DeepSeek"
    className={cn("object-contain", className)}
  />
);

const MiniMaxIcon = ({ className }: { className?: string }) => (
  <img
    src="/logos/minimax.webp"
    alt="MiniMax"
    className={cn("object-contain", className)}
  />
);

const GoogleIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M21.8 12.2c0-.76-.07-1.33-.22-1.92H12v3.64h5.62c-.12.9-.77 2.27-2.22 3.18l-.02.12 3.04 2.36.21.02c1.92-1.77 3.17-4.38 3.17-7.4Z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.75 0 5.06-.9 6.75-2.43l-3.22-2.5c-.86.6-2.02 1.01-3.53 1.01-2.7 0-4.99-1.77-5.81-4.22l-.11.01-3.16 2.45-.04.1A10.2 10.2 0 0 0 12 22Z"
    />
    <path
      fill="#FBBC05"
      d="M6.19 13.86A6.14 6.14 0 0 1 5.87 12c0-.65.12-1.27.31-1.86l-.01-.12-3.2-2.49-.1.05A9.98 9.98 0 0 0 2 12c0 1.61.39 3.13 1.08 4.42l3.11-2.56Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.92c1.9 0 3.18.82 3.91 1.5l2.85-2.78C17.05 3.03 14.74 2 12 2a10.2 10.2 0 0 0-9.12 5.58l3.31 2.56C7.01 7.69 9.3 5.92 12 5.92Z"
    />
  </svg>
);

const GroqIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M6.5 4h7.9a5.6 5.6 0 1 1 0 11.2h-2.9l4 4H11.9l-4.8-4.8V9.6h7.1a2 2 0 1 0 0-4H6.5V4Z"
    />
  </svg>
);

const OpenRouterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M6.2 7.1h9.3l-1.9-1.9L15 4l4 4-4 4-1.4-1.2 1.8-1.9H6.2a2.7 2.7 0 0 0 0 5.4h3.2v1.9H6.2a4.6 4.6 0 0 1 0-9.2Zm11.6 9.8H8.5l1.9 1.9L9 20l-4-4 4-4 1.4 1.2-1.8 1.9h9.2a2.7 2.7 0 1 0 0-5.4h-3.2V7.7h3.2a4.6 4.6 0 1 1 0 9.2Z"
    />
  </svg>
);

const CerebrasIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M18.8 6.2A8.8 8.8 0 1 0 18.8 17h-3.1a6.1 6.1 0 1 1 0-10.1h3.1Z"
    />
  </svg>
);

const SambaNovaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M6.2 7.4a3.9 3.9 0 0 1 3.9-3.9h7.7v2.7h-7.4a1.3 1.3 0 0 0 0 2.6h3.9a3.9 3.9 0 1 1 0 7.8H6v-2.7h7.9a1.3 1.3 0 1 0 0-2.6H10a3.8 3.8 0 0 1-3.8-3.9Z"
    />
  </svg>
);

const HuggingFaceIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <circle cx="20" cy="26" r="8" fill="currentColor" opacity="0.35" />
    <circle cx="44" cy="26" r="8" fill="currentColor" opacity="0.35" />
    <path
      fill="currentColor"
      d="M18 40c3 4 7.4 6 14 6s11-2 14-6l3 2.2C45 48 39.4 51 32 51s-13-3-17-8.8L18 40Z"
    />
  </svg>
);

const QwenIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M12.2 3.2 7.7 11l4.5 7.8h-3L4.7 11l4.5-7.8h3Zm2.6 0h3L13.3 11l4.5 7.8h-3L10.3 11l4.5-7.8Z"
    />
  </svg>
);

export function ModelIcon({
  provider,
  name,
  className,
  logoUrl,
}: {
  provider: string;
  name: string;
  className?: string;
  logoUrl?: string;
}) {
  const providerName = provider.toLowerCase();
  const modelName = name.toLowerCase();

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name}
        className={cn("object-contain", className)}
      />
    );
  }

  if (providerName.includes("openrouter")) {
    return <OpenRouterIcon className={cn("text-sky-400", className)} />;
  }
  if (providerName.includes("groq")) {
    return <GroqIcon className={cn("text-blue-300", className)} />;
  }
  if (providerName.includes("sambanova")) {
    return <SambaNovaIcon className={cn("text-orange-300", className)} />;
  }
  if (providerName.includes("cerebras")) {
    return <CerebrasIcon className={cn("text-orange-400", className)} />;
  }
  if (providerName.includes("google") || modelName.includes("gemini") || modelName.includes("gemma")) {
    return <GoogleIcon className={className} />;
  }
  if (providerName.includes("hugging") || providerName.includes("hf")) {
    return <HuggingFaceIcon className={cn("text-yellow-400", className)} />;
  }
  if (providerName.includes("pollinations")) {
    return <Sparkles className={cn("text-pink-400", className)} />;
  }
  if (providerName.includes("minimax") || modelName.includes("minimax")) {
    return <MiniMaxIcon className={className} />;
  }
  if (providerName.includes("anthropic") || modelName.includes("claude")) {
    return <AnthropicIcon className={className} />;
  }
  if (modelName.includes("deepseek")) {
    return <DeepSeekIcon className={className} />;
  }
  if (providerName.includes("openai") || modelName.includes("gpt")) {
    return <OpenAIIcon className={className} />;
  }
  if (providerName.includes("meta") || modelName.includes("llama")) {
    return <MetaIcon className={className} />;
  }
  if (modelName.includes("qwen")) {
    return <QwenIcon className={cn("text-indigo-300", className)} />;
  }

  return <Bot className={cn("text-muted-foreground", className)} />;
}
