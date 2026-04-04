import * as React from "react";
import { motion } from "framer-motion";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";

interface CheckpointProps {
  label: string;
  completed?: boolean;
  active?: boolean;
  className?: string;
}

export function Checkpoint({
  label,
  completed = false,
  active = false,
  className,
}: CheckpointProps) {
  const isLight = useThemeStore((state) => state.mode === "light");
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-center gap-3 py-2 px-3 rounded-lg transition-colors",
        active && (isLight ? "bg-accent/50" : "bg-white/5"),
        className,
      )}
    >
      <div
        className={cn(
          "h-5 w-5 rounded-full flex items-center justify-center transition-colors",
          completed
            ? "bg-emerald-500"
            : active
              ? isLight
                ? "bg-primary/20 border-2 border-primary"
                : "bg-white/20 border-2 border-white"
              : isLight
                ? "bg-accent"
                : "bg-white/10",
        )}
      >
        {completed && <Check className="h-3 w-3 text-white" />}
        {!completed && active && (
          <Circle
            className={cn(
              "h-2 w-2 fill-current",
              isLight ? "text-primary" : "text-white"
            )}
          />
        )}
      </div>
      <span
        className={cn(
          "text-sm transition-colors",
          completed
            ? isLight ? "text-muted-foreground" : "text-white/80"
            : active
              ? isLight ? "text-foreground" : "text-white"
              : isLight ? "text-muted-foreground/60" : "text-white/60",
        )}
      >
        {label}
      </span>
    </motion.div>
  );
}
