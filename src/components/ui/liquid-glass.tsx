"use client";

import React from "react";
import { cn } from "@/lib/utils";

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
    const intensityMap = {
        low: "blur(5px)",
        medium: "blur(10px)",
        high: "blur(20px)",
    };

    return (
        <div className={cn("relative overflow-hidden", className)}>
            {/* SVG Filter Definition - Hidden */}
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

            {/* Glass Layers */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backdropFilter: intensityMap[intensity],
                    background: "rgba(255, 255, 255, 0.03)",
                    boxShadow: "inset 0 0 20px rgba(255, 255, 255, 0.05)",
                }}
            />

            {/* Liquid Distortion Layer */}
            <div
                className="absolute inset-0 z-0 opacity-30 pointer-events-none mix-blend-overlay"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
                    filter: "url(#liquid-glass-distortion)"
                }}
            />

            {/* Content */}
            <div className="relative z-10 h-full">
                {children}
            </div>

            {/* Border Glow */}
            <div className="absolute inset-0 z-20 pointer-events-none rounded-[inherit] border border-white/10 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]" />
        </div>
    );
};
