import {
  lazy,
  startTransition,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Brain,
  ChevronDown,
  ChevronUp,
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
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { generateWorksheetPDF } from "@/lib/pdf-generator";
import { StudyWorkspaceLayout } from "@/components/study/StudyWorkspaceLayout";
import { StudyWorkspaceNextSteps } from "@/components/study/StudyWorkspaceNextSteps";
import { StudyMaterialViewer } from "@/components/study/StudyMaterialViewer";
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
import { FocusSessionCard } from "@/components/study/FocusSessionCard";

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
  const {
    activeSession,
    completeSession,
    androidFocusShieldReady,
    elapsedSeconds: studyTime,
    endSessionEarly,
    remainingBreakSeconds,
    remainingSeconds,
    resumeAfterBreak,
    selectedDuration,
    sessionRecord,
    sessionState,
    setSelectedDuration,
    startFocusSession,
    startForceBreak,
    openAndroidFocusShieldSettings,
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

  const NavButton = ({ id, icon: Icon, label, mobile }: any) => (
    <Button
      variant="ghost"
      onClick={() => handleSelectTab(id)}
      className={`${mobile ? "h-10 flex-1" : "h-12 w-12"} rounded-xl p-0 transition-all duration-200 ${activeTab === id ? "scale-105 bg-blue-500/20 text-blue-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground"}`}
      title={label}
    >
      <Icon className="h-5 w-5" />
      {mobile ? <span className="ml-2 text-xs">{label}</span> : null}
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
              <h1 className="max-w-[150px] truncate text-sm font-bold tracking-tight text-foreground md:max-w-md md:text-base">
                {resolvedDocument.meta.title || "Untitled Document"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-foreground/5 px-3 py-1.5 font-mono text-xs text-blue-300">
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
                  className="h-9 rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20"
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
              className="rounded-xl border-border bg-foreground/[0.04] text-foreground/82 hover:bg-foreground/[0.08] hover:text-foreground hidden md:flex"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Copilot
            </Button>
          </div>
        </header>
      }
      topBar={
        <>
          <div className="border-b border-border bg-background/35 px-4 py-4 md:px-6">
            <FocusSessionCard
              allowedApps={sessionRecord?.importantApps || []}
              blockedApps={sessionRecord?.distractingApps || []}
              androidBlockingReady={androidFocusShieldReady}
              distractionCount={sessionRecord?.distractionAttemptCount || 0}
              elapsedSeconds={studyTime}
              hasActiveFocusSession={Boolean(sessionRecord)}
              onComplete={completeSession}
              onEndEarly={endSessionEarly}
              onEnableAndroidBlocking={openAndroidFocusShieldSettings}
              onResume={resumeAfterBreak}
              onSetDuration={setSelectedDuration}
              onStart={startFocusSession}
              onStartBreak={startForceBreak}
              remainingBreakSeconds={remainingBreakSeconds}
              remainingSeconds={remainingSeconds}
              selectedDuration={selectedDuration}
              sessionPhase={sessionState?.phase || "idle"}
              canForceBreak={Boolean(sessionState?.canForceBreak)}
            />
          </div>
          <StudyWorkspaceNextSteps
            user={user}
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            sourceTitle={resolvedDocument.meta.title || "Untitled document"}
            sourceWordCount={sourceWordCount}
            recommendations={recommendations}
            osState={osState}
            hasSummary={Boolean(summaryContent?.trim())}
            onDownloadWorksheet={handleDownloadWorksheet}
          />
        </>
      }
      sidebar={sidebarContent}
      content={
        <>
          {activeTab === "summary" ? (
            <div className="flex flex-col">
              <div className="flex items-center justify-between border-b border-border bg-foreground/[0.02] p-6 lg:px-12 backdrop-blur-md">
                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
                    <Sparkles className="h-5 w-5 text-cyan-400" />
                    AI Summary
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2 rounded-full border border-border bg-foreground/5 px-3 py-1.5">
                    <Switch
                      id="simple-mode"
                      checked={isSimpleMode}
                      onCheckedChange={setIsSimpleMode}
                      className="data-[state=checked]:bg-cyan-500"
                    />
                    <Label
                      htmlFor="simple-mode"
                      className="cursor-pointer text-xs font-medium text-foreground/70"
                    >
                      Simple
                    </Label>
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(false)}
                        className="h-8 w-8 rounded-full p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveSummary}
                        className="h-8 border-0 bg-green-600 text-foreground hover:bg-green-700"
                      >
                        <Save className="mr-2 h-3 w-3" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="h-8 px-3 text-foreground/70 hover:bg-foreground/10"
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Dialog
                        open={showImproveDialog}
                        onOpenChange={setShowImproveDialog}
                      >
                        <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 transition-colors"
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
                              placeholder="Instructions..."
                              value={aiInstruction}
                              onChange={(event) =>
                                setAiInstruction(event.target.value)
                              }
                              className="min-h-[100px] border-border bg-foreground/5 text-foreground"
                            />
                            <Button
                              onClick={handleImproveSummary}
                              disabled={isImproving || !aiInstruction}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              {isImproving ? (
                                <Sparkles className="mr-2 animate-spin" />
                              ) : (
                                <Wand2 className="mr-2" />
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
                        className="h-8 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                      >
                        <Download className="mr-2 h-3 w-3" />
                        Worksheet
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-b from-white/[0.01] to-transparent px-6 py-8 pb-40 lg:px-12">
                {isEditing ? (
                  <div className="max-w-4xl mx-auto">
                    <Textarea
                      value={summaryContent}
                      onChange={(event) => setSummaryContent(event.target.value)}
                      className="min-h-[500px] w-full resize-none rounded-2xl border-white/10 bg-black/40 p-6 font-mono text-sm leading-relaxed text-slate-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 shadow-inner"
                    />
                  </div>
                ) : (
                  <Suspense
                    fallback={
                      <WorkspacePanelFallback label="Preparing your summary workspace..." />
                    }
                  >
                    <div className="mx-auto max-w-4xl space-y-8 md:px-4">
                      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-none">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                            Reading Mode
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                            Big headers
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                            Short sections
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                            Easy scanning
                          </span>
                        </div>
                        <h4 className="mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                          {isSimpleMode
                            ? "Simple summary is active"
                            : "Detailed summary is active"}
                        </h4>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                          Cryonex is shaping this view to feel calmer and more predictable:
                          one idea at a time, clearer headings, and a visible next step instead of
                          dense walls of text.
                        </p>
                      </div>

                      {/* Collapsible Tool Panels - Placed ABOVE the summary for easy access */}
                      <div className="space-y-4">
                        {/* Collapsible: Study Playbooks */}
                        <div className="rounded-2xl border border-border bg-foreground/[0.02]">
                          <button
                            type="button"
                            onClick={() => setShowPlaybooks(!showPlaybooks)}
                            className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
                          >
                            <span className="text-sm font-semibold text-foreground/80">
                              Study Playbooks & Pack
                            </span>
                            {showPlaybooks ? (
                              <ChevronUp className="h-4 w-4 text-foreground/40" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-foreground/40" />
                            )}
                          </button>
                          {showPlaybooks && (
                            <div className="border-t border-border px-4 pb-4 pt-4">
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
                            </div>
                          )}
                        </div>

                        {/* Collapsible: Source Grounding */}
                        <div className="rounded-2xl border border-border bg-foreground/[0.02]">
                          <button
                            type="button"
                            onClick={() => setShowGrounding(!showGrounding)}
                            className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
                          >
                            <span className="text-sm font-semibold text-foreground/80">
                              Source Grounding Check
                            </span>
                            {showGrounding ? (
                              <ChevronUp className="h-4 w-4 text-foreground/40" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-foreground/40" />
                            )}
                          </button>
                          {showGrounding && (
                            <div className="border-t border-border px-4 pb-4 pt-4">
                              <SourceGroundingPanel
                                summary={summaryContent}
                                sourceText={transcriptText}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Summary content */}
                      <StudyMaterialViewer
                        className="rounded-[30px] border border-slate-200 bg-white px-6 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.02] dark:shadow-none"
                        content={
                          summaryContent?.trim() ||
                          (isSimpleMode
                            ? "Simple summary not available."
                            : "No content available")
                        }
                      />
                    </div>
                  </Suspense>
                )}
              </div>
            </div>
          ) : null}

          {activeTab === "chat" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Connecting study chat..." />
              }
            >
              <PDFChat docId={docId} title={resolvedDocument.meta.title || "Untitled document"} />
            </Suspense>
          ) : null}

          {activeTab === "flashcards" ? (
            <Suspense
              fallback={
                <WorkspacePanelFallback label="Preparing flashcards..." />
              }
            >
              <StudyFlashcards
                materialId={material?._id}
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
                materialId={material?._id}
                shareId={packIdParam || undefined}
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
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-foreground/[0.02] p-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MessageSquare className="h-4 w-4 text-cyan-400" />
              Study Assistant
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/30">
              Always On
            </span>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-cyan-500/5 blur-[100px]" />
            <Suspense
              fallback={
                <WorkspacePanelFallback
                  label="Connecting your study assistant..."
                  compact
                />
              }
            >
              <PDFChat docId={docId} title={resolvedDocument.meta.title || "Untitled document"} />
            </Suspense>
          </div>
        </>
      }
    />
  );
}
