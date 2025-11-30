import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelBrowser } from "@/components/models/ModelBrowser";
import { useChatStore } from "@/lib/stores/chat-store";
import { AnimatePresence, motion } from "framer-motion";
import { GlobalSearch } from "@/components/GlobalSearch";
import CosmicShader from "@/components/shaders/CosmicShader";
import { SubwaySurfersOverlay } from "@/components/ui/subway-surfers";
import { useUIStore } from "@/lib/stores/ui-store";
import { Gamepad2 } from "lucide-react";

export default function AppLayout() {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isModelBrowserOpen, setModelBrowserOpen } = useChatStore();
  const { toggleSubwaySurfers, showSubwaySurfers } = useUIStore();
  const location = useLocation();
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
    <div className="relative flex h-screen overflow-hidden bg-[#030304] text-white selection:bg-primary/30 selection:text-white">
      {/* Global Background Effects - Optimized for Mobile */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {!isMobile && <CosmicShader />}
        {/* Fallback gradient for mobile/performance */}
        <div className={`absolute inset-0 bg-gradient-to-b from-[#0a0a0b] via-[#050505] to-black ${!isMobile ? 'opacity-0' : 'opacity-100'}`} />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      </div>

      <SubwaySurfersOverlay />

      {/* Desktop Sidebar */}
      <div className="relative z-20 h-full hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[320px] border-r border-white/10 bg-[#0A0A0B] p-0 shadow-2xl"
        >
          <AppSidebar isMobile={true} className="m-0 h-full w-full border-none bg-transparent shadow-none" />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header - Optimized Touch Targets */}
        <header className="md:hidden h-16 border-b border-white/10 bg-[#0A0A0B]/90 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-40">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileSidebarOpen(true)} 
              className="text-white hover:bg-white/10 h-10 w-10 active:scale-95 transition-transform"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <span className="font-semibold text-white text-lg tracking-tight">Cryonex</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`h-10 w-10 rounded-full ${showSubwaySurfers ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/60'} active:scale-95 transition-all`}
            onClick={toggleSubwaySurfers}
          >
            <Gamepad2 className="h-5 w-5" />
          </Button>
        </header>

        {/* Page Content with Transitions */}
        <main className="flex-1 overflow-hidden relative w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(10px)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <ModelBrowser open={isModelBrowserOpen} onOpenChange={setModelBrowserOpen} />
      <GlobalSearch />
    </div>
  );
}