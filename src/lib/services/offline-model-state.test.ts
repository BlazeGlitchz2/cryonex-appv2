import { describe, expect, it } from "vitest";

import {
  getEffectiveOfflineModelTier,
  getLocalAIAvailability,
  mapOfflineStateToLocalAIState,
} from "./offline-model-state";

describe("offline model state helpers", () => {
  it("prefers the cached tier when native initialization does not request one", () => {
    expect(getEffectiveOfflineModelTier(undefined, "small", "tiny")).toBe(
      "small",
    );
    expect(getEffectiveOfflineModelTier(undefined, null, "tiny")).toBe("tiny");
    expect(getEffectiveOfflineModelTier("small", "tiny", "tiny")).toBe("small");
  });

  it("maps shared offline state into the local AI chat state shape", () => {
    expect(
      mapOfflineStateToLocalAIState({
        isInitialized: false,
        isDownloading: false,
        isModelLoading: true,
        progress: 48,
        progressText: "Loading model into memory...",
        error: null,
        currentTier: "small",
        hasCachedModel: true,
      }),
    ).toEqual({
      isModelDownloaded: true,
      downloadProgress: 48,
      downloadText: "Loading model into memory...",
      isInitializing: true,
      isModelLoading: true,
      error: null,
      currentTier: "small",
    });
  });

  it("reports a native-app-only availability message on unsupported platforms", () => {
    expect(getLocalAIAvailability({ isNativePlatform: false })).toEqual({
      isAvailable: false,
      reason:
        "On-device local AI is available only in the iOS and Android app.",
    });

    expect(getLocalAIAvailability({ isNativePlatform: true })).toEqual({
      isAvailable: true,
      reason: null,
    });
  });
});
