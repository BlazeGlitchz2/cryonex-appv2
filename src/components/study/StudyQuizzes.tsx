import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Play,
  Trophy,
  Clock,
  Sparkles,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";

interface StudyQuizzesProps {
  materialId?: Id<"studyMaterials">;
  autoContent?: string;
  title?: string;
}

export function StudyQuizzes({
  materialId,
  autoContent,
  title,
}: StudyQuizzesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const quizzes =
    useQuery(api.study.listQuizzes, materialId ? { materialId } : "skip") || [];
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const recordQuizAttempt = useMutation(api.study.recordQuizAttempt);

  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStartedAt, setQuizStartedAt] = useState<number | null>(null);
  const [attemptResults, setAttemptResults] = useState<
    Array<{ questionIndex: number; isCorrect: boolean; topic?: string }>
  >([]);

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
        title,
        quizQuestionCount: 10,
      });
      toast.success("Quiz generated successfully!");
    } catch (error) {
      toast.error("Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = (quiz: any) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizStartedAt(Date.now());
    setAttemptResults([]);
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    const isCorrect =
      answer === activeQuiz.questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAttemptResults((prev) => [
      ...prev,
      {
        questionIndex: currentQuestionIndex,
        isCorrect,
        topic: activeQuiz.questions[currentQuestionIndex].topic,
      },
    ]);
  };

  const nextQuestion = async () => {
    if (currentQuestionIndex < activeQuiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const finalScore = attemptResults.filter((result) => result.isCorrect)
        .length;
      try {
        await recordQuizAttempt({
          quizId: activeQuiz._id,
          materialId,
          totalQuestions: activeQuiz.questions.length,
          correctAnswers: finalScore,
          durationMs: quizStartedAt ? Date.now() - quizStartedAt : undefined,
          results: attemptResults,
        });
      } catch (error) {
        console.error("Failed to record quiz attempt", error);
      }
      toast.success(
        `Quiz completed! Score: ${finalScore}/${activeQuiz.questions.length}`,
      );
      setActiveQuiz(null);
      setAttemptResults([]);
      setQuizStartedAt(null);
    }
  };

  if (activeQuiz) {
    const question = activeQuiz.questions[currentQuestionIndex];
    return (
      <div className="flex h-full flex-col px-4 py-6 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setActiveQuiz(null)}>
            Exit Quiz
          </Button>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
          </span>
        </div>

        <Card className="mx-auto flex w-full max-w-[96rem] flex-1 flex-col justify-center border-white/10 shadow-2xl">
          <CardContent className="p-6 md:p-8 lg:p-10">
            <h3 className="mb-6 text-xl font-semibold leading-relaxed md:text-2xl lg:text-3xl">
              {question.question}
            </h3>
            <div className="grid gap-3">
              {question.options?.map((option: string, idx: number) => (
                <Button
                  key={idx}
                  variant={
                    showResult
                      ? option === question.correctAnswer
                        ? "default"
                        : option === selectedAnswer
                          ? "destructive"
                          : "outline"
                      : selectedAnswer === option
                        ? "secondary"
                        : "outline"
                  }
                  className={`justify-start text-left h-auto py-4 px-6 ${
                    showResult && option === question.correctAnswer
                      ? "bg-green-500 hover:bg-green-600 text-white border-transparent"
                      : ""
                  }`}
                  onClick={() => !showResult && handleAnswer(option)}
                  disabled={showResult}
                >
                  <span className="mr-3 opacity-70">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                  {showResult && option === question.correctAnswer && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                  {showResult &&
                    option === selectedAnswer &&
                    option !== question.correctAnswer && (
                      <X className="ml-auto h-4 w-4" />
                    )}
                </Button>
              ))}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-6 p-4 rounded-lg border ${
                  question.correctAnswer === selectedAnswer
                    ? "bg-green-500/10 border-green-500/20 text-green-100"
                    : "bg-red-500/10 border-red-500/20 text-red-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 p-1 rounded-full ${
                      question.correctAnswer === selectedAnswer
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                  >
                    {question.correctAnswer === selectedAnswer ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold mb-1">
                      {question.correctAnswer === selectedAnswer
                        ? "Correct!"
                        : "Incorrect"}
                    </p>
                    <p className="text-sm opacity-90 leading-relaxed">
                      {question.explanation ||
                        "No explanation provided for this question."}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {showResult && (
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={nextQuestion}
                  className="bg-white text-black hover:bg-white/90"
                >
                  {currentQuestionIndex < activeQuiz.questions.length - 1
                    ? "Next Question"
                    : "Finish Quiz"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-border bg-card/30 px-4 py-4 md:px-6 lg:px-8">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quizzes</h2>
          <p className="text-sm text-muted-foreground">
            Test your knowledge with AI-generated quizzes
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? (
            "Generating..."
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate New Quiz
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto w-full max-w-[96rem] px-4 py-6 md:px-6 lg:px-8">
        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/30 px-6 py-12 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No quizzes yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              Generate a quiz from your notes or materials to test your
              understanding and track progress.
            </p>
            <Button
              onClick={handleGenerate}
              variant="outline"
              disabled={isLoading}
            >
              Generate Your First Quiz
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {quizzes.map((quiz: any) => (
              <Card
                key={quiz._id}
                className="hover:bg-muted/50 transition-colors cursor-pointer border-border/50 group"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium truncate pr-4">
                    {quiz.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{quiz.questions?.length * 1 || 5} mins</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20 capitalize">
                      {quiz.difficulty}
                    </div>
                  </div>
                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="secondary"
                    onClick={() => startQuiz(quiz)}
                  >
                    <Play className="h-3 w-3 mr-2 fill-current" />
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        </div>
      </ScrollArea>
    </div>
  );
}
