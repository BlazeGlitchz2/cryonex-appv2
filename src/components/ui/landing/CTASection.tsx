import { motion } from "framer-motion";
import { LiquidGlassCard } from "@/components/ui/liquid-weather-glass";
import { Search, Sparkles, FolderOpen } from "lucide-react";

type CTASectionProps = {
  onStartStudying: () => void;
  onAskAI: () => void;
  onProjects: () => void;
};

export default function CTASection({ onStartStudying, onAskAI, onProjects }: CTASectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        <LiquidGlassCard
          blur={16}
          shadow
          glow
          className="p-8 h-48 flex flex-col items-center justify-center gap-4 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
          onClick={onStartStudying}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
            <Search className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1">Start Studying</h3>
            <p className="text-sm text-white/70">Upload & auto-generate study materials</p>
          </div>
        </LiquidGlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        <LiquidGlassCard
          blur={16}
          shadow
          glow
          className="p-8 h-48 flex flex-col items-center justify-center gap-4 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
          onClick={onAskAI}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1">Ask AI</h3>
            <p className="text-sm text-white/70">Chat with context from your courses</p>
          </div>
        </LiquidGlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02, y: -5 }}
        whileTap={{ scale: 0.98 }}
      >
        <LiquidGlassCard
          blur={16}
          shadow
          glow
          className="p-8 h-48 flex flex-col items-center justify-center gap-4 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
          onClick={onProjects}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
            <FolderOpen className="w-8 h-8 text-white" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-1">Projects</h3>
            <p className="text-sm text-white/70">Build with AI templates</p>
          </div>
        </LiquidGlassCard>
      </motion.div>
    </div>
  );
}
