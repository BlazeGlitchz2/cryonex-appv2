import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ParallaxScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });

      tl.to(
        textRef.current,
        {
          y: -200,
          ease: "none",
        },
        0,
      );

      tl.to(
        layersRef.current,
        {
          y: 100,
          ease: "none",
        },
        0,
      );
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
    >
      {/* Background Elements */}
      <div ref={layersRef} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div
        ref={textRef}
        className="relative z-10 max-w-7xl mx-auto px-6 text-center"
      >
        <h2 className="text-5xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 mb-8">
          The Future of Learning
        </h2>
        <p className="text-xl md:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
          Experience a new dimension of knowledge. Immerse yourself in
          interactive 3D environments where ideas come to life.
        </p>
      </div>
    </section>
  );
}
