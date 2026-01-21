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
    model?: string;
}

import { ThinkingProcess } from "./ThinkingProcess";
import { AIChatMessage } from "./AIChatMessage";

export const NeoMessage = React.memo(function NeoMessage({ role, content, userImage, userName, isStreaming, timestamp, sources, model }: NeoMessageProps) {
    const isUser = role === "user";
    const [copied, setCopied] = useState(false);
    const [displayedContent, setDisplayedContent] = useState("");
    const contentRef = useRef(content);

    // Check if model is a reasoning model
    const isReasoningModel = React.useMemo(() => {
        if (!model) return false;
        const lowerModel = model.toLowerCase();
        return lowerModel.includes("reasoner") || lowerModel.includes("r1") || lowerModel.includes("deepseek-reasoner");
    }, [model]);

    // Memoize processed content with injected images and thinking extraction
    const { finalContent, thinkingContent } = React.useMemo(() => {
        let rawContent = content;
        let thinking = "";

        // 1. Extract Thinking Block (<think>)
        const thinkRegex = /<think(?:\s+[^>]*)?>([\s\S]*?)<\/think>/i;
        const openThinkRegex = /<think(?:\s+[^>]*)?>([\s\S]*)$/i;

        const completeThinkMatch = rawContent.match(thinkRegex);
        const openThinkMatch = rawContent.match(openThinkRegex);

        if (completeThinkMatch) {
            thinking = completeThinkMatch[1].trim();
            // Remove the thinking block from the content
            rawContent = rawContent.replace(thinkRegex, "").trim();
        } else if (openThinkMatch) {
            thinking = openThinkMatch[1].trim();
            // If the tag is still open, we are currently thinking.
            // We show the thinking content, but the final content is empty/waiting.
            rawContent = "";
        }

        // 2. Clean up Thinking Content
        // Remove any nested tags or residual artifacts from the thinking block
        thinking = thinking.replace(/<\/?(think|final_answer)(?:\s+[^>]*)?>/gi, "").trim();

        // 3. Clean up Final Content
        // Remove <final_answer> tags if present (sometimes models add them)
        rawContent = rawContent.replace(/<\/?final_answer(?:\s+[^>]*)?>/gi, "").trim();

        // 4. Normalize Math Delimiters
        const normalizeMath = (str: string) => {
            return str
                .replace(/\\\[/g, "$$")
                .replace(/\\\]/g, "$$")
                .replace(/\\\(/g, "$")
                .replace(/\\\)/g, "$");
        };

        // 5. Highlight Processing (==text== -> <mark>text</mark>)
        const processHighlights = (str: string) => {
            return str.replace(/==([^=]+)==/g, "<mark>$1</mark>");
        };

        rawContent = normalizeMath(rawContent);
        rawContent = processHighlights(rawContent);
        thinking = normalizeMath(thinking);

        // Only insert images if not streaming and we have image sources
        if (!isStreaming && sources && sources.length > 0) {
            const imageSources = sources.filter(s => s.image);
            if (imageSources.length > 0) {
                const paragraphs = rawContent.split('\n\n');
                const newParagraphs = [];
                let imageIndex = 0;

                for (let i = 0; i < paragraphs.length; i++) {
                    newParagraphs.push(paragraphs[i]);

                    if (imageIndex < imageSources.length && (i + 1) % 2 === 0) {
                        const src = imageSources[imageIndex];
                        newParagraphs.push(`![${src.title}](${src.image})`);
                        imageIndex++;
                    }
                }
                rawContent = newParagraphs.join('\n\n');
            }
        }

        // Filter out [Search] tag for display
        rawContent = rawContent.replace(/^\[Search\]\s*/i, "");



        return {
            finalContent: rawContent,
            thinkingContent: thinking.trim().length > 0 ? thinking.trim() : undefined
        };
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
                /* AI Message (Premium Render) */
                <div className="w-full max-w-none md:max-w-4xl flex gap-5">
                    {/* 3D Orb Icon */}
                    <div className="shrink-0 mt-1 relative">
                        <div className="absolute inset-0 bg-cyan-500/30 blur-xl rounded-full animate-pulse" />
                        <div className="relative h-10 w-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-purple-500/20 to-transparent" />
                            <IconCryonex className="h-5 w-5 text-cyan-300 relative z-10 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]" />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 relative group/message">
                        {/* Message Glow Background */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-transparent rounded-xl opacity-0 group-hover/message:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl" />

                        <div className="flex items-center gap-3 mb-2 relative z-10">
                            <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent tracking-wide drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                                Cryonex AI
                            </span>
                            {isStreaming && thinkingContent && isReasoningModel && (
                                <span className="flex items-center gap-1.5 text-[10px] text-cyan-400/80 animate-pulse uppercase tracking-[0.2em] font-mono border border-cyan-500/20 px-2 py-0.5 rounded-full bg-cyan-950/30">
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                                    Processing
                                </span>
                            )}
                        </div>

                        {thinkingContent && isReasoningModel && (
                            <ThinkingProcess
                                thinking={thinkingContent}
                                isFinished={!isStreaming || !!displayedContent}
                                className="mb-4"
                            />
                        )}

                        <AIChatMessage
                            content={displayedContent}
                            isStreaming={isStreaming}
                        />

                        {/* Sources Section (Data Chips) */}
                        {sources && sources.length > 0 && !isStreaming && (
                            <div className="mt-4 pt-4 border-t border-white/5">
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
                    </div>
                </div>
            )}
        </motion.div >
    );
});
