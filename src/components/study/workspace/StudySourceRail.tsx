import { BookText, Clock3, FileText, Layers3, Sparkles } from "lucide-react";

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
  { id: "chat", label: "Copilot" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quizzes", label: "Quizzes" },
  { id: "mindmap", label: "Map" },
  { id: "gaps", label: "Gaps" },
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
    <div className="flex h-full flex-col bg-[#f8fafc]">
      <div className="border-b border-slate-200 px-4 py-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
          <FileText className="h-3.5 w-3.5" />
          Source
        </div>
        <h3 className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-slate-900">
          {title}
        </h3>
        <div className="mt-4 grid gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <BookText className="h-3.5 w-3.5 text-sky-600" />
            <span>{sourceWordCount.toLocaleString()} words</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock3 className="h-3.5 w-3.5 text-sky-600" />
            <span>{studyTime} studied</span>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 px-4 py-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          <Layers3 className="h-3.5 w-3.5" />
          Notebook flow
        </div>
        <div className="space-y-1.5">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onJumpToSection(section.id)}
              className="flex w-full items-start gap-3 rounded-2xl px-3 py-2 text-left transition-colors hover:bg-white"
            >
              <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-semibold text-slate-600">
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-medium text-slate-900">
                  {section.title}
                </span>
                <span className="block text-xs leading-5 text-slate-500">
                  {section.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 px-4 py-4">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
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
                "h-10 justify-start rounded-2xl border px-3 text-sm font-medium shadow-none",
                activeTool === tool.id
                  ? "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {tool.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
