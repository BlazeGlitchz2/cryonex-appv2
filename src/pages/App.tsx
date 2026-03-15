import React, { useRef, useEffect, lazy, Suspense } from "react";
import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useConvex } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useLocation } from "react-router";
import { createPortal } from "react-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSmartScroll } from "@/hooks/use-smart-scroll";
import { SourcePreviewProvider } from "@/components/ui/source-preview";

// Modular UI Components
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessagesList } from "@/components/chat/ChatMessagesList";
import { ChatInputArea } from "@/components/chat/ChatInputArea";

// Hooks
import { useChatHandlers } from "@/hooks/use-chat-handlers";
import { useChatEffects } from "@/hooks/use-chat-effects";
import { useSaveContent } from "@/hooks/use-save-content";
import { useInputPadding } from "@/hooks/use-input-padding";

// Lazy Loaded Non-Critical Components
const ChatSaveDialog = lazy(() => import("@/components/chat/ChatSaveDialog").then(m => ({ default: m.ChatSaveDialog })));
const WelcomePopup = lazy(() => import("@/components/WelcomePopup").then(m => ({ default: m.WelcomePopup })));
const ProWelcomePopup = lazy(() => import("@/components/ProWelcomePopup").then(m => ({ default: m.ProWelcomePopup })));
const OfflineDownloadDialog = lazy(() => import("@/components/offline/OfflineDownloadDialog").then(m => ({ default: m.OfflineDownloadDialog })));
const SubwaySurfersOverlay = lazy(() => import("@/components/ui/subway-surfers").then(m => ({ default: m.SubwaySurfersOverlay })));
const EmojiRatingWrapper = lazy(() => import("@/components/EmojiRatingWrapper").then(m => ({ default: m.EmojiRatingWrapper })));
const FocusBackground = lazy(() => import("@/components/ui/focus-background").then(m => ({ default: m.FocusBackground })));
const ChatEmptyState = lazy(() => import("@/components/chat/ChatEmptyState").then(m => ({ default: m.ChatEmptyState })));
const MobileHome = lazy(() => import("@/pages/MobileHome"));

export default function App() {
  const convex = useConvex();
  const { user } = useAuth();
  const location = useLocation();
  const { toggleSubwaySurfers, showSubwaySurfers, isMobileSidebarOpen } = useUIStore();
  const { currentChatId, setCurrentChatId, activeModel } = useChatStore();
  const { chatId: urlChatId } = useParams();
  const isMobile = useIsMobile();
  const typedChatId = (urlChatId || currentChatId) as Id<"chats"> | null;
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("project") as Id<"projects"> | null;

  // External Data
  const project = useQuery(api.projects.get, projectId ? { id: projectId } : "skip");
  const dbMessages = useQuery(api.messages.list, typedChatId && user ? { chatId: typedChatId } : "skip");
  const currentChat = useQuery(api.chats.get, typedChatId ? { chatId: typedChatId } : "skip");

  // Hooks
  const {
    messages,
    isStreaming,
    streamingContent,
    temporaryModel,
    pendingMessages,
    handleSend,
    handleEditMessage,
    handleStop,
  } = useChatHandlers({ user, typedChatId, projectId, dbMessages, currentChat });

  const {
    saveDialogOpen,
    setSaveDialogOpen,
    saveTitle,
    setSaveTitle,
    saveCategory,
    setSaveCategory,
    saveType,
    setSaveType,
    executeSave,
  } = useSaveContent();

  useChatEffects(convex, user, handleSend);

  const { scrollRef, showScrollButton, scrollToBottom } = useSmartScroll<HTMLDivElement>({ threshold: 30 });
  const inputRef = useRef<HTMLDivElement>(null);
  const bottomPadding = useInputPadding(inputRef);

  // Sync Chat ID with URL
  useEffect(() => {
    if (urlChatId) {
      if (currentChatId !== urlChatId) setCurrentChatId(urlChatId as Id<"chats">);
    } else if (location.pathname === "/app" && currentChatId) {
      setCurrentChatId(null);
    }
  }, [urlChatId, location.pathname, currentChatId, setCurrentChatId]);

  // Scroll Management
  useEffect(() => {
    if (pendingMessages.length > 0) scrollToBottom(false);
  }, [pendingMessages.length, scrollToBottom]);

  useEffect(() => {
    if (isStreaming) scrollToBottom(true);
  }, [isStreaming, scrollToBottom]);

  const showEmptyState = !messages || messages.length === 0;

  return (
    <SourcePreviewProvider>
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0 pointer-events-none">
          {showSubwaySurfers && <FocusBackground />}
        </div>

        <WelcomePopup />
        <ProWelcomePopup />
        <OfflineDownloadDialog />
        <SubwaySurfersOverlay />
        <EmojiRatingWrapper />
      </Suspense>

      <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-transparent z-10">
        <ChatHeader
          isMobile={isMobile}
          showSubwaySurfers={showSubwaySurfers}
          toggleSubwaySurfers={toggleSubwaySurfers}
        />

        <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
          {isMobile && showEmptyState ? (
            <div className="flex-1 overflow-y-auto mobile-scroll-thin">
              <Suspense fallback={<div className="h-full flex items-center justify-center animate-pulse text-white/20">Loading...</div>}>
                <MobileHome />
              </Suspense>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar mobile-scroll-thin" ref={scrollRef}>
              <div
                className="max-w-4xl mx-auto w-full px-4 md:px-0 pt-20 min-h-full flex flex-col transition-[padding] duration-200"
                style={{ paddingBottom: `${bottomPadding}px` }}
              >
                {showEmptyState ? (
                  <Suspense fallback={null}>
                    <ChatEmptyState project={project} onSend={handleSend} />
                  </Suspense>
                ) : (
                  <ChatMessagesList
                    messages={messages}
                    user={user}
                    isStreaming={isStreaming}
                    streamingContent={streamingContent}
                    temporaryModel={temporaryModel}
                    activeModel={activeModel}
                    handleEditMessage={handleEditMessage}
                  />
                )}
              </div>
            </div>
          )}

          {isMobile
            ? createPortal(
              <ChatInputArea
                ref={inputRef}
                isMobile={isMobile}
                isMobileSidebarOpen={isMobileSidebarOpen}
                isStreaming={isStreaming}
                showScrollButton={showScrollButton}
                onSend={handleSend}
                onStop={handleStop}
                scrollToBottom={scrollToBottom}
              />,
              document.body,
            )
            : (
              <ChatInputArea
                ref={inputRef}
                isMobile={isMobile}
                isMobileSidebarOpen={isMobileSidebarOpen}
                isStreaming={isStreaming}
                showScrollButton={showScrollButton}
                onSend={handleSend}
                onStop={handleStop}
                scrollToBottom={scrollToBottom}
              />
            )}
        </div>

        <Suspense fallback={null}>
          <ChatSaveDialog
            open={saveDialogOpen}
            onOpenChange={setSaveDialogOpen}
            saveTitle={saveTitle}
            setSaveTitle={setSaveTitle}
            saveCategory={saveCategory}
            setSaveCategory={setSaveCategory}
            saveType={saveType}
            setSaveType={setSaveType}
            onSave={executeSave}
          />
        </Suspense>
      </div>
    </SourcePreviewProvider>
  );
}
