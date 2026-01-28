import { useState, useEffect, useCallback } from 'react';

export type PerformanceTier = 'full' | 'lite';

export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'unknown';

interface PerformanceMetrics {
    gpuTier: 'high' | 'mid' | 'low' | 'unknown';
    deviceMemory: number | null;
    cpuCores: number | null;
    fps: number | null;
    isLowEndDevice: boolean;
    deviceType: DeviceType;
    isTouchDevice: boolean;
    connectionType: string | null;
    screenDiagonal: number | null;
    gpuInfo: string | null;
    userAgentInfo: UserAgentInfo | null;
}

interface UserAgentInfo {
    browser: string;
    os: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

interface UsePerformanceResult {
    tier: PerformanceTier;
    metrics: PerformanceMetrics;
    isDetecting: boolean;
    rerunBenchmark: () => void;
}

// ==================== USER AGENT DETECTION ====================

function parseUserAgent(): UserAgentInfo {
    const ua = navigator.userAgent;

    // Browser detection
    let browser = 'unknown';
    if (/edg/i.test(ua)) browser = 'edge';
    else if (/chrome/i.test(ua)) browser = 'chrome';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'safari';
    else if (/firefox/i.test(ua)) browser = 'firefox';
    else if (/opera|opr/i.test(ua)) browser = 'opera';

    // OS detection
    let os = 'unknown';
    if (/windows/i.test(ua)) os = 'windows';
    else if (/macintosh|mac os/i.test(ua)) os = 'macos';
    else if (/linux/i.test(ua) && !/android/i.test(ua)) os = 'linux';
    else if (/android/i.test(ua)) os = 'android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'ios';
    else if (/cros/i.test(ua)) os = 'chromeos';

    // Tablet detection (more comprehensive)
    const tabletPatterns = [
        /ipad/i,
        /tablet/i,
        /playbook/i,
        /silk/i,
        /android(?!.*mobile)/i, // Android without "mobile" = tablet
        /kindle/i,
        /surface/i,
        /tab\s/i, // Samsung Tab, etc
        /gt-p/i, // Samsung Galaxy Tab
        /sm-t/i, // Samsung Tab model numbers
        /lenovo.*tab/i,
        /huawei.*mediapad/i,
        /nexus\s?(7|9|10)/i,
        /galaxy.*tab/i,
    ];

    // Mobile detection
    const mobilePatterns = [
        /iphone/i,
        /ipod/i,
        /android.*mobile/i,
        /windows phone/i,
        /blackberry/i,
        /bb10/i,
        /mobile/i,
        /opera mini/i,
        /opera mobi/i,
        /iemobile/i,
    ];

    let isTablet = tabletPatterns.some(pattern => pattern.test(ua));
    let isMobile = mobilePatterns.some(pattern => pattern.test(ua));

    // iPad with iPadOS 13+ identifies as Mac, check for touch + Mac
    if (os === 'macos' && 'ontouchend' in document) {
        isTablet = true;
    }

    // If both tablet and mobile match, prefer tablet (e.g., iPad might match "Safari" mobile)
    if (isTablet && isMobile) {
        isMobile = false;
    }

    const isDesktop = !isTablet && !isMobile;

    return { browser, os, isMobile, isTablet, isDesktop };
}

// ==================== DEVICE TYPE DETECTION ====================

function detectDeviceType(): DeviceType {
    const uaInfo = parseUserAgent();

    // User Agent says tablet
    if (uaInfo.isTablet) return 'tablet';

    // User Agent says mobile
    if (uaInfo.isMobile) return 'mobile';

    // Additional heuristics for tablets that might not be detected by UA
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const minDimension = Math.min(screenWidth, screenHeight);
    const maxDimension = Math.max(screenWidth, screenHeight);

    // Check for touch support
    const hasTouch = 'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;

    // Tablet heuristics: touch device with screen between phone and desktop sizes
    if (hasTouch) {
        // Typical tablet: min dimension 600-1100px, max dimension 800-1400px
        // Phones: min dimension < 500px usually
        if (minDimension >= 600 && minDimension <= 1200 && maxDimension >= 800 && maxDimension <= 1500) {
            // Also check pixel ratio - tablets typically have lower pixel ratios than phones
            const pixelRatio = window.devicePixelRatio || 1;
            if (pixelRatio <= 2.5) {
                return 'tablet';
            }
        }

        // Small screen with touch is likely mobile
        if (minDimension < 500) {
            return 'mobile';
        }

        // Touch device with large screen but not detected as tablet  
        // Could be a 2-in-1 laptop or convertible - treat as desktop for performance
        if (minDimension > 1200) {
            return 'desktop';
        }
    }

    // User Agent says desktop
    if (uaInfo.isDesktop) return 'desktop';

    return 'unknown';
}

// Calculate screen diagonal in inches (approximate)
function getScreenDiagonal(): number | null {
    try {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const pixelRatio = window.devicePixelRatio || 1;

        // Rough approximation assuming ~96 DPI base (adjusted by pixel ratio)
        const dpi = 96 * pixelRatio;
        const widthInches = screenWidth / dpi;
        const heightInches = screenHeight / dpi;
        const diagonal = Math.sqrt(widthInches ** 2 + heightInches ** 2);

        return Math.round(diagonal * 10) / 10;
    } catch {
        return null;
    }
}

// ==================== GPU DETECTION ====================

// Known low-end GPU patterns - more comprehensive
const LOW_END_GPU_PATTERNS = [
    // Intel integrated (older)
    /intel.*hd\s*graphics\s*[1-5]\d{2}/i, // HD Graphics 100-599
    /intel.*hd\s*graphics\s*[2-3]000/i, // HD 2000-3000 series
    /intel.*graphics\s*(?!iris|arc)/i, // Generic Intel Graphics (not Iris or Arc)

    // Mobile GPUs (low-end)
    /mali-4/i,
    /mali-t[1-6]/i, // Mali-T400 through T600 series
    /adreno\s*[1-4]\d{2}/i, // Adreno 100-400 series
    /powervr/i,
    /sgx/i,
    /vivante/i,
    /videocore/i,

    // Software renderers
    /llvmpipe/i,
    /swiftshader/i,
    /software/i,
    /microsoft basic render/i,
    /mesa/i,

    // Very old desktop GPUs
    /geforce\s*(8|9)\d{2}/i, // GeForce 8xxx/9xxx
    /geforce\s*gt\s*[1-4]\d{2}/i, // GT 100-400 series
    /radeon\s*hd\s*[2-5]\d{3}/i, // Radeon HD 2000-5000 series
];

// Mid-tier GPU patterns
const MID_TIER_GPU_PATTERNS = [
    // Intel integrated (newer)
    /intel.*uhd/i, // UHD Graphics
    /intel.*iris\s*(?!xe|plus)/i, // Iris (not Xe or Plus)

    // Mobile GPUs (mid-tier)
    /adreno\s*[5-6]\d{2}/i, // Adreno 500-600 series
    /mali-g[5-7]\d/i, // Mali-G50 through G79

    // Entry-level dedicated GPUs
    /nvidia.*mx\s*[1-3]\d{2}/i, // MX 100-300 series
    /geforce\s*gt\s*[5-7]\d{2}/i, // GT 500-700 series
    /geforce\s*gtx?\s*[4-6]\d{2}/i, // GTX 400-600 series
    /radeon\s*(rx\s*)?[45]\d{2}/i, // RX 400-500 series or Radeon 4xx-5xx
    /radeon.*vega\s*[3-8]/i, // Vega 3-8 (integrated)
];

// High-end GPU patterns - should NOT be matched by low/mid patterns
const HIGH_END_GPU_PATTERNS = [
    // Apple Silicon - ALL are high performance
    /apple\s*(m1|m2|m3|m4)/i,
    /apple.*gpu/i,

    // Intel high-end integrated
    /intel.*iris\s*(xe|plus)/i, // Iris Xe and Iris Plus
    /intel.*arc/i, // Intel Arc discrete GPUs

    // NVIDIA high-end
    /geforce\s*rtx/i, // All RTX cards
    /geforce\s*gtx\s*(9\d{2}|10\d{2}|16\d{2})/i, // GTX 900/1000/1600 series
    /nvidia.*quadro/i,
    /nvidia.*tesla/i,
    /nvidia.*a\d{2,3}/i, // A100, A40, etc

    // AMD high-end
    /radeon\s*rx\s*[5-7]\d{3}/i, // RX 5000-7000 series
    /radeon\s*pro/i,
    /radeon\s*vega\s*(56|64)/i, // Vega 56/64 dedicated

    // Mobile high-end
    /adreno\s*[7-9]\d{2}/i, // Adreno 700+ series
    /mali-g[89]\d/i, // Mali-G800+ series
];

function detectGpuTier(): { tier: 'high' | 'mid' | 'low' | 'unknown'; gpuInfo: string | null } {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (!gl) return { tier: 'unknown', gpuInfo: null };

        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (!debugInfo) return { tier: 'unknown', gpuInfo: null };

        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        const gpuInfo = `${vendor} ${renderer}`;
        const gpuInfoLower = gpuInfo.toLowerCase();

        // Store for debugging
        if (typeof window !== 'undefined') {
            (window as any).__CRYONEX_GPU_INFO__ = gpuInfo;
        }

        // Check HIGH-END patterns FIRST (important!)
        for (const pattern of HIGH_END_GPU_PATTERNS) {
            if (pattern.test(gpuInfoLower)) {
                console.log('[GPU Detection] High-end GPU detected:', gpuInfo);
                return { tier: 'high', gpuInfo };
            }
        }

        // Check low-end patterns
        for (const pattern of LOW_END_GPU_PATTERNS) {
            if (pattern.test(gpuInfoLower)) {
                console.log('[GPU Detection] Low-end GPU detected:', gpuInfo);
                return { tier: 'low', gpuInfo };
            }
        }

        // Check mid-tier patterns
        for (const pattern of MID_TIER_GPU_PATTERNS) {
            if (pattern.test(gpuInfoLower)) {
                console.log('[GPU Detection] Mid-tier GPU detected:', gpuInfo);
                return { tier: 'mid', gpuInfo };
            }
        }

        // Fallback: check for known high-performance vendors/keywords
        if (/nvidia|geforce|rtx|gtx|radeon|rx\s?\d{4}/i.test(gpuInfoLower)) {
            console.log('[GPU Detection] Dedicated GPU detected (fallback high):', gpuInfo);
            return { tier: 'high', gpuInfo };
        }

        console.log('[GPU Detection] Unknown GPU, defaulting to mid:', gpuInfo);
        return { tier: 'mid', gpuInfo }; // Default assumption for unknown
    } catch (e) {
        console.warn('[GPU Detection] Error:', e);
        return { tier: 'unknown', gpuInfo: null };
    }
}

