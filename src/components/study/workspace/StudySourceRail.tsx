import { BookText, Brain, Clock3, FileText, Layers3, ListChecks, MessageSquare, Network, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  StudyWorkspaceSection,
  StudyWorkspaceSectionId,
} from "./study-workspace-sections";

interface StudySourceRailProps {
  title: string;
  sourceWordCount: number;
  studyTime: string;
  sections: StudyWorkspaceSection[];
  onJumpToSection: (sectionId: StudyWorkspaceSectionId) => void;
  activeTool: string;
  onOpenTool: (tool: string) => void;
}

const tools = [
  { id: "chat", label: "Copilot", icon: MessageSquare },
  { id: "flashcards", label: "Flashcards", icon: Brain },
  { id: "quizzes", label: "Quizzes", icon: ListChecks },
  { id: "mindmap", label: "Map", icon: Network },
  { id: "gaps", label: "Gaps", icon: Sparkles },
] as const;

export function StudySourceRail({
  title,
  sourceWordCount,
  studyTime,
  sections,
  onJumpToSection,
  activeTool,
  onOpenTool,
}: StudySourceRailProps) {
  return (
    <div className="flex h-full flex-col bg-[linear-gradient(180deg,#f8fafc,#eef6f2)] text-slate-900 dark:bg-[linear-gradient(180deg,#0f172a,#111827)] dark:text-slate-100">
      <div className="border-b border-slate-200 px-4 py-5 dark:border-white/10">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase text-slate-600 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <FileText className="h-3.5 w-3.5" />
          Source
        </div>
        <h3 className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-slate-900 dark:text-white">
          {title}
        </h3>
        <div className="mt-4 grid gap-2 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <BookText className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />
            <span>{sourceWordCount.toLocaleString()} words</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-300" />
            <span>{studyTime} studied</span>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 px-4 py-4 dark:border-white/10">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
          <Layers3 className="h-3.5 w-3.5" />
          Notebook flow
        </div>
        <div className="space-y-1.5">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onJumpToSection(section.id)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-2xl border px-3 py-2 text-left transition-all",
                "border-transparent hover:border-slate-200 hover:bg-white dark:hover:border-white/10 dark:hover:bg-white/5",
              )}
            >
              <span className={cn(
                "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold transition-colors",
                index === 0
                  ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200"
                  : "border-slate-200 bg-white text-slate-600 group-hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300",
              )}>
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  {section.title}
                </span>
                <span className="block text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {section.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-4 py-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
          <Sparkles className="h-3.5 w-3.5" />
          Quick tools
        </div>
        <div className="flex flex-col gap-2">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              type="button"
              variant="ghost"
              onClick={() => onOpenTool(tool.id)}
              className={cn(
                "h-10 justify-start rounded-2xl border px-3 text-sm font-medium shadow-none transition-all",
                activeTool === tool.id
                  ? "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10",
              )}
            >
              <tool.icon className="mr-2 h-4 w-4" />
              {tool.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
