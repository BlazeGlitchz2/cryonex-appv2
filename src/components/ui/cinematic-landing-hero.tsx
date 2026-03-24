"use client";

import React, { useEffect, useRef } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Play,
  ShieldCheck,
  Sparkles,
  Telescope,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  .film-grain {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 50;
    opacity: 0.06;
    mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
    background-size: 64px 64px;
    background-image:
      linear-gradient(to right, color-mix(in srgb, #c7f9ff 7%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in srgb, #c7f9ff 7%, transparent) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 74%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 74%);
  }

  .hero-aurora {
    position: absolute;
    border-radius: 999px;
    filter: blur(90px);
    opacity: 0.7;
  }

  .text-3d-matte {
    color: #f4f8fb;
    text-shadow:
      0 18px 50px rgba(125, 211, 252, 0.18),
      0 4px 12px rgba(7, 10, 19, 0.5);
  }

  .text-silver-matte {
    background: linear-gradient(180deg, #f8fafc 0%, #8be9ff 48%, #dbeafe 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter:
      drop-shadow(0px 12px 30px rgba(117, 224, 255, 0.2))
      drop-shadow(0px 2px 6px rgba(2, 6, 23, 0.4));
  }

  .text-card-silver-matte {
    background: linear-gradient(180deg, #f8fbff 0%, #9edfff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter:
      drop-shadow(0px 12px 24px rgba(0, 0, 0, 0.72))
      drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.52));
  }

  .premium-depth-card {
    background:
      radial-gradient(circle at top left, rgba(125, 211, 252, 0.13), transparent 38%),
      radial-gradient(circle at bottom right, rgba(244, 162, 97, 0.12), transparent 32%),
      linear-gradient(145deg, #0d223d 0%, #08111f 55%, #050914 100%);
    box-shadow:
      0 50px 120px -24px rgba(0, 0, 0, 0.88),
      0 25px 50px -24px rgba(0, 0, 0, 0.78),
      inset 0 1px 1px rgba(255, 255, 255, 0.2),
      inset 0 -2px 8px rgba(0, 0, 0, 0.82);
    border: 1px solid rgba(255, 255, 255, 0.06);
    position: relative;
  }

  .card-sheen {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 50;
    background: radial-gradient(760px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(199,249,255,0.14) 0%, transparent 42%);
    mix-blend-mode: screen;
    transition: opacity 0.3s ease;
  }

  .iphone-bezel {
    background-color: #0a0a0c;
    box-shadow:
      inset 0 0 0 2px #4b5563,
      inset 0 0 0 7px #020617,
      0 40px 90px -20px rgba(0,0,0,0.92),
      0 15px 28px -8px rgba(0,0,0,0.72);
    transform-style: preserve-3d;
  }

  .hardware-btn {
    background: linear-gradient(90deg, #485569 0%, #111827 100%);
    box-shadow:
      -2px 0 5px rgba(0,0,0,0.8),
      inset -1px 0 1px rgba(255,255,255,0.15),
      inset 1px 0 2px rgba(0,0,0,0.8);
    border-left: 1px solid rgba(255,255,255,0.05);
  }

  .screen-glare {
    background: linear-gradient(110deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0) 42%);
  }

  .widget-depth {
    background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.015) 100%);
    box-shadow:
      0 10px 20px rgba(0,0,0,0.34),
      inset 0 1px 1px rgba(255,255,255,0.06),
      inset 0 -1px 1px rgba(0,0,0,0.46);
    border: 1px solid rgba(255,255,255,0.05);
  }

  .floating-ui-badge {
    background: linear-gradient(135deg, rgba(7, 18, 34, 0.74) 0%, rgba(7, 18, 34, 0.28) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.08),
      0 25px 60px -16px rgba(0, 0, 0, 0.82),
      inset 0 1px 1px rgba(255,255,255,0.14),
      inset 0 -1px 1px rgba(0,0,0,0.4);
  }

  .btn-modern-light, .btn-modern-dark {
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .btn-modern-light {
    background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
    color: #020617;
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.55),
      0 2px 4px rgba(0,0,0,0.1),
      0 12px 24px -4px rgba(14,165,233,0.22),
      inset 0 1px 1px rgba(255,255,255,1),
      inset 0 -3px 6px rgba(15,23,42,0.08);
  }

  .btn-modern-light:hover {
    transform: translateY(-3px);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.55),
      0 6px 12px -2px rgba(0,0,0,0.15),
      0 20px 32px -6px rgba(14,165,233,0.28),
      inset 0 1px 1px rgba(255,255,255,1),
      inset 0 -3px 6px rgba(15,23,42,0.08);
  }

  .btn-modern-dark {
    background: linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.96) 100%);
    color: #ecfeff;
    box-shadow:
      0 0 0 1px rgba(186, 230, 253, 0.16),
      0 2px 4px rgba(0,0,0,0.58),
      0 12px 24px -4px rgba(0,0,0,0.86),
      inset 0 1px 1px rgba(255,255,255,0.12),
      inset 0 -3px 6px rgba(0,0,0,0.78);
  }

  .btn-modern-dark:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg, rgba(22, 37, 62, 0.98) 0%, rgba(7, 18, 34, 0.98) 100%);
    box-shadow:
      0 0 0 1px rgba(186, 230, 253, 0.18),
      0 6px 12px -2px rgba(0,0,0,0.68),
      0 20px 32px -6px rgba(0,0,0,1),
      inset 0 1px 1px rgba(255,255,255,0.18),
      inset 0 -3px 6px rgba(0,0,0,0.82);
  }

  .progress-ring {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke-dasharray: 402;
    stroke-dashoffset: 402;
    stroke-linecap: round;
  }
