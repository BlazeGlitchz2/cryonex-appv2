import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Copy, RefreshCw, Share2, Edit } from "lucide-react";
import {
  Copy as CopyIcon,
  RefreshCcw as RetryIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  MoreHorizontal as MoreIcon,
  Sparkles,
  User as UserIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  X as XIcon,
  StopCircle,
  BrainCog,
  ChevronDown,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-go";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-php";
import { SimpleChart, type ChartSpec } from "@/components/ui/simple-chart";
import { motion, AnimatePresence } from "framer-motion";
import CryonexLogo from "@/components/CryonexLogo";
import { useCryonexBridge } from "@/hooks/useCryonexBridge";
import { isAndroid, isIOS, isNativePlatform } from "@/lib/mobile";

type From = "user" | "assistant";

type MessageProps = {
  from: From;
  children: React.ReactNode;
  className?: string;
  userInitial?: string;
  responseTime?: number;
  model?: string;
  // Make the argument optional so it can be called with or without content
  onEdit?: (newContent?: string) => void;
  onRegenerate?: () => void;
  onSave?: () => void;
  isStreaming?: boolean;
};

function extractPlainText(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }

  if (Array.isArray(node)) {
    return node.map(extractPlainText).join("");
  }

  if (React.isValidElement(node)) {
    return extractPlainText(
      (node.props as { children?: React.ReactNode }).children,
    );
  }

  return "";
}

