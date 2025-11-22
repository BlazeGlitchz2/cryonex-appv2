import { useEffect } from "react";
import { Outlet } from "react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { FallingPattern } from "@/components/ui/falling-pattern";
import { SparklesCore } from "@/components/ui/sparkles";

export default function AppLayout() {
  const { theme, mode } = useThemeStore();
  const { performanceMode } = useChatStore();

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

  return (
    <div className="h-screen flex relative overflow-hidden bg-background text-foreground transition-colors duration-500">
      {/* Dynamic Backgrounds */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {theme === 'cosmic' && (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
            <div className="stars absolute inset-0 opacity-80" />
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            {!performanceMode && (
              <>
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <FallingPattern
                    colors={["#8B5CF6", "#EC4899", "#3B82F6", "#10B981"]}
                    duration={25}
                    blur={8}
                    density={25}
                  />
                </div>
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <SparklesCore
                    id="app-sparkles"
                    background="transparent"
                    minSize={0.3}
                    maxSize={0.6}
                    particleDensity={20}
                    className="w-full h-full"
                    particleColor={mode === 'dark' ? "#FFFFFF" : "#000000"}
                    speed={0.15}
                  />
                </div>
              </>
            )}
          </>
        )}

        {theme === 'liquid' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 animate-gradient-xy" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
          </>
        )}
      </div>

      <AppSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}