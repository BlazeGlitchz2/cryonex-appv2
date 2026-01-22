import * as React from "react";

// Increased breakpoint to catch tablets (iPad Pro is 1024px, some larger tablets are 1280px)
const MOBILE_BREAKPOINT = 1280;

// Device detection result type
export interface DeviceInfo {
  isMobile: boolean;
  isAndroid: boolean;
  isTablet: boolean;
  isSmartboard: boolean;
  isLowPowerDevice: boolean; // Umbrella flag for devices that should skip heavy graphics
  isTouch: boolean;
}

// Helper function to detect device type from User Agent
function detectDeviceType(): Omit<DeviceInfo, 'isMobile'> {
  if (typeof navigator === 'undefined') {
    return { isAndroid: false, isTablet: false, isSmartboard: false, isLowPowerDevice: false, isTouch: false };
  }

  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();

  // Android detection
  const isAndroid = /android/i.test(ua);

  // Tablet detection (Android tablet, iPad)
  const isTablet = (
    /tablet|ipad/i.test(ua) ||
    (isAndroid && !/mobile/i.test(ua)) || // Android tablets don't have 'mobile' in UA
    (typeof window !== 'undefined' && window.innerWidth >= 600 && window.innerWidth <= 1280 && /android/i.test(ua))
  );

  // Touch capability
  const isTouch = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

  // Smartboard detection - large touch screens with Android
  // Smartboards typically have large screens (> 1024px) but are touch-enabled Android devices
  const isSmartboard = (
    isAndroid &&
    isTouch &&
    typeof window !== 'undefined' &&
    window.innerWidth >= 1024 &&
    (
      /smartboard|interactive|display|board/i.test(ua) ||
      // Many smartboards don't identify in UA - detect by large touch + Android
      (window.innerWidth >= 1280 && window.innerHeight >= 800)
    )
  );

  // Low power device flag - should skip heavy shaders and 3D
  // Includes: All Android phones, tablets, smartboards, and iOS devices
  const isLowPowerDevice = (
    isAndroid ||
    /iphone|ipad|ipod/i.test(ua) ||
    isTablet ||
    isSmartboard ||
    // Fallback: touch device with mobile-like width
    (isTouch && typeof window !== 'undefined' && window.innerWidth < 1024)
  );

  return {
    isAndroid,
    isTablet,
    isSmartboard,
    isLowPowerDevice,
    isTouch
  };
}

// Hook that returns full device information
export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(() => {
    const detected = detectDeviceType();
    return {
      ...detected,
      isMobile: typeof window !== 'undefined' ? window.innerWidth < 1024 || detected.isLowPowerDevice : false
    };
  });

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const detected = detectDeviceType();
      const width = window.innerWidth;

      setDeviceInfo({
        ...detected,
        isMobile: width < 1024 || detected.isLowPowerDevice
      });
    };

    updateDeviceInfo();
    window.addEventListener("resize", updateDeviceInfo);
    return () => window.removeEventListener("resize", updateDeviceInfo);
  }, []);

  return deviceInfo;
}

// Original hook for backward compatibility
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      // Check for common tablet/mobile keywords
      const isTabletOrMobile = /ipad|android|tablet|mobile|iphone|ipod/i.test(userAgent);
      // Check for touch capability which often indicates mobile/tablet/smartboard
      const isTouch = navigator.maxTouchPoints > 0;

      // Refined check to avoid false positives on touch laptops:
      // 1. Screen width < 1024px (Standard tablet/mobile breakpoint)
      // 2. OR explicit mobile/tablet user agent (catches iPad, Android tablets, Smartboards)
      // 3. OR touch device with VERY small width (mobile phones that might miss UA check)
      setIsMobile(
        width < 1024 ||
        isTabletOrMobile
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return !!isMobile;
}

// Simple helper function for SSR-safe one-time check (not reactive)
export function isLowPowerDevice(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent;
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isTouch = navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth < 1024;

  return isAndroid || isIOS || (isTouch && isSmallScreen);
}
