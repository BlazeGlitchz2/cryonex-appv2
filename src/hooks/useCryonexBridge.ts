import { Capacitor, registerPlugin } from "@capacitor/core";

/**
 * CryonexBridge interface - TypeScript definitions for the native Android plugin.
 * Provides haptic feedback, clipboard, native share, and performance features.
 */
interface CryonexBridgePlugin {
    // Haptic feedback
    hapticLight(): Promise<void>;
    hapticMedium(): Promise<void>;
    hapticHeavy(): Promise<void>;
    hapticSuccess(): Promise<void>;
    hapticWarning(): Promise<void>;
    hapticError(): Promise<void>;
    hapticSelection(): Promise<void>;

    // Clipboard
    copyToClipboard(options: { text: string; label?: string }): Promise<{ success: boolean }>;

    // Native share
    shareText(options: { text: string; title?: string }): Promise<{ success: boolean }>;
    shareMessage(options: { message: string; context?: string }): Promise<{ success: boolean }>;

    // Keyboard
    hideKeyboard(): Promise<void>;

    // Device info
    getDeviceInfo(): Promise<{
        manufacturer: string;
        model: string;
        sdkVersion: number;
        isLowRamDevice: boolean;
        supportsHaptics: boolean;
    }>;

    // Performance
    enablePerformanceMode(options: { enable: boolean }): Promise<{ performanceMode: boolean }>;
}

// Register the plugin - will use native implementation on Android, no-op on web
const CryonexBridge = registerPlugin<CryonexBridgePlugin>("CryonexBridge");

// Check if we're on a native platform
const isNative = Capacitor.isNativePlatform();
const isAndroid = Capacitor.getPlatform() === "android";

/**
 * Hook to access the Cryonex native Android bridge.
 * Provides native-like features with graceful fallbacks for web.
 */
export function useCryonexBridge() {
    // =====================================
    // HAPTIC FEEDBACK
    // =====================================

    const hapticLight = async () => {
        if (isAndroid) {
            try {
                await CryonexBridge.hapticLight();
            } catch (e) {
                console.warn("Haptic not available:", e);
            }
        }
    };

    const hapticMedium = async () => {
        if (isAndroid) {
            try {
                await CryonexBridge.hapticMedium();
            } catch (e) {
                console.warn("Haptic not available:", e);
            }
        }
    };

    const hapticHeavy = async () => {
        if (isAndroid) {
            try {
                await CryonexBridge.hapticHeavy();
            } catch (e) {
                console.warn("Haptic not available:", e);
            }
        }
    };

    const hapticSuccess = async () => {
        if (isAndroid) {
            try {
                await CryonexBridge.hapticSuccess();
            } catch (e) {
                console.warn("Haptic not available:", e);
            }
        }
    };

    const hapticWarning = async () => {
        if (isAndroid) {
            try {
                await CryonexBridge.hapticWarning();
            } catch (e) {
                console.warn("Haptic not available:", e);
            }
        }
    };

    const hapticError = async () => {
        if (isAndroid) {
            try {
                await CryonexBridge.hapticError();
            } catch (e) {
                console.warn("Haptic not available:", e);
            }
        }
    };

    const hapticSelection = async () => {
        if (isAndroid) {
            try {
                await CryonexBridge.hapticSelection();
            } catch (e) {
                // Fallback to web vibration API
                if (navigator.vibrate) {
                    navigator.vibrate(5);
                }
            }
        } else if (navigator.vibrate) {
            navigator.vibrate(5);
        }
    };

    // =====================================
    // CLIPBOARD
    // =====================================

    const copyToClipboard = async (text: string, label?: string) => {
        if (isAndroid) {
            try {
                return await CryonexBridge.copyToClipboard({ text, label });
            } catch (e) {
                // Fallback to web clipboard
                await navigator.clipboard.writeText(text);
                return { success: true };
            }
        } else {
            await navigator.clipboard.writeText(text);
            return { success: true };
        }
    };

    // =====================================
    // NATIVE SHARE
    // =====================================

    const shareText = async (text: string, title?: string) => {
        if (isAndroid) {
            try {
                return await CryonexBridge.shareText({ text, title });
            } catch (e) {
                // Fallback to Web Share API
                if (navigator.share) {
                    await navigator.share({ text, title });
                    return { success: true };
                }
                return { success: false };
            }
        } else if (navigator.share) {
            await navigator.share({ text, title });
            return { success: true };
        }
        return { success: false };
    };

    const shareMessage = async (message: string, context?: string) => {
        if (isAndroid) {
            try {
                return await CryonexBridge.shareMessage({ message, context });
            } catch (e) {
                // Fallback
                const fullText = context ? `${context}\n\n${message}` : message;
                return shareText(fullText, "Share AI Response");
            }
        } else {
            const fullText = context ? `${context}\n\n${message}` : message;
            return shareText(fullText, "Share AI Response");
        }
    };

    // =====================================
    // KEYBOARD
    // =====================================

    const hideKeyboard = async () => {
        if (isAndroid) {
            try {
                await CryonexBridge.hideKeyboard();
            } catch (e) {
                // Fallback - blur active element
                (document.activeElement as HTMLElement)?.blur();
            }
        } else {
            (document.activeElement as HTMLElement)?.blur();
        }
    };

    // =====================================
    // DEVICE INFO
    // =====================================

    const getDeviceInfo = async () => {
        if (isAndroid) {
            try {
                return await CryonexBridge.getDeviceInfo();
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    // =====================================
    // PERFORMANCE
    // =====================================

    const enablePerformanceMode = async (enable: boolean) => {
        if (isAndroid) {
            try {
                return await CryonexBridge.enablePerformanceMode({ enable });
            } catch (e) {
                return { performanceMode: false };
            }
        }
        return { performanceMode: false };
    };

    return {
        // Platform info
        isNative,
        isAndroid,

        // Haptics
        hapticLight,
        hapticMedium,
        hapticHeavy,
        hapticSuccess,
        hapticWarning,
        hapticError,
        hapticSelection,

        // Clipboard
        copyToClipboard,

        // Share
        shareText,
        shareMessage,

        // Keyboard
        hideKeyboard,

        // Device
        getDeviceInfo,

        // Performance
        enablePerformanceMode,
    };
}

// Export individual functions for direct use
export {
    isNative,
    isAndroid,
    CryonexBridge,
};
