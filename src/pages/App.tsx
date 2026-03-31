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
import { Laptop2, PanelTopDashed, TabletSmartphone } from "lucide-react";

// Modular UI Components
import { ChatHeader } from "@/components/chat/ChatHeader";
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
const ChatMessagesList = lazy(() =>
  import("@/components/chat/ChatMessagesList").then((m) => ({
    default: m.ChatMessagesList,
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
  const isLight = mode === "light";
  const workspaceSignature = deviceInfo.isSmartboard
    ? {
        label: "Board mode",
        title: "Clean contrast for classroom tablets and smart boards.",
        description:
          "Larger targets, calmer gradients, and lighter effects keep the workspace responsive from the back of the room.",
        chip: "Android large-format",
        Icon: PanelTopDashed,
        panelClass: isLight
          ? "border-emerald-300/55 bg-white/78"
          : "border-emerald-300/18 bg-[rgba(8,18,20,0.82)]",
        iconClass: isLight
          ? "bg-emerald-100 text-emerald-700"
          : "bg-emerald-300/12 text-emerald-200",
      }
    : deviceInfo.isAndroid
      ? {
          label: "Android shell",
          title: "Sharper lanes and faster scanning on touch-first hardware.",
          description:
            "Cryonex trims visual weight on Android tablets so capture, review, and prompting stay quick under classroom conditions.",
          chip: "Tablet-ready",
          Icon: TabletSmartphone,
          panelClass: isLight
            ? "border-cyan-300/55 bg-white/78"
            : "border-cyan-300/18 bg-[rgba(7,20,24,0.78)]",
          iconClass: isLight
            ? "bg-cyan-100 text-cyan-700"
            : "bg-cyan-300/12 text-cyan-200",
        }
      : deviceInfo.isIOS
        ? {
            label: "iPad studio",
            title: "Softer glass, calmer spacing, and a more native-feeling canvas.",
            description:
              "The iOS surface keeps the same workflow, but leans into a cleaner layered feel that fits iPad and iPhone better.",
            chip: "Apple-native tone",
            Icon: TabletSmartphone,
            panelClass: isLight
              ? "border-sky-300/55 bg-white/80"
              : "border-sky-300/18 bg-[rgba(10,18,32,0.66)]",
            iconClass: isLight
              ? "bg-sky-100 text-sky-700"
              : "bg-sky-300/12 text-sky-200",
          }
        : {
            label: "Web studio",
            title: "Wide-screen deep work with a more cinematic command deck.",
            description:
              "Desktop web keeps the richer atmospheric shell so long sessions feel immersive without changing the product structure.",
            chip: "Desktop flow",
            Icon: Laptop2,
            panelClass: isLight
              ? "border-fuchsia-300/55 bg-white/80"
              : "border-fuchsia-300/18 bg-[rgba(18,10,42,0.72)]",
            iconClass: isLight
              ? "bg-fuchsia-100 text-fuchsia-700"
              : "bg-fuchsia-300/12 text-fuchsia-200",
          };
  const SignatureIcon = workspaceSignature.Icon;

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
                  isLight
                    ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.52),rgba(241,245,249,0.2),rgba(255,255,255,0.1))]"
                    : "bg-[linear-gradient(180deg,rgba(3,9,16,0.88),rgba(7,17,21,0.5),rgba(3,9,16,0.92))]",
                )}
              />
              <div
                className={cn(
                  "absolute inset-0",
                  isLight
                    ? "opacity-[0.05] [background-image:linear-gradient(to_right,rgba(15,23,42,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.1)_1px,transparent_1px)] [background-size:28px_28px]"
                    : "opacity-[0.08] [background-image:linear-gradient(to_right,rgba(94,234,212,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(94,234,212,0.08)_1px,transparent_1px)] [background-size:28px_28px]",
                )}
              />
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
                  isLight ? "bg-fuchsia-300/20" : "bg-[#5e37c3]/10",
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
            className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar mobile-scroll-thin"
            ref={scrollRef}
          >
            <div
              className={cn(
                "mx-auto w-full transition-[padding] duration-200",
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
                  : { paddingBottom: `${bottomPadding}px` }
              }
            >
              {showEmptyState ? (
                <>
                  <div
                    className={cn(
                      "mb-6 w-full max-w-3xl rounded-[1.6rem] border p-4 sm:mb-8 sm:p-5",
                      workspaceSignature.panelClass,
                    )}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-2xl",
                            workspaceSignature.iconClass,
                          )}
                        >
                          <SignatureIcon className="size-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground/80">
                            {workspaceSignature.label}
                          </p>
                          <h2 className="mt-2 text-pretty text-lg font-semibold text-foreground sm:text-xl">
                            {workspaceSignature.title}
                          </h2>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            {workspaceSignature.description}
                          </p>
                        </div>
                      </div>
                      <div className="inline-flex items-center rounded-full border border-white/10 bg-background/55 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                        {workspaceSignature.chip}
                      </div>
                    </div>
                  </div>
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
