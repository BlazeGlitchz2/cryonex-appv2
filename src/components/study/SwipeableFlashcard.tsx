import { useState } from "react";
import { motion, useMotionValue, useTransform, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

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

    return (
        <motion.div
            drag={isFlipped ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            style={{ x, rotate, opacity }}
            animate={controls}
            className="relative w-full max-w-4xl aspect-[16/10] lg:aspect-[16/9] perspective-1000 cursor-grab active:cursor-grabbing touch-none select-none"
            onClick={async () => {
                try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) { }
                if (!isFlipped) setIsFlipped(true);
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
                <div className="absolute inset-0 backface-hidden rounded-[2rem] border border-white/[0.08] bg-[#030010]/80 backdrop-blur-3xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] p-8 flex flex-col items-center justify-center text-center overflow-hidden">
                    <div className="absolute -top-32 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
                    <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-cyan-400/80 mb-6 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">Question</span>
                    <h3 className="relative z-10 text-2xl md:text-3xl lg:text-4xl font-bold leading-tight select-none pointer-events-none text-white drop-shadow-md">{front}</h3>
                    <p className="absolute bottom-8 text-xs font-medium text-white/30 animate-pulse tracking-wide">Tap to reveal answer</p>
                </div>

                {/* Back (Answer) */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-[#030010] to-[#0a0f1c] backdrop-blur-3xl shadow-[0_8px_30px_rgba(34,211,238,0.15)] p-8 flex flex-col items-center justify-center text-center overflow-hidden">


                    {/* Swipe Overlays */}
                    <motion.div style={{ opacity: rightIndicatorOpacity }} className="absolute inset-0 bg-gradient-to-l from-green-500/20 to-transparent pointer-events-none" />
                    <motion.div style={{ opacity: leftIndicatorOpacity }} className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent pointer-events-none" />

                    <motion.div style={{ opacity: rightIndicatorOpacity }} className="absolute top-6 right-8 rotate-12 pointer-events-none">
                        <div className="border-[3px] border-emerald-500 text-emerald-400 bg-emerald-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.2)] font-black text-xl md:text-2xl uppercase px-5 py-1.5 rounded-xl tracking-wider">GOT IT</div>
                    </motion.div>
                    <motion.div style={{ opacity: leftIndicatorOpacity }} className="absolute top-6 left-8 -rotate-12 pointer-events-none">
                        <div className="border-[3px] border-rose-500 text-rose-400 bg-rose-500/10 backdrop-blur-md shadow-[0_0_20px_rgba(244,63,94,0.2)] font-black text-xl md:text-2xl uppercase px-5 py-1.5 rounded-xl tracking-wider">REVIEW</div>
                    </motion.div>

                    <span className="relative z-10 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-6 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">Answer</span>
                    <p className="relative z-10 text-xl md:text-2xl font-medium leading-relaxed text-white/90 select-none pointer-events-none mb-4">{back}</p>

                    <p className="absolute bottom-6 text-[10px] text-white/40 font-medium tracking-wider opacity-80 pointer-events-none">
                        <span className="text-emerald-400">Swipe Right</span> to master • <span className="text-rose-400">Swipe Left</span> to review
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}
