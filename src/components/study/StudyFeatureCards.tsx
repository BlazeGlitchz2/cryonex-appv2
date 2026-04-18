import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Gamepad2,
  Mic,
  Timer,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { useNavigate } from "react-router";
import type { DashboardFeature } from "@/hooks/use-study-dashboard-handlers";
import {
  buildCurriculumPersonalization,
  hasEnhancedRegionalTrainer,
} from "@/lib/curriculumPersonalization";

interface StudyFeatureCardsProps {
  recommendations: any;
  onSetActiveFeature: (feature: DashboardFeature) => void;
  onSetIsFocusModeOpen: (open: boolean) => void;
  compact?: boolean;
}

const accentMap = {
  cyan: {
    icon: "text-cyan-400",
    panel: "border-cyan-500/30 bg-cyan-500/5",
    tag: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    metric: "text-cyan-400",
    footer: "text-cyan-400",
  },
  blue: {
    icon: "text-blue-400",
    panel: "border-blue-500/30 bg-blue-500/5",
    tag: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    metric: "text-blue-400",
    footer: "text-blue-400",
  },
  amber: {
    icon: "text-amber-400",
    panel: "border-amber-500/30 bg-amber-500/5",
    tag: "border-amber-500/30 bg-amber-500/5 text-amber-400",
    metric: "text-amber-400",
    footer: "text-amber-400",
  },
  emerald: {
    icon: "text-emerald-400",
    panel: "border-emerald-500/30 bg-emerald-500/5",
    tag: "border-emerald-500/30 bg-emerald-500/5 text-emerald-400",
    metric: "text-emerald-400",
    footer: "text-emerald-400",
  },
} as const;

