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
  content?: string;
  title?: string;
}

export function StudyNotes({ content, title }: StudyNotesProps) {
  const [isLoading, setIsLoading] = useState(false);

  // If content is provided (e.g. from auto-generation), display it
  if (content) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0a]">
          <div>
            <h2 className="text-lg font-semibold text-white">{title || "Study Notes"}</h2>
            <p className="text-sm text-[#6b6b6b]">AI-generated summary and key points</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(content);
              toast.success("Notes copied to clipboard");
            }}>
              Copy
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-8">
          <div className="max-w-3xl mx-auto prose prose-invert prose-headings:text-purple-400 prose-strong:text-purple-300 prose-a:text-blue-400 prose-code:text-orange-300">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="h-12 w-12 text-[#6b6b6b] mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-white mb-2">No notes available</h3>
        <p className="text-sm text-[#6b6b6b] max-w-sm mx-auto">
          Upload a document or paste text to generate AI study notes.
        </p>
      </div>
    </div>
  );
}