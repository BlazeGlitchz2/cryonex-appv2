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
            {/* Nebula Background Layers */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-black" />

            {/* Animated Nebula Clouds */}
            <div className="absolute inset-0 opacity-40">
              <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-600/30 via-violet-600/20 to-transparent rounded-full blur-3xl animate-nebula-float" />
              <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-blue-600/30 via-cyan-600/20 to-transparent rounded-full blur-3xl animate-nebula-float-delayed" />
              <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-pink-600/30 via-fuchsia-600/20 to-transparent rounded-full blur-3xl animate-nebula-pulse" />
            </div>

            {/* Enhanced Star Field */}
            <div className="stars absolute inset-0 opacity-90" />

            {/* Additional Star Layers for Depth */}
            <div className="absolute inset-0 opacity-60">
              <div className="stars-layer-2 absolute inset-0" />
            </div>

            {/* Cosmic Dust Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-purple-500/5 to-transparent" />

            {/* Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            {!performanceMode && (
              <>
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <FallingPattern
                    colors={["#8B5CF6", "#EC4899", "#3B82F6", "#10B981"]}
                    duration={30}
                    blur={10}
                    density={20}
                  />
                </div>
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <SparklesCore
                    id="app-sparkles"
                    background="transparent"
                    minSize={0.4}
                    maxSize={0.8}
                    particleDensity={30}
                    className="w-full h-full"
                    particleColor={mode === 'dark' ? "#FFFFFF" : "#000000"}
                    speed={0.2}
                  />
                </div>
              </>
            )}
          </>
        )}

        {theme === 'liquid' && (
          <>
            {/* macOS-inspired Frosted Glass Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />

            {/* Subtle Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl animate-blob" />
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl animate-blob animation-delay-2000" />
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-400/10 dark:bg-pink-400/5 rounded-full blur-3xl animate-blob animation-delay-4000" />

            {/* Noise Texture for Depth */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />

            {/* Light Refraction Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent dark:via-white/2" />
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