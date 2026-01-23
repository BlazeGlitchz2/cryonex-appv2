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
import { Zap, AlertTriangle, Cpu, Gauge } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function PerformanceOptimizer() {
    const { metrics, isDetecting } = usePerformance();
    const deviceInfo = useDeviceInfo();
    const { qualityTier, setQualityTier, getEffectiveTier } = usePerformanceStore();
    const getRecommendation = useAction(api.performance.getPerformanceRecommendation);

    const [showModal, setShowModal] = useState(false);
    const [recommendation, setRecommendation] = useState<{
        tier: PerformanceTier;
        reason: string;
    } | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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
                setShowModal(true);
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
            setShowModal(false);
        }
    };

    return (
        <AnimatePresence>
            <Dialog open={showModal} onOpenChange={setShowModal}>
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
                            onClick={() => setShowModal(false)}
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
        </AnimatePresence>
    );
}
