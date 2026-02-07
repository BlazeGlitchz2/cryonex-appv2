
import { Bot, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const ModelIcon = ({ provider, name, className }: { provider: string, name: string, className?: string }) => {
    const p = provider.toLowerCase();
    const n = name.toLowerCase();

    if (p.includes("openai") || n.includes("gpt")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-emerald-400", className)}>
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9891 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a1.54 1.54 0 0 1 .7279 1.3161v5.3832a4.4814 4.4814 0 0 1-5.1844 3.4301zM23 14.2251a4.4717 4.4717 0 0 1-3.3522 1.8533v-5.6514l-.0115-.0224-4.739-2.7348 2.9396-1.6974a1.5603 1.5603 0 0 1 1.5824.0369l4.6833 2.7065a1.5459 1.5459 0 0 1 .7829 1.3354v2.8158a4.4643 4.4643 0 0 1-1.8855 1.3571zm-1.8657-8.1198-4.7926 2.7666V12.49a.7899.7899 0 0 0 .3927.6813l5.8333 3.3685.0276.0161a4.4872 4.4872 0 0 1-1.1178 2.8657 4.452 4.452 0 0 1-4.2877 1.1286V13.46a1.5453 1.5453 0 0 1-.7733-1.3354V9.3082l4.6833-2.7065a1.5416 1.5416 0 0 1 .0344-.0203zm-10.2362-.7027 2.0386-1.1768 4.7926 2.7666-2.9492 1.7028a1.5558 1.5558 0 0 1-1.5728-.0323l-4.6737-2.7118a1.54 1.54 0 0 1-.7925-1.3301V6.3205a4.489 4.489 0 0 1 3.157-2.3174zM4.1099 6.8325a4.4852 4.4852 0 0 1 3.0918-1.4572v5.6514l.0115.0224 4.739 2.7348-2.9396 1.6974a1.5603 1.5603 0 0 1-1.5824-.0369l-4.6833-2.7065a1.5459 1.5459 0 0 1-.7829-1.3354V8.5866A4.4643 4.4643 0 0 1 4.1099 6.8325zm-1.5504 7.3475.0276-.0161 5.8333-3.3685a.7899.7899 0 0 0 .3927-.6813V3.4003a4.4872 4.4872 0 0 1 1.1178-2.8657 4.452 4.452 0 0 1 4.2877-1.1286v7.0903a1.5453 1.5453 0 0 1 .7733 1.3354v2.8158l-4.6833 2.7065a1.5416 1.5416 0 0 1-.0344.0203l-2.0386 1.1768a4.4755 4.4755 0 0 1-5.6761-2.3684zm12.0358 6.5733-2.0386 1.1768-4.7926-2.7666 2.9492-1.7028a1.5558 1.5558 0 0 1 1.5728.0323l4.6737 2.7118a1.54 1.54 0 0 1 .7925 1.3301v2.1926a4.489 4.489 0 0 1-3.157 2.3174z" />
            </svg>
        );
    }

    if (p.includes("anthropic") || n.includes("claude")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-orange-400", className)}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
        );
    }

    if (p.includes("google") || n.includes("gemini") || n.includes("gemma")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-blue-400", className)}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
        );
    }

    if (p.includes("meta") || n.includes("llama")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-blue-500", className)}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
        );
    }

    if (p.includes("mistral") || n.includes("mistral") || n.includes("mixtral")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-yellow-500", className)}>
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.95 1.477 2.95-1.477L12 14.09l-5.9-3.09L12 11zm0 3.82L2 10v7l10 5 10-5v-7l-10 4.82z" />
            </svg>
        )
    }

    if (n.includes("deepseek")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-blue-600", className)}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2zm0-10h2v6h-2z" />
            </svg>
        );
    }

    if (n.includes("qwen")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-indigo-600", className)}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            </svg>
        );
    }

    if (n.includes("glm")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-purple-500", className)}>
                <path d="M12 2L2 22h20L12 2zm0 4l6 12H6l6-12z" />
            </svg>
        );
    }

    if (n.includes("kimi")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-pink-500", className)}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
        );
    }

    if (p.includes("sambanova")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-orange-600", className)}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M6 12h12" stroke="black" strokeWidth="2" />
            </svg>
        );
    }

    if (p.includes("bytez")) {
        return (
            <svg viewBox="0 0 24 24" fill="currentColor" className={cn("w-5 h-5 text-indigo-500", className)}>
                <path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.95 1.477 2.95-1.477L12 14.09l-5.9-3.09L12 11zm0 3.82L2 10v7l10 5 10-5v-7l-10 4.82z" />
            </svg>
        );
    }

    if (p.includes("pollinations")) {
        return <Sparkles className={cn("w-5 h-5 text-pink-400", className)} />;
    }

    return <Bot className={cn("w-5 h-5 text-muted-foreground", className)} />;
}

