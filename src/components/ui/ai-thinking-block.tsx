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
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number>(Date.now());

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
        "my-3 w-full max-w-3xl",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[1.55rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(38,22,86,0.42),rgba(16,8,42,0.72))] shadow-[0_18px_40px_rgba(4,2,20,0.22)] backdrop-blur-xl">
        <button
          onClick={toggle}
          className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors",
                isFinished
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
              )}
            >
              {isFinished ? (
                <Brain className="h-4 w-4" />
              ) : (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white/82 transition-colors group-hover:text-white">
                  {isFinished ? "Reasoned Response" : "Reasoning"}
                </span>
                {!isFinished && (
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/85 animate-bounce [animation-delay:-0.24s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/75 animate-bounce [animation-delay:-0.12s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/65 animate-bounce" />
                  </div>
                )}
              </div>
              <p className="truncate pt-0.5 text-[10px] uppercase tracking-[0.24em] text-white/34">
                {isFinished ? "Expand to inspect reasoning" : "Visible only for harder prompts"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 pl-2">
            <span className="text-[11px] font-medium text-white/34">
              {elapsedTime}s
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-white/34 transition-transform duration-300",
                isExpanded ? "rotate-180" : "rotate-0",
              )}
            />
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="border-t border-white/[0.06] bg-black/12"
            >
              <div className="max-h-[280px] overflow-y-auto px-4 pb-4 pt-3 text-[13px] leading-6 text-white/66 whitespace-pre-wrap custom-scrollbar">
                {thinking}
                {!isFinished && (
                  <span className="ml-1 inline-block h-4 w-1.5 animate-pulse rounded-full bg-cyan-400/45 align-middle" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
