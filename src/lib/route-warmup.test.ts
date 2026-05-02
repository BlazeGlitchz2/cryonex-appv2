import { describe, expect, it } from "vitest";

import {
  getLandingWarmupTargets,
  hasLandingWarmupBudget,
} from "./route-warmup";

describe("route warmup", () => {
  it("keeps the public landing warmup focused on the first signed-in step", () => {
    expect(
      getLandingWarmupTargets({
        shouldOpenStudyShell: false,
        shouldReduceWarmup: false,
        hasWarmupBudget: true,
      }),
    ).toEqual(["app-layout", "study-dashboard"]);
  });

  it("skips landing warmup on native handoff and reduced-warmup devices", () => {
    expect(
      getLandingWarmupTargets({
        shouldOpenStudyShell: true,
        shouldReduceWarmup: false,
        hasWarmupBudget: true,
      }),
    ).toEqual([]);

    expect(
      getLandingWarmupTargets({
        shouldOpenStudyShell: false,
        shouldReduceWarmup: true,
        hasWarmupBudget: true,
      }),
    ).toEqual([]);
  });

  it("skips public-route warmup when the device signals a constrained budget", () => {
    expect(
      getLandingWarmupTargets({
        shouldOpenStudyShell: false,
        shouldReduceWarmup: false,
        hasWarmupBudget: false,
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
