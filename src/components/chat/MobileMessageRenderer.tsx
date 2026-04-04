import React, { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Copy,
  CornerUpLeft,
  Pencil,
  Trash2,
  Check,
  X,
  MoreVertical,
  Share2,
} from "lucide-react";
import { useSwipeGesture, useLongPress } from "@/hooks/useSwipeGesture";
import { useDeviceInfo } from "@/hooks/use-mobile";
import { useCryonexBridge } from "@/hooks/useCryonexBridge";
import { IconCryonex } from "@/components/ui/icons/Web3Icons";
import { MobileMarkdownRenderer } from "./MobileMarkdownRenderer";
import { SearchStatus } from "./SearchStatus";
import { ThinkingProcess } from "./ThinkingProcess";
import { MapWidget } from "./widgets/MapWidget";
import { LoadingBreadcrumb } from "@/components/ui/animated-loading-svg-text-shimmer";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { File as FileIcon } from "lucide-react";

// ------------------------------------------
// Types
// ------------------------------------------

interface MobileMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  userImage?: string;
  userName?: string;
  isStreaming?: boolean;
  timestamp?: number;
  thinkingContent?: string;
  searchContent?: string;
  suggestedQuestions?: string[];
  onEdit?: (newContent: string) => void;
  onReply?: () => void;
  onDelete?: () => void;
  attachments?: Array<{
    storageId?: Id<"_storage">;
    name: string;
    type: string;
    size: number;
  }>;
}

// ------------------------------------------
// Mobile Attachment Preview
// ------------------------------------------

const MobileAttachmentPreview = ({
  storageId,
  name,
  type,
}: {
  storageId?: Id<"_storage">;
  name: string;
  type: string;
}) => {
  const url = useQuery(api.files.getUrl, storageId ? { storageId } : "skip");

  if (!url) {
    return <div className="h-16 w-16 bg-white/5 animate-pulse rounded-xl" />;
  }

  if (type.startsWith("image/")) {
    return (
      <div
        className="relative overflow-hidden rounded-xl active:opacity-80 transition-opacity"
        onClick={() => window.open(url, "_blank")}
      >
        <img
          src={url}
          alt={name}
          className="h-24 w-auto object-cover rounded-xl"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 p-3 rounded-xl bg-white/5 active:bg-white/10 transition-colors"
    >
      <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/10">
        <FileIcon className="h-4 w-4 text-white/70" />
      </div>
      <span className="text-xs text-white/90 truncate max-w-[120px]">
        {name}
      </span>
    </a>
  );
};

// ------------------------------------------
// Context Menu
// ------------------------------------------

interface ContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onReply?: () => void;
  onDelete?: () => void;
  isUser: boolean;
}

