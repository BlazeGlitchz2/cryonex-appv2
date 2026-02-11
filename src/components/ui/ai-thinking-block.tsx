"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Brain, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIThinkingBlockProps {
  thinking: string;
  isFinished?: boolean;
  className?: string;
}

export default function AIThinkingBlock({
  thinking,
  isFinished = false,
  className,
}: AIThinkingBlockProps) {
  // Always expand if not finished to show the process
  const [isExpanded, setIsExpanded] = useState(!isFinished);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-expand/collapse logic
  useEffect(() => {
    if (!isFinished) {
      // If thinking starts, expand
      setIsExpanded(true);
    } else {
      // When finished, only collapse if it was a very long thought process to save space, 
      // OR keep it open but user can toggle. 
      // User request: "pushes out Text" implies it might stay visible or transition nicely.
      // Let's collapse it to show the "pushing out" effect where detail is hidden but summary remains.
      const timer = setTimeout(() => setIsExpanded(false), 500); // Slight delay to read last bit
      return () => clearTimeout(timer);
    }
  }, [isFinished]);

  // Timer logic
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Auto-scroll to bottom while thinking
  useEffect(() => {
    if (isExpanded && !isFinished && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thinking, isExpanded, isFinished]);


  const toggle = () => setIsExpanded(!isExpanded);

  // Don't render anything if no thinking content and finished (unless we want to show history)
  if (!thinking && isFinished) return null;

  return (
    <div
      className={cn(
        "my-4 rounded-xl overflow-hidden border transition-all duration-300",
        isFinished
          ? "border-purple-500/20 bg-purple-500/5"
          : "border-cyan-500/30 bg-black/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]",
        className,
      )}
    >
      {/* Header / Summary */}
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "p-1.5 rounded-lg transition-colors flex items-center justify-center",
              isFinished
                ? "bg-purple-500/20 text-purple-300"
                : "bg-cyan-500/20 text-cyan-300",
            )}
          >
            {isFinished ? (
              <Brain className="w-3.5 h-3.5" />
            ) : (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            )}
          </div>

          <div className="flex flex-col items-start text-left">
            <span className={cn(
              "text-sm font-semibold transition-colors",
              isFinished ? "text-purple-200" : "text-cyan-200"
            )}>
              {isFinished ? "Reasoning Complete" : "Thinking..."}
            </span>
            {isFinished && (
              <span className="text-[10px] text-white/40 font-mono">
                Processed in {elapsedTime}s
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isFinished && (
            <span className="text-xs font-mono text-cyan-400/70 animate-pulse">
              {elapsedTime}s
            </span>
          )}
          <ChevronDown
            className={cn(
              "w-4 h-4 text-white/40 transition-transform duration-300",
              isExpanded ? "rotate-180" : "rotate-0",
            )}
          />
        </div>
      </button>

      {/* Content Body - The "Typography" Section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }} // Smooth "push" easing
          >
            <div className="border-t border-white/5 bg-[#0a0a0a]">
              <div
                ref={scrollRef}
                className="p-4 text-xs md:text-sm font-mono text-white/60 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar selection:bg-purple-500/30 font-feature-settings-zero"
                style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
              >
                {/* Thinking Stream Indication */}
                {!isFinished && (
                  <div className="flex items-center gap-2 mb-2 text-cyan-500/50 text-[10px] uppercase tracking-wider font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Generating Thought Stream...</span>
                  </div>
                )}

                {thinking}

                {!isFinished && (
                  <span className="inline-block w-2 h-4 ml-1 align-middle bg-cyan-500/50 animate-pulse" />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
