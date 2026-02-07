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

  // Tablets get reduced blur for performance
  const shouldOptimize = isLite || isTablet;

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
            ? "rgba(10, 10, 11, 0.9)"
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
