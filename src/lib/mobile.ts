import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Keyboard, KeyboardResize } from "@capacitor/keyboard";
import { SplashScreen } from "@capacitor/splash-screen";
import { App } from "@capacitor/app";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Network } from "@capacitor/network";
import { applyMobileKeyboardState } from "@/lib/mobile-shell";
import { shouldOverlayStatusBar } from "@/lib/native-status-bar";
import { buildNativePath, normalizeNativePath } from "@/lib/mobile-shell";

/**
 * Check if running on a native mobile platform
 */
export const isNativePlatform = () => Capacitor.isNativePlatform();
export const isAndroid = () => Capacitor.getPlatform() === "android";
export const isIOS = () => Capacitor.getPlatform() === "ios";
export const isWeb = () => Capacitor.getPlatform() === "web";
export const isIPadOS = () => {
  if (!isIOS() || typeof navigator === "undefined") return false;
  const userAgent = navigator.userAgent || "";
  const platform = navigator.platform || "";
  return (
    /ipad/i.test(userAgent) ||
    (platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
};

const IOS_SAFE_AREA_ENV_VARS = [
  { cssVar: "--sat", env: "safe-area-inset-top" },
  { cssVar: "--sar", env: "safe-area-inset-right" },
  { cssVar: "--sab", env: "safe-area-inset-bottom" },
  { cssVar: "--sal", env: "safe-area-inset-left" },
];

let lastAppliedStatusBarOverlay: boolean | null = null;

function syncIosSafeAreaCssVars() {
  const rootStyle = document.documentElement.style;
  IOS_SAFE_AREA_ENV_VARS.forEach(({ cssVar, env }) => {
    rootStyle.setProperty(cssVar, `env(${env})`);
  });
}

function navigateToNativePath(pathname: string) {
  if (typeof window === "undefined") return;
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const currentRoute = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (currentRoute === normalizedPath) {
    console.log(
      "[Mobile] Deep link already matches current route:",
      normalizedPath,
    );
    return;
  }

  if (window.history?.pushState) {
    window.history.pushState({}, "", normalizedPath);
    window.dispatchEvent(new PopStateEvent("popstate"));
  } else {
    window.location.href = normalizedPath;
  }

  console.log("[Mobile] Deep link routed via history:", normalizedPath);
}

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
  document.body.dataset.platform = Capacitor.getPlatform();
  document.documentElement.dataset.platform = Capacitor.getPlatform();
  const isiPad = isIPadOS();

  // Platform-specific web environment setup
  if (isIOS()) {
    setupIOSWebEnvironment();
    document.body.classList.add("ios", isiPad ? "ios-ipad" : "ios-iphone");
    document.documentElement.classList.add(
      "ios-native",
      isiPad ? "ios-ipad-native" : "ios-iphone-native",
    );
    document.body.dataset.deviceKind = isiPad ? "ipad" : "iphone";
    document.documentElement.dataset.deviceKind = isiPad ? "ipad" : "iphone";
  } else if (isAndroid()) {
    setupAndroidWebEnvironment();
    document.body.classList.add("android");
  }

  try {
    // Configure status bar
    await StatusBar.setStyle({ style: Style.Dark });

    if (isAndroid()) {
      await StatusBar.setBackgroundColor({ color: "#030010" });
    }
    await applyNativeStatusBarForPath(window.location.pathname);
  } catch (error) {
    console.warn("[Mobile] StatusBar configuration failed:", error);
  }

  try {
    // Configure keyboard behavior
    if (isIOS()) {
      // Native mode on iOS — the WebView resizes like a native app.
      await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
      await Keyboard.setScroll({ isDisabled: false });
    }
  } catch (error) {
    console.warn("[Mobile] Keyboard configuration failed:", error);
  }

  applyMobileKeyboardState({ visible: false });
  Keyboard.addListener("keyboardWillShow", (info) => {
    applyMobileKeyboardState({
      visible: true,
      height: info.keyboardHeight,
    });
  });
  Keyboard.addListener("keyboardDidShow", (info) => {
    applyMobileKeyboardState({
      visible: true,
      height: info.keyboardHeight,
    });
  });
  Keyboard.addListener("keyboardWillHide", () => {
    applyMobileKeyboardState({ visible: false });
  });
  Keyboard.addListener("keyboardDidHide", () => {
    applyMobileKeyboardState({ visible: false });
  });

  try {
    // Hide splash screen after app is ready
    await SplashScreen.hide({ fadeOutDuration: isIOS() ? 400 : 300 });
  } catch (error) {
    console.warn("[Mobile] SplashScreen hide failed:", error);
  }

  try {
    const { CapacitorUpdater } = await import("@capgo/capacitor-updater");
    await CapacitorUpdater.notifyAppReady();
  } catch (error) {
    console.warn("[Mobile] CapacitorUpdater notifyAppReady failed:", error);
  }

  // Handle back button on Android
  if (isAndroid()) {
    App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
        return;
      }

      const path = window.location.pathname;
      const shouldExitFromCurrentRoute =
        path === "/" ||
        path === "/login" ||
        path === "/auth" ||
        path === "/onboarding";

      if (shouldExitFromCurrentRoute) {
        try {
          App.minimizeApp();
        } catch (error) {
          console.warn("[Mobile] Failed to minimize app:", error);
        }
        return;
      }

      // Prefer returning to the dashboard before minimizing the app.
      if (path !== "/study/dashboard") {
        navigateToNativePath("/study/dashboard");
        return;
      }

      try {
        App.minimizeApp();
      } catch (error) {
        console.warn("[Mobile] Failed to minimize app:", error);
      }
    });
  }

  // Handle app state changes (useful for pausing/resuming operations)
  App.addListener("appStateChange", ({ isActive }) => {
    const state = isActive ? "active" : "inactive";
    document.body.dataset.mobileAppState = state;
    document.documentElement.dataset.mobileAppState = state;
    console.log(`[Mobile] App ${state}`);
  });

  // Handle deep links (e.g. for authentication redirects)
  App.addListener("appUrlOpen", (data) => {
    console.log("[Mobile] App opened with URL:", data.url);

    try {
      const url = new URL(data.url);
      // Handle cryonex:// scheme
      if (url.protocol.includes("cryonex")) {
        const path = buildNativePath(url);
        console.log("[Mobile] Redirecting to internal path:", path);
        navigateToNativePath(path);
        return;
      }

      // Fallback for other URLs
      if (url.pathname.startsWith("/")) {
        const path = normalizeNativePath(url.pathname, url.search, url.hash);
        navigateToNativePath(path);
      }
    } catch (e) {
      console.error("[Mobile] Failed to parse URL:", e);
    }
  });

  // Log initial network status for debugging
  try {
    const netStatus = await Network.getStatus();
    console.log(
      `[Mobile] Network: ${netStatus.connected ? "connected" : "disconnected"} (${netStatus.connectionType})`,
    );
  } catch (error) {
    console.warn("[Mobile] Network status check failed:", error);
  }

  console.log("[Mobile] Initialization complete");
}

