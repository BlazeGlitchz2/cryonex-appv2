import { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";

interface SwipeableFlashcardProps {
    front: string;
    back: string;
    onSwipe: (direction: "left" | "right") => void;
}

export function SwipeableFlashcard({ front, back, onSwipe }: SwipeableFlashcardProps) {
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
            await controls.start({ x: 500, opacity: 0, transition: { duration: 0.3 } });
            onSwipe("right");
        } else if (info.offset.x < -threshold) {
            await controls.start({ x: -500, opacity: 0, transition: { duration: 0.3 } });
            onSwipe("left");
        } else {
            controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
        }
    };

    return (
        <motion.div
            drag={isFlipped ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            animate={controls}
            className="relative w-full max-w-xl aspect-[3/2] perspective-1000 cursor-grab active:cursor-grabbing touch-none select-none"
            onClick={() => {
                if (!isFlipped) setIsFlipped(true); // Can flip back too if desired, but typical is click to reveal
                else setIsFlipped(!isFlipped);
            }}
        >
            <motion.div
                className={cn(
                    "w-full h-full relative preserve-3d transition-transform duration-500",
                    isFlipped ? "rotate-y-180" : ""
                )}
            >
                {/* Front (Question) */}
                <div className="absolute inset-0 backface-hidden rounded-[2rem] border border-white/10 bg-[#0A0A0B]/80 backdrop-blur-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">Question</span>
                    <h3 className="text-2xl md:text-3xl font-bold leading-tight select-none pointer-events-none">{front}</h3>
                    <p className="absolute bottom-8 text-xs text-white/30 animate-pulse">Tap to reveal answer</p>
                </div>

                {/* Back (Answer) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[2rem] border border-primary/20 bg-primary/5 backdrop-blur-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center overflow-hidden">

                    {/* Swipe Overlays */}
                    <motion.div style={{ opacity: rightIndicatorOpacity }} className="absolute inset-0 bg-gradient-to-l from-green-500/20 to-transparent pointer-events-none" />
                    <motion.div style={{ opacity: leftIndicatorOpacity }} className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent pointer-events-none" />

                    <motion.div style={{ opacity: rightIndicatorOpacity }} className="absolute top-6 right-8 rotate-12 pointer-events-none">
                        <div className="border-4 border-green-500 text-green-500 font-bold text-xl uppercase px-4 py-1 rounded-lg">GOT IT</div>
                    </motion.div>
                    <motion.div style={{ opacity: leftIndicatorOpacity }} className="absolute top-6 left-8 -rotate-12 pointer-events-none">
                        <div className="border-4 border-red-500 text-red-500 font-bold text-xl uppercase px-4 py-1 rounded-lg">REVIEW</div>
                    </motion.div>

                    <span className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-4">Answer</span>
                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-white/90 select-none pointer-events-none mb-4">{back}</p>

                    <p className="absolute bottom-6 text-[10px] text-white/40 uppercase tracking-widest opacity-80 pointer-events-none">
                        Swipe Right if you knew it • Swipe Left to review again
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
