import React, { useEffect, useRef, useMemo } from "react";
import DOMPurify from "dompurify";

interface PoemAnimationProps {
  poemHTML: string;
}

export const PoemAnimation = ({ poemHTML }: PoemAnimationProps) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Sanitize poemHTML once to prevent XSS
  const sanitizedHTML = useMemo(
    () => DOMPurify.sanitize(poemHTML, { USE_PROFILES: { html: true } }),
    [poemHTML],
  );

  useEffect(() => {
    function adjustContentSize() {
      if (contentRef.current) {
        const viewportWidth = window.innerWidth;
        const baseWidth = 1000;
        const scaleFactor =
          viewportWidth < baseWidth ? (viewportWidth / baseWidth) * 0.9 : 1;
        contentRef.current.style.transform = `scale(${scaleFactor})`;
      }
    }
    adjustContentSize();
    window.addEventListener("resize", adjustContentSize);
    return () => window.removeEventListener("resize", adjustContentSize);
  }, []);

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center perspective-1000 pointer-events-none">
      {/* Nebula Glow Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute w-[300px] h-[300px] bg-cyan-500/20 rounded-full blur-[80px] animate-pulse delay-1000" />
      </div>

      <div
        ref={contentRef}
        className="relative block w-[600px] h-[600px] transform-gpu flex items-center justify-center"
      >
        <div className="relative w-[200px] h-[200px] preserve-3d animate-3d-rotate">
          {/* Cube Faces - Pure Glass */}
          <div className="absolute w-[200px] h-[200px] bg-white/5 border border-white/20 backdrop-blur-sm transform translate-y-[-100px] rotate-x-90 shadow-[0_0_30px_rgba(139,92,246,0.3)]"></div>
          <div className="absolute w-[200px] h-[200px] bg-white/5 border border-white/20 backdrop-blur-sm transform translate-y-[100px] rotate-x-[-90] shadow-[0_0_30px_rgba(139,92,246,0.3)]"></div>

          {/* Text Faces */}
          <div
            className="absolute w-[200px] h-[200px] bg-white/5 border border-white/20 backdrop-blur-sm transform translate-x-[-100px] rotate-y-[-90] flex items-center justify-center p-6 text-xs text-white/90 font-mono leading-relaxed overflow-hidden shadow-[inset_0_0_20px_rgba(139,92,246,0.2)]"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          ></div>
          <div
            className="absolute w-[200px] h-[200px] bg-white/5 border border-white/20 backdrop-blur-sm transform translate-x-[100px] rotate-y-90 flex items-center justify-center p-6 text-xs text-white/90 font-mono leading-relaxed overflow-hidden shadow-[inset_0_0_20px_rgba(139,92,246,0.2)]"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          ></div>

          <div className="absolute w-[200px] h-[200px] bg-white/5 border border-white/20 backdrop-blur-sm transform translate-z-[100px] flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-white/30 animate-spin-slow" />
          </div>
          <div
            className="absolute w-[200px] h-[200px] bg-white/5 border border-white/20 backdrop-blur-sm transform translate-z-[-100px] rotate-y-180 flex items-center justify-center p-6 text-xs text-white/90 font-mono leading-relaxed overflow-hidden shadow-[inset_0_0_20px_rgba(139,92,246,0.2)]"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          ></div>

          {/* Internal Core */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100px] h-[100px] bg-blue-500/30 blur-xl rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
