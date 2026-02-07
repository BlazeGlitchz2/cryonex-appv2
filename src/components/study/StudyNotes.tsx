import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Sparkles, Edit, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";

import { ShareButton } from "@/components/viral/ShareButton";
import { Id } from "@/convex/_generated/dataModel";

interface StudyNotesProps {
  content?: string;
  title?: string;
  materialId?: Id<"studyMaterials">;
}

export function StudyNotes({ content, title, materialId }: StudyNotesProps) {
  const [isLoading, setIsLoading] = useState(false);

  // If content is provided (e.g. from auto-generation), display it
  if (content) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between bg-[#0a0a0a]">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {title || "Study Notes"}
            </h2>
            <p className="text-sm text-[#6b6b6b]">
              AI-generated summary and key points
            </p>
          </div>
          <div className="flex gap-2">
            {materialId && (
              <ShareButton
                id={materialId}
                type="material"
                title={title || "Study Notes"}
              />
            )}
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast.success("Notes copied to clipboard");
              }}
            >
              Copy
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-8">
          <div className="max-w-3xl mx-auto prose prose-invert prose-headings:text-purple-400 prose-strong:text-purple-300 prose-a:text-blue-400 prose-code:text-orange-300">
            <ReactMarkdown
              components={{
                a: (props: any) => {
                  const url = props.href || "";
                  let domain = "";
                  try {
                    domain = new URL(url).hostname.replace("www.", "");
                  } catch (e) {
                    domain = "Source";
                  }
                  return (
                    <a
                      target="_blank"
                      rel="noreferrer"
                      className="group inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-purple-500/10 hover:border-purple-500/30 transition-all no-underline mx-1 align-middle"
                      {...props}
                    >
                      <span className="text-[10px] text-white/30 group-hover:text-purple-400/50">
                        {domain}
                      </span>
                      <span className="text-xs text-white/70 group-hover:text-white truncate max-w-[150px]">
                        {props.children}
                      </span>
                    </a>
                  );
                },
                blockquote: (props: any) => (
                  <blockquote className="border-l-4 border-purple-500 pl-4 py-1 my-4 bg-purple-500/5 rounded-r-lg italic text-gray-300">
                    {props.children}
                  </blockquote>
                ),
                h1: (props: any) => (
                  <h1
                    className="text-2xl font-bold text-white mt-8 mb-4 border-b border-white/10 pb-2"
                    {...props}
                  />
                ),
                h2: (props: any) => (
                  <h2
                    className="text-xl font-semibold text-purple-400 mt-6 mb-3 flex items-center gap-2"
                    {...props}
                  />
                ),
                ul: (props: any) => (
                  <ul
                    className="list-disc list-outside ml-6 space-y-2 my-4 text-gray-300"
                    {...props}
                  />
                ),
                li: (props: any) => <li className="pl-1" {...props} />,
                strong: (props: any) => (
                  <strong
                    className="text-purple-300 font-semibold"
                    {...props}
                  />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Sparkles className="h-12 w-12 text-[#6b6b6b] mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No notes available
        </h3>
        <p className="text-sm text-[#6b6b6b] max-w-sm mx-auto">
          Upload a document or paste text to generate AI study notes.
        </p>
      </div>
    </div>
  );
}
