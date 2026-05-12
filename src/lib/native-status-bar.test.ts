import { describe, expect, it } from "vitest";

import { shouldOverlayStatusBar } from "@/lib/native-status-bar";

describe("shouldOverlayStatusBar", () => {
  it("keeps immersive overlay enabled for workspace routes", () => {
    expect(shouldOverlayStatusBar("/")).toBe(true);
    expect(shouldOverlayStatusBar("/app")).toBe(true);
    expect(shouldOverlayStatusBar("/study/dashboard")).toBe(true);
  });

  it("disables overlay for auth routes that need fixed safe-area spacing", () => {
    expect(shouldOverlayStatusBar("/login")).toBe(false);
    expect(shouldOverlayStatusBar("/auth")).toBe(false);
  });

  it("disables overlay for nested auth routes and callbacks", () => {
    expect(shouldOverlayStatusBar("/login/reset")).toBe(false);
    expect(shouldOverlayStatusBar("/auth/callback")).toBe(false);
  });
});
