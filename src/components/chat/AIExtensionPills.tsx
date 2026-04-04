import React from "react";
import { cn } from "@/lib/utils";
import { Upload, HelpCircle, Map } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeStore } from "@/lib/stores/theme-store";

interface AIExtensionPillProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  className?: string;
}

export const AIExtensionPill: React.FC<AIExtensionPillProps> = ({
  icon: Icon,
  label,
  onClick,
  className,
}) => {
  const isLight = useThemeStore((state) => state.mode === "light");

  return (
    <motion.button
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all shadow-sm border",
        isLight
          ? "bg-white text-slate-900 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-slate-200/50"
          : "bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20 shadow-black/20 backdrop-blur-md",
        className
      )}
    >
      <Icon className={cn("h-4 w-4", isLight ? "text-slate-500" : "text-white/60")} />
      <span>{label}</span>
      <div className={cn(
        "ml-1 h-1.5 w-1.5 rounded-full animate-pulse",
        isLight ? "bg-cyan-500" : "bg-cyan-400"
      )} />
    </motion.button>
  );
};

export const UploadNotesPill: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <AIExtensionPill icon={Upload} label="Upload your notes" onClick={onClick} />
);

export const ProvideTopicPill: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <AIExtensionPill icon={Map} label="Provide your topic" onClick={onClick} />
);
