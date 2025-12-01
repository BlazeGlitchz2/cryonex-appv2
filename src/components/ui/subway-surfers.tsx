import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minimize2, Maximize2, ChevronDown, Scaling, GripHorizontal } from "lucide-react";
import { useUIStore } from "@/lib/stores/ui-store";
import { EightBallPool } from "./eight-ball-pool";
import { CosmicSnake } from "./cosmic-snake";
import { YouTubePlayer } from "./youtube-player";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SubwaySurfersOverlay() {
  const { showSubwaySurfers, toggleSubwaySurfers } = useUIStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeGame, setActiveGame] = useState<"pool" | "snake" | "youtube">("pool");
  const [width, setWidth] = useState(360);
  const [height, setHeight] = useState(600); // Default height for YouTube mode

  // Handle F4 shortcut to toggle/lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F4") {
        e.preventDefault();
        if (!showSubwaySurfers) {
          toggleSubwaySurfers();
          setIsMinimized(false);
        } else {
          setIsMinimized((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSubwaySurfers, toggleSubwaySurfers]);

  // Reset when opened
  useEffect(() => {
    if (showSubwaySurfers) {
      setIsMinimized(false);
    }
  }, [showSubwaySurfers]);

  const handleResize = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const newWidth = Math.max(320, startWidth + (moveEvent.clientX - startX));
      const newHeight = Math.max(400, startHeight + (moveEvent.clientY - startY));
      setWidth(newWidth);
      setHeight(newHeight);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <AnimatePresence>
      {showSubwaySurfers && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          drag
          dragMomentum={false}
          dragElastic={0.1}
          className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-auto sm:bottom-24 sm:right-6"
          style={{ width: activeGame === 'youtube' ? width : 360 }}
        >
          {/* Device Frame Container */}
          <div className="bg-[#080809] backdrop-blur-2xl border-[3px] border-[#333] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/90 w-full mx-auto sm:mx-0 ring-1 ring-white/10 relative flex flex-col transition-all duration-300">
            {/* Device Gloss/Reflection */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-20" />
            
            {/* Header / Status Bar */}
            <div className="h-14 sm:h-12 bg-[#111] flex items-center justify-between px-5 cursor-move select-none border-b border-white/5 relative z-30 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 outline-none group">
                  <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${
                    activeGame === 'pool' ? 'bg-green-500 text-green-500' : 
                    activeGame === 'snake' ? 'bg-emerald-400 text-emerald-400' :
                    'bg-red-500 text-red-500'
                  }`} />
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase leading-none mb-0.5">System</span>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white tracking-wide group-hover:text-primary transition-colors">
                            {activeGame === 'pool' ? '8 BALL POOL' : activeGame === 'snake' ? 'COSMIC SNAKE' : 'YOUTUBE PLAYER'}
                        </span>
                        <ChevronDown className="w-3 h-3 text-white/40 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-[#333] text-white backdrop-blur-xl">
                  <DropdownMenuItem onClick={() => setActiveGame("pool")} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white font-medium">
                    8 Ball Pool
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveGame("snake")} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white font-medium">
                    Cosmic Snake
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActiveGame("youtube")} className="text-xs cursor-pointer focus:bg-white/10 focus:text-white font-medium">
                    YouTube Player
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-2">
                <div className="mr-2 opacity-20 hover:opacity-50 cursor-grab active:cursor-grabbing hidden sm:block">
                    <GripHorizontal className="w-4 h-4 text-white" />
                </div>
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={toggleSubwaySurfers}
                  className="p-2 hover:bg-red-500/20 rounded-full text-white/40 hover:text-red-400 transition-colors"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Screen Area */}
            <motion.div 
              animate={{ height: isMinimized ? 0 : (activeGame === 'youtube' ? height : "auto") }}
              className="overflow-hidden bg-[#050505] relative flex flex-col"
            >
              {/* Screen Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 pointer-events-none bg-[length:100%_4px,3px_100%]" />
              
              <div className="relative z-0 h-full">
                {activeGame === "pool" ? (
                    <EightBallPool isMinimized={isMinimized} />
                ) : activeGame === "snake" ? (
                    <CosmicSnake isMinimized={isMinimized} />
                ) : (
                    <YouTubePlayer isMinimized={isMinimized} />
                )}
              </div>

              {/* Resize Handle (Only for YouTube) */}
              {activeGame === 'youtube' && !isMinimized && (
                <div 
                    className="absolute bottom-0 right-0 w-8 h-8 z-50 cursor-se-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity group"
                    onPointerDown={handleResize}
                >
                    <div className="w-0 h-0 border-b-[10px] border-r-[10px] border-b-transparent border-r-white/50 group-hover:border-r-white" />
                </div>
              )}
            </motion.div>
            
            {/* Bottom Chin (Mobile Only Visual) */}
            {!isMinimized && activeGame !== 'youtube' && (
                <div className="h-2 bg-[#111] border-t border-white/5 w-full shrink-0" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}