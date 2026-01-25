"use client"

import * as React from "react"
import { motion } from "framer-motion";

export interface ImageGenerationProps {
    children?: React.ReactNode;
    loadingState?: "starting" | "generating" | "completed";
}

export const ImageGeneration = (
    ({ children, loadingState: externalLoadingState }: ImageGenerationProps) => {
        const [progress, setProgress] = React.useState(0);
        const [internalLoadingState, setInternalLoadingState] = React.useState<
            "starting" | "generating" | "completed"
        >("starting");

        // Use external state if provided, otherwise internal
        const loadingState = externalLoadingState || internalLoadingState;
        const duration = 3000; // Faster duration for better UX if controlled externally, or match average generation time

        React.useEffect(() => {
            // If controlled externally, just animate progress based on state
            if (externalLoadingState) {
                if (externalLoadingState === "starting") {
                    setProgress(10);
                } else if (externalLoadingState === "generating") {
                    // Fake progress up to 90%
                    const interval = setInterval(() => {
                        setProgress(prev => Math.min(90, prev + 1));
                    }, 100);
                    return () => clearInterval(interval);
                } else if (externalLoadingState === "completed") {
                    setProgress(100);
                }
                return;
            }

            // Internal logic (Fallback)
            const startingTimeout = setTimeout(() => {
                setInternalLoadingState("generating");

                const startTime = Date.now();

                const interval = setInterval(() => {
                    const elapsedTime = Date.now() - startTime;
                    const progressPercentage = Math.min(
                        100,
                        (elapsedTime / duration) * 100
                    );

                    setProgress(progressPercentage);

                    if (progressPercentage >= 100) {
                        clearInterval(interval);
                        setInternalLoadingState("completed");
                    }
                }, 16);

                return () => clearInterval(interval);
            }, 1000);

            return () => clearTimeout(startingTimeout);
        }, [duration, externalLoadingState]);

        return (
            <div className="flex flex-col gap-2 w-full max-w-md">
                <motion.span
                    className="bg-[linear-gradient(110deg,var(--color-muted-foreground),35%,var(--color-foreground),50%,var(--color-muted-foreground),75%,var(--color-muted-foreground))] bg-[length:200%_100%] bg-clip-text text-transparent text-base font-medium"
                    initial={{ backgroundPosition: "200% 0" }}
                    animate={{
                        backgroundPosition:
                            loadingState === "completed" ? "0% 0" : "-200% 0",
                    }}
                    transition={{
                        repeat: loadingState === "completed" ? 0 : Infinity,
                        duration: 3,
                        ease: "linear",
                    }}
                >
                    {loadingState === "starting" && "Analyzing Request..."}
                    {loadingState === "generating" && "Creating High-Res Image..."}
                    {loadingState === "completed" && "Image Generated Successfully."}
                </motion.span>
                <div className="relative rounded-xl border border-white/10 bg-black/40 max-w-md overflow-hidden min-h-[200px] flex items-center justify-center">
                    {children}
                    {loadingState !== "completed" && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/20">
                            <div className="h-10 w-10 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                        </div>
                    )}
                    <motion.div
                        className="absolute w-full h-[125%] -top-[25%] pointer-events-none backdrop-blur-3xl bg-cyan-500/10"
                        initial={false}
                        animate={{
                            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                            opacity: loadingState === "completed" ? 0 : 1,
                        }}
                        style={{
                            clipPath: `polygon(0 ${progress}%, 100% ${progress}%, 100% 100%, 0 100%)`,
                            maskImage:
                                progress === 0
                                    ? "linear-gradient(to bottom, black -5%, black 100%)"
                                    : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
                            WebkitMaskImage:
                                progress === 0
                                    ? "linear-gradient(to bottom, black -5%, black 100%)"
                                    : `linear-gradient(to bottom, transparent ${progress - 5}%, transparent ${progress}%, black ${progress + 5}%)`,
                        }}
                    />
                </div>
            </div>
        );
    }
);

ImageGeneration.displayName = "ImageGeneration";
