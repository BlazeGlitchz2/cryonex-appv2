import { useParams } from "react-router";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Brain,
  ListChecks,
  StickyNote,
  Sparkles,
  Network,
  TrendingUp,
  EyeOff,
  Clock,
  Edit,
  Save,
  Wand2,
  X,
  Menu,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router";
import { PDFChat } from "@/components/study/PDFChat";
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
import { useState, useEffect, useRef } from "react";
import { StudyFlashcards } from "@/components/study/StudyFlashcards";
import { StudyQuizzes } from "@/components/study/StudyQuizzes";
import { StudyNotes } from "@/components/study/StudyNotes";
import { StudyConceptMap } from "@/components/study/StudyConceptMap";
import { KnowledgeGapDashboard } from "@/components/study/KnowledgeGapDashboard";
import { ImageOcclusionTool } from "@/components/study/ImageOcclusionTool";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { AIChatMessage } from "@/components/chat/AIChatMessage";
import { useAuth } from "@/hooks/use-auth";
import { RegionalStudyPlaybooks } from "@/components/study/RegionalStudyPlaybooks";
import { SourceGroundingPanel } from "@/components/study/SourceGroundingPanel";
import { StudyWorkspaceNextSteps } from "@/components/study/StudyWorkspaceNextSteps";
import { cn } from "@/lib/utils";

const formatStudyTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0)
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

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
    startTracking();
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
      if (sessionId) endSession({ sessionId }).catch(console.error);
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
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const improveSummary = useAction(api.autoGenerate.improveSummary);
  const updateDocumentSummary = useMutation(
    api.studyMutations.updateDocumentSummary,
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveDialog, setShowImproveDialog] = useState(false);

  useEffect(() => {
    if (document?.summary) {
      setSummaryContent(
        isSimpleMode
          ? document.summary.simple || ""
          : document.summary.detailed || "",
      );
    }
  }, [document, isSimpleMode]);

  const [activeTab, setActiveTab] = useState<string>(tabParam || "summary");

  // Mobile specific: Determine if we are in "content" mode or "chat" mode
  // But actually, "chat" is just another tab in the mobile view

  const transcriptText =
    document?.extracted?.text ||
    ((document?.extracted?.sections as any[] | undefined)
      ?.map((s) => s.text)
      .join("\n\n") ??
      "");
  const sourceWordCount = transcriptText.split(/\s+/).filter(Boolean).length;

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
    } catch (error) {
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
    } catch (error) {
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

  if (!docId || !document)
    return (
      <div className="flex h-full items-center justify-center bg-[#030014] px-4 text-white/50">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
          Loading workspace...
        </div>
      </div>
    );

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

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#030014] font-sans text-white">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center justify-between border-b border-white/5 bg-[#030014]/86 px-3 backdrop-blur-xl safe-area-top pt-safe sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/study/dashboard")}
            className="h-10 w-10 rounded-full text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0 flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
              Mobile workspace
            </p>
            <h1 className="max-w-[150px] truncate text-sm font-bold leading-tight text-white sm:max-w-[220px]">
              {document.meta.title || "Untitled"}
            </h1>
            <div className="flex items-center gap-1 font-mono text-[10px] text-white/50">
              <Clock className="w-3 h-3" />
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

          {/* Tool Drawer Toggle */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-white/60 hover:text-white md:hidden"
              >
                <Menu className="w-5 h-5" />
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
                    <tool.icon className="w-4 h-4 mr-2" />
                    {tool.label}
                  </Button>
                ))}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </header>

      <div className="hidden md:block px-4 pt-4 lg:px-6">
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

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col overflow-hidden md:px-4 md:pb-4 lg:px-6">
        <StudyWorkspaceNextSteps
          user={user}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          sourceTitle={document.meta.title || "Untitled document"}
          sourceWordCount={sourceWordCount}
          compact
        />
        {activeTab === "summary" && (
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

            <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-4 lg:px-6 custom-scrollbar">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
                <div className="space-y-3">
                  {isEditing ? (
                    <Textarea
                      value={summaryContent}
                      onChange={(e) => setSummaryContent(e.target.value)}
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
              </div>
            </div>

            {!isEditing && (
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
                        onChange={(e) => setAiInstruction(e.target.value)}
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
            )}
          </div>
        )}

        {activeTab === "chat" && (
          <div className="flex h-full flex-col">
            <PDFChat docId={docId} title={document.meta.title} />
          </div>
        )}

        {activeTab === "flashcards" && (
          <StudyFlashcards
            materialId={material?._id}
            autoContent={transcriptText}
            title={document.meta.title}
          />
        )}
        {activeTab === "quizzes" && (
          <StudyQuizzes
            materialId={material?._id}
            autoContent={transcriptText}
            title={document.meta.title}
          />
        )}
        {activeTab === "notes" && (
          <StudyNotes
            content={document.summary?.detailed || transcriptText}
            title={document.meta.title}
            materialId={material?._id}
          />
        )}
        {activeTab === "mindmap" && (
          <StudyConceptMap
            title={document.meta.title}
            autoContent={transcriptText}
            materialId={material?._id}
          />
        )}
        {activeTab === "gaps" && (
          <div className="h-full overflow-y-auto p-4 lg:p-6">
            <KnowledgeGapDashboard materialId={material?._id} />
          </div>
        )}
        {activeTab === "diagrams" && (
          <ImageOcclusionTool materialId={material?._id} />
        )}
      </div>
    </div>
  );
}
