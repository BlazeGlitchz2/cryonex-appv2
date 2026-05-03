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
import { StudyMaterialViewer } from "@/components/study/StudyMaterialViewer";
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
import { useFocusSessionController } from "@/hooks/use-focus-session-controller";
import { useStudyPresence } from "@/hooks/use-study-presence";
import { useStudentOS } from "@/hooks/use-student-os";
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
import { FocusSessionCard } from "@/components/study/FocusSessionCard";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useDeviceType } from "@/hooks/use-mobile";

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
      <div
        className={cn(
          "space-y-4 rounded-lg border p-6 transition-colors",
          isLight
            ? "border-primary/10 bg-white/40 shadow-sm"
            : "border-white/[0.08] bg-foreground/[0.03]",
        )}
      >
        <p className="text-sm font-medium text-foreground/70">{label}</p>
        <div className="space-y-3">
          <div
            className={cn(
              "h-4 w-full animate-pulse rounded-full",
              isLight ? "bg-primary/10" : "bg-foreground/[0.06]",
            )}
          />
          <div
            className={cn(
              "h-4 w-5/6 animate-pulse rounded-full",
              isLight ? "bg-primary/5" : "bg-foreground/[0.05]",
            )}
          />
          <div
            className={cn(
              "h-4 w-2/3 animate-pulse rounded-full",
              isLight ? "bg-primary/5" : "bg-foreground/[0.05]",
            )}
          />
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

type StudyWorkspacePack = {
  _id: Id<"studyPacks">;
  materialId?: Id<"studyMaterials"> | null;
  title?: string | null;
  sourceTitle?: string | null;
  description?: string | null;
  summary?: {
    simple?: string | null;
    detailed?: string | null;
    short?: string | null;
  } | null;
  isPublic?: boolean | null;
  shareId?: string | null;
} | null;

