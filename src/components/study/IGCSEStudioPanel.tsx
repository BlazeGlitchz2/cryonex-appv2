import {
  ArrowRight,
  BookOpenText,
  FileStack,
  Layers3,
  NotebookTabs,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IGCSE_DEMAND_SIGNALS } from "@/lib/igcse/catalog";
import { cn } from "@/lib/utils";

interface IgcsePlanPreview {
  _id: string;
  title: string;
  boardLabel: string;
  subjectLabel: string;
  focusTopic?: string;
  selectedBooks: Array<unknown>;
  selectedPastPapers: Array<unknown>;
  selectedTemplateTitles: string[];
  updatedAt: number;
  docId?: string;
  packId?: string;
}

interface IGCSEStudioPanelProps {
  plans?: IgcsePlanPreview[];
  onOpenStudio: () => void;
  onContinuePlan?: (planId: string) => void;
  onOpenArtifact?: (plan: IgcsePlanPreview) => void;
  compact?: boolean;
  className?: string;
}

export function IGCSEStudioPanel({
  plans = [],
  onOpenStudio,
  onContinuePlan,
  onOpenArtifact,
  compact = false,
  className,
}: IGCSEStudioPanelProps) {
  const latestPlan = plans[0];

  return (
    <section
      className={cn(
        "deepshi-panel rounded-[28px] border border-white/10 p-5 md:p-6",
        className,
      )}
    >
      <div
        className={cn(
          "grid gap-5",
          compact ? "grid-cols-1" : "xl:grid-cols-[minmax(0,1.1fr)_320px]",
        )}
      >
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
              <Layers3 className="h-3.5 w-3.5" />
              IGCSE Studio
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                Build Save My Exams-style revision flows inside the dashboard
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/58">
                Pick a board, choose books, target page ranges, attach past papers,
                and turn the whole mix into one study pack or a saved dashboard plan.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {IGCSE_DEMAND_SIGNALS.map((signal) => (
              <div
                key={signal.id}
                className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-sm font-semibold text-white">{signal.title}</p>
                <p className="mt-2 text-xs leading-5 text-white/50">
                  {signal.detail}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={onOpenStudio}
              className="rounded-full bg-white px-5 text-black hover:bg-white/92"
            >
              Open IGCSE Studio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {latestPlan && onContinuePlan ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onContinuePlan(latestPlan._id)}
                className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              >
                Continue latest plan
              </Button>
            ) : null}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                Latest plan
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {latestPlan ? latestPlan.title : "No IGCSE plan saved yet"}
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/50">
              {latestPlan
                ? new Date(latestPlan.updatedAt).toLocaleDateString()
                : "Ready"}
            </div>
          </div>

          {latestPlan ? (
            <div className="mt-4 space-y-3">
              <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                  Track
                </p>
                <p className="mt-2 text-sm font-medium text-white/85">
                  {latestPlan.boardLabel} · {latestPlan.subjectLabel}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/58">
                  {latestPlan.focusTopic || "Mixed-source revision plan ready to refine."}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="flex items-center gap-2 text-white/72">
                    <BookOpenText className="h-4 w-4 text-cyan-200" />
                    <span className="text-xs uppercase tracking-[0.16em]">
                      Books
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {latestPlan.selectedBooks.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="flex items-center gap-2 text-white/72">
                    <FileStack className="h-4 w-4 text-violet-200" />
                    <span className="text-xs uppercase tracking-[0.16em]">
                      Papers
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {latestPlan.selectedPastPapers.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                  <div className="flex items-center gap-2 text-white/72">
                    <NotebookTabs className="h-4 w-4 text-emerald-200" />
                    <span className="text-xs uppercase tracking-[0.16em]">
                      Modes
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {latestPlan.selectedTemplateTitles.length}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {latestPlan.selectedTemplateTitles.slice(0, 3).map((template) => (
                  <span
                    key={template}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/72"
                  >
                    {template}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {onContinuePlan ? (
                  <Button
                    type="button"
                    onClick={() => onContinuePlan(latestPlan._id)}
                    className="rounded-full bg-white px-4 text-black hover:bg-white/92"
                  >
                    Continue plan
                  </Button>
                ) : null}
                {onOpenArtifact && (latestPlan.packId || latestPlan.docId) ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenArtifact(latestPlan)}
                    className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  >
                    Open latest output
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[20px] border border-dashed border-white/12 bg-black/20 px-4 py-5">
              <p className="text-sm leading-6 text-white/58">
                Start by choosing a board and subject. The studio will then let you
                save page windows, paper sets, and weak-topic filters back into the
                dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
