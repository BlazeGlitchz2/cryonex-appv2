import { useNavigate } from "react-router";
import {
  ArrowRight,
  BookOpenCheck,
  Clock3,
  FileText,
  Layers3,
  ListChecks,
  Plus,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/viral/ShareButton";
import { cn } from "@/lib/utils";

function visibilityLabel(visibility?: string) {
  if (visibility === "school") return "School";
  if (visibility === "public") return "Public";
  return "Private";
}

interface StudyPacksSectionProps {
  packs: any[];
  onCreateFromNotes: () => void;
  onCreateFromSource: () => void;
  compact?: boolean;
}

export function StudyPacksSection({
  packs,
  onCreateFromNotes,
  onCreateFromSource,
  compact = false,
}: StudyPacksSectionProps) {
  const navigate = useNavigate();
  const [featuredPack, ...otherPacks] = packs;

  return (
    <section className="deepshi-panel rounded-[28px] border border-white/10 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            <Layers3 className="h-3.5 w-3.5" />
            Study packs
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
            Bundle the best parts of one source into a pack.
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            Each pack keeps the summary, key review points, flashcards, quiz
            pressure, and sharing controls attached to the same grounded source.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={onCreateFromNotes}
            className="rounded-full bg-white text-black hover:bg-white/92"
          >
            <FileText className="mr-2 h-4 w-4" />
            Make from notes
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCreateFromSource}
            className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload source
          </Button>
        </div>
      </div>

      {packs.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-white">
                No study packs yet
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Upload, paste, or record once. Cryonex will package the source
                into a reusable pack with review structure and a clean sharing
                path.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={onCreateFromNotes}
                className="rounded-full bg-white text-black hover:bg-white/92"
              >
                <Plus className="mr-2 h-4 w-4" />
                Start first pack
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "mt-5 grid gap-4",
            compact
              ? "grid-cols-1"
              : "xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]",
          )}
        >
          {featuredPack ? (
            <div className="rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(120,117,255,0.18),transparent_58%),rgba(10,6,37,0.88)] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/55">
                  {featuredPack.packStyle || "Grounded review pack"}
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {visibilityLabel(featuredPack.visibility)}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/42">
                    Featured pack
                  </p>
                  <h4 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-white">
                    {featuredPack.title}
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-white/60">
                    {featuredPack.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ShareButton
                    id={featuredPack._id}
                    type="pack"
                    title={featuredPack.title}
                    isPublic={featuredPack.isPublic}
                    existingShareId={featuredPack.shareId}
                  />
                  <Button
                    type="button"
                    onClick={() => navigate(`/study/packs/${featuredPack._id}`)}
                    className="rounded-full bg-white text-black hover:bg-white/92"
                  >
                    Open pack
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-cyan-200">
                    <BookOpenCheck className="h-4 w-4" />
                    <span className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Flashcards
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {featuredPack.flashcardsCount || 0}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-blue-200">
                    <ListChecks className="h-4 w-4" />
                    <span className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Quiz Q
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {featuredPack.quizQuestionsCount || 0}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-violet-200">
                    <Clock3 className="h-4 w-4" />
                    <span className="text-[11px] uppercase tracking-[0.18em] text-white/45">
                      Study time
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {featuredPack.estimatedMinutes || 0}m
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(featuredPack.keyPoints || [])
                  .slice(0, 4)
                  .map((point: string) => (
                    <span
                      key={point}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/70"
                    >
                      {point}
                    </span>
                  ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {otherPacks.slice(0, compact ? 2 : 4).map((pack) => (
              <button
                key={pack._id}
                type="button"
                onClick={() => navigate(`/study/packs/${pack._id}`)}
                className="group w-full rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                      <Sparkles className="h-3 w-3" />
                      {pack.packStyle || "Study pack"}
                    </div>
                    <h4 className="mt-3 text-lg font-semibold text-white">
                      {pack.title}
                    </h4>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">
                      {pack.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-white/38 transition-transform group-hover:translate-x-1 group-hover:text-white/75" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-white/38">
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                    {pack.flashcardsCount || 0} cards
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                    {pack.quizQuestionsCount || 0} quiz q
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">
                    {pack.estimatedMinutes || 0}m
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
