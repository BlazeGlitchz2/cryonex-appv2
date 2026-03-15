import React, { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Lazy-loaded components
const FlashcardMode = lazy(() => import("@/components/study/FlashcardMode").then(m => ({ default: m.FlashcardMode })));
const QuizGenerator = lazy(() => import("@/components/study/QuizGenerator").then(m => ({ default: m.QuizGenerator })));
const RegionalTrainer = lazy(() => import("@/components/study/RegionalTrainer").then(m => ({ default: m.RegionalTrainer })));
const FocusMode = lazy(() => import("@/components/study/FocusMode").then(m => ({ default: m.FocusMode })));
const StudyMatchGame = lazy(() => import("@/components/study/StudyMatchGame").then(m => ({ default: m.StudyMatchGame })));

interface StudyDashboardOverlaysProps {
    activeFeature: string;
    setActiveFeature: (feature: string) => void;
    isFocusModeOpen: boolean;
    setIsFocusModeOpen: (open: boolean) => void;
    allFlashcards: unknown[];
    selectedTopic: string;
    user: { region?: string } | null;
}

const LoadingOverlay = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md">
        <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm font-medium text-white/50">Loading interface...</p>
        </div>
    </div>
);

export function StudyDashboardOverlays({
    activeFeature,
    setActiveFeature,
    isFocusModeOpen,
    setIsFocusModeOpen,
    allFlashcards,
    selectedTopic,
    user,
}: StudyDashboardOverlaysProps) {
    return (
        <Suspense fallback={<LoadingOverlay />}>
            <AnimatePresence>
                {activeFeature === "flashcards" && (
                    <FlashcardMode
                        cards={(allFlashcards as any[]).map((f) => ({
                            id: f._id,
                            front: f.front,
                            back: f.back,
                            difficulty: f.difficulty,
                        }))}
                        onComplete={(results: { correct: number }) => {
                            toast.success(`Session Complete! Correct: ${results.correct}`);
                            setActiveFeature("dashboard");
                        }}
                        onClose={() => setActiveFeature("dashboard")}
                    />
                )}
                {activeFeature === "match" && (
                    <StudyMatchGame
                        flashcards={(allFlashcards as any[]).map((f) => ({
                            front: f.front,
                            back: f.back,
                        }))}
                        onClose={() => setActiveFeature("dashboard")}
                    />
                )}
                {activeFeature === "quiz" && (
                    <div className="fixed inset-0 z-50 bg-[#09090b]/95 backdrop-blur-xl">
                        <div className="absolute top-5 right-5 z-50">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-lg hover:bg-white/10 text-white w-8 h-8"
                                onClick={() => setActiveFeature("dashboard")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <QuizGenerator
                            topic={selectedTopic}
                            onClose={() => setActiveFeature("dashboard")}
                        />
                    </div>
                )}
                {activeFeature === "regional_trainer" && (
                    <div className="fixed inset-0 z-50 bg-[#09090b] overflow-y-auto">
                        <RegionalTrainer
                            region={(user?.region as "ksa" | "egypt") || "ksa"}
                            curriculum="General"
                            onExit={() => setActiveFeature("dashboard")}
                        />
                    </div>
                )}
                {isFocusModeOpen && (
                    <FocusMode
                        onClose={() => setIsFocusModeOpen(false)}
                    />
                )}
            </AnimatePresence>
        </Suspense>
    );
}
