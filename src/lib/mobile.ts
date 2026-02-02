import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Check if running on a native mobile platform
 */
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === 'android';
export const isIOS = () => Capacitor.getPlatform() === 'ios';
export const isWeb = () => Capacitor.getPlatform() === 'web';

/**
 * Initialize native mobile features
 * Call this in your app's entry point (main.tsx)
 */
export async function initializeMobile() {
    if (!isNativePlatform()) {
        console.log('[Mobile] Running in web mode');
        return;
    }

    console.log(`[Mobile] Initializing for ${Capacitor.getPlatform()}`);

    try {
        // Configure status bar
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0a0a0a' });

        if (isAndroid()) {
            // Make status bar overlay the WebView on Android
            await StatusBar.setOverlaysWebView({ overlay: false });
        }
    } catch (error) {
        console.warn('[Mobile] StatusBar configuration failed:', error);
    }

    try {
        // Configure keyboard behavior
        await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
        await Keyboard.setScroll({ isDisabled: false });
    } catch (error) {
        console.warn('[Mobile] Keyboard configuration failed:', error);
    }

    try {
        // Hide splash screen after app is ready
        await SplashScreen.hide({ fadeOutDuration: 300 });
    } catch (error) {
        console.warn('[Mobile] SplashScreen hide failed:', error);
    }

    // Handle back button on Android
    if (isAndroid()) {
        App.addListener('backButton', ({ canGoBack }) => {
            if (canGoBack) {
                window.history.back();
            } else {
                // Optionally exit the app or show a confirmation
                App.minimizeApp();
            }
        });
    }

    // Handle app state changes (useful for pausing/resuming operations)
    App.addListener('appStateChange', ({ isActive }) => {
        console.log(`[Mobile] App ${isActive ? 'active' : 'inactive'}`);
    });

    // Handle deep links (e.g. for authentication redirects)
    App.addListener('appUrlOpen', (data) => {
        console.log('[Mobile] App opened with URL:', data.url);
        // If it's an http/https URL, we might want to navigate to the path within the app
        // However, for Auth, we often rely on the Auth provider to pick it up from window.location
        // or we might need to manually handle it if the provider doesn't automatically.

        try {
            const url = new URL(data.url);
            // If the URL is meant for the app, we can try to route it
            if (url.pathname.startsWith('/')) {
                // Use a custom event or window location change to let the router handle it
                // Note: Changing window.location.href might cause a reload
                const path = url.pathname + url.search + url.hash;
                window.location.href = path; // This forces a reload which usually picks up the auth state
            }
        } catch (e) {
            console.error('[Mobile] Failed to parse URL:', e);
        }
    });

    console.log('[Mobile] Initialization complete');
}

/**
 * Trigger haptic feedback
 */
export async function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (!isNativePlatform()) return;

    const impactMap = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
    };

    try {
        await Haptics.impact({ style: impactMap[style] });
    } catch (error) {
        console.warn('[Mobile] Haptic feedback failed:', error);
    }
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets() {
    const style = getComputedStyle(document.documentElement);
    return {
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10),
    };
}
