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
import ReactMarkdown from "react-markdown";
import { useState, useEffect, useRef } from "react";
import rehypeRaw from "rehype-raw";
import { StudyFlashcards } from "@/components/study/StudyFlashcards";
import { StudyQuizzes } from "@/components/study/StudyQuizzes";
import { StudyNotes } from "@/components/study/StudyNotes";
import { StudyConceptMap } from "@/components/study/StudyConceptMap";
import { KnowledgeGapDashboard } from "@/components/study/KnowledgeGapDashboard";
import { ImageOcclusionTool } from "@/components/study/ImageOcclusionTool";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { StudyWorkspaceLayout } from "@/components/study/StudyWorkspaceLayout";
import { AIChatMessage } from "@/components/chat/AIChatMessage";
import { useAuth } from "@/hooks/use-auth";
import { SourceGroundingPanel } from "@/components/study/SourceGroundingPanel";
import { RegionalStudyPlaybooks } from "@/components/study/RegionalStudyPlaybooks";
import { StudyWorkspaceNextSteps } from "@/components/study/StudyWorkspaceNextSteps";

const formatStudyTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0)
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function StudyWorkspace() {
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

  const transcriptText =
    document?.extracted?.text ||
    ((document?.extracted?.sections as any[] | undefined)
      ?.map((s) => s.text)
      .join("\n\n") ??
      "");
  const sourceWordCount = transcriptText.split(/\s+/).filter(Boolean).length;
  const normalizeMd = (s: string) => (s || "").replace(/<br\s*\/?>/gi, "\n");

  const MARKDOWN_COMPONENTS: any = {
    u: (props: any) => (
      <u className="underline underline-offset-2 decoration-purple-400/50">
        {props.children}
      </u>
    ),
    a: (props: any) => (
      <a
        target="_blank"
        rel="noreferrer"
        className="text-purple-400 hover:text-purple-300 underline decoration-dotted underline-offset-4 transition-colors"
        {...props}
      >
        {props.children}
      </a>
    ),
    blockquote: (props: any) => (
      <blockquote className="border-l-2 border-purple-500 pl-4 py-2 my-6 bg-purple-500/5 rounded-r-xl italic text-white/80">
        {props.children}
      </blockquote>
    ),
    h1: (props: any) => (
      <h1
        className="text-3xl font-bold text-white mt-10 mb-6 tracking-tight"
        {...props}
      />
    ),
    h2: (props: any) => (
      <h2
        className="text-2xl font-semibold text-white mt-8 mb-4 tracking-tight flex items-center gap-2 before:content-['#'] before:text-purple-500/50 before:mr-2"
        {...props}
      />
    ),
    h3: (props: any) => (
      <h3
        className="text-xl font-medium text-purple-200 mt-6 mb-3"
        {...props}
      />
    ),
    ul: (props: any) => (
      <ul
        className="list-disc list-outside ml-6 space-y-2 my-4 text-white/80 marker:text-purple-500"
        {...props}
      />
    ),
    li: (props: any) => <li className="pl-1" {...props} />,
    strong: (props: any) => (
      <strong className="text-purple-300 font-semibold" {...props} />
    ),
    code: (props: any) => (
      <code
        className="bg-white/10 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono"
        {...props}
      />
    ),
  };

  const handleGenerateSummary = async () => {
    if (!material || !transcriptText) return;
    setIsGenerating(true);
    try {
      await generateAllAssets({
        materialId: material._id,
        content: transcriptText,
        title: document.meta.title,
        docId: docId,
      });
      toast.success("Summary and study assets generated!");
    } catch (error) {
      toast.error("Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

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
      <div className="h-full flex items-center justify-center text-white/50">
        Loading Workspace...
      </div>
    );

  const NavButton = ({ id, icon: Icon, label, mobile }: any) => (
    <Button
      variant="ghost"
      onClick={() => setActiveTab(id)}
      className={`${mobile ? "flex-1 h-10" : "w-12 h-12"} p-0 rounded-xl transition-all duration-300 ${activeTab === id ? "bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(139,92,246,0.2)] scale-110" : "text-white/40 hover:text-white hover:bg-white/5 hover:scale-105"}`}
      title={label}
    >
      <Icon className="w-5 h-5" />
      {mobile && <span className="ml-2 text-xs">{label}</span>}
    </Button>
  );

  return (
    <>
      <StudyWorkspaceLayout
        activeTab={activeTab}
        header={
          <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/study/dashboard")}
                className="text-white/60 hover:text-white hover:bg-white/5 rounded-xl h-9 w-9 p-0 md:w-auto md:px-3"
              >
                <ArrowLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Back</span>
              </Button>
              <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 border border-purple-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <h1 className="text-white font-bold text-sm md:text-base truncate max-w-[150px] md:max-w-md tracking-tight">
                  {document.meta.title || "Untitled Document"}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-purple-300">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatStudyTime(studyTime)}</span>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  navigate(`/study/copilot${docId ? `?docId=${docId}` : ""}`)
                }
                className="border-white/10 bg-white/[0.04] text-white/82 hover:bg-white/[0.08] hover:text-white rounded-xl"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Copilot
              </Button>
            </div>
          </header>
        }
        sidebar={
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
        }
        content={
          <>
            <StudyWorkspaceNextSteps
              user={user}
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              sourceTitle={document.meta.title || "Untitled document"}
              sourceWordCount={sourceWordCount}
            />
            {activeTab === "summary" && (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                  <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Summary
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <Switch
                        id="simple-mode"
                        checked={isSimpleMode}
                        onCheckedChange={setIsSimpleMode}
                        className="data-[state=checked]:bg-purple-500"
                      />
                      <Label
                        htmlFor="simple-mode"
                        className="text-xs text-white/70 cursor-pointer font-medium"
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
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveSummary}
                          className="h-8 bg-green-600 hover:bg-green-700 text-white border-0"
                        >
                          <Save className="h-3 w-3 mr-2" /> Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditing(true)}
                          className="h-8 px-3 hover:bg-white/10 text-white/70"
                        >
                          <Edit className="h-3 w-3 mr-2" /> Edit
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
                              <Wand2 className="h-3 w-3 mr-2" /> Improve
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
                            <DialogHeader>
                              <DialogTitle>Improve Summary</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Textarea
                                placeholder="Instructions..."
                                value={aiInstruction}
                                onChange={(e) =>
                                  setAiInstruction(e.target.value)
                                }
                                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                              />
                              <Button
                                onClick={handleImproveSummary}
                                disabled={isImproving || !aiInstruction}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                              >
                                {isImproving ? (
                                  <Sparkles className="animate-spin mr-2" />
                                ) : (
                                  <Wand2 className="mr-2" />
                                )}{" "}
                                Improve
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gradient-to-b from-white/[0.02] to-transparent">
                  {isEditing ? (
                    <Textarea
                      value={summaryContent}
                      onChange={(e) => setSummaryContent(e.target.value)}
                      className="w-full h-full min-h-[500px] bg-white/5 border-white/10 text-white font-mono text-sm p-4 resize-none focus:ring-0"
                    />
                  ) : (
                    <div className="max-w-4xl mx-auto space-y-4">
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
                      <SourceGroundingPanel
                        summary={summaryContent}
                        sourceText={transcriptText}
                      />
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
              </div>
            )}
            {activeTab === "chat" && (
              <PDFChat docId={docId} title={document.meta.title} />
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
              <div className="p-6 overflow-y-auto h-full">
                <KnowledgeGapDashboard materialId={material?._id} />
              </div>
            )}
            {activeTab === "diagrams" && (
              <ImageOcclusionTool materialId={material?._id} />
            )}
          </>
        }
        chat={
          <>
            <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between shrink-0">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                Study Assistant
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">
                Always On
              </span>
            </div>
            <div className="flex-1 overflow-hidden relative">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
              <PDFChat docId={docId} title={document.meta.title} />
            </div>
          </>
        }
      />
    </>
  );
}
