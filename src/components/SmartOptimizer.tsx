import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { usePerformance, PerformanceTier } from "@/hooks/use-performance";
import { useDeviceInfo } from "@/hooks/use-mobile";
import { usePlatformExperience } from "@/lib/platform-experience";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { preloadCriticalAssets } from "@/lib/utils/cdn-optimizer";

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
  tier: "full",
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
  const deviceInfo = useDeviceInfo();
  const platformExperience = usePlatformExperience();
  const {
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
        console.log("[SmartOptimizer] Performance detection complete:", {
          detectedTier,
          metrics,
          effectiveTier: getEffectiveTier(),
        });
      }
    }
  }, [isDetecting, detectedTier, metrics, setDetectedTier, getEffectiveTier]);

  // Preload critical assets based on tier
  useEffect(() => {
    if (
      !isDetecting &&
      typeof window !== "undefined" &&
      window.innerWidth >= 1024 &&
      imageQuality === "high"
    ) {
      preloadCriticalAssets(imageQuality);
    }
  }, [isDetecting, imageQuality]);

  const effectiveTier = getEffectiveTier();

  useEffect(() => {
    if (typeof document === "undefined") return;

    const nativePlatform = Capacitor.isNativePlatform()
      ? Capacitor.getPlatform()
      : null;
    const platformClass = nativePlatform
      ? nativePlatform === "ios"
        ? "platform-ios"
        : "platform-android"
      : "platform-web";
    const experiencePlatform = nativePlatform
      ? nativePlatform === "ios"
        ? "ios-native"
        : "android-native"
      : deviceInfo.isSmartboard
        ? "smartboard-web"
        : deviceInfo.isTablet
          ? "tablet-web"
          : deviceInfo.isPhone
            ? "phone-web"
            : "desktop-web";

    const touchProfile = deviceInfo.isSmartboard
      ? "board"
      : deviceInfo.isTablet
        ? "tablet"
        : deviceInfo.isPhone
          ? "phone"
          : "desktop";
    const deviceClass = deviceInfo.isSmartboard
      ? "device-smartboard"
      : deviceInfo.isTablet
        ? "device-tablet"
        : deviceInfo.isPhone
          ? "device-phone"
          : "device-desktop";

    for (const element of [document.documentElement, document.body]) {
      element.dataset.experiencePlatform = experiencePlatform;
      element.dataset.platform = platformExperience.platform;
      element.dataset.platformShell = platformExperience.shell;
      element.dataset.deviceType = deviceInfo.deviceType;
      element.dataset.touchProfile = touchProfile;
      element.dataset.performanceTier = effectiveTier;
      element.classList.remove(
        "platform-web",
        "platform-ios",
        "platform-android",
        "device-desktop",
        "device-phone",
        "device-tablet",
        "device-smartboard",
      );
      element.classList.add(platformClass, deviceClass);
      element.classList.toggle(
        "touch-large-format",
        deviceInfo.isTablet || deviceInfo.isSmartboard,
      );
      element.classList.toggle("smartboard-mode", deviceInfo.isSmartboard);
      element.classList.toggle("platform-lite", effectiveTier === "lite");
      element.classList.toggle(
        "platform-low-power",
        platformExperience.isLowPowerLargeScreen,
      );
    }
  }, [
    deviceInfo.deviceType,
    deviceInfo.isPhone,
    deviceInfo.isSmartboard,
    deviceInfo.isTablet,
    effectiveTier,
    platformExperience.isLowPowerLargeScreen,
    platformExperience.platform,
    platformExperience.shell,
  ]);

  const shouldShowHeavyEffects = !(
    effectiveTier === "lite" ||
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
  fallback?: React.ComponentType<P>,
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
  minTier = "full",
  requireShaders = false,
  require3D = false,
  requireParticles = false,
}: OptimizedRenderProps) {
  const { tier, disableShaders, disable3D, disableParticles, reducedMotion } =
    useOptimization();

  const tierRank = { lite: 0, full: 1 };
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
