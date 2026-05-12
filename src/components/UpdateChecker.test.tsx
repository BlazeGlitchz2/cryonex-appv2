import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UpdateChecker } from "./UpdateChecker";

const deviceGetInfo = vi.fn().mockResolvedValue({ isVirtual: false });

vi.mock("convex/react", () => ({
  useConvex: () => ({}),
}));

vi.mock("@/lib/platform-runtime", () => ({
  isNativePlatform: () => true,
}));

vi.mock("@capacitor/device", () => ({
  Device: {
    getInfo: deviceGetInfo,
  },
}));

describe("UpdateChecker", () => {
  beforeEach(() => {
    vi.stubEnv("DEV", false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("cancels a pending idle update check when unmounted", async () => {
    const idleHandle = 42;
    const requestIdleCallback = vi.fn().mockReturnValue(idleHandle);
    const cancelIdleCallback = vi.fn();

    vi.stubGlobal("requestIdleCallback", requestIdleCallback);
    vi.stubGlobal("cancelIdleCallback", cancelIdleCallback);

    const { unmount } = render(<UpdateChecker />);

    await waitFor(() => {
      expect(requestIdleCallback).toHaveBeenCalledOnce();
    });

    unmount();

    expect(cancelIdleCallback).toHaveBeenCalledWith(idleHandle);
  });

  it("does not schedule an update check after unmount if device detection is still pending", async () => {
    let resolveDeviceInfo!: (value: { isVirtual: boolean }) => void;
    const pendingDeviceInfo = new Promise<{ isVirtual: boolean }>((resolve) => {
      resolveDeviceInfo = resolve;
    });

    deviceGetInfo.mockReturnValueOnce(pendingDeviceInfo);

    const requestIdleCallback = vi.fn();
    vi.stubGlobal("requestIdleCallback", requestIdleCallback);

    const { unmount } = render(<UpdateChecker />);

    await waitFor(() => {
      expect(deviceGetInfo).toHaveBeenCalledOnce();
    });

    unmount();
    resolveDeviceInfo({ isVirtual: false });
    await pendingDeviceInfo;

    expect(requestIdleCallback).not.toHaveBeenCalled();
  });
});
