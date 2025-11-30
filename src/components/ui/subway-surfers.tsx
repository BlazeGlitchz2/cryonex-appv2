import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Move, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/stores/ui-store";

export function SubwaySurfersOverlay() {
  const { showSubwaySurfers, toggleSubwaySurfers } = useUIStore();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const constraintsRef = useRef(null);

  // Reset position when opened
  useEffect(() => {
    if (showSubwaySurfers) {
      setPosition({ x: 0, y: 0 });
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
          className="fixed bottom-24 right-6 z-50 flex flex-col items-end pointer-events-none"
        >
          <div className="pointer-events-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 w-[280px] sm:w-[320px]">
            {/* Header / Drag Handle */}
            <div className="h-8 bg-white/5 flex items-center justify-between px-3 cursor-move select-none border-b border-white/5">
              <div className="flex items-center gap-2 text-xs font-medium text-white/70">
                <Move className="w-3 h-3" />
                <span>Attention Mode</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 hover:bg-white/10 rounded text-white/70 hover:text-white transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </button>
                <button 
                  onClick={toggleSubwaySurfers}
                  className="p-1 hover:bg-red-500/20 rounded text-white/70 hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Video Content */}
            <motion.div 
              animate={{ height: isMinimized ? 0 : 180 }}
              className="overflow-hidden bg-black relative"
            >
              {!isMinimized && (
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/n_Dv4JMiwK8?autoplay=1&mute=1&controls=0&loop=1&playlist=n_Dv4JMiwK8&start=10"
                  title="Subway Surfers Gameplay"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                />
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
