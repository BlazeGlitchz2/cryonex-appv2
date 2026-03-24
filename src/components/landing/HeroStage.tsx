import { useMemo, useRef } from "react";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";

import { useHeroStageTimeline } from "@/hooks/use-hero-stage-timeline";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import type { LandingHeroContent } from "@/components/landing/landing-content";

interface HeroStageProps {
  content: LandingHeroContent;
}

export function HeroStage({ content }: HeroStageProps) {
  const rootRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const proofRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const reducedMotion = usePerformanceStore((state) => state.reducedMotion);
  const disable3D = usePerformanceStore((state) => state.disable3D);
  const disableParticles = usePerformanceStore(
    (state) => state.disableParticles,
  );
  const disableShaders = usePerformanceStore((state) => state.disableShaders);

  const heavyEffectsDisabled = useMemo(
    () => reducedMotion || disable3D || disableParticles || disableShaders,
    [disable3D, disableParticles, disableShaders, reducedMotion],
  );

  useHeroStageTimeline({
    rootRef,
    copyRef,
    mediaRef,
    proofRef,
    statsRef,
    ctaRef,
    reducedMotion: heavyEffectsDisabled,
  });

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen items-center px-5 pb-14 pt-28 sm:px-8 lg:px-10 lg:pb-24"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div ref={copyRef} className="relative z-10 max-w-2xl">
          <div className="hero-kicker inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100/78">
            <PlayCircle className="h-4 w-4" />
            {content.eyebrow}
          </div>

          <div className="mt-7">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-100/55">
              {content.subtitle}
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[0.92] tracking-[-0.08em] text-white md:text-6xl lg:text-[5.5rem]">
              {content.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300/76 md:text-xl">
              {content.description}
            </p>
          </div>

          <div
            ref={proofRef}
            className="mt-8 flex flex-wrap gap-3"
            aria-label="Core Cryonex study outputs"
          >
            {content.proof.map((item) => (
              <div
                key={item.label}
                data-hero-proof
                className="hero-proof-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/76"
              >
                <CheckCircle2 className="h-4 w-4 text-cyan-200" />
                {item.label}
              </div>
            ))}
          </div>

          <div ref={ctaRef} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={content.primaryAction.href}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
            >
              {content.primaryAction.label}
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={content.secondaryAction.href}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/4 px-6 py-3 text-sm font-semibold text-white/88 transition-colors hover:bg-white/8"
            >
              {content.secondaryAction.label}
            </a>
          </div>
        </div>

        <div className="relative z-10">
          {!heavyEffectsDisabled && content.media.video ? (
            <video
              className="absolute inset-0 h-full w-full rounded-[2rem] object-cover opacity-[0.16] blur-[2px]"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={content.media.poster}
              aria-hidden="true"
            >
              <source src={content.media.video} type="video/mp4" />
            </video>
          ) : null}

          <div
            ref={mediaRef}
            className="hero-media-frame relative overflow-hidden rounded-[2rem] p-3 lg:p-4"
          >
            <div className="relative overflow-hidden rounded-[1.4rem] border border-white/8">
              <img
                src={content.media.image}
                alt={content.media.alt}
                className="h-auto w-full object-cover"
                fetchPriority="high"
                decoding="async"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,20,0.06),rgba(4,8,20,0.58))]" />
            </div>

            <div
              ref={statsRef}
              className="mt-4 grid gap-3 sm:grid-cols-3"
              aria-label="Cryonex product proof"
            >
              {content.stats.map((item) => (
                <div
                  key={item.value}
                  data-hero-stat
                  className="hero-proof-card rounded-[1.35rem] p-4"
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-100/46">
                    {item.value}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/72">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroStage;