export default function MobileStudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { mode } = useThemeStore();
  const deviceType = useDeviceType();
  const isTablet = deviceType === "tablet";
  const isLight = mode === "light";
  const { user, isLoading: authLoading } = useAuth();
  const { osState } = useStudentOS();
  const isFatigued = osState?.flowState === "fatigue";
  const tabParam = searchParams.get("tab");
  const packIdParam = searchParams.get("packId");

  const document = useQuery(
    api.studyQuery.getDocument,
    docId ? { docId } : "skip",
  ) as StudyWorkspaceDocument | null | undefined;
  const sharedPack = useQuery(
    api.study.getStudyPack,
    packIdParam ? { packId: packIdParam as any } : "skip",
  ) as StudyWorkspacePack | undefined;
  const material = useQuery(
    api.study.getMaterialByDocId,
    docId ? { docId } : "skip",
  ) as StudyWorkspaceMaterial | undefined;
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

  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveDialog, setShowImproveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabParam || "summary");
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
      : docId === "test-doc"
        ? {
            meta: { title: "Cell Structure" },
            summary: {
              simple:
                "# Cell Structure\n\n## Cell Theory\n\nAll living organisms are composed of one or more cells. The cell is the basic unit of structure and function.\n\n## Cell Membrane\n\nThe cell membrane is selectively permeable and controls movement in and out of the cell.\n\n## Organelles\n\nOrganelles perform specialized jobs including energy production, protein synthesis, and packaging.",
              detailed:
                "# Cell Structure: Summary\n\n## Cell Theory\n\n- All living organisms are composed of one or more cells.\n- The cell is the basic unit of structure and function in living things.\n- All cells come from pre-existing cells.\n\n## Cell Membrane\n\n- The cell membrane is a selectively permeable barrier that controls what enters and exits the cell.\n- It is composed of a phospholipid bilayer with embedded proteins.\n- Key functions include protection, cell signaling, and maintaining homeostasis.\n\n## Cytoplasm & Organelles\n\n- Cytoplasm suspends organelles inside the cell.\n- Mitochondria produce ATP, ribosomes synthesize proteins, and the Golgi apparatus modifies and packages proteins.",
              short:
                "Cell theory, membranes, and organelles in one study workspace.",
            },
            extracted: {
              text:
                "Cell theory, membrane structure, organelles, mitochondria, ribosomes, and Golgi apparatus review notes from Biology 101.",
              sections: [],
            },
            workspaceRecovered: false,
          }
        : null);

  useEffect(() => {
    const nextTab = tabParam || "summary";
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [activeTab, tabParam]);

  useEffect(() => {
    if (resolvedDocument?.summary) {
      const shouldUseSimpleMode = isFatigued ? true : isSimpleMode;
      if (shouldUseSimpleMode !== isSimpleMode) {
        setIsSimpleMode(shouldUseSimpleMode);
      }
      setSummaryContent(
        shouldUseSimpleMode
          ? resolvedDocument.summary.simple || ""
          : resolvedDocument.summary.detailed || "",
      );
    }
  }, [resolvedDocument, isSimpleMode, isFatigued]);

  const transcriptSections = resolvedDocument?.extracted?.sections ?? [];
  const transcriptText =
    resolvedDocument?.extracted?.text ||
    transcriptSections.map((section) => section.text).join("\n\n");
  const sourceTitle = resolvedDocument?.meta?.title || "Untitled document";
  const sourceWordCount = transcriptText.split(/\s+/).filter(Boolean).length;
  const isDocumentLoading =
    Boolean(docId) &&
    (authLoading || (document === undefined && sharedPack === undefined));
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
    surfaceLabel: sourceTitle,
  });
  useStudyPresence({
    source: "mobile_study_workspace",
    route: docId ? `/study/workspace/${docId}` : "/study/workspace",
    currentActivity: activeTab,
    currentSection: activeTab,
    title: sourceTitle,
    subject: material?.type || undefined,
    materialId: material?._id,
    docId,
    sessionId: activeSession?._id,
    enabled: hasValidWorkspace,
    details: {
      studyTime,
      isSimpleMode,
      activeTab,
      focusPhase: sessionState?.phase || "idle",
    },
  });
  const workspaceBrief = useMemo(
    () =>
      buildMobileWorkspaceBrief({
        user,
        sourceTitle,
        sourceWordCount,
        materialType: material?.type,
        hasSummary: Boolean(
          resolvedDocument?.summary?.simple ||
            resolvedDocument?.summary?.detailed,
        ),
      }),
    [
      resolvedDocument?.summary,
      material?.type,
      sourceTitle,
      sourceWordCount,
      user,
    ],
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
  const isImmersiveMobileTool = [
    "summary",
    "chat",
    "flashcards",
    "quizzes",
  ].includes(activeTab);
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

  if (!resolvedDocument) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-background px-4 text-center text-foreground/70">
        <div
          className={cn(
            "rounded-lg border px-6 py-4 text-sm transition-colors",
            isLight
              ? "border-primary/10 bg-white/40"
              : "border-white/[0.08] bg-foreground/[0.04]",
          )}
        >
          This workspace could not be found.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-slate-50 font-sans text-foreground dark:bg-[#080b10]">
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-70 transition-opacity duration-1000",
          isLight
            ? "bg-[linear-gradient(to_right,rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"
            : "bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.026)_1px,transparent_1px)] bg-[size:40px_40px]",
        )}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden [-webkit-overflow-scrolling:touch]">
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

        <div className="px-3 pb-0 pt-2 sm:px-4">
          <div className="mobile-premium-surface overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0d1117] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400/80">
                  Source Rail
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {sourceTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAssistant}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors",
                  isLight
                    ? "border-primary/15 bg-primary/5 text-primary hover:bg-primary/10"
                    : "border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15",
                )}
              >
                Ask coach
              </button>
            </div>

            <div className="border-b border-slate-200 px-3 py-3 dark:border-white/10">
              <FocusSessionCard
                allowedApps={sessionRecord?.importantApps || []}
                blockedApps={sessionRecord?.distractingApps || []}
                androidBlockingReady={androidFocusShieldReady}
                compact
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
              onSelectTab={handleSelectTool}
              sourceTitle={sourceTitle}
              sourceWordCount={sourceWordCount}
              recommendations={recommendations}
              osState={osState}
              hasSummary={Boolean(summaryContent?.trim())}
              compact
            />
          </div>
        </div>
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col overflow-hidden",
            isTablet && "mx-auto w-full max-w-[1180px]",
          )}
        >


          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col overflow-hidden pt-2 sm:px-4",
              isImmersiveMobileTool ? "px-2 pb-2 pt-1" : "px-3 pb-3 pt-3",
              isTablet && "px-5 pb-5 lg:px-8",
            )}
          >
            <div
              className={cn(
                "mobile-premium-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-colors duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.42)]",
                isLight
                  ? "border-primary/10 bg-white/80"
                  : "border-white/10 bg-[#0d1117]",
              )}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 16, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.99 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden"
                >
                  {activeTab === "summary" ? (
                    <>
                      <div
                        className={cn(
                          "flex shrink-0 flex-col gap-3 border-b px-4 py-3 transition-colors",
                          isLight
                            ? "border-primary/10 bg-primary/5"
                            : "border-white/[0.06] bg-foreground/[0.03]",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                                <Sparkles className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-foreground">
                                  AI Summary
                                </h3>
                                <p className="text-[11px] text-foreground/45">
                                  Full-screen reading mode for {sourceTitle}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "flex items-center rounded-lg border p-0.5 transition-colors",
                              isLight
                                ? "border-primary/10 bg-primary/5"
                                : "border-white/[0.08] bg-foreground/5",
                            )}
                          >
                            <button
                              onClick={() => setIsSimpleMode(false)}
                              className={cn(
                                  "rounded-md px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all",
                                !isSimpleMode
                                  ? isLight
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                                  : "text-foreground/40 hover:text-foreground",
                              )}
                            >
                              Detail
                            </button>
                            <button
                              onClick={() => setIsSimpleMode(true)}
                              className={cn(
                                  "rounded-md px-3 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all",
                                isSimpleMode
                                  ? isLight
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                                  : "text-foreground/40 hover:text-foreground",
                              )}
                            >
                              Simple
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {isEditing ? (
                            <Button
                              size="sm"
                              onClick={handleSaveSummary}
                              className="h-9 rounded-lg bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-700"
                            >
                              <Save className="mr-2 h-3 w-3" />
                              Save
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setIsEditing(true)}
                              className="h-9 rounded-lg bg-white/[0.05] px-4 text-xs font-bold text-foreground transition-all hover:bg-white/[0.1] active:scale-95"
                            >
                              <Edit className="mr-2 h-3 w-3" />
                              Edit
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
                                  "h-9 rounded-lg px-4 text-xs font-bold transition-all",
                                  isLight
                                    ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20",
                                )}
                              >
                                <Wand2 className="mr-2 h-3.5 w-3.5" />
                                Improve
                              </Button>
                            </DialogTrigger>
                            <DialogContent
                              className={cn(
                                "w-[92vw] rounded-lg border text-foreground backdrop-blur-xl sm:max-w-md transition-colors duration-500",
                                isLight
                                  ? "border-primary/10 bg-white/95"
                                  : "border-white/[0.08] bg-card/95",
                              )}
                            >
                              <DialogHeader>
                                <DialogTitle className="text-xl font-bold tracking-tight">
                                  AI Improvement
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Textarea
                                  placeholder="How should I improve this summary?"
                                  value={aiInstruction}
                                  onChange={(event) =>
                                    setAiInstruction(event.target.value)
                                  }
                                  className={cn(
                                    "min-h-[120px] rounded-lg border p-4 text-sm leading-relaxed placeholder:text-foreground/30 transition-all",
                                    isLight
                                      ? "border-primary/10 bg-primary/5 focus:border-primary/30"
                                      : "border-white/[0.08] bg-foreground/[0.03] focus:border-cyan-500/50",
                                  )}
                                />
                                <Button
                                  onClick={handleImproveSummary}
                                  disabled={isImproving || !aiInstruction}
                                  className={cn(
                                    "h-12 w-full rounded-lg font-bold text-white shadow-lg transition-all disabled:opacity-50",
                                    isLight
                                      ? "bg-primary shadow-primary/20 hover:bg-primary/90"
                                      : "bg-cyan-600 shadow-cyan-600/20 hover:bg-cyan-700",
                                  )}
                                >
                                  {isImproving ? (
                                    <Sparkles
                                      className={cn(
                                        "mr-2 h-4 w-4 animate-spin",
                                        isLight
                                          ? "text-white/60"
                                          : "text-cyan-200",
                                      )}
                                    />
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

                      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto [-webkit-overflow-scrolling:touch]">
                        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-3 py-3">
                          <div className="flex-1">
                            {isEditing ? (
                              <div
                                className={cn(
                                  "mobile-premium-surface h-full min-h-[58vh] rounded-lg p-4 transition-all duration-300",
                                  isLight
                                    ? "border-primary/10 bg-white shadow-sm"
                                    : "border-white/[0.08] bg-foreground/[0.02]",
                                )}
                              >
                                <Textarea
                                  value={summaryContent}
                                  onChange={(event) =>
                                    setSummaryContent(event.target.value)
                                  }
                                  className={cn(
                                    "h-full min-h-[54vh] w-full resize-none border-none bg-transparent p-0 font-sans text-sm leading-7 outline-none ring-0 focus:ring-0",
                                    isLight
                                      ? "text-foreground"
                                      : "text-foreground/90",
                                  )}
                                  placeholder="Summary content..."
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "mobile-premium-surface h-full rounded-lg px-4 py-4",
                                  isLight
                                    ? "border-primary/10 bg-white/70"
                                    : "border-white/[0.06] bg-black/10",
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-full transition-colors pb-32",
                                  )}
                                >
                                  <StudyMaterialViewer
                                    isRTL={user?.isRTL}
                                    content={
                                      summaryContent ||
                                      (isSimpleMode
                                        ? "Simple summary not available."
                                        : "No content available")
                                    }
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <details
                            className={cn(
                              "mt-3 rounded-lg border transition-colors",
                              isLight
                                ? "border-primary/10 bg-white/55"
                                : "border-white/[0.06] bg-white/[0.02]",
                            )}
                          >
                            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground">
                              Study help and next steps
                            </summary>
                            <div className="border-t border-inherit px-3 py-3">
                              <Suspense
                                fallback={
                                  <MobileWorkspaceFallback label="Preparing summary tools..." />
                                }
                              >
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
                                  <div className="order-2 lg:order-1">
                                    <StudyWorkspaceNextSteps
                                      user={user}
                                      activeTab={activeTab}
                                      onSelectTab={handleSelectTool}
                                      sourceTitle={sourceTitle}
                                      sourceWordCount={sourceWordCount}
                                      recommendations={recommendations}
                                      osState={osState}
                                      hasSummary={Boolean(summaryContent?.trim())}
                                    />
                                  </div>
                                  <div className="order-1 space-y-4 lg:order-2">
                                    <RegionalStudyPlaybooks
                                      region={user?.region}
                                      country={user?.country}
                                      curriculum={user?.curriculum}
                                      curriculumTrack={user?.curriculumTrack}
                                      gradeLevel={user?.gradeLevel}
                                      targetSubjects={user?.targetSubjects}
                                      targetExams={user?.targetExams}
                                      studyPace={user?.studyPace}
                                      preferredLanguage={
                                        user?.preferredLanguage
                                      }
                                      isRTL={user?.isRTL}
                                      compact
                                      onApplyInstruction={
                                        applyPlaybookInstruction
                                      }
                                    />
                                    <SourceGroundingPanel
                                      summary={summaryContent}
                                      sourceText={transcriptText}
                                      compact
                                    />
                                  </div>
                                </div>
                              </Suspense>
                            </div>
                          </details>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                      <div
                        className={cn(
                          "flex shrink-0 items-center justify-between gap-3 border-b px-4 py-2.5",
                          isLight
                            ? "border-primary/10 bg-primary/5"
                            : "border-white/[0.06] bg-foreground/[0.03]",
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-foreground/35">
                            Study Tool
                          </p>
                          <h3 className="truncate text-sm font-bold text-foreground">
                            {activeTool?.label || "Workspace"}
                          </h3>
                        </div>
                        <p className="max-w-[12rem] truncate text-right text-[11px] text-foreground/45">
                          {activeTool?.brief.description}
                        </p>
                      </div>

                      <div className="min-h-0 flex-1 overflow-hidden">
                        <Suspense
                          fallback={
                            <MobileWorkspaceFallback
                              label={`Connecting ${activeTab}...`}
                            />
                          }
                        >
                          {activeTab === "chat" ? (
                            <PDFChat docId={docId} title={sourceTitle} />
                          ) : activeTab === "flashcards" ? (
                            <StudyFlashcards
                              materialId={material?._id || sharedPackMaterialId}
                              shareId={sharedPackShareId}
                              autoContent={transcriptText}
                              title={sourceTitle}
                            />
                          ) : activeTab === "quizzes" ? (
                            <StudyQuizzes
                              materialId={material?._id || sharedPackMaterialId}
                              shareId={sharedPackShareId}
                              autoContent={transcriptText}
                              title={sourceTitle}
                            />
                          ) : activeTab === "notes" ? (
                            <StudyNotes
                              content={
                                resolvedDocument.summary?.detailed ||
                                transcriptText
                              }
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
                              <KnowledgeGapDashboard
                                materialId={material?._id}
                              />
                            </div>
                          ) : (
                            <ImageOcclusionTool materialId={material?._id} />
                          )}
                        </Suspense>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
