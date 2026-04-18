import { useCallback, useEffect, useRef, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  History,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── IELTS question bank (Part 1 / 2 / 3) ────────────────────────────
const IELTS_QUESTIONS = {
  part1: [
    "Do you work or study? What do you enjoy most about it?",
    "Tell me about your hometown. What is it like to live there?",
    "Do you like reading? What kind of books do you read?",
    "How do you usually spend your weekends?",
    "Do you prefer to travel alone or with friends? Why?",
    "What type of music do you enjoy listening to?",
    "How important is technology in your daily life?",
    "What is your favorite season? Why?",
  ],
  part2: [
    "Describe a book that had a big impact on you. You should say: what the book was about, when you read it, why it impacted you, and how it changed your thinking.",
    "Describe a place you would like to visit in the future. You should say: where it is, how you know about it, what you would do there, and why you want to visit it.",
    "Describe a time when you helped someone. You should say: who you helped, how you helped them, why you helped them, and how you felt about it.",
    "Describe an achievement you are proud of. You should say: what you achieved, when it happened, how you achieved it, and why you are proud of it.",
    "Describe a skill you learned recently. You should say: what the skill is, how you learned it, how long it took, and why you decided to learn it.",
  ],
  part3: [
    "Some people think technology has made life more stressful. Do you agree?",
    "How do you think education will change in the next 20 years?",
    "In what ways can young people contribute to their communities?",
    "Do you think working from home is better than working in an office?",
    "Is it important for people to learn about other cultures? Why?",
  ],
};

function getRandomQuestion(): { part: string; question: string } {
  const parts = Object.keys(IELTS_QUESTIONS) as (keyof typeof IELTS_QUESTIONS)[];
  const part = parts[Math.floor(Math.random() * parts.length)];
  const questions = IELTS_QUESTIONS[part];
  const question = questions[Math.floor(Math.random() * questions.length)];
  const label = part === "part1" ? "Part 1" : part === "part2" ? "Part 2 (Long Turn)" : "Part 3";
  return { part: label, question };
}

// ── Types ────────────────────────────────────────────────────────────
interface EvaluationResult {
  estimatedBand: number;
  fluencyFeedback: string;
  vocabularyFeedback: string;
  grammarFeedback: string;
  generalAdvice: string;
}

type SimulatorPhase = "idle" | "recording" | "evaluating" | "results";

// ── Band score color helper ──────────────────────────────────────────
function bandColor(band: number) {
  if (band >= 7.5) return "text-emerald-400";
  if (band >= 6.0) return "text-cyan-400";
  if (band >= 5.0) return "text-amber-400";
  return "text-red-400";
}

function bandBgGlow(band: number) {
  if (band >= 7.5) return "shadow-emerald-500/20";
  if (band >= 6.0) return "shadow-cyan-500/20";
  if (band >= 5.0) return "shadow-amber-500/20";
  return "shadow-red-500/20";
}

// ── Feedback section component ───────────────────────────────────────
function FeedbackSection({
  title,
  emoji,
  content,
  accentColor,
  defaultOpen = false,
}: {
  title: string;
  emoji: string;
  content: string;
  accentColor: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left hover:bg-foreground/[0.03] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{emoji}</span>
          <span className={cn("text-sm font-semibold tracking-tight", accentColor)}>
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="border-t border-border/40 px-5 py-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Past review card ─────────────────────────────────────────────────
function PastReviewCard({ review }: { review: any }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(review.createdAt);

  return (
    <div className="rounded-xl border border-border/40 bg-card/40 p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className={cn("text-xl font-bold tabular-nums", bandColor(review.estimatedBand))}>
            {review.estimatedBand.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t border-border/30 pt-3">
              <p className="text-xs text-muted-foreground line-clamp-2">
                <span className="font-medium text-foreground/70">Transcript:</span> {review.textTranscript}
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/70">Advice:</span> {review.generalAdvice}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// ██  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
export function IELTSTrainer() {
  const [phase, setPhase] = useState<SimulatorPhase>("idle");
  const [currentQuestion, setCurrentQuestion] = useState(getRandomQuestion);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const evaluateSpeech = useAction(api.ielts.evaluateSpeech);
  const pastReviews = useQuery(api.ieltsQueries.getUserReviews, { limit: 10 });

  // ── Web Speech API setup ─────────────────────────────────────────
  const isSpeechSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const startRecording = useCallback(() => {
    if (!isSpeechSupported) {
      toast.error("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    setTranscript("");
    setInterimTranscript("");
    setResult(null);
    setRecordingTime(0);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(final.trim());
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
      }
    };

    recognition.onend = () => {
      // If still in recording phase, restart (some browsers auto-stop)
      if (recognitionRef.current && phase === "recording") {
        try {
          recognition.start();
        } catch {
          // Already running or ended intentionally
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setPhase("recording");

    // Timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  }, [isSpeechSupported]);

  const stopRecording = useCallback(async () => {
    if (recognitionRef.current) {
      recognitionRef.current.onend = null; // Prevent auto-restart
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Combine final + any lingering interim
    const fullTranscript = (transcript + " " + interimTranscript).trim();
    setTranscript(fullTranscript);
    setInterimTranscript("");

    if (fullTranscript.length < 15) {
      toast.error("Your response was too short. Please try speaking for at least 15-30 seconds.");
      setPhase("idle");
      return;
    }

    setPhase("evaluating");

    try {
      const evalResult = await evaluateSpeech({ transcript: fullTranscript });
      setResult(evalResult as EvaluationResult);
      setPhase("results");
      toast.success(`Evaluation complete! Estimated Band: ${(evalResult as EvaluationResult).estimatedBand}`);
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast.error("Failed to evaluate your speech. Please try again.");
      setPhase("idle");
    }
  }, [transcript, interimTranscript, evaluateSpeech]);

  const resetSimulator = useCallback(() => {
    setPhase("idle");
    setTranscript("");
    setInterimTranscript("");
    setResult(null);
    setRecordingTime(0);
    setCurrentQuestion(getRandomQuestion());
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-40">
      {/* ── Question Card ─────────────────────────────────────────── */}
      <motion.div
        layout
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 md:p-8 shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-blue-500/[0.04]" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-cyan-400">
              <Sparkles className="h-3 w-3" />
              {currentQuestion.part}
            </span>
            {phase === "idle" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentQuestion(getRandomQuestion())}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1.5 h-3 w-3" />
                New question
              </Button>
            )}
          </div>
          <p className="text-lg md:text-xl font-medium leading-relaxed text-foreground/90">
            {currentQuestion.question}
          </p>
        </div>
      </motion.div>

      {/* ── Microphone / Recording Area ───────────────────────────── */}
      <div className="flex flex-col items-center gap-6">
        {/* Mic Button */}
        <div className="relative">
          {phase === "recording" && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/20"
                animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-red-500/15"
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />
            </>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={phase === "idle" || phase === "results" ? startRecording : phase === "recording" ? stopRecording : undefined}
            disabled={phase === "evaluating"}
            className={cn(
              "relative z-10 flex h-24 w-24 items-center justify-center rounded-full border-2 transition-all duration-300",
              phase === "recording"
                ? "border-red-400 bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20 hover:bg-red-500/30"
                : phase === "evaluating"
                  ? "border-border bg-muted text-muted-foreground cursor-wait"
                  : "border-cyan-500/40 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-400/60",
            )}
          >
            {phase === "evaluating" ? (
              <Loader2 className="h-8 w-8 animate-spin" />
            ) : phase === "recording" ? (
              <MicOff className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </motion.button>
        </div>

        {/* Status label */}
        <div className="text-center">
          {phase === "idle" && (
            <p className="text-sm text-muted-foreground">
              Tap the microphone to start recording your answer
            </p>
          )}
          {phase === "recording" && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-red-400 flex items-center gap-2 justify-center">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                Recording — {formatTime(recordingTime)}
              </p>
              <p className="text-xs text-muted-foreground">
                Tap the button again to stop and evaluate
              </p>
            </div>
          )}
          {phase === "evaluating" && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-cyan-400">Evaluating your response…</p>
              <p className="text-xs text-muted-foreground">
                Our AI examiner is scoring your fluency, vocabulary, and grammar
              </p>
            </div>
          )}
          {phase === "results" && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulator}
              className="rounded-full"
            >
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Try another question
            </Button>
          )}
        </div>
      </div>

      {/* ── Live Transcript ───────────────────────────────────────── */}
      <AnimatePresence>
        {(phase === "recording" || phase === "evaluating") && (transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-border/40 bg-card/50 p-5 backdrop-blur-sm"
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              Live Transcript
            </p>
            <p className="text-sm leading-relaxed text-foreground/80">
              {transcript}
              {interimTranscript && (
                <span className="text-muted-foreground/50 italic"> {interimTranscript}</span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {phase === "results" && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-4"
          >
            {/* Band score hero */}
            <div
              className={cn(
                "flex flex-col items-center gap-3 rounded-3xl border border-border/60 bg-card p-8 shadow-xl",
                bandBgGlow(result.estimatedBand),
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Estimated Band Score
              </p>
              <motion.p
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className={cn("text-7xl font-bold tabular-nums", bandColor(result.estimatedBand))}
              >
                {result.estimatedBand.toFixed(1)}
              </motion.p>
              <p className="text-xs text-muted-foreground max-w-md text-center">
                This is an AI-estimated score. Use it to track your progress over time.
              </p>
            </div>

            {/* Transcript shown */}
            <div className="rounded-2xl border border-border/40 bg-card/50 p-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Your Response
              </p>
              <p className="text-sm leading-relaxed text-foreground/70">
                {transcript}
              </p>
            </div>

            {/* Feedback sections */}
            <div className="space-y-3">
              <FeedbackSection
                title="Fluency & Coherence"
                emoji="🗣️"
                content={result.fluencyFeedback}
                accentColor="text-cyan-400"
                defaultOpen
              />
              <FeedbackSection
                title="Lexical Resource (Vocabulary)"
                emoji="📚"
                content={result.vocabularyFeedback}
                accentColor="text-blue-400"
              />
              <FeedbackSection
                title="Grammatical Range & Accuracy"
                emoji="✏️"
                content={result.grammarFeedback}
                accentColor="text-amber-400"
              />
              <FeedbackSection
                title="General Advice"
                emoji="💡"
                content={result.generalAdvice}
                accentColor="text-emerald-400"
                defaultOpen
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Past reviews toggle ───────────────────────────────────── */}
      {pastReviews && pastReviews.length > 0 && (
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <History className="h-4 w-4" />
            Past evaluations ({pastReviews.length})
            {showHistory ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2">
                  {pastReviews.map((review: any) => (
                    <PastReviewCard key={review._id} review={review} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