// ==================== HARDWARE DETECTION ====================

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

function getConnectionType(): string | null {
    if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        return conn?.effectiveType || conn?.type || null;
    }
    return null;
}

function isTouchDevice(): boolean {
    return 'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0;
}

// ==================== FPS MEASUREMENT ====================

// Improved FPS measurement with multiple samples
async function measureFps(): Promise<number> {
    // Take 3 samples and use the median for more reliable results
    const samples: number[] = [];

    for (let i = 0; i < 3; i++) {
        const sample = await measureFpsSample(400);
        samples.push(sample);
        // Small delay between samples
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Sort and take median
    samples.sort((a, b) => a - b);
    const median = samples[Math.floor(samples.length / 2)];

    console.log('[FPS Measurement] Samples:', samples, 'Median:', median);
    return median;
}

async function measureFpsSample(duration: number): Promise<number> {
    return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();

        function countFrame() {
            frames++;
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;

            if (elapsed >= duration) {
                const fps = Math.round((frames / elapsed) * 1000);
                resolve(fps);
            } else {
                requestAnimationFrame(countFrame);
            }
        }

        requestAnimationFrame(countFrame);
    });
}

// ==================== TIER CALCULATION ====================

// Weighted scoring system for more reliable tier detection
function calculateTier(metrics: PerformanceMetrics): PerformanceTier {
    const { gpuTier, deviceMemory, cpuCores, fps, deviceType, connectionType } = metrics;

    // Log all metrics for debugging
    console.log('[Tier Calculation] Input metrics:', {
        gpuTier,
        deviceMemory,
        cpuCores,
        fps,
        deviceType,
        connectionType,
    });

    // RULE 1: Tablets get full mode (they have good performance)
    if (deviceType === 'tablet') {
        console.log('[Tier Calculation] Device is tablet -> full');
        return 'full';
    }

    // RULE 2: Mobile devices should be lite by default unless high-end
    if (deviceType === 'mobile') {
        // Check for high-end mobile (flagship phones)
        if (gpuTier === 'high' && cpuCores !== null && cpuCores >= 8) {
            console.log('[Tier Calculation] High-end mobile device -> full');
            return 'full';
        }
        console.log('[Tier Calculation] Mobile device -> lite');
        return 'lite';
    }

    // RULE 3: For desktops, use weighted scoring
    // Start with base score of 50 (neutral)
    let score = 50;

    // GPU tier has highest weight (30 points range)
    if (gpuTier === 'high') {
        score += 30;
    } else if (gpuTier === 'mid') {
        score += 10;
    } else if (gpuTier === 'low') {
        score -= 30;
    }
    // 'unknown' doesn't change score

    // Memory (15 points range)
    if (deviceMemory !== null) {
        if (deviceMemory >= 8) {
            score += 15;
        } else if (deviceMemory >= 4) {
            score += 5;
        } else if (deviceMemory <= 2) {
            score -= 15;
        }
    }

    // CPU cores (15 points range)
    if (cpuCores !== null) {
        if (cpuCores >= 8) {
            score += 15;
        } else if (cpuCores >= 4) {
            score += 5;
        } else if (cpuCores <= 2) {
            score -= 15;
        }
    }

    // FPS (20 points range)
    if (fps !== null) {
        if (fps >= 55) {
            score += 20;
        } else if (fps >= 45) {
            score += 10;
        } else if (fps >= 30) {
            score += 0; // Neutral
        } else if (fps < 30) {
            score -= 20;
        }
    }

    // Connection type penalty (for slow connections)
    if (connectionType === 'slow-2g' || connectionType === '2g') {
        score -= 10;
    } else if (connectionType === '3g') {
        score -= 5;
    }

    console.log('[Tier Calculation] Final score:', score);

    // Convert score to tier
    // Full: 50+, Lite: <50 (no balanced tier)
    if (score >= 50) {
        console.log('[Tier Calculation] Score >= 50 -> full');
        return 'full';
    } else {
        console.log('[Tier Calculation] Score < 50 -> lite');
        return 'lite';
    }
}

