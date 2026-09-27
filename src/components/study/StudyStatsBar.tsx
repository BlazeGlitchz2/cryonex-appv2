import { motion } from "framer-motion";
import { BookOpenCheck, Coins, Flame, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyStatsBarProps {
  stats:
    | {
        totalStudyTime?: number;
        flashcardsReviewed?: number;
        currentStreak?: number;
      }
    | null
    | undefined;
  wallet: { cryoCredits?: number } | null | undefined;
  formatStudyTime: (ms: number) => string;
  dailyGoals?: Array<{ isCompleted: boolean }>;
  weeklyData?: Array<{ hours: number }>;
  compact?: boolean;
  layout?: "default" | "dense";
}

export function StudyStatsBar({
  stats,
  wallet,
  formatStudyTime,
  dailyGoals,
  weeklyData,
  compact = false,
  layout = "default",
}: StudyStatsBarProps) {
  const completedGoals =
    dailyGoals?.filter((goal) => goal.isCompleted).length ?? 0;
  const totalGoals = dailyGoals?.length ?? 0;
  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const weeklyHours =
    Math.round(
      (weeklyData ?? []).reduce((sum, day) => sum + (day.hours || 0), 0) * 10,
    ) / 10;
  const totalStudyTimeMs = stats?.totalStudyTime ?? 0;
  const studyMinutes = totalStudyTimeMs / 60000;
  const creditBalance = wallet?.cryoCredits ?? 0;
  const statItems = [
    {
      id: "time",
      label: "Study time",
      value: stats ? formatStudyTime(totalStudyTimeMs) : "0m",
      helper: "tracked across focused sessions",
      target: "120m focus target",
      progress: Math.min(100, Math.round((studyMinutes / 120) * 100)),
      icon: Timer,
      shell: "bg-card border border-border shadow-sm",
      iconPanel: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
      bar: "from-cyan-400 to-cyan-300",
      chip: "border-l-2 border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
    },
    {
      id: "cards",
      label: "Cards reviewed",
      value: `${stats?.flashcardsReviewed ?? 0}`,
      helper: "completed this cycle",
      target: "40-card review cycle",
      progress: Math.min(
        100,
        Math.round(((stats?.flashcardsReviewed ?? 0) / 40) * 100),
      ),
      icon: BookOpenCheck,
      shell: "bg-card border border-border shadow-sm",
      iconPanel: "border-blue-500/30 bg-blue-500/5 text-blue-400",
      bar: "from-blue-400 to-blue-300",
      chip: "border-l-2 border-blue-500/30 bg-blue-500/5 text-blue-400",
    },
    {
      id: "streak",
      label: "Current streak",
      value: `${stats?.currentStreak ?? 0}d`,
      helper: `${weeklyHours}h total this week`,
      target: "14-day consistency push",
      progress: Math.min(
        100,
        Math.round(((stats?.currentStreak ?? 0) / 14) * 100),
      ),
      icon: Flame,
      shell: "bg-card border border-border shadow-sm",
      iconPanel: "border-amber-500/30 bg-amber-500/5 text-amber-400",
      bar: "from-amber-400 to-amber-300",
      chip: "border-l-2 border-amber-500/30 bg-amber-500/5 text-amber-400",
    },
    {
      id: "credits",
      label: "Credits",
      value: `${creditBalance}`,
      helper:
        totalGoals > 0
          ? `${completedGoals}/${totalGoals} goals checked off`
          : "Earn more with focus sessions and refuels",
      target: "50-credit reserve",
      progress: Math.min(100, Math.round((creditBalance / 50) * 100)),
      icon: Coins,
      shell: "bg-card border border-border shadow-sm",
      iconPanel: "border-green-500/30 bg-green-500/5 text-green-400",
      bar: "from-green-400 to-emerald-300",
      chip: "border-l-2 border-green-500/30 bg-green-500/5 text-green-400",
    },
  ];

  const visibleStats = compact
    ? statItems.filter((stat) => stat.id !== "cards")
    : statItems;
  const isDense = layout === "dense";

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className={cn(
        "grid gap-3",
        isDense
          ? "sm:grid-cols-2"
          : compact
            ? "grid-cols-1"
            : "sm:grid-cols-2 xl:grid-cols-4",
      )}
    >
      {visibleStats.map((stat) => (
        <div
          key={stat.id}
          className={cn(
            isDense
              ? "dashboard-surface rounded-[1.7rem] p-4"
              : "rounded-2xl p-4 sm:p-5",
            !isDense && stat.shell,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className={cn(
                  isDense
                    ? "inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
                    : "inline-flex font-mono px-2 py-0.5 text-xs uppercase tracking-wider",
                  !isDense && stat.chip,
                )}
              >
                {stat.label}
              </div>
              <p
                className={cn(
                  "mt-3 tracking-tight text-foreground",
                  isDense
                    ? "text-[1.75rem] font-semibold"
                    : "text-2xl font-mono",
                )}
              >
                {stat.value}
              </p>
            </div>
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                stat.iconPanel,
              )}
            >
              <stat.icon className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {stat.helper}
          </p>
          <div
            className="mt-3 h-1 rounded-full bg-muted"
            role="progressbar"
            aria-label={stat.label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stat.progress}
          >
            <div
              className={cn("h-full rounded-full bg-gradient-to-r", stat.bar)}
              style={{
                width: `${stat.progress}%`,
              }}
            />
          </div>
          <div
            className={cn(
              "mt-3 flex items-center justify-between gap-3",
              isDense && "dashboard-subtle-panel rounded-[1rem] px-3 py-2",
            )}
          >
            <span
              className={cn(
                "text-[13px] text-muted-foreground",
                !isDense && "font-mono",
              )}
            >
              {stat.target}
            </span>
            <span
              className={cn(
                "text-[13px] tracking-tight text-foreground",
                !isDense && "font-mono",
              )}
            >
              {stat.id === "streak" && totalGoals > 0
                ? `${completionRate}% goals complete`
                : `${stat.progress}%`}
            </span>
          </div>
        </div>
      ))}
    </motion.section>
  );
}
