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
import { cn } from "@/lib/utils";
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
import { StudyWorkspaceNextSteps } from "@/components/study/StudyWorkspaceNextSteps";
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

function MobileWorkspaceFallback({ label }: { label: string }) {
  const { mode } = useThemeStore();
  const isLight = mode === "light";
  return (
    <div className="flex h-full flex-col justify-center px-4 py-5">
      <div className={cn(
        "space-y-4 rounded-[28px] border p-6 backdrop-blur-md transition-colors",
        isLight ? "border-primary/10 bg-white/40 shadow-sm" : "border-white/[0.08] bg-foreground/[0.03]"
      )}>
        <p className="text-sm font-medium text-foreground/70">{label}</p>
        <div className="space-y-3">
          <div className={cn("h-4 w-full animate-pulse rounded-full", isLight ? "bg-primary/10" : "bg-foreground/[0.06]")} />
          <div className={cn("h-4 w-5/6 animate-pulse rounded-full", isLight ? "bg-primary/5" : "bg-foreground/[0.05]")} />
          <div className={cn("h-4 w-2/3 animate-pulse rounded-full", isLight ? "bg-primary/5" : "bg-foreground/[0.05]")} />
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
  const { mode } = useThemeStore();
  const isLight = mode === "light";
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

  if (!docId) {
    return (
      <div className="flex h-full items-center justify-center bg-background px-4 text-foreground/50">
        Missing workspace source.
      </div>
    );
  }

  if (isDocumentLoading) {
    return (
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background font-sans text-foreground">
        <MobileWorkspaceChromeSkeleton />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-4 pt-4">
          <MobileWorkspaceFallback label="Loading workspace..." />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background px-4 text-center text-foreground/70">
        <div className={cn(
          "rounded-2xl border px-6 py-4 text-sm backdrop-blur-md transition-colors",
          isLight ? "border-primary/10 bg-white/40" : "border-white/[0.08] bg-foreground/[0.04]"
        )}>
          This workspace could not be found.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background font-sans text-foreground">
      {/* Background Decor */}
      <div className={cn(
        "pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-1000",
        isLight
          ? "bg-[radial-gradient(circle_at_top,rgba(var(--primary-rgb),0.08),transparent_42%),radial-gradient(circle_at_bottom,rgba(var(--primary-rgb),0.04),transparent_38%)]"
          : "bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_42%),radial-gradient(circle_at_bottom,rgba(0,194,176,0.06),transparent_38%)]"
      )} />

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

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-24 pt-0 sm:px-4">
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
                <div className={cn(
                  "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border shadow-[0_18px_50px_rgba(2,4,18,0.18)] backdrop-blur-md transition-colors duration-500",
                  isLight ? "border-primary/10 bg-white/60" : "border-white/[0.08] bg-card/40"
                )}>
                  <div className={cn(
                    "flex shrink-0 flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between transition-colors",
                    isLight ? "border-primary/10 bg-primary/5" : "border-white/[0.06] bg-foreground/[0.03]"
                  )}>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors bg-cyan-500/10 text-cyan-400"
                      )}>
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-foreground">
                        AI Summary
                      </h3>
                      <div className={cn(
                        "ml-2 flex items-center rounded-full border p-0.5 transition-colors",
                        isLight ? "border-primary/10 bg-primary/5" : "border-white/[0.08] bg-foreground/5"
                      )}>
                        <button
                          onClick={() => setIsSimpleMode(false)}
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all",
                            !isSimpleMode
                              ? isLight
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                              : "text-foreground/40 hover:text-foreground"
                          )}
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => setIsSimpleMode(true)}
                          className={cn(
                            "rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all",
                            isSimpleMode
                              ? isLight
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                              : "text-foreground/40 hover:text-foreground"
                          )}
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
                          className="h-9 rounded-full bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700"
                        >
                          <Save className="h-3 w-3 sm:mr-2" />
                          <span className="hidden sm:inline">Save</span>
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                          className="h-9 rounded-full bg-white/[0.05] px-4 text-xs font-bold text-foreground transition-all hover:bg-white/[0.1] active:scale-95"
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
                            className={cn(
                              "h-9 rounded-full px-4 text-xs font-bold transition-all",
                              isLight
                                ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                                : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20"
                            )}
                          >
                            <Wand2 className="mr-2 h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Improve</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className={cn(
                          "w-[92vw] rounded-3xl border text-foreground backdrop-blur-xl sm:max-w-md transition-colors duration-500",
                          isLight ? "border-primary/10 bg-white/95" : "border-white/[0.08] bg-card/95"
                        )}>
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold tracking-tight">AI Improvement</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <Textarea
                              placeholder="How should I improve this summary?"
                              value={aiInstruction}
                              onChange={(event) =>
                                setAiInstruction(event.target.value)
                              }
                              className={cn(
                                "min-h-[120px] rounded-2xl border p-4 text-sm leading-relaxed placeholder:text-foreground/30 transition-all",
                                isLight
                                  ? "border-primary/10 bg-primary/5 focus:border-primary/30"
                                  : "border-white/[0.08] bg-foreground/[0.03] focus:border-cyan-500/50"
                              )}
                            />
                            <Button
                              onClick={handleImproveSummary}
                              disabled={isImproving || !aiInstruction}
                              className={cn(
                                "w-full h-12 rounded-2xl font-bold text-white shadow-lg disabled:opacity-50 transition-all",
                                isLight
                                  ? "bg-primary shadow-primary/20 hover:bg-primary/90"
                                  : "bg-cyan-600 shadow-cyan-600/20 hover:bg-cyan-700"
                              )}
                            >
                              {isImproving ? (
                                <Sparkles className={cn("mr-2 h-4 w-4 animate-spin", isLight ? "text-white/60" : "text-cyan-200")} />
                              ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                              )}
                              Magic Improve
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-20 [-webkit-overflow-scrolling:touch]">
                    <div className="mx-auto max-w-4xl space-y-6">
                      <div className="space-y-4">
                        {isEditing ? (
                          <div className={cn(
                            "relative rounded-2xl border p-4 transition-all duration-300",
                            isLight ? "border-primary/10 bg-white shadow-sm" : "border-white/[0.08] bg-foreground/[0.02]"
                          )}>
                            <Textarea
                              value={summaryContent}
                              onChange={(event) =>
                                setSummaryContent(event.target.value)
                              }
                              className={cn(
                                "min-h-[40vh] w-full resize-none border-none bg-transparent p-0 font-sans text-sm leading-relaxed outline-none ring-0 focus:ring-0",
                                isLight ? "text-foreground" : "text-foreground/90 font-mono"
                              )}
                              placeholder="Summary content..."
                            />
                          </div>
                        ) : (
                          <div className={cn("max-w-none transition-colors", isLight ? "prose prose-blue" : "prose prose-invert")}>
                            <AIChatMessage
                              content={
                                summaryContent ||
                                (isSimpleMode
                                  ? "Simple summary not available."
                                  : "No content available")
                              }
                            />
                          </div>
                        )}
                      </div>

                      <Suspense
                        fallback={
                          <MobileWorkspaceFallback label="Preparing summary tools..." />
                        }
                      >
                        <div className="grid gap-4 sm:grid-cols-2">
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

                      <div className="pt-4">
                        <StudyWorkspaceNextSteps
                          user={user}
                          activeTab={activeTab}
                          onSelectTab={handleSelectTool}
                          sourceTitle={sourceTitle}
                          sourceWordCount={sourceWordCount}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "flex min-h-0 flex-1 overflow-hidden rounded-[30px] border shadow-[0_18px_50px_rgba(2,4,18,0.18)] backdrop-blur-md transition-colors duration-500",
                  isLight ? "border-primary/10 bg-white/60" : "border-white/[0.08] bg-card/40"
                )}>
                  <Suspense
                    fallback={
                      <MobileWorkspaceFallback label={`Connecting ${activeTab}...`} />
                    }
                  >
                    {activeTab === "chat" ? (
                      <PDFChat docId={docId} title={sourceTitle} />
                    ) : activeTab === "flashcards" ? (
                      <StudyFlashcards
                        materialId={material?._id}
                        autoContent={transcriptText}
                        title={sourceTitle}
                      />
                    ) : activeTab === "quizzes" ? (
                      <StudyQuizzes
                        materialId={material?._id}
                        autoContent={transcriptText}
                        title={sourceTitle}
                      />
                    ) : activeTab === "notes" ? (
                      <StudyNotes
                        content={document.summary?.detailed || transcriptText}
                        title={sourceTitle}
                        materialId={material?._id}
                      />
                    ) : activeTab === "mindmap" ? (
                      <StudyConceptMap
                        title={sourceTitle}
                        autoContent={transcriptText}
                        materialId={material?._id}
                      />
                    ) : activeTab === "gaps" ? (
                      <div className="min-h-0 flex-1 overflow-y-auto p-4 [-webkit-overflow-scrolling:touch]">
                        <KnowledgeGapDashboard materialId={material?._id} />
                      </div>
                    ) : (
                      <ImageOcclusionTool materialId={material?._id} />
                    )}
                  </Suspense>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-background via-background/95 to-transparent pb-[env(safe-area-inset-bottom)] pt-8">
        <div className="px-5 pb-5">
          <Button
            onClick={handleOpenAssistant}
            className={cn(
              "group relative flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl text-white shadow-lg transition-all active:scale-[0.97]",
              isLight
                ? "bg-primary shadow-primary/30 hover:bg-primary/90"
                : "bg-cyan-600 shadow-[0_12px_30px_rgba(8,145,178,0.3)] hover:bg-cyan-700"
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.15),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Sparkles className={cn("h-5 w-5 animate-pulse", isLight ? "text-white/80" : "text-cyan-200")} />
            <span className="text-[15px] font-bold tracking-tight">Ask Study Assistant</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
