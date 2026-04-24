import React from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { BookOpenText, Copy, Sparkles } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/viral/ShareButton";
import { Id } from "@/convex/_generated/dataModel";

interface StudyNotesProps {
  content?: string;
  title?: string;
  materialId?: Id<"studyMaterials"> | null;
}

// Utility to detect if text contains Arabic characters
const hasArabic = (text: string) => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text ?? "");
};

export function StudyNotes({ content, title, materialId }: StudyNotesProps) {
  const detectedRTL = React.useMemo(() => hasArabic(content ?? ""), [content]);

  if (content) {
    return (
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] px-5 py-5">

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">
              <BookOpenText className="h-3.5 w-3.5" />
              Notebook Notes
            </div>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
              {title || "Study Notes"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              A calmer study surface for reviewing, refining, and sharing the notebook thread.
            </p>
          </div>
          <div className="flex gap-2">
            {materialId ? (
              <ShareButton
                id={materialId}
                type="material"
                title={title || "Study Notes"}
              />
            ) : null}
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(content);
                toast.success("Notes copied to clipboard");
              }}
              className="rounded-full border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>

        <div className="flex-1 px-5 py-5 pb-40">
          <div className="mx-auto flex max-w-4xl flex-col gap-5">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
              <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                <Sparkles className="h-4 w-4 text-sky-600" />
                Notebook tip
              </span>
              <p className="mt-2">
                Keep this page for synthesis and revision. Use the copilot rail for questions,
                then bring strong answers back here.
              </p>
            </div>

            <div 
              className="rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
              dir={detectedRTL ? "rtl" : "ltr"}
              style={{ unicodeBidi: "plaintext", textAlign: "start" }}
            >
              <div className="prose max-w-none prose-headings:text-slate-950 prose-p:text-slate-700 prose-strong:text-slate-900 prose-a:text-sky-700 prose-code:text-slate-900">
                <ReactMarkdown
                  components={{
                    a: (props: any) => {
                      const url = props.href || "";
                      let domain = "";
                      try {
                        domain = new URL(url).hostname.replace("www.", "");
                      } catch {
                        domain = "Source";
                      }

                      return (
                        <a
                          target="_blank"
                          rel="noreferrer"
                          className="group inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs no-underline transition-colors hover:bg-sky-100"
                          {...props}
                        >
                          <span className="text-[10px] uppercase tracking-[0.18em] text-sky-500">
                            {domain}
                          </span>
                          <span className="text-sky-700">{props.children}</span>
                        </a>
                      );
                    },
                    blockquote: (props: any) => (
                      <blockquote className="rounded-r-2xl border-l-4 border-sky-300 bg-sky-50/70 px-4 py-2 italic text-slate-700">
                        {props.children}
                      </blockquote>
                    ),
                    h1: (props: any) => (
                      <h1
                        className="mb-4 mt-8 border-b border-slate-200 pb-2 text-2xl font-semibold tracking-tight text-slate-950"
                        {...props}
                      />
                    ),
                    h2: (props: any) => (
                      <h2
                        className="mb-3 mt-7 text-xl font-semibold tracking-tight text-slate-900"
                        {...props}
                      />
                    ),
                    ul: (props: any) => (
                      <ul className="my-4 ml-6 list-disc space-y-2 text-slate-700" {...props} />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6">
      <div className="text-center">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-sky-400/70" />
        <h3 className="text-lg font-semibold text-slate-900">No notebook notes yet</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
          Upload a document or ask the copilot to help you turn the source into review notes.
        </p>
      </div>
    </div>
  );
}
