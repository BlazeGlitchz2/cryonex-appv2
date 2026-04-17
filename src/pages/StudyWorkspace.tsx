import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  Download,
  Edit,
  FileText,
  MessageSquare,
  Save,
  Sparkles,
  Wand2,
  X,
  Plus,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AIChatMessage } from "@/components/chat/AIChatMessage";
import { generateWorksheetPDF } from "@/lib/pdf-generator";
import { StudyWorkspaceLayout } from "@/components/study/StudyWorkspaceLayout";
import { StudyWorkspaceNextSteps } from "@/components/study/StudyWorkspaceNextSteps";
import { StudyCopilotRail } from "@/components/study/workspace/StudyCopilotRail";
import { StudyNotebookCanvas } from "@/components/study/workspace/StudyNotebookCanvas";
import { StudySourceRail } from "@/components/study/workspace/StudySourceRail";
import {
  buildStudyWorkspaceSections,
  type StudyWorkspaceSectionId,
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

export default function StudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const packIdParam = searchParams.get("packId");

  const startSession = useMutation(api.study.startStudySession);
  const endSession = useMutation(api.study.endStudySession);
  const [sessionId, setSessionId] = useState<Id<"studySessions"> | null>(null);
  const [studyTime, setStudyTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Student OS Integration
  const { osState } = useStudentOS();
  const isFatigued = osState?.flowState === "fatigue";
  const isDeepFocus = osState?.flowState === "deep-focus";

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (sessionId) await endSession({ sessionId });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (sessionId) void endSession({ sessionId }).catch(console.error);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionId, endSession]);

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
  const [activeTab, setActiveTab] = useState<string>(
    tabParam && tabParam !== "summary" ? tabParam : "chat",
  );
  const [showPlaybooks, setShowPlaybooks] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);
  const resolvedDocument = document || (sharedPack ? {
    meta: {
      title: sharedPack.title || sharedPack.sourceTitle || "Shared study pack",
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
  } : null);

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
    ((resolvedDocument?.extracted?.sections as any[] | undefined)
      ?.map((section) => section.text)
      .join("\n\n") ??
      "");
  const sourceWordCount = transcriptText.split(/\s+/).filter(Boolean).length;
  const isDocumentLoading =
    Boolean(docId) &&
    (authLoading ||
      document === undefined ||
      (material === undefined && !sharedPack));
  const hasValidWorkspace = Boolean(docId && user && resolvedDocument);
  useStudyPresence({
    source: "study_workspace",
    route: docId ? `/study/workspace/${docId}` : "/study/workspace",
    currentActivity: activeTab,
    currentSection: activeTab,
    title: resolvedDocument?.meta?.title || "Study Workspace",
    subject: material?.type || undefined,
    materialId: material?._id,
    docId,
    sessionId: sessionId || undefined,
    enabled: hasValidWorkspace,
    details: {
      studyTime,
      isSimpleMode,
      hasFlashcards: Boolean(flashcards?.length),
      hasQuizzes: Boolean(quizzes?.length),
    },
  });

  useEffect(() => {
    if (!hasValidWorkspace || sessionId) {
      return;
    }

    let cancelled = false;

    const startTracking = async () => {
      try {
        const id = await startSession({ activityType: "reading" });

        if (cancelled) {
          await endSession({ sessionId: id });
          return;
        }

        setSessionId(id);
        timerRef.current = setInterval(
          () => setStudyTime((prev) => prev + 1),
          1000,
        );
      } catch (err) {
        console.error("Failed to start study session:", err);
      }
    };

    void startTracking();

    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [endSession, hasValidWorkspace, sessionId, startSession]);

  useEffect(() => {
    if (!docId || authLoading || resolvedDocument === undefined || !resolvedDocument?.workspaceRecovered) {
      return;
    }

    void ensureMaterialWorkspace({ docId }).catch(console.error);
  }, [authLoading, docId, resolvedDocument, ensureMaterialWorkspace]);

  const handleSaveSummary = async () => {
    if (!docId || !document) return;

    try {
      await updateDocumentSummary({
        docId,
        summary: {
          ...document.summary,
          [isSimpleMode ? "simple" : "detailed"]: summaryContent,
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

  const loadingSidebar = (
    <div className="space-y-4 p-4">
      <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-2xl bg-white"
          />
        ))}
      </div>
    </div>
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
        sidebar={loadingSidebar}
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

  const normalizedSummary =
    summaryContent?.trim() ||
    (isSimpleMode
      ? resolvedDocument.summary?.simple?.trim() || ""
      : resolvedDocument.summary?.detailed?.trim() || "");

  const workspaceSections = buildStudyWorkspaceSections({
    title: resolvedDocument.meta.title || "Untitled document",
    summary: normalizedSummary,
    transcriptText,
    flashcardCount: flashcards?.length || 0,
    quizCount: quizzes?.length || 0,
  });

  const jumpToSection = (sectionId: StudyWorkspaceSectionId) => {
    const section = window.document.getElementById(
      `notebook-section-${sectionId}`,
    );
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const sidebarContent = (
    <StudySourceRail
      title={resolvedDocument.meta.title || "Untitled document"}
      sourceWordCount={sourceWordCount}
      studyTime={formatStudyTime(studyTime)}
      sections={workspaceSections}
      onJumpToSection={jumpToSection}
      activeTool={activeTab}
      onOpenTool={setActiveTab}
    />
  );

  const notebookSectionSlots: Partial<Record<StudyWorkspaceSectionId, ReactNode>> = {
    overview: (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
            <Switch
              id="simple-mode"
              checked={isSimpleMode}
              onCheckedChange={setIsSimpleMode}
              className="data-[state=checked]:bg-sky-500"
            />
            <Label
              htmlFor="simple-mode"
              className="cursor-pointer text-xs font-medium text-slate-600"
            >
              Simple mode
            </Label>
          </div>

          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="h-9 rounded-full border border-slate-200 bg-white px-4 text-slate-600"
              >
                <X className="mr-2 h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveSummary}
                className="h-9 rounded-full bg-slate-950 px-4 text-white hover:bg-slate-800"
              >
                <Save className="mr-2 h-3.5 w-3.5" />
                Save notebook
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-9 rounded-full border border-slate-200 bg-white px-4 text-slate-700"
              >
                <Edit className="mr-2 h-3.5 w-3.5" />
                Refine
              </Button>
              <Dialog
                open={showImproveDialog}
                onOpenChange={setShowImproveDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-9 rounded-full border border-sky-200 bg-sky-50 px-4 text-sky-700 hover:bg-sky-100"
                  >
                    <Wand2 className="mr-2 h-3.5 w-3.5" />
                    Improve with AI
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-slate-200 bg-white text-slate-900">
                  <DialogHeader>
                    <DialogTitle>Improve notebook summary</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea
                      placeholder="Tell the AI what to change..."
                      value={aiInstruction}
                      onChange={(event) => setAiInstruction(event.target.value)}
                      className="min-h-[120px] border-slate-200 bg-slate-50 text-slate-900"
                    />
                    <Button
                      onClick={handleImproveSummary}
                      disabled={isImproving || !aiInstruction}
                      className="w-full bg-slate-950 text-white hover:bg-slate-800"
                    >
                      {isImproving ? (
                        <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Improve summary
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDownloadWorksheet}
                className="h-9 rounded-full border border-slate-200 bg-white px-4 text-slate-700"
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Worksheet
              </Button>
            </>
          )}
        </div>

        {isEditing ? (
          <Textarea
            value={summaryContent}
            onChange={(event) => setSummaryContent(event.target.value)}
            className="min-h-[300px] w-full resize-none rounded-[22px] border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-800 shadow-none"
          />
        ) : (
          <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
            <AIChatMessage
              fullWidth={true}
              isRTL={user?.isRTL}
              content={normalizedSummary || "Your notebook summary is still being prepared."}
            />
          </div>
        )}
      </div>
    ),
    notes: (
      <Suspense fallback={<WorkspacePanelFallback label="Loading notebook notes..." />}>
        <StudyNotes
          content={resolvedDocument.summary?.detailed || transcriptText}
          title={resolvedDocument.meta.title || "Untitled document"}
          materialId={material?._id}
        />
      </Suspense>
    ),
    "study-tools": (
      <div className="grid gap-3 md:grid-cols-2">
        {[
          {
            id: "flashcards",
            title: "Flashcards",
            body: flashcards?.length
              ? `${flashcards.length} cards are ready to review.`
              : "Generate or open cards from the copilot rail.",
          },
          {
            id: "quizzes",
            title: "Adaptive quiz",
            body: quizzes?.length
              ? `${quizzes.length} quiz sets are available.`
              : "Turn this notebook into a quiz when you're ready.",
          },
          {
            id: "mindmap",
            title: "Concept map",
            body: "Open the visual map without leaving the notebook flow.",
          },
          {
            id: "gaps",
            title: "Knowledge gaps",
            body: "See weak spots and next-study recommendations.",
          },
        ].map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setActiveTab(tool.id)}
            className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:bg-white"
          >
            <div className="text-sm font-semibold text-slate-900">{tool.title}</div>
            <div className="mt-2 text-sm leading-6 text-slate-600">{tool.body}</div>
          </button>
        ))}
      </div>
    ),
    evidence: (
      <div className="space-y-4">
        <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
          {transcriptText.trim()
            ? transcriptText.slice(0, 700)
            : "Source evidence will appear here once the transcript is available."}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowGrounding((value) => !value)}
            className="h-9 rounded-full border border-slate-200 bg-white px-4 text-slate-700"
          >
            {showGrounding ? "Hide grounding check" : "Show grounding check"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowPlaybooks((value) => !value)}
            className="h-9 rounded-full border border-slate-200 bg-white px-4 text-slate-700"
          >
            {showPlaybooks ? "Hide playbooks" : "Show playbooks"}
          </Button>
        </div>

        {showGrounding ? (
          <Suspense fallback={<WorkspacePanelFallback label="Checking grounding..." compact />}>
            <SourceGroundingPanel
              summary={normalizedSummary}
              sourceText={transcriptText}
            />
          </Suspense>
        ) : null}

        {showPlaybooks ? (
          <Suspense fallback={<WorkspacePanelFallback label="Loading playbooks..." compact />}>
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
        ) : null}
      </div>
    ),
  };

  let copilotContent: ReactNode;

  if (activeTab === "flashcards") {
    copilotContent = (
      <Suspense fallback={<WorkspacePanelFallback label="Preparing flashcards..." compact />}>
        <StudyFlashcards
          materialId={material?._id}
          autoContent={transcriptText}
          title={resolvedDocument.meta.title || "Untitled document"}
        />
      </Suspense>
    );
  } else if (activeTab === "quizzes") {
    copilotContent = (
      <Suspense fallback={<WorkspacePanelFallback label="Preparing quizzes..." compact />}>
        <StudyQuizzes
          materialId={material?._id}
          autoContent={transcriptText}
          title={resolvedDocument.meta.title || "Untitled document"}
        />
      </Suspense>
    );
  } else if (activeTab === "mindmap") {
    copilotContent = (
      <Suspense fallback={<WorkspacePanelFallback label="Building concept map..." compact />}>
        <StudyConceptMap
          title={resolvedDocument.meta.title || "Untitled document"}
          autoContent={transcriptText}
          materialId={material?._id}
        />
      </Suspense>
    );
  } else if (activeTab === "gaps") {
    copilotContent = (
      <Suspense fallback={<WorkspacePanelFallback label="Analyzing knowledge gaps..." compact />}>
        <div className="h-full overflow-y-auto p-4">
          <KnowledgeGapDashboard materialId={material?._id} />
        </div>
      </Suspense>
    );
  } else if (activeTab === "notes") {
    copilotContent = (
      <Suspense fallback={<WorkspacePanelFallback label="Loading notes..." compact />}>
        <StudyNotes
          content={resolvedDocument.summary?.detailed || transcriptText}
          title={resolvedDocument.meta.title || "Untitled document"}
          materialId={material?._id}
        />
      </Suspense>
    );
  } else if (activeTab === "diagrams") {
    copilotContent = (
      <Suspense fallback={<WorkspacePanelFallback label="Preparing occlusion study..." compact />}>
        <ImageOcclusionTool materialId={material?._id} />
      </Suspense>
    );
  } else {
    copilotContent = (
      <Suspense fallback={<WorkspacePanelFallback label="Connecting study chat..." compact />}>
        <PDFChat
          docId={docId}
          title={resolvedDocument.meta.title || "Untitled document"}
        />
      </Suspense>
    );
  }

  return (
    <StudyWorkspaceLayout
      activeTab={activeTab}
      header={
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/study/dashboard")}
              className="h-9 w-9 rounded-full border border-slate-200 bg-white p-0 text-slate-600 hover:bg-slate-50 hover:text-slate-950 md:w-auto md:px-3"
            >
              <ArrowLeft className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Back</span>
            </Button>
            <div className="hidden h-6 w-px bg-slate-200 md:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
                <FileText className="h-4 w-4" />
              </div>
              <h1 className="max-w-[150px] truncate text-sm font-bold tracking-tight text-slate-900 md:max-w-md md:text-base">
                {resolvedDocument.meta.title || "Untitled Document"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs text-slate-600">
              <Clock className="h-3.5 w-3.5 text-sky-600" />
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

            {studyPack || sharedPack ? (
              <ShareButton
                id={(studyPack || sharedPack)._id}
                type="pack"
                title={(studyPack || sharedPack).title}
                isPublic={(studyPack || sharedPack).isPublic}
                existingShareId={(studyPack || sharedPack).shareId}
              />
            ) : material ? (
              <div className="flex items-center gap-3">
                {osState?.flowState === "deep-focus" && (
                  <div className="hidden border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 px-3 py-1.5 rounded-full text-xs font-bold md:flex items-center gap-2 animate-in fade-in">
                    <Sparkles className="h-3.5 w-3.5" />
                    Deep Focus
                  </div>
                )}
                {osState?.flowState === "fatigue" && (
                  <div className="hidden border border-amber-500/30 bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-full text-xs font-bold md:flex items-center gap-2 animate-in fade-in">
                    Break Recommended
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreatePack}
                  disabled={isGeneratingPack}
                  className="h-9 rounded-full border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                >
                  {isGeneratingPack ? (
                    <Sparkles className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-3.5 w-3.5" />
                  )}
                  Turn into pack
                </Button>
              </div>
            ) : null}

            <Button
              variant="outline"
              onClick={() => navigate("/app")}
              className="hidden rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 md:flex"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Copilot
            </Button>
          </div>
        </header>
      }
      topBar={
        <StudyWorkspaceNextSteps
          user={user}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          sourceTitle={resolvedDocument.meta.title || "Untitled document"}
          sourceWordCount={sourceWordCount}
          onDownloadWorksheet={handleDownloadWorksheet}
        />
      }
      sidebar={sidebarContent}
      content={
        <StudyNotebookCanvas
          title={resolvedDocument.meta.title || "Untitled document"}
          sections={workspaceSections}
          activeTool={activeTab}
          onOpenTool={setActiveTab}
          sectionSlots={notebookSectionSlots}
        />
      }
      chat={
        <StudyCopilotRail
          title={resolvedDocument.meta.title || "Untitled document"}
          activeTool={activeTab}
        >
          {copilotContent}
        </StudyCopilotRail>
      }
    />
  );
}
