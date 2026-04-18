import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";
import { BookOpen, Brain, Lightbulb, Link2, MapPin } from "lucide-react";

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
    if (isRTL !== undefined) return isRTL;
    return hasArabic(content);
  }, [content, isRTL]);

  const isArabicContent = React.useMemo(() => hasArabic(content), [content]);

  return (
    <div
      dir={detectedRTL ? "rtl" : "ltr"}
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
            h2: ({ children }) => {
              // ⚡ PART headers - Huge, bold, thick
              const textStr = String(children);
              const isPartHeader = textStr.includes("⚡ PART") || textStr.includes("PART ");
              
              return (
                <h2 className={cn(
                  "font-black tracking-tight mt-12 mb-6 pb-4 border-b-2",
                  isPartHeader ? "text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r" : "text-2xl md:text-3xl",
                  isLight 
                    ? (isPartHeader ? "from-indigo-600 to-cyan-500 border-indigo-100" : "text-slate-900 border-slate-200")
                    : (isPartHeader ? "from-indigo-400 to-cyan-300 border-indigo-500/20" : "text-white border-white/10")
                )}>
                  {children}
                </h2>
              );
            },
            h3: ({ children }) => (
              <h3 className={cn(
                "text-xl md:text-2xl font-extrabold mt-8 mb-4",
                isLight ? "text-slate-800" : "text-slate-100"
              )}>
                {children}
              </h3>
            ),
            p: ({ children }) => {
              const childrenArray = React.Children.toArray(children);
              let iconType: "definition" | "simple" | "action" | "memory" | "none" = "none";
              
              const firstStr = typeof childrenArray[0] === 'string' ? childrenArray[0] : "";
              const secondStr =
                React.isValidElement(childrenArray[1]) && 
                (childrenArray[1].props as any).children 
                  ? String((childrenArray[1].props as any).children) 
                  : "";

              // Detect emojis and keywords combined
              if (firstStr.includes("📖") || secondStr.toLowerCase().includes("book definition")) iconType = "definition";
              else if (firstStr.includes("🧠") || secondStr.toLowerCase().includes("simple version")) iconType = "simple";
              else if (firstStr.includes("💡") || secondStr.toLowerCase().includes("what it does")) iconType = "action";
              else if (firstStr.includes("🔗") || secondStr.toLowerCase().includes("simple memory")) iconType = "memory";

              if (iconType !== "none") {
                const styles = {
                  definition: {
                    bg: isLight ? "bg-blue-50 border-blue-200" : "bg-blue-950/20 border-blue-500/20",
                    accent: isLight ? "text-blue-600" : "text-blue-400",
                    shadow: isLight ? "shadow-blue-500/5" : "shadow-blue-500/5",
                    icon: <BookOpen className="w-5 h-5 shrink-0" />
                  },
                  simple: {
                    bg: isLight ? "bg-purple-50 border-purple-200" : "bg-purple-950/20 border-purple-500/20",
                    accent: isLight ? "text-purple-600" : "text-purple-400",
                    shadow: isLight ? "shadow-purple-500/5" : "shadow-purple-500/5",
                    icon: <Brain className="w-5 h-5 shrink-0" />
                  },
                  action: {
                    bg: isLight ? "bg-amber-50 border-amber-200" : "bg-amber-950/20 border-amber-500/20",
                    accent: isLight ? "text-amber-600" : "text-amber-400",
                    shadow: isLight ? "shadow-amber-500/5" : "shadow-amber-500/5",
                    icon: <Lightbulb className="w-5 h-5 shrink-0" />
                  },
                  memory: {
                    bg: isLight ? "bg-emerald-50 border-emerald-200" : "bg-emerald-950/20 border-emerald-500/20",
                    accent: isLight ? "text-emerald-600" : "text-emerald-400",
                    shadow: isLight ? "shadow-emerald-500/5" : "shadow-emerald-500/5",
                    icon: <Link2 className="w-5 h-5 shrink-0" />
                  }
                };
                
                const style = styles[iconType];

                // Remove the initial emoji so the icon takes prominence, and un-bold the intro title manually if desired, 
                // but just rendering the rich children is fine.
                // We'll replace the emoji from the first string.
                const cleanFirstStr = firstStr.replace(/[📖🧠💡🔗]/g, '').trim();

                const customChildren = [
                  cleanFirstStr ? <span key="0">{cleanFirstStr} </span> : null,
                  ...childrenArray.slice(1)
                ];

                return (
                  <div className={cn(
                    "my-5 p-5 rounded-2xl border flex gap-4 transition-all duration-300 hover:-translate-y-0.5 shadow-lg",
                    style.bg,
                    style.shadow
                  )}>
                    <div className={cn(
                      "mt-0.5 flex-shrink-0 p-2.5 rounded-xl h-fit",
                      isLight ? "bg-white/80 shadow-sm" : "bg-black/30 shadow-none border border-white/5",
                      style.accent
                    )}>
                      {style.icon}
                    </div>
                    <div className={cn(
                      "text-[1.05rem] md:text-[1.1rem] leading-[1.8] font-medium tracking-normal w-full",
                      isArabicContent ? "font-arabic leading-[2]" : "font-sans",
                      isLight ? "text-slate-700" : "text-slate-200"
                    )}>
                      {customChildren}
                    </div>
                  </div>
                );
              }

              // Standard Paragraph
              return (
                <p className={cn(
                  "my-5 text-[1.1rem] leading-[1.85] tracking-wide",
                  isArabicContent && "leading-[2.2] text-[1.2rem]",
                  isLight ? "text-slate-700 font-medium" : "text-slate-300 font-normal"
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
                <ul className="space-y-4 my-8 list-none pl-0">
                  {childrenArray}
                </ul>
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
                  "relative pl-10 text-[1.05rem] leading-[1.8]",
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
