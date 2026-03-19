import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  RotateCcw,
  Minimize2,
  Maximize2,
  Coffee,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "short" | "long">("focus");
  const [isMinimized, setIsMinimized] = useState(false);

  // Mutations
  const recordStudySession = useMutation(api.study.recordStudySession);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      toast.success("Timer finished! Take a break.");
      const audio = new Audio("/notification.mp3"); // Assuming asset exists or fail silently
      audio.play().catch(() => { });
      recordStudySession({
        duration:
          (mode === "focus" ? 25 : mode === "short" ? 5 : 15) * 60 * 1000,
        date: new Date().toISOString(),
      });
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    switch (mode) {
      case "focus":
        setTimeLeft(25 * 60);
        break;
      case "short":
        setTimeLeft(5 * 60);
        break;
      case "long":
        setTimeLeft(15 * 60);
        break;
    }
  };

  const setTimerMode = (newMode: "focus" | "short" | "long") => {
    setMode(newMode);
    setIsActive(false);
    switch (newMode) {
      case "focus":
        setTimeLeft(25 * 60);
        break;
      case "short":
        setTimeLeft(5 * 60);
        break;
      case "long":
        setTimeLeft(15 * 60);
        break;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "deepshi-panel relative z-40 overflow-hidden transition-all duration-300 border border-white/10 shadow-2xl",
        isMinimized
          ? "rounded-full w-16 h-16 flex items-center justify-center cursor-pointer hover:scale-110"
          : "rounded-3xl w-full p-6 bg-[#0a0625]/60",
      )}
      onClick={() => isMinimized && setIsMinimized(false)}
    >
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="relative w-full h-full flex items-center justify-center"
          >
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 36 36"
            >
              <path
                className="text-white/10"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={cn(
                  "transition-all duration-1000",
                  isActive ? "text-primary" : "text-white/30",
                )}
                strokeDasharray={`${(timeLeft / (mode === "focus" ? 1500 : mode === "short" ? 300 : 900)) * 100}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
            <span className="text-[10px] font-bold text-white">
              {Math.ceil(timeLeft / 60)}
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
                <button
                  onClick={() => setTimerMode("focus")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    mode === "focus"
                      ? "bg-primary text-white"
                      : "text-white/50 hover:text-white",
                  )}
                >
                  Focus
                </button>
                <button
                  onClick={() => setTimerMode("short")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    mode === "short"
                      ? "bg-green-500 text-white"
                      : "text-white/50 hover:text-white",
                  )}
                >
                  Short
                </button>
                <button
                  onClick={() => setTimerMode("long")}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                    mode === "long"
                      ? "bg-blue-500 text-white"
                      : "text-white/50 hover:text-white",
                  )}
                >
                  Long
                </button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(true);
                }}
                className="h-6 w-6 text-white/30 hover:text-white"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center relative py-4">
              <div className="text-6xl font-bold text-white tabular-nums tracking-tight">
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-white/40 mt-2 font-medium uppercase tracking-widest">
                {isActive ? "Focusing..." : "Ready to start"}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                className="h-12 w-12 rounded-full border-white/10 hover:bg-white/10 hover:text-white"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                onClick={toggleTimer}
                className={cn(
                  "h-16 w-16 rounded-full shadow-lg transition-all hover:scale-105",
                  isActive
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-primary text-white hover:bg-primary/90",
                )}
              >
                {isActive ? (
                  <Pause className="h-8 w-8 fill-current" />
                ) : (
                  <Play className="h-8 w-8 fill-current ml-1" />
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
