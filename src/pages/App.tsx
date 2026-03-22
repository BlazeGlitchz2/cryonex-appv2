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
import { cn } from "@/lib/utils";

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
const OfflineDownloadDialog = lazy(() => import("@/components/offline/OfflineDownloadDialog").then(m => ({ default: m.OfflineDownloadDialog })));
const SubwaySurfersOverlay = lazy(() => import("@/components/ui/subway-surfers").then(m => ({ default: m.SubwaySurfersOverlay })));
const FocusBackground = lazy(() => import("@/components/ui/focus-background").then(m => ({ default: m.FocusBackground })));
const ChatEmptyState = lazy(() => import("@/components/chat/ChatEmptyState").then(m => ({ default: m.ChatEmptyState })));

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
  const useHeroLayout = showEmptyState;

  return (
    <SourcePreviewProvider>
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0 pointer-events-none">
          {showSubwaySurfers && <FocusBackground />}
        </div>

        <OfflineDownloadDialog />
        <SubwaySurfersOverlay />
      </Suspense>

      <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-transparent z-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_16%,rgba(143,169,255,0.16),transparent_0,transparent_25%),radial-gradient(circle_at_18%_26%,rgba(255,255,255,0.06),transparent_18%),radial-gradient(circle_at_76%_18%,rgba(109,127,255,0.08),transparent_20%),linear-gradient(180deg,#10151d_0%,#0c1118_55%,#090d14_100%)]" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle,rgba(255,255,255,0.82)_1px,transparent_1.3px)] [background-size:40px_40px]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.025)_1px,transparent_1px)] [background-size:84px_84px] opacity-[0.03]" />
          <div className="absolute bottom-[16%] left-[50%] h-56 w-52 rounded-full bg-[#8ba5ff]/10 blur-[110px]" />
        </div>

        <ChatHeader
          isMobile={isMobile}
          showSubwaySurfers={showSubwaySurfers}
          toggleSubwaySurfers={toggleSubwaySurfers}
        />

        <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
          <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar mobile-scroll-thin" ref={scrollRef}>
            <div
              className={cn(
                "mx-auto w-full px-4 transition-[padding] duration-200",
                useHeroLayout
                  ? "flex min-h-full max-w-[78rem] flex-col items-center justify-center pb-16 pt-20 md:pb-20 md:pt-24"
                  : "flex min-h-full max-w-[56rem] flex-col pt-24 md:px-0",
              )}
              style={
                useHeroLayout
                  ? undefined
                  : { paddingBottom: `${bottomPadding}px` }
              }
            >
              {showEmptyState ? (
                <>
                  <Suspense fallback={null}>
                    <ChatEmptyState project={project} onSend={handleSend} />
                  </Suspense>
                  <div className="mt-8 w-full md:mt-10">
                    <ChatInputArea
                      ref={inputRef}
                      isHero
                      isMobile={isMobile}
                      isMobileSidebarOpen={isMobileSidebarOpen}
                      isStreaming={isStreaming}
                      showScrollButton={false}
                      onSend={handleSend}
                      onStop={handleStop}
                      scrollToBottom={scrollToBottom}
                    />
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <ChatMessagesList
                    messages={messages}
                    user={user}
                    isStreaming={isStreaming}
                    streamingContent={streamingContent}
                    temporaryModel={temporaryModel}
                    activeModel={activeModel}
                    handleEditMessage={handleEditMessage}
                  />
                </div>
              )}
            </div>
          </div>

          {!useHeroLayout &&
            (isMobile
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
              ))}
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
