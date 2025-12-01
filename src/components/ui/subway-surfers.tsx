import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2, ChevronDown } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { NeonHockey } from "./neon-hockey";
import { CosmicSnake } from "./cosmic-snake";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SubwaySurfersOverlay() {
  const { showSubwaySurfers, toggleSubwaySurfers } = useUIStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeGame, setActiveGame] = useState<"hockey" | "snake">("hockey");

  // Reset when opened
  useEffect(() => {
    if (showSubwaySurfers) {
      setIsMinimized(false);
    }
  }, [showSubwaySurfers]);

  return (
    <AnimatePresence>
      {showSubwaySurfers && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none sm:bottom-24 sm:right-6 w-full sm:w-auto px-4 sm:px-0"
        >
          <div className="pointer-events-auto bg-[#0A0A0B]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/80 w-full max-w-[340px] mx-auto sm:mx-0 ring-1 ring-white/5">
            {/* Header */}
            <div className="h-12 sm:h-10 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between px-4 cursor-move select-none border-b border-white/5">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-xs font-bold text-white/90 tracking-wide hover:text-white transition-colors outline-none group">
                  <div className={`w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor] ${activeGame === 'hockey' ? 'bg-primary text-primary' : 'bg-emerald-500 text-emerald-500'}`} />
                  <span className="group-hover:underline decoration-white/20 underline-offset-4">{activeGame === 'hockey' ? 'NEON HOCKEY' : 'COSMIC SNAKE'}</span>
                  <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-[#111] border-white/10 text-white backdrop-blur-xl">
                  <DropdownMenuItem onClick={() => setActiveGame("hockey")} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white">
                    Neon Hockey
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveGame("snake")} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white">
                    Cosmic Snake
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={toggleSubwaySurfers}
                  className="p-2 hover:bg-red-500/20 rounded-full text-white/50 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <motion.div 
              animate={{ height: isMinimized ? 0 : "auto" }}
              className="overflow-hidden bg-[#050505]/50 relative flex flex-col"
            >
              {activeGame === "hockey" ? (
                <NeonHockey isMinimized={isMinimized} />
              ) : (
                <CosmicSnake isMinimized={isMinimized} />
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}