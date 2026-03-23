import { useEffect, useState } from "react";
import { FileText, Languages, Link2, Sparkles } from "lucide-react";
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

interface StudyPasteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { title: string; content: string }) => Promise<void>;
  submitting?: boolean;
}

export function StudyPasteModal({
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
}: StudyPasteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setContent("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-white/10 bg-[#0a0625]/96 p-0 text-white sm:max-w-2xl">
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(208,114,255,0.14),transparent_28%),radial-gradient(circle_at_80%_16%,rgba(61,193,255,0.12),transparent_20%)]" />
          <div className="relative border-b border-white/10 px-6 py-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D072FF]/30 bg-[#D072FF]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E4C9FF]">
              <Sparkles className="h-3.5 w-3.5" />
              Paste To Study
            </div>
            <DialogHeader className="mt-4 space-y-2">
              <DialogTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">
                Turn raw text into a study pack.
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-white/58">
                Paste lecture notes, textbook excerpts, bilingual notes, or rough revision dumps.
                Cryonex will convert them into grounded notes, flashcards, and quizzes.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="relative space-y-5 px-6 py-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <FileText className="h-4 w-4 text-cyan-300" />
                <p className="mt-3 text-sm font-medium text-white">Notes + excerpts</p>
                <p className="mt-1 text-xs leading-5 text-white/48">Ideal for lecture summaries and revision sheets.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Languages className="h-4 w-4 text-emerald-300" />
                <p className="mt-3 text-sm font-medium text-white">Arabic + English</p>
                <p className="mt-1 text-xs leading-5 text-white/48">Mixed-language notes are supported cleanly.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Link2 className="h-4 w-4 text-violet-300" />
                <p className="mt-3 text-sm font-medium text-white">Source-first flow</p>
                <p className="mt-1 text-xs leading-5 text-white/48">Keep one source attached to future quizzes and review.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
                Title
              </label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Biology lecture 5, Midterm revision, Cardiovascular notes..."
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
                placeholder="Paste your notes here. Arabic and English can be mixed naturally."
                className="min-h-[220px] rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/30"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <p className="text-xs text-white/45">
                Tip: keep headings in the pasted text if you want cleaner study sections.
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
                  onClick={() => onSubmit({ title, content })}
                  className="rounded-full bg-white px-5 text-black hover:bg-white/90"
                >
                  {submitting ? "Building..." : "Create Study Pack"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
