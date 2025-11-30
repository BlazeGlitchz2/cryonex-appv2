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
          className="fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none sm:right-6 right-4"
        >
          <div className="pointer-events-auto bg-[#0A0A0B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 w-[300px] sm:w-[340px]">
            {/* Header */}
            <div className="h-12 sm:h-9 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between px-3 cursor-move select-none border-b border-white/5">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 text-xs font-bold text-white/90 tracking-wide hover:text-white transition-colors outline-none">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${activeGame === 'hockey' ? 'bg-primary' : 'bg-emerald-500'}`} />
                  <span>{activeGame === 'hockey' ? 'NEON HOCKEY' : 'COSMIC SNAKE'}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-[#111] border-white/10 text-white">
                  <DropdownMenuItem onClick={() => setActiveGame("hockey")} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white">
                    Neon Hockey
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveGame("snake")} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white">
                    Cosmic Snake
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 sm:p-1.5 hover:bg-white/10 rounded-md text-white/50 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> : <Minimize2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
                </button>
                <button 
                  onClick={toggleSubwaySurfers}
                  className="p-2 sm:p-1.5 hover:bg-red-500/20 rounded-md text-white/50 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>

            <motion.div 
              animate={{ height: isMinimized ? 0 : 240 }}
              className="overflow-hidden bg-[#111] relative flex flex-col"
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