const MobileContextMenu: React.FC<ContextMenuProps> = ({
  isOpen,
  onClose,
  onCopy,
  onShare,
  onEdit,
  onReply,
  onDelete,
  isUser,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
          >
            <div className="bg-[#1a1a1f] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
              <button
                onClick={() => {
                  onCopy();
                  onClose();
                }}
                className="w-full flex items-center gap-4 px-5 py-4 text-white/90 active:bg-white/5 transition-colors touch-action-manipulation min-h-[52px]"
                type="button"
              >
                <Copy className="h-5 w-5 text-cyan-400" />
                <span className="text-base">Copy</span>
              </button>

              {onShare && (
                <button
                  onClick={() => {
                    onShare();
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-white/90 active:bg-white/5 transition-colors border-t border-white/5 touch-action-manipulation min-h-[52px]"
                  type="button"
                >
                  <Share2 className="h-5 w-5 text-green-400" />
                  <span className="text-base">Share</span>
                </button>
              )}

              {onReply && (
                <button
                  onClick={() => {
                    onReply();
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-white/90 active:bg-white/5 transition-colors border-t border-white/5 touch-action-manipulation min-h-[52px]"
                  type="button"
                >
                  <CornerUpLeft className="h-5 w-5 text-purple-400" />
                  <span className="text-base">Reply</span>
                </button>
              )}

              {isUser && onEdit && (
                <button
                  onClick={() => {
                    onEdit();
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-white/90 active:bg-white/5 transition-colors border-t border-white/5 touch-action-manipulation min-h-[52px]"
                  type="button"
                >
                  <Pencil className="h-5 w-5 text-amber-400" />
                  <span className="text-base">Edit</span>
                </button>
              )}

              {isUser && onDelete && (
                <button
                  onClick={() => {
                    onDelete();
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-red-400 active:bg-white/5 transition-colors border-t border-white/5 touch-action-manipulation min-h-[52px]"
                  type="button"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="text-base">Delete</span>
                </button>
              )}

              {/* Cancel Button */}
              <button
                onClick={onClose}
                className="w-full py-4 text-white/50 active:bg-white/5 transition-colors border-t border-white/10 font-medium touch-action-manipulation min-h-[52px]"
                type="button"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ------------------------------------------
// User Message Bubble (Android Style)
// ------------------------------------------

const UserMessageBubble: React.FC<{
  content: string;
  timestamp?: number;
  isEditing: boolean;
  editContent: string;
  onEditChange: (value: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onLongPress: () => void;
  swipeProgress: number;
  attachments?: MobileMessageProps["attachments"];
}> = ({
  content,
  timestamp,
  isEditing,
  editContent,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onLongPress,
  swipeProgress,
  attachments,
}) => {
  const [showTimestamp, setShowTimestamp] = useState(false);

  const longPressRef = useLongPress<HTMLDivElement>(onLongPress, {
    delay: 400,
  });

  // RTL Detection for User Message
  const isRTL = useMemo(() => {
    const arabicRegex =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(content.slice(0, 100));
  }, [content]);
  return (
    <div className="flex justify-end px-3 py-1">
      <div className="relative max-w-[85%]">
        {/* Swipe Reply Indicator */}
        <AnimatePresence>
          {swipeProgress > 0.3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute -left-10 top-1/2 -translate-y-1/2"
            >
              <CornerUpLeft className="h-5 w-5 text-cyan-400" />
            </motion.div>
          )}
        </AnimatePresence>

        {isEditing ? (
          <div className="bg-[#1a1a1f] rounded-2xl border border-purple-500/50 p-3">
            <Textarea
              value={editContent}
              onChange={(e: any) => onEditChange(e.target.value)}
              className="min-h-[60px] max-h-[150px] w-full bg-transparent border-none text-white focus-visible:ring-0 p-0 resize-none text-[15px]"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-white/10">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-white/50"
                onClick={onCancelEdit}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 px-4 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={onSaveEdit}
              >
                <Check className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div
            ref={longPressRef}
            onClick={() => setShowTimestamp(!showTimestamp)}
            style={{
              transform: `translateX(${-swipeProgress * 40}px) translateZ(0)`,
            }}
            className={cn(
              "relative px-4 py-3 rounded-2xl rounded-tr-md",
              "bg-gradient-to-br from-purple-600 to-violet-700",
              "text-white text-[15px] leading-relaxed",
              "active:scale-[0.98] transition-transform duration-150",
              "shadow-sm shadow-purple-900/20",
              "break-words overflow-hidden"
            )}
          >
            {/* Bubble Content */}
            <span
              className="whitespace-pre-wrap block break-words"
              dir={isRTL ? "rtl" : "ltr"}
            >
              {content}
            </span>

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments
                  .filter((file) => file.storageId)
                  .map((file, idx) => (
                    <MobileAttachmentPreview key={idx} {...file} />
                  ))}
              </div>
            )}

            {/* Timestamp */}
            <AnimatePresence>
              {showTimestamp && timestamp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 text-[10px] text-white/50 text-right"
                >
                  {new Date(timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

// ------------------------------------------
// AI Message Bubble
// ------------------------------------------

const AIMessageBubble: React.FC<{
  content: string;
  isStreaming?: boolean;
  thinkingContent?: string;
  searchContent?: string;
  suggestedQuestions?: string[];
  onLongPress: () => void;
  swipeProgress: number;
  mapQuery?: string; // New prop for Map
  isIOS?: boolean;
  isAndroid?: boolean;
}> = ({
  content,
  isStreaming,
  thinkingContent,
  searchContent,
  suggestedQuestions,
  onLongPress,
  swipeProgress,
  mapQuery,
  isIOS = false,
  isAndroid = false,
}) => {
  const longPressRef = useLongPress<HTMLDivElement>(onLongPress, {
    delay: 400,
  });

  // RTL Detection for AI Message
  const isRTL = useMemo(() => {
    const arabicRegex =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(content.slice(0, 100));
  }, [content]);
  const hasContent = content.trim().length > 0;
  const hasThinking = !!thinkingContent?.trim();
  const hasSearch = !!searchContent?.trim();
  const showReplyIndicator =
    isStreaming && !hasContent && !hasThinking && !hasSearch;

  return (
    <div className="flex gap-2 px-3 py-1">
      {/* AI Avatar */}
      <div className="shrink-0 mt-1">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
          <IconCryonex className="h-4 w-4 text-cyan-400" />
        </div>
      </div>

      {/* Message Content */}
      <div
        ref={longPressRef}
        style={{
          transform: `translateX(${swipeProgress * 40}px)`,
        }}
        className="flex-1 min-w-0 will-change-transform group relative"
      >
        {/* AI Label */}
        <div className="text-[11px] font-semibold text-cyan-400/80 mb-1 uppercase tracking-wider">
          Cryonex AI
        </div>

        {/* Search Status */}
        {hasSearch && (
          <SearchStatus
            query={searchContent!}
            isFinished={!isStreaming || hasContent || hasThinking}
            className="mb-3"
          />
        )}

        {/* Thinking Block */}
        {hasThinking && (
          <ThinkingProcess
            thinking={thinkingContent!}
            isFinished={!isStreaming || hasContent}
            className="mb-3"
          />
        )}

        {/* Map Widget */}
        {mapQuery && (
          <div className="mb-3">
            <MapWidget query={mapQuery} />
          </div>
        )}

        {/* Main Content */}
        {showReplyIndicator ? (
          <LoadingBreadcrumb
            text="Cryonex is replying"
            className="text-[12px] text-white/70"
          />
        ) : hasContent ? (
          <div
            className={cn(
              "rounded-2xl rounded-tl-md px-4 py-3 border transition-colors duration-300",
              isStreaming ? "border-cyan-500/15" : "border-white/5",
              isIOS
                ? "bg-[#1a1a1f]/60 backdrop-blur-xl border-white/10 shadow-sm"
                : isAndroid
                  ? "bg-[#1a1a1f] shadow-md border-white/5"
                  : "bg-[#1a1a1f]/80 hover:bg-[#1a1a1f] border-white/5 hover:border-white/10 transition-all cursor-default",
              "break-words overflow-hidden"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <MobileMarkdownRenderer
              content={content}
              isStreaming={isStreaming}
            />

            {!isIOS && !isAndroid && !isStreaming && (
              <button
                start-icon="true"
                onClick={(e) => {
                  e.stopPropagation();
                  onLongPress();
                }}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/40 text-white/40 hover:text-white hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : null}

        {/* Suggested Questions */}
        {suggestedQuestions &&
          suggestedQuestions.length > 0 &&
          !isStreaming && (
            <div className="mt-3 overflow-x-auto pb-2 -mx-3 px-3 flex gap-2 no-scrollbar snap-x snap-mandatory">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const chatInput = document.querySelector(
                      'textarea[name="prompt"]',
                    ) as HTMLTextAreaElement;
                    if (chatInput) {
                      chatInput.value = question;
                      chatInput.dispatchEvent(
                        new Event("input", { bubbles: true }),
                      );
                      chatInput.focus();
                    }
                  }}
                  className="shrink-0 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[13px] text-white/70 active:bg-white/10 transition-colors text-left max-w-[200px] snap-start"
                >
                  <span className="line-clamp-2">{question}</span>
                </button>
              ))}
            </div>
          )}
      </div>

      {/* Swipe Reply Indicator */}
      <AnimatePresence>
        {swipeProgress > 0.3 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <CornerUpLeft className="h-5 w-5 text-cyan-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ------------------------------------------
// Main Component
// ------------------------------------------

export const MobileMessageRenderer = React.memo(function MobileMessageRenderer({
  role,
  content,
  userImage,
  userName,
  isStreaming,
  timestamp,
  thinkingContent,
  searchContent,
  suggestedQuestions,
  onEdit,
  onReply,
  onDelete,
  attachments,
}: MobileMessageProps) {
  const isUser = role === "user";

  // Native Android bridge for haptics, clipboard, and share
  const { hapticMedium, hapticSelection, copyToClipboard, shareMessage } =
    useCryonexBridge();
  const { isIOS, isAndroid } = useDeviceInfo();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);

  // Sync edit content when message content changes
  React.useEffect(() => {
    setEditContent(content);
  }, [content]);

  // Parse Map Tags logic - similar to NeoMessage
  const { finalContent, mapQuery } = useMemo(() => {
    let rawContent = content;

    // Extract Map Block (<map query="..."> or <map>Location</map>)
    const mapRegex = /<map(?:\s+[^>]*)?>([\s\S]*?)<\/map>/i;
    const mapSelfClosingRegex = /<map\s+query="([^"]*)"\s*\/>/i;

    let query: string | undefined = undefined;
    const mapMatch = rawContent.match(mapRegex);
    const mapSelfMatch = rawContent.match(mapSelfClosingRegex);

    if (mapMatch) {
      query = mapMatch[1].trim();
      rawContent = rawContent.replace(mapRegex, "").trim();
    } else if (mapSelfMatch) {
      query = mapSelfMatch[1].trim();
      rawContent = rawContent.replace(mapSelfClosingRegex, "").trim();
    }

    return { finalContent: rawContent, mapQuery: query };
  }, [content]);

  const handleSwipeProgress = useCallback(
    (progress: number, direction: "left" | "right") => {
      // Only allow swipe right on AI messages (reply)
      // Allow swipe left on user messages (delete indicator)
      if (!isUser && direction === "right") {
        setSwipeProgress(progress);
        // Haptic feedback at threshold
        if (progress > 0.5) {
          hapticSelection();
        }
      } else if (isUser && direction === "left") {
        setSwipeProgress(progress);
      } else {
        setSwipeProgress(0);
      }
    },
    [isUser, hapticSelection],
  );

  const handleSwipeComplete = useCallback(() => {
    if (swipeProgress > 0.5) {
      hapticMedium();
      onReply?.();
    }
    setSwipeProgress(0);
  }, [swipeProgress, onReply, hapticMedium]);

  const swipeRef = useSwipeGesture({
    threshold: 60,
    onSwipeProgress: handleSwipeProgress,
    onSwipeRight: !isUser ? handleSwipeComplete : undefined,
    onSwipeLeft: isUser ? () => setContextMenuOpen(true) : undefined,
  });

  // Native copy with haptic feedback
  const handleCopy = useCallback(async () => {
    await copyToClipboard(content, "Message");
    toast.success("Copied to clipboard");
  }, [content, copyToClipboard]);

  // Native share via Android Intent
  const handleShare = useCallback(async () => {
    const context = isUser ? "My question" : "AI Response";
    try {
      const result = await shareMessage(content, context);

      if (result?.success) {
        void hapticSelection();
        return;
      }
    } catch (error: any) {
      if (
        error?.name === "AbortError" ||
        /cancel/i.test(error?.message || "")
      ) {
        return;
      }
    }

    const url = window.location.href;
    const body = content.length > 1500 ? `${content.slice(0, 1500)}…` : content;
    const payload = `${context}\n\n${body}\n\n${url}`;

    try {
      await copyToClipboard(payload, "Message");
      toast.success("Share link copied");
      void hapticSelection();
    } catch {
      toast.error("Failed to share");
    }
  }, [content, copyToClipboard, hapticSelection, isUser, shareMessage]);

  const handleSaveEdit = useCallback(() => {
    if (editContent.trim() !== content && onEdit) {
      onEdit(editContent);
    }
    setIsEditing(false);
  }, [editContent, content, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setEditContent(content);
    setIsEditing(false);
  }, [content]);

  // Long press with native haptic feedback
  const handleLongPress = useCallback(() => {
    hapticMedium();
    setContextMenuOpen(true);
  }, [hapticMedium]);

  return (
    <>
      <div ref={swipeRef} className="relative">
        {isUser ? (
          <UserMessageBubble
            content={finalContent}
            timestamp={timestamp}
            isEditing={isEditing}
            editContent={editContent}
            onEditChange={setEditContent}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            onLongPress={handleLongPress}
            swipeProgress={swipeProgress}
            attachments={attachments}
          />
        ) : (
          <AIMessageBubble
            content={finalContent}
            isStreaming={isStreaming}
            thinkingContent={thinkingContent}
            searchContent={searchContent}
            suggestedQuestions={suggestedQuestions}
            onLongPress={handleLongPress}
            swipeProgress={swipeProgress}
            mapQuery={mapQuery}
            isIOS={isIOS}
            isAndroid={isAndroid}
          />
        )}
      </div>

      <MobileContextMenu
        isOpen={contextMenuOpen}
        onClose={() => setContextMenuOpen(false)}
        onCopy={handleCopy}
        onShare={handleShare}
        onEdit={onEdit ? () => setIsEditing(true) : undefined}
        onReply={onReply}
        onDelete={onDelete}
        isUser={isUser}
      />
    </>
  );
});

export default MobileMessageRenderer;
