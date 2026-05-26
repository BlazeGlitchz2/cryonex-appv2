import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { getSafeExternalUrl } from "@/lib/safe-url";
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
  density?: "comfortable" | "compact";
}

export const StudyMaterialViewer: React.FC<StudyMaterialViewerProps> = ({
  content,
  isRTL,
  className,
  density = "comfortable",
}) => {
  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";
  const isCompact = density === "compact";
  
  const detectedRTL = React.useMemo(() => {
    if (hasArabic(content)) return true;
    if (isRTL && !/[A-Za-z]/.test(content)) return true;
    return false;
  }, [content, isRTL]);

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
        "min-w-0 w-full break-words transition-colors duration-300 [overflow-wrap:anywhere]",
        isCompact ? "pb-6" : "pb-20",
        isArabicContent ? "font-arabic" : "font-sans",
        className
      )}
    >
      <div className={cn(
        "prose w-full max-w-none",
        isLight ? "text-slate-800" : "text-slate-200"
      )}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ children }) => (
              <h1
                className={cn(
                  isCompact
                    ? "mb-4 text-2xl font-black tracking-tight md:text-3xl"
                    : "mb-6 text-3xl font-black tracking-tight md:text-4xl",
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
                  isCompact ? "mt-7 mb-4 border-b pb-2 font-black tracking-tight" : "mt-10 mb-5 border-b pb-3 font-black tracking-tight",
                  isPartHeader
                    ? isCompact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"
                    : isCompact ? "text-xl md:text-2xl" : "text-[1.75rem] md:text-[2rem]",
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
                isCompact ? "mt-5 text-lg font-extrabold md:text-xl" : "mt-7 text-xl font-extrabold md:text-2xl",
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
                    isCompact ? "my-4 flex gap-3 rounded-lg border p-4 transition-colors" : "my-6 flex gap-4 rounded-[24px] border p-5 transition-colors",
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
                      "w-full",
                      isCompact ? "text-sm leading-7" : "text-[1.02rem] leading-[1.9] md:text-[1.08rem]",
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
                  isCompact
                    ? "my-3 max-w-none text-sm leading-7"
                    : "my-4 max-w-[74ch] text-[1.05rem] leading-[1.95]",
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
                <ul className={cn("list-none ps-0", isCompact ? "my-4 space-y-2" : "my-6 space-y-3")}>
                  {childrenArray}
                </ul>
              );
            },
            ol: ({ children }) => {
              const childrenArray = React.Children.toArray(children);
              return (
                <ol className={cn("ps-0", isCompact ? "my-4 space-y-2" : "my-6 space-y-3")}>
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
                  "relative",
                  detectedRTL
                    ? isCompact
                      ? "pr-8 text-sm leading-7"
                      : "pr-10 text-[1.02rem] leading-[1.85]"
                    : isCompact
                      ? "pl-8 text-sm leading-7"
                      : "pl-10 text-[1.02rem] leading-[1.85]",
                  isLight ? "text-slate-700" : "text-slate-200"
                )}>
                  <div className={cn(
                    "absolute top-1.5 rounded-md p-1",
                    detectedRTL ? "right-1" : "left-1",
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
            a: ({ children, href }) => {
              const safeHref = getSafeExternalUrl(href);
              const linkClassName = cn(
                "break-words font-semibold underline-offset-4 hover:underline",
                isLight ? "text-cyan-700" : "text-cyan-200",
              );

              if (!safeHref) {
                return <span className={linkClassName}>{children}</span>;
              }

              return (
                <a
                  href={safeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClassName}
                >
                  {children}
                </a>
              );
            },
            pre: ({ children }) => (
              <pre
                className={cn(
                  "my-4 max-w-full overflow-x-auto rounded-lg border p-4 text-sm leading-6",
                  isLight
                    ? "border-slate-200 bg-slate-950 text-slate-50"
                    : "border-white/10 bg-black/35 text-slate-100",
                )}
              >
                {children}
              </pre>
            ),
            code: ({ children, className }) => (
              <code className={cn("break-words rounded px-1 py-0.5 text-[0.92em]", className)}>
                {children}
              </code>
            ),
            table: ({ children }) => (
              <div
                data-study-markdown-table
                className={cn(
                  "my-5 w-full overflow-x-auto rounded-lg border",
                  isLight ? "border-slate-200" : "border-white/10",
                )}
              >
                <table className="w-full min-w-[560px] border-collapse text-sm">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th
                className={cn(
                  "border-b px-3 py-2 text-start text-xs font-black uppercase tracking-[0.08em]",
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-600"
                    : "border-white/10 bg-white/[0.04] text-slate-300",
                )}
              >
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td
                className={cn(
                  "border-b px-3 py-3 align-top leading-6",
                  isLight ? "border-slate-100" : "border-white/10",
                )}
              >
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
