import { useState } from "react";
import { useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Play, Trophy, Clock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";

export function StudyQuizzes({ autoContent }: { autoContent?: string }) {
  const notes = useQuery(api.study.listNotes, {});
  const materials = useQuery(api.study.listMaterials, {});
  const quizzes = useQuery(api.study.listQuizzes, {});
  const generateQuiz = useAction(api.studyAI.generateQuiz);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string>("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>("");
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [quizActive, setQuizActive] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [shortAnswerText, setShortAnswerText] = useState("");

  // Auto-generate a quiz from provided content once
  useEffect(() => {
    const run = async () => {
      if (autoTriggered) return;
      if (!autoContent || !autoContent.trim()) return;
      if (quizActive || currentQuiz) return;
      setAutoTriggered(true);
      setIsGenerating(true);
      const loading = toast.loading("Generating quiz from your document…");
      try {
        const questions = await generateQuiz({
          content: autoContent,
          questionCount,
          difficulty,
        });
        setCurrentQuiz(questions);
        setQuizActive(true);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setSelectedAnswer("");
        setQuizComplete(false);
        setScore(0);
        toast.success(`Generated ${questions.length} questions`);
      } catch (e: any) {
        toast.error(e?.message || "Failed to auto-generate quiz");
      } finally {
        toast.dismiss(loading);
        setIsGenerating(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoContent, quizActive, currentQuiz, questionCount, difficulty]);

  const handleGenerateQuiz = async () => {
    if (!selectedNoteId && !selectedMaterialId) {
      toast.error("Please select a note or material");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("AI is generating your quiz...");
    
    try {
      let content = "";
      
      if (selectedNoteId) {
        const note = notes?.find(n => n._id === selectedNoteId);
        if (note) content = note.content;
      } else if (selectedMaterialId) {
        const material = materials?.find(m => m._id === selectedMaterialId);
        if (material && material.content) content = material.content;
      }

      if (!content) {
        throw new Error("No content found to generate quiz from");
      }

      const questions = await generateQuiz({ 
        content,
        questionCount,
        difficulty
      });
      
      toast.dismiss(loadingToast);
      toast.success(`Generated ${questions.length} questions!`);
      setCurrentQuiz(questions);
      setShowCreateDialog(false);
      setQuizActive(true);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setSelectedAnswer("");
      setQuizComplete(false);
      setScore(0);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.message || "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!currentQuiz) return;
    const currentQuestion = currentQuiz[currentQuestionIndex];

    // If short answer or fill-in-the-blank, allow free-text input
    if (currentQuestion.type === "short_answer" || currentQuestion.type === "fill_blank") {
      if (!shortAnswerText.trim()) {
        toast.error("Please enter your answer");
        return;
      }
      const userAns = shortAnswerText.trim();
      const correct = (currentQuestion.correctAnswer || "").toString().trim();
      const acceptable: Array<string> = Array.isArray(currentQuestion.acceptableAnswers)
        ? currentQuestion.acceptableAnswers
        : [];

      const normalized = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
      const isCorrect =
        normalized(userAns) === normalized(correct) ||
        acceptable.some((a) => normalized(a) === normalized(userAns));

      if (isCorrect) {
        setScore(score + 1);
        toast.success("Correct!");
      } else {
        toast.error(`Incorrect. The answer was: ${currentQuestion.correctAnswer}`);
      }

      const newAnswers = [...userAnswers, userAns];
      setUserAnswers(newAnswers);
      setShortAnswerText("");
      setSelectedAnswer("");

      if (currentQuestionIndex < currentQuiz.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizComplete(true);
      }
      return;
    }

    if (!selectedAnswer) {
      toast.error("Please select an answer");
      return;
    }

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      toast.success("Correct!");
    } else {
      toast.error(`Incorrect. The answer was: ${currentQuestion.correctAnswer}`);
    }

    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);
    setSelectedAnswer("");

    if (currentQuestionIndex < currentQuiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizActive(false);
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedAnswer("");
    setQuizComplete(false);
    setScore(0);
  };

  if (quizActive && currentQuiz) {
    if (quizComplete) {
      const percentage = Math.round((score / currentQuiz.length) * 100);
      
      return (
        <div className="h-full flex items-center justify-center p-6">
          <Card className="w-full max-w-2xl bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="text-center text-2xl">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                <p className="text-4xl font-bold text-white mb-2">{percentage}%</p>
                <p className="text-[#6b6b6b]">
                  You got {score} out of {currentQuiz.length} questions correct
                </p>
              </div>
              
              <div className="space-y-2">
                {currentQuiz.map((question: any, index: number) => {
                  const userAnswer = userAnswers[index];
                  const isCorrect =
                    (question.type === "short_answer" || question.type === "fill_blank")
                      ? (userAnswer || "").toString().trim().toLowerCase() ===
                        (question.correctAnswer || "").toString().trim().toLowerCase()
                      : userAnswer === question.correctAnswer;
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isCorrect ? "border-green-500/50 bg-green-500/10" : "border-red-500/50 bg-red-500/10"
                      }`}
                    >
                      <p className="text-sm text-white mb-2">
                        Q{index + 1}: {question.question}
                      </p>
                      <p className="text-xs text-[#6b6b6b]">
                        Your answer: {userAnswer} {isCorrect ? "✓" : "✗"}
                      </p>
                      {!isCorrect && (
                        <p className="text-xs text-green-400 mt-1">
                          Correct answer: {question.correctAnswer}
                        </p>
                      )}
                      {question.explanation && (
                        <p className="text-xs text-white/80 mt-2">
                          Explanation: {question.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <Button onClick={handleRestartQuiz} className="w-full bg-white text-black hover:bg-white/90">
                Take Another Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentQuestion = currentQuiz[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.length) * 100;

    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#6b6b6b]">
                Question {currentQuestionIndex + 1} of {currentQuiz.length}
              </p>
              <p className="text-sm text-[#6b6b6b]">Score: {score}/{currentQuestionIndex}</p>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">{currentQuestion.question}</h3>
              
              {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] cursor-pointer"
                      >
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-white">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
              
              {currentQuestion.type === "true_false" && (
                <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] cursor-pointer">
                      <RadioGroupItem value="True" id="true" />
                      <Label htmlFor="true" className="flex-1 cursor-pointer text-white">True</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border border-[#2a2a2a] hover:border-[#3a3a3a] cursor-pointer">
                      <RadioGroupItem value="False" id="false" />
                      <Label htmlFor="false" className="flex-1 cursor-pointer text-white">False</Label>
                    </div>
                  </div>
                </RadioGroup>
              )}
              
              {currentQuestion.type === "short_answer" && (
                <div className="space-y-3">
                  <input
                    value={shortAnswerText}
                    onChange={(e) => setShortAnswerText(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full h-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-3 text-white"
                  />
                  {currentQuestion.hint && (
                    <p className="text-xs text-white/60">Hint: {currentQuestion.hint}</p>
                  )}
                </div>
              )}
            </div>
            
            <Button onClick={handleAnswerSubmit} className="w-full bg-white text-black hover:bg-white/90">
              Submit Answer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Quizzes</h2>
          <p className="text-sm text-[#6b6b6b]">Test your knowledge with AI-generated quizzes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-white text-black hover:bg-white/90">
              <Plus className="h-4 w-4 mr-2" />
              Generate Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a]">
            <DialogHeader>
              <DialogTitle>Generate Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Note</Label>
                <Select value={selectedNoteId} onValueChange={setSelectedNoteId}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue placeholder="Select a note" />
                  </SelectTrigger>
                  <SelectContent>
                    {notes?.map((note) => (
                      <SelectItem key={note._id} value={note._id}>
                        {note.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Or Select Material</Label>
                <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue placeholder="Select a material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materials?.map((material) => (
                      <SelectItem key={material._id} value={material._id}>
                        {material.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Number of Questions</Label>
                <Select value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v))}>
                  <SelectTrigger className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 Questions</SelectItem>
                    <SelectItem value="10">10 Questions</SelectItem>
                    <SelectItem value="15">15 Questions</SelectItem>
                    <SelectItem value="20">20 Questions</SelectItem>
                  </SelectContent>
                </Select>
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
              
              <Button
                onClick={handleGenerateQuiz}
                disabled={isGenerating}
                className="w-full bg-white text-black hover:bg-white/90"
              >
                {isGenerating ? "Generating..." : "Generate Quiz"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Play className="h-12 w-12 text-[#6b6b6b] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No active quiz</h3>
          <p className="text-sm text-[#6b6b6b] mb-4">
            Generate a quiz from your notes or materials to get started
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}