import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthUI } from "./auth-fuse";

const {
  mockSignIn,
  mockEnableGuestPreviewMode,
  mockShouldUseDirectGuestPreviewNavigation,
} = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockEnableGuestPreviewMode: vi.fn(),
  mockShouldUseDirectGuestPreviewNavigation: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

vi.mock("@/lib/mobile", () => ({
  isNativePlatform: () => false,
}));

vi.mock("@/lib/auth-redirect", () => ({
  buildBrowserAuthRedirect: () => "https://cryonex.app/study/dashboard",
  buildNativeAuthRedirect: () => "cryonex://study/dashboard",
  enableGuestPreviewMode: mockEnableGuestPreviewMode,
  shouldUseDirectGuestPreviewNavigation:
    mockShouldUseDirectGuestPreviewNavigation,
  GUEST_PREVIEW_WORKSPACE_REDIRECT: "/study/workspace/test-doc",
}));

describe("AuthUI guest preview", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockEnableGuestPreviewMode.mockReset();
    mockShouldUseDirectGuestPreviewNavigation.mockReset();
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("routes direct guest preview to the workspace demo without anonymous sign-in", () => {
    mockShouldUseDirectGuestPreviewNavigation.mockReturnValue(true);
    const originalLocation = window.location;
    const assignSpy = vi.fn();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        ...originalLocation,
        assign: assignSpy,
      },
    });

    render(<AuthUI />);

    fireEvent.click(screen.getByRole("button", { name: /preview workspace/i }));

    expect(mockEnableGuestPreviewMode).toHaveBeenCalledOnce();
    expect(assignSpy).toHaveBeenCalledWith("/study/workspace/test-doc");
    expect(window.localStorage.getItem("kimi_guest_pending")).toBeNull();
    expect(mockSignIn).not.toHaveBeenCalled();

    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("falls back to anonymous sign-in when direct preview is unavailable", async () => {
    mockShouldUseDirectGuestPreviewNavigation.mockReturnValue(false);
    mockSignIn.mockResolvedValue({ signingIn: false });

    render(<AuthUI />);

    fireEvent.click(screen.getByRole("button", { name: /preview workspace/i }));

    expect(mockEnableGuestPreviewMode).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem("kimi_guest_pending")).toBe("true");
    expect(mockSignIn).toHaveBeenCalledWith("anonymous");
  });
});
