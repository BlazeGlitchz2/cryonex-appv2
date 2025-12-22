"use client";

import { useEffect, useRef, useState } from "react";
import { createSpectralGhost } from "./ghost";

interface GhostIntroProps {
    fadeDistance?: number;
}

export function GhostIntro({ fadeDistance = 250 }: GhostIntroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // We use a ref for visibility to avoid re-renders during scroll, 
    // but we still need state to trigger unmount/remount if we want to save resources.
    // However, for smoother UX, we'll keep it mounted but hidden when scrolled away,
    // or stick to the existing unmount logic if performance is a concern.
    // Given the "intro" nature, unmounting is fine.
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;

        let ghostInstance: any = null;

        const initGhost = async () => {
            ghostInstance = await createSpectralGhost({
                container: containerRef.current,
                toggles: {
                    enabled: true,
                    ghost: true,
                    text: true,
                    particles: true,
                    fireflies: true,
                    bloom: true,
                    analog: true,
                    reveal: true,
                },
                text: {
                    titleLines: ["CRYONEX", "IS THE", "FUTURE"],
                    subtext: "Scroll below to see more",
                },
                params: {
                    // Synced with Cryonex theme (Purple/Cyan)
                    glowColor: "purple",
                    eyeGlowColor: "cyan",
                    particleColor: "purple",
                    bodyColor: 0x050510, // Dark background match
                    ghostOpacity: 0.9,
                    ghostScale: 2.4,
                    emissiveIntensity: 6.0,
                    fireflyGlowIntensity: 3.0,
                },
            });
        };

        initGhost();

        const handleScroll = () => {
            if (!containerRef.current) return;

            const scrollY = window.scrollY;
            const fadeStart = 0;
            const fadeEnd = fadeDistance;

            const progress = Math.min(Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0), 1);
            const newOpacity = 1 - progress;

            // 3D Scroll Effect: Zoom in and blur as you scroll down
            const scale = 1 + (progress * 0.5); // Scales from 1.0 to 1.5
            const blur = progress * 10; // Blurs from 0px to 10px

            // Direct DOM updates for performance
            containerRef.current.style.opacity = newOpacity.toString();
            containerRef.current.style.transform = `scale(${scale})`;
            containerRef.current.style.filter = `blur(${blur}px)`;
            containerRef.current.style.pointerEvents = newOpacity < 0.1 ? "none" : "auto";

            // Logic to unmount/remount based on visibility
            // We use a small threshold to avoid flickering at the boundary
            if (newOpacity <= 0 && isVisible) {
                setIsVisible(false);
            } else if (newOpacity > 0 && !isVisible) {
                setIsVisible(true);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (ghostInstance) {
                ghostInstance.destroy();
            }
        };
    }, [isVisible]); // Re-run effect when isVisible changes (remounting)

    if (!isVisible) return null;

    return (
        <div
            ref={containerRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                opacity: 1, // Controlled by JS
                transition: "opacity 0.1s ease-out", // Smooth out JS updates slightly
                background: "#030010",
                willChange: "transform, opacity, filter", // Hint for browser optimization
            }}
        />
    );
}