export function StudyFeatureCards({
  recommendations,
  onSetActiveFeature,
  onSetIsFocusModeOpen,
  compact = false,
}: StudyFeatureCardsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const regionalReady = hasEnhancedRegionalTrainer({
    country: user?.country,
    region: user?.region,
  });
  const trainerBlueprint = buildCurriculumPersonalization({
    country: user?.country,
    region: user?.region,
    curriculum: user?.curriculum,
    curriculumTrack: user?.curriculumTrack,
    gradeLevel: user?.gradeLevel,
    targetSubjects: user?.targetSubjects,
    targetExams: user?.targetExams,
    studyPace: user?.studyPace,
    preferredLanguage: user?.preferredLanguage,
  });

  const featureCards = [
    {
      id: "flashcards" as const,
      title: "Spaced review",
      desc: "Clear the due queue before it grows cold and expensive to recover.",
      metric: `${recommendations?.dueFlashcardsCount ?? 0} cards ready`,
      tag: "Review lane",
      support: "Best for fast recall",
      hint: "Great as the first move when you open the dashboard.",
      icon: BookOpen,
      accent: "cyan" as const,
      layout: "xl:col-span-2",
      action: async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch {
          // Haptics are optional on web.
        }
        onSetActiveFeature("flashcards");
      },
    },
    {
      id: "quiz" as const,
      title: "Adaptive quiz",
      desc: "Pressure-test what you know and expose the weak spots quickly.",
      metric: "Exam simulation",
      tag: "Practice lane",
      support: "Best for gap finding",
      hint: "Use when you need feedback, not just familiarity.",
      icon: BrainCircuit,
      accent: "blue" as const,
      action: async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch {
          // Haptics are optional on web.
        }
        onSetActiveFeature("quiz");
      },
    },
    {
      id: "match" as const,
      title: "Memory match",
      desc: "Run short, playful reps when you want momentum without setup.",
      metric: "Warm-up reps",
      tag: "Speed lane",
      support: "Best for energy resets",
      hint: "Useful between deeper study blocks.",
      icon: Gamepad2,
      accent: "amber" as const,
      action: async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Light });
        } catch {
          // Haptics are optional on web.
        }
        onSetActiveFeature("match");
      },
    },
    {
      id: "focus" as const,
      title: "Deep focus",
      desc: "Quiet the interface and lock into a clean Pomodoro cycle.",
      metric: "25 / 5 ready",
      tag: "Focus lane",
      support: "Best for low-noise work",
      hint: "Use when you already know the source and just need time.",
      icon: Timer,
      accent: "emerald" as const,
      layout: "xl:col-span-2",
      action: async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {
          // Haptics are optional on web.
        }
        onSetIsFocusModeOpen(true);
      },
    },
    {
      id: "ielts" as any,
      title: "IELTS Speaking",
      desc: "Simulate a live examiner. Get instant automated feedback on fluency.",
      metric: "AI Examiner",
      tag: "Vocab & Fluency",
      support: "Best for speech practice",
      hint: "Talk freely and get a reliable estimation.",
      icon: Mic,
      accent: "cyan" as const,
      layout: "xl:col-span-1",
      action: async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {}
        navigate("/study/ielts");
      },
    },
  ];
  const visibleCards = compact ? featureCards.slice(0, 3) : featureCards;

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 xl:grid-cols-2",
      )}
    >
      {visibleCards.map((card) => {
        const accent = accentMap[card.accent];
        const isPrimary = !compact && card.id === "flashcards";

        return (
          <button
            key={card.id}
            type="button"
            onClick={card.action}
            className={cn(
              "flex h-full flex-col p-4 text-left sm:p-5 bg-[#0a0625]/80 border border-white/[0.06] rounded-2xl transition-colors hover:bg-white/[0.04] backdrop-blur-xl",
              !compact && card.layout,
              isPrimary && "lg:p-6",
            )}
          >
            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-start justify-between gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border",
                    accent.panel,
                  )}
                >
                  <card.icon className={cn("h-4 w-4", accent.icon)} />
                </div>
                <span
                  className={cn(
                    "border-l-2 px-2 py-0.5 text-xs font-mono uppercase tracking-wider",
                    accent.tag,
                  )}
                >
                  {card.tag}
                </span>
              </div>

              <div className="mt-6 flex-1">
                {isPrimary ? (
                  <p
                    className={cn(
                      "text-2xl font-mono tracking-tight",
                      accent.metric,
                    )}
                  >
                    {card.metric}
                  </p>
                ) : (
                  <div
                    className={cn(
                      "inline-flex border-l-2 px-2 py-0.5 text-xs font-mono uppercase tracking-wider",
                      accent.tag,
                    )}
                  >
                    {card.metric}
                  </div>
                )}
                <h3
                  className={cn(
                    "mt-4 font-medium tracking-tight text-white/90",
                    isPrimary ? "text-2xl" : "text-xl",
                  )}
                >
                  {card.title}
                </h3>
                <p
                  className={cn(
                    "mt-3 max-w-xl text-sm leading-relaxed text-white/50",
                    isPrimary && "text-base",
                  )}
                >
                  {card.desc}
                </p>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/[0.06] pt-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-white/40">
                    {card.support}
                  </p>
                  <p className="text-sm text-[13px] text-white/40">
                    {card.hint}
                  </p>
                </div>
                <div
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 text-sm font-mono",
                    accent.footer,
                  )}
                >
                  Open mode
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </button>
        );
      })}

      {(user?.region || user?.country) && (
        <button
          type="button"
          onClick={async () => {
            try {
              await Haptics.impact({ style: ImpactStyle.Light });
            } catch {
              // Haptics are optional on web.
            }

            if (regionalReady) {
              onSetActiveFeature("regional_trainer");
              return;
            }

            toast.info("Regional training is being prepared for your market.");
          }}
          className={cn(
            "flex h-full flex-col p-4 text-left sm:p-5 bg-[#0a0625]/80 border border-white/[0.06] rounded-2xl transition-colors hover:bg-white/[0.04] backdrop-blur-xl",
            compact ? "sm:col-span-2" : "xl:col-span-2",
          )}
        >
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/5">
                <Trophy className="h-4 w-4 text-amber-400" />
              </div>
              <span className="border-l-2 border-amber-500/30 bg-amber-500/5 px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                {regionalReady ? "Regional lane" : "Coming soon"}
              </span>
            </div>

            <div className="mt-6 flex-1">
              <div className="inline-flex border-l-2 border-amber-500/30 bg-amber-500/5 px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-amber-400">
                {regionalReady ? "Ready now" : "Soon"}
              </div>
              <h3 className="mt-4 text-xl font-medium tracking-tight text-white/90">
                {trainerBlueprint.trainerTitle}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/50">
                {regionalReady
                  ? trainerBlueprint.trainerDescription
                  : "We're preparing market-specific exam tracks without turning the dashboard into a feature dump."}
              </p>
            </div>

            <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/10 pt-4">
              <div className="space-y-1">
                <p className="text-xs font-mono text-white/40">
                  {regionalReady
                    ? "Best for targeted prep"
                    : "Reserved for local exam systems"}
                </p>
                <p className="text-[13px] text-white/40">
                  {regionalReady
                    ? "Keep country, curriculum, and exam-specific practice in the same dashboard."
                    : "It will land when the training content is ready for your market."}
                </p>
              </div>
              <div className="inline-flex shrink-0 items-center gap-2 text-sm font-mono text-amber-400">
                Explore track
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </button>
      )}
    </motion.section>
  );
}
