import { act, renderHook } from "@testing-library/react";
import { getFunctionName } from "convex/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useFocusSessionController } from "./use-focus-session-controller";

const mocks = vi.hoisted(() => ({
  activeSession: null as null | {
    _id: string;
    startTime: number;
    status: string;
  },
  start: vi.fn(),
  otherMutation: vi.fn(),
  info: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  bridge: {
    clearFocusShield: vi.fn(),
    configureFocusShield: vi.fn(),
    getFocusShieldStatus: vi.fn(),
    openFocusShieldSettings: vi.fn(),
    pauseFocusShield: vi.fn(),
    resumeFocusShield: vi.fn(),
  },
}));

vi.mock("convex/react", () => ({
  useQuery: () => mocks.activeSession,
  useMutation: (reference: Parameters<typeof getFunctionName>[0]) =>
    getFunctionName(reference) === "study:startStudySession"
      ? mocks.start
      : mocks.otherMutation,
}));
vi.mock("sonner", () => ({
  toast: { info: mocks.info, success: mocks.success, error: mocks.error },
}));
vi.mock("@/hooks/useCryonexBridge", () => ({
  useCryonexBridge: () => mocks.bridge,
}));
vi.mock("@/lib/mobile", () => ({
  isNativePlatform: () => false,
  hapticNotification: vi.fn().mockResolvedValue(undefined),
  hapticFeedback: vi.fn().mockResolvedValue(undefined),
}));

const renderController = (enabled: boolean) =>
  renderHook(() =>
    useFocusSessionController({
      activityType: "reading",
      enabled,
      surfaceLabel: "Study Workspace",
    }),
  );

describe("Focus session start", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.activeSession = null;
    mocks.start.mockReset();
    mocks.otherMutation.mockResolvedValue(undefined);
  });

  it("explains the sign-in requirement without sending a guest mutation", async () => {
    const { result } = renderController(false);
    await act(async () => {
      await result.current.startFocusSession();
    });

    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.info).toHaveBeenCalledWith(
      "Sign in to start a focus session.",
    );
    expect(result.current.isStartingFocusSession).toBe(false);
  });

  it("prevents duplicate starts while the first request is pending", async () => {
    let finish!: (id: string) => void;
    mocks.start.mockReturnValue(
      new Promise<string>((resolve) => {
        finish = resolve;
      }),
    );
    const { result } = renderController(true);
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.startFocusSession();
      void result.current.startFocusSession();
    });

    expect(mocks.start).toHaveBeenCalledTimes(1);
    expect(result.current.isStartingFocusSession).toBe(true);
    await act(async () => {
      finish("session-1");
      await pending;
    });
    expect(result.current.isStartingFocusSession).toBe(false);
  });

  it("keeps an existing session running when start is pressed again", async () => {
    mocks.activeSession = {
      _id: "session-1",
      startTime: Date.now(),
      status: "active",
    };
    const { result } = renderController(true);
    await act(async () => {
      await result.current.startFocusSession();
    });

    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.info).toHaveBeenCalledWith(
      "Your focus session is already running.",
    );
    expect(result.current.hasActiveFocusSession).toBe(true);
  });

  it("allows another start after a failed request", async () => {
    mocks.start
      .mockRejectedValueOnce(new Error("Connection failed"))
      .mockResolvedValueOnce("session-2");
    const { result } = renderController(true);
    await act(async () => {
      await result.current.startFocusSession();
    });
    expect(mocks.error).toHaveBeenCalledWith("Connection failed");
    expect(result.current.isStartingFocusSession).toBe(false);

    await act(async () => {
      await result.current.startFocusSession();
    });
    expect(mocks.start).toHaveBeenCalledTimes(2);
    expect(mocks.success).toHaveBeenCalledWith(
      "Focus session started for 45 minutes.",
    );
  });
});
