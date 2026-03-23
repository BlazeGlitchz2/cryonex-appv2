import React, { lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DashboardFeature } from "@/hooks/use-study-dashboard-handlers";

// Lazy-loaded components
const FlashcardMode = lazy(() => import("@/components/study/FlashcardMode").then(m => ({ default: m.FlashcardMode })));
const QuizGenerator = lazy(() => import("@/components/study/QuizGenerator").then(m => ({ default: m.QuizGenerator })));
const RegionalTrainer = lazy(() => import("@/components/study/RegionalTrainer").then(m => ({ default: m.RegionalTrainer })));
const FocusMode = lazy(() => import("@/components/study/FocusMode").then(m => ({ default: m.FocusMode })));
const StudyMatchGame = lazy(() => import("@/components/study/StudyMatchGame").then(m => ({ default: m.StudyMatchGame })));

interface StudyDashboardOverlaysProps {
    activeFeature: DashboardFeature;
    setActiveFeature: (feature: DashboardFeature) => void;
    isFocusModeOpen: boolean;
    setIsFocusModeOpen: (open: boolean) => void;
    allFlashcards: unknown[];
    selectedTopic: string;
    user: {
        region?: string;
        curriculum?: string;
        curriculumTrack?: string;
        country?: string;
    } | null;
}

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-md">
    <div className="flex w-full max-w-xs flex-col items-center gap-3 rounded-3xl border border-white/10 bg-[#0a0625]/90 px-5 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-white/70">Loading study tools...</p>
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
    const regionalTrainerRegion =
        user?.region === "ksa" || user?.region === "egypt" || user?.region === "uae"
            ? (user.region as "ksa" | "egypt" | "uae")
            : user?.country === "ae"
                ? "uae"
                : "ksa";

    return (
        <Suspense fallback={<LoadingOverlay />}>
            <AnimatePresence mode="wait" initial={false}>
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
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#09090b]/96 backdrop-blur-xl">
                        <div className="absolute right-4 top-safe z-50">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-full text-white hover:bg-white/10"
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
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#09090b]">
                        <RegionalTrainer
                            region={regionalTrainerRegion}
                            curriculum={user?.curriculumTrack || user?.curriculum || "General"}
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
