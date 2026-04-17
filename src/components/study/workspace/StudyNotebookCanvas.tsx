import type { ReactNode } from "react";
import { BookOpen, Brain, ListChecks, MessageSquare, Network, StickyNote } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type {
  StudyWorkspaceSection,
  StudyWorkspaceSectionId,
} from "./study-workspace-sections";

interface StudyNotebookCanvasProps {
  title: string;
  sections: StudyWorkspaceSection[];
  activeTool: string;
  onOpenTool: (tool: string) => void;
  sectionSlots?: Partial<Record<StudyWorkspaceSectionId, ReactNode>>;
}

const quickActions = [
  { id: "chat", label: "Ask AI", icon: MessageSquare },
  { id: "flashcards", label: "Flashcards", icon: Brain },
  { id: "quizzes", label: "Quiz", icon: ListChecks },
  { id: "mindmap", label: "Map", icon: Network },
  { id: "notes", label: "Notes", icon: StickyNote },
] as const;

function statusClasses(status: string) {
  if (status === "available") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "loading") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

export function StudyNotebookCanvas({
  title,
  sections,
  activeTool,
  onOpenTool,
  sectionSlots,
}: StudyNotebookCanvasProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(248,250,252,0.98))]">
      <div className="border-b border-slate-200/80 bg-white/90 px-6 py-5 backdrop-blur-xl lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">
              <BookOpen className="h-3.5 w-3.5" />
              Notebook
            </div>
            <div>
              <h2 className="max-w-3xl text-2xl font-semibold tracking-tight text-slate-950 lg:text-[2rem]">
                {title}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Study in one continuous thread. Keep the source close, let the copilot stay quiet,
                and open power tools only when you need them.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                type="button"
                variant="ghost"
                onClick={() => onOpenTool(action.id)}
                className={cn(
                  "h-9 rounded-full border px-4 text-xs font-medium shadow-none transition-colors",
                  activeTool === action.id
                    ? "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950",
                )}
              >
                <action.icon className="mr-2 h-3.5 w-3.5" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-5">
          {sections.map((section) => (
            <section
              key={section.id}
              id={`notebook-section-${section.id}`}
              className="rounded-[28px] border border-slate-200/80 bg-white px-5 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] lg:px-7 lg:py-6"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                      {section.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                      {section.description}
                    </p>
                  </div>

                  {section.items.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {section.items.map((item) => (
                        <div
                          key={`${section.id}-${item.label}`}
                          className={cn(
                            "rounded-full border px-3 py-1 text-[11px] font-medium",
                            statusClasses(item.status),
                          )}
                        >
                          <span className="font-semibold">{item.label}</span>
                          <span className="mx-1 text-current/50">·</span>
                          <span>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {sectionSlots?.[section.id] ? (
                  <div>{sectionSlots[section.id]}</div>
                ) : (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-700">
                    {section.content}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
