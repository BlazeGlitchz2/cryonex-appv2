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
        "flex items-center gap-3 overflow-x-auto border-b border-border/60 bg-black/20 backdrop-blur-md px-4 py-2",
      )}
    >
      {/* Sparkle label */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Sparkles className="h-3 w-3 text-[#D072FF]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#D072FF]">
          Workspace
        </span>
      </div>

      <div className="h-4 w-px shrink-0 bg-border" />

      {/* Source info */}
      <p className="shrink-0 truncate text-[11px] text-foreground/60 max-w-[180px] sm:max-w-[260px]">
        {sourceTitle || "Untitled material"}
        <span className="mx-1.5 text-foreground/30">·</span>
        {sourceWordCount.toLocaleString()}w
      </p>

      <div className="h-4 w-px shrink-0 bg-border" />

      {/* Badges */}
      <div className="flex shrink-0 items-center gap-1.5">
        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-foreground/65">
          {user?.region ? regionLabel[user.region] || user.region : "Global"}
        </span>
        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-foreground/65">
          {curriculum}
        </span>
        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-foreground/65">
          {user?.isRTL ? "RTL" : "LTR"}
        </span>
      </div>

      {/* Spacer pushes actions to the right */}
      <div className="flex-1" />

      {/* Action buttons */}
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
                  ? "border-[#D072FF]/40 bg-[#D072FF]/20 text-[#F1DEFF]"
                  : "border-border bg-foreground/5 text-foreground/65 hover:bg-foreground/10",
              )}
            >
              <action.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
