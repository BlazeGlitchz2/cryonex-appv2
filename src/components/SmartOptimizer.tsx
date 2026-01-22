import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePerformance, PerformanceTier } from '@/hooks/use-performance';
import { usePerformanceStore } from '@/lib/stores/performance-store';
import { preloadCriticalAssets } from '@/lib/utils/cdn-optimizer';

interface OptimizationContextValue {
    tier: PerformanceTier;
    isDetecting: boolean;
    disableShaders: boolean;
    disableParticles: boolean;
    disable3D: boolean;
    reducedMotion: boolean;
    shouldShowHeavyEffects: boolean;
}

const OptimizationContext = createContext<OptimizationContextValue>({
    tier: 'balanced',
    isDetecting: true,
    disableShaders: false,
    disableParticles: false,
    disable3D: false,
    reducedMotion: false,
    shouldShowHeavyEffects: true,
});

export function useOptimization(): OptimizationContextValue {
    return useContext(OptimizationContext);
}

interface SmartOptimizerProps {
    children: ReactNode;
}

export function SmartOptimizer({ children }: SmartOptimizerProps) {
    const { tier: detectedTier, isDetecting, metrics } = usePerformance();
    const {
        qualityTier,
        disableShaders,
        disableParticles,
        disable3D,
        reducedMotion,
        imageQuality,
        setDetectedTier,
        getEffectiveTier,
    } = usePerformanceStore();

    // Update store with detected tier when detection completes
    useEffect(() => {
        if (!isDetecting) {
            setDetectedTier(detectedTier);

            // Log detection results in development
            if (import.meta.env.DEV) {
                console.log('[SmartOptimizer] Performance detection complete:', {
                    detectedTier,
                    metrics,
                    effectiveTier: getEffectiveTier(),
                });
            }
        }
    }, [isDetecting, detectedTier, metrics, setDetectedTier, getEffectiveTier]);

    // Preload critical assets based on tier
    useEffect(() => {
        if (!isDetecting) {
            preloadCriticalAssets(imageQuality);
        }
    }, [isDetecting, imageQuality]);

    const effectiveTier = getEffectiveTier();

    const shouldShowHeavyEffects = !(
        effectiveTier === 'lite' ||
        disableShaders ||
        disableParticles ||
        reducedMotion
    );

    const contextValue: OptimizationContextValue = {
        tier: effectiveTier,
        isDetecting,
        disableShaders,
        disableParticles,
        disable3D,
        reducedMotion,
        shouldShowHeavyEffects,
    };

    return (
        <OptimizationContext.Provider value={contextValue}>
            {children}
        </OptimizationContext.Provider>
    );
}

/**
 * HOC to wrap components with optimization awareness
 */
export function withOptimization<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ComponentType<P>
) {
    return function OptimizedComponent(props: P) {
        const { shouldShowHeavyEffects } = useOptimization();

        if (!shouldShowHeavyEffects && fallback) {
            const FallbackComponent = fallback;
            return <FallbackComponent {...props} />;
        }

        return <Component {...props} />;
    };
}

/**
 * Component that conditionally renders based on performance tier
 */
interface OptimizedRenderProps {
    children: ReactNode;
    fallback?: ReactNode;
    minTier?: PerformanceTier;
    requireShaders?: boolean;
    require3D?: boolean;
    requireParticles?: boolean;
}

export function OptimizedRender({
    children,
    fallback = null,
    minTier = 'balanced',
    requireShaders = false,
    require3D = false,
    requireParticles = false,
}: OptimizedRenderProps) {
    const { tier, disableShaders, disable3D, disableParticles, reducedMotion } = useOptimization();

    const tierRank = { lite: 0, balanced: 1, full: 2 };
    const meetsMinTier = tierRank[tier] >= tierRank[minTier];

    const canRender =
        meetsMinTier &&
        (!requireShaders || !disableShaders) &&
        (!require3D || !disable3D) &&
        (!requireParticles || !disableParticles) &&
        !reducedMotion;

    if (!canRender) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
