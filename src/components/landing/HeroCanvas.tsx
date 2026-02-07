import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const frameCount = 240;
    const currentFrame = { index: 0 };
    const images: HTMLImageElement[] = [];

    // Pre-load images (assuming they are already cached by AssetPreloader)
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      const frameIndex = (i + 1).toString().padStart(3, "0");
      img.src = `/sequence/frame-${frameIndex}.jpg`;
      images.push(img);
    }

    const render = () => {
      const img = images[currentFrame.index];
      if (img && img.complete && img.naturalWidth > 0) {
        // Maintain aspect ratio and cover
        const scale = Math.max(
          canvas.width / img.width,
          canvas.height / img.height,
        );
        const x = canvas.width / 2 - (img.width / 2) * scale;
        const y = canvas.height / 2 - (img.height / 2) * scale;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    };

    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // GSAP ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero-container",
        start: "top top",
        end: "+=5000", // Pin for 5000px
        scrub: true, // 1:1 scrubbing
        pin: true, // pin the canvas
      },
      onUpdate: render,
    });

    tl.to(currentFrame, {
      index: frameCount - 1,
      snap: "index",
      ease: "none",
    });

    // Title Fade Out
    gsap.to(".hero-content", {
      scrollTrigger: {
        trigger: "#hero-container",
        start: "top top",
        end: "+=500", // Fade out quickly
        scrub: true,
      },
      opacity: 0,
      y: -50,
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <div id="hero-container" className="relative h-screen w-full bg-[#000000]">
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay Content */}
        <div className="hero-content absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <h1 className="hero-title text-8xl md:text-[10rem] font-bold text-white tracking-tighter mix-blend-difference">
            CRYONEX
          </h1>
          <p className="hero-subtitle mt-8 text-xl md:text-2xl text-[#D2FF00] font-mono tracking-widest">
            ENTER THE VOID
          </p>
        </div>
      </div>
    </div>
  );
}
