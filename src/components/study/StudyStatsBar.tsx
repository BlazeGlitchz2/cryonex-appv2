import { motion } from "framer-motion";
import {
  BookOpenCheck,
  Coins,
  Flame,
  GraduationCap,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudyStatsBarProps {
  stats: any;
  wallet: any;
  formatStudyTime: (ms: number) => string;
  dailyGoals?: Array<{ isCompleted: boolean }>;
  weeklyData?: Array<{ hours: number }>;
}

export function StudyStatsBar({
  stats,
  wallet,
  formatStudyTime,
  dailyGoals,
  weeklyData,
}: StudyStatsBarProps) {
  const completedGoals = dailyGoals?.filter((goal) => goal.isCompleted).length ?? 0;
  const totalGoals = dailyGoals?.length ?? 0;
  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const weeklyHours = Math.round(
    (weeklyData ?? []).reduce((sum, day) => sum + (day.hours || 0), 0) * 10,
  ) / 10;

  const statItems = [
    {
      label: "Study time",
      value: stats ? formatStudyTime(stats.totalStudyTime) : "0m",
      helper: "tracked across sessions",
      icon: Timer,
      accent: "from-cyan-400/20 to-cyan-400/5 text-cyan-200",
    },
    {
      label: "Cards reviewed",
      value: `${stats?.flashcardsReviewed ?? 0}`,
      helper: "active retrieval reps",
      icon: BookOpenCheck,
      accent: "from-blue-400/20 to-blue-400/5 text-blue-200",
    },
    {
      label: "Current streak",
      value: `${stats?.currentStreak ?? 0}d`,
      helper: `${weeklyHours}h total this week`,
      icon: Flame,
      accent: "from-amber-400/20 to-amber-400/5 text-amber-200",
    },
    {
      label: "Mastery level",
      value: `Lv ${stats?.level ?? 1}`,
      helper: `${stats?.totalPoints ?? 0} XP earned`,
      icon: GraduationCap,
      accent: "from-emerald-400/20 to-emerald-400/5 text-emerald-200",
    },
    {
      label: "Goal completion",
      value: totalGoals > 0 ? `${completionRate}%` : `${wallet?.cryoCredits ?? 0}`,
      helper:
        totalGoals > 0
          ? `${completedGoals}/${totalGoals} goals checked off`
          : `${wallet?.cryoCredits ?? 0} CRYO credits available`,
      icon: Coins,
      accent: "from-fuchsia-400/20 to-fuchsia-400/5 text-fuchsia-200",
    },
  ];

  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"
    >
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className="dashboard-surface rounded-[1.6rem] p-4 sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/38">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                {stat.value}
              </p>
            </div>
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-gradient-to-br",
                stat.accent,
              )}
            >
              <stat.icon className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4 h-1.5 rounded-full bg-white/6">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-teal-300 to-amber-200"
              style={{
                width:
                  stat.label === "Goal completion"
                    ? `${Math.max(completionRate, totalGoals > 0 ? 8 : 14)}%`
                    : "72%",
              }}
            />
          </div>
          <p className="mt-3 text-sm text-white/58">{stat.helper}</p>
        </div>
      ))}
    </motion.section>
  );
}
