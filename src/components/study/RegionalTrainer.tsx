import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, BrainCircuit, Check, Timer, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RegionalTrainerProps {
    region: "ksa" | "egypt";
    curriculum: string;
    onExit: () => void;
}

export function RegionalTrainer({ region, curriculum, onExit }: RegionalTrainerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [score, setScore] = useState(0);
    const [questionIndex, setQuestionIndex] = useState(0);

    // Mock Data - In a real app, this would come from the AI/Backend
    const qiyasQuestions = [
        {
            id: 1,
            type: "verbal",
            question: "Tanasur (Analogy): LION : DEN",
            options: ["Bird : Nest", "Fish : Sea", "Man : House", "Car : Garage"],
            answer: 0,
        },
        {
            id: 2,
            type: "quant",
            question: "If 3x + 5 = 20, what is x?",
            options: ["3", "4", "5", "6"],
            answer: 2,
        },
    ];

    const thanaweyyaQuestions = [
        {
            id: 1,
            type: "physics",
            question: "In the circuit shown, if R1 increases, what happens to V2?",
            options: ["Increases", "Decreases", "Stays same", "Becomes zero"],
            answer: 0,
        },
        {
            id: 2,
            type: "history",
            question: "Who established the modern Egyptian army?",
            options: ["Mohamed Ali", "Saad Zaghloul", "Gamal Abdel Nasser", "Sadat"],
            answer: 0,
        },
    ];

    const questions = region === "ksa" ? qiyasQuestions : thanaweyyaQuestions;
    const currentQ = questions[questionIndex];

    const handleAnswer = (index: number) => {
        if (index === currentQ.answer) {
            setScore(score + 10);
        }
        if (questionIndex < questions.length - 1) {
            setQuestionIndex(questionIndex + 1);
        } else {
            // End Game
            alert(`Game Over! Score: ${score}`);
            setIsPlaying(false);
            setQuestionIndex(0);
            setScore(0);
        }
    };

    if (!isPlaying) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 md:p-8 animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]">
                    <Trophy className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {region === "ksa" ? "Qudurat Speed Trainer" : "Thanaweyya Challenge"}
                </h2>
                <p className="text-slate-400 max-w-sm md:max-w-md mb-8 text-sm md:text-base leading-relaxed">
                    {region === "ksa"
                        ? "Master the GAT with high-speed drills. Focus on logic, analogies, and quick math."
                        : "Test your knowledge against previous ministry exams. Collect points for the leaderboard."}
                </p>
                <Button
                    size="lg"
                    onClick={() => setIsPlaying(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold h-12 md:h-14 px-8 rounded-full text-base md:text-lg shadow-lg shadow-amber-500/20 active:scale-95 transition-transform"
                >
                    Start Training
                </Button>
                <Button variant="ghost" className="mt-4 text-white/50 hover:text-white" onClick={onExit}>
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto p-4 md:p-6 h-full flex flex-col justify-center">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                    <BrainCircuit className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-mono font-bold text-sm md:text-base">SCORE: {score}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <Timer className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="font-mono text-sm md:text-base">00:30</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsPlaying(false)} className="rounded-full hover:bg-white/10 text-white">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={questionIndex}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] md:text-xs font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                            Question {questionIndex + 1} / {questions.length}
                        </div>
                        <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {currentQ.type}
                        </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed">
                        {currentQ.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {currentQ.options.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleAnswer(i)}
                                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-amber-500/50 hover:text-amber-500 transition-all text-left flex items-center group active:scale-[0.98]"
                            >
                                <span className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center text-sm md:text-base font-bold mr-4 group-hover:bg-amber-500 group-hover:text-black transition-colors border border-white/5 group-hover:border-transparent">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                <span className="font-medium text-sm md:text-base text-white/80 group-hover:text-amber-500 transition-colors">{opt}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
