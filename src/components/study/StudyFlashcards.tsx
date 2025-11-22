import { useState } from "react";
import { useAction, useQuery } from "convex/react";
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

interface StudyFlashcardsProps {
  autoContent?: string;
}

export function StudyFlashcards({ autoContent }: StudyFlashcardsProps) {
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

  // Mock data/handlers for rework
  const flashcards: any[] = [];
  const currentCard: any = null;
  const notStudiedCount = 0;
  const learningCount = 0;
  const masteredCount = 0;
  const dueText = "";

  const handleCreateFlashcard = async () => { toast.info("Creation disabled during rework"); };
  const handleDeleteCard = async () => { toast.info("Deletion disabled during rework"); };
  const handleReview = async (rating: string) => { toast.info("Review disabled during rework"); };

  // const generateFlashcards = useAction(api.studyAI.generateFlashcards);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // await generateFlashcards();
      toast.info("AI flashcard generation is currently disabled.");
    } catch (error) {
      toast.error("Failed to generate flashcards");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Flashcards</h2>
          <div className="flex gap-2">
            <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] max-w-md">
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
                          className={generateCount === count ? "bg-white text-black" : ""}
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
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white mt-2"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full bg-white text-black hover:bg-white/90"
                  >
                    {isLoading ? "Generating..." : `Generate ${generateCount} Flashcards`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-white/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
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
                      className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
                    />
                  </div>
                  <div>
                    <Label>Back (Answer)</Label>
                    <textarea
                      value={back}
                      onChange={(e) => setBack(e.target.value)}
                      placeholder="Enter answer"
                      className="w-full h-24 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-2 text-white"
                    />
                  </div>
                  <div>
                    <Label>Difficulty</Label>
                    <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                      <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleCreateFlashcard} className="w-full bg-white text-black hover:bg-white/90">
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {!flashcards || flashcards.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-white mb-2">No flashcards yet</h3>
            <p className="text-sm text-[#6b6b6b] mb-4">Generate flashcards from your document or create them manually</p>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-6">
              <div className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/50">
                {notStudiedCount} Not Studied
              </div>
              <div className="px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
                {learningCount} Learning
              </div>
              <div className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50">
                {masteredCount} Mastered
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-[#6b6b6b]">
              <span>
                Card {currentIndex + 1} of {flashcards.length}
                {dueText && <span className="ml-2 text-xs text-white/60">• Due: {dueText}</span>}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteCard}
                className="text-red-400 hover:text-red-300"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>

            <motion.div
              className="relative h-96 cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <Card className="absolute inset-0 bg-[#1a1a1a] border-[#2a2a2a]" style={{ backfaceVisibility: "hidden" }}>
                <CardContent className="h-full flex items-center justify-center p-8">
                  <p className="text-xl text-white text-center">{currentCard?.front}</p>
                </CardContent>
              </Card>
              <Card
                className="absolute inset-0 bg-[#1a1a1a] border-[#2a2a2a]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <CardContent className="h-full flex items-center justify-center p-8">
                  <p className="text-xl text-white text-center">{currentCard?.back}</p>
                </CardContent>
              </Card>
            </motion.div>

            {isFlipped && (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleReview("wrong")}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4 mr-2" />
                  Wrong
                </Button>
                <Button
                  onClick={() => handleReview("hard")}
                  variant="outline"
                  className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
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