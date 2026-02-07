import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitBranch,
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Branch = {
  id: string;
  name: string;
  color: string;
  parentMessageIndex: number;
  messageCount: number;
  lastUpdated: number;
  isFavorite?: boolean;
};

type TimelineViewerProps = {
  currentPosition: number;
  totalMessages: number;
  branches: Branch[];
  currentBranch: string;
  onPositionChange: (position: number) => void;
  onBranchChange: (branchId: string) => void;
  onCreateBranch: (fromPosition: number) => void;
  className?: string;
};

export default function TimelineViewer({
  currentPosition,
  totalMessages,
  branches,
  currentBranch,
  onPositionChange,
  onBranchChange,
  onCreateBranch,
  className,
}: TimelineViewerProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const currentBranchData = branches.find((b) => b.id === currentBranch);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPositionChange(parseInt(e.target.value));
  };

  const goBack = () => {
    if (currentPosition > 0) {
      onPositionChange(currentPosition - 1);
    }
  };

  const goForward = () => {
    if (currentPosition < totalMessages - 1) {
      onPositionChange(currentPosition + 1);
    }
  };

  const goToPresent = () => {
    onPositionChange(totalMessages - 1);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        goBack();
      } else if (e.ctrlKey && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        goForward();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPosition, totalMessages]);

  return (
    <motion.div
      className={cn(
        "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
      initial={{ height: 60 }}
      animate={{ height: isExpanded ? 200 : 60 }}
    >
      <div className="px-4 py-2 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={goBack}
            disabled={currentPosition === 0}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 min-w-[200px]">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {currentPosition + 1} / {totalMessages}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={goForward}
            disabled={currentPosition === totalMessages - 1}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 px-4">
          <input
            type="range"
            min="0"
            max={Math.max(0, totalMessages - 1)}
            value={currentPosition}
            onChange={handleSliderChange}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <select
            value={currentBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="text-sm bg-background border rounded px-2 py-1"
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        {currentPosition < totalMessages - 1 && (
          <Button onClick={goToPresent} variant="secondary" size="sm">
            Return to Present
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="px-4 pb-3">
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {branches.map((branch) => (
                <motion.div
                  key={branch.id}
                  className={cn(
                    "p-2 rounded border cursor-pointer transition-colors",
                    currentBranch === branch.id
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-accent/50",
                  )}
                  onClick={() => onBranchChange(branch.id)}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: branch.color }}
                      />
                      <span className="text-sm font-medium">{branch.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {branch.messageCount} messages
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Branched from message {branch.parentMessageIndex + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <div className="px-4 pb-2 text-xs text-muted-foreground">
        You are at message {currentPosition + 1} of {totalMessages} in branch:{" "}
        <span className="font-medium">{currentBranchData?.name || "Main"}</span>
        {" • "}
        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd> to go
        back
        {" • "}
        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
          Ctrl+Shift+Z
        </kbd>{" "}
        to go forward
      </div>
    </motion.div>
  );
}
