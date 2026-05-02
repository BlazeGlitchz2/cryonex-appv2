import * as React from "react";

const PHONE_MAX_WIDTH = 767;
const TABLET_MIN_WIDTH = 768;
const TABLET_MAX_WIDTH = 1280;

export type DeviceType = "phone" | "tablet" | "desktop";

export interface DeviceInfo {
  deviceType: DeviceType;
  isMobile: boolean;
  isPhone: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmartboard: boolean;
  isLowPowerDevice: boolean; // Umbrella flag for devices that should skip heavy graphics
  isTouch: boolean;
}

function getViewportWidth() {
  return typeof window !== "undefined" ? window.innerWidth : 1024;
}

function getViewportHeight() {
  return typeof window !== "undefined" ? window.innerHeight : 768;
}

function detectDeviceInfo(): DeviceInfo {
  if (typeof navigator === "undefined") {
    return {
      deviceType: "desktop",
      isMobile: false,
      isPhone: false,
      isAndroid: false,
      isIOS: false,
      isTablet: false,
      isDesktop: true,
      isSmartboard: false,
      isLowPowerDevice: false,
      isTouch: false,
    };
  }

  const ua = navigator.userAgent;
  const width = getViewportWidth();
  const height = getViewportHeight();
  const isTouch = navigator.maxTouchPoints > 0;
  const isAndroid = /android/i.test(ua);
  const isIOS = /iphone|ipad|ipod/i.test(ua);
  const isDesktopOsUa = /windows nt|macintosh|x11; linux|cros/i.test(ua);
  const isIpadOS =
    /ipad/i.test(ua) ||
    (/macintosh/i.test(ua) &&
      navigator.maxTouchPoints > 1 &&
      width >= TABLET_MIN_WIDTH);

  const isTabletUa =
    isIpadOS ||
    /tablet|playbook|silk|kindle|sm-t|gt-p|tab|lenovo.*tab|huawei.*mediapad|galaxy.*tab|nexus\s?(7|9|10)/i.test(
      ua,
    ) ||
    (isAndroid && !/mobile/i.test(ua));

  const isTabletByViewport =
    isTouch &&
    width >= TABLET_MIN_WIDTH &&
    width <= TABLET_MAX_WIDTH &&
    !isDesktopOsUa &&
    !/mobile|iphone|ipod/i.test(ua);

  const isTablet = isTabletUa || isTabletByViewport;
  const isPhoneUa =
    /iphone|ipod|android.*mobile|mobile|windows phone|blackberry|bb10|opera mini|opera mobi|iemobile/i.test(
      ua,
    );
  const isPhone =
    !isTablet &&
    (width <= PHONE_MAX_WIDTH ||
      isPhoneUa ||
      (isAndroid && /mobile/i.test(ua)));
  const deviceType: DeviceType = isTablet
    ? "tablet"
    : isPhone
      ? "phone"
      : "desktop";
  const isDesktop = deviceType === "desktop";

  // Smartboards are still touch devices, but they should stay on the lighter rendering path.
  const isSmartboard =
    isAndroid &&
    isTouch &&
    width >= 1024 &&
    (/smartboard|interactive|display|board/i.test(ua) ||
      (width >= 1280 && height >= 800));

  const isLowPowerDevice = deviceType !== "desktop" || isSmartboard;

  return {
    deviceType,
    isMobile: deviceType !== "desktop",
    isPhone,
    isAndroid,
    isIOS,
    isTablet,
    isDesktop,
    isSmartboard,
    isLowPowerDevice,
    isTouch,
  };
}

// Hook that returns full device information
export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>(() =>
    detectDeviceInfo(),
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDeviceInfo = () => {
      setDeviceInfo(detectDeviceInfo());
    };

    updateDeviceInfo();
    window.addEventListener("resize", updateDeviceInfo);
    window.addEventListener("orientationchange", updateDeviceInfo);
    return () => {
      window.removeEventListener("resize", updateDeviceInfo);
      window.removeEventListener("orientationchange", updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

// Original hook for backward compatibility
// Only phones are considered "mobile" - tablets get a tablet shell.
export function useIsMobile() {
  return useDeviceType() === "phone";
}

// Simple helper function for SSR-safe one-time check (not reactive)
export function isLowPowerDevice(): boolean {
  return detectDeviceInfo().isLowPowerDevice;
}

// Hook to detect if device is a tablet (for tablet-specific optimizations)
export function useIsTablet(): boolean {
  return useDeviceType() === "tablet";
}

// Hook that returns device type for conditional rendering
// Use this for components that need different layouts for phone/tablet/desktop
export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = React.useState<DeviceType>(
    () => detectDeviceInfo().deviceType,
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const updateDeviceType = () => {
      setDeviceType(detectDeviceInfo().deviceType);
    };

    updateDeviceType();
    window.addEventListener("resize", updateDeviceType);
    window.addEventListener("orientationchange", updateDeviceType);
    return () => {
      window.removeEventListener("resize", updateDeviceType);
      window.removeEventListener("orientationchange", updateDeviceType);
    };
  }, []);

  return deviceType;
}
