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

            {/* Animated Nebula Clouds with Mix Blend Mode */}
            <div className="absolute inset-0 opacity-60 mix-blend-screen">
              <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-radial from-purple-600/40 via-violet-600/20 to-transparent rounded-full blur-3xl animate-nebula-float" />
              <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-radial from-cyan-600/40 via-blue-600/20 to-transparent rounded-full blur-3xl animate-nebula-float-delayed" />
              <div className="absolute bottom-0 left-1/3 w-[700px] h-[700px] bg-gradient-radial from-fuchsia-600/40 via-pink-600/20 to-transparent rounded-full blur-3xl animate-nebula-pulse" />
            </div>

            {/* Enhanced Star Field */}
            <div className="stars absolute inset-0 opacity-100" />

            {/* Additional Star Layers for Depth */}
            <div className="absolute inset-0 opacity-70">
              <div className="stars-layer-2 absolute inset-0" />
            </div>

            {/* Cosmic Dust Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-purple-900/10 to-black/40" />

            {/* Glowing Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            {!performanceMode && (
              <>
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <FallingPattern
                    colors={["#8B5CF6", "#EC4899", "#06B6D4", "#10B981"]}
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
                    maxSize={1.2}
                    particleDensity={40}
                    className="w-full h-full"
                    particleColor={mode === 'dark' ? "#FFFFFF" : "#FEF3C7"}
                    speed={0.2}
                  />
                </div>
              </>
            )}
          </>
        )}

        {theme === 'liquid' && (
          <>
            {/* macOS-inspired Abstract Background */}
            <div className="absolute inset-0 bg-[#f5f5f7] dark:bg-[#1e1e1e]" />
            
            {/* Abstract Gradients - Big Sur / Monterey Style */}
            <div className="absolute inset-0 opacity-80 dark:opacity-60 scale-150">
              <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-[#ff9a9e] via-[#fad0c4] to-[#fad0c4] blur-[100px] animate-blob mix-blend-multiply dark:mix-blend-screen" />
              <div className="absolute top-[10%] right-[-20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#a18cd1] via-[#fbc2eb] to-[#a6c1ee] blur-[100px] animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
              <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#84fab0] via-[#8fd3f4] to-[#a6c0fe] blur-[100px] animate-blob animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />
            </div>

            {/* Subtle Noise Overlay using CSS */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
            />

            {/* Light Refraction/Sheen */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent pointer-events-none" />
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