import React, { useRef, useEffect, lazy, Suspense } from "react";
import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useConvex } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useParams, useLocation } from "react-router";
import { createPortal } from "react-dom";
import { useDeviceInfo, useDeviceType } from "@/hooks/use-mobile";
import { useSmartScroll } from "@/hooks/use-smart-scroll";
import { SourcePreviewProvider } from "@/components/ui/source-preview";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";
import { AuroraThemeBackground } from "@/components/ui/background-gradient-glow";
import { useOptimization } from "@/components/SmartOptimizer";

// Modular UI Components
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatInputArea } from "@/components/chat/ChatInputArea";
import { ChatMessagesList } from "@/components/chat/ChatMessagesList";

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
  const mode = useThemeStore((state) => state.mode);
  const convex = useConvex();
  const { user } = useAuth();
  const location = useLocation();
  const { toggleSubwaySurfers, showSubwaySurfers, isMobileSidebarOpen } =
    useUIStore();
  const { currentChatId, setCurrentChatId, activeModel } = useChatStore();
  const { chatId: urlChatId } = useParams();
  const deviceType = useDeviceType();
  const deviceInfo = useDeviceInfo();
  const { shouldShowHeavyEffects } = useOptimization();
  const isMobile = deviceType === "phone";
  const isTablet = deviceType === "tablet";
  const usesTouchShell = isMobile;
  const shouldUseCalmAmbientShell =
    usesTouchShell ||
    !shouldShowHeavyEffects ||
    deviceInfo.isSmartboard ||
    (deviceInfo.isAndroid && isTablet);
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
    useSmartScroll<HTMLDivElement>({ threshold: 250 });
  const inputRef = useRef<HTMLDivElement>(null);
  const bottomPadding = useInputPadding(inputRef, {
    usesTouchShell,
  });

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

  const showEmptyState = (!messages || messages.length === 0) && !isStreaming;
  const useHeroLayout = showEmptyState;
  const isLight = mode === "light";
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
          {shouldUseCalmAmbientShell ? (
            <>
              <div
                className={cn(
                  "absolute inset-0",
                  usesTouchShell && isLight
                    ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(248,250,252,0.62),rgba(255,255,255,0.38))]"
                    : usesTouchShell
                      ? "bg-[linear-gradient(180deg,rgba(7,12,23,0.96),rgba(9,14,24,0.86),rgba(5,9,17,0.98))]"
                    : isLight
                    ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(241,245,249,0.2),rgba(255,255,255,0.1))]"
                    : "bg-[linear-gradient(180deg,rgba(3,9,16,0.88),rgba(7,17,21,0.5),rgba(3,9,16,0.92))]",
                )}
              />
              {usesTouchShell ? (
                <div
                  className={cn(
                    "absolute inset-0",
                    isLight
                      ? "bg-[radial-gradient(circle_at_top,rgba(191,219,254,0.32),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(226,232,240,0.3),transparent_24%)]"
                      : "bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.1),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(148,163,184,0.08),transparent_22%)]",
                  )}
                />
              ) : null}
              {!usesTouchShell ? (
                <div
                  className={cn(
                    "absolute inset-0",
                    isLight
                      ? "opacity-[0.05] [background-image:linear-gradient(to_right,rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.1)_1px,transparent_1px)] [background-size:28px_28px]"
                      : "opacity-[0.08] [background-image:linear-gradient(to_right,rgba(94,234,212,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(94,234,212,0.08)_1px,transparent_1px)] [background-size:28px_28px]",
                  )}
                />
              ) : null}
            </>
          ) : (
            <>
              <AuroraThemeBackground
                className="absolute inset-0 min-h-0"
                contentClassName="hidden"
              />
              <div
                className={cn(
                  "absolute inset-0",
                  isLight
                    ? "opacity-[0.1] [background-image:radial-gradient(circle,rgba(255,255,255,0.88)_1px,transparent_1.5px)] [background-size:40px_40px]"
                    : "opacity-[0.1] [background-image:radial-gradient(circle,rgba(255,255,255,0.82)_1px,transparent_1.35px)] [background-size:36px_36px]",
                )}
              />
              <div
                className={cn(
                  "absolute bottom-[14%] left-[44%] h-52 w-40 rounded-full blur-[90px]",
                  isLight ? "bg-blue-300/20" : "bg-[#5e37c3]/10",
                )}
              />
            </>
          )}
        </div>

        <ChatHeader
          usesTouchShell={usesTouchShell}
          isTablet={isTablet}
          showSubwaySurfers={showSubwaySurfers}
          toggleSubwaySurfers={toggleSubwaySurfers}
        />

        <div className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
          <div
            className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain scroll-smooth custom-scrollbar mobile-scroll-thin"
            ref={scrollRef}
          >
            <div
              className={cn(
                "mx-auto w-full",
                useHeroLayout
                  ? isTablet
                    ? "flex min-h-full w-full max-w-none flex-col items-center justify-center px-6 pb-20 pt-20 lg:px-10 lg:pb-24 lg:pt-24"
                    : "flex min-h-full w-full max-w-none flex-col items-center justify-center px-4 pb-16 pt-16 md:px-8 md:pb-20 md:pt-20 xl:px-12"
                  : isTablet
                    ? "flex min-h-full w-full max-w-none flex-col px-6 pt-20 lg:px-10 lg:pt-24"
                    : "flex min-h-full w-full max-w-none flex-col px-4 pt-20 md:px-8 xl:px-12",
              )}
              style={
                useHeroLayout
                  ? undefined
                  : {
                      paddingBottom: bottomPadding,
                    }
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
                <Suspense fallback={null}>
                  <ChatMessagesList
                    messages={messages}
                    user={user}
                    isStreaming={isStreaming}
                    streamingContent={streamingContent}
                    temporaryModel={temporaryModel}
                    activeModel={activeModel}
                    handleEditMessage={handleEditMessage}
                  />
                </Suspense>
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
