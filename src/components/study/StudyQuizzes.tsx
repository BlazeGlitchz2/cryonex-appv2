import { useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  Trophy,
  Clock,
  Sparkles,
  ChevronRight,
  Check,
  X,
  Brain,
  Target,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [quizSetCount, setQuizSetCount] = useState(2);
  const [quizLength, setQuizLength] = useState<"short" | "medium" | "long">(
    "medium",
  );
  const quizzes =
    useQuery(api.study.listQuizzes, materialId ? { materialId } : "skip") || [];
  const generateQuiz = useAction(api.autoGenerate.generateQuiz);
  const createQuiz = useMutation(api.study.createQuiz);
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
  const isMobile = useIsMobile();

  const quizQuestionCount =
    quizLength === "short" ? 8 : quizLength === "long" ? 20 : 12;
  const generateLabel = quizSetCount > 1 ? "Quizzes" : "Quiz";

  const handleGenerate = async () => {
    if (materialId === undefined) {
      toast.info("Still preparing your study workspace. Please wait a moment.");
      return;
    }
    if (!materialId) {
      toast.error("Study material not found. Please re-upload or select a valid material.");
      return;
    }
    setIsLoading(true);
    const content = (autoContent || "").trim();
    if (content.length < 50) {
      toast.error("Source material is too short for high-quality quiz generation. Please add more content first.");
      setIsLoading(false);
      return;
    }
    try {
      const createdQuizIds = await Promise.all(
        Array.from({ length: quizSetCount }, async (_, index) => {
          const questions = await generateQuiz({
            materialId,
            topic: title || "Quiz",
            count: quizQuestionCount,
            content: content,
          });
          const quizId = await createQuiz({
            materialId,
            title:
              quizSetCount > 1 ? `${title} Quiz ${index + 1}` : `Quiz: ${title}`,
            questions,
            difficulty: "medium",
          });
          return String(quizId);
        }),
      );
      toast.success(
        `Generated ${createdQuizIds.length} ${createdQuizIds.length > 1 ? "quizzes" : "quiz"}!`,
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to generate quiz";
      toast.error(errorMsg);
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

  if (isMobile) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        {activeQuiz ? (
          <>
            <div className="shrink-0 border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setActiveQuiz(null)}
                  className="h-9 rounded-full px-3"
                >
                  Exit
                </Button>
                <div className="text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Quiz Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                  </p>
                </div>
                <span className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  {Math.round(
                    ((currentQuestionIndex + 1) / Math.max(1, activeQuiz.questions.length)) * 100,
                  )}%
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary/30">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / Math.max(1, activeQuiz.questions.length)) * 100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 [-webkit-overflow-scrolling:touch]">
              <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center">
                {(() => {
                  const question =
                    activeQuiz.questions[currentQuestionIndex];
                  const isCorrectAnswer =
                    question.correctAnswer === selectedAnswer;
                  return (
                <div className={cn(
                  "rounded-[28px] border p-4 shadow-[0_18px_50px_rgba(2,6,23,0.16)]",
                  showResult
                    ? isCorrectAnswer
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-rose-500/20 bg-rose-500/10"
                    : "border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]",
                )}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      <Brain className="h-4 w-4 text-cyan-400" />
                      <span>Study question</span>
                    </div>
                    <span className="rounded-full border border-border/60 px-3 py-1 text-[11px] text-muted-foreground">
                      {Math.round(
                        ((currentQuestionIndex + 1) / Math.max(1, activeQuiz.questions.length)) * 100,
                      )}%
                    </span>
                  </div>

                  <h3 className="mt-4 text-[1.3rem] font-semibold leading-8 text-foreground">
                    {question.question}
                  </h3>

                  <div className="mt-5 grid gap-3">
                    {question.options?.map(
                      (option: string, idx: number) => (
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
                          className={cn(
                            "h-auto justify-start px-4 py-4 text-left text-sm leading-6",
                            showResult && option === question.correctAnswer
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "",
                          )}
                          onClick={() => !showResult && handleAnswer(option)}
                          disabled={showResult}
                        >
                          <span className="mr-3 shrink-0 opacity-70">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span className="min-w-0 flex-1 break-words">{option}</span>
                          {showResult && option === question.correctAnswer && (
                            <Check className="ml-2 h-4 w-4 shrink-0" />
                          )}
                          {showResult &&
                            option === selectedAnswer &&
                            option !== question.correctAnswer && (
                              <X className="ml-2 h-4 w-4 shrink-0" />
                            )}
                        </Button>
                      ),
                    )}
                  </div>

                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mt-5 rounded-2xl border p-4",
                        isCorrectAnswer
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-50"
                          : "border-rose-500/20 bg-rose-500/10 text-rose-50",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 rounded-full p-1",
                            isCorrectAnswer
                              ? "bg-emerald-500/20"
                              : "bg-rose-500/20",
                          )}
                        >
                          {isCorrectAnswer ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="mb-1 font-semibold">
                            {isCorrectAnswer
                              ? "Correct!"
                              : "Incorrect"}
                          </p>
                          <p className="text-sm leading-6 opacity-90">
                            {question.explanation ||
                              "No explanation provided for this question."}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                  );
                })()}
              </div>
            </div>

            <div className="shrink-0 border-t border-border/60 bg-background/95 px-4 py-3 pb-[env(safe-area-inset-bottom)]">
              <Button
                onClick={nextQuestion}
                disabled={!showResult}
                className="h-12 w-full rounded-full"
              >
                {currentQuestionIndex < activeQuiz.questions.length - 1
                  ? "Next Question"
                  : "Finish Quiz"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="shrink-0 border-b border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-foreground">Quizzes</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Generate full-screen quizzes from your PDF and answer one question at a time.
                  </p>
                </div>
                <Button onClick={handleGenerate} disabled={isLoading} className="rounded-full px-3">
                  {isLoading ? "Generating..." : "Generate"}
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/50 p-1">
                  {(["short", "medium", "long"] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={quizLength === mode ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setQuizLength(mode)}
                      className="h-8 rounded-full px-3 text-[11px] capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/50 p-1">
                  {[1, 2, 3].map((count) => (
                    <Button
                      key={count}
                      variant={quizSetCount === count ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setQuizSetCount(count)}
                      className="h-8 rounded-full px-3 text-[11px]"
                    >
                      {count}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[11px] text-muted-foreground">
                  Sets: {quizzes.length}
                </span>
                <span className="rounded-full border border-border/60 bg-background/50 px-3 py-1 text-[11px] text-muted-foreground">
                  Questions: {quizzes.reduce((sum: number, quiz: any) => sum + (quiz.questions?.length || 0), 0)}
                </span>
              </div>
            </div>

            <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 [-webkit-overflow-scrolling:touch]">
              {quizzes.length === 0 ? (
                <div className="mx-auto flex min-h-full w-full max-w-md flex-col items-center justify-center rounded-[28px] border border-dashed border-border/50 bg-card/30 px-6 py-12 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-4">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    No quizzes yet
                  </h3>
                  <p className="mb-6 text-sm leading-6 text-muted-foreground">
                    Generate a quiz from your notes or materials to test your understanding and track progress.
                  </p>
                  <Button onClick={handleGenerate} variant="outline" disabled={isLoading}>
                    Generate Your First Quiz
                  </Button>
                </div>
              ) : (
                <div className="mx-auto grid w-full max-w-md gap-3">
                  {quizzes.map((quiz: any) => (
                    <Card
                      key={quiz._id}
                      className="border-border/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="truncate pr-4 text-base font-medium">
                          {quiz.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                            {quiz.questions?.length || 0} questions
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            PDF-based
                          </span>
                          <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] capitalize text-blue-300">
                            {quiz.difficulty}
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          variant="secondary"
                          onClick={() => startQuiz(quiz)}
                        >
                          <Play className="mr-2 h-3 w-3 fill-current" />
                          Start Quiz
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  if (activeQuiz) {
    const question = activeQuiz.questions[currentQuestionIndex];
    const progress =
      ((currentQuestionIndex + 1) / Math.max(1, activeQuiz.questions.length)) *
      100;
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

        <Card className="mx-auto flex w-full max-w-[96rem] flex-1 flex-col justify-center overflow-hidden border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
          <CardContent className="p-6 md:p-8 lg:p-10">
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-muted-foreground">
                <span>Quiz Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
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
      <div className="border-b border-border bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.015))] px-4 py-4 md:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Quizzes</h2>
            <p className="text-sm text-muted-foreground">
              Questions are generated from the PDF text you uploaded.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/50 p-1">
              {(["short", "medium", "long"] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={quizLength === mode ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setQuizLength(mode)}
                  className="h-8 rounded-full px-3 text-xs capitalize"
                >
                  {mode}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-background/50 p-1">
              {[1, 2, 3].map((count) => (
                <Button
                  key={count}
                  variant={quizSetCount === count ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setQuizSetCount(count)}
                  className="h-8 rounded-full px-3 text-xs"
                >
                  {count} {count > 1 ? "quizzes" : "quiz"}
                </Button>
              ))}
            </div>
            <Button onClick={handleGenerate} disabled={isLoading}>
              {isLoading ? (
                "Generating..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate {quizSetCount} {generateLabel}
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Card className="border-border/60 bg-white/[0.03]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-cyan-500/10 p-2 text-cyan-300">
                <Trophy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Quiz Sets
                </p>
                <p className="text-xl font-semibold text-foreground">
                  {quizzes.length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-white/[0.03]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-violet-500/10 p-2 text-violet-300">
                <Brain className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Total Questions
                </p>
                <p className="text-xl font-semibold text-foreground">
                  {quizzes.reduce(
                    (sum: number, quiz: any) => sum + (quiz.questions?.length || 0),
                    0,
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-white/[0.03]">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-300">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Latest Set
                </p>
                <p className="text-xl font-semibold text-foreground">
                  {quizzes[0]?.questions?.length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
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
                className="cursor-pointer border-border/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-muted/40 group"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium truncate pr-4">
                    {quiz.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                  {quiz.questions?.length || 0} questions
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      PDF-based
                </span>
              </div>
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
