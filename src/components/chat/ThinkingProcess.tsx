import React from "react";
import AIThinkingBlock from "@/components/ui/ai-thinking-block";

interface ThinkingProcessProps {
  thinking: string;
  isFinished?: boolean;
  className?: string;
}

export function ThinkingProcess({
  thinking,
  isFinished = false,
  className,
}: ThinkingProcessProps) {
  if (!thinking || thinking.trim().length === 0) return null;

  return (
    <div className={className}>
      <AIThinkingBlock thinking={thinking} isFinished={isFinished} />
    </div>
  );
}
