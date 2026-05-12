import { useEffect, useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  RotateCw,
  Check,
  X,
  Trash,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { SwipeableFlashcard } from "@/components/study/SwipeableFlashcard";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface StudyFlashcardsProps {
  materialId?: Id<"studyMaterials"> | null;
  shareId?: string;
  autoContent?: string;
  title?: string;
}

export function StudyFlashcards({
  materialId,
  shareId,
  autoContent,
  title,
}: StudyFlashcardsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [focusInstructions, setFocusInstructions] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // Sync viewMode with screen size initially
  useEffect(() => {
    setViewMode(isMobile ? "mobile" : "desktop");
  }, [isMobile]);

  const flashcards =
    useQuery(
      api.study.listFlashcards,
      materialId || shareId
        ? { materialId: materialId || undefined, shareId }
        : "skip",
    ) ||
    [];
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const createFlashcard = useMutation(api.study.createFlashcard);
  const deleteFlashcard = useMutation(api.study.deleteFlashcard);
  const updateReview = useMutation(api.study.updateFlashcardReview);

  useEffect(() => {
    if (flashcards.length === 0) {
      if (currentIndex !== 0) setCurrentIndex(0);
      setIsFlipped(false);
      return;
    }

    if (currentIndex > flashcards.length - 1) {
      setCurrentIndex(flashcards.length - 1);
    }
  }, [flashcards.length]); // Only respond to length changes

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const safeIndex =
    flashcards.length > 0
      ? Math.min(currentIndex, flashcards.length - 1)
      : 0;
  const currentCard = flashcards[safeIndex];

  const notStudiedCount = flashcards.filter(
    (f: any) => !f.reviewCount || f.reviewCount === 0,
  ).length;
  const learningCount = flashcards.filter(
    (f: any) => f.status === "learning",
  ).length;
  const masteredCount = flashcards.filter(
    (f: any) => f.status === "mastered",
  ).length;

  const dueText = currentCard?.nextReviewDate
    ? new Date(currentCard.nextReviewDate).toLocaleDateString()
    : "New";
  const progress =
    flashcards.length > 0 ? ((safeIndex + 1) / flashcards.length) * 100 : 0;

  const handleCreateFlashcard = async () => {
    if (!materialId || !front || !back) return;
    try {
      await createFlashcard({
        materialId,
        front,
        back,
        difficulty: difficulty as "easy" | "medium" | "hard",
      });
      toast.success("Flashcard created");
      setShowCreateDialog(false);
      setFront("");
      setBack("");
    } catch (error) {
      toast.error("Failed to create flashcard");
    }
  };

  const handleDeleteCard = async () => {
    if (!currentCard) return;
    try {
      await deleteFlashcard({ flashcardId: currentCard._id });
      toast.success("Flashcard deleted");
      if (safeIndex >= flashcards.length - 1) {
        setCurrentIndex(Math.max(0, flashcards.length - 2));
      }
    } catch (error) {
      toast.error("Failed to delete flashcard");
    }
  };

  const handleReview = async (rating: "wrong" | "hard" | "good" | "easy") => {
    if (!currentCard) return;

    const next = () => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        toast.success("Lesson Complete!", {
          description: "You've reviewed all cards in this set.",
          icon: <Check className="h-4 w-4" />,
        });
      }
    };

    try {
      await updateReview({ flashcardId: currentCard._id, rating });
      toast.success(`Rated as ${rating}`, { duration: 1000 });
      next();
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentCard) return;
    // Right = Good, Left = Wrong/Again
    const rating = direction === "right" ? "good" : "wrong";
    handleReview(rating);
  };

  const handleGenerate = async () => {
    if (!materialId) {
      if (materialId === undefined) return;
      toast.error("Study material not found. Please re-upload or select a valid material.");
      return;
    }
    const content = (autoContent || "").trim();
    if (content.length < 50) {
      toast.error("Source material is too short for high-quality AI generation. Please add more content first.", {
        description: "At least 50 characters of text are required.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await generateAllAssets({
        materialId,
        content: content,
        title: title || "Flashcards",
        focusPrompt: focusInstructions.trim() || undefined,
        flashcardCount: generateCount,
      });
      toast.success("Flashcards generated successfully!");
      setShowGenerateDialog(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to generate flashcards";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground">Flashcards</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Tap to flip, swipe to grade, and keep the deck moving.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Dialog
                open={showGenerateDialog}
                onOpenChange={setShowGenerateDialog}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="rounded-full bg-blue-500 px-3 text-white hover:bg-blue-600">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                    Generate
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-popover border-border w-[92vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle>Generate Flashcards</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Number of Flashcards</Label>
                      <div className="mt-2 grid grid-cols-4 gap-2">
                        {[10, 20, 30, 50].map((count) => (
                          <Button
                            key={count}
                            variant={generateCount === count ? "default" : "outline"}
                            onClick={() => setGenerateCount(count)}
                            className="px-0"
                          >
                            {count}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Focus on specific topics (optional)</Label>
                      <Textarea
                        value={focusInstructions}
                        onChange={(e) => setFocusInstructions(e.target.value)}
                        placeholder="e.g., Focus on key definitions, formulas, or specific chapters..."
                        className="bg-background border-input mt-2"
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Generating..." : "Generate Flashcards"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="rounded-full px-3">
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-popover border-border w-[92vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Flashcard</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Front (Question)</Label>
                      <Input
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        placeholder="Enter question"
                        className="bg-background border-input"
                      />
                    </div>
                    <div>
                      <Label>Back (Answer)</Label>
                      <Textarea
                        value={back}
                        onChange={(e) => setBack(e.target.value)}
                        placeholder="Enter answer"
                        className="bg-background border-input h-24"
                      />
                    </div>
                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={difficulty}
                        onValueChange={(value: any) => setDifficulty(value)}
                      >
                        <SelectTrigger className="bg-background border-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateFlashcard} className="w-full">
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["Deck", `${flashcards.length}`],
              ["New", `${notStudiedCount}`],
              ["Learn", `${learningCount}`],
              ["Mastered", `${masteredCount}`],
            ].map(([label, value]) => (
              <span
                key={label}
                className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[11px] font-medium text-foreground/70"
              >
                {label}: {value}
              </span>
            ))}
          </div>
        </div>

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {!flashcards || flashcards.length === 0 ? (
            <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center rounded-[28px] border border-dashed border-border/60 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.08),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-6 py-12 text-center">
              <Sparkles className="mb-4 h-10 w-10 text-cyan-300/70" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No flashcards yet
              </h3>
              <p className="mb-5 text-sm leading-6 text-muted-foreground">
                Generate a deck from the PDF you uploaded, or create a few cards manually to start reviewing right away.
              </p>
              <Button onClick={() => setShowGenerateDialog(true)} className="rounded-full">
                Generate Now
              </Button>
            </div>
          ) : (
            <div className="mx-auto flex min-h-full w-full max-w-md flex-col">
              <div className="mb-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                  Card {safeIndex + 1} / {flashcards.length}
                </span>
                <span className="rounded-full border border-border/60 px-3 py-1">
                  Due {dueText}
                </span>
                {currentCard?.difficulty ? (
                  <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 capitalize text-blue-300">
                    {currentCard.difficulty}
                  </span>
                ) : null}
              </div>

              <div className="flex min-h-[22rem] flex-1 items-center justify-center py-2">
                <SwipeableFlashcard
                  key={currentCard?._id}
                  front={currentCard?.front || ""}
                  back={currentCard?.back || ""}
                  onSwipe={handleSwipe}
                  compact
                  onFlipChange={setIsFlipped}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={safeIndex === 0}
                  className="rounded-full"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className="rounded-full"
                >
                  <RotateCw className="mr-2 h-4 w-4" />
                  {isFlipped ? "Hide answer" : "Flip card"}
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleReview("wrong")}
                  variant="outline"
                  disabled={!isFlipped}
                  className="rounded-full border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  Again
                </Button>
                <Button
                  onClick={() => handleReview("hard")}
                  variant="outline"
                  disabled={!isFlipped}
                  className="rounded-full border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                >
                  Hard
                </Button>
                <Button
                  onClick={() => handleReview("good")}
                  disabled={!isFlipped}
                  className="rounded-full bg-blue-500 text-white hover:bg-blue-600"
                >
                  Good
                </Button>
                <Button
                  onClick={() => handleReview("easy")}
                  disabled={!isFlipped}
                  className="rounded-full bg-green-500 text-white hover:bg-green-600"
                >
                  Easy
                </Button>
              </div>

              <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                Tap the card to flip it. Swipe right for good, left for review.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#f8fafc] text-slate-950 dark:bg-[#080b10] dark:text-white">
      <div className="mx-auto flex w-full max-w-[110rem] flex-col gap-5 px-3 py-4 pb-40 sm:px-4 md:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_16px_48px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#0d1117] dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
              Active Recall
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">
              Flashcards
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Generate, review, and grade source-grounded cards tied to this workspace.
              Progress updates as you score each card.
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog
              open={showGenerateDialog}
              onOpenChange={setShowGenerateDialog}
            >
              <DialogTrigger asChild>
                <Button className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-[#0d1117] dark:text-white">
                <DialogHeader>
                  <DialogTitle>Generate Flashcards</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Number of Flashcards</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {[10, 20, 30, 50].map((count) => (
                        <Button
                          key={count}
                          variant={
                            generateCount === count ? "default" : "outline"
                          }
                          onClick={() => setGenerateCount(count)}
                          className={generateCount === count ? "" : ""}
                        >
                          {count}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Focus on specific topics (optional)</Label>
                    <Textarea
                      value={focusInstructions}
                      onChange={(e) => setFocusInstructions(e.target.value)}
                      placeholder="e.g., Focus on key definitions, formulas, or specific chapters..."
                      className="mt-2 border-slate-200 bg-white dark:border-white/10 dark:bg-[#080b10]"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Generating..." : `Generate Flashcards`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="rounded-lg border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-[#0d1117] dark:text-white">
                <DialogHeader>
                  <DialogTitle>Create Flashcard</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Front (Question)</Label>
                    <Input
                      value={front}
                      onChange={(e) => setFront(e.target.value)}
                      placeholder="Enter question"
                      className="border-slate-200 bg-white dark:border-white/10 dark:bg-[#080b10]"
                    />
                  </div>
                  <div>
                    <Label>Back (Answer)</Label>
                    <Textarea
                      value={back}
                      onChange={(e) => setBack(e.target.value)}
                      placeholder="Enter answer"
                      className="h-24 border-slate-200 bg-white dark:border-white/10 dark:bg-[#080b10]"
                    />
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(value: any) => setDifficulty(value)}
                    >
                      <SelectTrigger className="border-slate-200 bg-white dark:border-white/10 dark:bg-[#080b10]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateFlashcard} className="w-full">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Deck Size", `${flashcards.length}`],
            ["New", `${notStudiedCount}`],
            ["Learning", `${learningCount}`],
            ["Mastered", `${masteredCount}`],
          ].map(([label, value]) => (
            <Card
              key={label}
              className="rounded-xl border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#0d1117]"
            >
              <CardContent className="p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">
                  {value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {!flashcards || flashcards.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-[0_14px_38px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-[#0d1117]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-950 dark:text-white mb-2">
              No flashcards yet
            </h3>
            <p className="mx-auto mb-5 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Generate a deck from the PDF you uploaded, or create a few cards
              manually to start reviewing right away.
            </p>
            <Button onClick={() => setShowGenerateDialog(true)} className="rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Generate Now
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                    Card {safeIndex + 1} / {flashcards.length}
                  </span>
                  <span className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                    Due {dueText}
                  </span>
                  {currentCard?.difficulty ? (
                    <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs capitalize text-blue-700 dark:text-blue-300">
                      {currentCard.difficulty}
                    </span>
                  ) : null}
                </div>
                <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500 dark:bg-blue-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 shadow-sm dark:border-white/10 dark:bg-[#0d1117]">
                <Button
                  variant={viewMode === "desktop" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("desktop")}
                  className="h-8 rounded-md px-3 text-[10px] font-bold uppercase tracking-wider"
                >
                  <Monitor className="mr-1.5 h-3 w-3" />
                  Desktop
                </Button>
                <Button
                  variant={viewMode === "mobile" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("mobile")}
                  className="h-8 rounded-md px-3 text-[10px] font-bold uppercase tracking-wider"
                >
                  <Smartphone className="mr-1.5 h-3 w-3" />
                  Swipe
                </Button>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_21rem]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                      Card {safeIndex + 1} / {flashcards.length}
                    </span>
                    <span className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                      Due: {dueText}
                    </span>
                    {currentCard?.difficulty ? (
                      <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs capitalize text-blue-700 dark:text-blue-300">
                        {currentCard.difficulty}
                      </span>
                    ) : null}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteCard}
                    className="h-9 gap-2 rounded-lg px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash className="h-4 w-4" />
                    Delete
                  </Button>
                </div>

                {viewMode === "mobile" ? (
                  <div className="flex justify-center overflow-visible px-1 py-8">
                    <div className="w-full max-w-2xl px-4">
                      <SwipeableFlashcard
                        key={currentCard?._id}
                        front={currentCard?.front || ""}
                        back={currentCard?.back || ""}
                        onSwipe={handleSwipe}
                      />
                    </div>
                  </div>
                ) : (
                  <Card className="overflow-hidden rounded-xl border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0d1117] dark:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
                    <CardContent className="p-0">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${currentCard?._id}-${isFlipped ? "back" : "front"}`}
                          initial={{ opacity: 0, y: 16, scale: 0.985 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -12, scale: 0.985 }}
                          transition={{ duration: 0.2 }}
                          className="flex min-h-[30rem] flex-col"
                        >
                          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10 md:px-8">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
                                {isFlipped ? "Answer" : "Question"}
                              </p>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {isFlipped
                                  ? "Use the explanation to grade yourself honestly."
                                  : "Read the prompt first, then reveal the answer when ready."}
                              </p>
                            </div>
                            <Button
                              variant="secondary"
                              onClick={() => setIsFlipped((prev) => !prev)}
                              className="rounded-lg border border-slate-200 bg-slate-50 px-4 text-slate-800 hover:bg-slate-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                            >
                              <RotateCw className="mr-2 h-4 w-4" />
                              {isFlipped ? "Show question" : "Flip card"}
                            </Button>
                          </div>

                          <ScrollArea className="min-h-0 flex-1 overflow-y-auto">
                            <div className="flex min-h-[24rem] items-center justify-center px-6 py-10 md:px-10 md:py-12">
                              <div className="mx-auto w-full max-w-5xl text-center">
                                <p
                                  className={
                                    isFlipped
                                      ? "text-lg leading-8 text-slate-700 dark:text-white/90 md:text-2xl md:leading-10"
                                      : "text-2xl font-semibold leading-10 text-slate-950 dark:text-white md:text-4xl md:leading-[1.35]"
                                  }
                                >
                                  {isFlipped ? currentCard?.back : currentCard?.front}
                                </p>
                              </div>
                            </div>
                          </ScrollArea>
                        </motion.div>
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                )}

                {viewMode === "desktop" && (
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentIndex((prev) => Math.max(0, prev - 1))
                        }
                        disabled={safeIndex === 0}
                        className="rounded-lg"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setIsFlipped((prev) => !prev)}
                        className="rounded-lg"
                      >
                        <RotateCw className="mr-2 h-4 w-4" />
                        {isFlipped ? "Hide answer" : "Reveal answer"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setCurrentIndex((prev) =>
                            Math.min(flashcards.length - 1, prev + 1),
                          )
                        }
                        disabled={safeIndex >= flashcards.length - 1}
                        className="rounded-lg"
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      <Button
                        onClick={() => handleReview("wrong")}
                        variant="outline"
                        disabled={!isFlipped}
                        className="rounded-lg border-destructive/50 text-destructive hover:bg-destructive/10"
                      >
                        Again
                      </Button>
                      <Button
                        onClick={() => handleReview("hard")}
                        variant="outline"
                        disabled={!isFlipped}
                        className="rounded-lg border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                      >
                        Hard
                      </Button>
                      <Button
                        onClick={() => handleReview("good")}
                        disabled={!isFlipped}
                        className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Good
                      </Button>
                      <Button
                        onClick={() => handleReview("easy")}
                        disabled={!isFlipped}
                        className="rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Easy
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Card className="rounded-xl border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#0d1117]">
                <CardContent className="space-y-5 p-5">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                      Review Guide
                    </p>
                    <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                      Keep the flashcard flow moving
                    </h3>
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      Reveal the answer, score yourself, and move on. The rating
                      buttons update spaced repetition and advance the deck.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Next step
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {isFlipped
                          ? "Choose a rating to schedule the next review."
                          : "Flip the card when you’ve recalled the answer."}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Current streak
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {masteredCount} mastered, {learningCount} still in learning.
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Card focus
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
                        {currentCard?.front?.slice(0, 80) || "Select a card to begin"}
                        {currentCard?.front && currentCard.front.length > 80 ? "..." : ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
