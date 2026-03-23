import { ArrowRight, BookOpenCheck, Compass, Globe, ListChecks, Sparkles, Timer, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyGuidedNextActionsProps {
  user: any;
  recommendations: any;
  recentMaterials: any[];
  dailyGoals: any[];
  onOpenFlashcards: () => void;
  onOpenQuiz: () => void;
  onOpenFocus: () => void;
  onOpenUpload: () => void;
  onContinueMaterial: (materialId: string) => void;
  onOpenRegionalTrainer?: () => void;
  compact?: boolean;
}

type RecommendationAction = {
  id: string;
  title: string;
  description: string;
  action: string;
  materialId?: string;
  track?: string;
};

const regionLabel: Record<string, string> = {
  ksa: "Saudi Arabia",
  egypt: "Egypt",
  uae: "UAE",
  qatar: "Qatar",
  kuwait: "Kuwait",
  bahrain: "Bahrain",
  oman: "Oman",
};

export function StudyGuidedNextActions({
  user,
  recommendations,
  recentMaterials,
  dailyGoals,
  onOpenFlashcards,
  onOpenQuiz,
  onOpenFocus,
  onOpenUpload,
  onContinueMaterial,
  onOpenRegionalTrainer,
  compact = false,
}: StudyGuidedNextActionsProps) {
  const incompleteGoals = dailyGoals.filter((goal) => !goal.isCompleted).length;
  const dueCount = recommendations?.dueFlashcardsCount ?? 0;
  const latestMaterial = recentMaterials?.[0];
  const region = user?.region || recommendations?.personalization?.region;
  const curriculum =
    user?.curriculumTrack ||
    user?.curriculum ||
    recommendations?.personalization?.curriculum;
  const regionalModeAvailable =
    region === "ksa" || region === "egypt" || region === "uae";
  const speaksArabicByDefault =
    user?.isRTL ||
    ["ksa", "egypt", "uae", "qatar", "kuwait", "oman", "bahrain"].includes(
      region || "",
    );

  const fallbackQuickActions = [
    {
      id: "flashcards",
      title: dueCount > 0 ? `Review ${dueCount} due cards` : "Start spaced review",
      hint: dueCount > 0 ? "Fastest retention win right now" : "Warm up your memory lane",
      icon: BookOpenCheck,
      onClick: onOpenFlashcards,
      accent: "text-cyan-300 border-cyan-400/20 bg-cyan-400/10",
    },
    {
      id: "continue",
      title: latestMaterial?.title ? `Continue: ${latestMaterial.title}` : "Open your latest source",
      hint: "Grounded answers from your own material",
      icon: Compass,
      onClick: () => {
        if (latestMaterial?._id) {
          onContinueMaterial(String(latestMaterial._id));
          return;
        }
        onOpenUpload();
      },
      accent: "text-violet-300 border-violet-400/20 bg-violet-400/10",
    },
    {
      id: "quiz",
      title: "Run an adaptive quiz",
      hint: "Find gaps before the exam finds them",
      icon: ListChecks,
      onClick: onOpenQuiz,
      accent: "text-blue-300 border-blue-400/20 bg-blue-400/10",
    },
    {
      id: "focus",
      title: incompleteGoals > 0 ? `${incompleteGoals} goal${incompleteGoals > 1 ? "s" : ""} left today` : "Start a focus block",
      hint: "Short deep-work burst to finish your day",
      icon: Timer,
      onClick: onOpenFocus,
      accent: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
    },
  ];

  const actionableNextSteps = (((recommendations?.nextActions as RecommendationAction[]) || [])
    .filter((action) =>
      [
        "open_flashcards",
        "start_focus_mode",
        "open_regional_trainer",
        "build_summary",
        "generate_notes",
        "generate_flashcards",
        "generate_quiz",
      ].includes(action.action),
    )
    .slice(0, 4)
    .map((action) => {
      const actionConfig = {
        open_flashcards: {
          icon: BookOpenCheck,
          accent: "text-cyan-300 border-cyan-400/20 bg-cyan-400/10",
          onClick: onOpenFlashcards,
        },
        start_focus_mode: {
          icon: Timer,
          accent: "text-emerald-300 border-emerald-400/20 bg-emerald-400/10",
          onClick: onOpenFocus,
        },
        open_regional_trainer: {
          icon: Globe,
          accent: "text-amber-300 border-amber-400/20 bg-amber-400/10",
          onClick: () => onOpenRegionalTrainer?.(),
        },
        build_summary: {
          icon: Compass,
          accent: "text-violet-300 border-violet-400/20 bg-violet-400/10",
          onClick: () =>
            action.materialId
              ? onContinueMaterial(String(action.materialId))
              : onOpenUpload(),
        },
        generate_notes: {
          icon: Compass,
          accent: "text-violet-300 border-violet-400/20 bg-violet-400/10",
          onClick: () =>
            action.materialId
              ? onContinueMaterial(String(action.materialId))
              : onOpenUpload(),
        },
        generate_flashcards: {
          icon: BookOpenCheck,
          accent: "text-cyan-300 border-cyan-400/20 bg-cyan-400/10",
          onClick: () =>
            action.materialId
              ? onContinueMaterial(String(action.materialId))
              : onOpenFlashcards(),
        },
        generate_quiz: {
          icon: ListChecks,
          accent: "text-blue-300 border-blue-400/20 bg-blue-400/10",
          onClick: () =>
            action.materialId
              ? onContinueMaterial(String(action.materialId))
              : onOpenQuiz(),
        },
      }[action.action];

      if (!actionConfig) {
        return null;
      }

      return {
        id: action.id,
        title: action.title,
        hint: action.description,
        icon: actionConfig.icon,
        onClick: actionConfig.onClick,
        accent: actionConfig.accent,
      };
    })
    .filter(Boolean)) as Array<{
      id: string;
      title: string;
      hint: string;
      icon: typeof BookOpenCheck;
      onClick: () => void;
      accent: string;
    }>;

  const quickActions =
    actionableNextSteps.length > 0 ? actionableNextSteps : fallbackQuickActions;

  return (
    <section
      className={cn(
        "deepshi-panel border border-white/[0.06] p-4 sm:p-5",
        compact ? "rounded-[22px]" : "rounded-[26px]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D072FF]/30 bg-[#D072FF]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E4C9FF]">
            <Sparkles className="h-3.5 w-3.5" />
            Next Actions
          </div>
          <h2 className={cn("text-white tracking-tight", compact ? "text-lg font-semibold" : "text-2xl font-semibold")}>
            Continue with the highest-impact move.
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-white/55">
            Built for speed-to-value: every action stays grounded in your uploaded sources, not generic summaries.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-full border border-white/10 bg-[#161A34E6] px-3 py-1.5 text-xs text-white/75">
            {curriculum ? `Curriculum: ${curriculum}` : "Curriculum not set"}
          </div>
          <div className="rounded-full border border-white/10 bg-[#161A34E6] px-3 py-1.5 text-xs text-white/75">
            {region ? `Region: ${regionLabel[region] || region}` : "Region not set"}
          </div>
          <div className="rounded-full border border-white/10 bg-[#161A34E6] px-3 py-1.5 text-xs text-white/75">
            {speaksArabicByDefault ? "Arabic + RTL ready" : "English-first mode"}
          </div>
        </div>
      </div>

      <div className={cn("mt-4 grid gap-3", compact ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2")}>
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className="group rounded-2xl border border-white/10 bg-[#0C0E23]/90 p-4 text-left transition-colors hover:border-white/20 hover:bg-[#161A34E6]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white">{action.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-white/50">{action.hint}</p>
              </div>
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", action.accent)}>
                <action.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 group-hover:text-white/80">
              Open
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-white/45">Regional study lane</p>
          <p className="text-sm text-white/70">
            {regionalModeAvailable
              ? "Use localized exam logic and regional practice prompts."
              : "Enable your region in onboarding/settings for local exam and language personalization."}
          </p>
        </div>
        <div className="flex gap-2">
          {regionalModeAvailable && onOpenRegionalTrainer ? (
            <button
              type="button"
              onClick={onOpenRegionalTrainer}
              className="inline-flex items-center gap-2 rounded-full border border-[#c49c65]/30 bg-[#c49c65]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#F5DAB6] transition-colors hover:bg-[#c49c65]/20"
            >
              <Globe className="h-3.5 w-3.5" />
              Open Regional Trainer
            </button>
          ) : null}
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/85 transition-colors hover:bg-white/15"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Add Source
          </button>
        </div>
      </div>
    </section>
  );
}
