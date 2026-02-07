"use client";

import { useEffect, useRef, useState } from "react";
import { createSpectralGhost } from "./ghost";

interface GhostIntroProps {
  fadeDistance?: number;
}

export function GhostIntro({ fadeDistance = 250 }: GhostIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostInstanceRef = useRef<any>(null);
  const [isHidden, setIsHidden] = useState(false);

  // Initialize ghost once on mount
  useEffect(() => {
    if (!containerRef.current || ghostInstanceRef.current) return;

    const initGhost = async () => {
      ghostInstanceRef.current = await createSpectralGhost({
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
          glowColor: "purple",
          eyeGlowColor: "cyan",
          particleColor: "purple",
          bodyColor: 0x050510,
          ghostOpacity: 0.9,
          ghostScale: 2.4,
          emissiveIntensity: 6.0,
          fireflyGlowIntensity: 3.0,
        },
      });
    };

    initGhost();

    return () => {
      if (ghostInstanceRef.current) {
        ghostInstanceRef.current.destroy();
        ghostInstanceRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Handle scroll separately
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const scrollY = window.scrollY;
      const fadeStart = 0;
      const fadeEnd = fadeDistance;

      const progress = Math.min(
        Math.max((scrollY - fadeStart) / (fadeEnd - fadeStart), 0),
        1,
      );
      const newOpacity = 1 - progress;

      // 3D Scroll Effect: Zoom in and blur as you scroll down
      const scale = 1 + progress * 0.5;
      const blur = progress * 10;

      // Direct DOM updates for performance
      containerRef.current.style.opacity = newOpacity.toString();
      containerRef.current.style.transform = `scale(${scale})`;
      containerRef.current.style.filter = `blur(${blur}px)`;
      containerRef.current.style.pointerEvents =
        newOpacity < 0.1 ? "none" : "auto";

      // Hide completely when fully scrolled past
      setIsHidden(newOpacity <= 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fadeDistance]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        opacity: 1,
        transition: "opacity 0.1s ease-out",
        background: "#030010",
        willChange: "transform, opacity, filter",
        visibility: isHidden ? "hidden" : "visible",
      }}
    />
  );
}
