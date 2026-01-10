import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface AssetPreloaderProps {
    onComplete: () => void;
}

export function AssetPreloader({ onComplete }: AssetPreloaderProps) {
    const [progress, setProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const TOTAL_FRAMES_TO_PRELOAD = 240;

    useEffect(() => {
        // Simulate loading for premium feel
        const duration = 2000; // 2 seconds
        const interval = 20;
        const steps = duration / interval;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            const newProgress = Math.min(Math.round((currentStep / steps) * 100), 100);
            setProgress(newProgress);

            if (currentStep >= steps) {
                clearInterval(timer);
                setLoaded(true);
            }
        }, interval);

        return () => clearInterval(timer);
    }, []);

    return (
        <AnimatePresence>
            {!loaded ? (
                <motion.div
                    key="loader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#000000]"
                >
                    <div className="w-64 space-y-4">
                        <div className="flex justify-between text-xs uppercase tracking-widest text-white/40">
                            <span>Loading Assets</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                className="h-full bg-[#D2FF00]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "linear" }}
                            />
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="enter"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#000000]"
                >
                    <Button
                        onClick={onComplete}
                        className="group relative overflow-hidden rounded-full bg-[#D2FF00] px-8 py-6 text-lg font-bold text-black transition-transform hover:scale-105"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            ENTER EXPERIENCE <ArrowRight className="h-5 w-5" />
                        </span>
                        <div className="absolute inset-0 -z-0 bg-white opacity-0 transition-opacity group-hover:opacity-20" />
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
