import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { LiquidSidebar } from "@/components/layout/LiquidSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelBrowser } from "@/components/models/ModelBrowser";
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
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";

export default function AppLayout() {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isModelBrowserOpen, setModelBrowserOpen } = useChatStore();
  const { toggleSubwaySurfers, showSubwaySurfers } = useUIStore();
  const { theme } = useThemeStore();
  const location = useLocation();
  const qualityTier = usePerformanceStore(state => state.qualityTier);
  const isLite = qualityTier === 'lite';

  // Track user session/device for security
  useSessionTracking();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="relative flex h-screen overflow-hidden text-white selection:bg-primary/30 selection:text-white bg-[#030010]">
      {/* Global Background - Shader Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ShaderAnimation />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Desktop Sidebar - Floating Glass */}
      {!isMobile && (
        <div className="relative z-20 hidden md:block h-full shrink-0 p-4">
          <LiquidSidebar className="h-full shadow-2xl" />
        </div>
      )}

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 border-r border-white/10 w-[300px] bg-[#0A0A0B]/95 backdrop-blur-2xl"
        >
          <LiquidSidebar isMobile className="h-full w-full border-none bg-transparent" />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden">
        {/* Mobile Header - Glassmorphic Design */}
        <header className="md:hidden h-14 flex items-center justify-between px-4 shrink-0 z-40 glass-panel-elevated safe-top">
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
                <img src="/logo.png" alt="Cryonex" className="h-full w-full object-cover" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">Cryonex</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl touch-feedback transition-all",
              showSubwaySurfers
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
            )}
            onClick={toggleSubwaySurfers}
          >
            <Gamepad2 className="h-5 w-5" />
          </Button>
        </header>

        {/* Desktop Header / Activity Bar */}
        {!isMobile && (
          <div className="absolute top-6 right-6 z-50">
            <div className="flex items-center gap-3">
              <div id="onboarding-study-toggle">
                <StudyModeToggle />
              </div>
              <div id="onboarding-activity-dropdown" className="glass-card rounded-2xl">
                <ActivityDropdown />
              </div>
            </div>
          </div>
        )}

        {/* Page Content with Smooth Transitions */}
        <main className="flex-1 overflow-hidden relative w-full p-0 md:p-0 md:pr-4 md:py-4">
          <div className={cn(
            "h-full w-full md:rounded-[2rem] border-0 md:border border-white/10 shadow-none md:shadow-2xl overflow-hidden relative",
            isLite ? "bg-[#0A0A0B]" : "bg-black/40 backdrop-blur-xl"
          )}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "h-full w-full overflow-y-auto mobile-scroll-thin",
                  isMobile && "pb-24" // Add padding for bottom nav
                )}
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

      <ModelBrowser open={isModelBrowserOpen} onOpenChange={setModelBrowserOpen} />
      <GlobalSearch />
      <SubwaySurfersOverlay />
      <OnboardingTour
        tourId="main-app"
        steps={[
          {
            targetId: "onboarding-sidebar-search",
            title: "Global Search",
            description: "Press Cmd+K to search your chats, libraries, and tools instantly.",
            position: "right",
          },
          {
            targetId: "onboarding-nav-assistant",
            title: "AI Assistant",
            description: "Chat with our advanced AI models. Switch between models seamlessly.",
            position: "right",
          },
          {
            targetId: "onboarding-nav-studio",
            title: "Creative Studio",
            description: "Generate images, videos, and music in the Media Studio.",
            position: "right",
          },
          {
            targetId: "onboarding-study-toggle",
            title: "Focus Mode",
            description: "Toggle distraction-free mode for deep work and study sessions.",
            position: "bottom",
          },
          {
            targetId: "onboarding-activity-dropdown",
            title: "Activity Hub",
            description: "Track your usage, storage, and recent AI interactions here.",
            position: "bottom",
          },
          {
            targetId: "onboarding-pro-card",
            title: "Upgrade to Pro",
            description: "Unlock infinite generation limits and exclusive models.",
            position: "right",
          },
        ]}
      />
      <PerformanceOptimizer />
    </div>
  );
}