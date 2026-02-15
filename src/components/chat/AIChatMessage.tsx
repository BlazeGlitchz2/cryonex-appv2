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
import { useIsMobile } from "@/hooks/use-mobile";
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
}

export const AIChatMessage: React.FC<AIChatMessageProps> = ({
  content,
  isStreaming = false,
  className,
}) => {
  const [textSize, setTextSize] = React.useState<"sm" | "base" | "lg" | "xl">(
    "base",
  );
  const isMobileDevice = useIsMobile();

  // Memoize the components map to prevent ReactMarkdown from re-rendering all children
  const markdownComponents = React.useMemo(
    () => ({
      mark: ({ children }: any) => (
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
            className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-sm text-cyan-200 border border-white/5"
            {...props}
          >
            {children}
          </code>
        );
      },
      img: ({ src, alt }: any) => <PremiumImage src={src} alt={alt} />,
      a: ({ href, children }: any) => (
        <PremiumLink href={href}>{children}</PremiumLink>
      ),
      blockquote: ({ children }: any) => {
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
      p: ({ children }: any) => {
        const childrenArray = React.Children.toArray(children);
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

        return <p className="mb-4 last:mb-0">{children}</p>;
      },
      table: ({ children }: any) => <PremiumTable>{children}</PremiumTable>,
      thead: ({ children }: any) => <PremiumThead>{children}</PremiumThead>,
      th: ({ children }: any) => <PremiumTh>{children}</PremiumTh>,
      td: ({ children }: any) => <PremiumTd>{children}</PremiumTd>,
      ul: ({ children }: any) => (
        <ul className="space-y-2 my-4">{children}</ul>
      ),
      ol: ({ children }: any) => (
        <ol className="list-decimal list-outside ml-5 space-y-2 my-4 marker:text-slate-500">
          {children}
        </ol>
      ),
      h1: ({ children }: any) => (
        <h1 className="text-2xl font-bold text-white mb-4 mt-6">
          {children}
        </h1>
      ),
      h2: ({ children }: any) => (
        <h2 className="text-xl font-semibold text-white mb-3 mt-6">
          {children}
        </h2>
      ),
      h3: ({ children }: any) => (
        <h3 className="text-lg font-medium text-cyan-100 mb-2 mt-4">
          {children}
        </h3>
      ),
      hr: () => <hr className="border-t border-white/10 my-6" />,
    }),
    [], // Stable reference — components don't depend on any state
  );

  // On mobile, use CSS animation; on desktop, keep framer-motion
  const ContentWrapper = isMobileDevice ? 'div' : motion.div;
  const contentWrapperProps = isMobileDevice
    ? {}
    : {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 },
    };

  return (
    <div className={cn("w-full max-w-4xl space-y-4", className)}>
      <ContentWrapper
        {...(contentWrapperProps as any)}
        className={cn(
          "relative group border border-transparent hover:border-white/5 rounded-xl transition-colors p-2 -ml-2",
          isMobileDevice && "message-animate-in message-gpu",
        )}
      >
        {/* Text Size Control - Hidden on mobile (requires hover) */}
        {!isMobileDevice && (
          <div className="absolute -top-3 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1 p-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 shadow-lg">
              <button
                onClick={() =>
                  setTextSize((prev) =>
                    prev === "base" ? "lg" : prev === "lg" ? "xl" : "base",
                  )
                }
                className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 hover:bg-cyan-500/20 text-[10px] font-mono text-cyan-400 transition-all border border-transparent hover:border-cyan-500/30"
                title="Toggle Text Size"
              >
                <span className="font-bold">A</span>
                <span className="text-[7px] ml-0.5">
                  {textSize === "base" ? "+" : textSize === "lg" ? "++" : "STD"}
                </span>
              </button>
            </div>
          </div>
        )}
        <div
          className={cn(
            "prose prose-slate dark:prose-invert max-w-none",
            "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-transparent prose-headings:bg-clip-text prose-headings:bg-gradient-to-r prose-headings:from-white prose-headings:to-slate-400",
            "prose-p:leading-relaxed prose-p:text-slate-300",
            "prose-strong:text-cyan-300 prose-strong:font-bold prose-strong:drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]",
            "prose-em:text-purple-300 prose-em:italic",
            "prose-ul:my-4 prose-ul:list-none prose-ul:pl-0",
            "prose-li:relative prose-li:pl-6 prose-li:my-2 prose-li:text-slate-300",
            "prose-li:before:absolute prose-li:before:left-0 prose-li:before:top-[0.6em] prose-li:before:h-1.5 prose-li:before:w-1.5 prose-li:before:rounded-full prose-li:before:bg-cyan-500 prose-li:before:shadow-[0_0_8px_rgba(6,182,212,0.5)]",
            "prose-hr:border-white/10 prose-hr:my-8",
            "prose-blockquote:border-l-2 prose-blockquote:border-cyan-500/50 prose-blockquote:bg-white/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-slate-300",
            "transition-all duration-300 ease-out",
            textSize === "sm" && "prose-sm",
            textSize === "base" && "prose-base",
            textSize === "lg" && "prose-lg",
            textSize === "xl" && "prose-xl",
            "select-text"
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
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
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
      </ContentWrapper>
    </div>
  );
};
