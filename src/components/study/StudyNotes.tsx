import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Sparkles, Edit, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";

interface StudyNotesProps {
  autoContent?: string;
}

export function StudyNotes({ autoContent }: StudyNotesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedNote, setSelectedNote] = useState<any>(null);

  // Mock data for rework
  const notes: any[] = [];
  const handleCreateNote = async () => { toast.info("Creation disabled during rework"); };

  // const generateNotes = useAction(api.studyAI.generateNotes);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // await generateNotes();
      toast.info("AI notes generation is currently disabled.");
    } catch (error) {
      toast.error("Failed to generate notes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
        toast.info("AI enhancement is currently disabled.");
    } finally {
        setIsEnhancing(false);
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-80 border-r border-[#1a1a1a] flex flex-col">
        <div className="p-4 border-b border-[#1a1a1a]">
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-white text-black hover:bg-white/90">
                <Plus className="h-4 w-4 mr-2" />
                New Note
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0a0a0a] border-[#1a1a1a] max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Study Note</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter note title"
                    className="bg-[#1a1a1a] border-[#2a2a2a] text-white"
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your notes or paste content to generate AI notes"
                    className="w-full h-48 bg-[#1a1a1a] border border-[#2a2a2a] rounded-md p-2 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isLoading ? "Generating..." : "AI Generate"}
                  </Button>
                  <Button onClick={handleCreateNote} className="flex-1 bg-white text-black hover:bg-white/90">
                    Create Note
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {notes?.map((note) => (
              <Card
                key={note._id}
                className={`bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors cursor-pointer ${
                  selectedNote?._id === note._id ? "border-white" : ""
                }`}
                onClick={() => setSelectedNote(note)}
              >
                <CardContent className="p-3">
                  <h3 className="font-medium text-white text-sm truncate">{note.title}</h3>
                  <p className="text-xs text-[#6b6b6b] mt-1">
                    {new Date(note._creationTime).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{selectedNote.title}</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown>{selectedNote.content}</ReactMarkdown>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">No note selected</h3>
              <p className="text-sm text-[#6b6b6b]">Select a note to view or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}