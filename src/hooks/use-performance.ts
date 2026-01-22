import { useState, useEffect, useCallback } from 'react';

export type PerformanceTier = 'full' | 'balanced' | 'lite';

interface PerformanceMetrics {
    gpuTier: 'high' | 'mid' | 'low' | 'unknown';
    deviceMemory: number | null;
    cpuCores: number | null;
    fps: number | null;
    isLowEndDevice: boolean;
}

interface UsePerformanceResult {
    tier: PerformanceTier;
    metrics: PerformanceMetrics;
    isDetecting: boolean;
    rerunBenchmark: () => void;
}

// Known low-end GPU patterns
const LOW_END_GPU_PATTERNS = [
    /intel.*hd/i,
    /intel.*uhd/i,
    /intel.*graphics/i,
    /mali-4/i,
    /mali-t/i,
    /adreno.*3/i,
    /adreno.*4/i,
    /powervr/i,
    /sgx/i,
    /vivante/i,
    /videocore/i,
    /llvmpipe/i,
    /swiftshader/i,
    /software/i,
];

const MID_TIER_GPU_PATTERNS = [
    /intel.*iris/i,
    /adreno.*5/i,
    /adreno.*6/i,
    /mali-g5/i,
    /mali-g7/i,
    /nvidia.*mx/i,
    /geforce.*gt/i,
    /radeon.*vega/i,
    /apple.*m1/i,
];

function detectGpuTier(): 'high' | 'mid' | 'low' | 'unknown' {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) return 'unknown';

        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return 'unknown';

        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const gpuInfo = `${vendor} ${renderer}`.toLowerCase();

        // Store for debugging
        if (typeof window !== 'undefined') {
            (window as any).__CRYONEX_GPU_INFO__ = gpuInfo;
        }

        // Check low-end patterns
        for (const pattern of LOW_END_GPU_PATTERNS) {
            if (pattern.test(gpuInfo)) return 'low';
        }

        // Check mid-tier patterns
        for (const pattern of MID_TIER_GPU_PATTERNS) {
            if (pattern.test(gpuInfo)) return 'mid';
        }

        // Default to high for dedicated GPUs
        if (/nvidia|geforce|rtx|gtx|radeon|rx\s?\d/i.test(gpuInfo)) {
            return 'high';
        }

        return 'mid'; // Default assumption
    } catch {
        return 'unknown';
    }
}

function getDeviceMemory(): number | null {
    if ('deviceMemory' in navigator) {
        return (navigator as any).deviceMemory;
    }
    return null;
}

function getCpuCores(): number | null {
    if ('hardwareConcurrency' in navigator) {
        return navigator.hardwareConcurrency;
    }
    return null;
}

async function measureFps(): Promise<number> {
    return new Promise((resolve) => {
        let frames = 0;
        let lastTime = performance.now();
        const targetDuration = 500; // Measure for 500ms

        function countFrame() {
            frames++;
            const currentTime = performance.now();

            if (currentTime - lastTime >= targetDuration) {
                const fps = Math.round((frames / (currentTime - lastTime)) * 1000);
                resolve(fps);
            } else {
                requestAnimationFrame(countFrame);
            }
        }

        requestAnimationFrame(countFrame);
    });
}

function calculateTier(metrics: PerformanceMetrics): PerformanceTier {
    const { gpuTier, deviceMemory, cpuCores, fps } = metrics;

    // Strong indicators of low-end
    if (gpuTier === 'low') return 'lite';
    if (deviceMemory !== null && deviceMemory <= 2) return 'lite';
    if (cpuCores !== null && cpuCores <= 2) return 'lite';
    if (fps !== null && fps < 30) return 'lite';

    // Indicators of mid-tier
    if (gpuTier === 'mid') return 'balanced';
    if (deviceMemory !== null && deviceMemory <= 4) return 'balanced';
    if (cpuCores !== null && cpuCores <= 4) return 'balanced';
    if (fps !== null && fps < 50) return 'balanced';

    // High-end
    return 'full';
}

export function usePerformance(): UsePerformanceResult {
    const [tier, setTier] = useState<PerformanceTier>('balanced');
    const [isDetecting, setIsDetecting] = useState(true);
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        gpuTier: 'unknown',
        deviceMemory: null,
        cpuCores: null,
        fps: null,
        isLowEndDevice: false,
    });

    const runBenchmark = useCallback(async () => {
        setIsDetecting(true);

        try {
            // Gather hardware info
            const gpuTier = detectGpuTier();
            const deviceMemory = getDeviceMemory();
            const cpuCores = getCpuCores();

            // Skip FPS measurement if we already have strong low-end indicators
            let fps: number | null = null;
            if (gpuTier !== 'low' && (deviceMemory === null || deviceMemory > 2)) {
                fps = await measureFps();
            }

            const newMetrics: PerformanceMetrics = {
                gpuTier,
                deviceMemory,
                cpuCores,
                fps,
                isLowEndDevice: gpuTier === 'low' || (deviceMemory !== null && deviceMemory <= 2),
            };

            const calculatedTier = calculateTier(newMetrics);

            setMetrics(newMetrics);
            setTier(calculatedTier);

            // Expose for debugging
            if (typeof window !== 'undefined') {
                (window as any).__CRYONEX_PERF_TIER__ = calculatedTier;
                (window as any).__CRYONEX_PERF_METRICS__ = newMetrics;
            }
        } catch (error) {
            console.warn('Performance detection failed:', error);
            setTier('balanced'); // Safe default
        } finally {
            setIsDetecting(false);
        }
    }, []);

    useEffect(() => {
        runBenchmark();
    }, [runBenchmark]);

    return {
        tier,
        metrics,
        isDetecting,
        rerunBenchmark: runBenchmark,
    };
}

// Quick check for extremely low-end devices (can be called synchronously)
export function isLikelyLowEndDevice(): boolean {
    const gpuTier = detectGpuTier();
    const memory = getDeviceMemory();
    const cores = getCpuCores();

    return (
        gpuTier === 'low' ||
        (memory !== null && memory <= 2) ||
        (cores !== null && cores <= 2)
    );
}
