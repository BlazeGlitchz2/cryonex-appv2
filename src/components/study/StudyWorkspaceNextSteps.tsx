import { Brain, Download, ListChecks, MessageSquare, Network, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyWorkspaceNextStepsProps {
  user: any;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  sourceTitle: string;
  sourceWordCount: number;
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
  compact = false,
  onDownloadWorksheet,
}: StudyWorkspaceNextStepsProps) {
  const curriculum =
    user?.curriculumTrack || user?.curriculum || "general";

  const actions = [
    { id: "chat", label: "Ask source-linked AI", icon: MessageSquare },
    { id: "flashcards", label: "Build flashcards", icon: Brain },
    { id: "quizzes", label: "Run adaptive quiz", icon: ListChecks },
    { id: "gaps", label: "Find weak spots", icon: Network },
  ];

  return (
    <div
      className={cn(
        "flex items-center gap-3 overflow-x-auto rounded-[24px] border border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur-md",
      )}
    >
      <div className="flex shrink-0 items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-sky-600" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700">
          Workspace
        </span>
      </div>

      <div className="h-4 w-px shrink-0 bg-slate-200" />

      <p className="max-w-[180px] shrink-0 truncate text-[11px] text-slate-500 sm:max-w-[260px]">
        {sourceTitle || "Untitled material"}
        <span className="mx-1.5 text-slate-300">·</span>
        {sourceWordCount.toLocaleString()}w
      </p>

      <div className="h-4 w-px shrink-0 bg-slate-200" />

      <div className="flex shrink-0 items-center gap-1.5">
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
          {user?.region ? regionLabel[user.region] || user.region : "Global"}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
          {curriculum}
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
          {user?.isRTL ? "RTL" : "LTR"}
        </span>
      </div>

      <div className="flex-1" />

      <div className="flex shrink-0 items-center gap-1.5">
        {actions.map((action) => {
          const isActive = activeTab === action.id;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelectTab(action.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors",
                isActive
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              <action.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          );
        })}
        {onDownloadWorksheet && (
          <button
            type="button"
            onClick={onDownloadWorksheet}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-slate-900 px-2.5 py-1 text-[10px] font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">Download Worksheet</span>
          </button>
        )}
      </div>
    </div>
  );
}
