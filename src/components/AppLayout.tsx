import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { LiquidSidebar } from "@/components/layout/LiquidSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelPicker } from "@/components/models/ModelPicker";
import { useChatStore } from "@/lib/stores/chat-store";
import { AnimatePresence, motion } from "framer-motion";
import { GlobalSearch } from "@/components/GlobalSearch";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { SubwaySurfersOverlay } from "@/components/ui/subway-surfers";
import { useUIStore } from "@/lib/stores/ui-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { Gamepad2 } from "lucide-react";
import { useSessionTracking } from "@/hooks/use-session-tracking";
import { ActivityDropdown } from "@/components/ui/activity-dropdown";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { cn } from "@/lib/utils";
import { PerformanceOptimizer } from "@/components/performance/PerformanceOptimizer";
import { StudyModeToggle } from "@/components/study/StudyModeToggle";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { MobileOnboarding } from "@/components/onboarding/MobileOnboarding";
import { useIsMobile, useIsTablet } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";

export default function AppLayout() {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isModelBrowserOpen, setModelBrowserOpen } = useChatStore();
  const { toggleSubwaySurfers, showSubwaySurfers } = useUIStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  const qualityTier = usePerformanceStore((state) => state.qualityTier);
  const isLite = qualityTier === "lite";

  useSessionTracking();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Smart tablet optimization: use reduced backdrop-filter complexity
  const useTabletOptimizations = isTablet;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative flex h-[100dvh] overflow-hidden text-white selection:bg-primary/30 selection:text-white bg-[#030010]">
      {/* Ambient Purple Edge Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[50%] h-[40%] bg-purple-600/[0.06] blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[50%] h-[40%] bg-violet-600/[0.06] blur-[120px] rounded-full" />
        <div className="absolute top-[30%] right-0 w-[30%] h-[30%] bg-indigo-600/[0.04] blur-[100px] rounded-full" />
        <div className="absolute bottom-[20%] left-0 w-[30%] h-[30%] bg-purple-500/[0.03] blur-[100px] rounded-full" />
      </div>

      {/* Global Background - Shader Animation */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        {/* Skip shader only on lite mode, not tablets. Also hide in Focus Mode. */}
        {!isLite && !showSubwaySurfers && <ShaderAnimation />}

        {/* Only show overlays if NOT in Focus Mode */}
        {!showSubwaySurfers && (
          <>
            {/* Tablet-optimized overlay: simpler blur */}
            <div
              className={cn(
                "absolute inset-0",
                useTabletOptimizations
                  ? "bg-black/50" // Simpler for tablets - no backdrop blur
                  : "bg-black/40 backdrop-blur-[1px]",
              )}
              style={useTabletOptimizations ? { willChange: "auto" } : undefined}
            />

            {/* Global Purple Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-violet-900/10 pointer-events-none z-0" />
          </>
        )}
      </div>

      {/* Desktop/Tablet Sidebar - Floating Glass */}
      {!isMobile && (
        <div
          className={cn(
            "relative z-20 hidden md:block h-full shrink-0",
            isTablet ? "p-2" : "p-4", // Smaller padding for tablets
          )}
        >
          <LiquidSidebar className="h-full shadow-2xl" isTablet={isTablet} />
        </div>
      )}

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 border-r border-white/10 w-[300px] glass-panel overflow-hidden"
        >
          {/* Sidebar ambient purple glows */}
          <div className="absolute top-0 left-0 w-[80%] h-[30%] bg-purple-600/10 blur-[80px] rounded-full pointer-events-none z-0" />
          <div className="absolute bottom-0 right-0 w-[80%] h-[30%] bg-violet-600/8 blur-[80px] rounded-full pointer-events-none z-0" />
          <LiquidSidebar
            isMobile
            className="h-full w-full border-none bg-transparent relative z-10"
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden">
        {/* Mobile Header - Glassmorphic Design */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 shrink-0 z-40 glass safe-top">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-10 w-10 touch-feedback rounded-xl text-white hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/30 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Cryonex"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                Cryonex
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl touch-feedback transition-all",
              showSubwaySurfers
                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10",
            )}
            onClick={toggleSubwaySurfers}
          >
            <Gamepad2 className="h-5 w-5" />
          </Button>
        </header>

        {/* Desktop/Tablet Header / Activity Bar */}
        {!isMobile && (
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
                className="glass-card rounded-2xl"
              >
                <ActivityDropdown />
              </div>
            </div>
          </div>
        )}

        <main
          className={cn(
            "flex-1 overflow-hidden relative w-full",
            isMobile
              ? "p-0"
              : isTablet
                ? "p-0 md:pr-2 md:py-2"
                : "p-0 md:p-0 md:pr-4 md:py-4",
          )}
        >
          <div
            className={cn(
              "h-full w-full overflow-hidden relative",
              isMobile
                ? "rounded-none border-0"
                : isTablet
                  ? "md:rounded-[1.5rem] border border-white/10"
                  : "md:rounded-[2rem] border border-white/10 md:shadow-2xl",
              !isMobile && !isLite && "glass-panel",
              isLite && "bg-[#0A0A0B]",
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={
                  useTabletOptimizations
                    ? { opacity: 0.9 }
                    : { opacity: 0, y: 10 }
                }
                animate={{ opacity: 1, y: 0 }}
                exit={
                  useTabletOptimizations
                    ? { opacity: 0.9 }
                    : { opacity: 0, y: -5 }
                }
                transition={
                  useTabletOptimizations
                    ? { duration: 0.15 }
                    : { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
                }
                className={cn(
                  "h-full w-full overflow-y-auto custom-scrollbar mobile-scroll-thin",
                  isMobile && "pb-24", // Add padding for bottom nav
                )}
                style={
                  useTabletOptimizations ? { willChange: "opacity" } : undefined
                }
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Mobile Onboarding */}
      {isMobile && <MobileOnboarding />}

      <ModelPicker
        open={isModelBrowserOpen}
        onOpenChange={setModelBrowserOpen}
      />
      <GlobalSearch />
      <SubwaySurfersOverlay />
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
      <PerformanceOptimizer />
    </div>
  );
}
