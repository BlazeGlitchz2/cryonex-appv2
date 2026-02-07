import * as React from "react";
import { motion } from "framer-motion";
import { CheckSquare, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskProps {
  label: string;
  status: "pending" | "in-progress" | "completed";
  description?: string;
  className?: string;
}

export function Task({ label, status, description, className }: TaskProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("flex items-start gap-3 py-2", className)}
    >
      <div className="mt-0.5">
        {status === "completed" && (
          <CheckSquare className="h-4 w-4 text-green-400" />
        )}
        {status === "in-progress" && (
          <Loader2 className="h-4 w-4 text-white animate-spin" />
        )}
        {status === "pending" && <Square className="h-4 w-4 text-white/30" />}
      </div>
      <div className="flex-1 space-y-1">
        <p
          className={cn(
            "text-sm",
            status === "completed" && "text-white/60 line-through",
            status === "in-progress" && "text-white font-medium",
            status === "pending" && "text-white/40",
          )}
        >
          {label}
        </p>
        {description && <p className="text-xs text-white/40">{description}</p>}
      </div>
    </motion.div>
  );
}
