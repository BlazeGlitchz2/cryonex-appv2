import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  X,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface Flashcard {
  id: Id<"flashcards">;
  front: string;
  back: string;
  difficulty?: "easy" | "medium" | "hard";
}

interface FlashcardModeProps {
  cards: Flashcard[];
  onComplete: (results: any) => void;
  onClose: () => void;
}

export function FlashcardMode({
  cards,
  onComplete,
  onClose,
}: FlashcardModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0); // -1 left, 1 right
  const [results, setResults] = useState<{
    correct: number;
    incorrect: number;
  }>({ correct: 0, incorrect: 0 });

  const reviewFlashcard = useMutation(api.study.updateFlashcardReview);

  const currentCard = cards[currentIndex];
  const progress = (currentIndex / cards.length) * 100;

  const handleRate = async (quality: number) => {
    // quality: 1=Again(wrong), 2=Hard, 3=Good, 4=Easy
    setDirection(quality >= 3 ? 1 : -1);

    // Optimistic update for UI
    setResults((prev) => ({
      correct: prev.correct + (quality >= 3 ? 1 : 0),
      incorrect: prev.incorrect + (quality < 3 ? 1 : 0),
    }));

    const ratingMap: Record<number, "wrong" | "hard" | "good" | "easy"> = {
      1: "wrong",
      2: "hard",
      3: "good",
      4: "easy",
    };

    // Call backend
    try {
      await reviewFlashcard({
        flashcardId: currentCard.id,
        rating: ratingMap[quality],
      });
    } catch (e) {
      console.error("Failed to review card", e);
    }

    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
        setDirection(0);
      } else {
        onComplete(results);
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050014] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0A0A0B]/50 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="rounded-full hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </Button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold">Flashcard Review</span>
          <span className="text-xs text-white/50">
            {currentIndex + 1} / {cards.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-white/10"
        >
          <GraduationCap className="h-5 w-5" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Main Card Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, x: direction * 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: direction * -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-xl aspect-[3/2] perspective-1000 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              className={cn(
                "w-full h-full relative preserve-3d transition-all duration-500",
                isFlipped ? "rotate-y-180" : "",
              )}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden rounded-3xl border border-white/10 bg-[#0A0A0B]/80 backdrop-blur-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">
                  Question
                </span>
                <h3 className="text-2xl md:text-3xl font-bold leading-tight">
                  {currentCard.front}
                </h3>
                <p className="absolute bottom-8 text-xs text-white/30 animate-pulse">
                  Tap to flip
                </p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border border-primary/20 bg-primary/5 backdrop-blur-2xl shadow-2xl p-8 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-4">
                  Answer
                </span>
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-white/90">
                  {currentCard.back}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="mt-12 w-full max-w-xl">
          {!isFlipped ? (
            <Button
              className="w-full h-14 text-lg font-medium bg-white/10 hover:bg-white/20 border border-white/10"
              onClick={() => setIsFlipped(true)}
            >
              Show Answer
            </Button>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(1);
                  }}
                  className="h-14 border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                >
                  Again
                </Button>
                <span className="text-[10px] text-center text-white/30">
                  1 min
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(2);
                  }}
                  className="h-14 border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                >
                  Hard
                </Button>
                <span className="text-[10px] text-center text-white/30">
                  10 min
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(3);
                  }}
                  className="h-14 border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                >
                  Good
                </Button>
                <span className="text-[10px] text-center text-white/30">
                  1 day
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRate(4);
                  }}
                  className="h-14 border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                >
                  Easy
                </Button>
                <span className="text-[10px] text-center text-white/30">
                  4 days
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
