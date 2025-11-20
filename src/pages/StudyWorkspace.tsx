import { useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, BookOpen, HelpCircle, FileText, MessageSquare, Brain, ListChecks, StickyNote, Plus } from "lucide-react";
import { useNavigate } from "react-router";
import { PDFChat } from "@/components/study/PDFChat";
import { PDFViewer } from "@/components/study/PDFViewer";
import ReactMarkdown from "react-markdown";
import { useState, useMemo, useEffect } from "react";
import rehypeRaw from "rehype-raw";
import { StudyFlashcards } from "@/components/study/StudyFlashcards";
import { StudyQuizzes } from "@/components/study/StudyQuizzes";
import { StudyNotes } from "@/components/study/StudyNotes";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MindMapGenerator } from "@/components/study/MindMapGenerator";

export default function StudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get("tab");
  
  const document = useQuery(
    api.studyQuery.getDocument,
    docId ? { docId } : "skip"
  );

  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "flashcards" ? "flashcards" : 
    tabParam === "quizzes" ? "quizzes" : 
    tabParam === "notes" ? "notes" :
    "document"
  );

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Sync with global theme
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark' || !savedTheme;
    setIsDarkMode(isDark);
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDark = window.document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    });
    
    observer.observe(window.document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const transcriptText =
    document?.extracted?.text ||
    ((document?.extracted?.sections as any[] | undefined)?.map((s) => s.text).join("\n\n") ?? "");

  const normalizeMd = (s: string) => (s || "").replace(/<br\s*\/?>/gi, "\n");

  const MARKDOWN_ALLOWED_ELEMENTS: Array<string> = [
    "p", "br", "strong", "em", "u", "code", "pre", "ul", "ol", "li", "a", "blockquote",
    "h1", "h2", "h3", "h4", "h5", "h6", "span",
  ];

  const MARKDOWN_COMPONENTS: any = {
    u: (props: any) => <u className="underline underline-offset-2">{props.children}</u>,
    a: (props: any) => <a target="_blank" rel="noreferrer" {...props} />,
  };

  if (!docId) {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-400 via-purple-600 to-blue-900 flex items-center justify-center">
        <p className="text-white/80">No document ID provided</p>
      </div>
    );
  }

  if (document === undefined) {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-400 via-purple-600 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent mb-4"></div>
          <p className="text-white/80">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="h-screen bg-gradient-to-br from-orange-400 via-purple-600 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/80 mb-2">Document not found</p>
          <Button
            onClick={() => navigate("/study/dashboard")}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Dynamic gradient background */}
      <div 
        className={`fixed inset-0 -z-10 transition-all duration-500 ${
          isDarkMode 
            ? "bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
            : "bg-gradient-to-br from-orange-400 via-purple-600 to-blue-900"
        }`}
      />

      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150 px-6 flex items-center justify-between shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/study/dashboard")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-white font-semibold text-lg">{document.meta.title || "Untitled Document"}</h1>
            <p className="text-xs text-white/60">
              Last updated {new Date(document._creationTime).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content - Split Pane Layout (Turbo.ai style) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tab Navigation */}
        <aside className="w-16 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-4 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("document")}
            className={`w-12 h-12 p-0 ${activeTab === "document" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            title="Document"
          >
            <FileText className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("chat")}
            className={`w-12 h-12 p-0 ${activeTab === "chat" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            title="Study Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("flashcards")}
            className={`w-12 h-12 p-0 ${activeTab === "flashcards" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            title="Flashcards"
          >
            <Brain className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("quizzes")}
            className={`w-12 h-12 p-0 ${activeTab === "quizzes" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            title="Quizzes"
          >
            <ListChecks className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("notes")}
            className={`w-12 h-12 p-0 ${activeTab === "notes" ? "bg-white/20 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            title="Notes"
          >
            <StickyNote className="w-5 h-5" />
          </Button>
        </aside>

        {/* Main Content Area - Split Pane */}
        <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
          {/* Left Pane - Document Viewer */}
          <section className="bg-white/5 backdrop-blur-md flex flex-col overflow-hidden border-r border-white/10">
            {activeTab === "document" && (
              <>
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-white font-semibold text-sm mb-2">Document Viewer</h3>
                  <p className="text-xs text-white/60">View and navigate your study material</p>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="prose prose-invert max-w-none [&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-3 [&_h1]:text-white [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2 [&_h2]:text-white [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:text-white [&_p]:text-sm [&_p]:text-white/90 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:space-y-1 [&_li]:text-sm [&_li]:text-white/90 [&_strong]:text-blue-300 [&_em]:text-purple-300">
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw]}
                      allowedElements={MARKDOWN_ALLOWED_ELEMENTS}
                      components={MARKDOWN_COMPONENTS}
                    >
                      {normalizeMd(transcriptText || "No content available")}
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
                <StudyFlashcards autoContent={transcriptText} />
              </div>
            )}

            {activeTab === "quizzes" && (
              <div className="flex-1 overflow-hidden">
                <StudyQuizzes autoContent={transcriptText} />
              </div>
            )}

            {activeTab === "notes" && (
              <div className="flex-1 overflow-hidden">
                <StudyNotes />
              </div>
            )}
          </section>

          {/* Right Pane - Contextual AI Panel */}
          <section className="bg-white/5 backdrop-blur-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-semibold text-sm mb-2">Ask about this material</h3>
              <p className="text-xs text-white/60">Type '@' to reference specific sections</p>
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