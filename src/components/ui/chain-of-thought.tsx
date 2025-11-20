import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";

type ChainOfThoughtProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
} & React.ComponentProps<"div">;

export function ChainOfThought({
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: ChainOfThoughtProps) {
  return (
    <Collapsible open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <div
        className={`rounded-xl border border-[#2a2a2a] bg-[#0f0f0f] shadow-lg ${className || ""}`}
        {...props}
      />
    </Collapsible>
  );
}

type ChainOfThoughtHeaderProps = {
  children?: React.ReactNode;
} & React.ComponentProps<typeof CollapsibleTrigger>;

export function ChainOfThoughtHeader({
  children = "Chain of Thought",
  className,
  ...props
}: ChainOfThoughtHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a2a]">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-[#2a2a2a] flex items-center justify-center">
          <div className="h-2 w-2 rounded-sm bg-[#6b6b6b]" />
        </div>
        <span className="text-sm font-medium text-[#d0d0d0]">
          {children}
        </span>
      </div>
      <CollapsibleTrigger
        className={`text-xs text-[#bfbfbf] hover:text-white px-2 py-1 rounded transition-colors ${className || ""}`}
        {...props}
      >
        <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
    </div>
  );
}

type StepStatus = "complete" | "active" | "pending";

type ChainOfThoughtStepProps = {
  icon?: LucideIcon;
  label: string;
  description?: string;
  status?: StepStatus;
} & React.ComponentProps<"div">;

export function ChainOfThoughtStep({
  icon: Icon,
  label,
  description,
  status = "complete",
  className,
  ...props
}: ChainOfThoughtStepProps) {
  const colorByStatus: Record<StepStatus, string> = {
    complete: "text-[#d0d0d0]",
    active: "text-white",
    pending: "text-[#6b6b6b]",
  };

  const iconColorByStatus: Record<StepStatus, string> = {
    complete: "text-[#9b9b9b]",
    active: "text-white",
    pending: "text-[#555]",
  };

  return (
    <div className={`flex items-start gap-3 py-2 ${className || ""}`} {...props}>
      {Icon ? (
        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColorByStatus[status]}`} />
      ) : (
        <span
          className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${
            status === "complete"
              ? "bg-[#9b9b9b]"
              : status === "active"
              ? "bg-white"
              : "bg-[#555]"
          }`}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className={`text-sm leading-relaxed ${colorByStatus[status]}`}>{label}</div>
        {description ? (
          <div className="text-xs text-[#9b9b9b] mt-1 leading-relaxed">{description}</div>
        ) : null}
      </div>
    </div>
  );
}

export function ChainOfThoughtContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent {...props}>
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key="cot-content"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className={`px-4 py-3 space-y-3 ${className || ""}`}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </CollapsibleContent>
  );
}

export function ChainOfThoughtSearchResults({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={`flex flex-wrap gap-1 ${className || ""}`} {...props} />;
}

export function ChainOfThoughtSearchResult({
  className,
  ...props
}: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      className={`bg-[#1a1a1a] text-[#d0d0d0] hover:bg-[#2a2a2a] border border-[#2a2a2a] text-xs px-3 py-1 rounded-md transition-colors ${className || ""}`}
      {...props}
    />
  );
}

type ChainOfThoughtImageProps = {
  caption?: string;
} & React.ComponentProps<"div">;

export function ChainOfThoughtImage({
  caption,
  className,
  children,
  ...props
}: ChainOfThoughtImageProps) {
  return (
    <div className={`space-y-2 my-3 ${className || ""}`} {...props}>
      <div className="rounded-lg overflow-hidden border border-[#2a2a2a] bg-[#1a1a1a]">
        {children}
      </div>
      {caption ? (
        <div className="text-xs text-[#9b9b9b] leading-relaxed px-1">{caption}</div>
      ) : null}
    </div>
  );
}