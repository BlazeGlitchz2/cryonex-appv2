"use client";

import { Card } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Brain, Sparkles, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIThinkingBlockProps {
    thinking: string;
    isFinished?: boolean;
}

const REASONING_STEPS = [
    "Understanding request",
    "Analyzing context",
    "Planning approach",
    "Checking constraints",
    "Preparing response"
];

export default function AIThinkingBlock({ thinking, isFinished = false }: AIThinkingBlockProps) {
    const [isExpanded, setIsExpanded] = useState(!isFinished);
    const [showRaw, setShowRaw] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [timer, setTimer] = useState(0);

    // Timer logic
    useEffect(() => {
        if (isFinished) return;
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isFinished]);

    // Step cycling logic
    useEffect(() => {
        if (isFinished) return;
        const interval = setInterval(() => {
            setCurrentStep((prev) => (prev + 1) % REASONING_STEPS.length);
        }, 2500);
        return () => clearInterval(interval);
    }, [isFinished]);

    // Auto-collapse when finished
    useEffect(() => {
        if (isFinished) {
            const timeout = setTimeout(() => setIsExpanded(false), 1500);
            return () => clearTimeout(timeout);
        }
    }, [isFinished]);

    return (
        <div className="w-full max-w-2xl my-4">
            <Card className={cn(
                "overflow-hidden border transition-all duration-500 backdrop-blur-md",
                isFinished ? "bg-white/5 border-white/5" : "bg-black/40 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
            )}>
                {/* Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-3">
                        {isFinished ? (
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                        ) : (
                            <div className="relative flex items-center justify-center w-6 h-6">
                                <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping" />
                                <Brain className="w-3.5 h-3.5 text-purple-400 relative z-10" />
                            </div>
                        )}

                        <div className="flex flex-col">
                            <span className={cn("text-sm font-medium transition-colors", isFinished ? "text-white/40" : "text-purple-200")}>
                                {isFinished ? "Thought Process" : "Reasoning"}
                            </span>
                            {!isFinished && (
                                <span className="text-[10px] text-purple-400/60 font-mono uppercase tracking-wider">
                                    {timer}s elapsed
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {isExpanded && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowRaw(!showRaw);
                                }}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                                title={showRaw ? "Hide details" : "Show details"}
                            >
                                {showRaw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        )}
                        <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isExpanded && "rotate-180")} />
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                            <div className="px-4 pb-4 pt-0">
                                {/* Abstract Visualization */}
                                {!showRaw && !isFinished && (
                                    <div className="relative h-32 w-full my-2 rounded-lg bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent animate-[shimmer_3s_infinite_linear]" />

                                        {/* Neural Nodes Animation */}
                                        <div className="flex items-center gap-8">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-3 h-3 rounded-full bg-purple-500/40"
                                                    animate={{
                                                        scale: [1, 1.5, 1],
                                                        opacity: [0.4, 1, 0.4],
                                                    }}
                                                    transition={{
                                                        duration: 2,
                                                        repeat: Infinity,
                                                        delay: i * 0.4,
                                                        ease: "easeInOut"
                                                    }}
                                                >
                                                    <div className="absolute inset-0 rounded-full bg-purple-400 blur-sm" />
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Connecting Lines */}
                                        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                                            <motion.path
                                                d="M 0 64 Q 150 20 300 64 T 600 64"
                                                fill="none"
                                                stroke="url(#gradient)"
                                                strokeWidth="2"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            />
                                            <defs>
                                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="transparent" />
                                                    <stop offset="50%" stopColor="#a855f7" />
                                                    <stop offset="100%" stopColor="transparent" />
                                                </linearGradient>
                                            </defs>
                                        </svg>

                                        {/* Status Text */}
                                        <div className="absolute bottom-3 left-0 right-0 text-center">
                                            <AnimatePresence mode="wait">
                                                <motion.p
                                                    key={currentStep}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -5 }}
                                                    className="text-xs font-medium text-purple-300/80 uppercase tracking-widest"
                                                >
                                                    {REASONING_STEPS[currentStep]}
                                                </motion.p>
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                )}

                                {/* Raw Content (Optional) */}
                                {(showRaw || isFinished) && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-2 pl-4 border-l-2 border-purple-500/20"
                                    >
                                        <p className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                                            {thinking}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Progress Bar (Indeterminate) */}
                {!isFinished && (
                    <div className="h-0.5 w-full bg-purple-900/20 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-transparent via-purple-500 to-transparent w-[50%]"
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}
