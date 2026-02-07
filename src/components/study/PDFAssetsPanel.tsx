import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Brain,
  ClipboardList,
  Download,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";

interface PDFAssetsPanelProps {
  summary?: string;
  outline?: string;
  flashcardsCount?: number;
  quizQuestionsCount?: number;
  noteId?: string;
  isGenerating?: boolean;
}

export function PDFAssetsPanel({
  summary,
  outline,
  flashcardsCount = 0,
  quizQuestionsCount = 0,
  noteId,
  isGenerating = false,
}: PDFAssetsPanelProps) {
  return (
    <Card className="bg-[#1a1a1a] border-[#2a2a2a] h-full flex flex-col">
      <CardHeader className="border-b border-[#2a2a2a]">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Generated Assets
        </CardTitle>
      </CardHeader>

      <Tabs defaultValue="summary" className="flex-1 flex flex-col">
        <div className="border-b border-[#2a2a2a] px-4">
          <TabsList className="bg-transparent">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="outline">Outline</TabsTrigger>
            <TabsTrigger value="assets">Assets</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="summary" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            {isGenerating ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-[#6b6b6b]">Generating summary...</p>
              </div>
            ) : summary ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{summary}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-[#6b6b6b] text-sm">No summary generated yet</p>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="outline" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            {isGenerating ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-[#6b6b6b]">Generating outline...</p>
              </div>
            ) : outline ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{outline}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-[#6b6b6b] text-sm">No outline generated yet</p>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="assets" className="flex-1 m-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-3">
              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        Flashcards
                      </p>
                      <p className="text-xs text-[#6b6b6b]">
                        {flashcardsCount} cards generated
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Quiz</p>
                      <p className="text-xs text-[#6b6b6b]">
                        {quizQuestionsCount} questions generated
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {noteId && (
                <Card className="bg-[#2a2a2a] border-[#3a3a3a]">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium text-white">
                          Study Notes
                        </p>
                        <p className="text-xs text-[#6b6b6b]">
                          AI-generated notes
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
