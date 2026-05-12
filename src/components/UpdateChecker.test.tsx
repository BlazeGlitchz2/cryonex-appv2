import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { UpdateChecker } from "./UpdateChecker";

vi.mock("convex/react", () => ({
  useConvex: () => ({}),
}));

vi.mock("@/lib/platform-runtime", () => ({
  isNativePlatform: () => true,
}));

vi.mock("@capacitor/device", () => ({
  Device: {
    getInfo: vi.fn().mockResolvedValue({ isVirtual: false }),
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
});
