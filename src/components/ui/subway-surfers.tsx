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
          {/* Device Frame Container */}
          <div className="pointer-events-auto bg-[#080809] backdrop-blur-2xl border-[3px] border-[#333] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/90 w-full max-w-[360px] mx-auto sm:mx-0 ring-1 ring-white/10 relative">
            {/* Device Gloss/Reflection */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-20" />
            
            {/* Header / Status Bar */}
            <div className="h-14 sm:h-12 bg-[#111] flex items-center justify-between px-5 cursor-move select-none border-b border-white/5 relative z-30">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 outline-none group">
                  <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${activeGame === 'hockey' ? 'bg-cyan-400 text-cyan-400' : 'bg-emerald-400 text-emerald-400'}`} />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase leading-none mb-0.5">System</span>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white tracking-wide group-hover:text-primary transition-colors">
                            {activeGame === 'hockey' ? 'NEON HOCKEY' : 'COSMIC SNAKE'}
                        </span>
                        <ChevronDown className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-[#333] text-white backdrop-blur-xl">
                  <DropdownMenuItem onClick={() => setActiveGame("hockey")} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white font-medium">
                    Neon Hockey
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveGame("snake")} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white font-medium">
                    Cosmic Snake
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={toggleSubwaySurfers}
                  className="p-2 hover:bg-red-500/20 rounded-full text-white/40 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Screen Area */}
            <motion.div 
              animate={{ height: isMinimized ? 0 : "auto" }}
              className="overflow-hidden bg-[#050505] relative flex flex-col"
            >
              {/* Screen Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]" />
              
              <div className="relative z-0">
                {activeGame === "hockey" ? (
                    <NeonHockey isMinimized={isMinimized} />
                ) : (
                    <CosmicSnake isMinimized={isMinimized} />
                )}
              </div>
            </motion.div>
            
            {/* Bottom Chin (Mobile Only Visual) */}
            {!isMinimized && (
                <div className="h-2 bg-[#111] border-t border-white/5 w-full" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}