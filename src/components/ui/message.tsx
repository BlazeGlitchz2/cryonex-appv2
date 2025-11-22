import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import { motion } from "framer-motion";

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
  isStreaming?: boolean;
};

export function Message({
  from,
  children,
  className,
  userInitial = "U",
  responseTime,
  model,
  onEdit,
  onRegenerate,
  onStop,
  isStreaming = false,
}: MessageProps & {
  onStop?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

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
        <div className="flex gap-2 sm:gap-4 justify-end">
          <Card className="message-bubble-user bg-gradient-to-br from-[#22D3EE] to-[#9333EA] border-white/10 rounded-[20px] max-w-[85%] sm:max-w-[680px] relative group">
            <CardContent className="px-4 py-3">
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] bg-[#0a0a0a] border-[#2a2a2a] text-white resize-none"
                    autoFocus
                    aria-label="Edit your message"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="h-7 px-2 text-white/70 hover:text-white hover:bg-white/10"
                      aria-label="Cancel edit"
                    >
                      <XIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="h-7 px-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                      aria-label="Save edit"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {children}
                  {onEdit && (
                    <button
                      onClick={() => {
                        const textContent = typeof children === 'string' 
                          ? children 
                          : (children as any)?.props?.children || '';
                        handleStartEdit(textContent);
                      }}
                      className="absolute -left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
                      title="Edit message"
                      aria-label="Edit your message"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <span className="text-xs sm:text-sm font-medium text-white">
              {userInitial}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (from === "assistant") {
    return (
      <div className={`space-y-3 ${className || ""}`}>
        <div className="flex gap-2 sm:gap-4">
          <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4 text-black" />
          </div>
          <div className="flex-1 space-y-3 group relative">
            <Card className="message-bubble-ai bg-gradient-to-br from-[rgba(34,211,238,0.08)] to-[rgba(147,51,234,0.12)] border-white/10 rounded-[20px] backdrop-blur-md backdrop-saturate-150">
              <CardContent className="p-4">
                {children}
              </CardContent>
            </Card>

            <MessageActions
              onRegenerate={onRegenerate}
              onEdit={onEdit}
              onStop={onStop}
              isStreaming={isStreaming}
            />

            {isStreaming && (
              <motion.div
                className="flex items-center gap-2 text-zinc-500 flex-wrap mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                aria-live="polite"
                aria-label="AI is typing"
              >
                <motion.span
                  className="inline-flex items-center gap-1 text-xs text-white/80 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent"
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
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-200ms]" />
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-100ms]" />
                  <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  AI is typing...
                </motion.span>
              </motion.div>
            )}

            {!isStreaming && (
              <div className="flex items-center gap-1 sm:gap-2 text-zinc-500 flex-wrap">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shrink-0">
                    <Sparkles className="h-3 w-3 text-black" />
                  </div>
                  <span className="text-xs text-white">Response from:</span>
                </div>
                {typeof responseTime === "number" && (
                  <span className="text-xs ml-1 sm:ml-2 whitespace-nowrap">
                    {responseTime.toFixed(1)}s
                  </span>
                )}
                {model && (
                  <Badge variant="outline" className="text-xs truncate max-w-[100px] sm:max-w-none">
                    {model.split("/")[1] || model}
                  </Badge>
                )}
                {isStreaming && (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-white/80" aria-live="polite" aria-label="Streaming response">
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-200ms]" />
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-100ms]" />
                    <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="ml-1">streaming</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className || ""}`}>
      <div className="flex gap-2 sm:gap-4">
        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-white flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-black" />
        </div>
        <div className="flex-1 space-y-3">
          <Card className="bg-[#0f0f0f] border-[#2a2a2a] rounded-2xl">
            <CardContent className="p-3 sm:p-4">
              {children}
            </CardContent>
          </Card>

          <div className="flex items-center gap-1 sm:gap-2 text-zinc-500 flex-wrap">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center shrink-0">
                <Sparkles className="h-3 w-3 text-black" />
              </div>
              <span className="text-xs text-white">Response from:</span>
            </div>
            {typeof responseTime === "number" && (
              <span className="text-xs ml-1 sm:ml-2 whitespace-nowrap">
                {responseTime.toFixed(1)}s
              </span>
            )}
            {model && (
              <Badge variant="outline" className="text-xs truncate max-w-[100px] sm:max-w-none">
                {model.split("/")[1] || model}
              </Badge>
            )}
            {isStreaming && (
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-white/80" aria-live="polite" aria-label="Streaming response">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-200ms]" />
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-100ms]" />
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-bounce" />
                <span className="ml-1">streaming</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <p className="text-sm break-words">{children}</p>;
}

function CodeBlock({
  inline,
  className,
  children,
  ...props
}: any) {
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
          <div className="my-3">
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
      <code className="px-1.5 py-0.5 rounded bg-[#111] text-[#e5e5e5] border border-[#2a2a2a]" {...props}>
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
    <div className="my-3 overflow-hidden rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a2a]">
        <span className="text-[11px] uppercase tracking-wider text-[#9b9b9b]">
          {rawLang || "code"}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onDownload}
            className="h-7 px-2 rounded-md text-[#bfbfbf] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            title="Download"
          >
            <DownloadIcon className="h-4 w-4" />
          </button>
          <button
            onClick={onCopy}
            className="h-7 px-2 rounded-md text-[#bfbfbf] hover:text-white hover:bg-[#1a1a1a] transition-colors"
            title={copied ? "Copied!" : "Copy"}
          >
            {copied ? (
              <CheckIcon className="h-4 w-4 text-emerald-400" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto p-3 text-sm leading-relaxed">
        <code
          className={`language-${langKey}`}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          {...props}
        />
      </pre>
    </div>
  );
}

export function MessageResponse({
  content,
}: {
  content: string;
}) {
  return (
    <div className="prose prose-sm prose-invert max-w-none text-white [&_*]:!text-white">
      <ReactMarkdown
        components={{
          // Headings & text
          p: ({ node, ...props }) => <p className="!text-white leading-7" {...props} />,
          h1: ({ node, ...props }) => <h1 className="!text-white text-2xl font-semibold mt-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="!text-white text-xl font-semibold mt-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="!text-white text-lg font-semibold mt-2" {...props} />,
          h4: ({ node, ...props }) => <h4 className="!text-white text-base font-semibold mt-2" {...props} />,
          h5: ({ node, ...props }) => <h5 className="!text-white text-sm font-semibold mt-2" {...props} />,
          h6: ({ node, ...props }) => <h6 className="!text-white text-sm font-medium mt-2" {...props} />,
          li: ({ node, ...props }) => <li className="!text-white leading-7" {...props} />,
          strong: ({ node, ...props }) => <strong className="!text-white" {...props} />,
          em: ({ node, ...props }) => <em className="!text-white" {...props} />,
          span: ({ node, ...props }) => <span className="!text-white" {...props} />,
          a: ({ node, ...props }) => (
            <a className="!text-white underline decoration-[#666] hover:decoration-white" target="_blank" rel="noreferrer" {...props} />
          ),

          // Images styled like the reference card
          img: ({ node, ...props }) => (
            <img className="rounded-lg border border-[#2a2a2a] bg-black max-w-full" {...props} />
          ),

          // Blockquote & hr
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 border-[#2a2a2a] pl-3 text-[#cfcfcf] italic" {...props} />
          ),
          hr: () => <hr className="my-4 border-[#2a2a2a]" />,

          // Tables
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-[#2a2a2a]">
              <table className="min-w-full text-sm" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="bg-[#111] px-3 py-2 text-left font-semibold" {...props} />,
          td: ({ node, ...props }) => <td className="px-3 py-2 border-t border-[#2a2a2a]" {...props} />,

          // Code blocks with toolbar
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function MessageActions({
  id,
  text,
  onRegenerate,
  onEdit,
  onStop,
  isStreaming = false,
  children,
}: {
  id?: string | number;
  text?: string;
  onRegenerate?: () => void;
  onEdit?: (newContent?: string) => void;
  onStop?: () => void;
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

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate();
      toast("Regenerating response...");
    } else {
      window.dispatchEvent(new CustomEvent("cryonex:regenerate", { detail: { id } }));
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
    const url = window.location.href;
    const shareText = text ? (text.length > 1500 ? `${text.slice(0, 1500)}…` : text) : undefined;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Cryonex Message",
          text: shareText,
          url,
        });
      } catch {
        // ignore cancel
      }
    } else {
      try {
        const payload = shareText ? `${shareText}\n\n${url}` : url;
        await navigator.clipboard.writeText(payload);
        toast.success("Share link copied!");
      } catch {
        toast.error("Failed to copy share link");
      }
    }
  };

  // If custom children are provided, render them as-is
  if (children) {
    return <div className="flex items-center gap-1 pt-2">{children}</div>;
  }

  const canCopy = !!text?.length;
  const canShare = !!text?.length;

  return (
    <motion.div
      className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity"
      initial={{ opacity: 0 }}
      whileHover={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleCopy}
            aria-label="Copy message"
            disabled={!canCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={isStreaming ? handleStop : handleRegenerate}
            aria-label={isStreaming ? "Stop generating" : "Regenerate"}
          >
            {isStreaming ? (
              <StopCircle className="h-4 w-4 text-red-500" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{isStreaming ? "Stop generating" : "Regenerate"}</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleEdit}
            aria-label="Edit message"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={handleShare}
            aria-label="Share message"
            disabled={!canShare}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Share</TooltipContent>
      </Tooltip>
    </motion.div>
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
    "h-7 sm:h-8 px-1 sm:px-2 hover:text-white hover:bg-[#1a1a1a] rounded-lg";
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
      <Icon className="h-4 w-4" />
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

export function MessageAttachment({
  filename,
}: {
  filename: string;
}) {
  return (
    <Badge variant="outline" className="text-xs truncate max-w-[160px]">
      {filename}
    </Badge>
  );
}