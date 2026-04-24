import {
  lazy,
  startTransition,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Brain,
  Clock,
  Download,
  Edit,
  EyeOff,
  FileText,
  ListChecks,
  MessageSquare,
  Network,
  Save,
  Sparkles,
  StickyNote,
  TrendingUp,
  Wand2,
  X,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { generateWorksheetPDF } from "@/lib/pdf-generator";
import { StudyWorkspaceLayout } from "@/components/study/StudyWorkspaceLayout";
import { StudyWorkspaceNextSteps } from "@/components/study/StudyWorkspaceNextSteps";
import { StudyMaterialViewer } from "@/components/study/StudyMaterialViewer";
import { StudyCopilotRail } from "@/components/study/workspace/StudyCopilotRail";
import { StudyNotebookCanvas } from "@/components/study/workspace/StudyNotebookCanvas";
import { StudySourceRail } from "@/components/study/workspace/StudySourceRail";
import {
  buildStudyWorkspaceSections,
  StudyWorkspaceSectionId,
} from "@/components/study/workspace/study-workspace-sections";
import { ShareButton } from "@/components/viral/ShareButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useFocusSessionController } from "@/hooks/use-focus-session-controller";
import { useStudyPresence } from "@/hooks/use-study-presence";
import { useStudentOS } from "@/hooks/use-student-os";

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
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-foreground/[0.07]" />
          <div className="space-y-2">
            <div className="h-4 w-40 animate-pulse rounded-full bg-foreground/[0.08]" />
            <div className="h-3 w-28 animate-pulse rounded-full bg-foreground/[0.06]" />
          </div>
        </div>
        <div className="rounded-[28px] border border-border bg-foreground/[0.03] p-4 md:p-5">
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

type StudySummaryShape = {
  simple?: string;
  detailed?: string;
  short?: string;
};

type StudyDocumentShape = {
  meta: { title?: string };
  summary?: StudySummaryShape | null;
  extracted?: {
    text?: string;
    sections?: Array<{ text?: string }>;
  };
  workspaceRecovered?: boolean;
};

type SharedStudyPackShape = {
  _id: Id<"studyPacks">;
  title?: string;
  sourceTitle?: string;
  summary?: StudySummaryShape | null;
  description?: string;
  isPublic?: boolean;
  shareId?: string;
};

type WorksheetFlashcard = {
  front?: string;
  back?: string;
};

type WorksheetQuestion = {
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  type?: string;
};

type WorksheetQuiz = {
  questions?: WorksheetQuestion[];
};

export default function StudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const packIdParam = searchParams.get("packId");

  // Student OS Integration
  const { osState } = useStudentOS();
  const isFatigued = osState?.flowState === "fatigue";

  const document = useQuery(
    api.studyQuery.getDocument,
    docId ? { docId } : "skip",
  ) as StudyDocumentShape | null | undefined;
  const sharedPack = useQuery(
    api.study.getStudyPack,
    packIdParam ? { packId: packIdParam as Id<"studyPacks"> } : "skip",
  ) as SharedStudyPackShape | null | undefined;
  const material = useQuery(
    api.study.getMaterialByDocId,
    docId ? { docId } : "skip",
  );
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
    material?._id
      ? { materialId: material._id, shareId: packIdParam || undefined }
      : "skip",
  );
  const studyPack = useQuery(
    api.study.getStudyPackByMaterialId,
    material?._id ? { materialId: material._id } : "skip",
  );
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const [isGeneratingPack, setIsGeneratingPack] = useState(false);
  const quizzes = useQuery(
    api.study.listQuizzes,
    material?._id
      ? { materialId: material._id, shareId: packIdParam || undefined }
      : "skip",
  );

  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveDialog, setShowImproveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabParam || "summary");
  const resolvedDocument = useMemo<StudyDocumentShape | null | undefined>(
    () =>
      document ||
      (sharedPack
        ? {
            meta: {
              title:
                sharedPack.title ||
                sharedPack.sourceTitle ||
                "Shared study pack",
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
        : null),
    [document, sharedPack],
  );

  useEffect(() => {
    if (resolvedDocument?.summary) {
      // If OS detects fatigue, force simple mode to reduce cognitive load
      const shouldUseSimpleMode = isFatigued ? true : isSimpleMode;
      if (shouldUseSimpleMode !== isSimpleMode) {
        setIsSimpleMode(shouldUseSimpleMode);
        toast("Student OS: Cognitive fatigue detected. Switched to Simple Mode constraints.", { icon: "🧠" });
      }

      setSummaryContent(
        shouldUseSimpleMode
          ? resolvedDocument.summary.simple || ""
          : resolvedDocument.summary.detailed || "",
      );
    }
  }, [resolvedDocument, isSimpleMode, isFatigued]);

  const transcriptText =
    resolvedDocument?.extracted?.text ||
    (resolvedDocument?.extracted?.sections
      ?.map((section) => section.text || "")
      .join("\n\n") ??
      "");
  const sourceWordCount = transcriptText.split(/\s+/).filter(Boolean).length;
  const isDocumentLoading =
    Boolean(docId) &&
    (authLoading ||
      document === undefined ||
      (material === undefined && !sharedPack));
  const hasValidWorkspace = Boolean(docId && user && resolvedDocument);
  const {
    activeSession,
    elapsedSeconds: studyTime,
    sessionState,
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
    if (!docId || authLoading || resolvedDocument === undefined || !resolvedDocument?.workspaceRecovered) {
      return;
    }

    void ensureMaterialWorkspace({ docId }).catch(console.error);
  }, [authLoading, docId, resolvedDocument, ensureMaterialWorkspace]);

  const handleSaveSummary = async () => {
    if (!docId || !document) return;

    try {
      const currentSummary = document.summary || {
        detailed: summaryContent,
        short: summaryContent.substring(0, 200),
      };
      await updateDocumentSummary({
        docId,
        summary: {
          simple: isSimpleMode ? summaryContent : currentSummary.simple,
          detailed: isSimpleMode
            ? currentSummary.detailed || summaryContent
            : summaryContent,
          short: summaryContent.substring(0, 200) + "...",
        },
      });
      setIsEditing(false);
      toast.success("Summary updated!");
    } catch {
      toast.error("Failed to save summary");
    }
  };

  const handleImproveSummary = async () => {
    if (!summaryContent || !aiInstruction) return;

    setIsImproving(true);
    try {
      const improved = await improveSummary({
        currentSummary: summaryContent,
        instruction: aiInstruction,
      });
      setSummaryContent(improved);
      setAiInstruction("");
      setShowImproveDialog(false);
      toast.success("Summary improved by AI!");
    } catch {
      toast.error("Failed to improve summary");
    } finally {
      setIsImproving(false);
    }
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
        flashcards: ((flashcards || []) as WorksheetFlashcard[]).map((f) => ({
          front: f.front || "",
          back: f.back || "",
        })),
        quizzes: ((quizzes || []) as WorksheetQuiz[]).flatMap((q) =>
          (q.questions || []).map((quest) => ({
            question: quest.question || "",
            options: quest.options,
            correctAnswer: quest.correctAnswer || "",
            explanation: quest.explanation,
            type: quest.type || "short-answer",
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
    if (!material || !transcriptText || isGeneratingPack) return;

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

  const flashcardCount = flashcards?.length ?? 0;
  const quizQuestionCount = ((quizzes || []) as WorksheetQuiz[]).reduce(
    (total, quiz) => total + (quiz.questions?.length || 0),
    0,
  );
  const hasSummary = Boolean(summaryContent?.trim());
  const hasStudyPack = Boolean(studyPack || sharedPack);
  const readinessScore = Math.min(
    100,
    (hasSummary ? 25 : 0) +
      (flashcardCount > 0 ? 20 : 0) +
      (quizQuestionCount > 0 ? 20 : 0) +
      (hasStudyPack ? 15 : 0) +
      (sourceWordCount > 80 ? 10 : 0) +
      (studyTime > 0 ? 10 : 0),
  );
  const readinessLabel =
    readinessScore >= 85
      ? "Exam ready"
      : readinessScore >= 60
        ? "Review ready"
        : readinessScore >= 30
          ? "Building"
          : "Weak";

  const NavButton = ({
    id,
    icon: Icon,
    label,
    mobile,
  }: {
    id: string;
    icon: LucideIcon;
    label: string;
    mobile?: boolean;
  }) => (
    <Button
      variant="ghost"
      onClick={() => handleSelectTab(id)}
      className={`${mobile ? "h-10 flex-1" : "h-[58px] w-[64px] flex-col gap-1"} rounded-2xl p-0 transition-all duration-200 ${activeTab === id ? "bg-blue-500/15 text-blue-300 shadow-[inset_3px_0_0_rgba(34,211,238,0.75)]" : "text-foreground/50 hover:bg-foreground/5 hover:text-foreground"}`}
      title={label}
    >
      <Icon className={mobile ? "h-5 w-5" : "h-[18px] w-[18px]"} />
      <span className={mobile ? "ml-2 text-xs" : "max-w-[58px] truncate text-[10px] font-semibold leading-none"}>
        {label}
      </span>
    </Button>
  );

  const sidebarContent = (
    <>
      <NavButton id="summary" icon={FileText} label="Summary" />
      <NavButton id="chat" icon={MessageSquare} label="Chat" />
      <NavButton id="flashcards" icon={Brain} label="Flashcards" />
      <NavButton id="quizzes" icon={ListChecks} label="Quizzes" />
      <NavButton id="notes" icon={StickyNote} label="Notes" />
      <NavButton id="mindmap" icon={Network} label="Map" />
      <NavButton id="gaps" icon={TrendingUp} label="Gaps" />
      <NavButton id="diagrams" icon={EyeOff} label="Occlusion" />
    </>
  );

  if (isDocumentLoading) {
    return (
      <StudyWorkspaceLayout
        activeTab={activeTab}
        header={
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-black/20 px-4 backdrop-blur-xl md:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/study/dashboard")}
                className="h-9 w-9 rounded-xl p-0 text-foreground/60 hover:bg-foreground/5 hover:text-foreground md:w-auto md:px-3"
              >
                <ArrowLeft className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
              </Button>
              <div className="hidden h-6 w-px bg-foreground/10 md:block" />
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/20 text-blue-400">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-44 animate-pulse rounded-full bg-foreground/[0.08]" />
                  <div className="h-3 w-28 animate-pulse rounded-full bg-foreground/[0.05]" />
                </div>
              </div>
            </div>
            <div className="h-9 w-28 animate-pulse rounded-xl bg-foreground/[0.05]" />
          </header>
        }
        topBar={
          <div className="flex items-center gap-3 overflow-x-auto border-b border-border/60 bg-black/20 backdrop-blur-md px-4 py-2">
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
          <div className="rounded-[28px] border border-border bg-foreground/[0.03] px-6 py-5 text-foreground/70">
            Loading shared study pack...
          </div>
        </div>
      );
    }
    return (
      <div className="flex h-full items-center justify-center px-6 text-center">
        <div className="rounded-[28px] border border-border bg-foreground/[0.03] px-6 py-5 text-foreground/70">
          This workspace could not be found.
        </div>
      </div>
    );
  }

  const activeTool = activeTab === "summary" ? "chat" : activeTab;
  const workspaceSections = buildStudyWorkspaceSections({
    title: resolvedDocument.meta.title || "Untitled document",
    summary: summaryContent,
    transcriptText,
    flashcardCount,
    quizCount: quizQuestionCount,
  });

  const jumpToNotebookSection = (sectionId: StudyWorkspaceSectionId) => {
    handleSelectTab("summary");
    window.requestAnimationFrame(() => {
      globalThis.document
        .getElementById(`notebook-section-${sectionId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const toolPanel = (
    <>
      {activeTool === "chat" ? (
        <Suspense
          fallback={<WorkspacePanelFallback label="Connecting study chat..." />}
        >
          <PDFChat
            docId={docId}
            title={resolvedDocument.meta.title || "Untitled document"}
          />
        </Suspense>
      ) : null}

      {activeTool === "flashcards" ? (
        <Suspense
          fallback={<WorkspacePanelFallback label="Preparing flashcards..." />}
        >
          <StudyFlashcards
            materialId={material?._id}
            autoContent={transcriptText}
            title={resolvedDocument.meta.title || "Untitled document"}
          />
        </Suspense>
      ) : null}

      {activeTool === "quizzes" ? (
        <Suspense
          fallback={<WorkspacePanelFallback label="Preparing quizzes..." />}
        >
          <StudyQuizzes
            materialId={material?._id}
            shareId={packIdParam || undefined}
            autoContent={transcriptText}
            title={resolvedDocument.meta.title || "Untitled document"}
          />
        </Suspense>
      ) : null}

      {activeTool === "notes" ? (
        <Suspense fallback={<WorkspacePanelFallback label="Loading notes..." />}>
          <StudyNotes
            content={resolvedDocument.summary?.detailed || transcriptText}
            title={resolvedDocument.meta.title || "Untitled document"}
            materialId={material?._id}
          />
        </Suspense>
      ) : null}

      {activeTool === "mindmap" ? (
        <Suspense
          fallback={<WorkspacePanelFallback label="Building concept map..." />}
        >
          <StudyConceptMap
            title={resolvedDocument.meta.title || "Untitled document"}
            autoContent={transcriptText}
            materialId={material?._id}
          />
        </Suspense>
      ) : null}

      {activeTool === "gaps" ? (
        <Suspense
          fallback={
            <WorkspacePanelFallback label="Analyzing knowledge gaps..." />
          }
        >
          <div className="h-full min-h-0 overflow-y-auto p-4">
            <KnowledgeGapDashboard materialId={material?._id} />
          </div>
        </Suspense>
      ) : null}

      {activeTool === "diagrams" ? (
        <Suspense
          fallback={<WorkspacePanelFallback label="Preparing occlusion study..." />}
        >
          <ImageOcclusionTool materialId={material?._id} />
        </Suspense>
      ) : null}
    </>
  );

  const summaryControls = (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-white/10 dark:bg-white/5">
        <Switch
          id="simple-mode"
          checked={isSimpleMode}
          onCheckedChange={setIsSimpleMode}
          className="data-[state=checked]:bg-sky-500"
        />
        <Label
          htmlFor="simple-mode"
          className="cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-300"
        >
          Simple
        </Label>
      </div>
      {isEditing ? (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(false)}
            className="h-9 rounded-full px-3 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSaveSummary}
            className="h-9 rounded-full bg-slate-950 px-4 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950"
          >
            <Save className="mr-2 h-3.5 w-3.5" />
            Save
          </Button>
        </>
      ) : (
        <>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-9 rounded-full border border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <Edit className="mr-2 h-3.5 w-3.5" />
            Edit
          </Button>
          <Dialog open={showImproveDialog} onOpenChange={setShowImproveDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 rounded-full border-sky-200 bg-sky-50 px-4 text-sky-700 hover:bg-sky-100 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200"
              >
                <Wand2 className="mr-2 h-3.5 w-3.5" />
                Improve
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border bg-background text-foreground">
              <DialogHeader>
                <DialogTitle>Improve Summary</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="Tell Cryonex how to reshape this summary..."
                  value={aiInstruction}
                  onChange={(event) => setAiInstruction(event.target.value)}
                  className="min-h-[110px] border-border bg-foreground/5 text-foreground"
                />
                <Button
                  onClick={handleImproveSummary}
                  disabled={isImproving || !aiInstruction}
                  className="w-full"
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
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadWorksheet}
            className="h-9 rounded-full border-slate-200 bg-white px-4 text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
          >
            <Download className="mr-2 h-3.5 w-3.5" />
            Worksheet
          </Button>
        </>
      )}
    </div>
  );

  const keyIdeas = summaryContent
    .split(/\n+/)
    .map((line) => line.replace(/^[-*#\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 4);

  const sectionSlots: Partial<Record<StudyWorkspaceSectionId, ReactNode>> = {
    overview: (
      <div className="space-y-5">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03] lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200">
              <Sparkles className="h-3 w-3" />
              {isSimpleMode ? "Simple summary" : "Detailed summary"}
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Clear reading first, tools second. This is the main study surface; flashcards,
              quizzes, maps, and gap checks open beside it without pushing the source away.
            </p>
          </div>
          {summaryControls}
        </div>

        {isEditing ? (
          <Textarea
            value={summaryContent}
            onChange={(event) => setSummaryContent(event.target.value)}
            className="min-h-[420px] w-full resize-none rounded-2xl border-slate-200 bg-white p-5 font-readable text-sm leading-7 text-slate-800 shadow-inner focus:border-sky-300 focus:ring-sky-200 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100"
          />
        ) : (
          <StudyMaterialViewer
            className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-none dark:border-white/10 dark:bg-white/[0.02]"
            content={
              summaryContent?.trim() ||
              (isSimpleMode ? "Simple summary not available." : "No content available")
            }
          />
        )}
      </div>
    ),
    "key-ideas": (
      <div className="grid gap-3 md:grid-cols-2">
        {(keyIdeas.length ? keyIdeas : ["Key ideas will appear after the source summary is ready."]).map(
          (idea, index) => (
            <div
              key={`${idea}-${index}`}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-xs font-semibold text-sky-700 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200">
                {index + 1}
              </div>
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                {idea}
              </p>
            </div>
          ),
        )}
      </div>
    ),
    notes: (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
        Keep durable notes here, then open the Notes tool in the rail when you want a full-page
        markdown review surface.
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSelectTab("notes")}
            className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <StickyNote className="mr-2 h-4 w-4" />
            Open notes
          </Button>
        </div>
      </div>
    ),
    "study-tools": (
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { id: "flashcards", label: "Flashcards", detail: `${flashcardCount} ready`, icon: Brain },
          { id: "quizzes", label: "Adaptive quiz", detail: `${quizQuestionCount} questions`, icon: ListChecks },
          { id: "mindmap", label: "Concept map", detail: "Structure ideas", icon: Network },
          { id: "gaps", label: "Weak spots", detail: readinessLabel, icon: TrendingUp },
        ].map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => handleSelectTab(tool.id)}
            className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-sky-200 hover:bg-sky-50/50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-sky-400/30 dark:hover:bg-sky-400/10"
          >
            <tool.icon className="h-5 w-5 text-sky-600 dark:text-sky-300" />
            <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">
              {tool.label}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {tool.detail}
            </p>
          </button>
        ))}
      </div>
    ),
    evidence: (
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <p className="max-h-48 overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
          {transcriptText.trim().slice(0, 1200) ||
            "Source text is still being extracted. The notebook will fill this area once the document is ready."}
        </p>
      </div>
    ),
  };
  const shareablePack = (studyPack || sharedPack) as
    | SharedStudyPackShape
    | null
    | undefined;

  return (
    <StudyWorkspaceLayout
      activeTab={activeTab}
      header={
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 text-slate-900 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90 dark:text-white md:px-6">
          <div className="flex min-w-0 items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/study/dashboard")}
              className="h-9 w-9 rounded-full p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white md:w-auto md:px-3"
            >
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Back</span>
            </Button>
            <div className="hidden h-6 w-px bg-slate-200 dark:bg-white/10 md:block" />
            <div className="min-w-0 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-sky-50 text-sky-700 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-200">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h1 className="max-w-[170px] truncate text-sm font-semibold md:max-w-md md:text-base">
                  {resolvedDocument.meta.title || "Untitled Document"}
                </h1>
                <div className="mt-1 hidden items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 md:flex">
                  <span>Notebook workspace</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span>{sourceWordCount.toLocaleString()} words</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span>{readinessLabel}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 sm:flex">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatStudyTime(studyTime)}</span>
            </div>

            {material && (
              <ShareButton
                id={material._id}
                type="material"
                title={material.title}
                isPublic={material.isPublic}
                existingShareId={material.shareId}
              />
            )}

            {shareablePack ? (
              <ShareButton
                id={shareablePack._id}
                type="pack"
                title={shareablePack.title || "Study pack"}
                isPublic={shareablePack.isPublic}
                existingShareId={shareablePack.shareId}
              />
            ) : material ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreatePack}
                disabled={isGeneratingPack}
                className="h-9 rounded-full border-sky-200 bg-white px-4 text-sky-700 hover:bg-sky-50 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-200 dark:hover:bg-sky-400/20"
              >
                {isGeneratingPack ? (
                  <Sparkles className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">Turn into pack</span>
                <span className="sm:hidden">Pack</span>
              </Button>
            ) : null}
          </div>
        </header>
      }
      topBar={
        <StudyWorkspaceNextSteps
          user={user}
          activeTab={activeTool}
          onSelectTab={handleSelectTab}
          sourceTitle={resolvedDocument.meta.title || "Untitled document"}
          sourceWordCount={sourceWordCount}
          recommendations={recommendations}
          osState={osState}
          hasSummary={hasSummary}
          compact
          onDownloadWorksheet={handleDownloadWorksheet}
        />
      }
      sidebar={
        <StudySourceRail
          title={resolvedDocument.meta.title || "Untitled document"}
          sourceWordCount={sourceWordCount}
          studyTime={formatStudyTime(studyTime)}
          sections={workspaceSections}
          onJumpToSection={jumpToNotebookSection}
          activeTool={activeTool}
          onOpenTool={handleSelectTab}
        />
      }
      content={
        <StudyNotebookCanvas
          title={resolvedDocument.meta.title || "Untitled document"}
          sections={workspaceSections}
          activeTool={activeTool}
          onOpenTool={handleSelectTab}
          sectionSlots={sectionSlots}
          compactToolPanel={
            activeTool === "chat" ? null : (
              <StudyCopilotRail
                title={resolvedDocument.meta.title || "Untitled document"}
                activeTool={activeTool}
              >
                {toolPanel}
              </StudyCopilotRail>
            )
          }
        />
      }
      chat={
        <StudyCopilotRail
          title={resolvedDocument.meta.title || "Untitled document"}
          activeTool={activeTool}
        >
          {toolPanel}
        </StudyCopilotRail>
      }
    />
  );
}
