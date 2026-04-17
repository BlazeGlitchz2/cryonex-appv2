import React from "react";
import { motion } from "framer-motion";
import { Copy, RefreshCw, Share2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";
import {
  PremiumCodeBlock,
  PremiumImage,
  PremiumLink,
  PremiumBlockquote,
  PremiumTable,
  PremiumThead,
  PremiumTh,
  PremiumTd,
  PremiumCallout,
  PremiumImageGallery,
  PremiumMermaid,
} from "./markdown-components";
import { ImageGeneration } from "@/components/ui/ai-chat-image-generation-1";
import { useAuth } from "@/hooks/use-auth";

// Utility to detect if text contains Arabic characters
const hasArabic = (text: string) => {
  const arabicPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicPattern.test(text);
};


interface AIChatMessageProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  isRTL?: boolean;
  fullWidth?: boolean;
}

export const AIChatMessage: React.FC<AIChatMessageProps> = ({
  content,
  isStreaming = false,
  className,
  isRTL = false,
  fullWidth = false,
}) => {
  const { user } = useAuth();
  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";
  const [textSize, setTextSize] = React.useState<"sm" | "base" | "lg" | "xl">(
    "base",
  );

  // Auto-detect direction if not explicitly provided
  const detectedRTL = React.useMemo(() => {
    if (isRTL) return true;
    return hasArabic(content);
  }, [content, isRTL]);

  const isArabicContent = React.useMemo(() => hasArabic(content), [content]);


  return (
    <div
      className={cn(
        fullWidth 
          ? "flex w-full flex-col space-y-4" 
          : "inline-flex w-fit max-w-full flex-col space-y-4 md:max-w-[72ch]", 
        isLight ? "text-slate-900" : "text-white",
        className
      )}
      dir={detectedRTL ? "rtl" : "ltr"}

    >
      <div
        className={cn(
          "relative group max-w-full rounded-2xl p-2 md:p-4 transition-colors",
          fullWidth ? "w-full" : "w-fit",
          "break-words overflow-hidden",
          isLight
            ? "bg-transparent"
            : "bg-[linear-gradient(180deg,rgba(5,10,20,0.35),rgba(5,10,20,0.2))]"
        )}
      >
        {/* Text Size Control - Always Visible on mobile, Hover on desktop */}
        <div className={cn(
          "absolute -top-3 right-0 z-10 transition-opacity duration-300",
          "opacity-100 md:opacity-0 md:group-hover:opacity-100"
        )}>
          <div className={cn(
            "flex items-center gap-1 p-1 rounded-full backdrop-blur-xl shadow-lg",
            isLight
              ? "bg-white/90 border border-slate-200 text-slate-900"
              : "bg-black/60 border border-white/10 text-white"
          )}>
            <button
              onClick={() =>
                setTextSize((prev) =>
                  prev === "base" ? "lg" : prev === "lg" ? "xl" : "base",
                )
              }
              className={cn(
                "flex items-center justify-center w-8 h-8 md:w-6 md:h-6 rounded-full text-[10px] font-mono transition-all border border-transparent touch-feedback",
                isLight
                  ? "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:border-slate-300"
                  : "bg-white/5 hover:bg-cyan-500/20 text-cyan-400 hover:border-cyan-500/30",
              )}
              title="Toggle Text Size"
            >
              <span className="font-bold">A</span>
              <span className="text-[7px] ml-0.5">
                {textSize === "base" ? "+" : textSize === "lg" ? "++" : "STD"}
              </span>
            </button>
          </div>
        </div>
        <div
          className={cn(
            "prose max-w-none w-full",
            isLight
              ? [
                  "prose-slate",
                  "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900",
                  "prose-p:text-[1rem] md:prose-p:text-[1.05rem] prose-p:text-slate-700 prose-p:leading-8 md:prose-p:leading-[2.2] prose-p:tracking-wide",
                  "prose-strong:text-slate-900 prose-strong:font-bold",
                  "prose-em:text-sky-700 prose-em:italic",
                  "prose-ul:my-5 prose-ul:list-none prose-ul:pl-0 space-y-3",
                  "prose-li:relative prose-li:pl-7 prose-li:my-3 prose-li:text-slate-700 prose-li:leading-relaxed prose-li:text-[0.98rem] md:prose-li:text-[1.05rem]",
                  "prose-li:before:absolute prose-li:before:left-1.5 prose-li:before:top-[0.65em] prose-li:before:h-1.5 prose-li:before:w-1.5 prose-li:before:rounded-full prose-li:before:bg-sky-500/75",
                  "prose-hr:border-slate-200 prose-hr:my-10",
                  "prose-blockquote:border-l-4 prose-blockquote:border-sky-200 prose-blockquote:bg-sky-50/80 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-700",
                ].join(" ")
              : [
                  "prose-slate dark:prose-invert",
                  "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-50",
                  "prose-p:text-[1rem] md:prose-p:text-[1.05rem] prose-p:text-slate-200 prose-p:leading-8 md:prose-p:leading-[2.2] prose-p:tracking-wide",
                  "prose-strong:text-white prose-strong:font-bold",
                  "prose-em:text-cyan-200/80 prose-em:italic",
                  "prose-ul:my-5 prose-ul:list-none prose-ul:pl-0 space-y-3",
                  "prose-li:relative prose-li:pl-7 prose-li:my-3 prose-li:text-slate-200 prose-li:leading-relaxed prose-li:text-[0.98rem] md:prose-li:text-[1.05rem]",
                  "prose-li:before:absolute prose-li:before:left-1.5 prose-li:before:top-[0.65em] prose-li:before:h-1.5 prose-li:before:w-1.5 prose-li:before:rounded-full prose-li:before:bg-cyan-400/80",
                  "prose-hr:border-white/10 prose-hr:my-10",
                  "prose-blockquote:border-l-4 prose-blockquote:border-cyan-500/40 prose-blockquote:bg-cyan-500/5 prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-slate-200",
                ].join(" "),
            "transition-all duration-300 ease-out",
            textSize === "sm" && "prose-sm",
            textSize === "base" && "prose-base",
            textSize === "lg" && "prose-lg",
            textSize === "xl" && "prose-xl",
            isArabicContent && "font-arabic leading-[1.8] md:leading-[2.2] tracking-wide",
            "overflow-x-auto no-scrollbar max-w-full"
          )}
          style={{
            fontSize:
              textSize === "lg"
                ? "1.125rem"
                : textSize === "xl"
                  ? "1.25rem"
                  : textSize === "sm"
                    ? "0.875rem"
                    : "1rem",
            lineHeight:
              textSize === "lg"
                ? "1.75rem"
                : textSize === "xl"
                  ? "1.85rem"
                  : textSize === "sm"
                    ? "1.25rem"
                    : "1.5rem",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={{
              mark: ({ children }) => (
                <mark
                  className={cn(
                    "px-1 rounded border shadow-[0_0_10px_rgba(234,179,8,0.2)]",
                    isLight
                      ? "bg-yellow-100 text-yellow-900 border-yellow-200"
                      : "bg-yellow-500/20 text-yellow-200 border-yellow-500/30",
                  )}
                >
                  {children}
                </mark>
              ),
              code({ node, inline, className, children, ...props }: any) {
                const match = /language-(\w+)/.exec(className || "");
                const language = match ? match[1] : "";

                if (!inline && language === "mermaid") {
                  return (
                    <PremiumMermaid
                      chart={String(children).replace(/\n$/, "")}
                    />
                  );
                }

                return !inline && match ? (
                  <PremiumCodeBlock language={language}>
                    {String(children).replace(/\n$/, "")}
                  </PremiumCodeBlock>
                ) : (
                  <code
                    className={cn(
                      "rounded-md border px-1.5 py-0.5 font-mono text-sm",
                      isLight
                        ? "border-slate-200 bg-slate-100 text-slate-800"
                        : "border-white/8 bg-white/8 text-[#bdd7ff]",
                    )}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              img: ({ src, alt }) => <PremiumImage src={src} alt={alt} />,
              a: ({ href, children }) => (
                <PremiumLink href={href}>{children}</PremiumLink>
              ),
              blockquote: ({ children }) => {
                const childrenArray = React.Children.toArray(children);
                const firstChild = childrenArray[0];

                if (
                  React.isValidElement(firstChild) &&
                  (firstChild.props as any).node?.tagName === "p"
                ) {
                  const text = (firstChild.props as any).children[0];
                  if (typeof text === "string") {
                    if (text.startsWith("[!INFO]"))
                      return (
                        <PremiumCallout type="info">{children}</PremiumCallout>
                      );
                    if (text.startsWith("[!WARNING]"))
                      return (
                        <PremiumCallout type="warning">
                          {children}
                        </PremiumCallout>
                      );
                    if (text.startsWith("[!DANGER]"))
                      return (
                        <PremiumCallout type="danger">
                          {children}
                        </PremiumCallout>
                      );
                    if (text.startsWith("[!TIP]"))
                      return (
                        <PremiumCallout type="tip">{children}</PremiumCallout>
                      );
                  }
                }
                return <PremiumBlockquote>{children}</PremiumBlockquote>;
              },
              p: ({ children }) => {
                const childrenArray = React.Children.toArray(children);
                // Phase 6: Strict PDF Ingestion Citation Parser
                // We map over text nodes to find citations and render them as badges.
                const parseCitations = (child: React.ReactNode): React.ReactNode => {
                  if (typeof child === 'string') {
                    // Match [Page X] or [Page X, Paragraph Y] or [pg. X]
                    const citationRegex = /\[(?:Page|Pg\.?)\s*(\d+)(?:,\s*(?:Paragraph|Para\.?)\s*(\d+))?\]/gi;
                    const parts = [];
                    let lastIndex = 0;
                    let match;

                    while ((match = citationRegex.exec(child)) !== null) {
                      // Push preceding text
                      if (match.index > lastIndex) {
                        parts.push(child.substring(lastIndex, match.index));
                      }

                      // Push the citation badge
                      const page = match[1];
                      const paragraph = match[2];
                      const badgeText = paragraph ? `Pg. ${page} (Para. ${paragraph})` : `Pg. ${page}`;

                      parts.push(
                        <span
                          key={`${match.index}-${page}`}
                          className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30 hover:bg-teal-500/30 hover:scale-105 transition-all cursor-pointer shadow-[0_0_10px_rgba(20,184,166,0.2)]"
                          onClick={() => {
                            // Dispatch event that the StudyWorkspace PDF viewer can listen to
                            window.dispatchEvent(new CustomEvent('cryonex-citation-click', {
                              detail: { page: parseInt(page), paragraph: paragraph ? parseInt(paragraph) : null }
                            }));
                          }}
                          title="Click to view source in Document"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-9.21l-5.42 5.42" /></svg>
                          {badgeText}
                        </span>
                      );
                      lastIndex = citationRegex.lastIndex;
                    }

                    // Push remaining text
                    if (lastIndex < child.length) {
                      parts.push(child.substring(lastIndex));
                    }

                    return parts.length > 0 ? <>{parts}</> : child;
                  }
                  return child;
                };

                const parsedChildren = childrenArray.map(parseCitations);

                const images = childrenArray.filter(
                  (child) =>
                    React.isValidElement(child) &&
                    (child.type === PremiumImage ||
                      ((child.props as any) &&
                        (child.props as any).node &&
                        (child.props as any).node.tagName === "img")),
                );

                const hasOnlyImages =
                  images.length > 0 &&
                  images.length ===
                  childrenArray.filter(
                    (c) => typeof c !== "string" || c.trim() !== "",
                  ).length;

                if (hasOnlyImages && images.length > 1) {
                  const imageProps = images.map((img: any) => ({
                    src: img.props.src,
                    alt: img.props.alt,
                  }));
                  return <PremiumImageGallery images={imageProps} />;
                }

                  return (
                  <p
                    className={cn(
                      "mb-6 last:mb-0 break-words font-sans",
                      isArabicContent
                        ? "font-arabic leading-[1.85] md:leading-[2.1] text-[1.1rem] md:text-[1.2rem]"
                        : isLight
                          ? "leading-8 md:leading-[1.8] text-[1rem] md:text-[1.05rem] tracking-wide text-slate-700"
                          : "leading-8 md:leading-[1.8] text-[1rem] md:text-[1.05rem] tracking-wide text-slate-200"
                    )}
                  >
                    {parsedChildren}
                  </p>
                );

              },
              table: ({ children }) => <PremiumTable>{children}</PremiumTable>,
              thead: ({ children }) => <PremiumThead>{children}</PremiumThead>,
              th: ({ children }) => <PremiumTh>{children}</PremiumTh>,
              td: ({ children }) => <PremiumTd>{children}</PremiumTd>,
              ul: ({ children }) => (
                <ul className="space-y-3 my-6 list-none">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol
                  className={cn(
                    "list-decimal list-outside ml-6 space-y-4 my-6 marker:font-bold text-[0.98rem] md:text-[1.05rem] leading-relaxed md:leading-[1.8]",
                    isLight
                      ? "marker:text-sky-500 text-slate-700"
                      : "marker:text-cyan-500 text-slate-200",
                  )}
                >
                  {children}
                </ol>
              ),
              h1: ({ children }) => (
                <h1
                  className={cn(
                    "text-[1.4rem] md:text-2xl font-bold mb-6 mt-10 tracking-tight leading-snug",
                    isLight ? "text-slate-900" : "text-white",
                  )}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  className={cn(
                    "text-[1.2rem] md:text-[1.35rem] font-bold mb-4 mt-8 tracking-tight leading-snug border-b pb-2",
                    isLight
                      ? "text-slate-900 border-slate-200"
                      : "text-slate-50 border-white/5",
                  )}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  className={cn(
                    "text-[1.1rem] md:text-lg font-semibold mb-3 mt-6",
                    isLight ? "text-slate-900" : "text-cyan-50",
                  )}
                >
                  {children}
                </h3>
              ),
              hr: () => (
                <hr
                  className={cn(
                    "border-t-2 my-8 rounded-full",
                    isLight ? "border-slate-200" : "border-white/5",
                  )}
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span
              className={cn(
                "ml-1 inline-block h-[1.05em] w-[2px] animate-pulse rounded-full align-[-0.15em]",
                isLight ? "bg-slate-400" : "bg-white/65",
              )}
            />
          )}
        </div>

        {/* Action Bar - Always visible on mobile, hover on desktop */}
        {!isStreaming && (
          <div className="absolute -bottom-8 left-0 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            <button
              className={cn(
                "p-2 md:p-1.5 rounded-md transition-colors touch-target",
                isLight
                  ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5",
              )}
              title="Copy"
            >
              <Copy className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
            <button
              className={cn(
                "p-2 md:p-1.5 rounded-md transition-colors touch-target",
                isLight
                  ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5",
              )}
              title="Regenerate"
            >
              <RefreshCw className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
            <button
              className={cn(
                "p-2 md:p-1.5 rounded-md transition-colors touch-target",
                isLight
                  ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5",
              )}
              title="Share"
            >
              <Share2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
