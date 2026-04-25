import type { ReactNode } from "react";
import { MessageSquare, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface StudyCopilotRailProps {
  title: string;
  activeTool: string;
  children: ReactNode;
}

const toolLabels: Record<string, string> = {
  chat: "Source-grounded chat",
  flashcards: "Flashcards",
  quizzes: "Quizzes",
  mindmap: "Concept map",
  gaps: "Knowledge gaps",
  notes: "Notebook notes",
  diagrams: "Image occlusion",
};

export function StudyCopilotRail({
  title,
  activeTool,
  children,
}: StudyCopilotRailProps) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-[#0d1117]">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-100 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-500/25 dark:bg-cyan-500/10 dark:text-cyan-200">
          <MessageSquare className="h-3.5 w-3.5" />
          Copilot
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{toolLabels[activeTool] || "Assistant"}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Stay with the source while you ask, test, and convert ideas into study actions.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:bg-white/5 dark:text-slate-300">
          <Sparkles className="h-3 w-3 text-sky-600" />
          {title}
        </div>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          activeTool === "chat" ? "bg-white dark:bg-[#0d1117]" : "bg-slate-50/80 dark:bg-white/[0.025]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
