import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";

export function ProWelcomePopup() {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);
    const checkProStatus = useMutation(api.users.checkProStatus);

    useEffect(() => {
        // Check if we should upgrade the user or if they are already PRO
        const checkStatus = async () => {
            if (user && user._id) {
                try {
                    // Run the mutation to ensure their tier is correct in DB
                    const result = await checkProStatus();

                    // If they are PRO (either newly upgraded or existing), check if we've shown the welcome
                    if (result?.tier === "PRO" || user.tier === "PRO") {
                        const hasSeenProWelcome = localStorage.getItem("cryonex_pro_welcome_shown");
                        if (!hasSeenProWelcome) {
                            setIsVisible(true);
                            triggerConfetti();
                        }
                    }
                } catch (error) {
                    // Silently ignore - user might not be fully authenticated yet
                    console.log("Pro status check skipped:", error);
                }
            }
        };

        checkStatus();
    }, [user, checkProStatus]);

    const triggerConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

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
                colors: ['#FFD700', '#FFA500', '#FFFFFF']
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                colors: ['#FFD700', '#FFA500', '#FFFFFF']
            });
        }, 250);
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem("cryonex_pro_welcome_shown", "true");
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-gradient-to-b from-[#1a1a1a] to-[#0A0A0B] border border-[#FFD700]/30 text-white rounded-3xl shadow-[0_0_50px_-10px_rgba(255,215,0,0.3)] overflow-hidden"
                    >
                        {/* Decorative Gold Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#FFD700]/20 blur-[50px] rounded-full pointer-events-none" />

                        {/* Header */}
                        <div className="relative p-6 px-8 flex flex-col items-center text-center space-y-6 pt-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#FFD700]/30 blur-xl rounded-full" />
                                <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center shadow-lg border border-[#FFFFF]/20">
                                    <Crown className="h-10 w-10 text-black fill-black" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-black border border-[#FFD700]/50 rounded-full p-1.5 shadow-lg">
                                    <Sparkles className="h-4 w-4 text-[#FFD700]" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FFFACD] to-[#FFD700]">
                                    Welcome to PRO
                                </h2>
                                <p className="text-white/60 text-sm leading-relaxed">
                                    You've unlocked the full power of Cryonex.
                                    Enjoy unlimited access to premium models like <span className="text-[#FFD700]">DeepSeek V3</span>, <span className="text-[#FFD700]">Gemini 1.5 Pro</span>, and exclusive offline capabilities.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 pt-2 bg-white/5 border-t border-white/5">
                            <Button
                                onClick={handleClose}
                                className="w-full h-12 text-base font-bold bg-[#FFD700] text-black hover:bg-[#FFD700]/90 rounded-xl shadow-[0_0_20px_-5px_rgba(255,215,0,0.4)] transition-all hover:scale-[1.02]"
                            >
                                Let's Create Magic ✨
                            </Button>
                        </div>

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
