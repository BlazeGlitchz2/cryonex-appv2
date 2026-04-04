import {
  ArrowRight,
  BookOpenCheck,
  Compass,
  Globe,
  ListChecks,
  Sparkles,
  Timer,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildCurriculumPersonalization,
  hasEnhancedRegionalTrainer,
} from "@/lib/curriculumPersonalization";

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
  uk: "United Kingdom",
  us: "United States",
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
  const regionalModeAvailable = hasEnhancedRegionalTrainer({
    country: user?.country,
    region,
  });
  const trainerBlueprint = buildCurriculumPersonalization({
    country: user?.country,
    region,
    curriculum: user?.curriculum,
    curriculumTrack: user?.curriculumTrack,
    gradeLevel: user?.gradeLevel,
    targetSubjects: user?.targetSubjects,
    targetExams: user?.targetExams,
    studyPace: user?.studyPace,
    preferredLanguage: user?.preferredLanguage,
  });
  const speaksArabicByDefault =
    user?.isRTL ||
    ["ksa", "egypt", "uae", "qatar", "kuwait", "oman", "bahrain"].includes(
      region || "",
    );

  const fallbackQuickActions = [
    {
      id: "flashcards",
      title:
        dueCount > 0 ? `Review ${dueCount} due cards` : "Start spaced review",
      hint:
        dueCount > 0
          ? "Fastest retention win right now"
          : "Warm up your memory lane",
      icon: BookOpenCheck,
      onClick: onOpenFlashcards,
      accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    },
    {
      id: "continue",
      title: latestMaterial?.title
        ? `Continue: ${latestMaterial.title}`
        : "Open your latest source",
      hint: "Grounded answers from your own material",
      icon: Compass,
      onClick: () => {
        if (latestMaterial?._id) {
          onContinueMaterial(String(latestMaterial._id));
          return;
        }
        onOpenUpload();
      },
      accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
    },
    {
      id: "quiz",
      title: "Run an adaptive quiz",
      hint: "Find gaps before the exam finds them",
      icon: ListChecks,
      onClick: onOpenQuiz,
      accent: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
    },
    {
      id: "focus",
      title:
        incompleteGoals > 0
          ? `${incompleteGoals} goal${incompleteGoals > 1 ? "s" : ""} left today`
          : "Start a focus block",
      hint: "Short deep-work burst to finish your day",
      icon: Timer,
      onClick: onOpenFocus,
      accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
  ];

  const actionableNextSteps = (
    (recommendations?.nextActions as RecommendationAction[]) || []
  )
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
          accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
          onClick: onOpenFlashcards,
        },
        start_focus_mode: {
          icon: Timer,
          accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
          onClick: onOpenFocus,
        },
        open_regional_trainer: {
          icon: Globe,
          accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
          onClick: () => onOpenRegionalTrainer?.(),
        },
        build_summary: {
          icon: Compass,
          accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
          onClick: () =>
            action.materialId
              ? onContinueMaterial(String(action.materialId))
              : onOpenUpload(),
        },
        generate_notes: {
          icon: Compass,
          accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
          onClick: () =>
            action.materialId
              ? onContinueMaterial(String(action.materialId))
              : onOpenUpload(),
        },
        generate_flashcards: {
          icon: BookOpenCheck,
          accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
          onClick: () =>
            action.materialId
              ? onContinueMaterial(String(action.materialId))
              : onOpenFlashcards(),
        },
        generate_quiz: {
          icon: ListChecks,
          accent: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10",
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
    .filter(Boolean) as Array<{
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
        "rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-5 backdrop-blur-3xl shadow-xl",
        compact ? "rounded-[22px]" : "rounded-[32px]",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            <Sparkles className="h-3.5 w-3.5" />
            Next Actions
          </div>
          <h2
            className={cn(
              "text-white tracking-tight font-bold",
              compact ? "text-lg" : "text-2xl",
            )}
          >
            Highest-impact move.
          </h2>
          <p className="max-w-xl text-[13px] leading-relaxed text-white/40">
            Speed-to-value: every action starts from your uploaded
            source material instead of generic prompts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-tight">
            {curriculum ? curriculum : "Independent"}
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-white/30 uppercase tracking-tight">
            {region ? (regionLabel[region] || region) : "Global"}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-5 grid gap-3",
          compact ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2",
        )}
      >
        {quickActions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={action.onClick}
            className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 text-left transition-all hover:border-white/[0.1] hover:bg-white/[0.06] active:scale-[0.98]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{action.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/40 line-clamp-2">
                  {action.hint}
                </p>
              </div>
              <div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all group-hover:scale-110",
                  action.accent,
                )}
              >
                <action.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-white/20 group-hover:text-white/40">
              Launch
              <ArrowRight className="h-3 w-3" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-cyan-500/60">
              Regional Study Lane
            </p>
            <p className="text-[12px] leading-relaxed text-white/40 line-clamp-2">
              {regionalModeAvailable
                ? trainerBlueprint.trainerDescription
                : "Enable your region in settings for local exam and language personalization."}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {regionalModeAvailable && onOpenRegionalTrainer ? (
              <button
                type="button"
                onClick={onOpenRegionalTrainer}
                className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-amber-400 transition-all hover:bg-amber-500/20 active:scale-95"
              >
                <Globe className="h-3.5 w-3.5" />
                {trainerBlueprint.trainerTitle}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onOpenUpload}
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/70 transition-all hover:bg-white/[0.1] active:scale-95"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Add Source
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
