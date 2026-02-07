import { useEffect, useState } from "react";
import { SplineHero } from "@/components/landing/SplineHero";
import RotatingGradientRight from "@/components/ui/rotating-gradient-right";
import { Interactive3DCard } from "@/components/landing/Interactive3DCard";
import { LobeFooter } from "@/components/landing/LobeFooter";
import { IntroSpline } from "@/components/landing/IntroSpline";
import { Headphones, Brain, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { FullScreenMenu } from "@/components/ui/FullScreenMenu";
import { LobeHeader } from "@/components/landing/LobeHeader";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import BentoGrid from "@/components/ui/bento-grid-01";
import { getBunnyStorageUrl } from "@/lib/utils/cdn-optimizer";
import { PerformanceOptimizer } from "@/components/performance/PerformanceOptimizer";

import { LiteModeHero } from "@/components/landing/LiteModeHero";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { useIsMobile } from "@/hooks/use-mobile";
import Lenis from "lenis";

export default function Landing() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Performance Hooks
  const isMobile = useIsMobile();
  const qualityTier = usePerformanceStore((state) => state.qualityTier);
  const disable3D = usePerformanceStore((state) => state.disable3D);
  const shouldOptimize = isMobile || qualityTier === "lite" || disable3D;

  // Enforce black background and init Lenis
  useEffect(() => {
    document.body.style.backgroundColor = "#000000";

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 2,
    });
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      document.body.style.backgroundColor = "";
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white relative font-sans selection:bg-purple-500/30">
      {!assetsLoaded && (
        <IntroSpline onComplete={() => setAssetsLoaded(true)} />
      )}

      {assetsLoaded && (
        <>
          <FullScreenMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 right-0 z-50">
            <LobeHeader onMenuOpen={() => setMenuOpen(true)} />
          </div>

          <main>
            {/* Hero Section */}
            <SplineHero />

            {/* Scroll Expansion Hero */}
            {/* Scroll Expansion Hero - Lite Mode Aware */}
            {!shouldOptimize ? (
              <ScrollExpandMedia
                mediaType="video"
                isHls={false}
                mediaSrc="https://cryonex-cdn.b-cdn.net/Cinematic_premium_sky_1080p_202601102101.mp4"
                posterSrc="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1920&auto=format&fit=crop"
                bgImageSrc="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1920&auto=format&fit=crop"
                title="Listen to Your Notes"
                date="Audio Learning Reimagined"
                scrollToExpand="Swipe to Learn"
                textBlend={true}
              >
                <BentoGrid />
              </ScrollExpandMedia>
            ) : (
              <section className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden">
                {/* Static Premium Background */}
                <div className="absolute inset-0 z-0">
                  {/* Static Background Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1920&auto=format&fit=crop')`,
                    }}
                  />
                  {/* Dark Gradient Overlay for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
                  <LiteModeHero />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20 flex flex-col items-center">
                  <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-7xl font-orbitron font-bold text-white mb-6 tracking-tight">
                      Listen to{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        Your Notes
                      </span>
                    </h2>
                    <p className="text-xl md:text-2xl text-white/70">
                      Audio Learning Reimagined
                    </p>
                  </div>

                  <BentoGrid />
                </div>
              </section>
            )}

            {/* Parallax Section */}
            <RotatingGradientRight />

            {/* Features Grid */}
            <section className="py-32 px-6 relative z-10">
              <div className="max-w-7xl mx-auto">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-4xl md:text-6xl font-bold text-center mb-20"
                >
                  Why Students{" "}
                  <span className="text-purple-400">Love Cryonex</span>
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <Interactive3DCard
                    title="PDF to Podcast"
                    description="Don't just read. Listen. Turn your textbooks and notes into engaging audio podcasts you can listen to on the go."
                    icon={<Headphones className="w-8 h-8 text-white" />}
                  />
                  <Interactive3DCard
                    title="Instant Flashcards"
                    description="Stop wasting hours making cards. Upload your notes and get AI-generated flashcards instantly."
                    icon={<Brain className="w-8 h-8 text-white" />}
                  />
                  <Interactive3DCard
                    title="Ace Every Exam"
                    description="Personalized study plans, practice quizzes, and AI tutoring to ensure you get that A."
                    icon={<GraduationCap className="w-8 h-8 text-white" />}
                  />
                </div>
              </div>
            </section>

            {/* Footer */}
            <LobeFooter />
          </main>
          <PerformanceOptimizer />
        </>
      )}
    </div>
  );
}
