import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import confetti from "canvas-confetti";

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hiddenForever = localStorage.getItem(
      "cryonex_welcome_hidden_forever",
    );
    const hasSeenSession = sessionStorage.getItem("hasSeenWelcome");

    if (!hiddenForever && !hasSeenSession) {
      setIsVisible(true);

      // Fire confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 60,
      };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      sessionStorage.setItem("hasSeenWelcome", "true");
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (dontShowAgain) {
      localStorage.setItem("cryonex_welcome_hidden_forever", "true");
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop - Optional, removing it allows interacting with background while popup is open if desired, 
                        but usually modals have backdrops. User asked for "draggable", implying it might be a floating window.
                        I'll keep a transparent backdrop to prevent interaction if it's a modal, or remove it to make it non-blocking.
                        "Notification thing" usually implies non-blocking or at least dismissible.
                        Let's make it a non-blocking floating window (no backdrop) so dragging makes sense.
                    */}

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag={typeof window !== "undefined" && window.innerWidth > 768}
            dragMomentum={false}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-[#0A0A0B]/95 border border-white/10 text-white backdrop-blur-2xl rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header / Drag Handle */}
            <div className="flex items-center justify-between p-4 border-b border-white/5 cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-white/50 uppercase tracking-wider">
                  System Notification
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  <img
                    src="/logo.png"
                    alt="Cryonex"
                    className="relative w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  />
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">
                    Welcome to Cryonex
                  </h2>
                  <p className="text-primary font-mono text-xs font-bold uppercase tracking-widest">
                    Test Release v0.9.0
                  </p>
                </div>
              </div>

              <p className="text-center text-white/70 text-sm leading-relaxed">
                You are experiencing an early preview of Cryonex. We're
                constantly improving and adding new features.
              </p>

              <div className="bg-white/5 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">
                  Report Issues & Feedback
                </p>
                <a
                  href="https://instagram.com/cryonex.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-primary transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                >
                  @cryonex.ai
                </a>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={handleClose}
                  className="w-full h-11 text-sm font-semibold bg-white text-black hover:bg-white/90 rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                >
                  Start Creating
                </Button>

                <div className="flex items-center justify-center space-x-2">
                  <Checkbox
                    id="dont-show"
                    checked={dontShowAgain}
                    onCheckedChange={(checked) =>
                      setDontShowAgain(checked as boolean)
                    }
                    className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Label
                    htmlFor="dont-show"
                    className="text-xs text-white/50 cursor-pointer select-none hover:text-white/70 transition-colors"
                  >
                    Don't show this again
                  </Label>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
