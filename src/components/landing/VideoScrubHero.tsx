import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Typewriter } from "@/components/ui/typewriter";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export function VideoScrubHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const totalFrames = 192; // Based on ffmpeg output (approx 8s @ 24fps)

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const container = containerRef.current;

    if (!canvas || !context || !container) return;

    // Preload Images
    const images: HTMLImageElement[] = [];
    const frames = { current: 0 };

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const frameIndex = i.toString().padStart(4, "0");
      img.src = `https://cryonex-cdn.b-cdn.net/sequence/frame_${frameIndex}.jpg`;
      img.onload = () => setImagesLoaded((prev) => prev + 1);
      images.push(img);
    }

    // Set Canvas Size
    canvas.width = 1920;
    canvas.height = 1080;

    const render = () => {
      const img = images[frames.current];
      if (img && img.complete) {
        // Draw image to cover canvas (object-cover equivalent)
        const hRatio = canvas.width / img.width;
        const vRatio = canvas.height / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - img.width * ratio) / 2;
        const centerShift_y = (canvas.height - img.height * ratio) / 2;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShift_x,
          centerShift_y,
          img.width * ratio,
          img.height * ratio,
        );
      }
    };

    // Initial Render
    images[0].onload = render;

    let ctx: gsap.Context;

    const initScrollTrigger = () => {
      if (ctx) ctx.revert();

      ctx = gsap.context(() => {
        gsap.to(frames, {
          current: totalFrames - 1,
          snap: "current",
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=2000", // Faster scroll (reduced from 6000)
            scrub: 0.5,
            pin: true,
            onUpdate: render, // Render on every scroll update
          },
        });

        // Fade out text
        gsap.to(".hero-content", {
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=1000",
            scrub: true,
          },
          opacity: 0,
          y: -100,
          scale: 0.9,
        });
      }, container);
    };

    initScrollTrigger();

    return () => {
      if (ctx) ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  const progress = Math.round((imagesLoaded / totalFrames) * 100);

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-full bg-[#030010] overflow-hidden"
    >
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* Loading Indicator (if not fully loaded) */}
      {progress < 100 && (
        <div className="absolute top-4 right-4 text-xs text-white/30 font-mono z-50">
          Loading Sequence: {progress}%
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#030010]" />

      {/* Content Layer */}
      <div className="hero-content absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter mb-6 mix-blend-overlay">
            CRYONEX
          </h1>

          <div className="h-20 md:h-24 flex items-center justify-center">
            <Typewriter
              text={["Dreams", "Future", "Vision", "Reality"]}
              className="text-4xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-pink-400"
              cursorClassName="bg-cyan-400"
            />
          </div>

          <p className="mt-8 text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-light tracking-wide">
            Scroll to explore the digital nebula
          </p>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="mt-12 opacity-50"
          >
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
              <div className="w-1 h-2 bg-white rounded-full" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
