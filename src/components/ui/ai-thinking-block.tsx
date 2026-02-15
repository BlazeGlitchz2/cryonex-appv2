"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Brain, Loader2 } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(!isFinished);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-expand when thinking updates if not finished
  useEffect(() => {
    if (!isFinished) {
      setIsExpanded(true);
    } else {
      // Optional: Auto-collapse when finished, or keep open based on preference.
      // For now, let's keep it open if it was short, or collapse if long.
      // Actually, usually users want to see the answer, so collapsing is good.
      setIsExpanded(false);
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

  // Manual toggle
  const toggle = () => setIsExpanded(!isExpanded);

  return (
    <div
      className={cn(
        "my-4 rounded-xl overflow-hidden border border-white/10 bg-black/20",
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
              "p-1.5 rounded-lg transition-colors",
              isFinished
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-cyan-500/10 text-cyan-400",
            )}
          >
            {isFinished ? (
              <Brain className="w-4 h-4" />
            ) : (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
          </div>
          <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
            {isFinished ? "Thought Process" : "Thinking..."}
          </span>
          <span className="text-xs text-white/40 font-mono ml-1">
            {isFinished ? `~${elapsedTime}s` : `${elapsedTime}s`}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-white/40 transition-transform duration-300",
            isExpanded ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {/* Content Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="border-t border-white/5 bg-black/40">
              <div className="p-4 text-sm font-mono text-white/70 leading-relaxed whitespace-pre-wrap max-h-[400px] overflow-y-auto custom-scrollbar">
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
