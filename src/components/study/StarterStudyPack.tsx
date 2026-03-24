import { BookCopy, ChevronRight, Clock3, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import {
  buildCurriculumPersonalization,
  type CurriculumPersonalizationInput,
} from "@/lib/curriculumPersonalization";
import { cn } from "@/lib/utils";

interface StarterStudyPackProps extends CurriculumPersonalizationInput {
  compact?: boolean;
  interactive?: boolean;
  title?: string;
  description?: string;
  onApplyInstruction?: (instruction: string) => void;
}

const accentMap = {
  emerald:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200 shadow-[0_20px_60px_rgba(16,185,129,0.08)]",
  cyan: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_20px_60px_rgba(34,211,238,0.08)]",
  amber:
    "border-amber-400/20 bg-amber-400/10 text-amber-100 shadow-[0_20px_60px_rgba(245,158,11,0.08)]",
  rose: "border-rose-400/20 bg-rose-400/10 text-rose-100 shadow-[0_20px_60px_rgba(251,113,133,0.08)]",
} as const;

export function StarterStudyPack({
  compact = false,
  interactive = false,
  title = "Starter study pack",
  description = "Built from your country, curriculum, grade, subjects, and exam targets.",
  onApplyInstruction,
  ...profile
}: StarterStudyPackProps) {
  const blueprint = buildCurriculumPersonalization(profile);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
            Personalized starter pack
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">
            {title}
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-white/60">
            {blueprint.stageLabel}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-white/60">
            {blueprint.curriculumLabel}
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] text-white/60">
            {blueprint.paceLabel}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_320px]">
        <div className="space-y-3">
          <div
            className={cn(
              "grid gap-3",
              compact ? "grid-cols-1" : "md:grid-cols-2",
            )}
          >
            {blueprint.studyPacks.map((pack) => (
              <div
                key={pack.id}
                className={cn(
                  "rounded-[24px] border p-4 transition-colors",
                  accentMap[pack.accent],
                  interactive && "hover:border-white/25 hover:bg-white/[0.08]",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                      {pack.focus}
                    </p>
                    <h4 className="mt-2 text-base font-semibold text-white">
                      {pack.title}
                    </h4>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-white/70">
                    <BookCopy className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  {pack.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pack.subjects.map((subject) => (
                    <span
                      key={subject}
                      className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] text-white/65"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {pack.outputs.map((output) => (
                    <span
                      key={output}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/60"
                    >
                      <Target className="h-3 w-3" />
                      {output}
                    </span>
                  ))}
                </div>
                {interactive && onApplyInstruction ? (
                  <button
                    type="button"
                    onClick={() => {
                      onApplyInstruction(pack.prompt);
                      toast.success(`${pack.title} applied`);
                    }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/80 transition-colors hover:bg-black/35"
                  >
                    Use pack prompt
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            <Sparkles className="h-3.5 w-3.5" />
            Personalization signals
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/45">
                <Clock3 className="h-3.5 w-3.5" />
                Stage
              </div>
              <p className="mt-2 text-sm font-semibold text-white">
                {blueprint.stageLabel}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/55">
                {blueprint.stageDescription}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                Subjects prioritized
              </p>
              <p className="mt-2 text-sm text-white/70">
                {blueprint.selectedSubjects.join(" • ")}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                Exams and pace
              </p>
              <p className="mt-2 text-sm text-white/70">
                {blueprint.selectedExams.join(" • ") || "Course mastery"}
              </p>
              <p className="mt-2 text-sm text-white/50">
                {blueprint.languageMode} • {blueprint.paceLabel}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-white/45">
                Why this pack works
              </p>
              <div className="mt-3 space-y-2">
                {blueprint.insights.slice(0, 3).map((insight) => (
                  <div
                    key={insight}
                    className="rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-sm text-white/62"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
