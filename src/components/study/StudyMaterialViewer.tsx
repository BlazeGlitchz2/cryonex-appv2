import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";
import {
  Brain,
  CheckCircle2,
  Lightbulb,
  MapPin,
} from "lucide-react";

// Utility to detect if text contains Arabic characters
const hasArabic = (text: string) => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};

interface StudyMaterialViewerProps {
  content: string;
  isRTL?: boolean;
  className?: string;
}

export const StudyMaterialViewer: React.FC<StudyMaterialViewerProps> = ({
  content,
  isRTL,
  className,
}) => {
  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";
  
  const detectedRTL = React.useMemo(() => {
    // Priority 1: Content-based detection (if it has Arabic, it MUST be RTL)
    if (hasArabic(content)) return true;
    
    // Priority 2: If we are here, content is likely LTR. 
    // We explicitly return false for English/LTR content even if the user is RTL globally,
    // as English text renders incorrectly in an RTL-dir container (punctuation, alignment).
    return false;
  }, [content]);

  const isArabicContent = React.useMemo(() => hasArabic(content), [content]);

  const getCalloutStyle = React.useCallback(
    (text: string) => {
      const normalized = text.toLowerCase();

      if (
        normalized.includes("key idea") ||
        normalized.includes("big picture") ||
        normalized.includes("main point")
      ) {
        return {
          accent: isLight ? "text-sky-700" : "text-cyan-300",
          bg: isLight ? "bg-sky-50 border-sky-200" : "bg-cyan-500/8 border-cyan-500/20",
          icon: <Lightbulb className="h-5 w-5 shrink-0" />,
        };
      }

      if (
        normalized.includes("remember") ||
        normalized.includes("definition") ||
        normalized.includes("term")
      ) {
        return {
          accent: isLight ? "text-violet-700" : "text-violet-300",
          bg: isLight ? "bg-violet-50 border-violet-200" : "bg-violet-500/8 border-violet-500/20",
          icon: <Brain className="h-5 w-5 shrink-0" />,
        };
      }

      if (
        normalized.includes("next step") ||
        normalized.includes("what to do next") ||
        normalized.includes("practice")
      ) {
        return {
          accent: isLight ? "text-emerald-700" : "text-emerald-300",
          bg: isLight ? "bg-emerald-50 border-emerald-200" : "bg-emerald-500/8 border-emerald-500/20",
          icon: <CheckCircle2 className="h-5 w-5 shrink-0" />,
        };
      }

      return null;
    },
    [isLight],
  );

  return (
    <div
      dir={detectedRTL ? "rtl" : "ltr"}
      style={{ unicodeBidi: "plaintext", textAlign: "start" }}
      className={cn(
        "w-full transition-colors duration-300 pb-20",
        isArabicContent ? "font-arabic" : "font-sans",
        className
      )}
    >
      <div className={cn(
        "prose max-w-none w-full",
        isLight ? "text-slate-800" : "text-slate-200"
      )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1
                className={cn(
                  "mb-6 text-3xl font-black tracking-tight md:text-4xl",
                  isLight ? "text-slate-950" : "text-white",
                )}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => {
              const textStr = String(children);
              const isPartHeader =
                textStr.includes("⚡ PART") || textStr.includes("PART ");
              
              return (
                <h2 className={cn(
                  "mt-10 mb-5 border-b pb-3 font-black tracking-tight",
                  isPartHeader
                    ? "text-3xl md:text-4xl"
                    : "text-[1.75rem] md:text-[2rem]",
                  isLight 
                    ? isPartHeader
                      ? "border-sky-200 text-slate-950"
                      : "border-slate-200 text-slate-900"
                    : isPartHeader
                      ? "border-cyan-500/20 text-white"
                      : "border-white/10 text-white",
                )}>
                  {children}
                </h2>
              );
            },
            h3: ({ children }) => (
              <h3 className={cn(
                "mt-7 text-xl font-extrabold md:text-2xl",
                isLight ? "text-slate-800" : "text-slate-100"
              )}>
                {children}
              </h3>
            ),
            p: ({ children }) => {
              const childrenArray = React.Children.toArray(children);
              const textPreview = childrenArray
                .map((child) =>
                  typeof child === "string"
                    ? child
                    : React.isValidElement(child)
                      ? String((child.props as any)?.children || "")
                      : "",
                )
                .join(" ")
                .replace(/[📖🧠💡🔗]/g, "")
                .trim();
              const callout = getCalloutStyle(textPreview);

              if (callout) {
                return (
                  <div className={cn(
                    "my-6 flex gap-4 rounded-[24px] border p-5 transition-colors",
                    callout.bg,
                  )}>
                    <div className={cn(
                      "mt-0.5 flex-shrink-0 rounded-xl border p-2.5",
                      isLight ? "border-white bg-white/80" : "border-white/5 bg-black/25",
                      callout.accent,
                    )}>
                      {callout.icon}
                    </div>
                    <div className={cn(
                      "w-full text-[1.02rem] leading-[1.9] md:text-[1.08rem]",
                      isArabicContent ? "font-arabic leading-[2.1]" : "font-sans",
                      isLight ? "text-slate-700" : "text-slate-200",
                    )}>
                      {children}
                    </div>
                  </div>
                );
              }

              return (
                <p className={cn(
                  "my-4 max-w-[74ch] text-[1.05rem] leading-[1.95]",
                  isArabicContent && "leading-[2.2] text-[1.12rem]",
                  isLight ? "font-medium text-slate-700" : "font-normal text-slate-300",
                )}>
                  {children}
                </p>
              );
            },
            strong: ({ children }) => (
              <strong className={cn(
                "font-bold",
                isLight ? "text-slate-900" : "text-white"
              )}>
                {children}
              </strong>
            ),
            ul: ({ children }) => {
              const childrenArray = React.Children.toArray(children);
              return (
                <ul className="my-6 space-y-3 list-none pl-0">
                  {childrenArray}
                </ul>
              );
            },
            ol: ({ children }) => {
              const childrenArray = React.Children.toArray(children);
              return (
                <ol className="my-6 space-y-3 pl-0">
                  {childrenArray}
                </ol>
              );
            },
            li: ({ children }) => {
              const childrenArray = React.Children.toArray(children);
              let isImportant = false;
              
              if (React.isValidElement(childrenArray[0]) || typeof childrenArray[0] === 'string') {
                const str = String(childrenArray[0] ?? "");
                if (str.includes("📌") || React.Children.toArray((childrenArray[0] as any).props?.children).some(c => String(c).includes("Important"))) {
                  isImportant = true;
                }
              }

              return (
                <li className={cn(
                  "relative pl-10 text-[1.02rem] leading-[1.85]",
                  isLight ? "text-slate-700" : "text-slate-200"
                )}>
                  <div className={cn(
                    "absolute left-1 top-1.5 p-1 rounded-md",
                    isImportant 
                      ? (isLight ? "bg-pink-100 text-pink-600" : "bg-pink-500/20 text-pink-400")
                      : (isLight ? "bg-slate-100 text-slate-500" : "bg-white/10 text-slate-400")
                  )}>
                    {isImportant ? <MapPin className="w-3.5 h-3.5" /> : <div className="w-1.5 h-1.5 m-1 rounded-full bg-current" />}
                  </div>
                  <div>
                    {children}
                  </div>
                </li>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