`;

export interface CinematicHeroProps
  extends React.HTMLAttributes<HTMLDivElement> {
  brandName?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  phoneImageSrc?: string;
  phoneImageAlt?: string;
}

export function CinematicHero({
  brandName = "Cryonex",
  tagline1 = "Study in a",
  tagline2 = "more cinematic flow.",
  cardHeading = "An AI study system with real visual discipline.",
  cardDescription = (
    <>
      <span className="font-semibold text-white">Cryonex</span> turns PDFs,
      recordings, notes, and links into cleaner next steps, sharper review
      loops, and a dashboard that feels composed instead of overloaded.
    </>
  ),
  metricValue = 94,
  metricLabel = "Focus Index",
  ctaHeading = "Open the sharper study workspace.",
  ctaDescription = "Upload material, generate practice, and move through your workflow with less clutter and much stronger visual rhythm.",
  primaryCtaLabel = "Launch workspace",
  primaryCtaHref = "/app",
  secondaryCtaLabel = "See pricing",
  secondaryCtaHref = "#pricing",
  phoneImageSrc = "/marketting/cryonex-app1.png",
  phoneImageAlt = "Cryonex mobile workspace preview",
  className,
  ...props
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;

      cancelAnimationFrame(requestRef.current);

      requestRef.current = requestAnimationFrame(() => {
        if (!mainCardRef.current || !mockupRef.current) return;

        const rect = mainCardRef.current.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        mainCardRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
        mainCardRef.current.style.setProperty("--mouse-y", `${mouseY}px`);

        const xVal = (event.clientX / window.innerWidth - 0.5) * 2;
        const yVal = (event.clientY / window.innerHeight - 0.5) * 2;

        gsap.to(mockupRef.current, {
          rotationY: xVal * 12,
          rotationX: -yVal * 10,
          ease: "power3.out",
          duration: 1.15,
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      gsap.set(".text-track", {
        autoAlpha: 0,
        y: 60,
        scale: 0.86,
        filter: "blur(20px)",
        rotationX: -18,
      });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 220, autoAlpha: 1 });
      gsap.set(
        [
          ".card-left-text",
          ".card-right-text",
          ".mockup-scroll-wrapper",
          ".floating-badge",
          ".phone-widget",
          ".micro-proof",
        ],
        { autoAlpha: 0 },
      );
      gsap.set(".cta-wrapper", {
        autoAlpha: 0,
        scale: 0.84,
        filter: "blur(30px)",
      });

      const introTl = gsap.timeline({ delay: 0.28 });
      introTl
        .to(".text-track", {
          duration: 1.7,
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          rotationX: 0,
          ease: "expo.out",
        })
        .to(
          ".text-days",
          {
            duration: 1.35,
            clipPath: "inset(0 0% 0 0)",
            ease: "power4.inOut",
          },
          "-=0.95",
        );

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=6800",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to(
          [".hero-text-wrapper", ".bg-grid-theme", ".hero-orbit"],
          {
            scale: 1.14,
            filter: "blur(18px)",
            opacity: 0.18,
            ease: "power2.inOut",
            duration: 2,
          },
          0,
        )
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", {
          width: "100%",
          height: "100%",
          borderRadius: "0px",
          ease: "power3.inOut",
          duration: 1.5,
        })
        .fromTo(
          ".mockup-scroll-wrapper",
          {
            y: 280,
            z: -500,
            rotationX: 46,
            rotationY: -26,
            autoAlpha: 0,
            scale: 0.62,
          },
          {
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            autoAlpha: 1,
            scale: 1,
            ease: "expo.out",
            duration: 2.5,
          },
          "-=0.8",
        )
        .fromTo(
          ".phone-widget",
          { y: 40, autoAlpha: 0, scale: 0.95 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            stagger: 0.14,
            ease: "back.out(1.2)",
            duration: 1.5,
          },
          "-=1.5",
        )
        .to(".progress-ring", {
          strokeDashoffset: 88,
          duration: 2,
          ease: "power3.inOut",
        })
        .to(
          ".counter-val",
          {
            innerHTML: metricValue,
            snap: { innerHTML: 1 },
            duration: 2,
            ease: "expo.out",
          },
          "-=2.0",
        )
        .fromTo(
          ".floating-badge",
          { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            rotationZ: 0,
            ease: "back.out(1.4)",
            duration: 1.45,
            stagger: 0.18,
          },
          "-=1.9",
        )
        .fromTo(
          ".card-left-text",
          { x: -50, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.45 },
          "-=1.45",
        )
        .fromTo(
          ".card-right-text",
          { x: 50, autoAlpha: 0, scale: 0.86 },
          {
            x: 0,
            autoAlpha: 1,
            scale: 1,
            ease: "expo.out",
            duration: 1.45,
          },
          "<",
        )
        .fromTo(
          ".micro-proof",
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            stagger: 0.1,
            duration: 1.2,
            ease: "power3.out",
          },
          "-=1.2",
        )
        .to({}, { duration: 2.2 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1 })
        .to({}, { duration: 1.2 })
        .to(
          [
            ".mockup-scroll-wrapper",
            ".floating-badge",
            ".card-left-text",
            ".card-right-text",
            ".micro-proof",
          ],
          {
            scale: 0.9,
            y: -40,
            z: -200,
            autoAlpha: 0,
            ease: "power3.in",
            duration: 1.1,
            stagger: 0.04,
          },
        )
        .to(
          ".main-card",
          {
            width: isMobile ? "92vw" : "86vw",
            height: isMobile ? "92vh" : "84vh",
            borderRadius: isMobile ? "32px" : "40px",
            ease: "expo.inOut",
            duration: 1.8,
          },
          "pullback",
        )
        .to(
          ".cta-wrapper",
          {
            scale: 1,
            filter: "blur(0px)",
            ease: "expo.inOut",
            duration: 1.8,
          },
          "pullback",
        )
        .to(".main-card", {
          y: -window.innerHeight - 300,
          ease: "power3.in",
          duration: 1.4,
        });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#030712] font-sans text-foreground antialiased",
        className,
      )}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />

      <div className="hero-aurora left-[-12%] top-[8%] h-[24rem] w-[24rem] bg-[#0ea5e9]/25" />
      <div className="hero-aurora hero-orbit right-[-8%] top-[18%] h-[18rem] w-[18rem] bg-[#fb923c]/16" />
      <div className="hero-aurora hero-orbit bottom-[2%] left-[12%] h-[26rem] w-[26rem] bg-[#14b8a6]/14" />
      <div className="film-grain" aria-hidden="true" />
      <div
        className="bg-grid-theme pointer-events-none absolute inset-0 z-0 opacity-55"
        aria-hidden="true"
      />

      <div className="hero-text-wrapper absolute z-10 flex w-screen flex-col items-center justify-center px-4 text-center will-change-transform">
        <h1 className="text-track gsap-reveal text-3d-matte mb-3 text-5xl font-semibold tracking-[-0.07em] md:text-7xl lg:text-[6rem]">
          {tagline1}
        </h1>
        <h1 className="text-days gsap-reveal text-silver-matte text-5xl font-extrabold tracking-[-0.08em] md:text-7xl lg:text-[6rem]">
          {tagline2}
        </h1>
      </div>

      <div className="cta-wrapper pointer-events-auto absolute z-10 flex w-screen flex-col items-center justify-center px-4 text-center will-change-transform">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/80 shadow-[0_20px_60px_rgba(8,15,35,0.34)] backdrop-blur-xl">
          <Sparkles className="h-4 w-4" />
          Deepshi-inspired motion
        </div>
        <h2 className="text-silver-matte mt-7 max-w-4xl text-4xl font-semibold tracking-[-0.07em] md:text-6xl lg:text-7xl">
          {ctaHeading}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-8 text-slate-300/76 md:text-xl">
          {ctaDescription}
        </p>
        <div className="mt-10 flex flex-col gap-5 sm:flex-row">
          <a
            href={primaryCtaHref}
            className="btn-modern-light group inline-flex items-center justify-center gap-3 rounded-[1.35rem] px-8 py-4 text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#030712]"
          >
            <span>{primaryCtaLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href={secondaryCtaHref}
            className="btn-modern-dark group inline-flex items-center justify-center gap-3 rounded-[1.35rem] px-8 py-4 text-sm font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-[#030712]"
          >
            <Play className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            <span>{secondaryCtaLabel}</span>
          </a>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        style={{ perspective: "1500px" }}
      >
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card pointer-events-auto relative flex h-[92vh] w-[92vw] items-center justify-center overflow-hidden rounded-[32px] md:h-[84vh] md:w-[86vw] md:rounded-[40px]"
        >
          <div className="card-sheen" aria-hidden="true" />

          <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-evenly px-4 py-6 lg:grid lg:grid-cols-3 lg:items-center lg:gap-8 lg:px-12 lg:py-0">
            <div className="card-right-text gsap-reveal order-1 z-20 flex w-full justify-center lg:order-3 lg:justify-end">
              <div className="text-center lg:text-right">
                <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.34em] text-cyan-100/52">
                  Crafted for focus
                </p>
                <h2 className="text-card-silver-matte text-6xl font-black uppercase tracking-[-0.09em] md:text-[5.4rem] lg:text-[7.4rem]">
                  {brandName}
                </h2>
              </div>
            </div>

            <div
              className="mockup-scroll-wrapper order-2 relative flex h-[400px] w-full items-center justify-center lg:order-2 lg:h-[620px]"
              style={{ perspective: "1000px" }}
            >
              <div className="relative flex h-full w-full scale-[0.68] items-center justify-center md:scale-[0.82] lg:scale-100">
                <div
                  ref={mockupRef}
                  className="iphone-bezel relative flex h-[590px] w-[290px] flex-col rounded-[3rem] will-change-transform"
                >
                  <div
                    className="hardware-btn absolute left-[-3px] top-[120px] z-0 h-[25px] w-[3px] rounded-l-md"
                    aria-hidden="true"
                  />
                  <div
                    className="hardware-btn absolute left-[-3px] top-[160px] z-0 h-[45px] w-[3px] rounded-l-md"
                    aria-hidden="true"
                  />
                  <div
                    className="hardware-btn absolute left-[-3px] top-[220px] z-0 h-[45px] w-[3px] rounded-l-md"
                    aria-hidden="true"
                  />
                  <div
                    className="hardware-btn absolute right-[-3px] top-[170px] z-0 h-[70px] w-[3px] scale-x-[-1] rounded-r-md"
                    aria-hidden="true"
                  />

                  <div className="absolute inset-[7px] overflow-hidden rounded-[2.5rem] bg-[#040814] text-white shadow-[inset_0_0_16px_rgba(0,0,0,1)]">
                    <img
                      src={phoneImageSrc}
                      alt={phoneImageAlt}
                      className="absolute inset-0 h-full w-full object-cover opacity-54"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.2),rgba(3,7,18,0.9)_78%)]" />
                    <div className="screen-glare pointer-events-none absolute inset-0 z-40" />

                    <div className="absolute left-1/2 top-[5px] z-50 flex h-[28px] w-[102px] -translate-x-1/2 items-center justify-between rounded-full bg-black px-3 shadow-[inset_0_-1px_2px_rgba(255,255,255,0.12)]">
                      <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                      <div className="h-2 w-8 rounded-full bg-white/10" />
                    </div>

                    <div className="relative flex h-full flex-col px-5 pb-8 pt-12">
                      <div className="phone-widget mb-8 flex items-center justify-between">
                        <div>
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-100/48">
                            Today
                          </span>
                          <span className="text-xl font-bold tracking-tight text-white drop-shadow-md">
                            Study pulse
                          </span>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg shadow-black/50">
                          <BrainCircuit className="h-4 w-4 text-cyan-100" />
                        </div>
                      </div>

                      <div className="phone-widget relative mb-8 mx-auto flex h-44 w-44 items-center justify-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]">
                        <svg
                          className="absolute inset-0 h-full w-full"
                          aria-hidden="true"
                        >
                          <circle
                            cx="88"
                            cy="88"
                            r="64"
                            fill="none"
                            stroke="rgba(255,255,255,0.04)"
                            strokeWidth="12"
                          />
                          <circle
                            className="progress-ring"
                            cx="88"
                            cy="88"
                            r="64"
                            fill="none"
                            stroke="#7dd3fc"
                            strokeWidth="12"
                          />
                        </svg>
                        <div className="z-10 flex flex-col items-center text-center">
                          <span className="counter-val text-4xl font-extrabold tracking-[-0.08em] text-white">
                            0
                          </span>
                          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-cyan-100/56">
                            {metricLabel}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="phone-widget widget-depth flex items-center rounded-2xl p-3">
                          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/18 bg-cyan-400/10 shadow-inner">
                            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 h-2 w-24 rounded-full bg-white/70 shadow-inner" />
                            <div className="h-1.5 w-20 rounded-full bg-white/24 shadow-inner" />
                          </div>
                        </div>
                        <div className="phone-widget widget-depth flex items-center rounded-2xl p-3">
                          <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-300/18 bg-emerald-400/10 shadow-inner">
                            <ShieldCheck className="h-4 w-4 text-emerald-300" />
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 h-2 w-20 rounded-full bg-white/70 shadow-inner" />
                            <div className="h-1.5 w-28 rounded-full bg-white/24 shadow-inner" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-4 left-1/2 h-[4px] w-[120px] -translate-x-1/2 rounded-full bg-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  </div>
                </div>

                <div className="floating-badge floating-ui-badge absolute left-[-10px] top-6 z-30 flex items-center gap-3 rounded-xl p-3 lg:left-[-88px] lg:top-12 lg:gap-4 lg:rounded-2xl lg:p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 lg:h-10 lg:w-10">
                    <Sparkles className="h-4 w-4 text-cyan-100 lg:h-5 lg:w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-tight text-white lg:text-sm">
                      Calm visual hierarchy
                    </p>
                    <p className="text-[10px] font-medium text-cyan-100/55 lg:text-xs">
                      Less noise, faster scanning
                    </p>
                  </div>
                </div>

                <div className="floating-badge floating-ui-badge absolute bottom-12 right-[-10px] z-30 flex items-center gap-3 rounded-xl p-3 lg:bottom-20 lg:right-[-88px] lg:gap-4 lg:rounded-2xl lg:p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/25 bg-amber-400/10 lg:h-10 lg:w-10">
                    <Telescope className="h-4 w-4 text-amber-100 lg:h-5 lg:w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-tight text-white lg:text-sm">
                      Guided next action
                    </p>
                    <p className="text-[10px] font-medium text-cyan-100/55 lg:text-xs">
                      Review without getting lost
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-left-text gsap-reveal order-3 z-20 flex w-full flex-col justify-center px-4 text-center lg:order-1 lg:px-0 lg:text-left">
              <h3 className="text-2xl font-semibold tracking-[-0.05em] text-white md:text-3xl lg:text-4xl">
                {cardHeading}
              </h3>
              <p className="mx-auto mt-4 hidden max-w-md text-sm leading-7 text-cyan-50/70 md:block lg:mx-0 lg:text-base">
                {cardDescription}
              </p>

              <div className="mt-6 hidden gap-3 md:grid">
                {[
                  "Cleaner dashboard rhythm",
                  "Sharper mobile affordances",
                  "Fewer distracting AI flourishes",
                ].map((item) => (
                  <div
                    key={item}
                    className="micro-proof flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-left backdrop-blur-md"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10">
                      <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                    </div>
                    <p className="text-sm font-medium text-white/82">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CinematicHero;
