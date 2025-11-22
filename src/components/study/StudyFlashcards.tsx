import { useState } from "react";
import { useAction, useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, RotateCw, Check, X, Trash, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "@/convex/_generated/dataModel";

interface StudyFlashcardsProps {
  materialId?: Id<"studyMaterials">;
  autoContent?: string;
  title?: string;
}

export function StudyFlashcards({ materialId, autoContent, title }: StudyFlashcardsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [generateCount, setGenerateCount] = useState(10);
  const [focusInstructions, setFocusInstructions] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const flashcards = useQuery(api.study.listFlashcards, materialId ? { materialId } : "skip") || [];
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const createFlashcard = useMutation(api.study.createFlashcard);
  const deleteFlashcard = useMutation(api.study.deleteFlashcard);
  const updateReview = useMutation(api.study.updateFlashcardReview);

  const currentCard = flashcards[currentIndex];
  
  const notStudiedCount = flashcards.filter((f: any) => !f.reviewCount || f.reviewCount === 0).length;
  const learningCount = flashcards.filter((f: any) => f.status === "learning").length;
  const masteredCount = flashcards.filter((f: any) => f.status === "mastered").length;
  
  const dueText = currentCard?.nextReviewDate 
    ? new Date(currentCard.nextReviewDate).toLocaleDateString() 
    : "New";

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
      if (currentIndex >= flashcards.length - 1) {
        setCurrentIndex(Math.max(0, flashcards.length - 2));
      }
    } catch (error) {
      toast.error("Failed to delete flashcard");
    }
  };

  const handleReview = async (rating: "wrong" | "hard" | "good" | "easy") => {
    if (!currentCard) return;
    try {
      await updateReview({
        flashcardId: currentCard._id,
        rating
      });
      setIsFlipped(false);
      if (currentIndex < flashcards.length - 1) {
        setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
      } else {
        toast.success("You've reviewed all cards!");
        setCurrentIndex(0);
      }
    } catch (error) {
      toast.error("Failed to update review");
    }
  };

  const handleGenerate = async () => {
    if (!materialId || !autoContent || !title) {
        toast.error("Missing information for generation");
        return;
    }
    setIsLoading(true);
    try {
      await generateAllAssets({
        materialId,
        content: autoContent,
        title
      });
      toast.success("Flashcards generated successfully!");
      setShowGenerateDialog(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Flashcards</h2>
          <div className="flex gap-2">
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-popover border-border max-w-md">
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
                          variant={generateCount === count ? "default" : "outline"}
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
                      className="bg-background border-input mt-2"
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
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-popover border-border">
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
                    <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
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

        {!flashcards || flashcards.length === 0 ? (
          <div className="text-center py-12 bg-card/30 rounded-xl border border-border/50">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No flashcards yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Generate flashcards from your document or create them manually</p>
            <Button onClick={() => setShowGenerateDialog(true)}>
                Generate Now
            </Button>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
              <div className="px-4 py-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 whitespace-nowrap">
                {notStudiedCount} Not Studied
              </div>
              <div className="px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 whitespace-nowrap">
                {learningCount} Learning
              </div>
              <div className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 border border-green-500/20 whitespace-nowrap">
                {masteredCount} Mastered
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Card {currentIndex + 1} of {flashcards.length}
                {dueText && <span className="ml-2 text-xs opacity-70">• Due: {dueText}</span>}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteCard}
                className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative h-96 perspective-1000">
                <motion.div
                    className="relative w-full h-full cursor-pointer preserve-3d"
                    onClick={() => setIsFlipped(!isFlipped)}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* Front */}
                    <Card className="absolute inset-0 backface-hidden bg-card border-border shadow-lg flex items-center justify-center p-8">
                        <p className="text-xl text-foreground text-center font-medium">{currentCard?.front}</p>
                        <p className="absolute bottom-4 text-xs text-muted-foreground">Click to flip</p>
                    </Card>
                    
                    {/* Back */}
                    <Card 
                        className="absolute inset-0 backface-hidden bg-card border-border shadow-lg flex items-center justify-center p-8"
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        <p className="text-xl text-foreground text-center">{currentCard?.back}</p>
                    </Card>
                </motion.div>
            </div>

            {isFlipped && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button
                  onClick={() => handleReview("wrong")}
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Wrong
                </Button>
                <Button
                  onClick={() => handleReview("hard")}
                  variant="outline"
                  className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                >
                  Hard
                </Button>
                <Button
                  onClick={() => handleReview("good")}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Good
                </Button>
                <Button
                  onClick={() => handleReview("easy")}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Easy
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
