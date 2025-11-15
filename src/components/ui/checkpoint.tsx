import * as React from "react";
import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckpointProps {
  label: string;
  completed?: boolean;
  active?: boolean;
  className?: string;
}

export function Checkpoint({ label, completed = false, active = false, className }: CheckpointProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
        active && "bg-white/5",
        className
      )}
    >
      <div
        className={cn(
          "h-5 w-5 rounded-full flex items-center justify-center transition-colors",
          completed ? "bg-green-500" : active ? "bg-white/20 border-2 border-white" : "bg-white/10"
        )}
      >
        {completed && <Check className="h-3 w-3 text-white" />}
        {!completed && active && <Circle className="h-2 w-2 text-white fill-white" />}
      </div>
      <span className={cn("text-sm", completed ? "text-white/80" : active ? "text-white" : "text-white/60")}>
        {label}
      </span>
    </motion.div>
  );
}
