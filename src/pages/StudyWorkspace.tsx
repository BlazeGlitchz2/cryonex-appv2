import {
  lazy,
  startTransition,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  EyeOff,
  FileText,
  Home,
  Layers3,
  ListChecks,
  MessageSquare,
  Moon,
  Network,
  Sparkles,
  Settings,
  StickyNote,
  Sun,
  TrendingUp,
  Wand2,
  Target,
  Users,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { generateWorksheetPDF } from "@/lib/pdf-generator";
import { StudyWorkspaceLayout } from "@/components/study/StudyWorkspaceLayout";
import { StudyMaterialViewer } from "@/components/study/StudyMaterialViewer";
import { StudyLearningMissionCanvas } from "@/components/study/workspace/StudyLearningMissionCanvas";
import { ShareButton } from "@/components/viral/ShareButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useFocusSessionController } from "@/hooks/use-focus-session-controller";
import { useStudyPresence } from "@/hooks/use-study-presence";
import { useStudentOS } from "@/hooks/use-student-os";
import { resolveStudyWorkspaceSummaryContent } from "@/lib/study-workspace-summary";
import { useThemeStore } from "@/lib/stores/theme-store";

const PDFChat = lazy(() =>
  import("@/components/study/PDFChat").then((module) => ({
    default: module.PDFChat,
  })),
);
const StudyFlashcards = lazy(() =>
  import("@/components/study/StudyFlashcards").then((module) => ({
    default: module.StudyFlashcards,
  })),
);
const StudyQuizzes = lazy(() =>
  import("@/components/study/StudyQuizzes").then((module) => ({
    default: module.StudyQuizzes,
  })),
);
const StudyNotes = lazy(() =>
  import("@/components/study/StudyNotes").then((module) => ({
    default: module.StudyNotes,
  })),
);
const StudyConceptMap = lazy(() =>
  import("@/components/study/StudyConceptMap").then((module) => ({
    default: module.StudyConceptMap,
  })),
);
const KnowledgeGapDashboard = lazy(() =>
  import("@/components/study/KnowledgeGapDashboard").then((module) => ({
    default: module.KnowledgeGapDashboard,
  })),
);
const ImageOcclusionTool = lazy(() =>
  import("@/components/study/ImageOcclusionTool").then((module) => ({
    default: module.ImageOcclusionTool,
  })),
);
const RegionalStudyPlaybooks = lazy(() =>
  import("@/components/study/RegionalStudyPlaybooks").then((module) => ({
    default: module.RegionalStudyPlaybooks,
  })),
);
const SourceGroundingPanel = lazy(() =>
  import("@/components/study/SourceGroundingPanel").then((module) => ({
    default: module.SourceGroundingPanel,
  })),
);

const formatStudyTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

function WorkspacePanelFallback({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex h-full flex-col ${compact ? "justify-start p-4" : "justify-center p-6 md:p-8"}`}
    >
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-foreground/[0.07]" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-full bg-foreground/[0.08]" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-foreground/[0.06]" />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03] md:p-5">
          <p className="text-sm font-medium text-foreground/70">{label}</p>
          <div className="mt-4 space-y-3">
            <div className="h-4 w-full animate-pulse rounded-full bg-foreground/[0.06]" />
            <div className="h-4 w-5/6 animate-pulse rounded-full bg-foreground/[0.05]" />
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-foreground/[0.05]" />
          </div>
        </div>
      </div>
    </div>
  );
}

const demoSummary = `# Cell Structure: Summary

## Cell Theory
- All living organisms are composed of one or more cells.
- The cell is the basic unit of structure and function in living things.
- All cells come from pre-existing cells.

## Cell Membrane
- The cell membrane is a selectively permeable barrier that controls what enters and exits the cell.
- It is composed of a phospholipid bilayer with embedded proteins.
- Key functions include protection, cell signaling, and maintaining homeostasis.

## Cytoplasm & Organelles
- Cytoplasm is the gel-like substance inside the cell where organelles are suspended.
- Organelles each perform specialized functions.
- Mitochondria produce ATP, ribosomes synthesize proteins, and the Golgi apparatus modifies and packages proteins.`;

const demoTranscript =
  "Cell theory, membrane structure, organelles, mitochondria, ribosomes, and Golgi apparatus review notes from Biology 101.";

const isDemoWorkspaceId = (docId?: string) => docId === "test-doc";

type WorkspaceNavButtonProps = {
  id: string;
  icon: LucideIcon;
  label: string;
  count?: number;
};

function StudySummaryCanvas({
  title,
  user,
  isSimpleMode,
  setIsSimpleMode,
  isDeepFocus,
  isEditing,
  setIsEditing,
  summaryContent,
  setSummaryContent,
  handleSaveSummary,
  handleCreatePack,
  isGeneratingPack,
  openImproveDialog,
  onSelectTab,
  sourceWordCount,
  transcriptText,
  flashcards,
  quizzes,
  showPlaybooks,
  setShowPlaybooks,
  showGrounding,
  setShowGrounding,
  applyPlaybookInstruction,
}: {
  title: string;
  user: any;
  isSimpleMode: boolean;
  setIsSimpleMode: (value: boolean) => void;
  isDeepFocus: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  summaryContent: string;
  setSummaryContent: (value: string) => void;
  handleSaveSummary: () => void;
  handleCreatePack: () => void;
  isGeneratingPack: boolean;
  openImproveDialog: () => void;
  onSelectTab: (tab: string) => void;
  sourceWordCount: number;
  transcriptText: string;
  flashcards: any[];
  quizzes: any[];
  showPlaybooks: boolean;
  setShowPlaybooks: (value: boolean) => void;
  showGrounding: boolean;
  setShowGrounding: (value: boolean) => void;
  applyPlaybookInstruction: (instruction: string) => void;
}) {
  const reviewedCards = flashcards.filter(
    (card) => (card.reviewCount || 0) > 0,
  );
  const masteredCards = flashcards.filter((card) => card.status === "mastered");
  const quizQuestionCount = quizzes.reduce(
    (sum, quiz) => sum + (quiz.questions?.length || 0),
    0,
  );
  const hasSummary = Boolean(summaryContent?.trim());
  const readinessParts = [
    hasSummary ? 1 : 0,
    flashcards.length > 0 ? 1 : 0,
    quizzes.length > 0 ? 1 : 0,
    flashcards.length > 0 ? reviewedCards.length / flashcards.length : 0,
  ];
  const studyProgress = Math.round(
    (readinessParts.reduce((sum, value) => sum + value, 0) /
      readinessParts.length) *
      100,
  );
  const masteryScore =
    flashcards.length > 0
      ? Math.round((masteredCards.length / flashcards.length) * 100)
      : quizzes.length > 0
        ? 45
        : 0;
  const masteryLabel =
    masteryScore >= 80
      ? "Strong"
      : masteryScore >= 50
        ? "Growing"
        : flashcards.length || quizzes.length
          ? "Starting"
          : "Setup";
  const masteryTone =
    masteryScore >= 80
      ? "text-emerald-600"
      : masteryScore >= 50
        ? "text-amber-600"
        : "text-blue-600";
  const nextSteps = [
    flashcards.length === 0
      ? {
          label: "Generate source-grounded flashcards",
          helper: `${Math.min(30, Math.max(8, Math.round(sourceWordCount / 80) || 10))} cards suggested`,
          tab: "flashcards",
        }
      : {
          label: `Review ${Math.max(1, flashcards.length - masteredCards.length)} flashcards`,
          helper: `${reviewedCards.length}/${flashcards.length} reviewed`,
          tab: "flashcards",
        },
    quizzes.length === 0
      ? {
          label: "Generate an adaptive quiz",
          helper: "Questions grounded in this source",
          tab: "quizzes",
        }
      : {
          label: `Take ${quizzes[0]?.title || "latest quiz"}`,
          helper: `${quizQuestionCount} total questions`,
          tab: "quizzes",
        },
    !hasSummary
      ? {
          label: "Create a readable summary",
          helper: "Use source text first",
          tab: "summary",
        }
      : {
          label: "Run source grounding check",
          helper: `${sourceWordCount.toLocaleString()} source words`,
          tab: "summary",
          action: () => setShowGrounding(true),
        },
  ];
  const sourceEvidenceCards = [
    {
      label: "Selected",
      location: "Source text",
      text:
        transcriptText.trim().slice(0, 180) ||
        "Source evidence appears here once extraction is ready.",
    },
    {
      label: "Summary",
      location: `${sourceWordCount.toLocaleString()} words`,
      text:
        summaryContent.trim().slice(0, 140) ||
        "The notebook summary will stay tied to this source.",
    },
  ];
  const studyPath = [
    {
      label: "Summary",
      status: hasSummary ? "done" : "current",
    },
    {
      label: "Cards",
      status: flashcards.length > 0 ? "done" : "current",
    },
    {
      label: "Quiz",
      status: quizzes.length > 0 ? "done" : "locked",
    },
    {
      label: "Gaps",
      status: reviewedCards.length > 0 ? "current" : "locked",
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f6faff] dark:bg-[#07101d]">
      <div className="border-b border-slate-200/80 bg-white/88 px-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1220]/88">
        <div className="flex gap-8 overflow-x-auto">
          {[
            ["summary", "Summary"],
            ["notes", "Notes"],
            ["flashcards", "Flashcards"],
            ["quizzes", "Quiz"],
            ["mindmap", "Concept Map"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              className={cn(
                "border-b-2 px-1 py-4 text-sm font-semibold transition-colors",
                id === "summary"
                  ? "border-cyan-500 text-cyan-700 dark:text-cyan-200"
                  : "border-transparent text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 lg:p-4">
        <div className="min-h-0 flex-1 overflow-y-auto rounded-3xl border border-slate-200/80 bg-white/94 shadow-[0_18px_48px_rgba(15,23,42,0.07)] dark:border-white/10 dark:bg-[#0b1220]/94 dark:shadow-[0_20px_54px_rgba(0,0,0,0.36)]">
          <div className="border-b border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,252,255,0.92),rgba(255,255,255,0.82))] px-5 py-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(18,27,46,0.94),rgba(11,18,32,0.84))] lg:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                    {title}: Summary
                  </h2>
                  <button
                    type="button"
                    className="rounded-full p-1.5 text-slate-400 transition hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-white/10"
                    aria-label="Favorite summary"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {sourceWordCount.toLocaleString()} source words
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    [BookOpen, "Source"],
                    [FileText, isSimpleMode ? "Simple mode" : "Detailed mode"],
                    [Network, "Grounded"],
                    [Zap, isDeepFocus ? "Deep Focus" : "Student OS"],
                  ].map(([Icon, label]) => (
                    <span
                      key={String(label)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300"
                    >
                      <Icon className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                      {label as string}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid min-w-[260px] grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 place-items-center rounded-full border-[5px] border-emerald-500 border-b-cyan-300 bg-emerald-50 text-sm font-extrabold text-slate-950 shadow-inner dark:bg-emerald-500/10 dark:text-white">
                    {studyProgress}%
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Study Progress
                    </p>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">
                      {flashcards.length || quizzes.length
                        ? "Assets ready"
                        : "Needs generation"}
                    </p>
                  </div>
                </div>
                <div className="border-l border-slate-200 pl-5 dark:border-white/10">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Mastery
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-amber-500" />
                    <span className={cn("text-sm font-bold", masteryTone)}>
                      {masteryLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {masteredCards.length}/{flashcards.length} cards mastered
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-3 lg:px-6">
            {isEditing ? (
              <Textarea
                value={summaryContent}
                onChange={(event) => setSummaryContent(event.target.value)}
                className="min-h-[430px] resize-none rounded-lg border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-800 dark:border-white/10 dark:bg-black/25 dark:text-slate-100"
              />
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.035]">
                    <button
                      type="button"
                      onClick={() => setShowPlaybooks(!showPlaybooks)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.04]"
                    >
                      Study Playbooks & Pack
                      {showPlaybooks ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    {showPlaybooks ? (
                      <div className="border-t border-slate-200 p-4 dark:border-white/10">
                        <Suspense
                          fallback={
                            <WorkspacePanelFallback
                              label="Loading playbooks..."
                              compact
                            />
                          }
                        >
                          <RegionalStudyPlaybooks
                            region={user?.region}
                            country={user?.country}
                            curriculum={user?.curriculum}
                            curriculumTrack={user?.curriculumTrack}
                            gradeLevel={user?.gradeLevel}
                            targetSubjects={user?.targetSubjects}
                            targetExams={user?.targetExams}
                            studyPace={user?.studyPace}
                            preferredLanguage={user?.preferredLanguage}
                            isRTL={user?.isRTL}
                            onApplyInstruction={applyPlaybookInstruction}
                          />
                        </Suspense>
                      </div>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.035]">
                    <button
                      type="button"
                      onClick={() => setShowGrounding(!showGrounding)}
                      className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.04]"
                    >
                      Source Grounding Check
                      {showGrounding ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                    {showGrounding ? (
                      <div className="border-t border-slate-200 p-4 dark:border-white/10">
                        <Suspense
                          fallback={
                            <WorkspacePanelFallback
                              label="Checking source grounding..."
                              compact
                            />
                          }
                        >
                          <SourceGroundingPanel
                            summary={summaryContent}
                            sourceText={transcriptText}
                          />
                        </Suspense>
                      </div>
                    ) : null}
                  </div>
                </div>

                <Suspense
                  fallback={
                    <WorkspacePanelFallback label="Rendering summary..." />
                  }
                >
                  <StudyMaterialViewer
                    className="rounded-2xl border border-slate-200/80 bg-white px-5 py-5 shadow-sm dark:border-white/10 dark:bg-white/[0.025]"
                    content={
                      summaryContent?.trim() ||
                      (isSimpleMode
                        ? "Simple summary not available."
                        : "No summary content available yet.")
                    }
                  />
                </Suspense>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-4 w-4" />
                Last updated 1h ago
                <span className="text-slate-300 dark:text-slate-600">|</span>
                {sourceWordCount.toLocaleString()} source words
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsSimpleMode(!isSimpleMode)}
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                >
                  {isSimpleMode ? "Detailed" : "Simple"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    isEditing ? handleSaveSummary() : setIsEditing(true)
                  }
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>
                <button
                  type="button"
                  onClick={openImproveDialog}
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.05]"
                >
                  Improve
                </button>
                <button
                  type="button"
                  onClick={handleCreatePack}
                  disabled={isGeneratingPack}
                  className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-bold text-cyan-700 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-400/20 dark:bg-cyan-500/15 dark:text-cyan-200 dark:hover:bg-cyan-500/20"
                >
                  {isGeneratingPack ? "Generating..." : "Generate Study Pack"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid shrink-0 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
          <div className="rounded-3xl border border-slate-200/80 bg-white/94 p-3 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Quick Actions
              </h3>
              <MoreButton />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {[
                [
                  FileText,
                  flashcards.length
                    ? "Review Flashcards"
                    : "Generate Flashcards",
                  flashcards.length
                    ? `${flashcards.length} cards`
                    : "From this source",
                  "flashcards",
                  "text-purple-600",
                ],
                [
                  CheckCircle2,
                  quizzes.length ? "Practice Quiz" : "Generate Quiz",
                  quizzes.length
                    ? `${quizQuestionCount} questions`
                    : "Adaptive questions",
                  "quizzes",
                  "text-emerald-600",
                ],
                [
                  Network,
                  "Concept Map",
                  sourceWordCount > 0 ? "Source structure" : "Visual overview",
                  "mindmap",
                  "text-blue-600",
                ],
                [
                  StickyNote,
                  "Add Note",
                  "Capture thoughts",
                  "notes",
                  "text-amber-600",
                ],
              ].map(([Icon, label, helper, tab, color]) => (
                <button
                  key={String(label)}
                  type="button"
                  onClick={() => onSelectTab(tab as string)}
                  className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-50/50 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-400/30 dark:hover:bg-cyan-500/10"
                >
                  <Icon className={cn("h-6 w-6", color as string)} />
                  <span>
                    <span className="block text-sm font-bold leading-tight text-slate-900 dark:text-white">
                      {label as string}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {helper as string}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/94 p-3 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
            <h3 className="mb-2 text-sm font-bold text-slate-800 dark:text-white">
              Next Steps
            </h3>
            <div className="space-y-2 rounded-2xl border border-slate-200/80 p-3 dark:border-white/10">
              {nextSteps.map((step) => (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => {
                    step.action?.();
                    onSelectTab(step.tab);
                  }}
                  className="flex w-full items-center justify-between gap-3 text-left text-xs text-slate-700 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-200"
                >
                  <span className="flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5 text-slate-400" />
                    {step.label}
                  </span>
                  <span className="text-slate-400">{step.helper}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid shrink-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
          <div className="rounded-3xl border border-slate-200/80 bg-white/94 p-3 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Source Evidence
              </h3>
              <button
                type="button"
                onClick={() => setShowGrounding(true)}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-900 dark:text-cyan-300"
              >
                Show grounding
              </button>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {sourceEvidenceCards.map((card) => (
                <button
                  key={card.label}
                  type="button"
                  onClick={() => setShowGrounding(true)}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 text-left transition hover:border-emerald-200 hover:bg-emerald-50/60 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10"
                >
                  <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                    {card.label}
                  </span>
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {card.location}
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-800 dark:text-slate-200">
                    {card.text}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white/94 p-3 shadow-sm dark:border-white/10 dark:bg-[#0b1220]">
            <h3 className="mb-3 text-sm font-bold text-slate-800 dark:text-white">
              Adaptive Study Path
            </h3>
            <div className="flex items-center gap-2">
              {studyPath.map((item, index) => (
                <div
                  key={item.label}
                  className="flex min-w-0 flex-1 items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={() =>
                      onSelectTab(
                        item.label === "Cards"
                          ? "flashcards"
                          : item.label === "Quiz"
                            ? "quizzes"
                            : item.label === "Gaps"
                              ? "gaps"
                              : "summary",
                      )
                    }
                    className={cn(
                      "flex min-h-[58px] w-full flex-col items-center justify-center rounded-2xl border px-2 text-xs font-bold transition",
                      item.status === "done"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:text-emerald-200"
                        : item.status === "current"
                          ? "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-400/25 dark:bg-cyan-500/10 dark:text-cyan-200"
                          : "border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/[0.03]",
                    )}
                  >
                    <CheckCircle2 className="mb-1 h-4 w-4" />
                    {item.label}
                  </button>
                  {index < studyPath.length - 1 ? (
                    <div className="hidden h-px w-5 shrink-0 bg-slate-200 dark:bg-white/10 sm:block" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoreButton() {
  return (
    <button
      type="button"
      onClick={() => toast.info("More quick actions are coming soon.")}
      className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
      aria-label="More quick actions"
    >
      <ChevronDown className="h-4 w-4" />
    </button>
  );
}

export default function StudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { mode, toggleMode } = useThemeStore();
  const isLightMode = mode === "light";
  const { user, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const packIdParam = searchParams.get("packId");

  // Student OS Integration
  const { osState } = useStudentOS();
  const isFatigued = osState?.flowState === "fatigue";
  const isDeepFocus = osState?.flowState === "deep-focus";

  const document = useQuery(
    api.studyQuery.getDocument,
    docId ? { docId } : "skip",
  ) as any;
  const sharedPack = useQuery(
    api.study.getStudyPack,
    packIdParam ? { packId: packIdParam as any } : "skip",
  ) as any;
  const material = useQuery(
    api.study.getMaterialByDocId,
    docId ? { docId } : "skip",
  );
  const sharedPackShareId = sharedPack?.shareId || undefined;
  const sharedPackMaterialId = sharedPack?.materialId || undefined;
  const recommendations = useQuery(api.study.getStudyRecommendations, {});
  const improveSummary = useAction(api.autoGenerate.improveSummary);
  const updateDocumentSummary = useMutation(
    api.studyMutations.updateDocumentSummary,
  );
  const ensureMaterialWorkspace = useMutation(
    api.studyMutations.ensureMaterialWorkspace,
  );

  const flashcards = useQuery(
    api.study.listFlashcards,
    material?._id || sharedPackShareId || sharedPackMaterialId
      ? {
          materialId: material?._id || sharedPackMaterialId,
          shareId: sharedPackShareId,
        }
      : "skip",
  );
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const quizzes = useQuery(
    api.study.listQuizzes,
    material?._id || sharedPackShareId || sharedPackMaterialId
      ? {
          materialId: material?._id || sharedPackMaterialId,
          shareId: sharedPackShareId,
        }
      : "skip",
  );

  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveDialog, setShowImproveDialog] = useState(false);
  const [summaryDirty, setSummaryDirty] = useState(false);
  const normalizedTabParam =
    tabParam === "quiz"
      ? "quizzes"
      : tabParam === "concept-map"
        ? "mindmap"
        : tabParam;
  const [activeTab, setActiveTab] = useState<string>(
    normalizedTabParam || "summary",
  );
  const [showPlaybooks, setShowPlaybooks] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const demoWorkspaceDocument = isDemoWorkspaceId(docId)
    ? {
        meta: {
          title: "Cell Structure",
        },
        summary: {
          simple: demoSummary,
          detailed: demoSummary,
          short:
            "Cell theory, membranes, and organelles in one study workspace.",
        },
        extracted: {
          text: demoTranscript,
          sections: [],
        },
        workspaceRecovered: false,
      }
    : null;
  const resolvedDocument =
    document ||
    (sharedPack
      ? {
          meta: {
            title:
              sharedPack.title || sharedPack.sourceTitle || "Shared study pack",
          },
          summary: sharedPack.summary || null,
          extracted: {
            text:
              sharedPack.summary?.detailed ||
              sharedPack.summary?.short ||
              sharedPack.description ||
              "",
            sections: [],
          },
          workspaceRecovered: true,
        }
      : demoWorkspaceDocument);

  useEffect(() => {
    if (resolvedDocument?.summary) {
      // If OS detects fatigue, force simple mode to reduce cognitive load
      const shouldUseSimpleMode = isFatigued ? true : isSimpleMode;
      if (shouldUseSimpleMode !== isSimpleMode) {
        setIsSimpleMode(shouldUseSimpleMode);
        toast(
          "Student OS: Cognitive fatigue detected. Switched to Simple Mode constraints.",
          { icon: "🧠" },
        );
      }

      if (!isEditing && !summaryDirty) {
        setSummaryContent(
          resolveStudyWorkspaceSummaryContent(
            resolvedDocument.summary,
            shouldUseSimpleMode,
          ),
        );
      }
    }
  }, [resolvedDocument, isSimpleMode, isFatigued, isEditing, summaryDirty]);

  useEffect(() => {
    setSummaryDirty(false);
  }, [docId]);

  const transcriptText =
    resolvedDocument?.extracted?.text ||
    ((resolvedDocument?.extracted?.sections as any[] | undefined)
      ?.map((section) => section.text)
      .join("\n\n") ??
      "");
  const sourceWordCount = transcriptText.split(/\s+/).filter(Boolean).length;
  const flashcardsCount = (flashcards || []).length;
  const reviewedFlashcardsCount = (flashcards || []).filter(
    (card: any) => (card.reviewCount || 0) > 0,
  ).length;
  const masteredFlashcardsCount = (flashcards || []).filter(
    (card: any) => card.status === "mastered",
  ).length;
  const quizzesCount = (quizzes || []).length;
  const quizQuestionCount = (quizzes || []).reduce(
    (sum: number, quiz: any) => sum + (quiz.questions?.length || 0),
    0,
  );
  const sourceSections = useMemo(() => {
    const extractedSections =
      (resolvedDocument?.extracted?.sections as
        | Array<{ id?: string; title?: string; text?: string }>
        | undefined) || [];
    const usableSections = extractedSections
      .filter((section) => section.title || section.text)
      .slice(0, 8);

    if (usableSections.length > 0) {
      return usableSections.map((section, index) => ({
        id: section.id || `section-${index}`,
        title: section.title || `Source section ${index + 1}`,
        text: section.text || "",
        count: Math.max(
          1,
          Math.round(
            (section.text || "").split(/\s+/).filter(Boolean).length / 120,
          ),
        ),
      }));
    }

    const title = resolvedDocument?.meta?.title || "Source";
    return [
      {
        id: "source",
        title,
        text: transcriptText,
        count: Math.max(1, Math.round(sourceWordCount / 350) || 1),
      },
    ];
  }, [resolvedDocument, sourceWordCount, transcriptText]);
  const isDocumentLoading =
    Boolean(docId) &&
    !demoWorkspaceDocument &&
    (authLoading ||
      document === undefined ||
      (material === undefined && !sharedPack));
  const hasValidWorkspace = Boolean(docId && user && resolvedDocument);
  const {
    activeSession,
    elapsedSeconds: studyTime,
    remainingSeconds,
    selectedDuration,
    sessionState,
    startFocusSession,
  } = useFocusSessionController({
    activityType: "reading",
    enabled: hasValidWorkspace,
    materialId: material?._id,
    surfaceLabel: resolvedDocument?.meta?.title || "Study Workspace",
  });
  useStudyPresence({
    source: "study_workspace",
    route: docId ? `/study/workspace/${docId}` : "/study/workspace",
    currentActivity: activeTab,
    currentSection: activeTab,
    title: resolvedDocument?.meta?.title || "Study Workspace",
    subject: material?.type || undefined,
    materialId: material?._id,
    docId,
    sessionId: activeSession?._id,
    enabled: hasValidWorkspace,
    details: {
      studyTime,
      isSimpleMode,
      hasFlashcards: Boolean(flashcards?.length),
      hasQuizzes: Boolean(quizzes?.length),
      focusPhase: sessionState?.phase || "idle",
    },
  });

  useEffect(() => {
    if (
      !docId ||
      authLoading ||
      resolvedDocument === undefined ||
      !resolvedDocument?.workspaceRecovered
    ) {
      return;
    }

    void ensureMaterialWorkspace({ docId }).catch(console.error);
  }, [authLoading, docId, resolvedDocument, ensureMaterialWorkspace]);

  const handleSaveSummary = async () => {
    if (!docId) return;

    if (!document) {
      setSummaryDirty(false);
      setIsEditing(false);
      toast.success("Preview summary updated locally.");
      return;
    }

    try {
      await updateDocumentSummary({
        docId,
        summary: {
          ...document.summary,
          [isSimpleMode ? "simple" : "detailed"]: summaryContent,
          short: summaryContent.substring(0, 200) + "...",
        },
      });
      setSummaryDirty(false);
      setIsEditing(false);
      toast.success("Summary updated!");
    } catch {
      toast.error("Failed to save summary");
    }
  };

  const handleImproveSummary = async () => {
    if (!summaryContent || !aiInstruction) return;
    if (!user) {
      toast.info("Sign in to use AI improvement on your own material.");
      return;
    }

    setIsImproving(true);
    try {
      const improved = await improveSummary({
        currentSummary: summaryContent,
        instruction: aiInstruction,
      });
      setSummaryContent(improved);
      setSummaryDirty(true);
      setAiInstruction("");
      setShowImproveDialog(false);
      toast.success("Summary improved by AI!");
    } catch {
      toast.error("Failed to improve summary");
    } finally {
      setIsImproving(false);
    }
  };

  const applyPlaybookInstruction = (instruction: string) => {
    setAiInstruction(instruction);
    setShowImproveDialog(true);
    if (isEditing) setIsEditing(false);
  };

  const handleDownloadWorksheet = () => {
    if (!resolvedDocument || !summaryContent) {
      toast.error("No content available to generate worksheet");
      return;
    }

    try {
      generateWorksheetPDF({
        title: resolvedDocument.meta.title || "Untitled Worksheet",
        summary: summaryContent,
        flashcards: (flashcards || []).map((f: any) => ({
          front: f.front,
          back: f.back,
        })),
        quizzes: (quizzes || []).flatMap((q: any) =>
          (q.questions || []).map((quest: any) => ({
            question: quest.question,
            options: quest.options,
            correctAnswer: quest.correctAnswer,
            explanation: quest.explanation,
            type: quest.type,
          })),
        ),
        metadata: {
          region: user?.region,
          curriculum: user?.curriculum,
        },
      });
      toast.success("Worksheet generated successfully!");
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const handleCreatePack = async () => {
    if (isGeneratingPack) return;
    if (!user || isDemoWorkspaceId(docId)) {
      toast.info(
        "Sign in to generate a live study pack from your own sources.",
      );
      return;
    }
    if (!material) {
      toast.error("Study material is still loading.");
      return;
    }
    if (!transcriptText.trim()) {
      toast.error("No source text available to build a study pack.");
      return;
    }

    setIsGeneratingPack(true);
    const creationToast = toast.loading("Building your reusable study pack...");
    try {
      await generateAllAssets({
        materialId: material._id,
        content: transcriptText,
        title: material.title,
        docId: material.docId,
      });
      toast.success("Study Pack created! You can now share it with others.", {
        id: creationToast,
      });
    } catch {
      toast.error("Failed to create Study Pack. Please try again.", {
        id: creationToast,
      });
    } finally {
      setIsGeneratingPack(false);
    }
  };

  if (!docId) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-foreground/50">
        Missing workspace source.
      </div>
    );
  }

  const handleSelectTab = (tabId: string) => {
    startTransition(() => {
      setActiveTab(tabId);
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (tabId === "summary") {
          nextParams.delete("tab");
        } else {
          nextParams.set("tab", tabId);
        }
        return nextParams;
      });
    });
  };

  const handleJumpToSourceSection = (sectionId: string) => {
    handleSelectTab("summary");
    window.requestAnimationFrame(() => {
      const target = window.document.getElementById(
        `study-source-${sectionId.replace(/[^a-z0-9_-]/gi, "-")}`,
      );
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const NavButton = ({
    id,
    icon: Icon,
    label,
    count,
  }: WorkspaceNavButtonProps) => (
    <button
      type="button"
      onClick={() =>
        id === "home" ? navigate("/study/dashboard") : handleSelectTab(id)
      }
      className={cn(
        "group flex h-11 w-full items-center gap-3 rounded-2xl border px-3 text-left text-sm font-semibold transition-all duration-200",
        activeTab === id
          ? "border-amber-200 bg-amber-50 text-amber-900 shadow-[0_10px_24px_rgba(245,158,11,0.14)] dark:border-amber-300/28 dark:bg-amber-300/12 dark:text-amber-100"
          : "border-transparent text-slate-600 hover:border-amber-200/70 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:border-amber-200/12 dark:hover:bg-white/8 dark:hover:text-white",
      )}
      title={label}
    >
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors",
          activeTab === id
            ? "bg-white text-amber-700 dark:bg-white/10 dark:text-amber-100"
            : "bg-slate-100 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-700 dark:bg-white/5 dark:text-slate-400",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count !== undefined ? (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-500 dark:bg-white/8 dark:text-slate-300">
          {count}
        </span>
      ) : null}
    </button>
  );

  const sidebarContent = (
    <div className="flex h-full min-h-0 w-full flex-col p-3">
      <div className="mb-3 flex items-center gap-3 px-1">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[linear-gradient(180deg,#ffe0a6,#f97316)] text-[#160804] shadow-[0_12px_28px_rgba(249,115,22,0.28)]">
          <span className="text-lg font-black">C</span>
        </div>
        <div>
          <p className="text-sm font-extrabold tracking-tight text-slate-950 dark:text-white">
            cryonex
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700/80 dark:text-amber-100/80">
            Student OS
          </p>
        </div>
      </div>

      <div className="mb-3 rounded-3xl border border-amber-200/70 bg-amber-50/70 p-3 dark:border-amber-200/10 dark:bg-amber-200/[0.055]">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700/70 dark:text-amber-100/70">
          Personal lane
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-black leading-5 text-slate-950 dark:text-white">
          {user?.name?.split(" ")?.[0] || "Student"} studies{" "}
          {resolvedDocument?.meta?.title || "this source"}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-white/[0.05]">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Mode
            </p>
            <p className="mt-1 truncate text-xs font-black text-slate-950 dark:text-white">
              {isFatigued ? "Recovery" : isDeepFocus ? "Focus" : "Guided"}
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-white/[0.05]">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              Source
            </p>
            <p className="mt-1 truncate text-xs font-black text-slate-950 dark:text-white">
              {sourceWordCount || 0} words
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <NavButton id="home" icon={Home} label="Home" />
        <NavButton id="summary" icon={FileText} label="Workspace" />
        <NavButton id="chat" icon={MessageSquare} label="AI Coach" />
        <NavButton
          id="flashcards"
          icon={Brain}
          label="Flashcards"
          count={flashcardsCount || undefined}
        />
        <NavButton
          id="quizzes"
          icon={ListChecks}
          label="Quizzes"
          count={quizQuestionCount || quizzesCount || undefined}
        />
        <NavButton id="notes" icon={StickyNote} label="Notes" />
        <NavButton id="mindmap" icon={Network} label="Concept Map" />
        <NavButton
          id="gaps"
          icon={TrendingUp}
          label="Knowledge Gaps"
          count={
            reviewedFlashcardsCount
              ? Math.max(1, flashcardsCount - masteredFlashcardsCount)
              : undefined
          }
        />
        <NavButton id="diagrams" icon={EyeOff} label="Occlusion" />
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-3xl border border-amber-200/60 bg-amber-50/35 p-3 dark:border-amber-200/10 dark:bg-white/[0.035]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Source map
          </p>
          <Layers3 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-200" />
        </div>
        <div className="space-y-1">
          {sourceSections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleJumpToSourceSection(section.id)}
              className="group flex w-full items-center gap-2 rounded-2xl px-2 py-2 text-left transition hover:bg-white dark:hover:bg-white/8"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-amber-200 bg-white text-[10px] font-extrabold text-amber-700 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-100">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-slate-700 dark:text-slate-200">
                  {section.title}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {section.count} blocks
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-3xl border border-slate-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold text-slate-900 dark:text-white">
              {user?.name || "Student"}
            </p>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              {user?.curriculumTrack || user?.curriculum || "Personal plan"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="grid h-8 w-8 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/8 dark:hover:text-white"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/[0.04]">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Focus streak
          </p>
          <p className="mt-1 text-xl font-black text-slate-950 dark:text-white">
            {Math.max(1, Math.round(studyTime / 600) || 1)} days
          </p>
        </div>
      </div>
    </div>
  );

  if (isDocumentLoading) {
    return (
      <StudyWorkspaceLayout
        activeTab={activeTab}
        header={
          <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/study/dashboard")}
                className="h-9 w-9 rounded-lg p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white md:w-auto md:px-3"
              >
                <ArrowLeft className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
              </Button>
              <div className="hidden h-6 w-px bg-foreground/10 md:block" />
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-44 animate-pulse rounded-full bg-foreground/[0.08]" />
                  <div className="h-3 w-28 animate-pulse rounded-full bg-foreground/[0.05]" />
                </div>
              </div>
            </div>
            <div className="h-9 w-28 animate-pulse rounded-lg bg-foreground/[0.05]" />
          </header>
        }
        topBar={
          <div className="flex items-center gap-3 overflow-x-auto border-b border-slate-200 bg-slate-50/80 px-4 py-2 dark:border-white/10 dark:bg-white/[0.03]">
            <div className="h-3 w-24 animate-pulse rounded-full bg-foreground/[0.07]" />
            <div className="h-4 w-px bg-border" />
            <div className="h-3 w-32 animate-pulse rounded-full bg-foreground/[0.06]" />
          </div>
        }
        sidebar={sidebarContent}
        content={
          <div className="flex min-h-0 flex-col">
            <div className="border-b border-border bg-foreground/[0.02] p-6">
              <div className="h-6 w-32 animate-pulse rounded-full bg-foreground/[0.08]" />
            </div>
            <WorkspacePanelFallback label="Loading workspace content..." />
          </div>
        }
        chat={
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-foreground/[0.02] p-4">
              <div className="h-4 w-28 animate-pulse rounded-full bg-foreground/[0.08]" />
              <div className="h-3 w-16 animate-pulse rounded-full bg-foreground/[0.05]" />
            </div>
            <WorkspacePanelFallback
              label="Connecting your study assistant..."
              compact
            />
          </>
        }
      />
    );
  }

  if (!resolvedDocument) {
    if (sharedPack) {
      return (
        <div className="flex h-full items-center justify-center px-6 text-center">
          <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
            Loading shared study pack...
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
          This workspace could not be found.
        </div>
      </div>
    );
  }

  const workspaceLearnerName = user?.name?.split(" ")?.[0] || "User";
  const workspaceFocus =
    (resolvedDocument.meta.title || "this source")
      .replace(/\.(pdf|docx?|pptx?|txt)$/i, "")
      .replace(/[-_]+/g, " ")
      .trim() || "this source";
  const workspaceModeLabel = isFatigued
    ? "Recovery lane"
    : isDeepFocus
      ? "Deep Focus"
      : "Learning OS";

  return (
    <StudyWorkspaceLayout
      activeTab={activeTab}
      header={
        <header className="flex h-[68px] shrink-0 items-center justify-between gap-3 px-4 py-2 md:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/study/dashboard")}
              className="h-10 w-10 rounded-2xl border border-slate-200/80 bg-white/80 p-0 text-slate-600 shadow-sm hover:bg-white hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white md:w-auto md:px-3"
            >
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Back</span>
            </Button>
            <button
              type="button"
              onClick={() => navigate("/study/dashboard")}
              className="hidden min-w-[230px] max-w-[280px] items-center justify-between rounded-2xl border border-amber-900/10 bg-white/86 px-3 py-2 text-left shadow-sm transition hover:bg-white dark:border-amber-200/10 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] md:flex"
            >
              <FileText className="mr-2 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-200" />
              <span className="truncate text-sm font-bold text-slate-950 dark:text-white">
                {resolvedDocument.meta.title || "Untitled Document"}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          <div className="hidden min-w-0 items-center gap-2 lg:flex">
            <div className="flex items-center gap-2 rounded-2xl border border-amber-900/10 bg-white/86 px-3 py-2 shadow-sm dark:border-amber-200/10 dark:bg-white/[0.05]">
              <Target className="h-5 w-5 text-amber-600 dark:text-amber-200" />
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Focus
              </span>
              <span className="font-mono text-xl font-bold text-slate-950 dark:text-white">
                {sessionState?.phase === "active"
                  ? formatStudyTime(remainingSeconds)
                  : `${selectedDuration}:00`}
              </span>
              <button
                type="button"
                onClick={() => startFocusSession()}
                className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:bg-amber-300/15 dark:text-amber-100 dark:hover:bg-amber-300/25"
              >
                {sessionState?.phase === "active" ? "On" : "Start"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleSelectTab("flashcards")}
              className="flex max-w-[240px] items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-left shadow-sm hover:bg-amber-50 dark:border-amber-300/20 dark:bg-amber-300/10 dark:hover:bg-amber-300/15"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-amber-500 text-amber-700 dark:text-amber-100">
                <Clock className="h-4 w-4" />
              </div>
              <span>
                <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Next up
                </span>
                <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">
                  {flashcardsCount
                    ? `Review ${Math.max(1, flashcardsCount - masteredFlashcardsCount)} cards`
                    : "Generate study pack"}
                </span>
              </span>
              <ChevronDown className="-rotate-90 h-4 w-4 text-slate-400" />
            </button>

            <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white/86 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.05]">
              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-200" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                {isFatigued
                  ? "Fatigue guard"
                  : isDeepFocus
                    ? "Deep Focus"
                    : "OS learning"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSelectTab("gaps")}
              className="hidden h-10 w-10 rounded-2xl border border-transparent text-slate-500 hover:border-slate-200 hover:bg-white dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/[0.08] xl:inline-flex"
              aria-label="Open study analytics"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast.info("No study alerts yet.")}
              className="hidden h-10 w-10 rounded-2xl border border-transparent text-slate-500 hover:border-slate-200 hover:bg-white dark:text-slate-300 dark:hover:border-white/10 dark:hover:bg-white/[0.08] xl:inline-flex"
              aria-label="Open study alerts"
            >
              <Bell className="h-5 w-5" />
            </Button>

            {material ? (
              <ShareButton
                id={material._id}
                type="material"
                title={material.title}
                isPublic={material.isPublic}
                existingShareId={material.shareId}
              />
            ) : (
              <Button
                variant="outline"
                onClick={() =>
                  toast.info("Sign in and open a saved source to share.")
                }
                className="hidden rounded-2xl border-slate-200/80 bg-white/86 text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08] xl:inline-flex"
              >
                <Users className="mr-2 h-4 w-4" />
                Share
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleDownloadWorksheet}
              className="hidden rounded-2xl border-amber-900/10 bg-white/86 text-slate-700 hover:bg-white dark:border-amber-200/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08] md:inline-flex"
            >
              Export
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMode}
              className="h-10 w-10 rounded-2xl border border-slate-200/80 bg-white/86 text-slate-600 shadow-sm hover:bg-white dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-200 dark:hover:bg-white/[0.08]"
              aria-label="Toggle light or dark mode"
            >
              {isLightMode ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
          </div>
        </header>
      }
      topBar={
        <div className="border-b border-amber-900/10 bg-white/72 px-4 py-3 backdrop-blur-xl dark:border-amber-200/10 dark:bg-[#0a0610]/76 md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-amber-700/70 dark:text-amber-100/70">
                Personal study OS
              </p>
              <p className="mt-1 truncate text-sm font-bold text-slate-950 dark:text-white md:text-base">
                Hey {workspaceLearnerName}. Continue {workspaceFocus}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-100">
                {workspaceModeLabel}
              </span>
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-cyan-700 dark:border-cyan-400/25 dark:bg-cyan-500/10 dark:text-cyan-200">
                Source linked
              </span>
            </div>
          </div>

          <div className="mt-3 grid gap-2 md:grid-cols-4">
            {[
              {
                label: "Learner",
                value: workspaceLearnerName,
                detail:
                  user?.curriculumTrack || user?.curriculum || "Personal plan",
              },
              {
                label: "Source",
                value: `${sourceWordCount || 0} words`,
                detail: resolvedDocument.meta.title || "Untitled document",
              },
              {
                label: "Next move",
                value: flashcardsCount ? "Recall" : "Build pack",
                detail: flashcardsCount
                  ? `${Math.max(1, flashcardsCount - masteredFlashcardsCount)} cards left`
                  : "Generate flashcards",
              },
              {
                label: "Session",
                value:
                  sessionState?.phase === "active"
                    ? formatStudyTime(remainingSeconds)
                    : `${selectedDuration}:00`,
                detail: isDeepFocus ? "Deep focus active" : "Ready to start",
              },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.label === "Next move") handleSelectTab("flashcards");
                  if (item.label === "Session") startFocusSession();
                }}
                className="rounded-2xl border border-amber-900/10 bg-white/72 px-3 py-2 text-left shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:hover:bg-white/[0.07]"
              >
                <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-sm font-black text-slate-950 dark:text-white">
                  {item.value}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {item.detail}
                </p>
              </button>
            ))}
          </div>
        </div>
      }
      sidebar={sidebarContent}
      content={
        <>
          <Dialog open={showImproveDialog} onOpenChange={setShowImproveDialog}>
            <DialogContent className="border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-[#0d1117] dark:text-white">
              <DialogHeader>
                <DialogTitle>Improve Summary</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="How should Cryonex improve this summary?"
                  value={aiInstruction}
                  onChange={(event) => setAiInstruction(event.target.value)}
                  className="min-h-[120px] rounded-lg border-slate-200 bg-slate-50 text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-100"
                />
                <Button
                  onClick={handleImproveSummary}
                  disabled={isImproving || !aiInstruction}
                  className="w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  {isImproving ? (
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                  )}
                  Improve
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {activeTab === "summary" ? (
            <StudyLearningMissionCanvas
              title={resolvedDocument.meta.title || "Untitled Document"}
              user={user}
              isSimpleMode={isSimpleMode}
              setIsSimpleMode={setIsSimpleMode}
              isDeepFocus={isDeepFocus}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              summaryContent={summaryContent}
              setSummaryContent={(value) => {
                setSummaryContent(value);
                setSummaryDirty(true);
              }}
              handleSaveSummary={handleSaveSummary}
              handleCreatePack={handleCreatePack}
              isGeneratingPack={isGeneratingPack}
              openImproveDialog={() => setShowImproveDialog(true)}
              onSelectTab={handleSelectTab}
              sourceWordCount={sourceWordCount}
              transcriptText={transcriptText}
              flashcards={flashcards || []}
              quizzes={quizzes || []}
              showPlaybooks={showPlaybooks}
              setShowPlaybooks={setShowPlaybooks}
              showGrounding={showGrounding}
              setShowGrounding={setShowGrounding}
              applyPlaybookInstruction={applyPlaybookInstruction}
              sourceSections={sourceSections}
            />
          ) : null}

          {activeTab === "chat" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Connecting study chat..." />
              }
            >
              <PDFChat
                docId={docId}
                title={resolvedDocument.meta.title || "Untitled document"}
              />
            </Suspense>
          ) : null}

          {activeTab === "flashcards" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Preparing flashcards..." />
              }
            >
              <StudyFlashcards
                materialId={material?._id || sharedPackMaterialId}
                shareId={sharedPackShareId}
                autoContent={transcriptText}
                title={resolvedDocument.meta.title || "Untitled document"}
              />
            </Suspense>
          ) : null}

          {activeTab === "quizzes" ? (
            <Suspense
              fallback={<WorkspacePanelFallback label="Preparing quizzes..." />}
            >
              <StudyQuizzes
                materialId={material?._id || sharedPackMaterialId}
                shareId={sharedPackShareId}
                autoContent={transcriptText}
                title={resolvedDocument.meta.title || "Untitled document"}
              />
            </Suspense>
          ) : null}

          {activeTab === "notes" ? (
            <Suspense
              fallback={<WorkspacePanelFallback label="Loading notes..." />}
            >
              <StudyNotes
                content={resolvedDocument.summary?.detailed || transcriptText}
                title={resolvedDocument.meta.title || "Untitled document"}
                materialId={material?._id}
              />
            </Suspense>
          ) : null}

          {activeTab === "mindmap" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Building concept map..." />
              }
            >
              <StudyConceptMap
                title={resolvedDocument.meta.title || "Untitled document"}
                autoContent={transcriptText}
                materialId={material?._id}
              />
            </Suspense>
          ) : null}

          {activeTab === "gaps" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Analyzing knowledge gaps..." />
              }
            >
              <div className="min-h-0 h-full overflow-y-auto p-6">
                <KnowledgeGapDashboard materialId={material?._id} />
              </div>
            </Suspense>
          ) : null}

          {activeTab === "diagrams" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Preparing occlusion study..." />
              }
            >
              <ImageOcclusionTool materialId={material?._id} />
            </Suspense>
          ) : null}
        </>
      }
      chat={
        <>
          <div className="shrink-0 border-b border-slate-200/80 bg-white/82 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1220]/82">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-[0.08em] text-slate-950 dark:text-white">
                <MessageSquare className="h-4 w-4 text-cyan-600 dark:text-cyan-300" />
                AI Coach
              </h3>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
                Source linked
              </span>
            </div>
            <div className="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-400/20 dark:bg-emerald-500/10">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-white/10 dark:text-emerald-200">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {isFatigued
                      ? "Fatigue guard"
                      : isDeepFocus
                        ? "Deep Focus"
                        : "OS learning mode"}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {isFatigued
                      ? "Switching you into a lighter summary lane."
                      : isDeepFocus
                        ? "You are in the zone. Keep the next action tight."
                        : "Student OS is tracking your source and next step."}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <Suspense
              fallback={
                <WorkspacePanelFallback
                  label="Connecting your study assistant..."
                  compact
                />
              }
            >
              <PDFChat
                docId={docId}
                title={resolvedDocument.meta.title || "Untitled document"}
              />
            </Suspense>
          </div>
        </>
      }
    />
  );
}
