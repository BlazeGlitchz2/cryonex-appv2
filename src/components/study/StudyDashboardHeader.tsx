import { motion } from "framer-motion";
import {
  BrainCircuit,
  CalendarDays,
  Flame,
  Search,
  Sparkles,
  Target,
  TimerReset,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface StudyDashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsFocusModeOpen: (open: boolean) => void;
  setIsUploadOpen: (open: boolean) => void;
  userName?: string;
  recommendations?: {
    dueFlashcardsCount?: number;
    suggestions?: string[];
  } | null;
  dailyGoals?: Array<{ isCompleted: boolean }>;
  stats?: {
    currentStreak?: number;
  } | null;
  compact?: boolean;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function StudyDashboardHeader({
  searchQuery,
  setSearchQuery,
  setIsFocusModeOpen,
  setIsUploadOpen,
  userName,
  recommendations,
  dailyGoals,
  stats,
  compact = false,
}: StudyDashboardHeaderProps) {
  const completedGoals = dailyGoals?.filter((goal) => goal.isCompleted).length ?? 0;
  const totalGoals = dailyGoals?.length ?? 0;
  const suggestionList =
    recommendations?.suggestions?.slice(0, 3) ?? [
      "Review the concepts you touched yesterday.",
      "Upload one new source and let Cryonex generate practice.",
      "Finish a short focus block before switching subjects.",
    ];
  const todayLabel = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const summaryChips = [
    {
      icon: Flame,
      label: "Streak",
      value: `${stats?.currentStreak ?? 0} day streak`,
    },
    {
      icon: Target,
      label: "Goals",
      value:
        totalGoals > 0
          ? `${completedGoals}/${totalGoals} goals complete`
          : "Set one goal for today",
    },
    {
      icon: Sparkles,
      label: "Review",
      value: `${recommendations?.dueFlashcardsCount ?? 0} flashcards due`,
    },
  ];

  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      className={cn(
        "grid gap-4 lg:gap-5",
        compact ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]",
      )}
    >
      <div className="dashboard-surface rounded-[2rem] p-5 sm:p-6 lg:p-8">
        <div className="dashboard-orb dashboard-orb-cyan" />
        <div className="dashboard-orb dashboard-orb-amber" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                <CalendarDays className="h-3.5 w-3.5 text-cyan-300" />
                {todayLabel}
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-300/75">
                  Student cockpit
                </p>
                <h1
                  className={cn(
                    "max-w-3xl font-semibold tracking-[-0.05em] text-white",
                    compact ? "text-[2rem] leading-[1.05]" : "text-4xl md:text-5xl leading-[0.95]",
                  )}
                >
                  {getGreeting()}
                  {userName ? `, ${userName.split(" ")[0]}` : ""}. Keep today focused and friction-free.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-white/62 sm:text-base">
                  Capture new material, move through review with intention, and keep your study rhythm clean.
                </p>
              </div>
            </div>

            {!compact && (
              <div className="hidden lg:flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_16px_40px_rgba(8,145,178,0.18)]">
                <BrainCircuit className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {summaryChips.map((chip) => (
              <div
                key={chip.label}
                className="dashboard-chip flex items-center gap-3 rounded-2xl p-3.5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/6">
                  <chip.icon className="h-4.5 w-4.5 text-cyan-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/40">
                    {chip.label}
                  </p>
                  <p className="truncate text-sm font-medium text-white/85">{chip.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "mt-6 grid gap-3",
              compact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto]",
            )}
          >
            <label className="dashboard-subtle-panel relative flex h-14 items-center rounded-2xl px-4">
              <Search className="mr-3 h-4.5 w-4.5 text-white/35" />
              <input
                type="text"
                placeholder="Search materials, topics, or tasks"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-full w-full bg-transparent text-sm text-white placeholder:text-white/28 focus:outline-none"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFocusModeOpen(true)}
                className="h-14 rounded-2xl border-white/12 bg-white/6 px-5 text-sm text-white/85 hover:border-cyan-400/30 hover:bg-white/10"
              >
                <TimerReset className="mr-2 h-4.5 w-4.5 text-emerald-300" />
                Start focus
              </Button>

              <Button
                type="button"
                onClick={async () => {
                  try {
                    await Haptics.impact({ style: ImpactStyle.Heavy });
                  } catch {
                    // Native haptics are optional on web.
                  }
                  setIsUploadOpen(true);
                }}
                className="h-14 rounded-2xl bg-[linear-gradient(135deg,#22d3ee,#0f766e)] px-5 text-sm font-semibold text-slate-950 shadow-[0_16px_40px_rgba(34,211,238,0.2)] hover:opacity-95"
              >
                <Upload className="mr-2 h-4.5 w-4.5" />
                Upload material
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-surface rounded-[2rem] p-5 sm:p-6">
        <div className="relative z-10 flex h-full flex-col">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300/75">
            Next best move
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
            Keep the study loop tight.
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/58">
            The dashboard is now organized around one clean rhythm: capture, review, practice, and repeat.
          </p>

          <div className="mt-5 space-y-2">
            {suggestionList.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="dashboard-subtle-panel flex items-start gap-3 rounded-2xl px-4 py-3"
              >
                <div className="mt-1 h-2 w-2 rounded-full bg-cyan-300" />
                <p className="text-sm leading-6 text-white/76">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="dashboard-subtle-panel rounded-2xl p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                Due now
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                {recommendations?.dueFlashcardsCount ?? 0}
              </p>
              <p className="mt-1 text-sm text-white/55">cards ready for a quick review round</p>
            </div>
            <div className="dashboard-subtle-panel rounded-2xl p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                Goal status
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                {completedGoals}/{totalGoals || 1}
              </p>
              <p className="mt-1 text-sm text-white/55">
                {totalGoals > 0 ? "checkpoints completed today" : "goals ready to be defined"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
