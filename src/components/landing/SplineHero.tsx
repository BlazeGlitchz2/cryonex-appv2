import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { getAssetUrl } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, Users } from "lucide-react";
import { SplineErrorBoundary } from "@/components/SplineErrorBoundary";
import { useNavigate } from "react-router";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { LiteModeHero } from './LiteModeHero';

const Spline = lazy(() => import('@splinetool/react-spline'));

export function SplineHero() {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const qualityTier = usePerformanceStore(state => state.qualityTier);
    const disable3D = usePerformanceStore(state => state.disable3D);

    const shouldOptimize = isMobile || qualityTier === 'lite' || disable3D;

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Background Layer: Spline or Lite Mode Hero */}
            <div className="absolute inset-0 z-0">
                {!shouldOptimize ? (
                    <SplineErrorBoundary
                        fallback={<LiteModeHero />}
                    >
                        <Suspense
                            fallback={<LiteModeHero />}
                        >
                            <Spline
                                scene={getAssetUrl('/spline/hero.splinecode')}
                                className="w-full h-full"
                            />
                        </Suspense>
                    </SplineErrorBoundary>
                ) : (
                    <LiteModeHero />
                )}
            </div>

            {/* Overlay Gradient for Text Readability */}
            <div className="absolute inset-0 z-[5] bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

            {/* Content Layer */}
            <div className="relative z-10 flex flex-col justify-center h-full pointer-events-none px-6 md:px-20 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="flex flex-col items-start max-w-3xl"
                >
                    {/* Social Proof Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8 w-fit pointer-events-auto hover:bg-white/20 transition-colors cursor-default">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 border-2 border-black" />
                            ))}
                        </div>
                        <span className="text-sm font-medium text-white/90">
                            <span className="font-bold text-cyan-400">3,247</span> students studying now
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-sans tracking-tighter text-white mb-6 leading-[1.1] drop-shadow-2xl">
                        Turn PDFs into <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-fuchsia-400 animate-gradient bg-300%">
                            Podcasts
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-white/80 font-light mb-10 max-w-xl leading-relaxed">
                        Listen to your notes. Ace your exams. The only study tool you need.
                    </p>

                    <div className="pointer-events-auto flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate("/app")}
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-2"
                        >
                            Start Studying Free
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-transform group-hover:translate-x-1"
                            >
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm animate-bounce pointer-events-none flex flex-col items-center gap-2"
            >
                <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
                Scroll to Explore
            </motion.div>
        </div>
    );
}
