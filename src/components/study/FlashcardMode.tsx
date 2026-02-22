import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  X,
  GraduationCap,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { SwipeableFlashcard } from "@/components/study/SwipeableFlashcard";
import { useOfflineFlashcards, CachedFlashcard } from "@/hooks/useOfflineFlashcards";

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
  cards: initialCards,
  onComplete,
  onClose,
}: FlashcardModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{
    correct: number;
    incorrect: number;
  }>({ correct: 0, incorrect: 0 });

  const { isOffline, cacheCards, getCachedCards, processReview } = useOfflineFlashcards();

  const [cards, setCards] = useState<CachedFlashcard[]>([]);

  useEffect(() => {
    if (initialCards && initialCards.length > 0) {
      setCards(initialCards);
      cacheCards(initialCards as CachedFlashcard[]);
    } else if (isOffline) {
      const cached = getCachedCards();
      setCards(cached);
    }
  }, [initialCards, isOffline]);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? (currentIndex / cards.length) * 100 : 0;

  const handleSwipe = async (direction: "left" | "right") => {
    // right = got it (Good mode), left = need review (Again mode)
    const isCorrect = direction === "right";
    const quality = isCorrect ? 3 : 1; // 3 = Good, 1 = Again

    setResults((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (!isCorrect ? 1 : 0),
    }));

    const ratingMap: Record<number, "wrong" | "hard" | "good" | "easy"> = {
      1: "wrong",
      2: "hard",
      3: "good",
      4: "easy",
    };

    // Call hook
    if (currentCard) {
      await processReview(currentCard.id, ratingMap[quality]);
    }

    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onComplete(results);
      }
    }, 200); // give time for the card to exit screen
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

        {currentCard ? (
          <SwipeableFlashcard
            key={currentCard.id}
            front={currentCard.front}
            back={currentCard.back}
            onSwipe={handleSwipe}
          />
        ) : (
          <div className="text-center text-white/50">All cards reviewed!</div>
        )}

      </div>
    </div>
  );
}
