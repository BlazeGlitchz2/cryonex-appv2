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
    <section className="rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-6 backdrop-blur-3xl shadow-xl sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-400">
            <Layers3 className="h-3.5 w-3.5" />
            Study packs
          </div>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-white leading-tight">
            Bundle the best parts.
          </h3>
          <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/40">
            Each pack keeps your summary, key points, flashcards, quiz
            practice, and sharing controls attached to the same source
            material.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={onCreateFromNotes}
            className="rounded-full bg-white text-[#0a0625] hover:bg-white/90 h-10 px-5 font-bold uppercase tracking-widest text-[11px]"
          >
            <FileText className="mr-2 h-4 w-4" />
            From Notes
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCreateFromSource}
            className="rounded-full border border-white/[0.08] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white h-10 px-5 font-bold uppercase tracking-widest text-[11px]"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
      </div>

      {packs.length === 0 ? (
        <div className="mt-6 rounded-[28px] border border-dashed border-white/[0.1] bg-white/[0.02] p-8 text-center">
          <div className="flex flex-col items-center gap-5">
            <div className="h-16 w-16 flex items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-400">
               <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                No study packs yet
              </p>
              <p className="mt-2 max-w-sm mx-auto text-[13px] leading-relaxed text-white/30">
                Ready to turn a source into a reusable pack with review structure and sharing?
              </p>
            </div>
            <Button
              type="button"
              onClick={onCreateFromNotes}
              className="mt-2 rounded-full bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 h-12 px-8 font-bold uppercase tracking-widest text-[11px] active:scale-95"
            >
              <Plus className="mr-2 h-4 w-4" />
              Build first pack
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "mt-6 grid gap-4",
            compact
              ? "grid-cols-1"
              : "xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]",
          )}
        >
          {featuredPack ? (
            <div className="group relative rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-6 overflow-hidden">
               <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-cyan-500/5 blur-3xl group-hover:bg-cyan-500/10 transition-colors" />
              
              <div className="relative z-10 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-cyan-400/60">
                  {featuredPack.packStyle || "AI study pack"}
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                  {visibilityLabel(featuredPack.visibility)}
                </span>
              </div>

              <div className="relative z-10 mt-6 flex flex-wrap items-start justify-between gap-6">
                <div className="max-w-2xl min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                    Featured Pick
                  </p>
                  <h4 className="mt-3 text-2xl font-bold tracking-tight text-white leading-tight sm:text-3xl">
                    {featuredPack.title}
                  </h4>
                  <p className="mt-3 text-[14px] leading-relaxed text-white/40 line-clamp-3">
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
                    className="rounded-full bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 h-10 px-5 font-bold uppercase tracking-widest text-[11px] active:scale-95 transition-all"
                  >
                    Open Pack
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-4 group-hover:border-white/[0.1] transition-colors">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <BookOpenCheck className="h-4 w-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                      Flashcards
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {featuredPack.flashcardsCount || 0}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-4 group-hover:border-white/[0.1] transition-colors">
                  <div className="flex items-center gap-2 text-blue-400">
                    <ListChecks className="h-4 w-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                      Quiz Q
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {featuredPack.quizQuestionsCount || 0}
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-4 group-hover:border-white/[0.1] transition-colors">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Clock3 className="h-4 w-4" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/20">
                      Study Time
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">
                    {featuredPack.estimatedMinutes || 0}m
                  </p>
                </div>
              </div>

              <div className="relative z-10 mt-6 flex flex-wrap gap-2">
                {(featuredPack.keyPoints || [])
                  .slice(0, 4)
                  .map((point: string) => (
                    <span
                      key={point}
                      className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-[11px] font-bold text-white/30"
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
                className="group relative w-full rounded-[28px] border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all hover:bg-white/[0.05] hover:border-white/[0.12] active:scale-[0.985]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-cyan-400/40">
                      <Sparkles className="h-3 w-3" />
                      {pack.packStyle || "Study pack"}
                    </div>
                    <h4 className="mt-4 text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors truncate">
                      {pack.title}
                    </h4>
                    <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-white/30">
                      {pack.description}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-white/10 transition-all group-hover:translate-x-1 group-hover:text-white/40" />
                </div>

                <div className="mt-5 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-tight text-white/20">
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1">
                    {pack.flashcardsCount || 0} cards
                  </span>
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1">
                    {pack.quizQuestionsCount || 0} quiz q
                  </span>
                  <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1">
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