export function Message({
  from,
  children,
  className,
  userInitial = "U",
  responseTime,
  model,
  onEdit,
  onRegenerate,
  onSave,
  onStop,
  isStreaming = false,
}: MessageProps & {
  onStop?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const shareableText = extractPlainText(children).trim();

  const handleStartEdit = (currentContent: string) => {
    setEditContent(currentContent);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim()) {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent("");
  };

  if (from === "user") {
    return (
      <div className={`space-y-3 ${className || ""}`}>
        <div className="flex gap-3 justify-end">
          <div className="group relative max-w-[85%] sm:max-w-xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-600 rounded-[2rem] blur-sm opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative border-none rounded-[2rem] rounded-tr-sm bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl overflow-hidden p-4 px-6">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="relative z-10">
                {isEditing ? (
                  <div className="space-y-2 min-w-[200px]">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[80px] bg-white/10 border-white/20 text-white resize-none focus-visible:ring-white/30 placeholder:text-white/50"
                      autoFocus
                      aria-label="Edit your message"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-7 px-3 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        className="h-7 px-3 bg-white text-black hover:bg-white/90 rounded-full font-medium"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-[15px] leading-relaxed font-medium tracking-wide break-words">
                      {children}
                    </div>
                    {onEdit && (
                      <button
                        onClick={() => {
                          const textContent =
                            typeof children === "string"
                              ? children
                              : (children as any)?.props?.children || "";
                          handleStartEdit(textContent);
                        }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-white/20 text-white/70 hover:text-white"
                        title="Edit message"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (from === "assistant") {
    return (
      <div className={`space-y-3 ${className || ""}`}>
        <div className="flex gap-4">
          <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 relative mt-1">
            <CryonexLogo
              isStreaming={isStreaming}
              scale={1.5}
              className="w-full h-full"
            />
          </div>

          <div className="flex-1 space-y-1 group relative max-w-4xl min-w-0">
            <div className="px-1 py-2 text-foreground">{children}</div>

            <div className="pl-1">
              <MessageActions
                text={shareableText || undefined}
                onRegenerate={onRegenerate}
                onEdit={onEdit}
                onStop={onStop}
                onSave={onSave}
                isStreaming={isStreaming}
              />

              {isStreaming && (
                <motion.div
                  className="flex items-center gap-2 text-muted-foreground flex-wrap mt-2 pl-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  aria-live="polite"
                  aria-label="AI is typing"
                >
                  <motion.span
                    className="inline-flex items-center gap-1 text-xs font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      backgroundSize: "200% 100%",
                    }}
                  >
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-200ms]" />
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce [animation-delay:-100ms]" />
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-bounce" />
                  </motion.span>
                </motion.div>
              )}

              {!isStreaming && (
                <div className="flex items-center gap-2 text-muted-foreground flex-wrap pl-2">
                  {typeof responseTime === "number" && (
                    <span className="text-[10px] bg-muted/30 px-1.5 py-0.5 rounded-md border border-border/20">
                      {responseTime.toFixed(1)}s
                    </span>
                  )}
                  {model && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 bg-muted/30 border-border/20 truncate max-w-[120px]"
                    >
                      {model.split("/")[1] || model}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function MessageContent({ children }: { children: React.ReactNode }) {
  return <p className="text-sm break-words leading-relaxed">{children}</p>;
}

function CodeBlock({ inline, className, children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const content = String(children || "");
  const match = /language-(\w+)/.exec(className || "");
  const rawLang = match?.[1]?.toLowerCase();

  // Normalize common aliases to Prism language keys
  const normalizeLang = (l?: string) => {
    if (!l) return "markup";
    const map: Record<string, string> = {
      js: "javascript",
      jsx: "jsx",
      ts: "typescript",
      tsx: "tsx",
      py: "python",
      sh: "bash",
      shell: "bash",
      csharp: "csharp",
      "c++": "cpp",
      md: "markdown",
      yml: "yaml",
      html: "markup",
      txt: "markup",
      chartjs: "chart", // treat chartjs alias as chart
    };
    return map[l] || l;
  };

  const langKey = normalizeLang(rawLang);

  // Render charts when language is "chart"
  if (!inline && (rawLang === "chart" || langKey === "chart")) {
    try {
      const spec = JSON.parse(content) as ChartSpec;
      if (spec && spec.type && spec.data) {
        return (
          <div className="my-4">
            <SimpleChart spec={spec} />
          </div>
        );
      }
    } catch {
      // fallthrough to plain code on JSON parse failure
    }
  }

  if (inline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-muted/50 text-primary font-mono text-sm border border-border/50"
        {...props}
      >
        {content}
      </code>
    );
  }

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  };

  const onDownload = () => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const a = document.createElement("a");
      a.href = url;
      a.download = `snippet${rawLang ? `.${rawLang}` : ""}.txt`;

      const parent = document.body || document.documentElement;
      if (parent && typeof (parent as any).appendChild === "function") {
        parent.appendChild(a);
        a.click();
        try {
          parent.removeChild(a);
        } catch {
          // ignore
        }
      } else {
        a.click();
      }
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  // Highlight using Prism
  let highlightedHtml = content;
  try {
    const grammar = (Prism.languages as any)[langKey] || Prism.languages.markup;
    highlightedHtml = Prism.highlight(content, grammar, langKey);
  } catch {
    // fallback to plain content
    highlightedHtml = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border bg-muted/30 backdrop-blur-sm shadow-sm group/code">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/20">
        <span className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground/80">
          {rawLang || "code"}
        </span>
        <div className="flex items-center gap-1.5 opacity-0 group-hover/code:opacity-100 transition-opacity">
          <button
            onClick={onDownload}
            className="h-7 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors"
            title="Download"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onCopy}
            className="h-7 px-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/50 transition-colors"
            title={copied ? "Copied!" : "Copy"}
          >
            {copied ? (
              <CheckIcon className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <CopyIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed custom-scrollbar">
        <code
          className={`language-${langKey} !bg-transparent !p-0 !m-0 !text-sm`}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          {...props}
        />
      </pre>
    </div>
  );
}

// Thinking Block Component
function ThinkingBlock({ content }: { content: string }) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="my-2 rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
      >
        <BrainCog className="h-3.5 w-3.5" />
        <span>Thinking Process</span>
        <div className="ml-auto">
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-3 pb-3 pt-0 text-xs text-muted-foreground/80 leading-relaxed border-t border-border/30 font-mono">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MessageResponse({ content }: { content: string }) {
  // Parse <tool_call> tags
  const thinkMatch = content.match(/<tool_call>([\s\S]*?)<\/think>/);
  const thinkingContent = thinkMatch ? thinkMatch[1] : null;
  const mainContent = content
    .replace(/<tool_call>[\s\S]*?<\/think>/, "")
    .trim();

  return (
    <div className="relative group">
      {/* Glassmorphism Bubble for AI */}
      <div className="rounded-2xl rounded-tl-sm bg-white/5 border border-white/10 p-5 shadow-lg backdrop-blur-sm">
        <div className="prose prose-sm max-w-none text-white prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-li:text-white/90 prose-code:text-white prose-a:text-cyan-400 prose-blockquote:text-white/80 prose-blockquote:border-white/30">
          {thinkingContent && <ThinkingBlock content={thinkingContent} />}

          <ReactMarkdown
            components={{
              // Headings & text
              p: ({ node, ...props }) => (
                <p className="leading-7 text-white/90" {...props} />
              ),
              h1: ({ node, ...props }) => (
                <h1
                  className="text-2xl font-bold mt-6 mb-4 text-white"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-xl font-bold mt-5 mb-3 text-white"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-lg font-bold mt-4 mb-2 text-white"
                  {...props}
                />
              ),
              h4: ({ node, ...props }) => (
                <h4
                  className="text-base font-bold mt-3 mb-2 text-white"
                  {...props}
                />
              ),
              h5: ({ node, ...props }) => (
                <h5
                  className="text-sm font-bold mt-3 mb-1 text-white"
                  {...props}
                />
              ),
              h6: ({ node, ...props }) => (
                <h6
                  className="text-sm font-medium mt-3 mb-1 text-white"
                  {...props}
                />
              ),
              li: ({ node, ...props }) => (
                <li className="leading-7 text-white/90" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-white" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-white/90" {...props} />
              ),
              span: ({ node, ...props }) => (
                <span className="text-white/90" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="underline decoration-cyan-500/50 hover:decoration-cyan-400 text-cyan-400 transition-colors"
                  target="_blank"
                  rel="noreferrer"
                  {...props}
                />
              ),

              // Images styled like the reference card
              img: ({ node, ...props }) => (
                <img
                  className="rounded-xl border border-white/10 bg-black/20 max-w-full shadow-lg my-4"
                  {...props}
                />
              ),

              // Blockquote & hr
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-white/30 pl-4 py-1 my-4 text-white/80 italic bg-white/5 rounded-r-lg"
                  {...props}
                />
              ),
              hr: () => <hr className="my-6 border-white/10" />,

              // Tables
              table: ({ node, ...props }) => (
                <div className="my-4 overflow-x-auto rounded-lg border border-white/10 shadow-sm bg-white/5">
                  <table
                    className="min-w-full text-sm divide-y divide-white/10"
                    {...props}
                  />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th
                  className="bg-white/10 px-4 py-3 text-left font-semibold text-white"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td
                  className="px-4 py-3 border-t border-white/10 text-white/90"
                  {...props}
                />
              ),

              // Code blocks with toolbar
              code: CodeBlock,
            }}
          >
            {
              mainContent ||
                content /* Fallback to full content if replace failed or no think tag */
            }
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function MessageActions({
  id,
  text,
  onRegenerate,
  onEdit,
  onStop,
  onSave,
  isStreaming = false,
  children,
}: {
  id?: string | number;
  text?: string;
  onRegenerate?: () => void;
  onEdit?: (newContent?: string) => void;
  onStop?: () => void;
  onSave?: () => void;
  isStreaming?: boolean;
  children?: React.ReactNode;
}) {
  const handleCopy = async () => {
    try {
      if (!text) {
        toast("Nothing to copy");
        return;
      }
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const { shareText: shareNativeText, hapticSelection } = useCryonexBridge();
  const isAndroidDevice = isAndroid();
  const isIOSDevice = isIOS();

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
      toast("Regenerating response...");
    } else {
      window.dispatchEvent(
        new CustomEvent("cryonex:regenerate", { detail: { id } }),
      );
      toast("Regenerating response...");
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit();
      toast("Editing response...");
    }
  };

  const handleStop = () => {
    if (onStop) {
      onStop();
      toast("Stopped generating");
    }
  };

  const handleShare = async () => {
    if (!text?.trim()) {
      toast("Nothing to share");
      return;
    }

    const url = window.location.href;
    const title = "Cryonex Message";
    const body = text.length > 1500 ? `${text.slice(0, 1500)}…` : text;
    const payload = `${body}\n\n${url}`;

    if (isAndroidDevice && isNativePlatform()) {
      try {
        const result = await shareNativeText(payload, title);
        if (result?.success) {
          void hapticSelection();
          return;
        }
      } catch {
        // Fall through to the cross-platform paths below.
      }
    }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: body,
          url,
        });
        void hapticSelection();
        return;
      } catch {
        // User cancelled or the share sheet was unavailable.
      }
    }

    try {
      await navigator.clipboard.writeText(payload);
      toast.success(
        isIOSDevice ? "Link copied for sharing" : "Share link copied!",
      );
      void hapticSelection();
    } catch {
      toast.error("Failed to share");
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  // If custom children are provided, render them as-is
  if (children) {
    return <div className="flex items-center gap-1 pt-2">{children}</div>;
  }

  const canCopy = !!text?.length;
  const canShare = !!text?.length;

  return (
    <div className="flex items-center gap-1 pt-2 pl-2 opacity-100">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-background/50"
            onClick={handleCopy}
            aria-label="Copy message"
            disabled={!canCopy}
          >
            <Copy className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-background/50"
            onClick={isStreaming ? handleStop : handleRegenerate}
            aria-label={isStreaming ? "Stop generating" : "Regenerate"}
          >
            {isStreaming ? (
              <StopCircle className="h-4 w-4 text-destructive" />
            ) : (
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isStreaming ? "Stop generating" : "Regenerate"}
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-background/50"
            onClick={handleEdit}
            aria-label="Edit message"
          >
            <Edit className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-background/50"
            onClick={handleSave}
            aria-label="Save to Library"
          >
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Save to Library/Project</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-lg hover:bg-background/50"
            onClick={handleShare}
            aria-label="Share message"
            disabled={!canShare}
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
    </div>
  );
}

/* Removed duplicate MessageResponse and MessageActions definitions */

type MessageActionType = "copy" | "retry" | "like" | "dislike" | "more";
export function MessageAction({
  type,
  onClick,
  disabled,
}: {
  type: MessageActionType;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const base =
    "h-8 w-8 p-0 rounded-lg hover:bg-background/50 flex items-center justify-center transition-colors";
  const Icon =
    type === "copy"
      ? CopyIcon
      : type === "retry"
        ? RetryIcon
        : type === "like"
          ? ThumbsUpIcon
          : type === "dislike"
            ? ThumbsDownIcon
            : MoreIcon;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={base}
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
    </Button>
  );
}

export function MessageAttachments({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">{children}</div>;
}

export function MessageAttachment({ filename }: { filename: string }) {
  return (
    <Badge
      variant="outline"
      className="text-xs truncate max-w-[160px] h-6 bg-background/50 backdrop-blur-sm border-border/50"
    >
      {filename}
    </Badge>
  );
}
