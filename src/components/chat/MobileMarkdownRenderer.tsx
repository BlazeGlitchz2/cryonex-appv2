import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";
import { Copy, Check, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MobileMarkdownRendererProps {
    content: string;
    isStreaming?: boolean;
    className?: string;
}

// ------------------------------------------
// Mobile Code Block (Simplified)
// ------------------------------------------

const MobileCodeBlock = ({
    language,
    children,
}: {
    language: string;
    children: string;
}) => {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const lines = children.split("\n");
    const isLong = lines.length > 8;

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const displayedContent = isLong && !expanded
        ? lines.slice(0, 6).join("\n") + "\n..."
        : children;

    return (
            <div className="relative my-3 overflow-hidden rounded-xl border border-white/10 bg-[#111019]">
            {/* Header */}
            <div className="flex items-center justify-between bg-white/5 px-3 py-2 text-xs border-b border-white/5">
                <span className="font-mono font-medium text-[#9fc3ff]">
                    {language || "code"}
                </span>
                <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg active:bg-white/10 transition-colors"
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-green-400" />
                    ) : (
                        <Copy className="h-4 w-4 text-white/50" />
                    )}
                </button>
            </div>

            {/* Code Content - No line numbers on mobile for compact view */}
            <div className="overflow-x-auto">
                <SyntaxHighlighter
                    language={language || "text"}
                    style={oneDark}
                    customStyle={{
                        margin: 0,
                        padding: "12px",
                        background: "transparent",
                        fontSize: "13px",
                        lineHeight: "1.5",
                    }}
                    wrapLines={true}
                    wrapLongLines={false}
                    showLineNumbers={false}
                >
                    {displayedContent}
                </SyntaxHighlighter>
            </div>

            {/* Expand/Collapse for long code */}
            {isLong && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full py-2 flex items-center justify-center gap-1 text-xs text-cyan-400/80 bg-white/5 border-t border-white/5 active:bg-white/10 transition-colors"
                >
                    {expanded ? (
                        <>
                            <ChevronUp className="h-4 w-4" />
                            Show less
                        </>
                    ) : (
                        <>
                            <ChevronDown className="h-4 w-4" />
                            Show {lines.length - 6} more lines
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

// ------------------------------------------
// Mobile Image (Tap to Zoom)
// ------------------------------------------

const MobileImage = ({ src, alt }: { src?: string; alt?: string }) => {
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <>
            <div
                className="relative my-2 rounded-xl overflow-hidden inline-block active:opacity-80 transition-opacity"
                onClick={() => setIsZoomed(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto rounded-xl"
                    style={{ maxHeight: "280px", objectFit: "contain" }}
                    loading="lazy"
                />
                {alt && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-xl">
                        <p className="text-[11px] text-white/80 truncate">{alt}</p>
                    </div>
                )}
            </div>

            {/* Fullscreen Viewer */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
                        onClick={() => setIsZoomed(false)}
                    >
                        <motion.img
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            src={src}
                            alt={alt}
                            className="max-w-full max-h-full object-contain rounded-xl"
                        />
                        <div className="absolute bottom-8 left-0 right-0 text-center text-white/50 text-xs">
                            Tap to close
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// ------------------------------------------
// Mobile Link
// ------------------------------------------

const MobileLink = ({
    href,
    children,
}: {
    href?: string;
    children: React.ReactNode;
}) => {
    if (!href) return <span>{children}</span>;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 text-[#8ab5ff] underline decoration-[#8ab5ff]/30 underline-offset-2 active:text-[#a8c9ff]"
        >
            {children}
            <ExternalLink className="h-3 w-3 ml-0.5" />
        </a>
    );
};

// ------------------------------------------
// Mobile Table (Horizontal Scroll)
// ------------------------------------------

const MobileTable = ({ children }: { children: React.ReactNode }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-white/10 -mx-2">
        <table className="w-full text-left text-sm min-w-[400px]">{children}</table>
    </div>
);

const MobileThead = ({ children }: { children: React.ReactNode }) => (
    <thead className="bg-white/5 text-xs text-slate-400 font-medium border-b border-white/10">
        {children}
    </thead>
);

const MobileTh = ({ children }: { children: React.ReactNode }) => (
    <th className="px-3 py-2 whitespace-nowrap">{children}</th>
);

const MobileTd = ({ children }: { children: React.ReactNode }) => (
    <td className="px-3 py-2 border-b border-white/5 text-slate-300">{children}</td>
);

// ------------------------------------------
// Mobile Blockquote
// ------------------------------------------

const MobileBlockquote = ({ children }: { children: React.ReactNode }) => (
    <blockquote className="my-3 border-l-2 border-[#6fa9ff]/50 pl-3 text-slate-300 italic">
        {children}
    </blockquote>
);

// ------------------------------------------
// Main Component
// ------------------------------------------

export const MobileMarkdownRenderer: React.FC<MobileMarkdownRendererProps> = ({
    content,
    isStreaming = false,
    className,
}) => {
    return (
        <div
            className={cn(
                "prose prose-slate dark:prose-invert max-w-none",
                "prose-headings:text-slate-100 prose-headings:font-bold prose-headings:tracking-tight",
                "prose-p:my-2 prose-p:text-[15.5px] prose-p:leading-7 prose-p:text-slate-200",
                "prose-strong:text-white prose-strong:font-semibold",
                "prose-em:text-[#d5c5ff]",
                "prose-ul:my-2 prose-ul:pl-4",
                "prose-li:text-slate-300 prose-li:my-1 prose-li:text-[15px]",
                "prose-hr:border-white/10 prose-hr:my-4",
                className
            )}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw]}
                components={{
                    // Highlighted text
                    mark: ({ children }) => (
                        <mark className="bg-yellow-500/20 text-yellow-200 px-1 rounded">
                            {children}
                        </mark>
                    ),

                    // Code blocks (simplified for mobile)
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";

                        return !inline && match ? (
                            <MobileCodeBlock language={language}>
                                {String(children).replace(/\n$/, "")}
                            </MobileCodeBlock>
                        ) : (
                            <code
                                className="rounded-md bg-white/10 px-1.5 py-0.5 text-[13px] text-cyan-200"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },

                    // Images
                    img: ({ src, alt }) => <MobileImage src={src} alt={alt} />,

                    // Links
                    a: ({ href, children }) => (
                        <MobileLink href={href}>{children}</MobileLink>
                    ),

                    // Blockquotes
                    blockquote: ({ children }) => (
                        <MobileBlockquote>{children}</MobileBlockquote>
                    ),

                    // Paragraphs
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,

                    // Tables
                    table: ({ children }) => <MobileTable>{children}</MobileTable>,
                    thead: ({ children }) => <MobileThead>{children}</MobileThead>,
                    th: ({ children }) => <MobileTh>{children}</MobileTh>,
                    td: ({ children }) => <MobileTd>{children}</MobileTd>,

                    // Lists
                    ul: ({ children }) => (
                        <ul className="space-y-1 my-2 list-disc list-inside">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="space-y-1 my-2 list-decimal list-inside">{children}</ol>
                    ),

                    // Headings (sized for mobile)
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-white mb-2 mt-4">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-white mb-2 mt-4">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-base font-medium text-cyan-100 mb-1 mt-3">{children}</h3>
                    ),

                    // Horizontal rule
                    hr: () => <hr className="border-t border-white/10 my-4" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MobileMarkdownRenderer;
