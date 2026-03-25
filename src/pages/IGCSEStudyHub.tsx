import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowRight,
  BookOpenText,
  Check,
  FileStack,
  Filter,
  Layers3,
  NotebookTabs,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IGCSEStudioPanel } from "@/components/study/IGCSEStudioPanel";
import {
  IGCSE_BOARDS,
  IGCSE_DEMAND_SIGNALS,
  IGCSE_SUBJECTS,
  getIgcseTrack,
  getTopicLookup,
} from "@/lib/igcse/catalog";
import {
  buildIgcseMaterialTags,
  buildIgcseMaterialTitle,
  buildIgcseStudyBrief,
} from "@/lib/igcse/build-study-brief";
import type {
  IgcseBoardId,
  IgcsePlanDraft,
  IgcseSelectedBook,
  IgcseSelectedPastPaper,
  IgcseSubjectId,
} from "@/lib/igcse/types";
import { cn } from "@/lib/utils";

interface BookSelectionState {
  startPage: number;
  endPage: number;
  summaryFocus: string;
  selectedPresetId?: string;
}

function createDocId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `igcse-${crypto.randomUUID()}`;
  }

  return `igcse-${Math.random().toString(36).slice(2, 10)}`;
}

function clampPageRange(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function IGCSEStudyHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const requestedPlanId = searchParams.get("planId");
  const safeRequestedPlanId =
    requestedPlanId && /^[a-z0-9]+$/i.test(requestedPlanId)
      ? (requestedPlanId as Id<"igcsePlans">)
      : null;

  const recentPlans = useQuery(api.igcse.listRecentPlans, { limit: 4 }) || [];
  const requestedPlan = useQuery(
    api.igcse.getPlan,
    safeRequestedPlanId ? { planId: safeRequestedPlanId } : "skip",
  );
  const upsertPlan = useMutation(api.igcse.upsertPlan);
  const createMaterial = useMutation(api.study.createMaterial);
  const ensureMaterialWorkspace = useMutation(
    api.studyMutations.ensureMaterialWorkspace,
  );
  const generateAssets = useAction(api.autoGenerate.generateAllAssets);

  const [boardId, setBoardId] = useState<IgcseBoardId>("cambridge");
  const [subjectId, setSubjectId] = useState<IgcseSubjectId>("biology");
  const [title, setTitle] = useState("");
  const [focusTopic, setFocusTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [weakTopicIds, setWeakTopicIds] = useState<string[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedPastPaperIds, setSelectedPastPaperIds] = useState<string[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<
    Record<string, BookSelectionState>
  >({});
  const [currentPlanId, setCurrentPlanId] = useState<Id<"igcsePlans"> | null>(
    null,
  );
  const [hydratedPlanId, setHydratedPlanId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const track = useMemo(
    () => getIgcseTrack(boardId, subjectId),
    [boardId, subjectId],
  );
  const topicLookup = useMemo(() => getTopicLookup(track), [track]);

  useEffect(() => {
    if (requestedPlan && hydratedPlanId !== String(requestedPlan._id)) {
      setBoardId(requestedPlan.boardId as IgcseBoardId);
      setSubjectId(requestedPlan.subjectId as IgcseSubjectId);
      setTitle(requestedPlan.title || "");
      setFocusTopic(requestedPlan.focusTopic || "");
      setNotes(requestedPlan.notes || "");
      setSelectedTopicIds(requestedPlan.selectedTopicIds || []);
      setWeakTopicIds(requestedPlan.weakTopicIds || []);
      setSelectedTemplateIds(requestedPlan.selectedTemplateIds || []);
      setSelectedPastPaperIds(
        (requestedPlan.selectedPastPapers || []).map(
          (paper: { resourceId: string }) => paper.resourceId,
        ),
      );
      setSelectedBooks(
        Object.fromEntries(
          (requestedPlan.selectedBooks || []).map(
            (book: {
              resourceId: string;
              startPage: number;
              endPage: number;
              summaryFocus: string;
              selectedPresetId?: string;
            }) => [
              book.resourceId,
              {
                startPage: book.startPage,
                endPage: book.endPage,
                summaryFocus: book.summaryFocus,
                selectedPresetId: book.selectedPresetId,
              },
            ],
          ),
        ),
      );
      setCurrentPlanId(requestedPlan._id);
      setHydratedPlanId(String(requestedPlan._id));
    }
  }, [hydratedPlanId, requestedPlan]);

  useEffect(() => {
    if (safeRequestedPlanId) {
      return;
    }

    if (!title) {
      setTitle(`${track.board.label} ${track.subject.label} mixed-source pack`);
    }

    if (selectedTopicIds.length === 0) {
      setSelectedTopicIds(track.topics.slice(0, 2).map((topic) => topic.id));
    }

    if (selectedTemplateIds.length === 0 && track.templates[0]) {
      setSelectedTemplateIds([track.templates[0].id]);
    }
  }, [
    safeRequestedPlanId,
    selectedTemplateIds.length,
    selectedTopicIds.length,
    title,
    track,
  ]);

  const selectedTemplateTitles = useMemo(
    () =>
      track.templates
        .filter((template) => selectedTemplateIds.includes(template.id))
        .map((template) => template.title),
    [selectedTemplateIds, track.templates],
  );

  const targetOutcomes = useMemo(
    () =>
      Array.from(
        new Set(
          track.templates
            .filter((template) => selectedTemplateIds.includes(template.id))
            .flatMap((template) => template.targetOutcomes),
        ),
      ),
    [selectedTemplateIds, track.templates],
  );

  const selectedBookPayload = useMemo<IgcseSelectedBook[]>(
    () =>
      track.books
        .filter((book) => selectedBooks[book.id])
        .map((book) => ({
          resourceId: book.id,
          title: book.title,
          publisher: book.publisher,
          edition: book.edition,
          pageCount: book.pageCount,
          topicIds: book.topicIds,
          startPage: clampPageRange(selectedBooks[book.id].startPage, 1, book.pageCount),
          endPage: clampPageRange(
            selectedBooks[book.id].endPage,
            clampPageRange(selectedBooks[book.id].startPage, 1, book.pageCount),
            book.pageCount,
          ),
          summaryFocus: selectedBooks[book.id].summaryFocus,
          selectedPresetId: selectedBooks[book.id].selectedPresetId,
        })),
    [selectedBooks, track.books],
  );

  const selectedPastPaperPayload = useMemo<IgcseSelectedPastPaper[]>(
    () =>
      track.pastPapers
        .filter((paper) => selectedPastPaperIds.includes(paper.id))
        .map((paper) => ({
          resourceId: paper.id,
          title: paper.title,
          paperCode: paper.paperCode,
          sessionLabel: paper.sessionLabel,
          component: paper.component,
          duration: paper.duration,
          topicIds: paper.topicIds,
          questionFocus: paper.questionFocus,
          markSchemeFocus: paper.markSchemeFocus,
        })),
    [selectedPastPaperIds, track.pastPapers],
  );

  const totalEstimatedMinutes = useMemo(() => {
    const templateMinutes = track.templates
      .filter((template) => selectedTemplateIds.includes(template.id))
      .reduce((sum, template) => sum + template.estimatedMinutes, 0);

    return Math.max(
      35,
      templateMinutes + selectedBookPayload.length * 16 + selectedPastPaperPayload.length * 18,
    );
  }, [
    selectedBookPayload.length,
    selectedPastPaperPayload.length,
    selectedTemplateIds,
    track.templates,
  ]);

  const planDraft = useMemo<IgcsePlanDraft>(
    () => ({
      title: title.trim(),
      boardId: track.board.id,
      boardLabel: track.board.label,
      subjectId: track.subject.id,
      subjectLabel: track.subject.label,
      focusTopic: focusTopic.trim(),
      notes: notes.trim(),
      selectedTopicIds,
      selectedTopicTitles: selectedTopicIds.map(
        (topicId) => topicLookup.get(topicId)?.title || topicId,
      ),
      weakTopicIds,
      weakTopicTitles: weakTopicIds.map(
        (topicId) => topicLookup.get(topicId)?.title || topicId,
      ),
      selectedTemplateIds,
      selectedTemplateTitles,
      targetOutcomes,
      totalEstimatedMinutes,
      selectedBooks: selectedBookPayload,
      selectedPastPapers: selectedPastPaperPayload,
    }),
    [
      focusTopic,
      notes,
      selectedBookPayload,
      selectedPastPaperPayload,
      selectedTemplateIds,
      selectedTemplateTitles,
      selectedTopicIds,
      targetOutcomes,
      title,
      topicLookup,
      totalEstimatedMinutes,
      track.board.id,
      track.board.label,
      track.subject.id,
      track.subject.label,
      weakTopicIds,
    ],
  );

  const canPersistPlan =
    planDraft.selectedBooks.length > 0 || planDraft.selectedPastPapers.length > 0;

  const handleResetTrack = (
    nextBoardId: IgcseBoardId,
    nextSubjectId: IgcseSubjectId,
  ) => {
    const nextTrack = getIgcseTrack(nextBoardId, nextSubjectId);
    setBoardId(nextBoardId);
    setSubjectId(nextSubjectId);
    setTitle(`${nextTrack.board.label} ${nextTrack.subject.label} mixed-source pack`);
    setFocusTopic("");
    setNotes("");
    setSelectedTopicIds(nextTrack.topics.slice(0, 2).map((topic) => topic.id));
    setWeakTopicIds([]);
    setSelectedTemplateIds(nextTrack.templates[0] ? [nextTrack.templates[0].id] : []);
    setSelectedPastPaperIds([]);
    setSelectedBooks({});
    setCurrentPlanId(null);
    setHydratedPlanId(null);
  };

  const toggleBook = (bookId: string) => {
    const book = track.books.find((entry) => entry.id === bookId);
    if (!book) return;

    setSelectedBooks((current) => {
      if (current[bookId]) {
        const next = { ...current };
        delete next[bookId];
        return next;
      }

      const preset = book.rangePresets[0];
      return {
        ...current,
        [bookId]: {
          startPage: preset?.startPage || 1,
          endPage: preset?.endPage || Math.min(book.pageCount, 24),
          summaryFocus: preset?.summaryFocus || book.description,
          selectedPresetId: preset?.id,
        },
      };
    });
  };

  const togglePastPaper = (paperId: string) => {
    setSelectedPastPaperIds((current) =>
      current.includes(paperId)
        ? current.filter((id) => id !== paperId)
        : [...current, paperId],
    );
  };

  const toggleTopic = (topicId: string) => {
    setSelectedTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
  };

  const toggleWeakTopic = (topicId: string) => {
    setWeakTopicIds((current) =>
      current.includes(topicId)
        ? current.filter((id) => id !== topicId)
        : [...current, topicId],
    );
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplateIds((current) =>
      current.includes(templateId)
        ? current.filter((id) => id !== templateId)
        : [...current, templateId],
    );
  };

  const applyRangePreset = (bookId: string, presetId: string) => {
    const book = track.books.find((entry) => entry.id === bookId);
    const preset = book?.rangePresets.find((entry) => entry.id === presetId);
    if (!book || !preset) return;

    setSelectedBooks((current) => ({
      ...current,
      [bookId]: {
        startPage: preset.startPage,
        endPage: preset.endPage,
        summaryFocus: preset.summaryFocus,
        selectedPresetId: preset.id,
      },
    }));
  };

  const updateBookRange = (
    bookId: string,
    field: "startPage" | "endPage" | "summaryFocus",
    value: string,
  ) => {
    const book = track.books.find((entry) => entry.id === bookId);
    if (!book || !selectedBooks[bookId]) return;

    setSelectedBooks((current) => {
      const existing = current[bookId];
      if (!existing) return current;

      if (field === "summaryFocus") {
        return {
          ...current,
          [bookId]: {
            ...existing,
            summaryFocus: value,
          },
        };
      }

      const numericValue = Number(value || 0);
      const clampedValue = clampPageRange(numericValue, 1, book.pageCount);
      const nextStart =
        field === "startPage" ? clampedValue : clampPageRange(existing.startPage, 1, book.pageCount);
      const nextEnd =
        field === "endPage"
          ? clampPageRange(clampedValue, nextStart, book.pageCount)
          : clampPageRange(existing.endPage, nextStart, book.pageCount);

      return {
        ...current,
        [bookId]: {
          ...existing,
          startPage: nextStart,
          endPage: nextEnd,
        },
      };
    });
  };

  const persistPlan = async (overrides?: {
    status?: "draft" | "saved" | "pack_ready";
    materialId?: Id<"studyMaterials">;
    docId?: string;
    packId?: Id<"studyPacks">;
    lastBuiltAt?: number;
  }) => {
    const planId = await upsertPlan({
      planId: currentPlanId || undefined,
      title: planDraft.title || buildIgcseMaterialTitle(planDraft),
      boardId: planDraft.boardId,
      boardLabel: planDraft.boardLabel,
      subjectId: planDraft.subjectId,
      subjectLabel: planDraft.subjectLabel,
      focusTopic: planDraft.focusTopic || undefined,
      notes: planDraft.notes || undefined,
      selectedTopicIds: planDraft.selectedTopicIds,
      selectedTopicTitles: planDraft.selectedTopicTitles,
      weakTopicIds: planDraft.weakTopicIds,
      weakTopicTitles: planDraft.weakTopicTitles,
      selectedTemplateIds: planDraft.selectedTemplateIds,
      selectedTemplateTitles: planDraft.selectedTemplateTitles,
      targetOutcomes: planDraft.targetOutcomes,
      totalEstimatedMinutes: planDraft.totalEstimatedMinutes,
      selectedBooks: planDraft.selectedBooks,
      selectedPastPapers: planDraft.selectedPastPapers,
      status: overrides?.status || "saved",
      materialId: overrides?.materialId,
      docId: overrides?.docId,
      packId: overrides?.packId,
      lastBuiltAt: overrides?.lastBuiltAt,
    });

    setCurrentPlanId(planId);
    return String(planId);
  };

  const handleSaveToDashboard = async () => {
    if (!canPersistPlan) {
      toast.error("Choose at least one book or past paper before saving.");
      return;
    }

    setIsSaving(true);
    try {
      const savedPlanId = await persistPlan({ status: "saved" });
      toast.success("IGCSE plan saved to your dashboard.");
      navigate(`/study/dashboard?igcsePlan=${savedPlanId}`);
    } catch (error) {
      console.error(error);
      toast.error("Could not save this IGCSE plan right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBuildPack = async () => {
    if (!canPersistPlan) {
      toast.error("Choose at least one book or past paper before building.");
      return;
    }

    setIsBuilding(true);
    try {
      await persistPlan({ status: "draft" });

      const materialTitle = buildIgcseMaterialTitle(planDraft);
      const content = buildIgcseStudyBrief(planDraft);
      const docId = createDocId();
      const materialId = await createMaterial({
        title: materialTitle,
        type: "text",
        content,
        tags: buildIgcseMaterialTags(planDraft),
        docId,
      });

      await ensureMaterialWorkspace({ docId });

      try {
        const result = await generateAssets({
          materialId,
          content,
          title: materialTitle,
          docId,
          focusPrompt:
            planDraft.focusTopic ||
            planDraft.selectedTemplateTitles.join(", ") ||
            undefined,
        });

        await persistPlan({
          status: "pack_ready",
          materialId,
          docId,
          packId: result?.packId,
          lastBuiltAt: Date.now(),
        });

        toast.success("IGCSE study pack ready.");
        navigate(result?.packId ? `/study/packs/${result.packId}` : `/study/workspace/${docId}`);
      } catch (generationError) {
        console.error(generationError);

        await persistPlan({
          status: "saved",
          materialId,
          docId,
        });

        toast.error("Plan saved, but pack generation failed. Opening the workspace instead.");
        navigate(`/study/workspace/${docId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not build the IGCSE pack right now.");
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="study-dashboard-shell relative min-h-screen overflow-x-hidden px-4 pb-14 pt-16 md:px-8 md:pt-20 xl:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(61,193,255,0.12),transparent_24%),radial-gradient(circle_at_82%_12%,rgba(245,158,11,0.12),transparent_22%),linear-gradient(180deg,#09032f_0%,#060220_55%,#040115_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle,rgba(255,255,255,0.82)_1px,transparent_1.35px)] [background-size:36px_36px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl space-y-6">
        <section className="deepshi-panel rounded-[32px] border border-white/10 p-5 md:p-6">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_340px]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-100">
                <Layers3 className="h-3.5 w-3.5" />
                IGCSE Studio
              </div>
              <div>
                <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-semibold tracking-[-0.055em] text-white">
                  Pick books, target pages, and fuse them with past papers.
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-white/58 md:text-base">
                  This flow is built around the strongest IGCSE demand patterns:
                  board-aware filters, topical paper drill, concise revision outputs,
                  and one saved pack instead of scattered resources.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {IGCSE_DEMAND_SIGNALS.map((signal) => (
                  <span
                    key={signal.id}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/72"
                  >
                    {signal.title}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                Right now
              </p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                    Board and subject
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {track.board.label} · {track.subject.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/55">
                    {track.subject.positioning}
                  </p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                    Selection snapshot
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/42">
                        Books
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {planDraft.selectedBooks.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/42">
                        Papers
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {planDraft.selectedPastPapers.length}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3">
                      <p className="text-xs uppercase tracking-[0.16em] text-white/42">
                        Minutes
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {planDraft.totalEstimatedMinutes}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-[20px] border border-dashed border-white/12 bg-black/20 px-4 py-4">
                  <p className="text-sm leading-6 text-white/58">
                    Page windows in this version are curated revision ranges, not copyrighted book scans.
                    If you upload your own source later, the existing workspace flow can become page-grounded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_360px]">
          <div className="space-y-6">
            <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                    <Filter className="h-3.5 w-3.5" />
                    Step 1
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                    Set the exam lane
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/study/dashboard")}
                  className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                >
                  Back to dashboard
                </Button>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {IGCSE_BOARDS.map((board) => {
                  const isActive = board.id === boardId;
                  return (
                    <button
                      key={board.id}
                      type="button"
                      onClick={() => handleResetTrack(board.id, subjectId)}
                      className={cn(
                        "rounded-[24px] border p-4 text-left transition-colors",
                        isActive
                          ? "border-white/20 bg-white text-[#160d26]"
                          : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]",
                      )}
                    >
                      <p className="text-sm font-semibold">{board.label}</p>
                      <p
                        className={cn(
                          "mt-2 text-xs leading-5",
                          isActive ? "text-[#160d26]/72" : "text-white/52",
                        )}
                      >
                        {board.positioning}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {board.strengths.map((strength) => (
                          <span
                            key={strength}
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[11px]",
                              isActive
                                ? "border-[#160d26]/10 bg-[#160d26]/5 text-[#160d26]/75"
                                : "border-white/10 bg-black/20 text-white/58",
                            )}
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {IGCSE_SUBJECTS.map((subject) => {
                  const isActive = subject.id === subjectId;
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => handleResetTrack(boardId, subject.id)}
                      className={cn(
                        "rounded-[22px] border px-4 py-4 text-left transition-colors",
                        isActive
                          ? "border-cyan-300/30 bg-cyan-300/12 text-cyan-50"
                          : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]",
                      )}
                    >
                      <p className="text-sm font-semibold">{subject.label}</p>
                      <p className="mt-2 text-xs leading-5 text-white/55">
                        {subject.positioning}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                    <Sparkles className="h-3.5 w-3.5" />
                    Step 2
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                    Focus the topics and weak spots
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                    Priority topics
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {track.topics.map((topic) => {
                      const isActive = selectedTopicIds.includes(topic.id);
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => toggleTopic(topic.id)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm transition-colors",
                            isActive
                              ? "border-white/20 bg-white text-[#160d26]"
                              : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]",
                          )}
                        >
                          {topic.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                    Weak-topic revisit
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    {track.topics.map((topic) => {
                      const isActive = weakTopicIds.includes(topic.id);
                      return (
                        <button
                          key={topic.id}
                          type="button"
                          onClick={() => toggleWeakTopic(topic.id)}
                          className={cn(
                            "rounded-[22px] border p-4 text-left transition-colors",
                            isActive
                              ? "border-amber-300/30 bg-amber-300/10 text-white"
                              : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.05]",
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">{topic.title}</p>
                            {isActive ? <Check className="h-4 w-4 text-amber-200" /> : null}
                          </div>
                          <p className="mt-2 text-xs leading-5 text-white/54">
                            {topic.weaknessCue}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  <BookOpenText className="h-3.5 w-3.5" />
                  Step 3
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Choose books and page windows
                </h2>
              </div>

              <div className="mt-5 grid gap-4">
                {track.books.map((book) => {
                  const isSelected = Boolean(selectedBooks[book.id]);
                  const selectedState = selectedBooks[book.id];

                  return (
                    <div
                      key={book.id}
                      className={cn(
                        "rounded-[24px] border p-4",
                        isSelected
                          ? "border-cyan-300/25 bg-cyan-300/10"
                          : "border-white/10 bg-white/[0.03]",
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <p className="text-lg font-semibold text-white">{book.title}</p>
                          <p className="text-sm leading-6 text-white/56">
                            {book.description}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">
                              {book.publisher}
                            </span>
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60">
                              {book.pageCount} pages
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => toggleBook(book.id)}
                          className={cn(
                            "rounded-full px-4",
                            isSelected
                              ? "bg-white text-[#160d26] hover:bg-white/92"
                              : "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
                          )}
                        >
                          {isSelected ? "Selected" : "Select book"}
                        </Button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {book.studyAngles.map((angle) => (
                          <span
                            key={angle}
                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/58"
                          >
                            {angle}
                          </span>
                        ))}
                      </div>

                      {isSelected && selectedState ? (
                        <div className="mt-5 space-y-4 rounded-[22px] border border-white/10 bg-black/20 p-4">
                          <div className="flex flex-wrap gap-2">
                            {book.rangePresets.map((preset) => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => applyRangePreset(book.id, preset.id)}
                                className={cn(
                                  "rounded-full border px-3 py-1.5 text-xs transition-colors",
                                  selectedState.selectedPresetId === preset.id
                                    ? "border-white/20 bg-white text-[#160d26]"
                                    : "border-white/10 bg-white/[0.04] text-white/72 hover:bg-white/[0.08]",
                                )}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          <div className="grid gap-3 md:grid-cols-[120px_120px_minmax(0,1fr)]">
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.18em] text-white/42">
                                Start page
                              </p>
                              <Input
                                type="number"
                                min={1}
                                max={book.pageCount}
                                value={selectedState.startPage}
                                onChange={(event) =>
                                  updateBookRange(book.id, "startPage", event.target.value)
                                }
                                className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.18em] text-white/42">
                                End page
                              </p>
                              <Input
                                type="number"
                                min={selectedState.startPage}
                                max={book.pageCount}
                                value={selectedState.endPage}
                                onChange={(event) =>
                                  updateBookRange(book.id, "endPage", event.target.value)
                                }
                                className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                              />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs uppercase tracking-[0.18em] text-white/42">
                                Summary focus
                              </p>
                              <Input
                                value={selectedState.summaryFocus}
                                onChange={(event) =>
                                  updateBookRange(book.id, "summaryFocus", event.target.value)
                                }
                                className="h-11 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                              />
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  <FileStack className="h-3.5 w-3.5" />
                  Step 4
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Attach topical past papers
                </h2>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {track.pastPapers.map((paper) => {
                  const isSelected = selectedPastPaperIds.includes(paper.id);
                  return (
                    <button
                      key={paper.id}
                      type="button"
                      onClick={() => togglePastPaper(paper.id)}
                      className={cn(
                        "rounded-[24px] border p-4 text-left transition-colors",
                        isSelected
                          ? "border-violet-300/30 bg-violet-300/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-white">{paper.title}</p>
                          <p className="mt-1 text-sm text-white/58">
                            {paper.paperCode} · {paper.sessionLabel}
                          </p>
                        </div>
                        {isSelected ? (
                          <div className="rounded-full border border-violet-300/20 bg-violet-300/16 px-3 py-1 text-xs text-violet-100">
                            Selected
                          </div>
                        ) : null}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-white/56">
                        {paper.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {paper.questionFocus.map((focus) => (
                          <span
                            key={focus}
                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/58"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  <NotebookTabs className="h-3.5 w-3.5" />
                  Step 5
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Decide how the pack should study back
                </h2>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {track.templates.map((template) => {
                  const isSelected = selectedTemplateIds.includes(template.id);
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => toggleTemplate(template.id)}
                      className={cn(
                        "rounded-[24px] border p-4 text-left transition-colors",
                        isSelected
                          ? "border-emerald-300/30 bg-emerald-300/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.05]",
                      )}
                    >
                      <p className="text-lg font-semibold text-white">{template.title}</p>
                      <p className="mt-2 text-sm leading-6 text-white/56">
                        {template.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {template.targetOutcomes.map((outcome) => (
                          <span
                            key={outcome}
                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/58"
                          >
                            {outcome}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <section className="deepshi-panel rounded-[28px] border border-white/10 p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                  Pack summary
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Save to dashboard or build now
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
                    Plan title
                  </label>
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
                    Focus topic
                  </label>
                  <Input
                    value={focusTopic}
                    onChange={(event) => setFocusTopic(event.target.value)}
                    placeholder="Cell transport before Paper 4, trig proofs, practical chemistry..."
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/28"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
                    Build notes
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add any teacher notes, exam date pressure, or what the student keeps missing."
                    className="min-h-[150px] rounded-2xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/28"
                  />
                </div>

                <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                        Selected topics
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {planDraft.selectedTopicIds.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                        Weak topics
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {planDraft.weakTopicIds.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                        Books
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {planDraft.selectedBooks.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/36">
                        Papers
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {planDraft.selectedPastPapers.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    type="button"
                    onClick={handleBuildPack}
                    disabled={isBuilding || !canPersistPlan}
                    className="h-12 w-full rounded-full bg-white text-[#160d26] hover:bg-white/92"
                  >
                    {isBuilding ? "Building mixed study pack..." : "Build mixed study pack"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleSaveToDashboard}
                    disabled={isSaving || !canPersistPlan}
                    className="h-12 w-full rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  >
                    {isSaving ? "Saving..." : "Save to dashboard"}
                  </Button>
                </div>

                <div className="rounded-[22px] border border-dashed border-white/12 bg-black/20 p-4">
                  <p className="text-sm leading-6 text-white/58">
                    Saving keeps the board, books, page ranges, and papers visible on
                    the dashboard. Building creates a study material and pushes it into
                    the existing study-pack pipeline.
                  </p>
                </div>
              </div>
            </section>

            <IGCSEStudioPanel
              plans={recentPlans}
              compact
              onOpenStudio={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              onContinuePlan={(planId) => navigate(`/study/igcse?planId=${planId}`)}
              onOpenArtifact={(plan) => {
                if (plan.packId) {
                  navigate(`/study/packs/${plan.packId}`);
                  return;
                }
                if (plan.docId) {
                  navigate(`/study/workspace/${plan.docId}`);
                }
              }}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
