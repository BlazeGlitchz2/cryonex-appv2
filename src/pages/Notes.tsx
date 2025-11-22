import { useParams, useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, RefreshCw, FileText, MessageSquare, Copy, HelpCircle, Folder, BarChart3, FileScan } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PDFChat } from "@/components/study/PDFChat";
import { StudyFlashcards } from "@/components/study/StudyFlashcards";
import { StudyQuizzes } from "@/components/study/StudyQuizzes";
import { TranscriptPanel } from "@/components/study/TranscriptPanel";
import { toast } from "sonner";

export default function NotesPage() {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();
  const document = useQuery(api.studyQuery.getDocument, { docId: docId || "" }) as any;
  const [notes, setNotes] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [rightTab, setRightTab] = useState<"chat" | "quizzes" | "flashcards" | "transcript">("chat");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (document?.summary?.detailed) {
      setNotes(document.summary.detailed);
    }
  }, [document]);

  const uploadedAt = document ? new Date(document._creationTime).toLocaleString() : "";

  const handleExportNotes = () => {
    if (!document) return;
    const blob = new Blob([notes], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    try {
      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${document.meta.title || "notes"}.md`;

      const docEl = typeof window !== "undefined" ? window.document : null;
      const parent = docEl?.body || docEl?.documentElement || null;
      if (parent && typeof (parent as any).appendChild === "function") {
        parent.appendChild(a);
        a.click();
        try {
          parent.removeChild(a);
        } catch {
          // ignore
        }
      } else {
        a.click();
      }
    } finally {
      URL.revokeObjectURL(url);
    }
    toast.success("Notes exported!");
  };

  const handleSimplifyNotes = async () => {
    if (!document) return;
    setIsSummarizing(true);
    const loading = toast.loading("Creating dyslexia‑friendly summary…");
    try {
      toast.info("AI summarization is currently disabled.");
    } catch (e: any) {
      toast.error(e.message || "Failed to summarize");
    } finally {
      toast.dismiss(loading);
      setIsSummarizing(false);
    }
  };

  const focusNotes = () => textareaRef.current?.focus();

  if (!document) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">
      {/* Top Bar */}
      <div className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/study")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold text-foreground truncate max-w-md">{document.meta.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSimplifyNotes}
            disabled={isSummarizing}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSummarizing ? "animate-spin" : ""}`} />
            Simplify for Dyslexia
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportNotes} className="text-muted-foreground hover:text-foreground">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Icon Sidebar */}
        <div className="w-14 border-r border-border bg-background/30 flex flex-col items-center gap-2 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={focusNotes} aria-label="Notes">
                <FileText className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notes</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightTab("chat")}
                className={`hover:text-foreground ${rightTab === "chat" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                aria-label="Tutor Chat"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chat / Tutor</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightTab("flashcards")}
                className={`hover:text-foreground ${rightTab === "flashcards" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                aria-label="Flashcards"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Flashcards</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightTab("quizzes")}
                className={`hover:text-foreground ${rightTab === "quizzes" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                aria-label="Quizzes"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Quizzes</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightTab("transcript")}
                className={`hover:text-foreground ${rightTab === "transcript" ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
                aria-label="Transcript"
              >
                <FileScan className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Transcript</TooltipContent>
          </Tooltip>

          <div className="mt-2 h-px w-8 bg-border" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={() => navigate("/study")} className="text-muted-foreground hover:text-foreground" aria-label="Materials">
                <Folder className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Materials</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/study/dashboard")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Analytics"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Analytics</TooltipContent>
          </Tooltip>
        </div>

        {/* Resizable Panels */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left: Metadata + Notes Editor */}
          <ResizablePanel defaultSize={60} minSize={35}>
            <div className="h-full flex flex-col overflow-hidden border-r border-border">
              <div className="h-14 border-b border-border px-4 flex items-center justify-between bg-background/30">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{document.meta.title}</p>
                  <p className="text-xs text-muted-foreground truncate">Uploaded {uploadedAt}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 bg-background/20">
                <Card className="bg-card/50 border-border mt-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-sm text-foreground">Notes</span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSimplifyNotes}
                        disabled={isSummarizing}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isSummarizing ? "animate-spin" : ""}`} />
                        Simplify Again
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleExportNotes} className="text-muted-foreground hover:text-foreground">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  <div className="p-4">
                    <textarea
                      ref={textareaRef}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full min-h-[480px] bg-transparent border border-border rounded-md p-3 text-foreground resize-y focus:outline-none focus:ring-1 focus:ring-primary font-mono text-sm leading-relaxed placeholder:text-muted-foreground/50"
                      placeholder="Your dyslexia‑friendly notes will appear here… Edit freely."
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Tip: Use the Tutor/Flashcards/Quizzes tabs to deepen understanding.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-border" />

          {/* Right: AI Workspace */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <div className="h-full flex flex-col overflow-hidden bg-background/30">
              <div className="h-14 border-b border-border flex items-center px-4">
                <Tabs value={rightTab} onValueChange={(v) => setRightTab(v as any)} className="w-full">
                  <TabsList className="bg-transparent rounded-none p-0 flex gap-2">
                    <TabsTrigger
                      value="chat"
                      className="data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground text-muted-foreground px-3 py-1.5 rounded-md border border-transparent data-[state=active]:border-border"
                    >
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      Tutor
                    </TabsTrigger>
                    <TabsTrigger
                      value="quizzes"
                      className="data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground text-muted-foreground px-3 py-1.5 rounded-md border border-transparent data-[state=active]:border-border"
                    >
                      <HelpCircle className="h-4 w-4 mr-1.5" />
                      Quizzes
                    </TabsTrigger>
                    <TabsTrigger
                      value="flashcards"
                      className="data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground text-muted-foreground px-3 py-1.5 rounded-md border border-transparent data-[state=active]:border-border"
                    >
                      <Copy className="h-4 w-4 mr-1.5" />
                      Flashcards
                    </TabsTrigger>
                    <TabsTrigger
                      value="transcript"
                      className="data-[state=active]:bg-secondary/50 data-[state=active]:text-foreground text-muted-foreground px-3 py-1.5 rounded-md border border-transparent data-[state=active]:border-border"
                    >
                      <FileScan className="h-4 w-4 mr-1.5" />
                      Transcript
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chat" className="flex-1 overflow-hidden m-0 mt-2">
                    <div className="h-full flex flex-col overflow-hidden">
                      <PDFChat docId={document.docId} title={document.meta.title} />
                    </div>
                  </TabsContent>

                  <TabsContent value="quizzes" className="flex-1 overflow-hidden m-0 mt-2">
                    <StudyQuizzes />
                  </TabsContent>

                  <TabsContent value="flashcards" className="flex-1 overflow-hidden m-0 mt-2">
                    <StudyFlashcards />
                  </TabsContent>

                  <TabsContent value="transcript" className="flex-1 overflow-hidden m-0 mt-2">
                    <TranscriptPanel text={document.extracted?.text || ""} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}