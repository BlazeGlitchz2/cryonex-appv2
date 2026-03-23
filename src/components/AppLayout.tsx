import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { LiquidSidebar } from "@/components/layout/LiquidSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, MessageCircleMore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelPicker } from "@/components/models/ModelPicker";
import { useChatStore } from "@/lib/stores/chat-store";
import { AnimatePresence, motion } from "framer-motion";
import { GlobalSearch } from "@/components/GlobalSearch";
import { SubwaySurfersOverlay } from "@/components/ui/subway-surfers";
import { useUIStore } from "@/lib/stores/ui-store";
import { Gamepad2 } from "lucide-react";
import { useSessionTracking } from "@/hooks/use-session-tracking";
import { ActivityDropdown } from "@/components/ui/activity-dropdown";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { cn } from "@/lib/utils";
import { PerformanceOptimizer } from "@/components/performance/PerformanceOptimizer";
import { StudyModeToggle } from "@/components/study/StudyModeToggle";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { MobileOnboarding } from "@/components/onboarding/MobileOnboarding";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { QuickActionsBar } from "@/components/mobile/QuickActionsBar";

export default function AppLayout() {
  const { isModelBrowserOpen, setModelBrowserOpen } = useChatStore();
  const {
    toggleSubwaySurfers,
    showSubwaySurfers,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUIStore();
  const location = useLocation();
  const qualityTier = usePerformanceStore((state) => state.qualityTier);
  const isLite = qualityTier === "lite";
  const isAssistantRoute =
    location.pathname === "/app" ||
    location.pathname.startsWith("/app/") ||
    location.pathname.startsWith("/study/copilot");

  useSessionTracking();
  const deviceType = useDeviceType();
  const isTablet = deviceType === "tablet";
  const isCompactDevice = deviceType !== "desktop";
  // Smart tablet optimization: use reduced backdrop-filter complexity
  const useTabletOptimizations = isTablet;
  const mobileDockPadding = isTablet
    ? "calc(env(safe-area-inset-bottom, 0px) + 9.75rem)"
    : "calc(env(safe-area-inset-bottom, 0px) + 8.75rem)";
  const mobileContentStyle = isCompactDevice
    ? {
        ...(useTabletOptimizations ? { willChange: "opacity" as const } : {}),
        ...(!isAssistantRoute ? { paddingBottom: mobileDockPadding } : {}),
      }
    : undefined;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  return (
    <div
      className={cn(
        "relative flex h-[100dvh] overflow-hidden text-[#ffffff] selection:text-white",
        "bg-[#050218] selection:bg-[#D244FF]/25",
      )}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(109,58,255,0.22),transparent_0,transparent_28%),radial-gradient(circle_at_24%_32%,rgba(126,65,255,0.1),transparent_18%),radial-gradient(circle_at_76%_26%,rgba(92,106,255,0.09),transparent_20%),radial-gradient(circle_at_54%_72%,rgba(149,88,255,0.08),transparent_26%),linear-gradient(180deg,#09032f_0%,#060220_58%,#040115_100%)]" />
        <div className="absolute inset-0 opacity-[0.11] [background-image:radial-gradient(circle,rgba(255,255,255,0.85)_1px,transparent_1.4px)] [background-size:36px_36px]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,rgba(255,255,255,0.75)_1px,transparent_1.2px)] [background-position:18px_18px] [background-size:62px_62px]" />
        <div className="absolute left-[58%] top-[38%] h-[1px] w-44 rotate-[-28deg] bg-gradient-to-r from-transparent via-white/18 to-transparent opacity-45" />
      </div>

      <div className="fixed inset-0 z-[1] pointer-events-none">
        {!showSubwaySurfers && (
          <>
            <div
              className={cn(
                "absolute inset-0",
                useTabletOptimizations
                  ? "bg-[#050218]/50"
                  : "bg-[rgba(5,2,24,0.28)] backdrop-blur-[1.5px]",
              )}
              style={
                useTabletOptimizations ? { willChange: "auto" } : undefined
              }
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_22%,rgba(0,0,0,0.22))]" />
          </>
        )}
      </div>

      {!isCompactDevice && (
        <div
          className={cn(
            "relative z-20 hidden md:block h-full shrink-0",
            isTablet ? "p-2" : "p-4",
          )}
        >
          <LiquidSidebar className="h-full" isTablet={isTablet} />
        </div>
      )}

      {isCompactDevice && (
        <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent
            side="left"
            className={cn(
              "overflow-hidden border-r border-white/[0.06] p-0",
              isTablet ? "w-[340px]" : "w-[280px]",
              "bg-[#0a0625]/96",
            )}
          >
            <div className="absolute left-0 top-0 z-0 h-[30%] w-[80%] rounded-full blur-[80px] pointer-events-none bg-[#D244FF]/12" />
            <div className="absolute bottom-0 right-0 z-0 h-[30%] w-[80%] rounded-full blur-[80px] pointer-events-none bg-[#4f4297]/12" />
            <LiquidSidebar
              isMobile
              isTablet={isTablet}
              className="h-full w-full border-none bg-transparent relative z-10"
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden">
        {isCompactDevice && (
          <header
            className={cn(
              "safe-top z-40 flex shrink-0 items-center justify-between",
              isTablet ? "h-16 px-5" : "h-14 px-4",
              isAssistantRoute
                ? "absolute inset-x-0 top-0 border-b-0 bg-transparent backdrop-blur-0"
                : "border-b border-white/[0.06] bg-[rgba(10,6,37,0.92)] backdrop-blur-xl",
            )}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(true)}
                className={cn(
                  "rounded-xl text-white touch-feedback hover:bg-white/10",
                  isTablet ? "h-11 w-11" : "h-10 w-10",
                )}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div
                className={cn(
                  "flex items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(135deg,rgba(147,101,255,0.32),rgba(218,103,255,0.18))]",
                  isTablet ? "h-10 w-10" : "h-9 w-9",
                )}
              >
                <img
                  src="/logo.png"
                  alt="Cryonex"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "font-semibold tracking-tight text-white",
                    isTablet ? "text-base" : "text-sm",
                  )}
                >
                  Cryonex
                </p>
                <p
                  className={cn(
                    "text-[11px] uppercase tracking-[0.18em] text-white/38",
                    isAssistantRoute && "text-white/28",
                  )}
                >
                  Private study AI
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-xl touch-feedback transition-all",
                isTablet ? "h-11 w-11" : "h-10 w-10",
                showSubwaySurfers
                  ? "border border-[#d46dff]/30 bg-[#d46dff]/14 text-[#f2c8ff]"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10",
              )}
              onClick={toggleSubwaySurfers}
            >
              <Gamepad2 className="h-5 w-5" />
            </Button>
          </header>
        )}

        {/* Desktop/Tablet Header / Activity Bar */}
        {!isCompactDevice && !isAssistantRoute && (
          <div
            className={cn(
              "absolute z-50",
              isTablet ? "top-3 right-3" : "top-6 right-6", // Smaller offset for tablets
            )}
          >
            <div
              className={cn("flex items-center", isTablet ? "gap-2" : "gap-3")}
            >
              <div id="onboarding-study-toggle">
                <StudyModeToggle />
              </div>
              <div
                id="onboarding-activity-dropdown"
                className="rounded-2xl border border-white/[0.06] bg-[#0a0625]/72 backdrop-blur-xl"
              >
                <ActivityDropdown />
              </div>
            </div>
          </div>
        )}

        <main
          className={cn(
            "flex-1 overflow-hidden relative w-full",
            isCompactDevice
              ? "p-0"
              : isAssistantRoute
                ? "p-0 md:px-5 md:pb-5 md:pt-3"
                : "p-0 md:p-0 md:pr-4 md:py-4",
          )}
        >
          <div
            className={cn(
              "h-full w-full overflow-hidden relative",
              isAssistantRoute
                ? "rounded-none border-0 bg-transparent"
                : isCompactDevice
                  ? "rounded-none border-0"
                  : "border border-white/15 md:rounded-md",
              !isCompactDevice && !isLite && !isAssistantRoute && "glass-panel",
              isLite && "bg-[#0a0625]",
            )}
            style={
              !isCompactDevice && !isAssistantRoute
                ? {
                    background: "rgba(10, 6, 37, 0.88)",
                    borderColor: "rgba(210, 68, 255, 0.1)",
                  }
                : undefined
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={
                  useTabletOptimizations
                    ? { opacity: 0.9 }
                    : { opacity: 0, y: 12, scale: 0.99 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  useTabletOptimizations
                    ? { opacity: 0.9 }
                    : { opacity: 0, y: -6, scale: 0.995 }
                }
                transition={
                  useTabletOptimizations
                    ? { duration: 0.15 }
                    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                }
                className={cn(
                  "h-full w-full overflow-y-auto custom-scrollbar mobile-scroll-thin",
                  isCompactDevice && !isAssistantRoute && "pb-0",
                )}
                style={mobileContentStyle}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation & Quick Actions */}
      {!isAssistantRoute && <QuickActionsBar />}
      {!isAssistantRoute && <MobileBottomNav />}

      {isAssistantRoute && (
        <button
          type="button"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-[linear-gradient(180deg,rgba(146,73,229,0.9),rgba(96,45,161,0.92))] text-white shadow-[0_20px_40px_rgba(54,18,91,0.35)] transition-transform hover:scale-[1.03]"
          aria-label="Open support chat"
        >
          <MessageCircleMore className="h-6 w-6" />
        </button>
      )}

      {/* Mobile Onboarding */}
      {isCompactDevice && !isAssistantRoute && <MobileOnboarding />}

      <ModelPicker
        open={isModelBrowserOpen}
        onOpenChange={setModelBrowserOpen}
      />
      <GlobalSearch />
      <SubwaySurfersOverlay />
      {!isModelBrowserOpen && !isCompactDevice && !isAssistantRoute && (
        <OnboardingTour
          tourId="main-app"
          steps={[
            {
              targetId: "onboarding-sidebar-search",
              title: "Global Search",
              description:
                "Press Cmd+K to search your chats, libraries, and tools instantly.",
              position: "right",
            },
            {
              targetId: "onboarding-nav-assistant",
              title: "AI Assistant",
              description:
                "Chat with our advanced AI models. Switch between models seamlessly.",
              position: "right",
            },
            {
              targetId: "onboarding-nav-studio",
              title: "Creative Studio",
              description:
                "Generate images, videos, and music in the Media Studio.",
              position: "right",
            },
            {
              targetId: "onboarding-study-toggle",
              title: "Focus Mode",
              description:
                "Toggle distraction-free mode for deep work and study sessions.",
              position: "bottom",
            },
            {
              targetId: "onboarding-activity-dropdown",
              title: "Activity Hub",
              description:
                "Track your usage, storage, and recent AI interactions here.",
              position: "bottom",
            },
            {
              targetId: "onboarding-pro-card",
              title: "Upgrade to Pro",
              description:
                "Unlock infinite generation limits and exclusive models.",
              position: "right",
            },
          ]}
        />
      )}
      <PerformanceOptimizer />
    </div>
  );
}
