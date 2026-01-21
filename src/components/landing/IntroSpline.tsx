import { useState, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { getAssetUrl } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { SplineErrorBoundary } from "@/components/SplineErrorBoundary";

const Spline = lazy(() => import('@splinetool/react-spline'));

interface IntroSplineProps {
    onComplete: () => void;
}

export function IntroSpline({ onComplete }: IntroSplineProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const isMobile = useIsMobile();
    const [isEntering, setIsEntering] = useState(false);

    // If mobile, automatically "load" (skip spline)
    useEffect(() => {
        if (isMobile) {
            setIsLoaded(true);
        }
    }, [isMobile]);

    function onLoad(spline: any) {
        setIsLoaded(true);
    }

    const handleClick = () => {
        // If already entering, a second click skips the wait immediately
        if (isEntering) {
            onComplete();
            return;
        }

        // User clicks to trigger the Spline animation (handled by the scene itself)
        // We wait for the animation to complete (approx 1.6 second now) before navigating
        setIsEntering(true);
        setTimeout(() => {
            onComplete();
        }, 1600);
    };

    // Add global click listener for skipping when entering
    useEffect(() => {
        if (!isEntering) return;

        const handleGlobalClick = () => {
            onComplete();
        };

        // Delay attaching the listener by 1s to prevent immediate skipping
        // from the initial click or accidental double clicks
        const timer = setTimeout(() => {
            window.addEventListener('mousedown', handleGlobalClick);
        }, 1000);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('mousedown', handleGlobalClick);
        };
    }, [isEntering, onComplete]);

    return (
        <div
            className="fixed inset-0 z-[9999] bg-black"
        >
            {!isLoaded && !isMobile && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                </div>
            )}

            {!isMobile ? (
                <SplineErrorBoundary
                    fallback={
                        <div className="absolute inset-0 flex items-center justify-center bg-black cursor-auto">
                            <div className="text-center px-4 flex flex-col items-center">
                                <h1 className="text-4xl font-bold text-white mb-4">Welcome to Cryonex</h1>
                                <p className="text-white/60 mb-8">Experience the future of learning.</p>
                                <Button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onComplete();
                                    }}
                                    className="group relative overflow-hidden rounded-full bg-white px-8 py-6 text-lg font-bold text-black transition-transform hover:scale-105"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        ENTER EXPERIENCE <ArrowRight className="h-5 w-5" />
                                    </span>
                                </Button>
                            </div>
                        </div>
                    }
                >
                    <Suspense fallback={null}>
                        <div className="w-full h-full">
                            <Spline
                                scene={getAssetUrl('/spline/intro.splinecode')}
                                onLoad={onLoad}
                                onMouseDown={handleClick}
                                className="w-full h-full"
                            />
                        </div>
                    </Suspense>
                </SplineErrorBoundary>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-black cursor-auto">
                    <div className="text-center px-4">
                        <h1 className="text-4xl font-bold text-white mb-4">Welcome to Cryonex</h1>
                        <p className="text-white/60 mb-8">Experience the future of learning.</p>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                onComplete();
                            }}
                            className="group relative overflow-hidden rounded-full bg-white px-8 py-6 text-lg font-bold text-black transition-transform hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                ENTER EXPERIENCE <ArrowRight className="h-5 w-5" />
                            </span>
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
