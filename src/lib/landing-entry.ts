import type { DeviceInfo } from "@/hooks/use-mobile";

export type LandingEntrySurface =
  | "full-landing"
  | "mobile-landing"
  | "study-shell";

export function getLandingEntrySurface({
  deviceInfo,
  isNative,
}: {
  deviceInfo: Pick<DeviceInfo, "isPhone">;
  isNative: boolean;
}): LandingEntrySurface {
  if (isNative) {
    return "study-shell";
  }

  if (deviceInfo.isPhone) {
    return "mobile-landing";
  }

  return "full-landing";
}
