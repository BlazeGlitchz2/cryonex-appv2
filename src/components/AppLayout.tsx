import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import CosmicShader from "@/components/shaders/CosmicShader";
import LiquidShader from "@/components/shaders/LiquidShader";
import { ModelBrowser } from "@/components/models/ModelBrowser";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout() {
  const { theme, mode } = useThemeStore();
  const { performanceMode } = useChatStore();
  const [showModelBrowser, setShowModelBrowser] = useState(false);
  const isMobile = useIsMobile();
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme, mode]);

  // Listen for openModelBrowser event
  useEffect(() => {
    const handleOpenModelBrowser = () => setShowModelBrowser(true);
    window.addEventListener('openModelBrowser', handleOpenModelBrowser);
    return () => window.removeEventListener('openModelBrowser', handleOpenModelBrowser);
  }, []);

  return (
    <div className="h-screen flex relative overflow-hidden text-foreground">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {theme === 'cosmic' && (
          <>
            <CosmicShader />
            {/* Overlay for better text contrast if needed */}
            <div className="absolute inset-0 bg-black/20 mix-blend-overlay" />
          </>
        )}

        {theme === 'liquid' && (
          <>
            <LiquidShader />
            {/* Glassy Overlay */}
            <div className="absolute inset-0 bg-white/30 dark:bg-black/10 backdrop-blur-[1px]" />
          </>
        )}
      </div>

      {/* Desktop Sidebar */}
      {!isMobile && <AppSidebar />}

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[280px] border-r border-white/10 bg-background/80 backdrop-blur-xl">
            <AppSidebar className="w-full h-full border-none shadow-none" isMobile={true} />
          </SheetContent>
        </Sheet>
      )}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Outlet />
      </div>

      <ModelBrowser open={showModelBrowser} onOpenChange={setShowModelBrowser} />
    </div>
  );
}