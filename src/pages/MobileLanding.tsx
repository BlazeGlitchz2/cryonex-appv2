import { LobeHeader } from "@/components/landing/LobeHeader";
import { LobeFooter } from "@/components/landing/LobeFooter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FileText,
  ListFilter,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const sourceChips = ["Lecture PDF", "YouTube recap", "Chapter notes"];

const studyControls = [
  "Exam difficulty",
  "Find web sources",
  "Weak-topic drill",
  "Card count",
  "10 min review",
];

const studyOutputs = [
  "Cited answer",
  "12 flashcards",
  "8-question quiz",
];

export default function MobileLanding() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const ctaLabel = isAuthenticated ? "Open dashboard" : "Start free";
  const ctaDestination = isAuthenticated ? "/study/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-black text-white relative font-sans selection:bg-blue-500/30 overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50">
        <LobeHeader />
      </div>

      <main className="pt-24 pb-10 px-6">
        {/* Hero Section */}
        <section className="mb-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <h1 className="text-4xl font-bold tracking-tighter text-white mb-6 leading-tight">
              Your Student <br /> OS
            </h1>
            <p className="text-lg text-white/60 font-light mb-8 max-w-xs mx-auto">
              Upload notes, PDFs, and links, then get the next best study
              action: cited summaries, flashcards, quizzes, or focus review.
            </p>
            <Button
              onClick={() => navigate(ctaDestination)}
              className="group relative overflow-hidden rounded-full bg-white px-8 py-6 text-lg font-bold text-black transition-transform active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                {ctaLabel} <ArrowRight className="h-5 w-5" />
              </span>
            </Button>

            <div className="mx-auto mt-9 w-full max-w-sm rounded-[28px] border border-white/10 bg-white/[0.06] p-4 text-left shadow-2xl shadow-cyan-950/20 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Current source set
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-white">
                    Biology midterm review
                  </h2>
                  <p className="mt-1 max-w-[13rem] text-xs leading-5 text-white/55">
                    Answers stay tied to the sources you select.
                  </p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                  3 selected
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {sourceChips.map((source) => (
                  <span
                    key={source}
                    className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs text-white/70"
                  >
                    {source}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {studyControls.map((control) => (
                  <div
                    key={control}
                    className="min-w-[8.5rem] flex-1 rounded-2xl border border-cyan-200/10 bg-cyan-200/[0.06] px-3 py-2"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-100/42">
                      Control
                    </p>
                    <p className="mt-1 break-words text-[11px] font-semibold leading-4 text-cyan-50/82">
                      {control}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2.5">
                {studyOutputs.map((output) => (
                  <div
                    key={output}
                    className="flex items-center gap-3 rounded-2xl bg-black/25 px-3 py-2.5"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-300" />
                    <span className="text-sm font-medium text-white/82">
                      {output}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features List (Simplified) */}
        <section className="space-y-8 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">Built for Real Coursework</h2>
            <p className="text-white/50 text-sm">
              Source-aware, curriculum-aware, and focus-aware in your pocket.
            </p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Source-Aware Answers</h3>
            <p className="text-white/60 text-sm">
              Ask against your uploaded notes and documents, with answers tied
              back to the material you selected.
            </p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
              <BookOpenCheck className="h-6 w-6 text-cyan-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Next Study Action</h3>
            <p className="text-white/60 text-sm">
              Generate flashcards, quizzes, notes, and review guides that keep
              the study session moving.
            </p>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
              <ListFilter className="h-6 w-6 text-emerald-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Focus the Session</h3>
            <p className="text-white/60 text-sm">
              Narrow the session to the chapters, links, and weak spots that
              matter for the next quiz or exam.
            </p>
          </div>
        </section>

        <LobeFooter />
      </main>
    </div>
  );
}
