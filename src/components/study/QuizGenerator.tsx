import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Trophy, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number; // Index
    explanation: string;
}

interface QuizGeneratorProps {
    topic: string;
    onClose: () => void;
}

// Mock generator for now - would connect to backend
const generateMockQuiz = (topic: string): Question[] => [
    {
        id: "1",
        text: `What is the primary function of ${topic}?`,
        options: ["Data Storage", "Processing Logic", "User Interface", "Network Routing"],
        correctAnswer: 1,
        explanation: "Processing logic is the core function in this context."
    },
    {
        id: "2",
        text: "Which of the following is a key characteristic?",
        options: ["Immutability", "Volatility", "Latency", "Redundancy"],
        correctAnswer: 0,
        explanation: "Immutability ensures data integrity."
    },
    {
        id: "3",
        text: "How does it handle errors?",
        options: ["Crash immediately", "Retry loop", "Exception handling", "Ignore them"],
        correctAnswer: 2,
        explanation: "Exception handling allows for graceful degradation."
    }
];

export function QuizGenerator({ topic, onClose }: QuizGeneratorProps) {
    const [step, setStep] = useState<"loading" | "quiz" | "results">("loading");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);

    // Simulate generation
    useState(() => {
        setTimeout(() => {
            setQuestions(generateMockQuiz(topic));
            setStep("quiz");
        }, 2000);
    });

    const handleAnswer = () => {
        if (selectedAnswer === null) return;
        setIsAnswered(true);
        if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
        } else {
            setStep("results");
        }
    };

    if (step === "loading") {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <Loader2 className="h-12 w-12 text-primary animate-spin relative z-10" />
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Generating Quiz...</h3>
                <p className="text-white/50 mt-2">Analyzing "{topic}" and creating questions</p>
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
                <p className="text-white/60 mb-8">You scored {score} out of {questions.length}</p>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={onClose} className="border-white/10 hover:bg-white/5">Close</Button>
                    <Button onClick={() => { setStep("loading"); setScore(0); setCurrentQuestionIndex(0); setIsAnswered(false); setSelectedAnswer(null); }} className="bg-primary hover:bg-primary/90">Try Another</Button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Question {currentQuestionIndex + 1}/{questions.length}</span>
                <span className="text-xs font-bold text-primary">Score: {score}</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                >
                    <h3 className="text-xl md:text-2xl font-bold text-white leading-relaxed">
                        {currentQuestion.text}
                    </h3>

                    <RadioGroup value={selectedAnswer?.toString()} onValueChange={(v) => !isAnswered && setSelectedAnswer(parseInt(v))} className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                            <div key={idx} className={cn(
                                "relative flex items-center space-x-3 rounded-xl border p-4 transition-all cursor-pointer",
                                isAnswered && idx === currentQuestion.correctAnswer ? "border-green-500/50 bg-green-500/10" :
                                    isAnswered && idx === selectedAnswer && idx !== currentQuestion.correctAnswer ? "border-red-500/50 bg-red-500/10" :
                                        selectedAnswer === idx ? "border-primary bg-primary/10" : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20",
                                isAnswered && "cursor-default"
                            )}
                                onClick={() => !isAnswered && setSelectedAnswer(idx)}
                            >
                                <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} className="border-white/20 text-primary" disabled={isAnswered} />
                                <Label htmlFor={`opt-${idx}`} className="flex-1 cursor-pointer font-medium text-white/90">{option}</Label>
                                {isAnswered && idx === currentQuestion.correctAnswer && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                                {isAnswered && idx === selectedAnswer && idx !== currentQuestion.correctAnswer && <XCircle className="h-5 w-5 text-red-400" />}
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
                            <Button onClick={handleAnswer} disabled={selectedAnswer === null} className="bg-white text-black hover:bg-white/90 px-8">
                                Check Answer
                            </Button>
                        ) : (
                            <Button onClick={nextQuestion} className="bg-primary hover:bg-primary/90 px-8 group">
                                {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
                                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
