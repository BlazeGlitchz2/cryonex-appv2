import React, { useRef, useEffect, lazy, Suspense } from "react";
import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useConvex } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useLocation } from "react-router";
import { createPortal } from "react-dom";
import { useDeviceType } from "@/hooks/use-mobile";
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
const ChatSaveDialog = lazy(() =>
  import("@/components/chat/ChatSaveDialog").then((m) => ({
    default: m.ChatSaveDialog,
  })),
);
const OfflineDownloadDialog = lazy(() =>
  import("@/components/offline/OfflineDownloadDialog").then((m) => ({
    default: m.OfflineDownloadDialog,
  })),
);
const SubwaySurfersOverlay = lazy(() =>
  import("@/components/ui/subway-surfers").then((m) => ({
    default: m.SubwaySurfersOverlay,
  })),
);
const FocusBackground = lazy(() =>
  import("@/components/ui/focus-background").then((m) => ({
    default: m.FocusBackground,
  })),
);
const ChatEmptyState = lazy(() =>
  import("@/components/chat/ChatEmptyState").then((m) => ({
    default: m.ChatEmptyState,
  })),
);

export default function App() {
  const convex = useConvex();
  const { user } = useAuth();
  const location = useLocation();
  const { toggleSubwaySurfers, showSubwaySurfers, isMobileSidebarOpen } =
    useUIStore();
  const { currentChatId, setCurrentChatId, activeModel } = useChatStore();
  const { chatId: urlChatId } = useParams();
  const deviceType = useDeviceType();
  const isMobile = deviceType === "phone";
  const isTablet = deviceType === "tablet";
  const usesTouchShell = deviceType !== "desktop";
  const typedChatId = (urlChatId || currentChatId) as Id<"chats"> | null;
  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get("project") as Id<"projects"> | null;

  // External Data
  const project = useQuery(
    api.projects.get,
    projectId ? { id: projectId } : "skip",
  );
  const dbMessages = useQuery(
    api.messages.list,
    typedChatId && user ? { chatId: typedChatId } : "skip",
  );
  const currentChat = useQuery(
    api.chats.get,
    typedChatId ? { chatId: typedChatId } : "skip",
  );

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
  } = useChatHandlers({
    user,
    typedChatId,
    projectId,
    dbMessages,
    currentChat,
  });

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

  const { scrollRef, showScrollButton, scrollToBottom } =
    useSmartScroll<HTMLDivElement>({ threshold: 30 });
  const inputRef = useRef<HTMLDivElement>(null);
  const bottomPadding = useInputPadding(inputRef);

  // Sync Chat ID with URL
  useEffect(() => {
    if (urlChatId) {
      if (currentChatId !== urlChatId)
        setCurrentChatId(urlChatId as Id<"chats">);
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_18%,rgba(120,70,255,0.18),transparent_0,transparent_24%),radial-gradient(circle_at_42%_60%,rgba(104,58,255,0.12),transparent_24%),radial-gradient(circle_at_78%_22%,rgba(92,106,255,0.08),transparent_18%),linear-gradient(180deg,#09032f_0%,#060220_55%,#040115_100%)]" />
          <div className="absolute inset-0 opacity-[0.1] [background-image:radial-gradient(circle,rgba(255,255,255,0.82)_1px,transparent_1.35px)] [background-size:36px_36px]" />
          <div className="absolute bottom-[14%] left-[44%] h-52 w-40 rounded-full bg-[#5e37c3]/10 blur-[90px]" />
        </div>

        <ChatHeader
          usesTouchShell={usesTouchShell}
          isTablet={isTablet}
          showSubwaySurfers={showSubwaySurfers}
          toggleSubwaySurfers={toggleSubwaySurfers}
        />

        <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
          <div
            className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar mobile-scroll-thin"
            ref={scrollRef}
          >
            <div
              className={cn(
                "mx-auto w-full px-4 transition-[padding] duration-200",
                useHeroLayout
                  ? isTablet
                    ? "flex min-h-full max-w-5xl flex-col items-center justify-center pb-20 pt-20 md:px-0 lg:pb-24 lg:pt-24"
                    : "flex min-h-full max-w-5xl flex-col items-center justify-center pb-16 pt-16 md:pb-20 md:pt-20"
                  : isTablet
                    ? "flex min-h-full max-w-5xl flex-col px-0 pt-20 lg:pt-24"
                    : "flex min-h-full max-w-4xl flex-col pt-20 md:px-0",
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
                      usesTouchShell={usesTouchShell}
                      isTablet={isTablet}
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

          {!useHeroLayout &&
            (usesTouchShell ? (
              createPortal(
                <ChatInputArea
                  ref={inputRef}
                  usesTouchShell={usesTouchShell}
                  isTablet={isTablet}
                  isMobileSidebarOpen={isMobileSidebarOpen}
                  isStreaming={isStreaming}
                  showScrollButton={showScrollButton}
                  onSend={handleSend}
                  onStop={handleStop}
                  scrollToBottom={scrollToBottom}
                />,
                document.body,
              )
            ) : (
              <ChatInputArea
                ref={inputRef}
                usesTouchShell={usesTouchShell}
                isTablet={isTablet}
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
