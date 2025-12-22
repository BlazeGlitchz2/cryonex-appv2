import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Share2, Sparkles, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { LinkPreview } from "@/components/ui/link-preview";

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

export const NeoMessage = React.memo(function NeoMessage({ role, content, userImage, userName, isStreaming, timestamp, sources }: NeoMessageProps) {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);
    const [displayedContent, setDisplayedContent] = useState("");
    const contentRef = useRef(content);

    // Strip prefixes for display
    const cleanContent = content.replace(/^\[(Search|Think|Canvas)\]\s*/i, "");

    // Typewriter effect logic
    useEffect(() => {
        if (isUser) {
            setDisplayedContent(cleanContent);
            return;
        }

        const isRecent = timestamp && (Date.now() - timestamp < 10000);
        const shouldAnimate = isStreaming || (isRecent && displayedContent.length < cleanContent.length);

        if (shouldAnimate) {
            if (cleanContent.length > displayedContent.length) {
                const remaining = cleanContent.length - displayedContent.length;
                let delay = 1;
                let chunkSize = 1;

                if (remaining > 500) {
                    chunkSize = 50;
                    delay = 1;
                } else if (remaining > 200) {
                    chunkSize = 20;
                    delay = 1;
                } else if (remaining > 50) {
                    chunkSize = 5;
                    delay = 2;
                } else {
                    chunkSize = 2;
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
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] text-white px-4 py-3 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-lg border border-white/5 backdrop-blur-sm">
                        <div className="whitespace-pre-wrap">{displayedContent}</div>
                    </div>
                </div>
            ) : (
                /* AI Message (Creative & Modern) */
                <div className="w-full max-w-none md:max-w-4xl flex gap-4">
                    {/* Creative AI Icon with Glow */}
                    <div className="shrink-0 mt-1 relative">
                        <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full animate-pulse" />
                        <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-primary/80 to-purple-600 border border-white/20 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Cryonex AI</span>
                            {isStreaming && (
                                <span className="flex items-center gap-1 text-[10px] text-primary/70 animate-pulse uppercase tracking-wider font-mono">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                    Thinking...
                                </span>
                            )}
                        </div>

                        {/* Enhanced Markdown Rendering */}
                        <div className="prose prose-invert prose-sm md:prose-base max-w-none break-words text-slate-300">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Headings
                                    h1: ({ children }) => <h1 className="text-2xl font-bold text-white mt-6 mb-3 pb-2 border-b border-white/10">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-5 mb-2">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-lg font-semibold text-white/90 mt-4 mb-2">{children}</h3>,

                                    // Paragraphs
                                    p: ({ children }) => <p className="text-[15px] leading-relaxed text-slate-300 my-2">{children}</p>,

                                    // Bold & Italic
                                    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                                    em: ({ children }) => <em className="italic text-purple-300">{children}</em>,
                                    del: ({ children }) => <del className="line-through text-white/50">{children}</del>,



                                    // ... inside NeoMessage component ...

                                    // Links
                                    a: ({ href, children }) => (
                                        <LinkPreview url={href || "#"}>
                                            {children}
                                        </LinkPreview>
                                    ),

                                    // Lists
                                    ul: ({ children }) => <ul className="list-disc list-outside ml-4 my-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-outside ml-4 my-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-slate-300 leading-relaxed">{children}</li>,

                                    // Blockquotes
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-4 border-primary/50 bg-primary/5 pl-4 py-2 my-3 rounded-r-lg italic text-white/80">
                                            {children}
                                        </blockquote>
                                    ),

                                    // Horizontal Rule
                                    hr: () => <hr className="my-4 border-white/10" />,

                                    // Tables
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-4 rounded-lg border border-white/10">
                                            <table className="w-full text-sm">{children}</table>
                                        </div>
                                    ),
                                    thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
                                    th: ({ children }) => <th className="px-4 py-2 text-left font-semibold text-white border-b border-white/10">{children}</th>,
                                    td: ({ children }) => <td className="px-4 py-2 text-slate-300 border-b border-white/5">{children}</td>,

                                    // Images
                                    img: ({ src, alt, ...props }: any) => (
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
                                    ),

                                    // Code blocks with syntax highlighting
                                    code: ({ node, inline, className, children, ...props }: any) => {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const language = match ? match[1] : "";
                                        const codeString = String(children).replace(/\n$/, "");

                                        if (!inline && (match || codeString.includes('\n'))) {
                                            return (
                                                <div className="relative group/code my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-xl shadow-black/30">
                                                    {/* Code Header */}
                                                    <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex gap-1.5">
                                                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                                            </div>
                                                            {language && (
                                                                <span className="ml-3 text-xs font-mono text-white/50 uppercase tracking-wider">
                                                                    {language}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(codeString);
                                                                toast.success("Code copied!");
                                                            }}
                                                            className="flex items-center gap-1 text-xs text-white/40 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                            Copy
                                                        </button>
                                                    </div>
                                                    {/* Syntax Highlighted Code */}
                                                    <SyntaxHighlighter
                                                        style={oneDark}
                                                        language={language || 'text'}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: 0,
                                                            padding: '1rem',
                                                            background: 'transparent',
                                                            fontSize: '0.875rem',
                                                        }}
                                                        codeTagProps={{
                                                            style: {
                                                                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                                            }
                                                        }}
                                                    >
                                                        {codeString}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );
                                        }

                                        // Inline code
                                        return (
                                            <code className="bg-white/10 text-pink-300 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {displayedContent}
                            </ReactMarkdown>
                            {isStreaming && (
                                <span className="inline-block w-2 h-5 ml-0.5 align-middle bg-primary rounded-sm animate-pulse shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                            )}
                        </div>

                        {/* Sources Section */}
                        {sources && sources.length > 0 && !isStreaming && (
                            <div className="mt-4 pt-3 border-t border-white/5">
                                <p className="text-xs font-semibold text-white/40 mb-2 uppercase tracking-wider">Sources</p>
                                <div className="flex flex-wrap gap-2">
                                    {sources.map((source, idx) => (
                                        <a
                                            key={idx}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 transition-all"
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCopy}
                                    className="h-7 px-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 gap-1"
                                >
                                    {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                    <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 gap-1">
                                    <RefreshCw className="h-3 w-3" />
                                    <span className="text-xs">Retry</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 gap-1">
                                    <Share2 className="h-3 w-3" />
                                    <span className="text-xs">Share</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
});