export async function applyNativeStatusBarForPath(pathname: string) {
  if (!isNativePlatform()) {
    return;
  }

  const overlay = shouldOverlayStatusBar(pathname);

  if (lastAppliedStatusBarOverlay === overlay) {
    return;
  }

  await StatusBar.setOverlaysWebView({ overlay });
  lastAppliedStatusBarOverlay = overlay;
}

/**
 * Android-specific web environment setup
 */
function setupAndroidWebEnvironment() {
  const syncAndroidNavHeight = () => {
    const navBarHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--sab") ||
        "0",
      10,
    );
    document.documentElement.style.setProperty(
      "--android-nav-height",
      `${Math.max(navBarHeight, 24)}px`,
    );
  };

  // Disable long-press context menu (feels non-native on Android)
  document.addEventListener("contextmenu", (e) => {
    const target = e.target as HTMLElement;
    // Allow context menu on text inputs for paste functionality
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return;
    }
    e.preventDefault();
  });

  // Inject Android navigation bar height as CSS variable
  // On gesture nav this is ~48px, on 3-button nav it's ~48px
  syncAndroidNavHeight();
  window.addEventListener("resize", syncAndroidNavHeight);
  window.addEventListener("orientationchange", syncAndroidNavHeight);

  console.log("[Mobile] Android web environment configured");
}

/**
 * iOS-specific web environment setup
 * Called before Capacitor plugins are initialized
 */
function setupIOSWebEnvironment() {
  // Polyfill requestIdleCallback for iOS Safari (not natively supported)
  if (!("requestIdleCallback" in window)) {
    const windowWithIdleCallback = window as Window &
      typeof globalThis & {
        requestIdleCallback: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
        cancelIdleCallback: (handle: number) => void;
      };

    windowWithIdleCallback.requestIdleCallback = (
      callback: IdleRequestCallback,
      options?: IdleRequestOptions,
    ) => {
      const start = Date.now();
      return window.setTimeout(
        () => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
          });
        },
        options?.timeout ? Math.min(options.timeout, 1) : 1,
      );
    };
    windowWithIdleCallback.cancelIdleCallback = (handle: number) => {
      window.clearTimeout(handle);
    };
  }

  // Fix iOS viewport height and expose safe-area env vars to CSS
  const setViewportHeight = () => {
    const height = window.visualViewport?.height ?? window.innerHeight;
    const vh = height * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  const syncViewportMetrics = () => {
    setViewportHeight();
    syncIosSafeAreaCssVars();
  };

  syncViewportMetrics();
  window.visualViewport?.addEventListener("resize", syncViewportMetrics);
  window.visualViewport?.addEventListener("scroll", syncViewportMetrics);
  window.addEventListener("resize", syncViewportMetrics);
  window.addEventListener("orientationchange", syncViewportMetrics);
  window.addEventListener("focus", syncViewportMetrics);

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

  document.documentElement.style.setProperty("-webkit-touch-callout", "none");

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
