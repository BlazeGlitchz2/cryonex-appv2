import React from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { BookOpenText, Copy, Sparkles } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/viral/ShareButton";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";

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
  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";

  if (content) {
    return (
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-[24px] border",
          isLight
            ? "border-slate-200 bg-white"
            : "border-white/10 bg-[#0d1117]",
        )}
      >
        <div
          className={cn(
            "flex items-start justify-between gap-4 border-b px-5 py-5",
            isLight
              ? "border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)]"
              : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018))]",
          )}
        >

          <div>
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                isLight
                  ? "border-sky-100 bg-sky-50 text-sky-700"
                  : "border-sky-400/20 bg-sky-400/10 text-sky-200",
              )}
            >
              <BookOpenText className="h-3.5 w-3.5" />
              Notebook Notes
            </div>
            <h2 className={cn("mt-3 text-lg font-semibold tracking-tight", isLight ? "text-slate-950" : "text-white")}>
              {title || "Study Notes"}
            </h2>
            <p className={cn("mt-1 text-sm leading-6", isLight ? "text-slate-600" : "text-slate-300")}>
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
              className={cn(
                "rounded-full border",
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]",
              )}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>

        <div className="flex-1 px-5 py-5 pb-40">
          <div className="mx-auto flex max-w-4xl flex-col gap-5">
            <div
              className={cn(
                "rounded-[22px] border px-4 py-3 text-sm leading-6",
                isLight
                  ? "border-slate-200 bg-slate-50 text-slate-600"
                  : "border-white/10 bg-white/[0.035] text-slate-300",
              )}
            >
              <span className={cn("inline-flex items-center gap-2 font-medium", isLight ? "text-slate-700" : "text-slate-100")}>
                <Sparkles className="h-4 w-4 text-sky-600" />
                Notebook tip
              </span>
              <p className="mt-2">
                Keep this page for synthesis and revision. Use the copilot rail for questions,
                then bring strong answers back here.
              </p>
            </div>

            <div 
              className={cn(
                "rounded-[24px] border px-5 py-5",
                isLight
                  ? "border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
                  : "border-white/10 bg-white/[0.025]",
              )}
              dir={detectedRTL ? "rtl" : "ltr"}
              style={{ unicodeBidi: "plaintext", textAlign: "start" }}
            >
              <div
                className={cn(
                  "prose max-w-none",
                  isLight
                    ? "prose-headings:text-slate-950 prose-p:text-slate-700 prose-strong:text-slate-900 prose-a:text-sky-700 prose-code:text-slate-900"
                    : "prose-headings:text-white prose-p:text-slate-300 prose-strong:text-white prose-a:text-sky-300 prose-code:text-slate-100",
                )}
              >
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
                          rel="noopener noreferrer"
                          className={cn(
                            "group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs no-underline transition-colors",
                            isLight
                              ? "border-sky-100 bg-sky-50 hover:bg-sky-100"
                              : "border-sky-400/20 bg-sky-400/10 hover:bg-sky-400/15",
                          )}
                          {...props}
                        >
                          <span className={cn("text-[10px] uppercase tracking-[0.18em]", isLight ? "text-sky-500" : "text-sky-300")}>
                            {domain}
                          </span>
                          <span className={isLight ? "text-sky-700" : "text-sky-200"}>{props.children}</span>
                        </a>
                      );
                    },
                    blockquote: (props: any) => (
                      <blockquote
                        className={cn(
                          "rounded-r-2xl border-l-4 px-4 py-2 italic",
                          isLight
                            ? "border-sky-300 bg-sky-50/70 text-slate-700"
                            : "border-sky-400/60 bg-sky-400/10 text-slate-200",
                        )}
                      >
                        {props.children}
                      </blockquote>
                    ),
                    h1: (props: any) => (
                      <h1
                        className={cn(
                          "mb-4 mt-8 border-b pb-2 text-2xl font-semibold tracking-tight",
                          isLight ? "border-slate-200 text-slate-950" : "border-white/10 text-white",
                        )}
                        {...props}
                      />
                    ),
                    h2: (props: any) => (
                      <h2
                        className={cn("mb-3 mt-7 text-xl font-semibold tracking-tight", isLight ? "text-slate-900" : "text-slate-100")}
                        {...props}
                      />
                    ),
                    ul: (props: any) => (
                      <ul className={cn("my-4 ml-6 list-disc space-y-2", isLight ? "text-slate-700" : "text-slate-300")} {...props} />
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
    <div
      className={cn(
        "flex h-full items-center justify-center rounded-[24px] border border-dashed px-6",
        isLight
          ? "border-slate-200 bg-slate-50"
          : "border-white/10 bg-white/[0.03]",
      )}
    >
      <div className="text-center">
        <Sparkles className="mx-auto mb-4 h-12 w-12 text-sky-400/70" />
        <h3 className={cn("text-lg font-semibold", isLight ? "text-slate-900" : "text-white")}>No notebook notes yet</h3>
        <p className={cn("mx-auto mt-2 max-w-sm text-sm leading-6", isLight ? "text-slate-600" : "text-slate-300")}>
          Upload a document or ask the copilot to help you turn the source into review notes.
        </p>
      </div>
    </div>
  );
}
