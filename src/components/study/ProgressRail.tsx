import { motion } from "framer-motion";

interface ProgressRailProps {
  percent: number;
}

export function ProgressRail({ percent }: ProgressRailProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[#C7CAE5]">Progress to Level 2</span>
        <span className="text-sm text-[#8A8FB2]">{percent}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#12121A] overflow-hidden">
        <motion.div
          className="h-full bg-[#7C3AED]"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{
            duration: 0.8,
            type: "spring",
            stiffness: 280,
            damping: 28,
          }}
        />
      </div>
    </div>
  );
}
