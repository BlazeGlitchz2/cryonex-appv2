"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { useIsTablet } from "@/hooks/use-mobile";

interface LiquidGlassProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className,
  intensity = "medium",
}) => {
  const qualityTier = usePerformanceStore((state) => state.qualityTier);
  const isLite = qualityTier === "lite";
  const isTablet = useIsTablet();
  // We can't use useIsIOS hook directly here if it doesn't exist, but we can check navigator or use utility
  // Let's assume we want to be safe and check userAgent in a useEffect or just check window if available
  // For ssr safety we can standard check
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  // Tablets get reduced blur. iOS gets NO blur for max performance unless explicitly high tier?
  // Actually, glassmorphism is expensive on iOS WebKit. Let's disable it for "lite" or just reduce it.
  const shouldOptimize = isLite || isTablet || isIOS;

  const intensityMap = {
    low: shouldOptimize ? "none" : "blur(5px)",
    medium: shouldOptimize ? "blur(4px)" : "blur(10px)",
    high: shouldOptimize ? "blur(8px)" : "blur(20px)",
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* SVG Filter Definition - Hidden (skip for tablets) */}
      {!shouldOptimize && (
        <svg className="absolute w-0 h-0 pointer-events-none">
          <defs>
            <filter id="liquid-glass-distortion">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.01"
                numOctaves="3"
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale="10"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>
      )}

      {/* Glass Layers */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backdropFilter: intensityMap[intensity],
          WebkitBackdropFilter: intensityMap[intensity],
          background: shouldOptimize
            ? "rgba(10, 10, 11, 0.95)" // Higher opacity for non-blur
            : "rgba(255, 255, 255, 0.03)",
          boxShadow: shouldOptimize
            ? "none"
            : "inset 0 0 20px rgba(255, 255, 255, 0.05)",
        }}
      />

      {/* Liquid Distortion Layer - Disabled for tablets and lite mode */}
      {!shouldOptimize && (
        <div
          className="absolute inset-0 z-0 opacity-30 pointer-events-none mix-blend-overlay"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
            filter: "url(#liquid-glass-distortion)",
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>

      {/* Border Glow - simplified for tablets */}
      <div
        className={cn(
          "absolute inset-0 z-20 pointer-events-none rounded-[inherit] border border-white/10",
          !shouldOptimize && "shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]",
        )}
      />
    </div>
  );
};
