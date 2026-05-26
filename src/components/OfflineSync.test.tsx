import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { OfflineSync } from "./OfflineSync";

const {
  toastInfo,
  toastSuccess,
  hapticNotification,
  removePendingMessage,
  updatePendingStatus,
  offlineStoreState,
  useOfflineStoreMock,
} = vi.hoisted(() => {
  const toastInfo = vi.fn();
  const toastSuccess = vi.fn();
  const hapticNotification = vi.fn();
  const removePendingMessage = vi.fn();
  const updatePendingStatus = vi.fn();
  const offlineStoreState = {
    pendingMessages: [] as Array<{
      tempId: string;
      chatId: string;
      content: string;
      queuedAt: number;
      status: "pending";
    }>,
    removePendingMessage,
    updatePendingStatus,
  };

  const useOfflineStoreMock = Object.assign(
    <T,>(
      selector: (
        state: typeof offlineStoreState,
      ) => T,
    ) => selector(offlineStoreState),
    {
      getState: () => offlineStoreState,
    },
  );

  return {
    toastInfo,
    toastSuccess,
    hapticNotification,
    removePendingMessage,
    updatePendingStatus,
    offlineStoreState,
    useOfflineStoreMock,
  };
});

let mockIsOnline = false;

vi.mock("sonner", () => ({
  toast: {
    info: toastInfo,
    success: toastSuccess,
  },
}));

vi.mock("@/hooks/use-network-status", () => ({
  useNetworkStatus: () => ({ isOnline: mockIsOnline, connectionType: "wifi" }),
}));

vi.mock("@/lib/stores/offline-store", () => ({
  useOfflineStore: useOfflineStoreMock,
}));

vi.mock("@/lib/platform-runtime", () => ({
  isIOSNative: () => true,
}));

vi.mock("@/lib/mobile", () => ({
  hapticNotification,
}));

describe("OfflineSync", () => {
  beforeEach(() => {
    mockIsOnline = false;
    offlineStoreState.pendingMessages = [
      {
        tempId: "temp-1",
        chatId: "chat-1",
        content: "Queued while offline",
        queuedAt: Date.now(),
        status: "pending" as const,
      },
    ];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("keeps queued messages intact when connectivity returns", async () => {
    const { rerender } = render(<OfflineSync />);

    mockIsOnline = true;
    rerender(<OfflineSync />);

    expect(hapticNotification).toHaveBeenCalledWith("success");
    expect(updatePendingStatus).not.toHaveBeenCalled();
    expect(removePendingMessage).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastInfo).toHaveBeenCalledWith(
      "Connection restored. Queued messages are ready to resend.",
      expect.objectContaining({
        id: "offline-sync",
      }),
    );
  });
});
