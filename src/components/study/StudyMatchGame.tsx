import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Trophy, Flame, Timer, Sparkles } from "lucide-react";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import cn from "classnames";
import { toast } from "sonner";

interface MatchGameProps {
    flashcards: { front: string; back: string }[];
    onClose: () => void;
}

interface CardType {
    id: string;
    originalId: number;
    content: string;
    type: "front" | "back";
    isMatched: boolean;
    isSelected: boolean;
    isError: boolean;
}

export function StudyMatchGame({ flashcards, onClose }: MatchGameProps) {
    const [cards, setCards] = useState<CardType[]>([]);
    const [selectedCards, setSelectedCards] = useState<CardType[]>([]);

    // Game state
    const [score, setScore] = useState(0);
    const [multiplier, setMultiplier] = useState(1);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    // Initialize Game
    useEffect(() => {
        // Take up to 6 random flashcards to make a 12-card grid
        const gameDeck = [...flashcards]
            .sort(() => Math.random() - 0.5)
            .slice(0, 6);

        let deck: CardType[] = [];
        gameDeck.forEach((card, index) => {
            deck.push({
                id: `f-${index}`,
                originalId: index,
                content: card.front,
                type: "front",
                isMatched: false,
                isSelected: false,
                isError: false,
            });
            deck.push({
                id: `b-${index}`,
                originalId: index,
                content: card.back,
                type: "back",
                isMatched: false,
                isSelected: false,
                isError: false,
            });
        });

        setCards(deck.sort(() => Math.random() - 0.5));
        setIsPlaying(true);
    }, [flashcards]);

    // Timer
    useEffect(() => {
        if (!isPlaying || isGameOver || timeLeft <= 0) {
            if (timeLeft <= 0) setIsGameOver(true);
            return;
        }
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [isPlaying, isGameOver, timeLeft]);

    // Handle Match Logic
    useEffect(() => {
        if (selectedCards.length === 2) {
            const [first, second] = selectedCards;

            const isMatch =
                first.originalId === second.originalId && first.type !== second.type;

            if (isMatch) {
                const handleMatch = async () => {
                    try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch (err) { }
                    setScore((s) => s + 100 * multiplier);
                    setMultiplier((m) => Math.min(m + 1, 5));
                    setCards((prev) =>
                        prev.map((c) =>
                            c.id === first.id || c.id === second.id
                                ? { ...c, isMatched: true, isSelected: false }
                                : c
                        )
                    );
                    setSelectedCards([]);

                    // Check win condition
                    const allMatched = cards.every(c => c.isMatched || c.id === first.id || c.id === second.id);
                    if (allMatched) {
                        setTimeout(() => {
                            toast.success("All pairs matched! Bonus time score added.");
                            setScore(s => s + (timeLeft * 20)); // Bonus points
                            setIsGameOver(true);
                        }, 500);
                    }
                };
                handleMatch();
            } else {
                const handleMismatch = async () => {
                    try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch (err) { }
                    setMultiplier(1);
                    setScore((s) => Math.max(0, s - 10)); // Minor penalty

                    // Show error state briefly
                    setCards(prev => prev.map(c =>
                        c.id === first.id || c.id === second.id
                            ? { ...c, isError: true } : c
                    ));

                    setTimeout(() => {
                        setCards((prev) =>
                            prev.map((c) =>
                                c.id === first.id || c.id === second.id
                                    ? { ...c, isSelected: false, isError: false }
                                    : c
                            )
                        );
                        setSelectedCards([]);
                    }, 600); // Wait 600ms before clearing selection
                };
                handleMismatch();
            }
        }
    }, [selectedCards, multiplier, cards, timeLeft]);

    const handleCardClick = async (card: CardType) => {
        if (isGameOver || card.isMatched || card.isSelected || selectedCards.length === 2) return;
        try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (err) { }

        setCards((prev) =>
            prev.map((c) => (c.id === card.id ? { ...c, isSelected: true } : c))
        );
        setSelectedCards((prev) => [...prev, card]);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#030010] text-white overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-cyan-600/20 blur-[120px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[10%] -right-[10%] w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[120px]"
                />
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#030010]/60 backdrop-blur-2xl">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10 text-white/70 hover:text-white">
                    <X className="h-5 w-5" />
                </Button>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        Quantum Match
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <Timer className="w-3.5 h-3.5 text-rose-400" />
                        <span className={cn("text-xs font-bold tabular-nums", timeLeft < 10 ? "text-rose-400 animate-pulse" : "text-white/60")}>
                            00:{timeLeft.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Score</span>
                        <span className="text-sm font-bold text-emerald-400 tabular-nums">{score}</span>
                    </div>
                </div>
            </div>

            {/* Multiplier HUD */}
            <AnimatePresence>
                {multiplier > 1 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="absolute top-20 right-6 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-500/30 backdrop-blur-md"
                    >
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-black text-orange-400">x{multiplier} COMBO</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid Area */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
                {isGameOver ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center space-y-6"
                    >
                        <div className="w-24 h-24 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center">
                            <Trophy className="w-12 h-12 text-cyan-400" />
                        </div>
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-black text-white">Match Complete</h2>
                            <p className="text-white/50 text-lg">Final Score: <span className="text-emerald-400 font-bold">{score}</span></p>
                        </div>
                        <Button
                            onClick={onClose}
                            className="mt-4 h-12 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-base hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all"
                        >
                            Return to Dashboard
                        </Button>
                    </motion.div>
                ) : (
                    <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                        <AnimatePresence>
                            {cards.map((card) => {
                                if (card.isMatched) return null; // Remove from DOM when matched

                                return (
                                    <motion.div
                                        key={card.id}
                                        layoutId={card.id}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                                        whileHover={{ scale: card.isSelected ? 1 : 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleCardClick(card)}
                                        className={cn(
                                            "relative aspect-[4/3] rounded-2xl cursor-pointer p-4 flex items-center justify-center text-center overflow-hidden transition-all duration-300",
                                            card.isSelected
                                                ? card.isError
                                                    ? "bg-rose-500/20 border-2 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-shake"
                                                    : "bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                                                : "bg-white/[0.04] border border-white/10 hover:border-white/20 glass-panel shadow-lg"
                                        )}
                                    >
                                        {/* Inner border glow if selected */}
                                        {card.isSelected && !card.isError && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                                        )}
                                        {card.isError && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent pointer-events-none" />
                                        )}

                                        <p className={cn(
                                            "relative z-10 text-sm md:text-base font-semibold pointer-events-none",
                                            card.isSelected && !card.isError ? "text-cyan-50" : "text-white/90"
                                        )}>
                                            {card.content}
                                        </p>

                                        {/* Hint overlay */}
                                        <div className="absolute bottom-2 right-3 pointer-events-none opacity-20">
                                            <Sparkles className="w-3 h-3 text-white" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
