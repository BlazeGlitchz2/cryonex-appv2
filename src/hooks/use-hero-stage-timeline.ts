import { RefObject, useEffect } from "react";

interface HeroStageTimelineArgs {
  rootRef: RefObject<HTMLElement | null>;
  copyRef: RefObject<HTMLElement | null>;
  mediaRef: RefObject<HTMLElement | null>;
  proofRef: RefObject<HTMLElement | null>;
  statsRef: RefObject<HTMLElement | null>;
  ctaRef: RefObject<HTMLElement | null>;
  reducedMotion: boolean;
}

export function useHeroStageTimeline({
  rootRef,
  copyRef,
  mediaRef,
  proofRef,
  statsRef,
  ctaRef,
  reducedMotion,
}: HeroStageTimelineArgs) {
  useEffect(() => {
    if (
      reducedMotion ||
      typeof window === "undefined" ||
      !rootRef.current ||
      !copyRef.current ||
      !mediaRef.current ||
      !proofRef.current ||
      !statsRef.current ||
      !ctaRef.current
    ) {
      return;
    }

    if (window.innerWidth < 1100) {
      return;
    }

    let revert: (() => void) | undefined;
    let disposed = false;

    void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        if (disposed) {
          return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          const proofItems =
            gsap.utils.toArray<HTMLElement>("[data-hero-proof]");
          const statItems = gsap.utils.toArray<HTMLElement>("[data-hero-stat]");

          gsap.set(copyRef.current, {
            autoAlpha: 0,
            y: 40,
            filter: "blur(12px)",
          });
          gsap.set(mediaRef.current, {
            autoAlpha: 0,
            y: 80,
            scale: 0.94,
            rotateX: 8,
            rotateY: -10,
            transformPerspective: 1600,
          });
          gsap.set(proofItems, { autoAlpha: 0, y: 18 });
          gsap.set(statItems, { autoAlpha: 0, y: 20 });
          gsap.set(ctaRef.current, { autoAlpha: 0, y: 24 });

          const intro = gsap.timeline({ delay: 0.15 });
          intro
            .to(copyRef.current, {
              autoAlpha: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "power3.out",
            })
            .to(
              mediaRef.current,
              {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                rotateY: 0,
                duration: 1.05,
                ease: "expo.out",
              },
              "-=0.4",
            )
            .to(
              proofItems,
              {
                autoAlpha: 1,
                y: 0,
                stagger: 0.06,
                duration: 0.5,
                ease: "power2.out",
              },
              "-=0.45",
            )
            .to(
              ctaRef.current,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.55,
                ease: "power2.out",
              },
              "-=0.28",
            );

          const scrollTl = gsap.timeline({
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top",
              end: "+=1800",
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          });

          scrollTl
            .to(
              copyRef.current,
              {
                y: -48,
                scale: 0.94,
                opacity: 0.7,
                ease: "power2.inOut",
                duration: 1,
              },
              0,
            )
            .to(
              mediaRef.current,
              {
                y: -18,
                scale: 1.03,
                ease: "power2.inOut",
                duration: 1,
              },
              0,
            )
            .to(
              statsRef.current,
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
              },
              0.28,
            )
            .to(
              statItems,
              {
                autoAlpha: 1,
                y: 0,
                stagger: 0.08,
                duration: 0.65,
                ease: "power2.out",
              },
              0.3,
            )
            .to(
              mediaRef.current,
              {
                boxShadow: "0 55px 120px -32px rgba(0, 0, 0, 0.84)",
                duration: 0.7,
              },
              0.4,
            );
        }, rootRef);

        revert = () => ctx.revert();
      },
    );

    return () => {
      disposed = true;
      revert?.();
    };
  }, [ctaRef, copyRef, mediaRef, proofRef, reducedMotion, rootRef, statsRef]);
}
