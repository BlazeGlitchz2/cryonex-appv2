import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
      <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-sm font-medium text-white/70">{label}</p>
        <div className="space-y-3">
          <div className="h-4 w-full animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/[0.05]" />
          <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}

export default function MobileStudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get("tab");

  const startSession = useMutation(api.study.startStudySession);
  const endSession = useMutation(api.study.endStudySession);
  const [sessionId, setSessionId] = useState<Id<"studySessions"> | null>(null);
  const [studyTime, setStudyTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startTracking = async () => {
      try {
        const id = await startSession({ activityType: "reading" });
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (sessionId) await endSession({ sessionId });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (sessionId) void endSession({ sessionId }).catch(console.error);
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

  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveDialog, setShowImproveDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(tabParam || "summary");

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
  const isDocumentLoading = Boolean(docId) && document === undefined;

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
      <div className="flex h-full items-center justify-center bg-[#030014] px-4 text-white/50">
        Missing workspace source.
      </div>
    );
  }

  const tools = [
    { id: "summary", icon: FileText, label: "Summary" },
    { id: "chat", icon: MessageSquare, label: "Chat" },
    { id: "flashcards", icon: Brain, label: "Flashcards" },
    { id: "quizzes", icon: ListChecks, label: "Quizzes" },
    { id: "notes", icon: StickyNote, label: "Notes" },
    { id: "mindmap", icon: Network, label: "Concept Map" },
    { id: "gaps", icon: TrendingUp, label: "Knowledge Gaps" },
    { id: "diagrams", icon: EyeOff, label: "Occlusion" },
  ];

  if (isDocumentLoading) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-[#030014] font-sans text-white">
        <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#030014]/90 px-3 backdrop-blur-xl safe-area-top pt-safe sm:px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/study/dashboard")}
              className="h-10 w-10 rounded-full text-white/60 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded-full bg-white/[0.05]" />
              <div className="h-4 w-40 animate-pulse rounded-full bg-white/[0.08]" />
            </div>
          </div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.05]" />
        </header>

        <div className="px-4 pt-4">
          <div className="grid grid-cols-4 gap-2 rounded-[28px] border border-white/10 bg-white/[0.03] p-2">
            {tools.slice(0, 4).map((tool) => (
              <div
                key={tool.id}
                className="h-11 animate-pulse rounded-2xl bg-white/[0.05]"
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
      <div className="flex h-full items-center justify-center bg-[#030014] px-4 text-center text-white/70">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
          This workspace could not be found.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#030014] font-sans text-white">
      <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#030014]/86 px-3 backdrop-blur-xl safe-area-top pt-safe sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/study/dashboard")}
            className="h-10 w-10 rounded-full text-white/60 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0 flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
              Mobile workspace
            </p>
            <h1 className="max-w-[150px] truncate text-sm font-bold leading-tight text-white sm:max-w-[220px]">
              {document.meta.title || "Untitled"}
            </h1>
            <div className="flex items-center gap-1 font-mono text-[10px] text-white/50">
              <Clock className="h-3 w-3" />
              <span>{formatStudyTime(studyTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate(`/study/copilot${docId ? `?docId=${docId}` : ""}`)
            }
            className="h-10 rounded-full bg-white/[0.04] px-3 text-white/70 hover:bg-white/[0.08] hover:text-white"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Copilot</span>
          </Button>

          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-white/60 hover:text-white md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="border-white/10 bg-[#0A0A0B] text-white outline-none">
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
                        ? "border-0 bg-purple-600 text-white hover:bg-purple-700"
                        : "border-white/10 bg-white/5 text-white hover:bg-white/10",
                    )}
                    onClick={() => setActiveTab(tool.id)}
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

      <div className="hidden px-4 pt-4 md:block lg:px-6">
        <div className="grid grid-cols-4 gap-2 rounded-[28px] border border-white/10 bg-white/[0.03] p-2 lg:grid-cols-8">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              type="button"
              variant={activeTab === tool.id ? "default" : "outline"}
              className={cn(
                "h-11 rounded-2xl px-3 text-xs",
                activeTab === tool.id
                  ? "border-0 bg-purple-600 text-white hover:bg-purple-700"
                  : "border-white/10 bg-white/5 text-white hover:bg-white/10",
              )}
              onClick={() => setActiveTab(tool.id)}
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
            <div className="flex shrink-0 flex-col gap-3 border-b border-white/5 bg-white/[0.02] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 lg:px-6">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  Summary
                </h3>
                <div className="ml-1 flex items-center rounded-full border border-white/5 bg-white/5 p-0.5">
                  <button
                    onClick={() => setIsSimpleMode(false)}
                    className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${!isSimpleMode ? "bg-purple-500 text-white" : "text-white/50"}`}
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => setIsSimpleMode(true)}
                    className={`rounded-full px-3 py-1 text-[10px] font-medium transition-all ${isSimpleMode ? "bg-purple-500 text-white" : "text-white/50"}`}
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
                    className="h-9 rounded-full bg-green-600 px-3 text-xs text-white hover:bg-green-700"
                  >
                    <Save className="h-3 w-3 sm:mr-2" />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="h-9 rounded-full px-3 text-xs text-white/70 hover:bg-white/10"
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
                      className="min-h-[42vh] w-full resize-none border-white/10 bg-white/5 p-4 font-mono text-sm text-white focus:ring-0"
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
                      className="h-12 w-12 rounded-full bg-purple-600 shadow-lg shadow-purple-500/30 hover:bg-purple-700"
                    >
                      <Wand2 className="h-6 w-6 text-white" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[92vw] rounded-3xl border-white/10 bg-[#1a1a1a] text-white sm:max-w-md lg:max-w-lg">
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
                        className="min-h-[100px] border-white/10 bg-white/5 text-white"
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
