import { Brain, ListChecks, MessageSquare, Network, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyWorkspaceNextStepsProps {
  user: any;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  sourceTitle: string;
  sourceWordCount: number;
  compact?: boolean;
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
}: StudyWorkspaceNextStepsProps) {
  const curriculum =
    user?.curriculumTrack || user?.curriculum || "Curriculum general";

  const actions = [
    { id: "chat", label: "Ask source-linked AI", icon: MessageSquare },
    { id: "flashcards", label: "Build flashcards", icon: Brain },
    { id: "quizzes", label: "Run adaptive quiz", icon: ListChecks },
    { id: "gaps", label: "Find weak spots", icon: Network },
  ];

  return (
    <div
      className={cn(
        "deepshi-panel border-b border-border bg-background/90",
        compact
          ? "rounded-none px-3 py-3 sm:px-4"
          : "mx-4 mt-4 rounded-2xl border border-border px-4 py-4",
      )}
    >
      <div
        className={cn(
          "flex gap-3",
          compact ? "flex-col" : "flex-wrap items-start justify-between",
        )}
      >
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D072FF]">
            <Sparkles className="h-3 w-3" />
            Study Workspace
          </p>
          <p
            className={cn(
              "mt-1 text-sm text-foreground/75",
              compact && "text-[13px] leading-6",
            )}
          >
            Source:{" "}
            <span className="text-foreground">
              {sourceTitle || "Untitled material"}
            </span>
            <span className="mx-2 text-foreground/35">•</span>
            {sourceWordCount.toLocaleString()} words analyzed
          </p>
        </div>
        <div
          className={cn(
            "flex flex-wrap gap-2",
            compact && "w-full",
          )}
        >
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-foreground/75">
            {user?.region ? `Region ${regionLabel[user.region] || user.region}` : "Region global"}
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-foreground/75">
            {curriculum}
          </span>
          <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[11px] text-foreground/75">
            {user?.isRTL ? "RTL active" : "LTR active"}
          </span>
        </div>
      </div>
      <div
        className={cn(
          "mt-3",
          compact ? "grid grid-cols-2 gap-2" : "flex flex-wrap gap-2",
        )}
      >
        {actions.map((action) => {
          const isActive = activeTab === action.id;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onSelectTab(action.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors",
                compact &&
                  "min-h-12 justify-start rounded-2xl px-3 py-3 text-left",
                isActive
                  ? "border-[#D072FF]/40 bg-[#D072FF]/20 text-[#F1DEFF]"
                  : "border-border bg-foreground/5 text-foreground/75 hover:bg-foreground/10",
              )}
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
