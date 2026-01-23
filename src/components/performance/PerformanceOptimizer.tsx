import React, { useState, useEffect, useCallback } from 'react';
import { usePerformance, PerformanceTier } from '@/hooks/use-performance';
import { useDeviceInfo } from '@/hooks/use-mobile';
import { usePerformanceStore } from '@/lib/stores/performance-store';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle, Cpu, Gauge, Sparkles, Monitor, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const TIER_INFO = {
    full: {
        label: "Full Mode",
        description: "Maximum quality with all 3D effects and shaders enabled. Best for high-end PCs.",
        icon: Sparkles,
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    },
    balanced: {
        label: "Balanced Mode",
        description: "A smooth experience with optimized effects. Best for most devices.",
        icon: Zap,
        color: "text-yellow-400",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20"
    },
    lite: {
        label: "Lite Mode",
        description: "Maximum performance with heavy effects disabled. Best for mobile and low-end devices.",
        icon: Monitor,
        color: "text-green-400",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
    }
};

export function PerformanceOptimizer() {
    const { metrics, isDetecting } = usePerformance();
    const deviceInfo = useDeviceInfo();
    const { qualityTier, setQualityTier, getEffectiveTier } = usePerformanceStore();
    const getRecommendation = useAction(api.performance.getPerformanceRecommendation);

    const [showRecommendationModal, setShowRecommendationModal] = useState(false);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const [recommendation, setRecommendation] = useState<{
        tier: PerformanceTier;
        reason: string;
    } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const effectiveTier = getEffectiveTier();
    const tierInfo = TIER_INFO[effectiveTier];

    // Check if we should show the initial warning modal
    useEffect(() => {
        const skipWarning = localStorage.getItem('cryonex_skip_perf_warning') === 'true';
        if (!skipWarning) {
            // Delay slightly to ensure it shows up after initial load
            const timer = setTimeout(() => setShowWarningModal(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const runAnalysis = useCallback(async () => {
        if (isDetecting || !metrics.fps) return;

        setIsAnalyzing(true);
        try {
            const deviceType = deviceInfo.isTablet ? 'Tablet' : deviceInfo.isMobile ? 'Mobile' : 'Desktop';
            const result = await getRecommendation({
                metrics: {
                    fps: metrics.fps,
                    gpuTier: metrics.gpuTier,
                    deviceMemory: metrics.deviceMemory,
                    cpuCores: metrics.cpuCores,
                    isLowEndDevice: metrics.isLowEndDevice,
                    deviceType,
                },
            });

            const currentTier = getEffectiveTier();

            // Only show modal if recommendation is lower than current tier
            // or if we are on 'auto' and the AI suggests 'lite'
            const tierRank = { lite: 0, balanced: 1, full: 2 };
            if (tierRank[result.recommendation as PerformanceTier] < tierRank[currentTier]) {
                setRecommendation({
                    tier: result.recommendation as PerformanceTier,
                    reason: result.reason,
                });
                setShowRecommendationModal(true);
            }
        } catch (error) {
            console.error('AI Performance analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [isDetecting, metrics, deviceInfo, getRecommendation, getEffectiveTier]);

    // Initial analysis after detection
    useEffect(() => {
        if (!isDetecting && metrics.fps) {
            runAnalysis();
        }
    }, [isDetecting, metrics.fps, runAnalysis]);

    // Re-run every 6 minutes
    useEffect(() => {
        const interval = setInterval(runAnalysis, 6 * 60 * 1000);
        return () => clearInterval(interval);
    }, [runAnalysis]);

    const handleSwitch = () => {
        if (recommendation) {
            setQualityTier(recommendation.tier);
            setShowRecommendationModal(false);
        }
    };

    const handleCloseWarning = () => {
        if (dontShowAgain) {
            localStorage.setItem('cryonex_skip_perf_warning', 'true');
        }
        setShowWarningModal(false);
    };

    return (
        <>
            <AnimatePresence>
                {/* Recommendation Modal */}
                <Dialog open={showRecommendationModal} onOpenChange={setShowRecommendationModal}>
                    <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-xl border-primary/20">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2 rounded-full bg-yellow-500/20 text-yellow-500">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <DialogTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                                    Performance Warning
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-muted-foreground text-base">
                                We've detected that your device is running on low performance.
                                To ensure a smooth experience, we recommend switching to
                                <span className="font-bold text-primary mx-1 uppercase">
                                    {recommendation?.tier} mode
                                </span>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4 space-y-4">
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Gauge className="w-4 h-4" />
                                        <span>Current FPS</span>
                                    </div>
                                    <span className="font-mono font-bold text-yellow-500">{metrics.fps} FPS</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Cpu className="w-4 h-4" />
                                        <span>Device Tier</span>
                                    </div>
                                    <span className="font-bold capitalize">{metrics.gpuTier}</span>
                                </div>
                                <div className="pt-2 border-t border-primary/10">
                                    <p className="text-xs text-muted-foreground italic">
                                        " {recommendation?.reason} "
                                    </p>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowRecommendationModal(false)}
                                className="flex-1 border-primary/20 hover:bg-primary/5"
                            >
                                Keep Current
                            </Button>
                            <Button
                                onClick={handleSwitch}
                                className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity gap-2"
                            >
                                <Zap className="w-4 h-4" />
                                Switch to {recommendation?.tier}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Initial Warning Modal */}
                <Dialog open={showWarningModal} onOpenChange={setShowWarningModal}>
                    <DialogContent className="sm:max-w-[450px] bg-background/90 backdrop-blur-2xl border-white/10 shadow-2xl">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className={cn("p-2.5 rounded-xl", tierInfo.bg, tierInfo.color)}>
                                    <tierInfo.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold tracking-tight text-white">
                                        {tierInfo.label} Active
                                    </DialogTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Optimizing your experience
                                    </p>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="py-6 space-y-6">
                            <div className={cn("p-5 rounded-2xl border transition-all duration-500", tierInfo.bg, tierInfo.border)}>
                                <p className="text-white/90 leading-relaxed font-medium">
                                    {tierInfo.description}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    What to expect
                                </h4>
                                <ul className="grid gap-3">
                                    {effectiveTier === 'full' && (
                                        <>
                                            <li className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                                                High-end GLSL shader backgrounds enabled
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                                                Interactive 3D Spline environments
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                                                Maximum particle density and animations
                                            </li>
                                        </>
                                    )}
                                    {effectiveTier === 'balanced' && (
                                        <>
                                            <li className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                                                Optimized shader backgrounds for stability
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                                                Smooth 3D performance on most devices
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0" />
                                                Balanced visual fidelity and responsiveness
                                            </li>
                                        </>
                                    )}
                                    {effectiveTier === 'lite' && (
                                        <>
                                            <li className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                                Static backgrounds for maximum speed
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                                3D elements replaced with optimized 2D assets
                                            </li>
                                            <li className="flex items-start gap-3 text-sm text-white/70">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                                                Minimal animations to save battery and CPU
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col gap-4 sm:flex-col">
                            <div className="flex items-center space-x-2 px-1">
                                <Checkbox
                                    id="dont-show"
                                    checked={dontShowAgain}
                                    onCheckedChange={(checked) => setDontShowAgain(!!checked)}
                                    className="border-white/20 data-[state=checked]:bg-primary"
                                />
                                <label
                                    htmlFor="dont-show"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground cursor-pointer hover:text-white transition-colors"
                                >
                                    Don't show this again
                                </label>
                            </div>
                            <Button
                                onClick={handleCloseWarning}
                                className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 rounded-xl transition-all active:scale-[0.98]"
                            >
                                Got it, let's go!
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </AnimatePresence>
        </>
    );
}
