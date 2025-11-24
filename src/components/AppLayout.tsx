import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { Sidebar } from "@/components/Sidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelBrowser } from "@/components/models/ModelBrowser";
import { CosmicShader } from "@/components/shaders/CosmicShader";
import { LiquidShader } from "@/components/shaders/LiquidShader";
import { useThemeStore } from "@/lib/stores/theme-store";
import { AnimatePresence, motion } from "framer-motion";

export default function AppLayout() {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showModelBrowser, setShowModelBrowser] = useState(false);
  const { theme } = useThemeStore();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
      {/* Global Background Shader */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {theme === "cosmic" && <CosmicShader />}
        {theme === "liquid" && <LiquidShader />}
        {/* Optional overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      {/* Desktop Sidebar */}
      <div className="relative z-20 h-full hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent
          side="left"
          className="w-[320px] border-r border-white/5 bg-[#050014]/95 p-0 shadow-2xl backdrop-blur-2xl"
        >
          <Sidebar className="m-0 h-full w-full border-none bg-transparent shadow-none" />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b border-white/10 bg-background/50 backdrop-blur-xl flex items-center px-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setMobileSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="ml-4 font-semibold">Cryonex</span>
        </header>

        {/* Page Content with Transitions */}
        <main className="flex-1 overflow-hidden relative">
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

      <ModelBrowser open={showModelBrowser} onOpenChange={setShowModelBrowser} />
    </div>
  );
}