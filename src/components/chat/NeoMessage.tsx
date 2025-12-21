import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Share2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Source {
    title: string;
    url: string;
    domain: string;
    snippet?: string;
}

interface NeoMessageProps {
    role: "user" | "assistant" | "system";
    content: string;
    userImage?: string;
    userName?: string;
    isStreaming?: boolean;
    timestamp?: number;
    sources?: Source[];
}

export function NeoMessage({ role, content, userImage, userName, isStreaming, timestamp, sources }: NeoMessageProps) {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);
    const [displayedContent, setDisplayedContent] = useState("");
    const contentRef = useRef(content);

    // Strip prefixes for display
    const cleanContent = content.replace(/^\[(Search|Think|Canvas)\]\s*/i, "");

    // Typewriter effect logic
    useEffect(() => {
        // If it's a user message, show immediately (but stripped)
        if (isUser) {
            setDisplayedContent(cleanContent);
            return;
        }

        // For AI messages:
        // 1. If streaming, animate.
        // 2. If not streaming but VERY new (created in last 10s) and not fully displayed, animate.
        // 3. Otherwise (history), show immediately.

        const isRecent = timestamp && (Date.now() - timestamp < 10000);
        const shouldAnimate = isStreaming || (isRecent && displayedContent.length < cleanContent.length);

        if (shouldAnimate) {
            if (cleanContent.length > displayedContent.length) {
                // Calculate speed - significantly faster
                const remaining = cleanContent.length - displayedContent.length;

                // Dynamic speed: 
                // - Super fast for large chunks (1ms)
                // - Fast for normal text (2-3ms)
                // - Smooth landing for short text
                let delay = 1;

                // Batch update for very long content to avoid React render bottleneck
                // Significantly increased chunk sizes for "super duper fast" feel
                let chunkSize = 1;

                if (remaining > 500) {
                    chunkSize = 50; // Instant block reveal for huge text
                    delay = 1;
                } else if (remaining > 200) {
                    chunkSize = 20; // Very fast
                    delay = 1;
                } else if (remaining > 50) {
                    chunkSize = 5; // Fast
                    delay = 2;
                } else {
                    chunkSize = 2; // Smooth
                    delay = 5;
                }

                const timeout = setTimeout(() => {
                    setDisplayedContent(cleanContent.slice(0, displayedContent.length + chunkSize));
                }, delay);
                return () => clearTimeout(timeout);
            }
        } else {
            setDisplayedContent(cleanContent);
        }
    }, [cleanContent, isStreaming, displayedContent, isUser, timestamp]);

    const handleCopy = () => {
        const cleanContent = content.replace(/^\[(Search|Think|Canvas)\]\s*/i, "");
        navigator.clipboard.writeText(cleanContent);
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
                "group relative w-full flex flex-col gap-1 px-4 py-2 md:px-0 transition-colors",
                isUser ? "items-end" : "items-start"
            )}
        >
            {/* User Message (Minimalist Pill) */}
            {isUser ? (
                <div className="max-w-[85%] md:max-w-[70%]">
                    <div className="bg-[#1e1e1e] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-sm border border-white/5">
                        <div className="whitespace-pre-wrap">{displayedContent}</div>
                    </div>
                </div>
            ) : (
                /* AI Message (Creative & Modern) */
                <div className="w-full max-w-none md:max-w-4xl flex gap-4">
                    {/* Creative AI Icon with Glow */}
                    <div className="shrink-0 mt-1 relative">
                        <div className="absolute inset-0 bg-primary/20 blur-md rounded-full" />
                        <div className="relative h-7 w-7 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center shadow-inner">
                            <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse-slow" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white/50">Cryonex AI</span>
                            {isStreaming && (
                                <span className="text-[10px] text-primary/70 animate-pulse uppercase tracking-wider font-mono">
                                    Thinking...
                                </span>
                            )}
                        </div>

                        {/* Attachments Grid (Grok-style) */}
                        {/* We need to pass attachments prop to NeoMessage first, let's assume it's passed or we parse it */}
                        {/* For now, let's check if there are markdown images and render them nicely */}

                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none break-words text-slate-300 text-[15px]">
                            <ReactMarkdown
                                components={{
                                    img({ node, src, alt, ...props }: any) {
                                        return (
                                            <div className="relative my-4 rounded-xl overflow-hidden border border-white/10 bg-black/20 group/image">
                                                <img
                                                    src={src}
                                                    alt={alt}
                                                    className="w-full max-w-md h-auto object-cover rounded-xl transition-transform duration-500 group-hover/image:scale-105"
                                                    {...props}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                                    <span className="text-xs text-white/80 font-medium truncate">{alt || "Image"}</span>
                                                </div>
                                            </div>
                                        );
                                    },
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || "");
                                        return !inline && match ? (
                                            <div className="relative group/code my-3 rounded-lg overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-lg shadow-black/20">
                                                <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 rounded-full bg-red-500/20" />
                                                        <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                                                        <div className="w-2 h-2 rounded-full bg-green-500/20" />
                                                        <span className="ml-2 text-[10px] font-mono text-white/40 uppercase">{match[1]}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
                                                            toast.success("Code copied");
                                                        }}
                                                        className="text-[10px] text-white/40 hover:text-white transition-colors"
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                                <pre className="p-3 overflow-x-auto custom-scrollbar bg-transparent m-0 text-sm font-mono leading-relaxed">
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                </pre>
                                            </div>
                                        ) : (
                                            <code className={cn("bg-white/10 rounded px-1 py-0.5 text-sm font-mono text-primary/90", className)} {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {displayedContent}
                            </ReactMarkdown>
                            {isStreaming && (
                                <span className="inline-block w-2 h-4 ml-0.5 align-middle bg-primary animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                            )}
                        </div>

                        {/* Sources Section */}
                        {sources && sources.length > 0 && !isStreaming && (
                            <div className="mt-4 pt-3 border-t border-white/5">
                                <p className="text-xs font-medium text-white/40 mb-2">Sources</p>
                                <div className="flex flex-wrap gap-2">
                                    {sources.map((source, idx) => (
                                        <a
                                            key={idx}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all"
                                        >
                                            <span className="text-[10px] text-white/30 group-hover:text-primary/50">{source.domain}</span>
                                            <span className="text-xs text-white/70 group-hover:text-white truncate max-w-[150px]">{source.title}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Minimal Actions Toolbar */}
                        {!isStreaming && (
                            <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-6 w-6 rounded-md text-white/30 hover:text-white hover:bg-white/5">
                                    <Copy className={cn("h-3 w-3", copied && "text-green-400")} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-white/30 hover:text-white hover:bg-white/5">
                                    <RefreshCw className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-white/30 hover:text-white hover:bg-white/5">
                                    <Share2 className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
}
