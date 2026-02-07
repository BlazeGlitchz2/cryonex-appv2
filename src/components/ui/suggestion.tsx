import * as React from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionProps {
  text: string;
  className?: string;
  onClick?: () => void;
}

export function Suggestion({ text, className, onClick }: SuggestionProps) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl",
        "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20",
        "text-sm text-white/80 hover:text-white transition-all",
        "text-left",
        className,
      )}
    >
      <Lightbulb className="h-4 w-4 text-yellow-400 shrink-0" />
      <span>{text}</span>
    </motion.button>
  );
}

interface SuggestionsProps {
  suggestions: string[];
  onSelect?: (suggestion: string) => void;
  className?: string;
}

export function Suggestions({
  suggestions,
  onSelect,
  className,
}: SuggestionsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {suggestions.map((suggestion, index) => (
        <Suggestion
          key={index}
          text={suggestion}
          onClick={() => onSelect?.(suggestion)}
        />
      ))}
    </div>
  );
}
