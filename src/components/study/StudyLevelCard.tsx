import { motion } from "framer-motion";
import { Award, BookOpenCheck, Sparkles, Target } from "lucide-react";

interface StudyLevelCardProps {
  stats: any;
}

const XP_PER_LEVEL = 250;

export function StudyLevelCard({ stats }: StudyLevelCardProps) {
  const totalPoints = stats?.totalPoints ?? 0;
  const derivedLevel = Math.floor(totalPoints / XP_PER_LEVEL) + 1;
  const level = Math.max(stats?.level ?? 1, derivedLevel);
  const currentLevelBase = (level - 1) * XP_PER_LEVEL;
  const xpIntoLevel = Math.max(totalPoints - currentLevelBase, 0);
  const xpRemaining = Math.max(level * XP_PER_LEVEL - totalPoints, 0);
  const progress = Math.min((xpIntoLevel / XP_PER_LEVEL) * 100, 100);

  return (
    <motion.section
      whileHover={{ y: -3 }}
      className="dashboard-surface rounded-[2rem] p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-amber-300/75">
            Mastery track
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            Level {level}
          </h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/10 text-amber-100">
          <Award className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-white/58">
        Your review activity, quiz work, and study sessions all push this bar forward.
      </p>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-4xl font-semibold tracking-[-0.06em] text-white">{totalPoints}</p>
          <p className="text-sm text-white/52">total XP earned</p>
        </div>
        <div className="dashboard-subtle-panel rounded-2xl px-3 py-2 text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
            Next level
          </p>
          <p className="mt-1 text-sm font-medium text-white/82">{xpRemaining} XP remaining</p>
        </div>
      </div>

      <div className="mt-5 h-2 rounded-full bg-white/8">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#fbbf24,#fde68a,#67e8f9)]"
          style={{ width: `${Math.max(progress, totalPoints > 0 ? 8 : 0)}%` }}
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="dashboard-subtle-panel rounded-2xl p-4">
          <Sparkles className="h-4.5 w-4.5 text-cyan-200" />
          <p className="mt-3 text-lg font-semibold tracking-[-0.04em] text-white">
            {stats?.quizzesCompleted ?? 0}
          </p>
          <p className="text-sm text-white/52">quizzes completed</p>
        </div>
        <div className="dashboard-subtle-panel rounded-2xl p-4">
          <BookOpenCheck className="h-4.5 w-4.5 text-emerald-200" />
          <p className="mt-3 text-lg font-semibold tracking-[-0.04em] text-white">
            {stats?.flashcardsReviewed ?? 0}
          </p>
          <p className="text-sm text-white/52">cards reviewed</p>
        </div>
        <div className="dashboard-subtle-panel rounded-2xl p-4">
          <Target className="h-4.5 w-4.5 text-amber-200" />
          <p className="mt-3 text-lg font-semibold tracking-[-0.04em] text-white">
            {stats?.materialsCompleted ?? 0}
          </p>
          <p className="text-sm text-white/52">materials completed</p>
        </div>
      </div>
    </motion.section>
  );
}
