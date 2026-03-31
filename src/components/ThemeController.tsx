import { useEffect } from "react";
import { useDeviceInfo } from "@/hooks/use-mobile";
import { isAndroid, isIOS, isNativePlatform } from "@/lib/mobile";
import { getPlatformFlavor } from "@/lib/platform-flavor";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { SYSTEM_QUERY, useThemeStore } from "@/lib/stores/theme-store";

export function ThemeController() {
  const appearance = useThemeStore((state) => state.appearance);
  const syncWithSystem = useThemeStore((state) => state.syncWithSystem);
  const deviceInfo = useDeviceInfo();
  const qualityTier = usePerformanceStore((state) => state.qualityTier);
  const detectedTier = usePerformanceStore((state) => state.detectedTier);

  useEffect(() => {
    if (typeof window === "undefined") return;

    syncWithSystem();

    const mediaQuery = window.matchMedia(SYSTEM_QUERY);
    const handleChange = () => {
      if (useThemeStore.getState().appearance === "system") {
        syncWithSystem();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [appearance, syncWithSystem]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const body = document.body;
    const platformFlavor = getPlatformFlavor({
      deviceInfo,
      isNative: isNativePlatform(),
    }).family;
    const renderTier =
      qualityTier === "auto" ? detectedTier || "full" : qualityTier;

    const platformFamily = isIOS()
      ? "ios"
      : isAndroid()
        ? "android"
        : "web";
    const deviceClass = deviceInfo.isSmartboard
      ? "smartboard"
      : deviceInfo.isTablet
        ? "tablet"
        : deviceInfo.isPhone
          ? "phone"
          : "desktop";
    const shouldForceLiteChrome =
      renderTier === "lite" ||
      deviceInfo.isSmartboard ||
      (deviceInfo.isAndroid && deviceInfo.isTablet);

    const platformClasses = [
      "platform-web",
      "platform-ios",
      "platform-android",
      "device-phone",
      "device-tablet",
      "device-desktop",
      "device-smartboard",
      "native-shell",
      "browser-shell",
      "performance-lite",
    ];

    [root, body].forEach((node) => {
      node.classList.remove(...platformClasses);
      node.classList.add(`platform-${platformFamily}`, `device-${deviceClass}`);

      if (isNativePlatform()) {
        node.classList.add("native-shell");
      } else {
        node.classList.add("browser-shell");
      }

      if (shouldForceLiteChrome) {
        node.classList.add("performance-lite");
      }
    });

    body.dataset.platformFlavor = platformFlavor;
    body.dataset.renderTier = renderTier;
    body.dataset.touchUi = deviceInfo.isTouch ? "true" : "false";
    body.dataset.smartboard = deviceInfo.isSmartboard ? "true" : "false";
    body.dataset.platformFamily = platformFamily;
    body.dataset.deviceClass = deviceClass;
    body.dataset.platformVariant = `${platformFamily}-${deviceClass}`;
    body.dataset.platform = platformFamily;
    body.dataset.platformShell = deviceClass;
    root.dataset.platformFlavor = platformFlavor;
    root.dataset.renderTier = renderTier;
    root.dataset.touchUi = deviceInfo.isTouch ? "true" : "false";
    root.dataset.smartboard = deviceInfo.isSmartboard ? "true" : "false";
    root.dataset.platformFamily = platformFamily;
    root.dataset.deviceClass = deviceClass;
    root.dataset.platformVariant = `${platformFamily}-${deviceClass}`;
    root.dataset.platform = platformFamily;
    root.dataset.platformShell = deviceClass;
  }, [detectedTier, deviceInfo, qualityTier]);

  return null;
}
