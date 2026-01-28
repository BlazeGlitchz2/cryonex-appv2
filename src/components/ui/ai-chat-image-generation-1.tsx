"use client"

import * as React from "react"
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ImageGenerationProps {
    children?: React.ReactNode;
    loadingState?: "starting" | "generating" | "completed";
}

export const ImageGeneration: React.FC<ImageGenerationProps> = (
    ({ children, loadingState: externalLoadingState }: ImageGenerationProps) => {
        const [progress, setProgress] = React.useState(0);
        const [internalLoadingState, setInternalLoadingState] = React.useState<
            "starting" | "generating" | "completed"
        >("starting");

        const loadingState = externalLoadingState || internalLoadingState;
        const duration = 30000;

        React.useEffect(() => {
            // If external state is provided, we might want to handle progress differently or just rely on the internal timer as visual filler
            // The user's code uses a fixed timer sequence. Let's adapt it to verify if we should run it.

            const startingTimeout = setTimeout(() => {
                if (!externalLoadingState) setInternalLoadingState("generating");

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
                        if (!externalLoadingState) setInternalLoadingState("completed");
                    }
                }, 16);

                return () => clearInterval(interval);
            }, 3000);

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
                    {loadingState === "starting" && "Getting started."}
                    {loadingState === "generating" && "Creating image. May take a moment."}
                    {loadingState === "completed" && "Image created."}
                </motion.span>
                <div className="relative rounded-xl border bg-card/50 border-white/10 max-w-md overflow-hidden min-h-[250px] flex flex-col items-center justify-center p-8 text-center group">
                    {children}

                    {loadingState !== "completed" && (
                        <div className="flex flex-col items-center gap-4 z-10">
                            <div className="relative">
                                <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <div className="absolute inset-0 h-12 w-12 border-4 border-transparent border-b-cyan-500 rounded-full animate-spin [animation-duration:2s]" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-white/80 animate-pulse">
                                    Cryonex Engine Processing
                                </p>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">
                                    Stabilizing Neural pathways
                                </p>
                            </div>
                        </div>
                    )}

                    <motion.div
                        className="absolute inset-0 pointer-events-none backdrop-blur-3xl bg-primary/5"
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

                    {/* Animated Background Mesh for loading state */}
                    {loadingState !== "completed" && (
                        <div className="absolute inset-0 -z-10 overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[100px] animate-pulse" />
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

ImageGeneration.displayName = "ImageGeneration";
