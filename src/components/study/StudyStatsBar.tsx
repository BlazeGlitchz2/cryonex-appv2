import { motion } from "framer-motion";
import { BookOpenCheck, Coins, Flame, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyStatsBarProps {
  stats: any;
  wallet: any;
  formatStudyTime: (ms: number) => string;
  dailyGoals?: Array<{ isCompleted: boolean }>;
  weeklyData?: Array<{ hours: number }>;
  compact?: boolean;
}

export function StudyStatsBar({
  stats,
  wallet,
  formatStudyTime,
  dailyGoals,
  weeklyData,
  compact = false,
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
      shell: "dashboard-surface dashboard-hover-lift",
      iconPanel: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
      bar: "from-cyan-400 to-cyan-300",
      chip: "border border-cyan-500/30 bg-cyan-500/5 text-cyan-300",
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
      shell: "dashboard-surface dashboard-hover-lift",
      iconPanel: "border-blue-500/30 bg-blue-500/5 text-blue-400",
      bar: "from-blue-400 to-blue-300",
      chip: "border border-blue-500/30 bg-blue-500/5 text-blue-300",
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
      shell: "dashboard-surface dashboard-hover-lift",
      iconPanel: "border-amber-500/30 bg-amber-500/5 text-amber-400",
      bar: "from-amber-400 to-amber-300",
      chip: "border border-amber-500/30 bg-amber-500/5 text-amber-300",
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
      shell: "dashboard-surface dashboard-hover-lift",
      iconPanel: "border-green-500/30 bg-green-500/5 text-green-400",
      bar: "from-green-400 to-emerald-300",
      chip: "border border-green-500/30 bg-green-500/5 text-green-300",
    },
  ];

  const visibleStats = compact
    ? statItems.filter((stat) => stat.id !== "cards")
    : statItems;

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className={cn(
        "grid gap-3",
        compact ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-4",
      )}
    >
      {visibleStats.map((stat) => (
        <div
          key={stat.id}
          className={cn(
            "rounded-[1.85rem] p-4 sm:p-5",
            stat.shell,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className={cn(
                  "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                  stat.chip,
                )}
              >
                {stat.label}
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white/92">
                {stat.value}
              </p>
            </div>
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl",
                stat.iconPanel,
              )}
            >
              <stat.icon className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/50">{stat.helper}</p>
          <div className="mt-4 h-1 rounded-full bg-white/[0.06]">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r", stat.bar)}
              style={{
                width: `${Math.max(stat.progress, stat.id === "credits" ? 18 : 10)}%`,
              }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[13px] text-white/40">{stat.target}</span>
            <span className="text-[13px] font-semibold tracking-tight text-white/72">
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
