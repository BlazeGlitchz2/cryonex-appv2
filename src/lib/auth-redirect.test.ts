import { describe, expect, it } from "vitest";
import {
  buildBrowserAuthRedirect,
  canAccessProtectedRoute,
  buildOnboardingPath,
  GUEST_PREVIEW_WORKSPACE_REDIRECT,
  readRedirectTarget,
  resolveAuthenticatedDestination,
  resolveOnboardingCompletionDestination,
  sanitizeRedirectTarget,
  shouldUseDirectGuestPreviewNavigation,
} from "./auth-redirect";

describe("auth redirect helpers", () => {
  it("builds absolute browser redirects on the current origin", () => {
    window.history.replaceState({}, "", "/login");
    expect(buildBrowserAuthRedirect("/affiliate")).toBe(
      `${window.location.origin}/affiliate`,
    );
  });

  it("rejects external redirect targets", () => {
    expect(sanitizeRedirectTarget("https://example.com")).toBe(
      "/study/dashboard",
    );
    expect(sanitizeRedirectTarget("//example.com")).toBe("/study/dashboard");
  });

  it("preserves onboarding URLs that already carry state", () => {
    expect(
      buildOnboardingPath("/onboarding?redirect=%2Faffiliate&ref=abc"),
    ).toBe("/onboarding?redirect=%2Faffiliate&ref=abc");
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
        user: { onboardingCompleted: true, onboardingVersion: 2 },
        redirectTarget: "/affiliate",
      }),
    ).toBe("/affiliate");
  });

  it("re-routes legacy users to onboarding when the version changes", () => {
    expect(
      resolveAuthenticatedDestination({
        user: { onboardingCompleted: true, onboardingVersion: 1 },
        redirectTarget: "/affiliate",
      }),
    ).toBe("/onboarding?redirect=%2Faffiliate");
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

  it("uses direct guest preview navigation on localhost", () => {
    expect(window.location.hostname).toBe("localhost");
    expect(shouldUseDirectGuestPreviewNavigation()).toBe(true);
  });

  it("blocks anonymous access to protected routes outside guest preview", () => {
    expect(
      canAccessProtectedRoute({
        pathname: "/app",
        isAuthenticated: false,
        guestPreviewMode: false,
        allowsDirectGuestPreview: false,
      }),
    ).toBe(false);
  });

  it("allows the direct guest preview dashboard without authentication", () => {
    expect(
      canAccessProtectedRoute({
        pathname: "/study/dashboard",
        isAuthenticated: false,
        guestPreviewMode: true,
        allowsDirectGuestPreview: true,
      }),
    ).toBe(true);
  });

  it("allows the local demo workspace in direct guest preview", () => {
    expect(
      canAccessProtectedRoute({
        pathname: GUEST_PREVIEW_WORKSPACE_REDIRECT,
        isAuthenticated: false,
        guestPreviewMode: true,
        allowsDirectGuestPreview: true,
      }),
    ).toBe(true);
  });

  it("keeps arbitrary study workspaces behind auth even in guest preview", () => {
    expect(
      canAccessProtectedRoute({
        pathname: "/study/workspace/demo",
        isAuthenticated: false,
        guestPreviewMode: true,
        allowsDirectGuestPreview: true,
      }),
    ).toBe(false);
  });
});
