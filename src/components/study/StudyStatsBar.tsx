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
      shell: "bg-[#0a0625]/80 border border-white/[0.06]",
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
      shell: "bg-[#0a0625]/80 border border-white/[0.06]",
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
      shell: "bg-[#0a0625]/80 border border-white/[0.06]",
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
      shell: "bg-[#0a0625]/80 border border-white/[0.06]",
      iconPanel: "border-green-500/30 bg-green-500/5 text-green-400",
      bar: "from-green-400 to-emerald-300",
      chip: "border-l-2 border-green-500/30 bg-green-500/5 text-green-400",
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
            "rounded-2xl p-4 sm:p-5",
            stat.shell,
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className={cn(
                  "inline-flex font-mono px-2 py-0.5 text-xs uppercase tracking-wider",
                  stat.chip,
                )}
              >
                {stat.label}
              </div>
              <p className="mt-3 text-2xl font-mono tracking-tight text-white/90">
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
          <p className="mt-3 text-sm text-white/50 leading-relaxed">{stat.helper}</p>
          <div className="mt-4 h-1 rounded-full bg-white/[0.06]">
            <div
              className={cn("h-full rounded-full bg-gradient-to-r", stat.bar)}
              style={{
                width: `${Math.max(stat.progress, stat.id === "credits" ? 18 : 10)}%`,
              }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[13px] font-mono text-white/40">{stat.target}</span>
            <span className="text-[13px] font-mono tracking-tight text-white/70">
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
