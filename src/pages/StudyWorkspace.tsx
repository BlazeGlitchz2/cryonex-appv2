import { useParams } from "react-router";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Share2, FileText, MessageSquare, Brain, ListChecks, StickyNote, Sparkles, Network, TrendingUp, EyeOff, Clock, Edit, Save, Wand2, X } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

// Helper to format time
const formatStudyTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function StudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get("tab");

  // Session tracking
  const startSession = useMutation(api.study.startStudySession);
  const endSession = useMutation(api.study.endStudySession);
  const [sessionId, setSessionId] = useState<Id<"studySessions"> | null>(null);
  const [studyTime, setStudyTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start session on mount
  useEffect(() => {
    const startTracking = async () => {
      try {
        const id = await startSession({ activityType: "reading" });
        setSessionId(id);

        // Start timer
        timerRef.current = setInterval(() => {
          setStudyTime(prev => prev + 1);
        }, 1000);
      } catch (err) {
        console.error("Failed to start study session:", err);
      }
    };

    startTracking();

    // End session on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // End session when leaving
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (sessionId) {
        try {
          await endSession({ sessionId });
        } catch (err) {
          console.error("Failed to end session:", err);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Also end session when component unmounts
      if (sessionId) {
        endSession({ sessionId }).catch(console.error);
      }
    };
  }, [sessionId, endSession]);

  const document = useQuery(
    api.studyQuery.getDocument,
    docId ? { docId } : "skip"
  ) as any;

  const material = useQuery(api.study.getMaterialByDocId, docId ? { docId } : "skip");
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const improveSummary = useAction(api.autoGenerate.improveSummary);
  const updateDocumentSummary = useMutation(api.studyMutations.updateDocumentSummary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSimpleMode, setIsSimpleMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [summaryContent, setSummaryContent] = useState("");
  const [aiInstruction, setAiInstruction] = useState("");
  const [isImproving, setIsImproving] = useState(false);
  const [showImproveDialog, setShowImproveDialog] = useState(false);

  useEffect(() => {
    if (document?.summary) {
      setSummaryContent(isSimpleMode ? (document.summary.simple || "") : (document.summary.detailed || ""));
    }
  }, [document, isSimpleMode]);

  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "flashcards" ? "flashcards" :
      tabParam === "quizzes" ? "quizzes" :
        tabParam === "notes" ? "notes" :
          tabParam === "mindmap" ? "mindmap" :
            tabParam === "gaps" ? "gaps" :
              "summary"
  );

  const transcriptText =
    document?.extracted?.text ||
    ((document?.extracted?.sections as any[] | undefined)?.map((s) => s.text).join("\n\n") ?? "");

  const normalizeMd = (s: string) => (s || "").replace(/<br\s*\/?>/gi, "\n");

  const MARKDOWN_ALLOWED_ELEMENTS: Array<string> = [
    "p", "br", "strong", "em", "u", "code", "pre", "ul", "ol", "li", "a", "blockquote",
    "h1", "h2", "h3", "h4", "h5", "h6", "span",
    "table", "thead", "tbody", "tr", "th", "td"
  ];

  const MARKDOWN_COMPONENTS: any = {
    u: (props: any) => <u className="underline underline-offset-2">{props.children}</u>,
    a: (props: any) => <a target="_blank" rel="noreferrer" {...props} className="text-primary underline" />,
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
      console.error(error);
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
          short: summaryContent.substring(0, 200) + "..."
        }
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
        instruction: aiInstruction
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

  if (!docId) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">No document ID provided</p>
      </div>
    );
  }

  if (document === undefined) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">Document not found</p>
          <Button
            onClick={() => navigate("/study/dashboard")}
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const NavButtons = ({ mobile = false }) => (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab("summary")}
        className={`${mobile ? "flex-1 h-10" : "w-12 h-12"} p-0 ${activeTab === "summary" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        title="Summary"
      >
        <FileText className="w-5 h-5" />
        {mobile && <span className="ml-2">Summary</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab("chat")}
        className={`${mobile ? "flex-1 h-10" : "w-12 h-12"} p-0 ${activeTab === "chat" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        title="Study Chat"
      >
        <MessageSquare className="w-5 h-5" />
        {mobile && <span className="ml-2">Chat</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab("flashcards")}
        className={`${mobile ? "flex-1 h-10" : "w-12 h-12"} p-0 ${activeTab === "flashcards" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        title="Flashcards"
      >
        <Brain className="w-5 h-5" />
        {mobile && <span className="ml-2">Cards</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab("quizzes")}
        className={`${mobile ? "flex-1 h-10" : "w-12 h-12"} p-0 ${activeTab === "quizzes" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        title="Quizzes"
      >
        <ListChecks className="w-5 h-5" />
        {mobile && <span className="ml-2">Quiz</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab("notes")}
        className={`${mobile ? "flex-1 h-10" : "w-12 h-12"} p-0 ${activeTab === "notes" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        title="Notes"
      >
        <StickyNote className="w-5 h-5" />
        {mobile && <span className="ml-2">Notes</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab("mindmap")}
        className={`${mobile ? "flex-1 h-10" : "w-12 h-12"} p-0 ${activeTab === "mindmap" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        title="Concept Map"
      >
        <Network className="w-5 h-5" />
        {mobile && <span className="ml-2">Map</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab("gaps")}
        className={`${mobile ? "flex-1 h-10" : "w-12 h-12"} p-0 ${activeTab === "gaps" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        title="Knowledge Gaps"
      >
        <TrendingUp className="w-5 h-5" />
        {mobile && <span className="ml-2">Gaps</span>}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActiveTab("diagrams")}
        className={`${mobile ? "flex-1 h-10" : "w-12 h-12"} p-0 ${activeTab === "diagrams" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
        title="Diagrams"
      >
        <EyeOff className="w-5 h-5" />
        {mobile && <span className="ml-2">Diagrams</span>}
      </Button>
    </>
  );

  return (
    <div className="h-full flex flex-col relative overflow-hidden text-white selection:bg-purple-500/30">
      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl px-4 md:px-6 flex items-center justify-between shrink-0 z-20 relative">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/study/dashboard")}
            className="text-white/60 hover:text-white hover:bg-white/5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Dashboard</span>
          </Button>
          <div className="h-6 w-[1px] bg-white/10 hidden md:block" />
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-lg truncate max-w-[200px] md:max-w-md tracking-tight flex items-center gap-2">
              <span className="p-1 rounded bg-purple-500/20 text-purple-400"><FileText className="w-3 h-3" /></span>
              {document.meta.title || "Untitled Document"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Study Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-sm font-mono text-purple-300">
            <Clock className="w-4 h-4" />
            <span>{formatStudyTime(studyTime)}</span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Auto-saved
          </div>
          <Button variant="ghost" size="icon" className="text-white/60 hover:text-white hover:bg-white/5 rounded-full">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Tabs */}
      <div className="lg:hidden border-b border-white/5 bg-white/[0.02] backdrop-blur-md flex items-center overflow-x-auto p-2 gap-2 scrollbar-hide z-20">
        <NavButtons mobile={true} />
      </div>

      {/* Main Content - Split Pane Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        {/* Left Sidebar - Desktop Tab Navigation */}
        <aside className="hidden lg:flex w-20 border-r border-white/5 flex-col items-center py-6 gap-4 bg-white/[0.01]">
          <NavButtons />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          {/* Left Pane - Document Viewer / Active Tab Content */}
          <section className="flex flex-col overflow-hidden border-r border-white/5 bg-transparent relative">
            {activeTab === "summary" && (
              <>
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      AI Summary
                    </h3>
                    <p className="text-xs text-white/40">Intelligent breakdown of key concepts</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                      <Switch
                        id="simple-mode"
                        checked={isSimpleMode}
                        onCheckedChange={setIsSimpleMode}
                        className="data-[state=checked]:bg-purple-500"
                      />
                      <Label htmlFor="simple-mode" className="text-xs text-white/70 cursor-pointer font-medium">Simple Mode</Label>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0 rounded-full hover:bg-white/10">
                          <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={handleSaveSummary} className="h-8 bg-green-600 hover:bg-green-700 text-white border-0">
                          <Save className="h-3 w-3 mr-2" /> Save
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)} className="h-8 px-3 hover:bg-white/10 text-white/70">
                          <Edit className="h-3 w-3 mr-2" /> Edit
                        </Button>
                        <Dialog open={showImproveDialog} onOpenChange={setShowImproveDialog}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="h-8 border-purple-500/30 text-purple-300 hover:bg-purple-500/10">
                              <Wand2 className="h-3 w-3 mr-2" /> Improve
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-[#0a0a0a] border-white/10 text-white">
                            <DialogHeader>
                              <DialogTitle>Improve Summary with AI</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <Textarea
                                placeholder="How should AI improve this summary? (e.g., 'Make it shorter', 'Add more emojis', 'Explain like I'm 5')"
                                value={aiInstruction}
                                onChange={(e) => setAiInstruction(e.target.value)}
                                className="bg-white/5 border-white/10 text-white min-h-[100px]"
                              />
                              <Button onClick={handleImproveSummary} disabled={isImproving || !aiInstruction} className="w-full bg-purple-600 hover:bg-purple-700">
                                {isImproving ? <Sparkles className="h-4 w-4 animate-spin mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                                Improve Summary
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}

                    {material && (!document.summary?.detailed || (isSimpleMode && !document.summary?.simple)) && (
                      <Button
                        size="sm"
                        onClick={handleGenerateSummary}
                        disabled={isGenerating}
                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 border-0"
                      >
                        {isGenerating ? "Generating..." : (
                          <>
                            <Sparkles className="h-3 w-3 mr-2" />
                            {document.summary?.detailed ? "Generate Simple" : "Generate"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  {isEditing ? (
                    <Textarea
                      value={summaryContent}
                      onChange={(e) => setSummaryContent(e.target.value)}
                      className="w-full h-full min-h-[500px] bg-white/5 border-white/10 text-white font-mono text-sm p-4 resize-none focus:ring-0"
                    />
                  ) : (
                    <div className={`prose prose-invert max-w-none 
                      prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
                      prose-p:text-white/70 prose-p:leading-relaxed
                      prose-strong:text-purple-300 prose-strong:font-semibold
                      prose-li:text-white/70
                      prose-code:text-pink-300 prose-code:bg-pink-500/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                      prose-blockquote:border-l-purple-500 prose-blockquote:bg-purple-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-white/80
                      ${isSimpleMode ? "text-lg font-dyslexic tracking-wide leading-loose" : ""}`}>
                      <ReactMarkdown
                        rehypePlugins={[rehypeRaw]}
                        allowedElements={MARKDOWN_ALLOWED_ELEMENTS}
                        components={MARKDOWN_COMPONENTS}
                      >
                        {normalizeMd(summaryContent || (isSimpleMode ? "Simple summary not available." : "No content available"))}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === "chat" && (
              <PDFChat docId={docId} title={document.meta.title || "Document"} />
            )}

            {activeTab === "flashcards" && (
              <div className="flex-1 overflow-hidden bg-transparent">
                <StudyFlashcards
                  materialId={material?._id}
                  autoContent={transcriptText}
                  title={document.meta.title}
                />
              </div>
            )}

            {activeTab === "quizzes" && (
              <div className="flex-1 overflow-hidden bg-transparent">
                <StudyQuizzes
                  materialId={material?._id}
                  autoContent={transcriptText}
                  title={document.meta.title}
                />
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex-1 overflow-hidden bg-transparent">
                <StudyNotes
                  content={document.summary?.detailed || transcriptText}
                  title={document.meta.title}
                />
              </div>
            )}

            {activeTab === "mindmap" && (
              <div className="flex-1 overflow-hidden bg-transparent">
                <StudyConceptMap
                  title={document.meta.title}
                  autoContent={transcriptText}
                  materialId={material?._id}
                />
              </div>
            )}

            {activeTab === "gaps" && (
              <div className="flex-1 overflow-y-auto p-6 bg-transparent">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Knowledge Gap Analysis</h2>
                  <p className="text-white/50">Identify weak areas and generate targeted study guides.</p>
                </div>
                <KnowledgeGapDashboard materialId={material?._id} />
              </div>
            )}

            {activeTab === "diagrams" && (
              <div className="flex-1 overflow-hidden bg-transparent">
                <ImageOcclusionTool materialId={material?._id} />
              </div>
            )}
          </section>

          {/* Right Pane - Contextual AI Panel */}
          <section className="hidden lg:flex flex-col overflow-hidden bg-white/[0.01] backdrop-blur-sm border-l border-white/5">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h3 className="text-white font-semibold text-sm mb-1 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                Study Assistant
              </h3>
              <p className="text-xs text-white/40">Ask questions about this material</p>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFChat docId={docId} title={document.meta.title || "Document"} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}