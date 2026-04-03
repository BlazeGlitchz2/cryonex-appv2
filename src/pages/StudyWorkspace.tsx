import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Brain,
  ChevronDown,
  ChevronUp,
  Clock,
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
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AIChatMessage } from "@/components/chat/AIChatMessage";
import { StudyWorkspaceLayout } from "@/components/study/StudyWorkspaceLayout";
import { StudyWorkspaceNextSteps } from "@/components/study/StudyWorkspaceNextSteps";
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
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get("tab");

  const startSession = useMutation(api.study.startStudySession);
  const endSession = useMutation(api.study.endStudySession);
  const [sessionId, setSessionId] = useState<Id<"studySessions"> | null>(null);
  const [studyTime, setStudyTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveDialog, setShowImproveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabParam || "summary");
  const [showPlaybooks, setShowPlaybooks] = useState(false);
  const [showGrounding, setShowGrounding] = useState(false);

  useEffect(() => {
    if (document?.summary) {
      setSummaryContent(
        isSimpleMode
          ? document.summary.simple || ""
          : document.summary.detailed || "",
      );
    }
  }, [document, isSimpleMode]);

  const transcriptText =
    document?.extracted?.text ||
    ((document?.extracted?.sections as any[] | undefined)
      ?.map((section) => section.text)
      .join("\n\n") ??
      "");
  const sourceWordCount = transcriptText.split(/\s+/).filter(Boolean).length;
  const isDocumentLoading =
    Boolean(docId) && (authLoading || document === undefined);
  const hasValidWorkspace = Boolean(docId && user && document);

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
    if (
      !docId ||
      authLoading ||
      document === undefined ||
      !document?.workspaceRecovered
    ) {
      return;
    }

    void ensureMaterialWorkspace({ docId }).catch(console.error);
  }, [authLoading, docId, document, ensureMaterialWorkspace]);

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

  if (!docId) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-foreground/50">
        Missing workspace source.
      </div>
    );
  }

  const NavButton = ({ id, icon: Icon, label, mobile }: any) => (
    <Button
      variant="ghost"
      onClick={() => setActiveTab(id)}
      className={`${mobile ? "h-10 flex-1" : "h-12 w-12"} rounded-xl p-0 transition-all duration-200 ${activeTab === id ? "scale-105 bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.2)]" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground"}`}
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/20 text-purple-400">
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


  if (!document) {
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/20 text-purple-400">
                <FileText className="h-4 w-4" />
              </div>
              <h1 className="max-w-[150px] truncate text-sm font-bold tracking-tight text-foreground md:max-w-md md:text-base">
                {document.meta.title || "Untitled Document"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-foreground/5 px-3 py-1.5 font-mono text-xs text-purple-300">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatStudyTime(studyTime)}</span>
            </div>
            <Button
              variant="outline"
              onClick={() =>
                navigate("/app")
              }
              className="rounded-xl border-border bg-foreground/[0.04] text-foreground/82 hover:bg-foreground/[0.08] hover:text-foreground"
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
          sourceTitle={document.meta.title || "Untitled document"}
          sourceWordCount={sourceWordCount}
        />
      }
      sidebar={sidebarContent}
      content={
        <>
          {activeTab === "summary" ? (
            <div className="flex min-h-0 flex-col">
              <div className="flex items-center justify-between border-b border-border bg-foreground/[0.02] p-6">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    AI Summary
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center space-x-2 rounded-full border border-border bg-foreground/5 px-3 py-1.5">
                    <Switch
                      id="simple-mode"
                      checked={isSimpleMode}
                      onCheckedChange={setIsSimpleMode}
                      className="data-[state=checked]:bg-purple-500"
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
                            className="h-8 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                          >
                            <Wand2 className="mr-2 h-3 w-3" />
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
                              className="w-full bg-purple-600 hover:bg-purple-700"
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
                    </div>
                  )}
                </div>
              </div>

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto bg-gradient-to-b from-white/[0.02] to-transparent px-6 py-6 pb-10">
                {isEditing ? (
                  <Textarea
                    value={summaryContent}
                    onChange={(event) => setSummaryContent(event.target.value)}
                    className="min-h-[500px] w-full resize-none border-border bg-foreground/5 p-4 font-mono text-sm text-foreground focus:ring-0"
                  />
                ) : (
                  <Suspense
                    fallback={
                      <WorkspacePanelFallback label="Preparing your summary workspace..." />
                    }
                  >
                    <div className="mx-auto max-w-4xl space-y-4">
                      {/* Collapsible Tool Panels - Placed ABOVE the summary for easy access */}
                      <div className="space-y-4">
                        {/* Collapsible: Study Playbooks */}
                        <div className="rounded-2xl border border-border bg-foreground/[0.02]">
                          <button
                            type="button"
                            onClick={() => setShowPlaybooks(!showPlaybooks)}
                            className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-foreground/[0.03]"
                          >
                            <span className="text-sm font-semibold text-foreground/80">📚 Study Playbooks & Pack</span>
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
                            <span className="text-sm font-semibold text-foreground/80">🔍 Source Grounding Check</span>
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
                      <AIChatMessage
                        fullWidth={true}
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
              <PDFChat docId={docId} title={document.meta.title} />
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
                title={document.meta.title}
              />
            </Suspense>
          ) : null}

          {activeTab === "quizzes" ? (
            <Suspense
              fallback={<WorkspacePanelFallback label="Preparing quizzes..." />}
            >
              <StudyQuizzes
                materialId={material?._id}
                autoContent={transcriptText}
                title={document.meta.title}
              />
            </Suspense>
          ) : null}

          {activeTab === "notes" ? (
            <Suspense
              fallback={<WorkspacePanelFallback label="Loading notes..." />}
            >
              <StudyNotes
                content={document.summary?.detailed || transcriptText}
                title={document.meta.title}
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
                title={document.meta.title}
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
              <PDFChat docId={docId} title={document.meta.title} />
            </Suspense>
          </div>
        </>
      }
    />
  );
}
