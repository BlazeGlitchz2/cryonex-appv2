import { describe, expect, it } from "vitest";

import {
  ANDROID_FOCUS_ALLOWED_PACKAGES,
  ANDROID_FOCUS_BLOCKED_PACKAGES,
  buildAndroidFocusShieldPayload,
} from "./android-focus-shield";

describe("android focus shield payload", () => {
  it("maps the default social apps into blocked Android packages", () => {
    const payload = buildAndroidFocusShieldPayload({
      now: 1_000,
      sessionId: "study-session-1",
      sessionLabel: "45 minute study block",
      durationMinutes: 45,
    });

    expect(payload.expiresAt).toBe(1_000 + 45 * 60 * 1000);
    expect(payload.blockedPackages).toEqual(
      expect.arrayContaining([
        "com.instagram.android",
        "com.zhiliaoapp.musically",
        "com.snapchat.android",
        "com.facebook.katana",
      ]),
    );
    expect(payload.allowedPackages).toEqual(
      expect.arrayContaining([
        "com.google.android.dialer",
        "com.facebook.orca",
        "com.whatsapp",
      ]),
    );
  });

  it("deduplicates blocked and allowed package lists", () => {
    const payload = buildAndroidFocusShieldPayload({
      blockedPackages: [...ANDROID_FOCUS_BLOCKED_PACKAGES, "com.instagram.android"],
      durationMinutes: 30,
      allowedPackages: [...ANDROID_FOCUS_ALLOWED_PACKAGES, "com.whatsapp"],
      now: 50,
      sessionId: "study-session-2",
      sessionLabel: "30 minute study block",
    });

    expect(payload.blockedPackages.filter((pkg) => pkg === "com.instagram.android")).toHaveLength(1);
    expect(payload.allowedPackages.filter((pkg) => pkg === "com.whatsapp")).toHaveLength(1);
  });
});
