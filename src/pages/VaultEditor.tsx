import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  Lock,
  Save,
} from "lucide-react";
import { useKeystrokes } from "@/hooks/useKeystrokes";

type SaveState = "saved" | "dirty" | "saving";

export default function VaultEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const essayId = id as Id<"essays">;
  const essay = useQuery(api.vault.getEssay, { id: essayId });
  const updateEssay = useMutation(api.vault.updateEssay);
  const {
    content,
    setContent,
    handleInput,
    handleCompositionStart,
    handleCompositionEnd,
    flushQueue,
  } = useKeystrokes(essayId);

  const [saveState, setSaveState] = useState<SaveState>("saved");
  const sessionAnchorRef = useRef(Date.now());
  const hasHydratedRef = useRef(false);

  const wordCount = useMemo(
    () => content.split(/\s+/).filter((word) => word.length > 0).length,
    [content],
  );

  useEffect(() => {
    if (!essay || hasHydratedRef.current) return;
    setContent(essay.content ?? "");
    hasHydratedRef.current = true;
    setSaveState("saved");
  }, [essay, setContent]);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    if (content === (essay?.content ?? "")) {
      setSaveState("saved");
      return;
    }
    setSaveState("dirty");
  }, [content, essay?.content]);

  const persistDraft = useCallback(async () => {
    await flushQueue();
    const elapsed = Math.max(0, Date.now() - sessionAnchorRef.current);

    await updateEssay({
      id: essayId,
      content,
      timeSpentDeltaMs: elapsed,
      wordCountDelta: wordCount,
    });

    sessionAnchorRef.current = Date.now();
  }, [content, essayId, flushQueue, updateEssay, wordCount]);

  useEffect(() => {
    if (!hasHydratedRef.current || saveState !== "dirty") return;

    const timer = window.setTimeout(async () => {
      try {
        setSaveState("saving");
        await persistDraft();
        setSaveState("saved");
      } catch (error) {
        console.error("Failed to autosave vault draft", error);
        setSaveState("dirty");
      }
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [persistDraft, saveState]);

  const handleManualSave = useCallback(async () => {
    try {
      setSaveState("saving");
      await persistDraft();
      setSaveState("saved");
    } catch (error) {
      console.error("Failed to save vault draft", error);
      setSaveState("dirty");
    }
  }, [persistDraft]);

  const handleComplete = useCallback(async () => {
    await handleManualSave();
    await updateEssay({
      id: essayId,
      status: "completed",
    });
    navigate(`/verify/${essayId}`);
  }, [essayId, handleManualSave, navigate, updateEssay]);

  if (essay === undefined) {
    return <div className="p-8 text-white">Loading vault...</div>;
  }

  if (essay === null) {
    return <div className="p-8 text-red-400">Essay not found or access denied.</div>;
  }

  return (
    <div className="study-readable relative flex h-screen flex-col overflow-hidden bg-[#04040a] text-white selection:bg-cyan-500/30">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[6%] top-[8%] h-56 w-56 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-[8%] top-[16%] h-64 w-64 rounded-full bg-blue-500/10 blur-[140px]" />
        <div className="absolute bottom-[8%] left-[18%] h-64 w-64 rounded-full bg-amber-300/8 blur-[140px]" />
      </div>

      <header className="relative z-10 border-b border-white/8 bg-[#04040a]/85 px-5 py-4 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/vault")}
              className="rounded-full text-white/60 hover:bg-white/8 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/75">
                <Lock className="h-3.5 w-3.5" />
                Human-proof logging active
              </div>
              <input
                className="max-w-[32rem] bg-transparent text-xl font-semibold tracking-[-0.03em] text-white outline-none placeholder:text-white/30"
                defaultValue={essay.title}
                onBlur={(event) =>
                  updateEssay({ id: essayId, title: event.target.value })
                }
                placeholder="Essay title"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
                Draft status
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">
                {saveState === "saving"
                  ? "Saving changes..."
                  : saveState === "dirty"
                    ? "Unsaved edits"
                    : "All changes saved"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/35">
                Word count
              </p>
              <p className="mt-1 text-sm font-medium text-white/80">{wordCount} words</p>
            </div>
            <Button
              variant="outline"
              onClick={handleManualSave}
              disabled={saveState === "saving"}
              className="rounded-full border-white/12 bg-white/6 text-white hover:bg-white/10"
            >
              {saveState === "saving" ? (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save draft
            </Button>
            <Button
              onClick={handleComplete}
              className="rounded-full bg-[linear-gradient(135deg,#67e8f9,#0f766e)] text-slate-950 hover:opacity-95"
            >
              <Download className="mr-2 h-4 w-4" />
              Finish & Get Proof
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
        <div className="mx-auto grid h-full max-w-6xl gap-6 px-5 py-6 md:grid-cols-[minmax(0,1fr)_280px] md:px-8">
          <section className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="border-b border-white/8 px-6 py-5">
              <p className="text-sm leading-7 text-white/62">
                Write naturally. Cryonex now stores the exact draft snapshot after each revision batch, which makes the verify view far less likely to double characters or guess the wrong diff.
              </p>
            </div>
            <div className="px-6 py-6">
              <textarea
                value={content}
                onChange={handleInput}
                onCompositionStart={handleCompositionStart}
                onCompositionEnd={handleCompositionEnd}
                placeholder="Start drafting your essay. Your writing flow stays clean while the receipts engine quietly records each revision."
                className="min-h-[65vh] w-full resize-none bg-transparent text-[1.12rem] leading-[1.95] tracking-[0.01em] text-white/92 outline-none placeholder:text-white/22"
                style={{
                  boxShadow: "none",
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              />
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-200">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Receipts engine</p>
                  <p className="text-xs text-white/45">Tamper-resistant drafting trail</p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-white/60">
                <p>Each batch records timing, action type, and the resulting draft state.</p>
                <p>The verify portal can now replay from those stored draft snapshots instead of guessing the text diff.</p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/8 bg-white/[0.04] p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/15 bg-amber-300/10 text-amber-100">
                  <Clock3 className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Writing guidance</p>
                  <p className="text-xs text-white/45">Cleaner, calmer drafting</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/60">
                <li>Keep paragraphs short while outlining, then expand in a second pass.</li>
                <li>Use manual save before major rewrites if you want a hard checkpoint.</li>
                <li>Finish only after the draft status returns to “All changes saved”.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/20">
        Cryonex receipts engine • verifying human effort
      </div>
    </div>
  );
}