export function usePerformance(): UsePerformanceResult {
    const [tier, setTier] = useState<PerformanceTier>('full');
    const [isDetecting, setIsDetecting] = useState(true);
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
        gpuTier: 'unknown',
        deviceMemory: null,
        cpuCores: null,
        fps: null,
        isLowEndDevice: false,
        deviceType: 'unknown',
        isTouchDevice: false,
        connectionType: null,
        screenDiagonal: null,
        gpuInfo: null,
        userAgentInfo: null,
    });

    const runBenchmark = useCallback(async () => {
        setIsDetecting(true);
        console.log('[Performance Detection] Starting benchmark...');

        try {
            // Gather all device info
            const userAgentInfo = parseUserAgent();
            const deviceType = detectDeviceType();
            const gpuResult = detectGpuTier();
            const deviceMemory = getDeviceMemory();
            const cpuCores = getCpuCores();
            const connectionType = getConnectionType();
            const screenDiagonal = getScreenDiagonal();
            const touchDevice = isTouchDevice();

            console.log('[Performance Detection] User Agent Info:', userAgentInfo);
            console.log('[Performance Detection] Device Type:', deviceType);
            console.log('[Performance Detection] GPU Result:', gpuResult);
            console.log('[Performance Detection] Memory:', deviceMemory, 'GB');
            console.log('[Performance Detection] CPU Cores:', cpuCores);
            console.log('[Performance Detection] Connection:', connectionType);
            console.log('[Performance Detection] Screen Diagonal:', screenDiagonal, 'inches');
            console.log('[Performance Detection] Touch Device:', touchDevice);

            // Measure FPS only for desktop/unknown devices with capable hardware
            let fps: number | null = null;
            if (
                deviceType === 'desktop' &&
                gpuResult.tier !== 'low' &&
                (deviceMemory === null || deviceMemory > 2)
            ) {
                console.log('[Performance Detection] Measuring FPS...');
                fps = await measureFps();
            } else {
                console.log('[Performance Detection] Skipping FPS measurement (mobile/tablet or low-end)');
            }

            const newMetrics: PerformanceMetrics = {
                gpuTier: gpuResult.tier,
                deviceMemory,
                cpuCores,
                fps,
                isLowEndDevice: gpuResult.tier === 'low' || (deviceMemory !== null && deviceMemory <= 2),
                deviceType,
                isTouchDevice: touchDevice,
                connectionType,
                screenDiagonal,
                gpuInfo: gpuResult.gpuInfo,
                userAgentInfo,
            };

            const calculatedTier = calculateTier(newMetrics);

            console.log('[Performance Detection] Final Tier:', calculatedTier);
            console.log('[Performance Detection] All Metrics:', newMetrics);

            setMetrics(newMetrics);
            setTier(calculatedTier);

            // Expose for debugging
            if (typeof window !== 'undefined') {
                (window as any).__CRYONEX_PERF_TIER__ = calculatedTier;
                (window as any).__CRYONEX_PERF_METRICS__ = newMetrics;
                (window as any).__CRYONEX_USER_AGENT__ = userAgentInfo;
            }
        } catch (error) {
            console.warn('[Performance Detection] Benchmark failed:', error);
            setTier('full'); // Safe default
        } finally {
            setIsDetecting(false);
            console.log('[Performance Detection] Benchmark complete');
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
    const gpuResult = detectGpuTier();
    const memory = getDeviceMemory();
    const cores = getCpuCores();
    const deviceType = detectDeviceType();

    // Mobile is considered low-end for performance purposes
    if (deviceType === 'mobile') return true;

    return (
        gpuResult.tier === 'low' ||
        (memory !== null && memory <= 2) ||
        (cores !== null && cores <= 2)
    );
}

// Export device detection for use elsewhere
export { parseUserAgent, detectDeviceType };
