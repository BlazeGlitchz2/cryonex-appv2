import { usePerformanceStore } from "@/lib/stores/performance-store";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * StudyModeToggle - A floating toggle for enabling distraction-free study mode
 * When enabled: reduces animations, dims particles, optimizes for focus
 */
export function StudyModeToggle() {
    const { studyMode, setStudyMode } = usePerformanceStore();

    return (
        <motion.button
            onClick={() => setStudyMode(!studyMode)}
            className={cn(
                "group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-300",
                "backdrop-blur-md shadow-lg",
                studyMode
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-cyan-500/10"
                    : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={studyMode ? "Exit Study Mode" : "Enter Study Mode"}
        >
            <AnimatePresence mode="wait">
                {studyMode ? (
                    <motion.div
                        key="study"
                        initial={{ rotate: -20, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <BookOpen className="w-4 h-4" />
                    </motion.div>
                ) : (
                    <motion.div
                        key="normal"
                        initial={{ rotate: 20, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -20, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Sparkles className="w-4 h-4" />
                    </motion.div>
                )}
            </AnimatePresence>

            <span className="text-sm font-medium">
                {studyMode ? "Study Mode" : "Normal"}
            </span>

            {/* Glow effect when active */}
            {studyMode && (
                <motion.div
                    className="absolute inset-0 rounded-xl bg-cyan-400/10 blur-xl -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                />
            )}
        </motion.button>
    );
}
