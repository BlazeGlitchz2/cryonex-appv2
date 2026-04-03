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
import { toast } from "sonner";
import {
  ArrowLeft,
  Brain,
  Clock,
  Edit,
  EyeOff,
  FileText,
  ListChecks,
  Menu,
  MessageSquare,
  Network,
  Save,
  Sparkles,
  StickyNote,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { AIChatMessage } from "@/components/chat/AIChatMessage";
import { StudyWorkspaceNextSteps } from "@/components/study/StudyWorkspaceNextSteps";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  buildMobileWorkspaceBrief,
  buildMobileWorkspaceToolBriefs,
} from "@/lib/mobile-personalization";

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
  const workspaceBrief = useMemo(
    () =>
      buildMobileWorkspaceBrief({
        user,
        sourceTitle: document?.meta?.title,
        sourceWordCount,
        materialType: material?.type,
        hasSummary: Boolean(
          document?.summary?.simple || document?.summary?.detailed,
        ),
      }),
    [
      document?.meta?.title,
      document?.summary,
      material?.type,
      sourceWordCount,
      user,
    ],
  );
  const workspaceToolBriefs = useMemo(
    () =>
      buildMobileWorkspaceToolBriefs({
        user,
        sourceTitle: document?.meta?.title,
        sourceWordCount,
        studyTimeSeconds: studyTime,
      }),
    [document?.meta?.title, sourceWordCount, studyTime, user],
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
      <div className="flex h-full items-center justify-center bg-background px-4 text-foreground/50">
        Missing workspace source.
      </div>
    );
  }

  const tools = [
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
  ];
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

  if (isDocumentLoading) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-background font-sans text-foreground">
        <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center justify-between border-b border-border bg-background/90 px-3 backdrop-blur-xl safe-area-top pt-safe sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/study/dashboard")}
              className="h-10 w-10 rounded-full text-foreground/60 hover:text-foreground"
              aria-label="Back to mobile study dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-foreground/[0.05]" />
              <div className="h-4 w-40 animate-pulse rounded-full bg-foreground/[0.08]" />
            </div>
          </div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-foreground/[0.05]" />
        </header>

        <div className="px-4 pt-4">
          <div className="grid grid-cols-4 gap-2 rounded-[28px] border border-border bg-foreground/[0.03] p-2">
            {tools.slice(0, 4).map((tool) => (
              <div
                key={tool.id}
                className="h-11 animate-pulse rounded-2xl bg-foreground/[0.05]"
              />
            ))}
          </div>
        </div>

        <MobileWorkspaceFallback label="Loading workspace..." />
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
    <div className="flex h-full w-full flex-col overflow-hidden bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center justify-between border-b border-border bg-background/86 px-3 backdrop-blur-xl safe-area-top pt-safe sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/study/dashboard")}
            className="h-10 w-10 rounded-full text-foreground/60 hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/35">
              Mobile workspace
            </p>
            <h1 className="max-w-[150px] truncate text-sm font-bold leading-tight text-foreground sm:max-w-[220px]">
              {document.meta.title || "Untitled"}
            </h1>
            <div className="flex items-center gap-1 font-mono text-[10px] text-foreground/50">
              <Clock className="h-3 w-3" />
              <span>{formatStudyTime(studyTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSelectTool("chat")}
            aria-label="Open source-linked chat for this workspace"
            className="h-10 rounded-full bg-primary/5 px-3 text-primary/70 hover:bg-primary/10 hover:text-primary"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Source Chat</span>
          </Button>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-foreground/60 hover:text-foreground md:hidden"
                aria-label="Open study tools menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="border-border bg-background text-foreground outline-none">
              <DrawerHeader className="pb-2">
                <DrawerTitle>Study Tools</DrawerTitle>
              </DrawerHeader>
              <div className="grid grid-cols-2 gap-3 p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
                {tools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant={activeTab === tool.id ? "default" : "outline"}
                    className={cn(
                      "h-12 rounded-2xl px-3",
                      activeTab === tool.id
                        ? "border-0 bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-border bg-foreground/5 text-foreground hover:bg-foreground/10",
                    )}
                    onClick={() => handleSelectTool(tool.id)}
                  >
                    <tool.icon className="mr-2 h-4 w-4" />
                    {tool.label}
                  </Button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <div className="px-3 pt-3 sm:px-4 lg:px-6">
        <div className="overflow-hidden rounded-[28px] border border-border bg-card p-4 shadow-[0_18px_50px_rgba(2,4,18,0.3)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Workspace lane
            </div>
            <div className="rounded-full border border-border bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/52">
              {workspaceBrief.focusLabel}
            </div>
          </div>

          <h2 className="mt-4 text-[1.55rem] font-semibold tracking-[-0.05em] text-foreground sm:text-[1.8rem]">
            {workspaceBrief.headline}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/58">
            {workspaceBrief.subheadline}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {workspaceBrief.badges.map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-border bg-foreground/[0.04] px-3 py-1.5 text-[11px] text-foreground/72"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
            <button
              type="button"
              onClick={() => handleSelectTool(workspaceBrief.recommendedToolId)}
              className="rounded-[22px] border border-border bg-foreground/[0.05] p-4 text-left transition-colors hover:bg-foreground/[0.08]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/38">
                Recommended next tool
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                {workspaceBrief.recommendedToolLabel}
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/58">
                {workspaceBrief.recommendedToolReason}
              </p>
            </button>

            <button
              type="button"
              onClick={() =>
                handleSelectTool("chat")
              }
              className="rounded-[22px] border border-border bg-black/20 p-4 text-left transition-colors hover:bg-foreground/[0.08]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/38">
                Assistant shortcut
              </p>
              <p className="mt-2 text-base font-semibold text-foreground">
                Ask a source-linked question
              </p>
              <p className="mt-1 text-sm leading-6 text-foreground/58">
                Keep the answer grounded in this source instead of starting a
                separate generic chat thread.
              </p>
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 pt-3 md:hidden sm:px-4">
        <div className="overflow-x-auto pb-1">
          <div className="flex gap-3">
            {tools.map((tool) => {
              const active = activeTab === tool.id;

              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => handleSelectTool(tool.id)}
                  className={cn(
                    "min-w-[15.25rem] flex-1 rounded-[24px] border p-4 text-left transition-colors",
                    active
                      ? "border-primary/40 bg-card shadow-[0_18px_40px_rgba(var(--primary),0.15)]"
                      : "border-border bg-foreground/[0.03] hover:bg-foreground/[0.05]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-foreground/38">
                        {tool.brief.eyebrow}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {tool.label}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-2xl border",
                        active
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-black/20 text-foreground/72",
                      )}
                    >
                      <tool.icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                  <p className="mt-3 text-[12px] leading-5 text-foreground/60">
                    {tool.brief.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-border bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-foreground/55">
                      {tool.brief.metric}
                    </span>
                    {active ? (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/80">
                        Active
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="hidden px-4 pt-4 md:block lg:px-6">
        <div className="grid grid-cols-4 gap-2 rounded-[28px] border border-border bg-foreground/[0.03] p-2 lg:grid-cols-8">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              type="button"
              variant={activeTab === tool.id ? "default" : "outline"}
              className={cn(
                "h-11 rounded-2xl px-3 text-xs",
                activeTab === tool.id
                  ? "border-0 bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border bg-foreground/5 text-foreground hover:bg-foreground/10",
              )}
              onClick={() => handleSelectTool(tool.id)}
            >
              <tool.icon className="mr-2 h-4 w-4" />
              {tool.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden md:px-4 md:pb-4 lg:px-6">
        <StudyWorkspaceNextSteps
          user={user}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          sourceTitle={document.meta.title || "Untitled document"}
          sourceWordCount={sourceWordCount}
          compact
        />

        {activeTab === "summary" ? (
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 flex-col gap-3 border-b border-border bg-foreground/[0.02] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:px-6">
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
              </div>
            </div>

            <div className="custom-scrollbar flex-1 overflow-y-auto px-3 py-3 sm:px-4 lg:px-6">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
                <div className="space-y-3">
                  {isEditing ? (
                    <Textarea
                      value={summaryContent}
                      onChange={(event) =>
                        setSummaryContent(event.target.value)
                      }
                      className="min-h-[42vh] w-full resize-none border-border bg-foreground/5 p-4 font-mono text-sm text-foreground focus:ring-0"
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
                  <div className="space-y-3 md:sticky md:top-4">
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

            {!isEditing ? (
              <div className="absolute bottom-6 right-6 z-20">
                <Dialog
                  open={showImproveDialog}
                  onOpenChange={setShowImproveDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      className="h-12 w-12 rounded-full bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90"
                    >
                      <Wand2 className="h-6 w-6 text-primary-foreground" />
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
            ) : null}
          </div>
        ) : null}

        {activeTab === "chat" ? (
          <Suspense
            fallback={
              <MobileWorkspaceFallback label="Connecting study chat..." />
            }
          >
            <div className="flex h-full flex-col">
              <PDFChat docId={docId} title={document.meta.title} />
            </div>
          </Suspense>
        ) : null}

        {activeTab === "flashcards" ? (
          <Suspense
            fallback={
              <MobileWorkspaceFallback label="Preparing flashcards..." />
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
            fallback={<MobileWorkspaceFallback label="Preparing quizzes..." />}
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
            fallback={<MobileWorkspaceFallback label="Loading notes..." />}
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
              <MobileWorkspaceFallback label="Building concept map..." />
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
              <MobileWorkspaceFallback label="Analyzing knowledge gaps..." />
            }
          >
            <div className="h-full overflow-y-auto p-4 lg:p-6">
              <KnowledgeGapDashboard materialId={material?._id} />
            </div>
          </Suspense>
        ) : null}

        {activeTab === "diagrams" ? (
          <Suspense
            fallback={
              <MobileWorkspaceFallback label="Preparing occlusion study..." />
            }
          >
            <ImageOcclusionTool materialId={material?._id} />
          </Suspense>
        ) : null}
      </div>
    </div>
  );
}
