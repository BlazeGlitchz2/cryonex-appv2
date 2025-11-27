import { motion } from "framer-motion";
import React from "react";

type ThinkingChainProps = {
  lines?: Array<string>;
  className?: string;
};

export function ThinkingChain({
  lines,
  className,
}: ThinkingChainProps) {
  const steps: Array<string> =
    lines && lines.length > 0
      ? lines
      : [
          "Embedding your question",
          "Searching similar chunks",
          "Ranking by relevance",
          "Composing answer",
          "Adding citations",
        ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.28 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className={`rounded-lg p-3 bg-[#1a1a1a] border border-[#2a2a2a] ${className || ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs uppercase tracking-wider text-[#7c7c7c]">Thinking chain</span>
        <span className="relative inline-flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-60"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400"></span>
        </span>
      </div>

      <motion.ul
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-1.5"
      >
        {steps.map((s, i) => (
          <motion.li
            key={i}
            variants={item}
            className="flex items-start gap-2 text-xs text-[#cfcfcf]"
          >
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-400/80 shrink-0" />
            <span className="leading-relaxed">{s}</span>
          </motion.li>
        ))}
      </motion.ul>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded bg-[#111]">
        <div className="h-full w-1/3 animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </div>

      <style>
        {`@keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }`}
      </style>
    </div>
  );
}
