import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  BookOpenCheck,
  BrainCircuit,
  FileText,
  GitBranch,
  Layers3,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/viral/ShareButton";
import { StudyNotes } from "@/components/study/StudyNotes";
import { StudyFlashcards } from "@/components/study/StudyFlashcards";
import { StudyQuizzes } from "@/components/study/StudyQuizzes";
import { StudyConceptMap } from "@/components/study/StudyConceptMap";

const PACK_TABS = [
  { id: "overview", label: "Overview", icon: Layers3 },
  { id: "notes", label: "Notes", icon: FileText },
  { id: "flashcards", label: "Flashcards", icon: BookOpenCheck },
  { id: "quiz", label: "Quiz", icon: ListChecks },
  { id: "map", label: "Concept Map", icon: GitBranch },
] as const;

export default function StudyPackPage() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const pack = useQuery(
    api.study.getStudyPack,
    packId ? { packId: packId as any } : "skip",
  );
  const [activeTab, setActiveTab] =
    useState<(typeof PACK_TABS)[number]["id"]>("overview");

  const summaryContent = pack?.summary?.detailed || pack?.summary?.short || "";
  const keyPoints = useMemo(
    () => (Array.isArray(pack?.keyPoints) ? pack.keyPoints : []).slice(0, 6),
    [pack],
  );
  const practicePlan = useMemo(
    () =>
      (Array.isArray(pack?.practicePlan) ? pack.practicePlan : []).slice(0, 3),
    [pack],
  );

  if (pack === undefined) {
    return (
      <div className="study-dashboard-shell relative min-h-full overflow-x-hidden px-4 pb-10 pt-6 md:px-8 xl:px-10">
        <div className="relative z-10 mx-auto max-w-[1200px] rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-white/60">
          Loading study pack...
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="study-dashboard-shell relative min-h-full overflow-x-hidden px-4 pb-10 pt-6 md:px-8 xl:px-10">
        <div className="relative z-10 mx-auto max-w-[1200px] rounded-[32px] border border-white/10 bg-white/[0.03] p-8 text-white">
          <p className="text-lg font-semibold">Study pack not found.</p>
          <Button
            type="button"
            onClick={() => navigate("/study/dashboard")}
            className="mt-4 rounded-full bg-white text-black hover:bg-white/92"
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="study-dashboard-shell relative min-h-full overflow-x-hidden px-4 pb-10 pt-6 md:px-8 xl:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_14%,rgba(255,255,255,0.05),transparent_0,transparent_22%),radial-gradient(circle_at_74%_8%,rgba(112,88,255,0.14),transparent_26%),linear-gradient(180deg,#07031c_0%,#050218_56%,#040114_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:url('/noise.svg')]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1380px] space-y-6">
        <section className="deepshi-panel rounded-[32px] border border-white/10 p-6 md:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <BrainCircuit className="h-3.5 w-3.5" />
                {pack.packStyle || "Study pack"}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                {pack.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/58 md:text-base">
                {pack.description ||
                  "A source-grounded study pack that keeps your summary, recall, and practice lanes bundled together."}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {PACK_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "border-white/20 bg-white text-black"
                        : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <aside className="space-y-3">
              {[
                ["Source", pack.sourceTitle || "Source material"],
                ["Cards", `${pack.flashcardsCount || 0}`],
                ["Quiz", `${pack.quizQuestionsCount || 0} questions`],
                ["Study time", `${pack.estimatedMinutes || 20} min`],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/88">
                    {value}
                  </p>
                </div>
              ))}
            </aside>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/study/dashboard")}
              className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            {pack.sourceDocId ? (
              <Button
                type="button"
                onClick={() => navigate(`/study/workspace/${pack.sourceDocId}`)}
                className="rounded-full bg-white text-black hover:bg-white/92"
              >
                Open source workspace
              </Button>
            ) : null}
            <ShareButton
              id={pack._id}
              type="pack"
              title={pack.title}
              isPublic={pack.isPublic}
              existingShareId={pack.shareId}
            />
          </div>
        </section>

        {activeTab === "overview" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
            <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                <Sparkles className="h-3.5 w-3.5" />
                Pack Summary
              </div>
              <div className="mt-5">
                <StudyNotes
                  content={summaryContent}
                  title={`${pack.title} summary`}
                  materialId={pack.materialId}
                />
              </div>
            </section>

            <aside className="space-y-6">
              <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  <Layers3 className="h-3.5 w-3.5" />
                  Key Points
                </div>
                <div className="mt-4 space-y-3">
                  {keyPoints.map((point, index) => (
                    <div
                      key={`${point}-${index}`}
                      className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/72"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </section>

              <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  <ListChecks className="h-3.5 w-3.5" />
                  Practice Plan
                </div>
                <div className="mt-4 space-y-3">
                  {practicePlan.map((step, index) => (
                    <div
                      key={`${step}-${index}`}
                      className="rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                        Step {index + 1}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-white/72">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        ) : null}

        {activeTab === "notes" ? (
          <section className="deepshi-panel rounded-[28px] border border-white/10 p-2 overflow-hidden">
            <StudyNotes
              content={summaryContent}
              title={pack.title}
              materialId={pack.materialId}
            />
          </section>
        ) : null}

        {activeTab === "flashcards" ? (
          <section className="deepshi-panel rounded-[28px] border border-white/10 p-2 overflow-hidden">
            <StudyFlashcards
              materialId={pack.materialId}
              autoContent={pack.summary?.detailed}
              title={pack.title}
            />
          </section>
        ) : null}

        {activeTab === "quiz" ? (
          <section className="deepshi-panel rounded-[28px] border border-white/10 p-2 overflow-hidden">
            <StudyQuizzes
              materialId={pack.materialId}
              autoContent={pack.summary?.detailed}
              title={pack.title}
            />
          </section>
        ) : null}

        {activeTab === "map" ? (
          <section className="deepshi-panel rounded-[28px] border border-white/10 p-2 overflow-hidden min-h-[720px]">
            <StudyConceptMap materialId={pack.materialId} title={pack.title} />
          </section>
        ) : null}
      </div>
    </div>
  );
}
