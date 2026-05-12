import { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface SwipeableFlashcardProps {
    front: string;
    back: string;
    onSwipe: (direction: "left" | "right") => void;
    compact?: boolean;
    onFlipChange?: (flipped: boolean) => void;
}

export function SwipeableFlashcard({ front, back, onSwipe, compact = false, onFlipChange }: SwipeableFlashcardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const x = useMotionValue(0);
    const controls = useAnimation();

    // Maps the x-axis drag to rotation and opacity
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

    // Visual cues for direction
    const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);
    const leftIndicatorOpacity = useTransform(x, [0, -100], [0, 1]);

    const handleDragEnd = async (e: any, info: any) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
            try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
            onSwipe("right");
        } else if (info.offset.x < -threshold) {
            try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (e) { }
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
            onSwipe("left");
        } else {
            try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
            controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
    };

    const facePadding = compact ? "p-5 sm:p-6" : "p-6 sm:p-8";
    const contentHeight = compact
        ? "max-h-[calc(100%-5.75rem)]"
        : "max-h-[calc(100%-6.5rem)]";

    return (
        <motion.div
            drag={isFlipped ? "x" : false}
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            animate={controls}
            className={cn(
                "relative w-full perspective-1000 cursor-grab touch-pan-y select-none active:cursor-grabbing",
                compact ? "max-w-[28rem] aspect-[4/5] sm:aspect-[16/10]" : "max-w-4xl aspect-[16/10] lg:aspect-[16/9]",
            )}
            onClick={async () => {
                try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                const next = !isFlipped;
                setIsFlipped(next);
                onFlipChange?.(next);
            }}
        >
            <motion.div
                className={cn(
                    "w-full h-full relative transition-transform duration-500",
                )}
                style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
            >
                {/* Front (Question) */}
                <div className={cn(
                    "absolute inset-0 rounded-[2rem] border border-white/[0.08] bg-[#030010]/80 backdrop-blur-3xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center text-center overflow-hidden",
                    facePadding,
                )}
                style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}>
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <span className={cn(
                        "relative z-10 font-bold uppercase tracking-widest text-cyan-400/80 mb-5 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20",
                        compact ? "text-[9px]" : "text-[10px]",
                    )}>Question</span>
                    <div
                        className={cn(
                            "relative z-10 w-full overflow-y-auto overscroll-contain px-1 custom-scrollbar",
                            contentHeight,
                        )}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <h3 className={cn(
                            "font-bold leading-tight select-text text-white drop-shadow-md",
                            compact ? "text-xl sm:text-2xl" : "text-2xl md:text-3xl lg:text-4xl",
                        )}>{front}</h3>
                    </div>
                    <p className={cn(
                        "absolute font-medium text-white/30 animate-pulse tracking-wide",
                        compact ? "bottom-5 text-[10px]" : "bottom-8 text-xs",
                    )}>Tap to reveal answer</p>
                </div>

                {/* Back (Answer) */}
                <div className={cn(
                    "absolute inset-0 rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-[#030010] to-[#0a0f1c] backdrop-blur-3xl shadow-[0_8px_30px_rgba(34,211,238,0.15)] flex flex-col items-center justify-center text-center overflow-hidden",
                    facePadding,
                )}
                style={{
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                }}>


                    {/* Swipe Overlays */}
                    <motion.div style={{ opacity: rightIndicatorOpacity }} className="absolute inset-0 bg-gradient-to-l from-green-500/20 to-transparent pointer-events-none" />
                    <motion.div style={{ opacity: leftIndicatorOpacity }} className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent pointer-events-none" />

                    <motion.div style={{ opacity: rightIndicatorOpacity }} className="absolute top-4 right-4 rotate-12 pointer-events-none">
                        <div className={cn(
                            "border-[3px] border-emerald-500 text-emerald-400 bg-emerald-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)] font-black uppercase px-4 py-1.5 rounded-xl tracking-wider",
                            compact ? "text-base sm:text-lg" : "text-xl md:text-2xl",
                        )}>GOT IT</div>
                    </motion.div>
                    <motion.div style={{ opacity: leftIndicatorOpacity }} className="absolute top-4 left-4 -rotate-12 pointer-events-none">
                        <div className={cn(
                            "border-[3px] border-rose-500 text-rose-400 bg-rose-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.2)] font-black uppercase px-4 py-1.5 rounded-xl tracking-wider",
                            compact ? "text-base sm:text-lg" : "text-xl md:text-2xl",
                        )}>REVIEW</div>
                    </motion.div>

                    <span className={cn(
                        "relative z-10 font-bold uppercase tracking-widest text-emerald-400 mb-5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20",
                        compact ? "text-[9px]" : "text-[10px]",
                    )}>Answer</span>
                    <div
                        className={cn(
                            "relative z-10 mb-4 w-full overflow-y-auto overscroll-contain px-1 custom-scrollbar",
                            contentHeight,
                        )}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <p className={cn(
                            "font-medium leading-relaxed text-white/90 select-text",
                            compact ? "text-base sm:text-lg" : "text-xl md:text-2xl",
                        )}>{back}</p>
                    </div>

                    <p className={cn(
                        "absolute text-white/40 font-medium tracking-wider opacity-80 pointer-events-none",
                        compact ? "bottom-4 text-[9px]" : "bottom-6 text-[10px]",
                    )}>
                        <span className="text-emerald-400">Swipe Right</span> to master • <span className="text-rose-400">Swipe Left</span> to review
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
