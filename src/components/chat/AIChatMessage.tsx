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
  const [textSize, setTextSize] = React.useState<"sm" | "base" | "lg" | "xl">(
    "base",
  );

  return (
    <div
      className={cn(
        fullWidth 
          ? "flex w-full flex-col space-y-4" 
          : "inline-flex w-fit max-w-full flex-col space-y-4 md:max-w-[72ch]", 
        className
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className={cn(
          "deepshi-panel relative group max-w-full rounded-[1.4rem] border border-white/6 bg-white/[0.025] p-3 transition-colors shadow-[0_18px_60px_rgba(0,0,0,0.16)] hover:border-violet-400/20 md:-ml-2",
          fullWidth ? "w-full" : "w-fit",
          "break-words overflow-hidden"
        )}
      >
        {/* Text Size Control - Always Visible on mobile, Hover on desktop */}
        <div className={cn(
          "absolute -top-3 right-0 z-10 transition-opacity duration-300",
          "opacity-100 md:opacity-0 md:group-hover:opacity-100"
        )}>
          <div className="flex items-center gap-1 p-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg">
            <button
              onClick={() =>
                setTextSize((prev) =>
                  prev === "base" ? "lg" : prev === "lg" ? "xl" : "base",
                )
              }
              className="flex items-center justify-center w-8 h-8 md:w-6 md:h-6 rounded-full bg-white/5 hover:bg-cyan-500/20 text-[10px] font-mono text-cyan-400 transition-all border border-transparent hover:border-cyan-500/30 touch-feedback"
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
            "prose prose-slate dark:prose-invert max-w-none",
            "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-100",
            "prose-p:text-[0.95rem] md:prose-p:text-[1.02rem] prose-p:text-slate-200 prose-p:leading-7 md:prose-p:leading-8 prose-p:tracking-[0.01em]",
            "prose-strong:text-white prose-strong:font-semibold",
            "prose-em:text-[#d5c5ff] prose-em:italic",
            "prose-ul:my-4 prose-ul:list-none prose-ul:pl-0",
            "prose-li:relative prose-li:pl-6 prose-li:my-2 prose-li:text-slate-300",
            "prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[0.6em] prose-li:before:h-1.5 prose-li:before:w-1.5 prose-li:before:rounded-full prose-li:before:bg-[#6fa9ff]",
            "prose-hr:border-white/10 prose-hr:my-8",
            "prose-blockquote:border-l-2 prose-blockquote:border-[#6fa9ff]/45 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-300",
            "transition-all duration-300 ease-out",
            textSize === "sm" && "prose-sm",
            textSize === "base" && "prose-base",
            textSize === "lg" && "prose-lg",
            textSize === "xl" && "prose-xl",
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
                <mark className="bg-yellow-500/20 text-yellow-200 px-1 rounded border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
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
                    className="rounded-md border border-white/8 bg-white/8 px-1.5 py-0.5 font-mono text-sm text-[#bdd7ff]"
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

                return <p className="mb-4 last:mb-0 leading-relaxed font-sans break-words">{parsedChildren}</p>;
              },
              table: ({ children }) => <PremiumTable>{children}</PremiumTable>,
              thead: ({ children }) => <PremiumThead>{children}</PremiumThead>,
              th: ({ children }) => <PremiumTh>{children}</PremiumTh>,
              td: ({ children }) => <PremiumTd>{children}</PremiumTd>,
              ul: ({ children }) => (
                <ul className="space-y-2 my-4">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside ml-5 space-y-2 my-4 marker:text-slate-500">
                  {children}
                </ol>
              ),
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-white mb-4 mt-6">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-white mb-3 mt-6">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-medium text-cyan-100 mb-2 mt-4">
                  {children}
                </h3>
              ),
              hr: () => <hr className="border-t border-white/10 my-6" />,
            }}
          >
            {content}
          </ReactMarkdown>
          {isStreaming && (
            <span className="ml-1 inline-block h-[1.05em] w-[2px] animate-pulse rounded-full bg-white/65 align-[-0.15em]" />
          )}
        </div>

        {/* Action Bar - Always visible on mobile, hover on desktop */}
        {!isStreaming && (
          <div className="absolute -bottom-8 left-0 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            <button
              className="p-2 md:p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors touch-target"
              title="Copy"
            >
              <Copy className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
            <button
              className="p-2 md:p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors touch-target"
              title="Regenerate"
            >
              <RefreshCw className="h-4 w-4 md:h-3.5 md:w-3.5" />
            </button>
            <button
              className="p-2 md:p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors touch-target"
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
