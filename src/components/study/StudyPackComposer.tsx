import { useEffect, useState } from "react";
import { BrainCircuit, FileText, Sparkles, Target } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface StudyPackComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    title: string;
    content: string;
    focusPrompt: string;
  }) => Promise<void>;
  submitting?: boolean;
}

export function StudyPackComposer({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: StudyPackComposerProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [focusPrompt, setFocusPrompt] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setContent("");
      setFocusPrompt("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-white/10 bg-[#09041d]/96 p-0 text-white sm:max-w-3xl">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(61,193,255,0.14),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(208,114,255,0.16),transparent_26%)]" />

          <div className="relative border-b border-white/10 px-6 py-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Study Pack Builder
            </div>
            <DialogHeader className="mt-4 space-y-2">
              <DialogTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">
                Build one pack, then study it everywhere.
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-white/58">
                Drop in raw notes or revision text and Cryonex will package them
                into summary notes, flashcards, quiz practice, and a ready-to-share
                study pack.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="relative space-y-5 px-6 py-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <FileText className="h-4 w-4 text-cyan-300" />
                <p className="mt-3 text-sm font-medium text-white">One source</p>
                <p className="mt-1 text-xs leading-5 text-white/48">
                  Keep notes, cards, and quizzes grounded in the same material.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Target className="h-4 w-4 text-emerald-300" />
                <p className="mt-3 text-sm font-medium text-white">Set a focus</p>
                <p className="mt-1 text-xs leading-5 text-white/48">
                  Tell Cryonex what to emphasize before the pack is generated.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <BrainCircuit className="h-4 w-4 text-violet-300" />
                <p className="mt-3 text-sm font-medium text-white">Share later</p>
                <p className="mt-1 text-xs leading-5 text-white/48">
                  Publish the finished pack to your school rail or the public hub.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Pack Title
              </label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Biology midterm sprint, Calculus chapter 4 pack..."
                className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Focus Prompt
              </label>
              <Input
                value={focusPrompt}
                onChange={(event) => setFocusPrompt(event.target.value)}
                placeholder="Focus on formulas, exam traps, weak spots, or key definitions..."
                className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Source Text
              </label>
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Paste lecture notes, revision sheets, textbook excerpts, or bilingual study notes here."
                className="min-h-[240px] rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/30"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="text-xs text-white/45">
                Packs work best when headings and key terms are already present in the source text.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="rounded-full text-white/65 hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={submitting || !content.trim()}
                  onClick={() => onSubmit({ title, content, focusPrompt })}
                  className="rounded-full bg-white px-5 text-black hover:bg-white/90"
                >
                  {submitting ? "Building..." : "Build Study Pack"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
