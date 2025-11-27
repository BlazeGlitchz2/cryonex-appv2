import { Trophy } from "lucide-react";

interface XPBadgeProps {
  level: number;
  xp: number;
}

export function XPBadge({ level, xp }: XPBadgeProps) {
  return (
    <div className="flex items-center gap-3 bg-[#161625] border border-[#222238] rounded-xl px-4 py-2">
      <Trophy className="w-5 h-5 text-[#7C3AED]" />
      <div className="flex flex-col">
        <span className="text-xs text-[#8A8FB2]">Level {level}</span>
        <span className="text-sm font-semibold text-white">{xp} XP</span>
      </div>
    </div>
  );
}
