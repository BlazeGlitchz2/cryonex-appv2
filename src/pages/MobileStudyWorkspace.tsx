import {
  lazy,
  startTransition,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useAction, useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  Brain,
  Edit,
  EyeOff,
  FileText,
  ListChecks,
  Network,
  Save,
  MessageSquare,
  Sparkles,
  StickyNote,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AIChatMessage } from "@/components/chat/AIChatMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  buildMobileWorkspaceBrief,
  buildMobileWorkspaceCoach,
  buildMobileWorkspaceToolBriefs,
} from "@/lib/mobile-personalization";
import {
  MobileWorkspaceChrome,
  MobileWorkspaceChromeSkeleton,
} from "@/components/study/mobile-workspace/MobileWorkspaceChrome";

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

function MobileWorkspaceFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col justify-center px-4 py-5">
      <div className="space-y-4 rounded-[28px] border border-border bg-foreground/[0.03] p-4">
        <p className="text-sm font-medium text-foreground/70">{label}</p>
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded-full bg-foreground/[0.06]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-foreground/[0.05]" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-foreground/[0.05]" />
        </div>
      </div>
    </div>
  );
}

type StudyWorkspaceDocument = {
  meta?: {
    title?: string | null;
  } | null;
  summary?: {
    simple?: string | null;
    detailed?: string | null;
    short?: string | null;
  } | null;
  extracted?: {
    text?: string | null;
    sections?: Array<{ text?: string | null }> | null;
  } | null;
  workspaceRecovered?: boolean | null;
};

type StudyWorkspaceMaterial = {
  _id?: Id<"studyMaterials">;
  type?: string | null;
} | null;

