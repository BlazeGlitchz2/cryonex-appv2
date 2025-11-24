import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useUIStore } from "@/lib/stores/ui-store";
import CosmicShader from "@/components/shaders/CosmicShader";
import LiquidShader from "@/components/shaders/LiquidShader";
import { ModelBrowser } from "@/components/models/ModelBrowser";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileHome from "@/pages/MobileHome";

export default function AppLayout() {
  const { theme, mode } = useThemeStore();
  const [showModelBrowser, setShowModelBrowser] = useState(false);
  const isMobile = useIsMobile();
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const location = useLocation();

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (mode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme, mode]);

  // Listen for openModelBrowser event
  useEffect(() => {
    const handleOpenModelBrowser = () => setShowModelBrowser(true);
    window.addEventListener("openModelBrowser", handleOpenModelBrowser);
    return () => window.removeEventListener("openModelBrowser", handleOpenModelBrowser);
  }, []);

  // Mobile-specific layout for home page
  if (isMobile && location.pathname === "/app") {
    return <MobileHome />;
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-background text-foreground">
      {/* Global Background Shader */}
      <div className="fixed inset-0 z-0">
        {theme === "cosmic" && <CosmicShader />}
        {theme === "liquid" && <LiquidShader />}
        {/* Optional overlay for text readability */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      {/* Desktop Sidebar */}
      <div className="relative z-10 h-full">
         {!isMobile && <AppSidebar />}
      </div>

      {/* Mobile Sidebar Sheet */}
      {isMobile && (
        <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent
            side="left"
            className="w-[320px] border-r border-white/5 bg-[#050014]/95 p-0 shadow-2xl backdrop-blur-2xl"
          >
            <AppSidebar className="m-0 h-full w-full border-none bg-transparent shadow-none" isMobile />
          </SheetContent>
        </Sheet>
      )}

      <div className="relative flex flex-1 flex-col overflow-hidden z-10">
        <Outlet />
      </div>

      <ModelBrowser open={showModelBrowser} onOpenChange={setShowModelBrowser} />
    </div>
  );
}