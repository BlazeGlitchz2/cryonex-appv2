import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ThinkingDots from "@/components/ui/ThinkingDots";

interface AIThinkingBlockProps {
  message?: string;
  showTimer?: boolean;
  thinkingContent?: string;
}

export function AIThinkingBlock({ 
  message = "Searching the web...", 
  showTimer = true,
  thinkingContent = ""
}: AIThinkingBlockProps) {
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!showTimer) return;
    
    // Update only every 500ms instead of 100ms to reduce re-renders
    const interval = setInterval(() => {
      setElapsed((Date.now() - startTimeRef.current) / 1000);
    }, 500);

    return () => clearInterval(interval);
  }, [showTimer]);

  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] p-4">
      <div className="flex items-start gap-3">
        <Loader2 className="h-5 w-5 text-purple-400 animate-spin shrink-0 mt-0.5" style={{ animationDuration: '1s' }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-white">
              {message}
            </p>
            {showTimer && (
              <p className="text-xs text-[#6b6b6b]">
                {elapsed.toFixed(1)}s
              </p>
            )}
          </div>
          <ThinkingDots className="mt-2" />
          {thinkingContent && (
            <div className="text-sm text-[#aaaaaa] mt-2 whitespace-pre-wrap break-words">
              {thinkingContent}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}