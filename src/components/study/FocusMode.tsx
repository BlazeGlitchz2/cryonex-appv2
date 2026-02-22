import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Flame, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FocusModeProps {
    onClose: () => void;
}

export function FocusMode({ onClose }: FocusModeProps) {
    const [isActive, setIsActive] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 min default
    const [interruptionCount, setInterruptionCount] = useState(0);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const logFocusSession = useMutation(api.credits.logFocusSession);
    const wallet = useQuery(api.credits.getWallet);

    // The brutal execution: Page Visibility API
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === "hidden" && isActive && timeRemaining > 0) {
                setInterruptionCount((prev) => {
                    const newCount = prev + 1;
                    if (newCount === 1) toast.warning("Focus Interrupted! Don't switch tabs.");
                    if (newCount === 2) toast.error("Warning! One more interruption and you fail this session.");
                    if (newCount >= 3) {
                        handleFailSession();
                    }
                    return newCount;
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isActive, timeRemaining]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isActive && timeRemaining > 0) {
            timerRef.current = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0 && isActive) {
            handleCompleteSession();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isActive, timeRemaining]);

    const handleStart = () => {
        setIsActive(true);
        if (!sessionStartTime) setSessionStartTime(Date.now());
    };

    const handlePause = () => {
        setIsActive(false);
    };

    const handleFailSession = async () => {
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);

        toast.error("Focus Session Failed. You switched tabs too many times.");

        if (sessionStartTime) {
            const durationMs = Date.now() - sessionStartTime;
            await logFocusSession({
                durationMs,
                interruptedCount: 3,
                status: "failed_distracted",
            });
        }

        setTimeout(onClose, 2000);
    };

    const handleCompleteSession = async () => {
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);

        if (sessionStartTime) {
            const durationMs = Date.now() - sessionStartTime;
            try {
                const result = await logFocusSession({
                    durationMs,
                    interruptedCount: interruptionCount,
                    status: "completed",
                });

                if (result.creditsEarned > 0) {
                    toast.success(`Session Complete! You mined ${result.creditsEarned} Cryo Credits. 💎`);
                } else {
                    toast.success("Session Complete! (Interrupted too much for a reward).");
                }
            } catch (e) {
                console.error(e);
            }
        }

        setTimeout(onClose, 3000);
    };

    const handleStopEarly = async () => {
        // If they manually abort, it's considered failed for economies of scale
        setIsActive(false);
        if (timerRef.current) clearInterval(timerRef.current);

        if (sessionStartTime) {
            const durationMs = Date.now() - sessionStartTime;
            await logFocusSession({
                durationMs,
                interruptedCount: interruptionCount + 1, // penalize
                status: "failed_distracted",
            });
        }
        onClose();
    };

    // Math formatting
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    // Progress ring math
    const totalTime = 25 * 60;
    const progress = ((totalTime - timeRemaining) / totalTime) * 100;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050014]/95 backdrop-blur-2xl px-4"
            >
                <div className="max-w-md w-full flex flex-col items-center">

                    {/* Header Stats */}
                    <div className="flex w-full justify-between items-center mb-12">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">Yield Active</span>
                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                            <span className="text-xs font-bold text-indigo-400">{wallet?.cryoCredits || 0} CRYO</span>
                        </div>

                        <div className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors",
                            wallet?.currentStreak && wallet.currentStreak >= 3
                                ? "bg-orange-500/10 border-orange-500/30 text-orange-400"
                                : "bg-white/5 border-white/10 text-white/50"
                        )}>
                            <Flame className="w-4 h-4" />
                            <span className="text-xs font-bold">{wallet?.currentStreak || 0} Streak</span>
                        </div>
                    </div>

                    {/* The Circular Timer */}
                    <div className="relative w-72 h-72 flex items-center justify-center mb-12">
                        {/* Background Ring */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="48"
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="2"
                            />
                            {/* Progress Ring */}
                            <motion.circle
                                cx="50" cy="50" r="48"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="2"
                                strokeDasharray={`${progress * 3.01} 301`}
                                strokeLinecap="round"
                                initial={{ strokeDasharray: "0 301" }}
                                animate={{ strokeDasharray: `${progress * 3.01} 301` }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Time Text */}
                        <div className="text-center">
                            <div className="text-6xl font-bold tracking-tighter text-white tabular-nums drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </div>
                            <div className="text-sm font-medium text-white/40 uppercase tracking-widest mt-2">
                                {isActive ? "Mining Credits..." : "Paused"}
                            </div>
                        </div>
                    </div>

                    {/* Interruption Warning */}
                    {interruptionCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mb-8 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-xl text-sm font-medium"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            {3 - interruptionCount} Strikes Remaining
                        </motion.div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        {isActive ? (
                            <Button onClick={handlePause} size="lg" className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 text-white border-white/10 backdrop-blur-md">
                                <Pause className="w-6 h-6" />
                            </Button>
                        ) : (
                            <Button onClick={handleStart} size="lg" className="w-20 h-20 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:scale-105 transition-transform">
                                <Play className="w-8 h-8 ml-1" />
                            </Button>
                        )}

                        <Button onClick={handleStopEarly} variant="ghost" size="lg" className="h-16 px-6 rounded-full text-white/50 hover:text-white hover:bg-white/5 border border-transparent hover:border-rose-500/30 hover:text-rose-400 transition-colors">
                            <Square className="w-5 h-5 mr-2" />
                            Abort
                        </Button>
                    </div>

                    <p className="mt-12 text-center text-xs text-white/30 max-w-xs mx-auto">
                        Switching tabs or minimizing the app will result in a strike. 3 strikes and the session fails.
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
