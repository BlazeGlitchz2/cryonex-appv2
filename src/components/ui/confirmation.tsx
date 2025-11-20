import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ConfirmationType = "success" | "error" | "warning";

interface ConfirmationProps {
  type?: ConfirmationType;
  message: string;
  description?: string;
  className?: string;
}

const iconMap = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
};

const colorMap = {
  success: "text-green-400 bg-green-500/10 border-green-500/20",
  error: "text-red-400 bg-red-500/10 border-red-500/20",
  warning: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
};

export function Confirmation({ type = "success", message, description, className }: ConfirmationProps) {
  const Icon = iconMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border",
        colorMap[type],
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-white">{message}</p>
        {description && <p className="text-xs text-white/60">{description}</p>}
      </div>
    </motion.div>
  );
}
