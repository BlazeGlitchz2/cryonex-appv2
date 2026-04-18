import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index
  explanation: string;
}

interface QuizGeneratorProps {
  topic: string;
  materialId?: Id<"studyMaterials">;
  onClose: () => void;
}

// Mock generator for now - would connect to backend
const generateMockQuiz = (topic: string): Question[] => [
  {
    id: "1",
    text: `What is the primary function of ${topic}?`,
    options: [
      "Data Storage",
      "Processing Logic",
      "User Interface",
      "Network Routing",
    ],
    correctAnswer: 1,
    explanation: "Processing logic is the core function in this context.",
  },
  {
    id: "2",
    text: "Which of the following is a key characteristic?",
    options: ["Immutability", "Volatility", "Latency", "Redundancy"],
    correctAnswer: 0,
    explanation: "Immutability ensures data integrity.",
  },
  {
    id: "3",
    text: "How does it handle errors?",
    options: [
      "Crash immediately",
      "Retry loop",
      "Exception handling",
      "Ignore them",
    ],
    correctAnswer: 2,
    explanation: "Exception handling allows for graceful degradation.",
  },
];

export function QuizGenerator({ topic, materialId, onClose }: QuizGeneratorProps) {
  const [step, setStep] = useState<"loading" | "quiz" | "results" | "error">("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attemptResults, setAttemptResults] = useState<{ questionIndex: number; isCorrect: boolean }[]>([]);
  const [startTime] = useState(Date.now());

  const generateQuizAction = useAction(api.autoGenerate.generateQuiz);
  const recordQuizAttempt = useMutation(api.study.recordQuizAttempt);
  const createQuizMutation = useMutation(api.study.createQuiz);

  useEffect(() => {
    let isMounted = true;
    
    const fetchQuiz = async () => {
      try {
        setStep("loading");
        const result = await generateQuizAction({
          topic,
          materialId,
          count: 10,
        });
        
        if (isMounted) {
          if (!result || result.length === 0) {
            throw new Error("No questions were generated. Please try a different topic.");
          }

          const mappedQuestions = result.map((q: any, idx: number) => {
            const options = Array.isArray(q.options) ? q.options : [];
            let correctIdx = options.findIndex((opt: string) => 
               opt.trim().toLowerCase() === String(q.correctAnswer || "").trim().toLowerCase()
            );
            
            // Fallback if exact match fails
            if (correctIdx === -1 && options.length > 0) {
              correctIdx = 0;
            }

            return {
              id: idx.toString(),
              text: q.question,
              options: options,
              correctAnswer: correctIdx,
              explanation: q.explanation || "Correct answer identified from source.",
            };
          });
          
          setQuestions(mappedQuestions);
          setStep("quiz");
        }
      } catch (error) {
        console.error("Failed to generate quiz", error);
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to generate quiz");
          setStep("error");
          toast.error("Quiz generation failed. Using local fallback.");
        }
      }
    };

    fetchQuiz();
    return () => { isMounted = false; };
  }, [generateQuizAction, topic, materialId]);

  const handleAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);
    const isCorrect = selectedAnswer === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAttemptResults((prev) => [
      ...prev,
      { questionIndex: currentQuestionIndex, isCorrect },
    ]);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setStep("results");
      // Record attempt in database
      if (materialId) {
        (async () => {
          try {
            // first save the quiz document
            const quizId = await createQuizMutation({
              materialId,
              title: topic ? `Quiz: ${topic}` : "Ad-hoc Quiz",
              questions,
              difficulty: "medium",
            });

            const finalAttemptScore = score + (selectedAnswer === questions[currentQuestionIndex].correctAnswer ? 1 : 0);

            await recordQuizAttempt({
              quizId,
              materialId,
              totalQuestions: questions.length,
              correctAnswers: finalAttemptScore,
              results: [
                ...attemptResults,
                { 
                  questionIndex: currentQuestionIndex, 
                  isCorrect: selectedAnswer === questions[currentQuestionIndex].correctAnswer 
                }
              ],
              durationMs: Date.now() - startTime,
            });
          } catch (err) {
            console.error("Failed to save ad-hoc quiz or record attempt", err);
          }
        })();
      }
    }
  };

  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
        </div>
        <h3 className="mt-6 text-xl font-bold text-white">
          Generating Quiz...
        </h3>
        <p className="text-white/50 mt-2">
          Analyzing "{topic}" and creating questions
        </p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
        <div className="h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border border-red-500/50">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Generation Failed</h3>
        <p className="text-white/60 mb-8 max-w-md">
          {errorMessage || "We couldn't generate a quiz for this topic right now."}
        </p>
        <Button
          onClick={onClose}
          variant="outline"
          className="border-white/10 hover:bg-white/5"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (step === "results") {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 animate-in fade-in zoom-in">
        <div className="h-20 w-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-6 border border-yellow-500/50">
          <Trophy className="h-10 w-10 text-yellow-400" />
        </div>
        <h3 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h3>
        <p className="text-white/60 mb-8">
          You scored {score} out of {questions.length}
        </p>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/10 hover:bg-white/5"
          >
            Close
          </Button>
          <Button
            onClick={() => {
              setStep("loading");
              setScore(0);
              setCurrentQuestionIndex(0);
              setIsAnswered(false);
              setSelectedAnswer(null);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            Try Another
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-white/40">
          Question {currentQuestionIndex + 1}/{questions.length}
        </span>
        <span className="text-xs font-bold text-primary">Score: {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6 lg:space-y-8"
        >
          <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-relaxed">
            {currentQuestion.text}
          </h3>

          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(v) => !isAnswered && setSelectedAnswer(parseInt(v))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative flex items-center space-x-3 rounded-xl border p-4 transition-all cursor-pointer",
                  isAnswered && idx === currentQuestion.correctAnswer
                    ? "border-green-500/50 bg-green-500/10"
                    : isAnswered &&
                        idx === selectedAnswer &&
                        idx !== currentQuestion.correctAnswer
                      ? "border-red-500/50 bg-red-500/10"
                      : selectedAnswer === idx
                        ? "border-primary bg-primary/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20",
                  isAnswered && "cursor-default",
                )}
                onClick={() => !isAnswered && setSelectedAnswer(idx)}
              >
                <RadioGroupItem
                  value={idx.toString()}
                  id={`opt-${idx}`}
                  className="border-white/20 text-primary"
                  disabled={isAnswered}
                />
                <Label
                  htmlFor={`opt-${idx}`}
                  className="flex-1 cursor-pointer font-medium text-white/90"
                >
                  {option}
                </Label>
                {isAnswered && idx === currentQuestion.correctAnswer && (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                )}
                {isAnswered &&
                  idx === selectedAnswer &&
                  idx !== currentQuestion.correctAnswer && (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
              </div>
            ))}
          </RadioGroup>

          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4 text-sm text-blue-200"
            >
              <span className="font-bold block mb-1">Explanation:</span>
              {currentQuestion.explanation}
            </motion.div>
          )}

          <div className="pt-4 flex justify-end">
            {!isAnswered ? (
              <Button
                onClick={handleAnswer}
                disabled={selectedAnswer === null}
                className="bg-white text-black hover:bg-white/90 px-8"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={nextQuestion}
                className="bg-primary hover:bg-primary/90 px-8 group"
              >
                {currentQuestionIndex < questions.length - 1
                  ? "Next Question"
                  : "Finish Quiz"}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
