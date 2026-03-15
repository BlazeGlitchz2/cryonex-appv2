import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Gamepad2,
  Timer,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import type { DashboardFeature } from "@/hooks/use-study-dashboard-handlers";

interface StudyFeatureCardsProps {
  recommendations: any;
  onSetActiveFeature: (feature: DashboardFeature) => void;
  onSetIsFocusModeOpen: (open: boolean) => void;
  compact?: boolean;
}

const accentMap = {
  cyan: {
    icon: "text-cyan-200",
    panel: "border-cyan-400/15 bg-cyan-400/10",
    accent: "text-cyan-300",
  },
  blue: {
    icon: "text-blue-200",
    panel: "border-blue-400/15 bg-blue-400/10",
    accent: "text-blue-300",
  },
  amber: {
    icon: "text-amber-200",
    panel: "border-amber-400/15 bg-amber-400/10",
    accent: "text-amber-300",
  },
  emerald: {
    icon: "text-emerald-200",
    panel: "border-emerald-400/15 bg-emerald-400/10",
    accent: "text-emerald-300",
  },
} as const;

export function StudyFeatureCards({
  recommendations,
  onSetActiveFeature,
  onSetIsFocusModeOpen,
  compact = false,
}: StudyFeatureCardsProps) {
  const { user } = useAuth();

  const featureCards = [
    {
      id: "flashcards" as const,
      title: "Spaced review",
      desc: "Run the cards that are due before they pile up.",
      meta: `${recommendations?.dueFlashcardsCount ?? 0} cards ready`,
      icon: BookOpen,
      accent: "cyan" as const,
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
      desc: "Turn your study material into a pressure-tested check.",
      meta: "Instant exam simulation",
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
      desc: "Use a fast game loop to lock in term-to-concept recall.",
      meta: "Best for warm-up reps",
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
      desc: "Start a clean Pomodoro block with less decision fatigue.",
      meta: "25/5 rhythm ready",
      icon: Timer,
      accent: "emerald" as const,
      action: async () => {
        try {
          await Haptics.impact({ style: ImpactStyle.Medium });
        } catch {
          // Haptics are optional on web.
        }
        onSetIsFocusModeOpen(true);
      },
    },
  ];

  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4",
      )}
    >
      {featureCards.map((card) => {
        const accent = accentMap[card.accent];

        return (
          <motion.button
            key={card.id}
            type="button"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.985 }}
            onClick={card.action}
            className="dashboard-surface flex h-full flex-col items-start rounded-[1.7rem] p-4 text-left sm:p-5"
          >
            <div className="flex w-full items-start justify-between gap-3">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl border",
                  accent.panel,
                )}
              >
                <card.icon className={cn("h-5 w-5", accent.icon)} />
              </div>
              <span className={cn("text-[11px] font-semibold uppercase tracking-[0.22em]", accent.accent)}>
                {card.meta}
              </span>
            </div>

            <div className="mt-5 flex-1">
              <h3 className={cn("font-semibold tracking-[-0.03em] text-white", compact ? "text-lg" : "text-xl")}>
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/58">{card.desc}</p>
            </div>

            <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/78">
              Open mode
              <ArrowRight className="h-4 w-4" />
            </div>
          </motion.button>
        );
      })}

      {user?.region && (
        <motion.button
          type="button"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.985 }}
          onClick={async () => {
            try {
              await Haptics.impact({ style: ImpactStyle.Light });
            } catch {
              // Haptics are optional on web.
            }

            if (user.region === "ksa" || user.region === "egypt") {
              onSetActiveFeature("regional_trainer");
              return;
            }

            toast.info("Regional training is being prepared for your market.");
          }}
          className="dashboard-surface flex h-full flex-col items-start rounded-[1.7rem] p-4 text-left sm:p-5"
        >
          <div className="flex w-full items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/15 bg-amber-400/10">
              <Trophy className="h-5 w-5 text-amber-200" />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">
              {user.region === "ksa" || user.region === "egypt" ? "ready now" : "coming soon"}
            </span>
          </div>

          <div className="mt-5 flex-1">
            <h3 className={cn("font-semibold tracking-[-0.03em] text-white", compact ? "text-lg" : "text-xl")}>
              {user.region === "ksa"
                ? "Qiyas trainer"
                : user.region === "egypt"
                  ? "Thanaweyya coach"
                  : "Regional exam mode"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/58">
              {user.region === "ksa"
                ? "Target GAT and Tahsili drills with a cleaner study flow."
                : user.region === "egypt"
                  ? "Train against ministry-style prompts with structured feedback."
                  : "We will bring region-specific exam prep into the same clean dashboard."}
            </p>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/78">
            Explore track
            <ArrowRight className="h-4 w-4" />
          </div>
        </motion.button>
      )}
    </motion.section>
  );
}
