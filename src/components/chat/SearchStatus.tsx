
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Search, ChevronDown, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchStatusProps {
    query: string;
    isFinished?: boolean;
    className?: string;
    resultsCount?: number;
}

export function SearchStatus({
    query,
    isFinished = false,
    className,
    resultsCount = 3
}: SearchStatusProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    // Timer for search duration
    useEffect(() => {
        if (isFinished) return;
        const interval = setInterval(() => {
            setElapsed(prev => prev + 0.1);
        }, 100);
        return () => clearInterval(interval);
    }, [isFinished]);

    return (
        <div className={cn("w-full max-w-lg mb-4 font-sans", className)}>
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/20 backdrop-blur-md transition-all duration-300">

                {/* Main Status Bar */}
                <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {/* Icon State */}
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10">
                        {isFinished ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                            <>
                                <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
                                <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-[spin_3s_linear_infinite]" />
                            </>
                        )}
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white/90 truncate">
                                {isFinished ? "Finished searching" : "Searching the web"}
                            </span>
                            {!isFinished && (
                                <span className="flex gap-0.5">
                                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-bounce" />
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-white/50 truncate max-w-[250px]">
                            "{query}"
                        </span>
                    </div>

                    {/* Right Side Info */}
                    <div className="flex items-center gap-2 text-xs text-white/40">
                        {!isFinished && <span>{elapsed.toFixed(1)}s</span>}
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                </div>

                {/* Expanded Details (Progress Logs) */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-white/5 bg-black/20"
                        >
                            <div className="p-3 space-y-2">
                                <LogItem
                                    text={`Searching Google for "${query}"`}
                                    status="complete"
                                />
                                <LogItem
                                    text="Analyzing search results"
                                    status={isFinished ? "complete" : "loading"}
                                />
                                <LogItem
                                    text={`Found ${resultsCount}+ relevant sources`}
                                    status={isFinished ? "complete" : "pending"}
                                />
                                <LogItem
                                    text="Reading content"
                                    status={isFinished ? "complete" : "pending"}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading Progress Bar (Bottom) */}
                {!isFinished && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 overflow-hidden">
                        <motion.div
                            className="h-full bg-cyan-500/50"
                            initial={{ x: "-100%" }}
                            animate={{ x: "100%" }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function LogItem({ text, status }: { text: string, status: "pending" | "loading" | "complete" }) {
    return (
        <div className={cn(
            "flex items-center gap-2 text-xs transition-colors",
            status === "pending" ? "text-white/20" : "text-white/60"
        )}>
            {status === "loading" && <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />}
            {status === "complete" && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
            {status === "pending" && <div className="w-3 h-3 rounded-full border border-white/10" />}
            <span>{text}</span>
        </div>
    );
}
