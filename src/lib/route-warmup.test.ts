import { describe, expect, it } from "vitest";

import {
  getLandingWarmupTargets,
  hasLandingWarmupBudget,
} from "./route-warmup";
import type { LandingEntrySurface } from "./landing-entry";

const desktopLanding: LandingEntrySurface = "full-landing";
const phoneLanding: LandingEntrySurface = "mobile-landing";

describe("route warmup", () => {
  it("keeps the public landing warmup focused on the first signed-in step", () => {
    expect(
      getLandingWarmupTargets({
        landingSurface: desktopLanding,
        shouldOpenStudyShell: false,
        shouldReduceWarmup: false,
        hasWarmupBudget: true,
        isNative: false,
      }),
    ).toEqual(["app-layout"]);
  });

  it("skips landing warmup on the mobile acquisition surface", () => {
    expect(
      getLandingWarmupTargets({
        landingSurface: phoneLanding,
        shouldOpenStudyShell: false,
        shouldReduceWarmup: false,
        hasWarmupBudget: true,
        isNative: false,
      }),
    ).toEqual([]);
  });

  it("skips landing warmup on native handoff and reduced-warmup devices", () => {
    expect(
      getLandingWarmupTargets({
        landingSurface: desktopLanding,
        shouldOpenStudyShell: true,
        shouldReduceWarmup: false,
        hasWarmupBudget: true,
        isNative: true,
      }),
    ).toEqual([]);

    expect(
      getLandingWarmupTargets({
        landingSurface: desktopLanding,
        shouldOpenStudyShell: false,
        shouldReduceWarmup: true,
        hasWarmupBudget: true,
        isNative: false,
      }),
    ).toEqual([]);
  });

  it("skips public-route warmup when the device signals a constrained budget", () => {
    expect(
      getLandingWarmupTargets({
        landingSurface: desktopLanding,
        shouldOpenStudyShell: false,
        shouldReduceWarmup: false,
        hasWarmupBudget: false,
        isNative: false,
      }),
    ).toEqual([]);
  });

  it("treats save-data, 2g, low memory, and low cpu devices as no-warmup", () => {
    expect(hasLandingWarmupBudget({ saveData: true })).toBe(false);
    expect(hasLandingWarmupBudget({ effectiveType: "2g" })).toBe(false);
    expect(hasLandingWarmupBudget({ effectiveType: "slow-2g" })).toBe(false);
    expect(hasLandingWarmupBudget({ deviceMemoryGb: 2 })).toBe(false);
    expect(hasLandingWarmupBudget({ hardwareConcurrency: 2 })).toBe(false);
    expect(
      hasLandingWarmupBudget({
        effectiveType: "4g",
        deviceMemoryGb: 8,
        hardwareConcurrency: 8,
      }),
    ).toBe(true);
  });
});
