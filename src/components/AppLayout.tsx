import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, Sparkles } from "lucide-react";
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

export default function AppLayout() {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isModelBrowserOpen, setModelBrowserOpen } = useChatStore();
  const { toggleSubwaySurfers, showSubwaySurfers } = useUIStore();
  const { theme } = useThemeStore();
  const location = useLocation();

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
          <AppSidebar className="h-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem]" />
        </div>
      )}

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="p-0 border-r border-white/10 w-[300px] bg-[#0A0A0B]/95 backdrop-blur-2xl"
        >
          <AppSidebar isMobile className="h-full w-full border-none bg-transparent" />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/10 flex items-center justify-between px-4 shrink-0 z-40 bg-[#0A0A0B]/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSidebarOpen(true)}
              className="h-10 w-10 active:scale-95 transition-transform rounded-xl text-white hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shadow-lg bg-gradient-to-br from-primary to-purple-600 shadow-primary/20 overflow-hidden">
                <img src="/logo.png" alt="Cryonex" className="h-full w-full object-cover" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">Cryonex</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-xl active:scale-95 transition-all ${showSubwaySurfers
              ? 'bg-primary/20 text-primary'
              : 'bg-white/5 text-white/60'
              }`}
            onClick={toggleSubwaySurfers}
          >
            <Gamepad2 className="h-5 w-5" />
          </Button>
        </header>

        {/* Desktop Header / Activity Bar */}
        {!isMobile && (
          <div className="absolute top-6 right-6 z-50">
            <div className="glass-card rounded-2xl">
              <ActivityDropdown />
            </div>
          </div>
        )}

        {/* Page Content with Smooth Transitions */}
        <main className="flex-1 overflow-hidden relative w-full p-4 md:p-0 md:pr-4 md:py-4">
          <div className="h-full w-full rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="h-full w-full overflow-y-auto custom-scrollbar"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <ModelBrowser open={isModelBrowserOpen} onOpenChange={setModelBrowserOpen} />
      <GlobalSearch />
      <SubwaySurfersOverlay />
    </div>
  );
}