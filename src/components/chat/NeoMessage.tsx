import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Copy,
  RefreshCw,
  Share2,
  Sparkles,
  Check,
  ChevronDown,
  Brain,
  CornerDownRight,
  Pencil,
  X,
} from "lucide-react";
import { useIsTablet, useIsMobile } from "@/hooks/use-mobile";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { LinkPreview } from "@/components/ui/link-preview";
import {
  SourcePreviewProvider,
  SourceData,
  useSourcePreview,
  SourceLink,
} from "@/components/ui/source-preview"; // Fixed import
import { IconCryonex } from "@/components/ui/icons/Web3Icons";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { File as FileIcon } from "lucide-react";
import { ImageGeneration } from "@/components/ui/ai-chat-image-generation-1";
import { IMAGE_MODELS } from "@/lib/utils/model-utils";
import { extractStudyRouteCards } from "@/lib/study-routing";
import { StudyRouteCard } from "@/components/chat/StudyRouteCard";

interface Source extends SourceData { }

interface NeoMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  userImage?: string;
  userName?: string;
  isStreaming?: boolean;
  timestamp?: number;
  sources?: Source[];
  model?: string;
  attachments?: Array<{
    storageId?: Id<"_storage">; // Optional for optimistic messages
    name: string;
    type: string;
    size: number;
  }>;
  onEdit?: (newContent: string) => void;
}

