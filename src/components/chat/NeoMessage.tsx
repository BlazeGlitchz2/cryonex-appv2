import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Share2, Sparkles, Check, ChevronDown, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { LinkPreview } from "@/components/ui/link-preview";
import { SourcePreviewProvider, SourceLink, SourceData, useSourcePreview } from "@/components/ui/source-preview";
import { IconCryonex } from "@/components/ui/icons/Web3Icons";


interface Source extends SourceData { }

interface NeoMessageProps {
    role: "user" | "assistant" | "system";
    content: string;
    userImage?: string;
    userName?: string;
    isStreaming?: boolean;
    timestamp?: number;
    sources?: Source[];
}

const ThinkingBlock = ({ content }: { content: string }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (!content) return null;

    return (
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
            >
                <Brain className="w-3 h-3" />
                <span>Thinking Process</span>
                <ChevronDown className={cn("w-3 h-3 ml-auto transition-transform", isOpen ? "rotate-180" : "")} />
            </button>
            {isOpen && (
                <div className="px-4 py-3 border-t border-white/5 bg-black/20">
                    <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-xs text-white/50 leading-relaxed font-mono whitespace-pre-wrap">{content}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export const NeoMessage = React.memo(function NeoMessage({ role, content, userImage, userName, isStreaming, timestamp, sources }: NeoMessageProps) {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);
    const [displayedContent, setDisplayedContent] = useState("");
    const contentRef = useRef(content);

    // Memoize processed content with injected images and thinking extraction
    const { finalContent, thinkingContent } = React.useMemo(() => {
        let rawContent = content.replace(/^\[(Search|Think|Canvas)\]\s*/i, "");
        let thinking = "";

        // Extract <think> block
        const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
            thinking = thinkMatch[1].trim();
            rawContent = rawContent.replace(/<think>[\s\S]*?<\/think>/, "").trim();
        }

        // Only insert images if not streaming and we have image sources
        if (!isStreaming && sources && sources.length > 0) {
            const imageSources = sources.filter(s => s.image);
            if (imageSources.length > 0) {
                const paragraphs = rawContent.split('\n\n');
                const newParagraphs = [];
                let imageIndex = 0;

                for (let i = 0; i < paragraphs.length; i++) {
                    newParagraphs.push(paragraphs[i]);

                    // Insert image after every 2 paragraphs if we have images left
                    // But avoid inserting at the very end if possible, unless it's the only content
                    if (imageIndex < imageSources.length && (i + 1) % 2 === 0) {
                        const src = imageSources[imageIndex];
                        newParagraphs.push(`![${src.title}](${src.image})`);
                        imageIndex++;
                    }
                }
                rawContent = newParagraphs.join('\n\n');
            }
        }
        return { finalContent: rawContent, thinkingContent: thinking };
    }, [content, isStreaming, sources]);

    // Typewriter effect logic
    useEffect(() => {
        if (isUser) {
            setDisplayedContent(finalContent);
            return;
        }

        const isRecent = timestamp && (Date.now() - timestamp < 10000);
        const shouldAnimate = isStreaming || (isRecent && displayedContent.length < finalContent.length);

        if (shouldAnimate) {
            if (finalContent.length > displayedContent.length) {
                const remaining = finalContent.length - displayedContent.length;
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
                    setDisplayedContent(finalContent.slice(0, displayedContent.length + chunkSize));
                }, delay);
                return () => clearTimeout(timeout);
            }
        } else {
            setDisplayedContent(finalContent);
        }
    }, [finalContent, isStreaming, displayedContent, isUser, timestamp]);

    // Pre-fetch sources when they become available
    const { preFetch } = useSourcePreview();
    useEffect(() => {
        if (sources && sources.length > 0 && !isStreaming) {
            preFetch(sources);
        }
    }, [sources, isStreaming, preFetch]);

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
            {/* User Message (Glassy Tech Pill) */}
            {isUser ? (
                <div className="max-w-[85%] md:max-w-[70%]">
                    <div className="relative bg-gradient-to-br from-[#1a1a2e]/80 to-[#16162a]/80 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-white/10 backdrop-blur-md group-hover:border-purple-500/30 transition-colors duration-300">
                        {/* Subtle Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl rounded-tr-sm opacity-50" />
                        <div className="relative z-10 whitespace-pre-wrap font-light tracking-wide">{displayedContent}</div>
                    </div>
                </div>
            ) : (
                /* AI Message (Holographic / Web 3) */
                <div className="w-full max-w-none md:max-w-4xl flex gap-5">
                    {/* 3D Orb Icon */}
                    <div className="shrink-0 mt-1 relative">
                        <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full animate-pulse" />
                        <div className="relative h-10 w-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-transparent" />
                            <IconCryonex className="h-5 w-5 text-cyan-300 relative z-10 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent tracking-wide drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                                Cryonex AI
                            </span>
                            {isStreaming && (
                                <span className="flex items-center gap-1.5 text-[10px] text-cyan-400/80 animate-pulse uppercase tracking-[0.2em] font-mono border border-cyan-500/20 px-2 py-0.5 rounded-full bg-cyan-950/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    Processing
                                </span>
                            )}
                        </div>

                        {/* Thinking Process Block */}
                        {thinkingContent && <ThinkingBlock content={thinkingContent} />}

                        {/* Enhanced Markdown Rendering (Cyberpunk Style) */}
                        <div className="prose prose-invert prose-sm md:prose-base max-w-none break-words text-slate-300 font-light">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Headings with Neon Underlines
                                    h1: ({ children }) => (
                                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 mt-8 mb-4 pb-2 border-b border-white/10 relative">
                                            {children}
                                            <div className="absolute bottom-0 left-0 w-20 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent" />
                                        </h1>
                                    ),
                                    h2: ({ children }) => <h2 className="text-xl font-bold text-white mt-6 mb-3 flex items-center gap-2"><span className="w-1 h-6 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]" />{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-lg font-semibold text-cyan-100/90 mt-5 mb-2">{children}</h3>,

                                    // Paragraphs
                                    p: ({ children }) => <p className="text-[15px] leading-7 text-slate-300/90 my-3">{children}</p>,

                                    // Bold & Italic
                                    strong: ({ children }) => <strong className="font-bold text-cyan-200 drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">{children}</strong>,
                                    em: ({ children }) => <em className="italic text-purple-300">{children}</em>,

                                    // Links (Holographic Buttons)
                                    a: ({ href, children }) => {
                                        const url = href || "";
                                        let domain = "";
                                        try {
                                            domain = new URL(url).hostname.replace('www.', '');
                                        } catch (e) {
                                            domain = "Source";
                                        }
                                        return (
                                            <SourceLink
                                                source={{ title: String(children), url, domain, snippet: "" }}
                                                className="group inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all no-underline mx-1 align-middle backdrop-blur-sm"
                                            >
                                                <span className="text-[10px] text-cyan-400/70 group-hover:text-cyan-400 font-mono">{domain}</span>
                                                <span className="text-xs text-white/80 group-hover:text-white truncate max-w-[150px]">{children}</span>
                                            </SourceLink>
                                        );
                                    },

                                    // Lists
                                    ul: ({ children }) => <ul className="list-none ml-2 my-3 space-y-2">{children}</ul>,
                                    li: ({ children }) => (
                                        <li className="flex gap-3 text-slate-300 leading-relaxed">
                                            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)] shrink-0" />
                                            <span>{children}</span>
                                        </li>
                                    ),

                                    // Blockquotes (Glass Panels)
                                    blockquote: ({ children }) => (
                                        <blockquote className="relative border-l-2 border-cyan-500/50 bg-gradient-to-r from-cyan-900/10 to-transparent pl-6 py-3 my-4 rounded-r-xl italic text-cyan-100/80">
                                            {children}
                                        </blockquote>
                                    ),

                                    // Tables (Data Grids)
                                    table: ({ children }) => (
                                        <div className="overflow-x-auto my-6 rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm shadow-xl">
                                            <table className="w-full text-sm">{children}</table>
                                        </div>
                                    ),
                                    thead: ({ children }) => <thead className="bg-white/5 border-b border-white/10">{children}</thead>,
                                    th: ({ children }) => <th className="px-5 py-3 text-left font-semibold text-cyan-100 uppercase tracking-wider text-xs">{children}</th>,
                                    td: ({ children }) => <td className="px-5 py-3 text-slate-300 border-b border-white/5">{children}</td>,

                                    // Code Blocks (Terminal Style)
                                    code: ({ node, inline, className, children, ...props }: any) => {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const language = match ? match[1] : "";
                                        const codeString = String(children).replace(/\n$/, "");

                                        if (!inline && (match || codeString.includes('\n'))) {
                                            return (
                                                <div className="relative group/code my-6 rounded-xl overflow-hidden border border-white/10 bg-[#05050a] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                                                    {/* Terminal Header */}
                                                    <div className="flex items-center justify-between px-4 py-2.5 bg-white/5 border-b border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex gap-1.5">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                                            </div>
                                                            {language && (
                                                                <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                                                                    {language}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(codeString);
                                                                toast.success("Code copied!");
                                                            }}
                                                            className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white transition-colors px-2.5 py-1 rounded-md hover:bg-white/10 font-medium"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                            COPY
                                                        </button>
                                                    </div>
                                                    {/* Syntax Highlighted Code */}
                                                    <SyntaxHighlighter
                                                        style={oneDark}
                                                        language={language || 'text'}
                                                        PreTag="div"
                                                        customStyle={{
                                                            margin: 0,
                                                            padding: '1.5rem',
                                                            background: 'transparent',
                                                            fontSize: '0.85rem',
                                                            lineHeight: '1.6',
                                                        }}
                                                        codeTagProps={{
                                                            style: {
                                                                fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                                                            }
                                                        }}
                                                    >
                                                        {codeString}
                                                    </SyntaxHighlighter>
                                                </div>
                                            );
                                        }

                                        // Inline code (Cyber Highlight)
                                        return (
                                            <code className="bg-purple-500/10 border border-purple-500/20 text-purple-200 rounded px-1.5 py-0.5 text-[13px] font-mono shadow-[0_0_10px_rgba(168,85,247,0.1)]" {...props}>
                                                {children}
                                            </code>
                                        );
                                    }
                                }}
                            >
                                {displayedContent}
                            </ReactMarkdown>
                            {isStreaming && (
                                <span className="inline-block w-2.5 h-5 ml-1 align-middle bg-cyan-400 rounded-[1px] animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                            )}
                        </div>

                        {/* Sources Section (Data Chips) */}
                        {sources && sources.length > 0 && !isStreaming && (
                            <div className="mt-6 pt-4 border-t border-white/5">
                                <p className="text-[10px] font-bold text-white/30 mb-3 uppercase tracking-[0.2em]">Referenced Data</p>
                                <div className="flex flex-wrap gap-2">
                                    {sources.map((source, idx) => (
                                        <SourceLink
                                            key={idx}
                                            source={source}
                                            className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all backdrop-blur-md"
                                        >
                                            <span className="text-[10px] text-cyan-400/50 group-hover:text-cyan-400 font-mono">{source.domain}</span>
                                            <span className="text-xs text-white/60 group-hover:text-white truncate max-w-[150px]">{source.title}</span>
                                        </SourceLink>
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
                                    className="h-7 px-2.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 gap-1.5"
                                >
                                    {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                                    <span className="text-[10px] font-medium uppercase tracking-wider">{copied ? "Copied" : "Copy"}</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 gap-1.5">
                                    <RefreshCw className="h-3 w-3" />
                                    <span className="text-[10px] font-medium uppercase tracking-wider">Retry</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2.5 rounded-lg text-white/30 hover:text-white hover:bg-white/5 gap-1.5">
                                    <Share2 className="h-3 w-3" />
                                    <span className="text-[10px] font-medium uppercase tracking-wider">Share</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </motion.div>
    );
});
