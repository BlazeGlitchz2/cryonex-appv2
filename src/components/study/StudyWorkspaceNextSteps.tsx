import {
  Brain,
  Download,
  FileText,
  ListChecks,
  MessageSquare,
  Network,
  Sparkles,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildStudyWorkspaceFlow } from "@/lib/study-workspace-flow";

interface StudyWorkspaceNextStepsProps {
  user: any;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  sourceTitle: string;
  sourceWordCount: number;
  recommendations?: any;
  osState?: any;
  hasSummary?: boolean;
  flashcardsCount?: number;
  reviewedFlashcardsCount?: number;
  masteredFlashcardsCount?: number;
  quizzesCount?: number;
  quizQuestionCount?: number;
  compact?: boolean;
  onDownloadWorksheet?: () => void;
}

const regionLabel: Record<string, string> = {
  ksa: "Saudi",
  egypt: "Egypt",
  uae: "UAE",
  qatar: "Qatar",
  kuwait: "Kuwait",
  bahrain: "Bahrain",
  oman: "Oman",
};

export function StudyWorkspaceNextSteps({
  user,
  activeTab,
  onSelectTab,
  sourceTitle,
  sourceWordCount,
  recommendations,
  osState,
  hasSummary,
  flashcardsCount = 0,
  reviewedFlashcardsCount = 0,
  masteredFlashcardsCount = 0,
  quizzesCount = 0,
  quizQuestionCount = 0,
  compact = false,
  onDownloadWorksheet,
}: StudyWorkspaceNextStepsProps) {
  const curriculum =
    user?.curriculumTrack || user?.curriculum || "general";
  const flow = buildStudyWorkspaceFlow({
    hasSummary,
    osState,
    recommendations,
    sourceTitle,
    sourceWordCount,
  });

  const actions = [
    { id: "summary", label: hasSummary ? "Refine summary" : "Build summary", icon: FileText },
    { id: "chat", label: "Ask source-linked AI", icon: MessageSquare },
    {
      id: "flashcards",
      label:
        flashcardsCount > 0
          ? `Review ${Math.max(0, flashcardsCount - masteredFlashcardsCount)} cards`
          : "Generate flashcards",
      icon: Brain,
    },
    {
      id: "quizzes",
      label:
        quizzesCount > 0
          ? `Practice ${quizQuestionCount} questions`
          : "Generate quiz",
      icon: ListChecks,
    },
    { id: "notes", label: "Rewrite as notes", icon: StickyNote },
    { id: "gaps", label: "Find weak spots", icon: Network },
  ];

  return (
    <div
      className={cn(
        "m-3 flex flex-col gap-3 rounded-3xl border border-slate-200/80 bg-white/88 px-4 text-slate-900 shadow-[0_12px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-50",
        compact ? "py-3" : "py-4",
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-300">
              <Sparkles className="h-3 w-3" />
              Student OS
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {flow.badge}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight sm:text-base">
              {flow.label}
            </h3>
            <button
              type="button"
              onClick={() => onSelectTab(flow.targetTab)}
              className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-[0_10px_24px_rgba(6,182,212,0.18)] transition-colors hover:bg-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
            >
              Open now
            </button>
          </div>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600 dark:text-slate-300">
            {flow.reason}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {sourceTitle || "Untitled material"}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {sourceWordCount.toLocaleString()} words
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {reviewedFlashcardsCount}/{flashcardsCount} cards reviewed
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {quizzesCount} quiz sets
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {user?.region ? regionLabel[user.region] || user.region : "Global"}
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            {curriculum}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
        {actions.map((action) => {
          const isActive = activeTab === action.id;
          const isRecommended = flow.targetTab === action.id;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelectTab(action.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold transition-colors",
                isActive
                  ? "border-sky-200 bg-sky-50 text-sky-700 dark:border-cyan-500/40 dark:bg-cyan-500/15 dark:text-cyan-200"
                  : isRecommended
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10",
              )}
            >
              <action.icon className="h-3 w-3" />
              <span>{action.label}</span>
            </button>
          );
        })}
        {onDownloadWorksheet && (
          <button
            type="button"
            onClick={onDownloadWorksheet}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-cyan-700 transition-colors hover:bg-cyan-50 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
          >
            <Download className="h-3 w-3" />
            <span>Worksheet</span>
          </button>
        )}
      </div>
    </div>
  );
}
