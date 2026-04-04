import * as React from "react";
import { motion } from "framer-motion";
import { Brain, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ReasoningProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  steps: string[];
  defaultOpen?: boolean;
}

export function Reasoning({
  title = "Reasoning",
  steps,
  defaultOpen = false,
  className,
  ...props
}: ReasoningProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden",
          className,
        )}
        {...props}
      >
        <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-white">{title}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-white/60 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-2">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3"
              >
                <span className="text-xs font-medium text-white/40 mt-0.5">
                  {index + 1}.
                </span>
                <p className="text-sm text-white/80 leading-relaxed">{step}</p>
              </motion.div>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