export default function MobileStudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
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
  ) as StudyWorkspaceDocument | null | undefined;
  const material = useQuery(
    api.study.getMaterialByDocId,
    docId ? { docId } : "skip",
  ) as StudyWorkspaceMaterial | undefined;
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

  useEffect(() => {
    const nextTab = tabParam || "summary";
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [activeTab, tabParam]);

  useEffect(() => {
    if (document?.summary) {
      setSummaryContent(
        isSimpleMode
          ? document.summary.simple || ""
          : document.summary.detailed || "",
      );
    }
  }, [document, isSimpleMode]);

  const transcriptSections = document?.extracted?.sections ?? [];
  const transcriptText =
    document?.extracted?.text || transcriptSections.map((section) => section.text).join("\n\n");
  const sourceTitle = document?.meta?.title || "Untitled document";
  const sourceWordCount = transcriptText.split(/\s+/).filter(Boolean).length;
  const isDocumentLoading =
    Boolean(docId) && (authLoading || document === undefined);
  const hasValidWorkspace = Boolean(docId && user && document);
  const workspaceBrief = useMemo(
    () =>
      buildMobileWorkspaceBrief({
        user,
        sourceTitle,
        sourceWordCount,
        materialType: material?.type,
        hasSummary: Boolean(
          document?.summary?.simple || document?.summary?.detailed,
        ),
      }),
    [document?.summary, material?.type, sourceTitle, sourceWordCount, user],
  );
  const workspaceToolBriefs = useMemo(
    () =>
      buildMobileWorkspaceToolBriefs({
        user,
        sourceTitle,
        sourceWordCount,
        studyTimeSeconds: studyTime,
      }),
    [sourceTitle, sourceWordCount, studyTime, user],
  );
  const tools = useMemo(
    () => [
      {
        brief: workspaceToolBriefs.summary,
        icon: FileText,
        id: "summary",
        label: "Summary",
      },
      {
        brief: workspaceToolBriefs.chat,
        icon: MessageSquare,
        id: "chat",
        label: "Chat",
      },
      {
        brief: workspaceToolBriefs.flashcards,
        icon: Brain,
        id: "flashcards",
        label: "Flashcards",
      },
      {
        brief: workspaceToolBriefs.quizzes,
        icon: ListChecks,
        id: "quizzes",
        label: "Quizzes",
      },
      {
        brief: workspaceToolBriefs.notes,
        icon: StickyNote,
        id: "notes",
        label: "Notes",
      },
      {
        brief: workspaceToolBriefs.mindmap,
        icon: Network,
        id: "mindmap",
        label: "Concept Map",
      },
      {
        brief: workspaceToolBriefs.gaps,
        icon: TrendingUp,
        id: "gaps",
        label: "Knowledge Gaps",
      },
      {
        brief: workspaceToolBriefs.diagrams,
        icon: EyeOff,
        id: "diagrams",
        label: "Occlusion",
      },
    ],
    [workspaceToolBriefs],
  );
  const activeTool =
    tools.find((tool) => tool.id === activeTab) ?? tools[0] ?? null;
  const workspaceCoach = useMemo(
    () =>
      buildMobileWorkspaceCoach({
        user,
        sourceTitle,
        activeToolLabel: activeTool?.label || "Workspace",
      }),
    [activeTool?.label, sourceTitle, user],
  );

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
          simple: isSimpleMode
            ? summaryContent
            : document.summary?.simple || "",
          detailed: isSimpleMode
            ? document.summary?.detailed || ""
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

  const applyPlaybookInstruction = (instruction: string) => {
    setAiInstruction(instruction);
    setShowImproveDialog(true);
    if (isEditing) setIsEditing(false);
  };

  if (!docId) {
    return (
      <div className="flex h-full items-center justify-center bg-background px-4 text-foreground/50">
        Missing workspace source.
      </div>
    );
  }

  const handleSelectTool = (toolId: string) => {
    startTransition(() => {
      setActiveTab(toolId);
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        if (toolId === "summary") {
          nextParams.delete("tab");
        } else {
          nextParams.set("tab", toolId);
        }
        return nextParams;
      });
    });
  };
  const handleOpenAssistant = () => {
    navigate("/app", {
      state: { initialMessage: workspaceCoach.prompt },
    });
  };

  if (isDocumentLoading) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-background font-sans text-foreground">
        <MobileWorkspaceChromeSkeleton />
        <div className="flex min-h-0 flex-1 overflow-hidden px-3 pb-4 pt-1 sm:px-4">
          <MobileWorkspaceFallback label="Loading workspace..." />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-full items-center justify-center bg-background px-4 text-center text-foreground/70">
        <div className="rounded-2xl border border-border bg-foreground/[0.04] px-4 py-3 text-sm">
          This workspace could not be found.
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(101,69,237,0.1),transparent_42%),radial-gradient(circle_at_bottom,rgba(0,194,176,0.06),transparent_38%)] opacity-70" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <MobileWorkspaceChrome
          activeTab={activeTab}
          activeToolLabel={activeTool?.label || "Workspace"}
          badges={workspaceBrief.badges}
          brief={workspaceBrief}
          coach={workspaceCoach}
          onBack={() => navigate("/study/dashboard")}
          onOpenAssistant={handleOpenAssistant}
          onSelectTool={handleSelectTool}
          studyTimeLabel={formatStudyTime(studyTime)}
          tools={tools}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4 pt-0 sm:px-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.995 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              {activeTab === "summary" ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-[0_18px_50px_rgba(2,4,18,0.18)]">
                  <div className="flex shrink-0 flex-col gap-3 border-b border-border bg-foreground/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Summary
                      </h3>
                      <div className="ml-1 flex items-center rounded-full border border-border bg-foreground/5 p-0.5">
                        <button
                          onClick={() => setIsSimpleMode(false)}
                          className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${!isSimpleMode ? "bg-primary text-primary-foreground" : "text-foreground/50"}`}
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => setIsSimpleMode(true)}
                          className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${isSimpleMode ? "bg-primary text-primary-foreground" : "text-foreground/50"}`}
                        >
                          Simple
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-auto">
                      {isEditing ? (
                        <Button
                          size="sm"
                          onClick={handleSaveSummary}
                          className="h-9 rounded-full bg-green-600 px-3 text-xs text-foreground hover:bg-green-700"
                        >
                          <Save className="h-3 w-3 sm:mr-2" />
                          <span className="hidden sm:inline">Save</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                          className="h-10 rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                        >
                          <Edit className="h-3 w-3 sm:mr-2" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      )}

                      <Dialog
                        open={showImproveDialog}
                        onOpenChange={setShowImproveDialog}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-10 rounded-full border-border bg-foreground/[0.04] px-3 text-foreground hover:bg-foreground/[0.08]"
                          >
                            <Wand2 className="mr-2 h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Improve</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[92vw] rounded-3xl border-border bg-card text-foreground sm:max-w-md lg:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>AI Improve</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Textarea
                              placeholder="How should I improve this summary?"
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
                  </div>

                  <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-10">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.06fr)_minmax(300px,0.94fr)]">
                      <div className="space-y-3">
                        {isEditing ? (
                          <Textarea
                            value={summaryContent}
                            onChange={(event) =>
                              setSummaryContent(event.target.value)
                            }
                            className="min-h-[36vh] w-full resize-none border-border bg-foreground/5 p-4 font-mono text-sm text-foreground focus:ring-0"
                          />
                        ) : (
                          <AIChatMessage
                            content={
                              summaryContent ||
                              (isSimpleMode
                                ? "Simple summary not available."
                                : "No content available")
                            }
                          />
                        )}
                      </div>

                      <Suspense
                        fallback={
                          <MobileWorkspaceFallback label="Preparing summary tools..." />
                        }
                      >
                        <div className="space-y-3">
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
                            compact
                            onApplyInstruction={applyPlaybookInstruction}
                          />
                          <SourceGroundingPanel
                            summary={summaryContent}
                            sourceText={transcriptText}
                            compact
                          />
                        </div>
                      </Suspense>
                    </div>
                  </div>
                </div>
              ) : activeTab === "chat" ? (
                <Suspense
                  fallback={
                    <MobileWorkspaceFallback label="Connecting study chat..." />
                  }
                >
                  <div className="flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-[0_18px_50px_rgba(2,4,18,0.18)]">
                    <PDFChat docId={docId} title={sourceTitle} />
                  </div>
                </Suspense>
              ) : activeTab === "flashcards" ? (
                <Suspense
                  fallback={
                    <MobileWorkspaceFallback label="Preparing flashcards..." />
                  }
                >
                  <div className="flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-[0_18px_50px_rgba(2,4,18,0.18)]">
                    <StudyFlashcards
                      materialId={material?._id}
                      autoContent={transcriptText}
                      title={sourceTitle}
                    />
                  </div>
                </Suspense>
              ) : activeTab === "quizzes" ? (
                <Suspense
                  fallback={
                    <MobileWorkspaceFallback label="Preparing quizzes..." />
                  }
                >
                  <div className="flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-[0_18px_50px_rgba(2,4,18,0.18)]">
                    <StudyQuizzes
                      materialId={material?._id}
                      autoContent={transcriptText}
                      title={sourceTitle}
                    />
                  </div>
                </Suspense>
              ) : activeTab === "notes" ? (
                <Suspense
                  fallback={<MobileWorkspaceFallback label="Loading notes..." />}
                >
                  <div className="flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-[0_18px_50px_rgba(2,4,18,0.18)]">
                    <StudyNotes
                      content={document.summary?.detailed || transcriptText}
                      title={sourceTitle}
                      materialId={material?._id}
                    />
                  </div>
                </Suspense>
              ) : activeTab === "mindmap" ? (
                <Suspense
                  fallback={
                    <MobileWorkspaceFallback label="Building concept map..." />
                  }
                >
                  <div className="flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-[0_18px_50px_rgba(2,4,18,0.18)]">
                    <StudyConceptMap
                      title={sourceTitle}
                      autoContent={transcriptText}
                      materialId={material?._id}
                    />
                  </div>
                </Suspense>
              ) : activeTab === "gaps" ? (
                <Suspense
                  fallback={
                    <MobileWorkspaceFallback label="Analyzing knowledge gaps..." />
                  }
                >
                  <div className="flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-[0_18px_50px_rgba(2,4,18,0.18)]">
                    <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-6">
                      <KnowledgeGapDashboard materialId={material?._id} />
                    </div>
                  </div>
                </Suspense>
              ) : (
                <Suspense
                  fallback={
                    <MobileWorkspaceFallback label="Preparing occlusion study..." />
                  }
                >
                  <div className="flex min-h-0 flex-1 overflow-hidden rounded-[30px] border border-border/80 bg-card/90 shadow-[0_18px_50px_rgba(2,4,18,0.18)]">
                    <ImageOcclusionTool materialId={material?._id} />
                  </div>
                </Suspense>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
