import * as React from "react";
import { motion } from "framer-motion";
import { Wrench, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolProps {
  name: string;
  status: "idle" | "running" | "success" | "error";
  result?: string;
  className?: string;
}

const statusConfig = {
  idle: { icon: Wrench, color: "text-white/40", bg: "bg-white/5" },
  running: { icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10" },
  success: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
};

export function Tool({ name, status, result, className }: ToolProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border border-white/10",
        config.bg,
        className,
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 mt-0.5",
          config.color,
          status === "running" && "animate-spin",
        )}
      />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-white">{name}</p>
        {result && <p className="text-xs text-white/60">{result}</p>}
      </div>
    </motion.div>
  );
}
