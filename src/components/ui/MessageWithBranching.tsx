import React from "react";
import { Button } from "@/components/ui/button";
import { GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type MessageWithBranchingProps = {
  children: React.ReactNode;
  messageIndex: number;
  isInPast: boolean;
  onBranchFromHere: (index: number) => void;
  className?: string;
};

export default function MessageWithBranching({
  children,
  messageIndex,
  isInPast,
  onBranchFromHere,
  className,
}: MessageWithBranchingProps) {
  const [showBranchButton, setShowBranchButton] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative group",
        className,
        isInPast && "opacity-70 hover:opacity-100 transition-opacity",
      )}
      onMouseEnter={() => setShowBranchButton(true)}
      onMouseLeave={() => setShowBranchButton(false)}
    >
      {children}

      <AnimatePresence>
        {showBranchButton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 right-2 z-10"
          >
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onBranchFromHere(messageIndex)}
              className="shadow-lg backdrop-blur-xl bg-card/80 border border-white/10 hover:border-primary/30 hover:bg-card/90 transition-all"
            >
              <GitBranch className="h-3 w-3 mr-1" />
              Branch
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
