import { describe, expect, it } from "vitest";

import { getLandingEntrySurface } from "./landing-entry";
import type { DeviceInfo } from "@/hooks/use-mobile";

const baseDevice: DeviceInfo = {
  deviceType: "desktop",
  isAndroid: false,
  isDesktop: true,
  isIOS: false,
  isLowPowerDevice: false,
  isMobile: false,
  isPhone: false,
  isSmartboard: false,
  isTablet: false,
  isTouch: false,
};

describe("landing entry surface", () => {
  it("keeps native apps on the study shell while preserving mobile web acquisition", () => {
    expect(
      getLandingEntrySurface({
        deviceInfo: { ...baseDevice, deviceType: "phone", isPhone: true },
        isNative: true,
      }),
    ).toBe("study-shell");

    expect(
      getLandingEntrySurface({
        deviceInfo: { ...baseDevice, deviceType: "phone", isPhone: true },
        isNative: false,
      }),
    ).toBe("mobile-landing");

    expect(
      getLandingEntrySurface({
        deviceInfo: baseDevice,
        isNative: false,
      }),
    ).toBe("full-landing");
  });
});
