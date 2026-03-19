import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Search,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  Loader2,
} from "lucide-react";
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
  resultsCount = 3,
}: SearchStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Timer for search duration
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, [isFinished]);

  return (
    <div className={cn("mb-3 w-full max-w-3xl font-sans", className)}>
      <div className="overflow-hidden rounded-[1.55rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(36,24,80,0.42),rgba(12,8,36,0.68))] shadow-[0_18px_40px_rgba(4,2,20,0.2)] backdrop-blur-xl transition-all duration-300">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
        >
          <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
            {isFinished ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            ) : (
              <>
                <Globe className="h-4 w-4 text-cyan-300 animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-[spin_3s_linear_infinite]" />
              </>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium text-white/82">
                {isFinished ? "Search Complete" : "Searching The Web"}
              </span>
              {!isFinished && (
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/85 animate-bounce [animation-delay:-0.24s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/75 animate-bounce [animation-delay:-0.12s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/65 animate-bounce" />
                </span>
              )}
            </div>
            <span className="block truncate pt-0.5 text-[12px] text-white/44">
              "{query}"
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-3 pl-2 text-[11px] text-white/34">
            {!isFinished && <span>{elapsed.toFixed(1)}s</span>}
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-white/[0.06] bg-black/12"
            >
              <div className="space-y-2 px-4 pb-4 pt-3">
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
      </div>
    </div>
  );
}

function LogItem({
  text,
  status,
}: {
  text: string;
  status: "pending" | "loading" | "complete";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs transition-colors",
        status === "pending" ? "text-white/20" : "text-white/60",
      )}
    >
      {status === "loading" && (
        <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
      )}
      {status === "complete" && (
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      )}
      {status === "pending" && (
        <div className="w-3 h-3 rounded-full border border-white/10" />
      )}
      <span>{text}</span>
    </div>
  );
}
