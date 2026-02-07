import { useState, lazy, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { getAssetUrl } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SplineErrorBoundary } from "@/components/SplineErrorBoundary";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { LiteModeHero } from "@/components/landing/LiteModeHero";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface IntroSplineProps {
  onComplete: () => void;
}

export function IntroSpline({ onComplete }: IntroSplineProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useIsMobile();
  const [isEntering, setIsEntering] = useState(false);
  const qualityTier = usePerformanceStore((state) => state.qualityTier);
  const disable3D = usePerformanceStore((state) => state.disable3D);

  const shouldOptimize = isMobile || qualityTier === "lite" || disable3D;

  // If mobile or low performance, automatically "load" (skip spline)
  useEffect(() => {
    if (shouldOptimize) {
      setIsLoaded(true);
    }
  }, [shouldOptimize]);

  function onLoad(spline: any) {
    setIsLoaded(true);
  }

  const handleClick = () => {
    // If already entering, a second click skips the wait immediately
    if (isEntering) {
      onComplete();
      return;
    }

    // User clicks to trigger the Spline animation (handled by the scene itself)
    // We wait for the animation to complete (approx 1.6 second now) before navigating
    setIsEntering(true);
    setTimeout(() => {
      onComplete();
    }, 1600);
  };

  // Add global click listener for skipping when entering
  useEffect(() => {
    if (!isEntering) return;

    const handleGlobalClick = () => {
      onComplete();
    };

    // Delay attaching the listener by 1s to prevent immediate skipping
    // from the initial click or accidental double clicks
    const timer = setTimeout(() => {
      window.addEventListener("mousedown", handleGlobalClick);
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousedown", handleGlobalClick);
    };
  }, [isEntering, onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {!isLoaded && !shouldOptimize && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      )}

      {!shouldOptimize ? (
        <SplineErrorBoundary
          fallback={
            <div className="absolute inset-0 flex items-center justify-center bg-black cursor-auto">
              <div className="text-center px-4 flex flex-col items-center">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Welcome to Cryonex
                </h1>
                <p className="text-white/60 mb-8">
                  Experience the future of learning.
                </p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className="group relative overflow-hidden rounded-full bg-white px-8 py-6 text-lg font-bold text-black transition-transform hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    ENTER EXPERIENCE <ArrowRight className="h-5 w-5" />
                  </span>
                </Button>
              </div>
            </div>
          }
        >
          <Suspense fallback={null}>
            <div className="w-full h-full">
              <Spline
                scene={getAssetUrl("/spline/intro.splinecode")}
                onLoad={onLoad}
                onMouseDown={handleClick}
                className="w-full h-full"
              />
            </div>
          </Suspense>
        </SplineErrorBoundary>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center cursor-auto overflow-hidden">
          {/* Premium Static Background */}
          <div className="absolute inset-0 z-0">
            <LiteModeHero />
          </div>

          {/* Content Container - Glassmorph */}
          <div className="relative z-10 text-center px-8 py-12 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-lg w-full mx-4 flex flex-col items-center">
            <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 blur-md opacity-80" />
            </div>

            <h1 className="text-4xl md:text-5xl font-orbitron font-bold text-white mb-4 tracking-tight drop-shadow-xl">
              Welcome to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                Cryonex
              </span>
            </h1>
            <p className="text-white/70 mb-10 text-lg font-light leading-relaxed">
              Experience the future of learning.
              <br />
              <span className="text-sm text-white/40">
                {" "}
                Optimized for your device.
              </span>
            </p>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="group relative overflow-hidden rounded-full bg-white px-10 py-7 text-lg font-bold text-black transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center gap-2 justify-center">
                ENTER EXPERIENCE{" "}
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
