import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";
import { App } from "@capacitor/app";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Network } from "@capacitor/network";

/**
 * Check if running on a native mobile platform
 */
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === "android";
export const isIOS = () => Capacitor.getPlatform() === "ios";
export const isWeb = () => Capacitor.getPlatform() === "web";

/**
 * Initialize native mobile features
 * Call this in your app's entry point (main.tsx)
 */
export async function initializeMobile() {
  if (!isNativePlatform()) {
    console.log("[Mobile] Running in web mode");
    return;
  }

  console.log(`[Mobile] Initializing for ${Capacitor.getPlatform()}`);

  // Platform-specific web environment setup
  if (isIOS()) {
    setupIOSWebEnvironment();
    document.body.classList.add('ios');
  } else if (isAndroid()) {
    setupAndroidWebEnvironment();
    document.body.classList.add('android');
  }

  try {
    // Configure status bar
    await StatusBar.setStyle({ style: Style.Dark });

    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: "#030010" });
      // Make status bar overlay the WebView on Android (edge-to-edge)
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
    // On iOS, status bar is always overlaid — handled via safe area CSS
  } catch (error) {
    console.warn("[Mobile] StatusBar configuration failed:", error);
  }

  try {
    // Configure keyboard behavior
    if (isIOS()) {
      // Native mode on iOS — keyboard pushes content up naturally like native apps
      await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
    } else {
      await Keyboard.setResizeMode({ mode: KeyboardResize.Body });
    }
    await Keyboard.setScroll({ isDisabled: false });
  } catch (error) {
    console.warn("[Mobile] Keyboard configuration failed:", error);
  }

  try {
    // Hide splash screen after app is ready
    await SplashScreen.hide({ fadeOutDuration: isIOS() ? 400 : 300 });
  } catch (error) {
    console.warn("[Mobile] SplashScreen hide failed:", error);
  }

  // Handle back button on Android
  if (isAndroid()) {
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // Optionally exit the app or show a confirmation
        App.minimizeApp();
      }
    });
  }

  // Handle app state changes (useful for pausing/resuming operations)
  App.addListener("appStateChange", ({ isActive }) => {
    console.log(`[Mobile] App ${isActive ? "active" : "inactive"}`);
  });

  // Handle deep links (e.g. for authentication redirects)
  App.addListener("appUrlOpen", (data) => {
    console.log("[Mobile] App opened with URL:", data.url);

    try {
      const url = new URL(data.url);
      // Handle cryonex:// scheme
      if (url.protocol.includes("cryonex")) {
        const targetPath = url.pathname;
        const path = targetPath + url.search + url.hash;
        console.log("[Mobile] Redirecting to internal path:", path);
        window.location.href = path;
        return;
      }

      // Fallback for other URLs
      if (url.pathname.startsWith("/")) {
        const path = url.pathname + url.search + url.hash;
        window.location.href = path;
      }
    } catch (e) {
      console.error("[Mobile] Failed to parse URL:", e);
    }
  });

  // Log initial network status for debugging
  try {
    const netStatus = await Network.getStatus();
    console.log(`[Mobile] Network: ${netStatus.connected ? "connected" : "disconnected"} (${netStatus.connectionType})`);
  } catch (error) {
    console.warn("[Mobile] Network status check failed:", error);
  }

  console.log("[Mobile] Initialization complete");
}

/**
 * Android-specific web environment setup
 */
function setupAndroidWebEnvironment() {
  // Disable long-press context menu (feels non-native on Android)
  document.addEventListener('contextmenu', (e) => {
    const target = e.target as HTMLElement;
    // Allow context menu on text inputs for paste functionality
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    e.preventDefault();
  });

  // Inject Android navigation bar height as CSS variable
  // On gesture nav this is ~48px, on 3-button nav it's ~48px
  const navBarHeight = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0',
    10
  );
  document.documentElement.style.setProperty(
    '--android-nav-height',
    `${Math.max(navBarHeight, 24)}px`
  );

  console.log('[Mobile] Android web environment configured');
}

/**
 * iOS-specific web environment setup
 * Called before Capacitor plugins are initialized
 */
function setupIOSWebEnvironment() {
  // Polyfill requestIdleCallback for iOS Safari (not natively supported)
  if (!("requestIdleCallback" in window)) {
    (window as any).requestIdleCallback = (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => {
      const start = Date.now();
      return window.setTimeout(() => {
        callback({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        });
      }, options?.timeout ? Math.min(options.timeout, 1) : 1);
    };
    (window as any).cancelIdleCallback = (id: number) => {
      clearTimeout(id);
    };
  }

  // Fix iOS viewport height CSS variable (100vh issue)
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };
  setViewportHeight();
  window.addEventListener("resize", setViewportHeight);

  // Prevent iOS elastic bounce on the HTML/body level
  document.addEventListener(
    "touchmove",
    (e) => {
      // Only prevent on body — allow scroll containers to scroll freely
      if (e.target === document.body || e.target === document.documentElement) {
        e.preventDefault();
      }
    },
    { passive: false },
  );

  console.log("[Mobile] iOS web environment configured");
}

/**
 * Trigger haptic feedback
 */
export async function hapticFeedback(
  style: "light" | "medium" | "heavy" = "light",
) {
  if (!isNativePlatform()) return;

  const impactMap = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  };

  try {
    await Haptics.impact({ style: impactMap[style] });
  } catch (error) {
    console.warn("[Mobile] Haptic feedback failed:", error);
  }
}

/**
 * iOS-native notification haptic (success, warning, error)
 * Use for form submissions, errors, and confirmations
 */
export async function hapticNotification(
  type: "success" | "warning" | "error" = "success",
) {
  if (!isNativePlatform()) return;

  const typeMap = {
    success: NotificationType.Success,
    warning: NotificationType.Warning,
    error: NotificationType.Error,
  };

  try {
    await Haptics.notification({ type: typeMap[type] });
  } catch (error) {
    console.warn("[Mobile] Haptic notification failed:", error);
  }
}

/**
 * iOS-native selection haptic (for toggles, pickers, etc.)
 */
export async function hapticSelection() {
  if (!isNativePlatform()) return;

  try {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
    await Haptics.selectionEnd();
  } catch (error) {
    console.warn("[Mobile] Haptic selection failed:", error);
  }
}

/**
 * Get safe area insets for notched devices
 */
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement);
  return {
    top: parseInt(style.getPropertyValue("--sat") || "0", 10),
    right: parseInt(style.getPropertyValue("--sar") || "0", 10),
    bottom: parseInt(style.getPropertyValue("--sab") || "0", 10),
    left: parseInt(style.getPropertyValue("--sal") || "0", 10),
  };
}

