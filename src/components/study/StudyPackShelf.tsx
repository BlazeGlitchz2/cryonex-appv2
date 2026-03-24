import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  Clock3,
  Layers3,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/viral/ShareButton";
import { cn } from "@/lib/utils";

interface StudyPackShelfProps {
  packs: any[] | undefined;
  onCreatePack?: () => void;
  compact?: boolean;
  className?: string;
}

export function StudyPackShelf({
  packs,
  onCreatePack,
  compact = false,
  className,
}: StudyPackShelfProps) {
  const navigate = useNavigate();
  const visiblePacks = packs || [];

  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0 },
      }}
      className={cn(
        "deepshi-panel rounded-[28px] border border-white/10 p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
            <Layers3 className="h-3.5 w-3.5" />
            Study Packs
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
            Your latest generated packs
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            Packs keep the summary, recall practice, and quiz lane bundled together
            so you can reopen the same revision unit anywhere in Cryonex.
          </p>
        </div>

        {onCreatePack ? (
          <Button
            type="button"
            onClick={onCreatePack}
            className="rounded-full bg-white text-black hover:bg-white/92"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Build pack
          </Button>
        ) : null}
      </div>

      {visiblePacks.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] px-5 py-8 text-sm text-white/55">
          Build your first study pack from notes, a lecture transcript, or pasted text.
        </div>
      ) : (
        <div
          className={cn(
            "mt-5 grid gap-4",
            compact ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-3",
          )}
        >
          {visiblePacks.map((pack) => (
            <article
              key={pack._id}
              className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_20px_50px_rgba(4,2,18,0.28)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    {pack.packStyle || "Study pack"}
                  </span>
                  <h4 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-white">
                    {pack.title}
                  </h4>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/58">
                    {pack.description || pack.summary?.short || "Source-grounded study pack ready to review."}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                    Source
                  </p>
                  <p className="mt-1 max-w-[100px] truncate text-sm font-medium text-white/78">
                    {pack.sourceTitle}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-white/38">
                <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                  {pack.flashcardsCount || 0} cards
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                  {pack.quizQuestionsCount || 0} quiz q
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                  <Clock3 className="mr-1 inline h-3 w-3" />
                  {pack.estimatedMinutes || 20} min
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                <Button
                  type="button"
                  onClick={() => navigate(`/study/packs/${pack._id}`)}
                  className="rounded-full bg-white text-black hover:bg-white/92"
                >
                  Open pack
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <ShareButton
                  id={pack._id}
                  type="pack"
                  title={pack.title}
                  isPublic={pack.isPublic}
                  existingShareId={pack.shareId}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </motion.section>
  );
}
