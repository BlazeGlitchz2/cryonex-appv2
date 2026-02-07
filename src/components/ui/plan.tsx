import * as React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanStep {
  label: string;
  status: "pending" | "active" | "completed";
  description?: string;
}

interface PlanProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: PlanStep[];
  title?: string;
}

export function Plan({
  steps,
  title = "Plan",
  className,
  ...props
}: PlanProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 space-y-3",
        className,
      )}
      {...props}
    >
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Clock className="h-4 w-4" />
        {title}
      </h3>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5">
              {step.status === "completed" && (
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              )}
              {step.status === "active" && (
                <Circle className="h-4 w-4 text-white fill-white" />
              )}
              {step.status === "pending" && (
                <Circle className="h-4 w-4 text-white/30" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p
                className={cn(
                  "text-sm",
                  step.status === "completed" && "text-white/60 line-through",
                  step.status === "active" && "text-white font-medium",
                  step.status === "pending" && "text-white/40",
                )}
              >
                {step.label}
              </p>
              {step.description && (
                <p className="text-xs text-white/40">{step.description}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
