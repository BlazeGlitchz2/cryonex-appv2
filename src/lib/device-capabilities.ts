
// Detects device capabilities to optimize performance
// Specifically targeted at devices like G-Tab S50 (Mali-G57) which struggle with heavy WebGL

export interface DeviceCapabilities {
    isLowEnd: boolean;
    isTablet: boolean;
    gpuRenderer: string;
}

let cachedCapabilities: DeviceCapabilities | null = null;

export const getDeviceCapabilities = (): DeviceCapabilities => {
    if (cachedCapabilities) return cachedCapabilities;

    let isLowEnd = false;
    let gpuRenderer = "Unknown";

    // 1. Hardware Concurrency & Memory Check
    // G-Tab S50 has 8 cores/8GB RAM, so these might pass, but we check anyway.
    const cores = navigator.hardwareConcurrency || 4;
    const memory = (navigator as any).deviceMemory || 4;

    if (cores < 6 || memory < 4) {
        isLowEnd = true;
    }

    // 2. GPU Check (Critical for Shaders)
    try {
        const canvas = document.createElement("canvas");
        const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext;
        if (gl) {
            const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
            if (debugInfo) {
                gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

                // Mobile GPUs that often struggle with high-res full-screen shaders
                // Mali-G57 (G-Tab S50), Adreno 610/612, etc.
                const lowEndGPUs = [
                    "Mali",
                    "Adreno",
                    "PowerVR",
                    "Intel HD Graphics",
                    "Intel UHD Graphics" // Often struggles with heavy 3D
                ];

                if (lowEndGPUs.some(gpu => gpuRenderer.includes(gpu))) {
                    // Check for high-end mobile Exception (e.g. Adreno 7xx or new Immortalis) could be added here
                    // But for now, safety first: default mobile GPUs to Lite Mode for 3D shaders
                    isLowEnd = true;
                }
            }
        }
    } catch (e) {
        console.warn("WebGL detection failed", e);
        isLowEnd = true; // Fallback to lite mode on error
    }

    // 3. Tablet Detection
    // G-Tab S50 is 1200x2000
    const width = window.innerWidth;
    const height = window.innerHeight;
    const minDim = Math.min(width, height);

    // Tablets usually have a smallest dimension >= 600px
    const isTablet = minDim >= 600 && (navigator.maxTouchPoints > 0);

    // Force Lite Mode for G-Tab S50 specific resolution/ratio if needed, 
    // but the Mali check should catch it.

    cachedCapabilities = { isLowEnd, isTablet, gpuRenderer };

    // Apply global class for CSS overrides
    if (isLowEnd) {
        document.documentElement.classList.add("performance-lite");
        console.log("🚀 Lite Mode Enabled: " + gpuRenderer);
    }

    if (isTablet) {
        document.documentElement.classList.add("tablet-mode");
    }

    return cachedCapabilities;
};
