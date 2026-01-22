import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { getAssetUrl } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2 } from "lucide-react";
import { SplineErrorBoundary } from "@/components/SplineErrorBoundary";
import { useNavigate } from "react-router";
import { usePerformanceStore } from "@/lib/stores/performance-store";

const Spline = lazy(() => import('@splinetool/react-spline'));

export function SplineHero() {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
    const qualityTier = usePerformanceStore(state => state.qualityTier);
    const disable3D = usePerformanceStore(state => state.disable3D);

    const shouldOptimize = isMobile || qualityTier === 'lite' || disable3D;

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Spline Scene */}
            <div className="absolute inset-0 z-0">
                {!shouldOptimize ? (
                    <SplineErrorBoundary
                        fallback={
                            <div className="w-full h-full bg-gradient-to-b from-black via-purple-950/20 to-black" />
                        }
                    >
                        <Suspense
                            fallback={
                                <div className="w-full h-full flex items-center justify-center bg-black">
                                    <Loader2 className="w-10 h-10 text-white/20 animate-spin" />
                                </div>
                            }
                        >
                            <Spline
                                scene={getAssetUrl('/spline/hero.splinecode')}
                                className="w-full h-full"
                            />
                        </Suspense>
                    </SplineErrorBoundary>
                ) : (
                    // Mobile/Smartboard optimized fallback - static or simple gradient
                    <div className="w-full h-full bg-gradient-to-b from-black via-purple-950/20 to-black" />
                )}
            </div>

            {/* Overlay Content */}
            <div className="relative z-10 flex flex-col justify-center h-full pointer-events-none px-6 md:px-20 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="flex flex-col items-start max-w-2xl"
                >
                    <h1 className="text-3xl md:text-6xl font-orbitron tracking-tighter text-white mb-6 leading-tight">
                        Master Any <br /> Subject
                    </h1>

                    <p className="text-xl md:text-2xl text-white/60 font-light mb-8 max-w-xl">
                        The ultimate AI study companion. Chat with your documents and master any subject.
                    </p>

                    <div className="pointer-events-auto">
                        <button
                            onClick={() => navigate("/app")}
                            className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center gap-2"
                        >
                            Get Started
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
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-sm animate-bounce pointer-events-none"
            >
                Scroll to Explore
            </motion.div>
        </div>
    );
}
