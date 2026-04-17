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
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
          <MessageSquare className="h-3.5 w-3.5" />
          Copilot
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">{toolLabels[activeTool] || "Assistant"}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Stay with the source while you ask, test, and convert ideas into study actions.
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          <Sparkles className="h-3 w-3 text-sky-600" />
          {title}
        </div>
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          activeTool === "chat" ? "bg-white" : "bg-slate-50/80",
        )}
      >
        {children}
      </div>
    </div>
  );
}
