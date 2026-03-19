import { useState, type FormEvent } from "react";
import { CheckCircle2, Plus, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export interface Goal {
  _id: string;
  text: string;
  isCompleted: boolean;
}

export interface ActivityData {
  name: string;
  hours: number;
}

export function DashboardActivity({
  dailyGoals,
  weeklyData,
  onAddGoal,
  onToggleGoal,
  compact = false,
}: {
  dailyGoals: Goal[] | undefined;
  weeklyData: ActivityData[];
  onAddGoal: (text: string) => Promise<void> | void;
  onToggleGoal: (id: string, currentStatus: boolean) => void;
  compact?: boolean;
}) {
  const [goalDraft, setGoalDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const completedGoals =
    dailyGoals?.filter((goal) => goal.isCompleted).length ?? 0;
  const totalGoals = dailyGoals?.length ?? 0;
  const remainingGoals = Math.max(totalGoals - completedGoals, 0);
  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;
  const totalHours =
    Math.round(
      weeklyData.reduce((sum, item) => sum + (item.hours || 0), 0) * 10,
    ) / 10;
  const peakHours =
    weeklyData.reduce((max, item) => Math.max(max, item.hours || 0), 0) || 1;
  const strongestDay =
    weeklyData.reduce<ActivityData | null>((best, item) => {
      if (!best || item.hours > best.hours) return item;
      return best;
    }, null) ?? null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!goalDraft.trim() || isSaving) return;

    try {
      setIsSaving(true);
      await onAddGoal(goalDraft.trim());
      setGoalDraft("");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className={cn(
        "grid gap-4",
        compact
          ? "grid-cols-1"
          : "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]",
      )}
    >
      <div className="dashboard-surface dashboard-hover-lift rounded-[2rem] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
              Today plan
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">Daily goals</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Keep the checklist small enough to finish so the dashboard feels
                like momentum, not admin.
              </p>
            </div>
          </div>
          <div className="dashboard-subtle-panel rounded-2xl px-3 py-2 text-right">
            <p className="text-xs font-semibold text-white/48">Progress</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {completedGoals}/{totalGoals || 1}
            </p>
            <p className="text-xs text-white/42">{completionRate}% complete</p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <label className="dashboard-subtle-panel flex h-13 flex-1 items-center rounded-2xl px-4">
            <input
              value={goalDraft}
              onChange={(event) => setGoalDraft(event.target.value)}
              placeholder="Add one clear outcome for today"
              className="h-full w-full bg-transparent text-sm text-white placeholder:text-white/28 focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={!goalDraft.trim() || isSaving}
            className="inline-flex h-13 items-center justify-center rounded-2xl border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(16,185,129,0.16))] px-4 text-sm font-medium text-white transition-colors hover:border-cyan-400/25 hover:bg-[linear-gradient(135deg,rgba(34,211,238,0.22),rgba(16,185,129,0.2))] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus className="mr-2 h-4.5 w-4.5" />
            {isSaving ? "Adding..." : "Add goal"}
          </button>
        </form>

        <div className="mt-5 space-y-2.5">
          {(!dailyGoals || dailyGoals.length === 0) && (
            <div className="dashboard-subtle-panel rounded-[1.5rem] px-4 py-6 text-center">
              <p className="text-base font-semibold text-white">No goals yet</p>
              <p className="mt-2 text-[15px] leading-7 text-white/58">
                Add one concrete checkpoint and let the rest of the dashboard
                align around it.
              </p>
            </div>
          )}

          {dailyGoals?.map((goal) => (
            <button
              key={goal._id}
              type="button"
              onClick={() => onToggleGoal(goal._id, goal.isCompleted)}
              className="dashboard-subtle-panel group flex w-full items-center gap-3 rounded-[1.35rem] px-4 py-3 text-left"
            >
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  goal.isCompleted
                    ? "border-emerald-300 bg-emerald-300 text-slate-950"
                    : "border-white/18 text-transparent group-hover:border-cyan-300/55",
                )}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span
                className={cn(
                  "text-[15px] leading-7 transition-colors",
                  goal.isCompleted
                    ? "text-white/35 line-through"
                    : "text-white/82",
                )}
              >
                {goal.text}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
            {completedGoals} completed
          </div>
          <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
            {remainingGoals} remaining
          </div>
          <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
            {totalGoals > 0
              ? `${completionRate}% locked in`
              : "Start with one small win"}
          </div>
        </div>
      </div>

      <div className="dashboard-surface dashboard-hover-lift rounded-[2rem] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
              Momentum
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-white">
                Weekly rhythm
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Watch the cadence, not just the totals. Consistency keeps your
                dashboard working for you.
              </p>
            </div>
          </div>
          <div className="dashboard-subtle-panel flex items-center gap-2 rounded-2xl px-3 py-2">
            <TrendingUp className="h-4 w-4 text-cyan-200" />
            <span className="text-sm font-medium text-white/80">
              {totalHours}h this week
            </span>
          </div>
        </div>

        {!compact && (
          <div className="dashboard-subtle-panel mt-5 rounded-[1.6rem] p-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient
                      id="dashboardActivityFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22d3ee"
                        stopOpacity={0.35}
                      />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.48)", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10,12,18,0.95)",
                      borderColor: "rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      color: "#fff",
                    }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{ stroke: "rgba(34,211,238,0.18)", strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#67e8f9"
                    strokeWidth={2.5}
                    fill="url(#dashboardActivityFill)"
                    activeDot={{ r: 4, fill: "#67e8f9", strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {compact && (
          <div className="mt-5 grid grid-cols-7 gap-2">
            {weeklyData.map((item) => (
              <div
                key={item.name}
                className="dashboard-subtle-panel flex flex-col items-center rounded-[1.35rem] px-2 py-3"
              >
                <div className="flex h-20 items-end">
                  <div
                    className="w-2.5 rounded-full bg-[linear-gradient(180deg,#67e8f9,#22d3ee,#fbbf24)]"
                    style={{
                      height: `${Math.max(14, Math.round(((item.hours || 0) / peakHours) * 64))}px`,
                    }}
                  />
                </div>
                <span className="mt-2 text-[11px] font-semibold text-white/45">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="dashboard-subtle-panel rounded-2xl p-4">
            <p className="text-xs font-semibold text-white/48">Strongest day</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
              {strongestDay?.name ?? "No data"}
            </p>
            <p className="mt-1 text-sm text-white/55">
              {strongestDay
                ? `${strongestDay.hours}h of focused study`
                : "Start a session to build momentum"}
            </p>
          </div>
          <div className="dashboard-subtle-panel rounded-2xl p-4">
            <p className="text-xs font-semibold text-white/48">Avg. pace</p>
            <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
              {weeklyData.length > 0
                ? (totalHours / weeklyData.length).toFixed(1)
                : "0.0"}
              h
            </p>
            <p className="mt-1 text-sm text-white/55">
              average study time per day this week
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
