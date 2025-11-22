import { useParams } from "react-router";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, FileText, MessageSquare, Brain, ListChecks, StickyNote, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { PDFChat } from "@/components/study/PDFChat";
import ReactMarkdown from "react-markdown";
import { useState } from "react";
import rehypeRaw from "rehype-raw";
import { StudyFlashcards } from "@/components/study/StudyFlashcards";
import { StudyQuizzes } from "@/components/study/StudyQuizzes";
import { StudyNotes } from "@/components/study/StudyNotes";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

export default function StudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get("tab");

  const document = useQuery(
    api.studyQuery.getDocument,
    docId ? { docId } : "skip"
  ) as any;
  
  const material = useQuery(api.study.getMaterialByDocId, docId ? { docId } : "skip");
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);
  const [isGenerating, setIsGenerating] = useState(false);

  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "flashcards" ? "flashcards" :
      tabParam === "quizzes" ? "quizzes" :
        tabParam === "notes" ? "notes" :
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
            title: document.meta.title
        });
        toast.success("Summary and study assets generated!");
    } catch (error) {
        toast.error("Failed to generate summary");
        console.error(error);
    } finally {
        setIsGenerating(false);
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
    </>
  );

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-background/50 backdrop-blur-sm">
      {/* Top Bar */}
      <header className="h-16 border-b border-border bg-background/50 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/study/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Back</span>
          </Button>
          <div className="overflow-hidden">
            <h1 className="text-foreground font-semibold text-lg truncate max-w-[200px] md:max-w-md">{document.meta.title || "Untitled Document"}</h1>
            <p className="text-xs text-muted-foreground hidden md:block">
              Last updated {new Date(document._creationTime).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Share2 className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Share</span>
          </Button>
        </div>
      </header>

      {/* Mobile Navigation Tabs */}
      <div className="lg:hidden border-b border-border bg-background/30 flex items-center overflow-x-auto p-1 gap-1 scrollbar-hide">
        <NavButtons mobile={true} />
      </div>

      {/* Main Content - Split Pane Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar - Desktop Tab Navigation */}
        <aside className="hidden lg:flex w-16 bg-background/30 border-r border-border flex-col items-center py-4 gap-2">
          <NavButtons />
        </aside>

        {/* Main Content Area - Responsive Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden">
          {/* Left Pane - Document Viewer / Active Tab Content */}
          <section className="bg-background/20 flex flex-col overflow-hidden border-r border-border">
            {activeTab === "summary" && (
              <>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="text-foreground font-semibold text-sm mb-1">AI Summary</h3>
                    <p className="text-xs text-muted-foreground">Key concepts and summary</p>
                  </div>
                  {material && !document.summary?.detailed && (
                      <Button size="sm" onClick={handleGenerateSummary} disabled={isGenerating}>
                        {isGenerating ? "Generating..." : (
                            <>
                                <Sparkles className="h-3 w-3 mr-2" />
                                Generate
                            </>
                        )}
                      </Button>
                  )}
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="prose prose-invert max-w-none text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      allowedElements={MARKDOWN_ALLOWED_ELEMENTS}
                      components={MARKDOWN_COMPONENTS}
                    >
                      {normalizeMd(document.summary?.detailed || transcriptText || "No content available")}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </>
            )}

            {activeTab === "chat" && (
              <PDFChat docId={docId} title={document.meta.title || "Document"} />
            )}

            {activeTab === "flashcards" && (
              <div className="flex-1 overflow-hidden">
                <StudyFlashcards 
                    materialId={material?._id}
                    autoContent={transcriptText} 
                    title={document.meta.title}
                />
              </div>
            )}

            {activeTab === "quizzes" && (
              <div className="flex-1 overflow-hidden">
                <StudyQuizzes 
                    materialId={material?._id}
                    autoContent={transcriptText}
                    title={document.meta.title}
                />
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex-1 overflow-hidden">
                <StudyNotes />
              </div>
            )}
          </section>

          {/* Right Pane - Contextual AI Panel (Hidden on mobile to avoid clutter, available via 'Chat' tab) */}
          <section className="hidden lg:flex bg-background/20 flex-col overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-foreground font-semibold text-sm mb-2">Ask about this material</h3>
              <p className="text-xs text-muted-foreground">Type '@' to reference specific sections</p>
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