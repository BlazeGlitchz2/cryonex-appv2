type CapacitorRuntime = {
  getPlatform?: () => string;
  isNativePlatform?: () => boolean;
};

function getCapacitorRuntime(): CapacitorRuntime | null {
  if (typeof globalThis === "undefined") {
    return null;
  }

  return ((
    globalThis as typeof globalThis & {
      Capacitor?: CapacitorRuntime;
    }
  ).Capacitor ?? null) as CapacitorRuntime | null;
}

export function getRuntimePlatform() {
  const platform = getCapacitorRuntime()?.getPlatform?.();

  if (platform === "android" || platform === "ios" || platform === "web") {
    return platform;
  }

  return "web";
}

export function isNativePlatform() {
  return Boolean(getCapacitorRuntime()?.isNativePlatform?.());
}

export function isAndroidNative() {
  return getRuntimePlatform() === "android";
}

export function isIOSNative() {
  return getRuntimePlatform() === "ios";
}

export function isWebPlatform() {
  return getRuntimePlatform() === "web";
}
