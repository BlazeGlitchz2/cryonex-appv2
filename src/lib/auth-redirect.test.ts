import { describe, expect, it } from "vitest";
import {
  buildOnboardingPath,
  readRedirectTarget,
  resolveAuthenticatedDestination,
  resolveOnboardingCompletionDestination,
  sanitizeRedirectTarget,
} from "./auth-redirect";

describe("auth redirect helpers", () => {
  it("rejects external redirect targets", () => {
    expect(sanitizeRedirectTarget("https://example.com")).toBe(
      "/study/dashboard",
    );
    expect(sanitizeRedirectTarget("//example.com")).toBe("/study/dashboard");
  });

  it("preserves onboarding URLs that already carry state", () => {
    expect(buildOnboardingPath("/onboarding?redirect=%2Faffiliate&ref=abc")).toBe(
      "/onboarding?redirect=%2Faffiliate&ref=abc",
    );
  });

  it("routes incomplete users into onboarding while preserving intent", () => {
    expect(
      resolveAuthenticatedDestination({
        user: { onboardingCompleted: false },
        redirectTarget: "/affiliate",
      }),
    ).toBe("/onboarding?redirect=%2Faffiliate");
  });

  it("routes completed users back to their intended destination", () => {
    expect(
      resolveAuthenticatedDestination({
        user: { onboardingCompleted: true },
        redirectTarget: "/affiliate",
      }),
    ).toBe("/affiliate");
  });

  it("falls back to the dashboard after onboarding-only redirects", () => {
    expect(resolveOnboardingCompletionDestination("/onboarding")).toBe(
      "/study/dashboard",
    );
  });

  it("reads redirect intent from query strings safely", () => {
    expect(readRedirectTarget("?redirect=%2Fstudy%2Fworkspace%2Fdemo")).toBe(
      "/study/workspace/demo",
    );
  });
});
