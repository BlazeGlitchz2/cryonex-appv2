import { useParams } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, FileText, MessageSquare, Brain, ListChecks, StickyNote } from "lucide-react";
import { useNavigate } from "react-router";
import { PDFChat } from "@/components/study/PDFChat";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import rehypeRaw from "rehype-raw";
import { StudyFlashcards } from "@/components/study/StudyFlashcards";
import { StudyQuizzes } from "@/components/study/StudyQuizzes";
import { StudyNotes } from "@/components/study/StudyNotes";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function StudyWorkspace() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get("tab");

  const document = useQuery(
    api.studyQuery.getDocument,
    docId ? { docId } : "skip"
  ) as any;

  const [activeTab, setActiveTab] = useState<string>(
    tabParam === "flashcards" ? "flashcards" :
      tabParam === "quizzes" ? "quizzes" :
        tabParam === "notes" ? "notes" :
          "document"
  );

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

  return (
    <div className="h-full flex flex-col relative overflow-hidden bg-background/50 backdrop-blur-sm">
      {/* Top Bar */}
      <header className="h-16 border-b border-border bg-background/50 backdrop-blur-xl px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/study/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-foreground font-semibold text-lg">{document.meta.title || "Untitled Document"}</h1>
            <p className="text-xs text-muted-foreground">
              Last updated {new Date(document._creationTime).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      {/* Main Content - Split Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Tab Navigation */}
        <aside className="w-16 bg-background/30 border-r border-border flex flex-col items-center py-4 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("document")}
            className={`w-12 h-12 p-0 ${activeTab === "document" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Document"
          >
            <FileText className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("chat")}
            className={`w-12 h-12 p-0 ${activeTab === "chat" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Study Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("flashcards")}
            className={`w-12 h-12 p-0 ${activeTab === "flashcards" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Flashcards"
          >
            <Brain className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("quizzes")}
            className={`w-12 h-12 p-0 ${activeTab === "quizzes" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Quizzes"
          >
            <ListChecks className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("notes")}
            className={`w-12 h-12 p-0 ${activeTab === "notes" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
            title="Notes"
          >
            <StickyNote className="w-5 h-5" />
          </Button>
        </aside>

        {/* Main Content Area - Split Pane */}
        <div className="flex-1 grid grid-cols-2 gap-0 overflow-hidden">
          {/* Left Pane - Document Viewer */}
          <section className="bg-background/20 flex flex-col overflow-hidden border-r border-border">
            {activeTab === "document" && (
              <>
                <div className="p-4 border-b border-border">
                  <h3 className="text-foreground font-semibold text-sm mb-2">Document Viewer</h3>
                  <p className="text-xs text-muted-foreground">View and navigate your study material</p>
                </div>
                <ScrollArea className="flex-1 p-6">
                  <div className="prose prose-invert max-w-none text-foreground [&_h1]:text-foreground [&_h2]:text-foreground [&_h3]:text-foreground [&_p]:text-muted-foreground [&_li]:text-muted-foreground">
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
          <section className="bg-background/20 flex flex-col overflow-hidden">
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