const AttachmentPreview = ({
  storageId,
  name,
  type,
}: {
  storageId?: Id<"_storage">;
  name: string;
  type: string;
}) => {
  // Guard against invalid storageId to prevent query errors
  const url = useQuery(api.files.getUrl, storageId ? { storageId } : "skip");

  if (!url)
    return <div className="h-20 w-20 bg-white/5 animate-pulse rounded-lg" />;

  if (type.startsWith("image/")) {
    return (
      <div
        className="relative group overflow-hidden rounded-xl border border-white/10 bg-black/20 cursor-pointer"
        onClick={() => window.open(url, "_blank")}
      >
        <img
          src={url}
          alt={name}
          className="h-32 w-auto object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
    >
      <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
        <FileIcon className="h-4 w-4 text-white/70" />
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-medium text-white/90 truncate max-w-[150px]">
          {name}
        </span>
        <span className="text-[10px] text-white/50">Click to open</span>
      </div>
    </a>
  );
};

import { SearchStatus } from "./SearchStatus";
import { ThinkingProcess } from "./ThinkingProcess";
import { AIChatMessage } from "./AIChatMessage";
import { Textarea } from "@/components/ui/textarea";
import { MobileMessageRenderer } from "./MobileMessageRenderer";
import { MapWidget } from "./widgets/MapWidget";

export const NeoMessage = React.memo(function NeoMessage({
  role,
  content,
  userImage,
  userName,
  isStreaming,
  timestamp,
  sources,
  model,
  attachments,
  onEdit,
}: NeoMessageProps) {
  const isUser = role === "user";
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  const { studyRouteCards, messageContent } = React.useMemo(() => {
    const extracted = extractStudyRouteCards(content);
    return {
      studyRouteCards: extracted.cards,
      messageContent: extracted.content,
    };
  }, [content]);

  // ------------------------------------------
  // MOBILE RENDERING PATH (Android Optimized)
  // ------------------------------------------
  // Extract thinking/search content for mobile renderer
  const mobileProcessedContent = React.useMemo(() => {
    if (!isMobile) return null;

    let rawContent = messageContent;
    let thinking = "";
    let search = "";

    // Extract Search Block
    const searchRegex = /<search(?:\s+[^>]*)?>([\s\S]*?)<\/search>/i;
    const openSearchRegex = /<search(?:\s+[^>]*)?>([\s\S]*)$/i;
    const completeSearchMatch = rawContent.match(searchRegex);
    const openSearchMatch = rawContent.match(openSearchRegex);

    if (completeSearchMatch) {
      search = completeSearchMatch[1].trim();
      rawContent = rawContent.replace(searchRegex, "").trim();
    } else if (openSearchMatch) {
      search = openSearchMatch[1].trim();
      rawContent = "";
    }

    // Extract Thinking Block
    const thinkRegex = /<(?:think|thinking)(?:\s+[^>]*)?>([\s\S]*?)<\/(?:think|thinking)>/i;
    const openThinkRegex = /<(?:think|thinking)(?:\s+[^>]*)?>([\s\S]*)$/i;
    const completeThinkMatch = rawContent.match(thinkRegex);
    const openThinkMatch = rawContent.match(openThinkRegex);

    if (completeThinkMatch) {
      thinking = completeThinkMatch[1].trim();
      rawContent = rawContent.replace(thinkRegex, "").trim();
    } else if (openThinkMatch) {
      thinking = openThinkMatch[1].trim();
      rawContent = "";
    }

    // Clean up
    thinking = thinking.replace(/<\/?(think|thinking|final_answer)(?:\s+[^>]*)?>/gi, "").trim();
    rawContent = rawContent.replace(/<\/?final_answer(?:\s+[^>]*)?>/gi, "").trim();

    // Extract questions - try <related> tag format first (backend format)
    const relatedTagMatch = rawContent.match(/<related>([\s\S]*?)<\/related>/i);
    let questions: string[] = [];
    if (relatedTagMatch) {
      try {
        questions = JSON.parse(relatedTagMatch[1].trim());
        rawContent = rawContent.replace(/<related>[\s\S]*?<\/related>/gi, "").trim();
      } catch { }
    }
    // Fallback: bare JSON array at end of content
    if (questions.length === 0) {
      const questionsMatch = rawContent.match(/\["[^\]]+"\]$/m);
      if (questionsMatch) {
        try {
          questions = JSON.parse(questionsMatch[0]);
          rawContent = rawContent.replace(/\["[^\]]+"\]$/m, "").trim();
        } catch { }
      }
    }

    return {
      content: rawContent,
      thinkingContent: thinking || undefined,
      searchContent: search || undefined,
      suggestedQuestions: questions.length > 0 ? questions : undefined,
    };
  }, [isMobile, messageContent]);

  // Render mobile-optimized message on Android
  if (isMobile && mobileProcessedContent) {
    return (
      <div
        className={cn(
          "group relative flex w-full flex-col gap-2 px-4 py-3 transition-colors",
          isUser ? "items-end" : "items-start",
        )}
      >
        {!isUser &&
          studyRouteCards.map((card) => (
            <StudyRouteCard key={card.jobId} payload={card} className="w-full" />
          ))}
        <MobileMessageRenderer
          role={role}
          content={mobileProcessedContent.content}
          userImage={userImage}
          userName={userName}
          isStreaming={isStreaming}
          timestamp={timestamp}
          thinkingContent={mobileProcessedContent.thinkingContent}
          searchContent={mobileProcessedContent.searchContent}
          suggestedQuestions={mobileProcessedContent.suggestedQuestions}
          onEdit={onEdit}
          attachments={attachments}
        />
      </div>
    );
  }

  // ------------------------------------------
  // DESKTOP RENDERING PATH (Original)
  // ------------------------------------------
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);

  // Sync edit content when message content changes
  useEffect(() => {
    setEditContent(content);
  }, [content]);

  // Check if model is a reasoning model
  const isReasoningModel = React.useMemo(() => {
    if (!model) return false;
    const lowerModel = model.toLowerCase();
    return (
      lowerModel.includes("reasoner") ||
      lowerModel.includes("r1") ||
      lowerModel.includes("deepseek-reasoner")
    );
  }, [model]);

  // Check if model is an image model
  // Check if model is an image model
  const isImageModel = React.useMemo(() => {
    // Robustness: Only detect image generation if explicitly an image model or content has image markdown from Pollinations
    // We do NOT want to trigger on "pollinations" provider string alone as it is now used for text models too.

    // Guard: "auto" is the text chat auto-router, never an image model
    if (!model || model === "auto") return false;

    if (IMAGE_MODELS.some((m) => m.id === model)) return true;

    // Strict check for model ID string if it's not in the list but follows pattern
    if (model) {
      const lower = model.toLowerCase();
      // Known Image Models
      if (
        lower.includes("flux") ||
        lower.includes("gptimage") ||
        lower.includes("midjourney") ||
        lower.includes("dall-e") ||
        lower.includes("sdxl") ||
        lower.includes("stable-diffusion")
      )
        return true;

      // Known Text Models (Exclude explicitely)
      if (
        lower.includes("gemini") ||
        lower.includes("gpt-4") ||
        lower.includes("gpt-3") ||
        lower.includes("moonshot") ||
        lower.includes("deepseek") ||
        lower.includes("minimax") ||
        lower.includes("llama") ||
        lower.includes("claude") ||
        lower.includes("mistral") ||
        lower.includes("command")
      ) {
        return false;
      }
    }

    // Check for actually rendered image output in content
    if (content.match(/!\[.*?\]\(https:\/\/image\.pollinations\.ai\/.*?\)/))
      return true;

    return false;
  }, [model, content]);

  // Memoize processed content with injected images and thinking extraction

  // Helper to extract questions
  const extractQuestions = (text: string) => {
    // Find all possible start positions of the JSON array
    const openBrackets: number[] = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "[") openBrackets.push(i);
    }

    // Iterate backwards from the last open bracket to find the questions array
    for (let i = openBrackets.length - 1; i >= 0; i--) {
      const start = openBrackets[i];
      // Optimization: The questions array usually starts with [" so check for " nearby
      // This avoids trying to parse [1] or [Source] as potential huge arrays
      const nextCharPos = text.indexOf('"', start);
      if (nextCharPos === -1 || nextCharPos - start > 10) continue; // If no quote within 10 chars, probably not it

      // Find all closing brackets after this start
      const closeBrackets: number[] = [];
      for (let j = start + 1; j < text.length; j++) {
        if (text[j] === "]") closeBrackets.push(j);
      }

      // Try each closing bracket (preferring the furthest ones first to catch the full array)
      for (let j = closeBrackets.length - 1; j >= 0; j--) {
        const end = closeBrackets[j];
        const candidate = text.slice(start, end + 1);

        try {
          const parsed = JSON.parse(candidate);
          if (
            Array.isArray(parsed) &&
            parsed.length > 0 &&
            parsed.every((item) => typeof item === "string")
          ) {
            // Success! We found a string array.
            // We assume this is the questions array.
            return {
              content: text.slice(0, start).trim(),
              questions: parsed,
            };
          }
        } catch (e) {
          // Not valid JSON, continue searching
        }
      }
    }

    return { content: text, questions: [] };
  };

  const { finalContent, thinkingContent, searchContent, suggestedQuestions, mapQuery, isRTL } =
    React.useMemo(() => {
      let rawContent = messageContent;
      let thinking = "";
      let search = "";

      // 0. Extract Search Block (<search>)
      const searchRegex = /<search(?:\s+[^>]*)?>([\s\S]*?)<\/search>/i;
      const openSearchRegex = /<search(?:\s+[^>]*)?>([\s\S]*)$/i;

      // Extract Map Block (<map query="..."> or <map>Location</map>)
      const mapRegex = /<map(?:\s+[^>]*)?>([\s\S]*?)<\/map>/i;
      const mapSelfClosingRegex = /<map\s+query="([^"]*)"\s*\/>/i;

      let mapQuery: string | undefined = undefined;
      const mapMatch = rawContent.match(mapRegex);
      const mapSelfMatch = rawContent.match(mapSelfClosingRegex);

      if (mapMatch) {
        mapQuery = mapMatch[1].trim();
        rawContent = rawContent.replace(mapRegex, "").trim();
      } else if (mapSelfMatch) {
        mapQuery = mapSelfMatch[1].trim();
        rawContent = rawContent.replace(mapSelfClosingRegex, "").trim();
      }

      const completeSearchMatch = rawContent.match(searchRegex);
      const openSearchMatch = rawContent.match(openSearchRegex);

      if (completeSearchMatch) {
        search = completeSearchMatch[1].trim();
        rawContent = rawContent.replace(searchRegex, "").trim();
      } else if (openSearchMatch) {
        search = openSearchMatch[1].trim();
        rawContent = "";
      }

      // 1. Extract Thinking Block (<think> or <thinking>)
      const thinkRegex = /<(?:think|thinking)(?:\s+[^>]*)?>([\s\S]*?)<\/(?:think|thinking)>/i;
      const openThinkRegex = /<(?:think|thinking)(?:\s+[^>]*)?>([\s\S]*)$/i;

      const completeThinkMatch = rawContent.match(thinkRegex);
      const openThinkMatch = rawContent.match(openThinkRegex);

      if (completeThinkMatch) {
        thinking = completeThinkMatch[1].trim();
        rawContent = rawContent.replace(thinkRegex, "").trim();
      } else if (openThinkMatch) {
        thinking = openThinkMatch[1].trim();
        rawContent = "";
      }

      // 2. Clean up Thinking Content
      thinking = thinking
        .replace(/<\/?(think|thinking|final_answer)(?:\s+[^>]*)?>/gi, "")
        .trim();

      // 3. Clean up Final Content
      rawContent = rawContent
        .replace(/<\/?final_answer(?:\s+[^>]*)?>/gi, "")
        .trim();

      // 4. Extract <related> tags first, then fall back to extractQuestions
      let questions: string[] = [];
      const relatedTagMatch = rawContent.match(/<related>([\s\S]*?)<\/related>/i);
      if (relatedTagMatch) {
        try {
          questions = JSON.parse(relatedTagMatch[1].trim());
          rawContent = rawContent.replace(/<related>[\s\S]*?<\/related>/gi, "").trim();
        } catch { }
      }
      if (questions.length === 0) {
        const extraction = extractQuestions(rawContent);
        questions = extraction.questions;
        rawContent = extraction.content;
      }

      // 5. Normalize Math Delimiters
      const normalizeMath = (str: string) => {
        return str
          .replace(/\\\[/g, "$$")
          .replace(/\\\]/g, "$$")
          .replace(/\\\(/g, "$")
          .replace(/\\\)/g, "$");
      };

      // 6. Highlight Processing (==text== -> <mark>text</mark>)
      const processHighlights = (str: string) => {
        return str.replace(/==([^=]+)==/g, "<mark>$1</mark>");
      };

      rawContent = normalizeMath(rawContent);
      rawContent = processHighlights(rawContent);
      thinking = normalizeMath(thinking);

      // 7. RTL Detection
      const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
      const isRTL = arabicRegex.test(rawContent.slice(0, 100)); // Check first 100 chars

      // Only return thinking content if it has actual text length
      return {
        finalContent: rawContent,
        thinkingContent:
          thinking.length > 0 ? thinking : undefined,
        searchContent: search.trim().length > 0 ? search.trim() : undefined,
        suggestedQuestions: questions,
        mapQuery,
        isRTL
      };
    }, [messageContent]);

  const hasFinalContent = finalContent.trim().length > 0;
  const hasThinkingContent = !!thinkingContent?.trim();
  const hasSearchContent = !!searchContent?.trim();
  const showReplyIndicator =
    !isUser && isStreaming && !hasFinalContent && !hasThinkingContent && !hasSearchContent;

  // Removed artificial typewriter effect for instant, clean streaming

  // Pre-fetch sources when they become available
  const { preFetch } = useSourcePreview();
  useEffect(() => {
    if (sources && sources.length > 0 && !isStreaming) {
      preFetch(sources);
    }
  }, [sources, isStreaming, preFetch]);

  const handleCopy = () => {
    const cleanContent = messageContent.replace(/^\[(Search|Think|Canvas)\]\s*/i, "");
    navigator.clipboard.writeText(cleanContent);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() === content) {
      setIsEditing(false);
      return;
    }
    if (onEdit) {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group relative flex w-full flex-col gap-2 px-4 py-3 md:px-0 transition-colors",
        isUser ? "items-end" : "items-start",
      )}
    >
      {/* User Message (Glassy Tech Pill) */}
      {isUser ? (
        <div className="flex max-w-[85%] justify-end self-end md:max-w-[68%]">
          {isEditing ? (
            <div className="w-full relative glass-panel text-white border-purple-500/50 p-3">
              <Textarea
                value={editContent}
                onChange={(e: any) => setEditContent(e.target.value)}
                className="min-h-[60px] max-h-[200px] w-full bg-transparent border-none text-white focus-visible:ring-0 p-1 resize-none text-[16px] md:text-[15px] leading-relaxed"
                autoFocus
                onKeyDown={(e: any) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === "Escape") {
                    setIsEditing(false);
                    setEditContent(content);
                  }
                }}
              />
              <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-white/10">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-white/50 hover:text-white"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs"
                  onClick={handleSaveEdit}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Save & Regenerate
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative group/bubble max-w-full">
              <div
                className={cn(
                  "deepshi-panel relative min-w-[84px] rounded-[1.45rem] rounded-tr-[0.72rem] border px-4 py-3 text-[15px] leading-relaxed text-white transition-colors duration-300",
                  isMobile
                    ? "border-white/10"
                    : "border-white/10 shadow-[0_16px_40px_rgba(6,3,18,0.34)] group-hover:border-white/16",
                )}
              >
                <div className="relative z-10 whitespace-pre-wrap font-normal text-white/92">
                  {finalContent}
                </div>

                {/* Attachments */}
                {attachments && attachments.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attachments
                      .filter((file) => file.storageId) // Only show attachments with valid storageId
                      .map((file, idx) => (
                        <AttachmentPreview key={idx} {...file} />
                      ))}
                  </div>
                )}
              </div>

              {/* Edit Action */}
              {!isStreaming && onEdit && (
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover/bubble:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 md:h-8 md:w-8 rounded-full bg-black/40 text-white/50 hover:text-white hover:bg-white/10 touch-target"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4 md:h-3.5 md:w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* AI Message (Premium Render) */
        <div className="flex w-full max-w-none gap-3 md:max-w-4xl md:gap-5">
          <div className="shrink-0 mt-1 relative hidden md:block">
            <div className="relative h-10 w-10 rounded-full border border-white/12 bg-[linear-gradient(135deg,rgba(160,93,255,0.28),rgba(82,53,181,0.24))] backdrop-blur-xl flex items-center justify-center overflow-hidden shadow-[0_12px_26px_rgba(15,8,34,0.34)]">
              <IconCryonex className="h-5 w-5 text-white relative z-10" />
            </div>
          </div>

          <div className="flex-1 min-w-0 relative group/message">
            <div className="relative z-10 mb-3 flex items-center gap-3">
              <span className="text-sm font-semibold tracking-[0.18em] text-white/62 uppercase">
                Cryonex
              </span>
            </div>

            {studyRouteCards.map((card) => (
              <StudyRouteCard key={card.jobId} payload={card} />
            ))}

            {hasSearchContent && (
              <SearchStatus
                query={searchContent!}
                isFinished={
                  !isStreaming || hasFinalContent || hasThinkingContent
                }
                className="mb-4"
              />
            )}

            {/* Thinking Block */}
            {hasThinkingContent && (
              <ThinkingProcess
                thinking={thinkingContent!}
                isFinished={!isStreaming || hasFinalContent}
                className="mb-4"
              />
            )}

            {showReplyIndicator && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white/45 shadow-[0_10px_24px_rgba(3,2,15,0.18)] backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/85 animate-bounce [animation-delay:-0.24s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/75 animate-bounce [animation-delay:-0.12s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/65 animate-bounce" />
                <span>Cryonex is replying</span>
              </div>
            )}

            {/* Map Widget */}
            {mapQuery && (
              <div className="mb-4 w-full max-w-2xl">
                <MapWidget query={mapQuery} />
              </div>
            )}

            {hasFinalContent && isImageModel ? (
              <div className="mb-4">
                <ImageGeneration
                  loadingState={
                    isStreaming
                      ? finalContent
                        ? "generating"
                        : "starting"
                      : "completed"
                  }
                >
                  <AIChatMessage
                    content={finalContent}
                    isStreaming={isStreaming}
                    isRTL={isRTL}
                  />
                </ImageGeneration>
              </div>
            ) : hasFinalContent ? (
              <AIChatMessage
                content={finalContent}
                isStreaming={isStreaming}
                isRTL={isRTL}
              />
            ) : null}

            {/* Suggested Questions (Interactive Chips) */}
            {suggestedQuestions &&
              suggestedQuestions.length > 0 &&
              !isStreaming &&
              hasFinalContent && (
                <div className="mt-4 flex flex-col gap-2 border-t border-white/5 pt-4">
                  <p className="text-[10px] font-bold text-white/30 mb-1 uppercase tracking-[0.2em]">
                    Suggested Follow-up
                  </p>
                  <div className="mobile-scroll-x md:flex md:flex-col md:gap-2">
                    {suggestedQuestions.map((question: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const chatInput = document.querySelector(
                            'textarea[name="prompt"]',
                          );
                          if (chatInput instanceof HTMLTextAreaElement) {
                            const nativeTextareaValueSetter =
                              Object.getOwnPropertyDescriptor(
                                window.HTMLTextAreaElement.prototype,
                                "value",
                              )?.set;
                            if (nativeTextareaValueSetter) {
                              nativeTextareaValueSetter.call(
                                chatInput,
                                question,
                              );
                              const event = new Event("input", {
                                bubbles: true,
                              });
                              chatInput.dispatchEvent(event);
                            } else {
                              chatInput.value = question;
                              chatInput.dispatchEvent(
                                new Event("input", { bubbles: true }),
                              );
                            }
                            chatInput.focus();
                          }
                        }}
                        className="group flex items-start gap-2 md:gap-3 md:w-full text-left px-3 py-2.5 md:py-2 rounded-xl transition-all bg-white/[0.03] md:bg-transparent hover:bg-white/5 active:scale-[0.98] border border-white/5 md:border-transparent hover:border-white/10 touch-feedback min-w-[200px] md:min-w-0 flex-shrink-0"
                      >
                        <CornerDownRight className="h-4 w-4 text-white/30 group-hover:text-cyan-400 transition-colors shrink-0 mt-0.5" />
                        <div className="text-sm text-white/70 group-hover:text-white transition-colors prose prose-invert prose-p:leading-snug prose-strong:text-white/90 max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <span {...props} />,
                            }}
                          >
                            {question}
                          </ReactMarkdown>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Sources Section (Data Chips) */}
            {sources && sources.length > 0 && !isStreaming && !isImageModel && hasFinalContent && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-[10px] font-bold text-white/30 mb-3 uppercase tracking-[0.2em]">
                  Referenced Data
                </p>
                <div className="flex flex-wrap gap-2">
                  {sources.map((source, idx) => (
                    <SourceLink
                      key={idx}
                      source={source}
                      className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all backdrop-blur-md"
                    >
                      <span className="text-[10px] text-cyan-400/50 group-hover:text-cyan-400 font-mono">
                        {source.domain}
                      </span>
                      <span className="text-xs text-white/60 group-hover:text-white truncate max-w-[150px]">
                        {source.title}
                      </span>
                    </SourceLink>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
