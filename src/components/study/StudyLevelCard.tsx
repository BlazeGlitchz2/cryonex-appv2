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
  const masteryTier =
    level >= 10
      ? "Archivist"
      : level >= 6
        ? "Scholar"
        : level >= 3
          ? "Builder"
          : "Starter";

  return (
    <motion.section
      className="bg-[#111] border border-white/10 rounded-md p-5 sm:p-6"
    >

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 border-l-2 border-amber-500/30 bg-amber-500/5 px-2 py-0.5 text-xs font-mono uppercase tracking-wider text-amber-400">
            Mastery track
          </div>
          <h3 className="mt-4 text-xl font-medium tracking-tight text-white/90">
            Level {level}
          </h3>
          <p className="mt-2 text-[13px] font-mono text-amber-500/60">
            {masteryTier} tier unlocked
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-amber-500/30 bg-amber-500/5 text-amber-400">
          <Award className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/50">
        Your review activity, quiz work, and study sessions all push this bar
        forward.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div>
          <p className="text-3xl font-mono tracking-tight text-white/90">
            {totalPoints}
          </p>
          <p className="text-xs font-mono text-white/40">total XP earned</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-right">
          <p className="text-[11px] font-mono uppercase tracking-wider text-white/40">
            This level
          </p>
          <p className="mt-1 text-sm font-mono text-white/80">
            {xpIntoLevel}/{XP_PER_LEVEL} XP
          </p>
        </div>
      </div>

      <div className="mt-5 h-1 rounded-sm bg-white/10">
        <div
          className="h-full rounded-sm bg-amber-400"
          style={{ width: `${Math.max(progress, totalPoints > 0 ? 8 : 0)}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-white/40">
        <span>Level {level}</span>
        <span>
          {xpRemaining} XP to level {level + 1}
        </span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="bg-white/5 border border-white/10 rounded-sm p-4">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <p className="mt-3 text-lg font-mono tracking-tight text-white/90">
            {stats?.quizzesCompleted ?? 0}
          </p>
          <p className="text-[11px] font-mono uppercase tracking-wider mt-1 text-white/40">quizzes</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-sm p-4">
          <BookOpenCheck className="h-4 w-4 text-emerald-400" />
          <p className="mt-3 text-lg font-mono tracking-tight text-white/90">
            {stats?.flashcardsReviewed ?? 0}
          </p>
          <p className="text-[11px] font-mono uppercase tracking-wider mt-1 text-white/40">cards</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-sm p-4">
          <Target className="h-4 w-4 text-amber-400" />
          <p className="mt-3 text-lg font-mono tracking-tight text-white/90">
            {stats?.materialsCompleted ?? 0}
          </p>
          <p className="text-[11px] font-mono uppercase tracking-wider mt-1 text-white/40">materials</p>
        </div>
      </div>
    </motion.section>
  );
}
