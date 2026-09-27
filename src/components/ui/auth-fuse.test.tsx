import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthUI } from "./auth-fuse";

const {
  mockSignIn,
  mockEnableGuestPreviewMode,
  mockDisableGuestPreviewMode,
  mockShouldUseDirectGuestPreviewNavigation,
} = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockEnableGuestPreviewMode: vi.fn(),
  mockDisableGuestPreviewMode: vi.fn(),
  mockShouldUseDirectGuestPreviewNavigation: vi.fn(),
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
  }),
}));

vi.mock("@/lib/platform-runtime", () => ({
  isNativePlatform: () => false,
}));

vi.mock("@/lib/auth-redirect", () => ({
  buildBrowserAuthRedirect: () => "https://cryonex.app/study/dashboard",
  buildNativeAuthRedirect: () => "cryonex://study/dashboard",
  enableGuestPreviewMode: mockEnableGuestPreviewMode,
  disableGuestPreviewMode: mockDisableGuestPreviewMode,
  shouldUseDirectGuestPreviewNavigation:
    mockShouldUseDirectGuestPreviewNavigation,
  GUEST_PREVIEW_WORKSPACE_REDIRECT: "/study/workspace/test-doc",
}));

describe("AuthUI guest preview", () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockEnableGuestPreviewMode.mockReset();
    mockDisableGuestPreviewMode.mockReset();
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
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /preview workspace/i }),
      ).not.toBeDisabled(),
    );
    expect(mockSignIn).toHaveBeenCalledWith("anonymous");
  });

  it("announces which auth mode is active", () => {
    render(<AuthUI />);

    const signInButton = screen.getByRole("button", { name: /sign in/i });
    const createAccountButton = screen.getByRole("button", {
      name: /create account/i,
    });

    expect(signInButton).toHaveAttribute("aria-pressed", "true");
    expect(createAccountButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(createAccountButton);

    expect(signInButton).toHaveAttribute("aria-pressed", "false");
    expect(createAccountButton).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("heading", { name: /create your cryonex account/i }),
    ).toBeInTheDocument();
  });
  it("validates email without making an authentication request", () => {
    render(<AuthUI />);
    fireEvent.change(screen.getByRole("textbox", { name: /email address/i }), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter a valid email address",
    );
    expect(
      screen.getByRole("textbox", { name: /email address/i }),
    ).toHaveFocus();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("keeps the email draft after a send failure and allows retry", async () => {
    mockSignIn
      .mockRejectedValueOnce(new Error("Offline"))
      .mockResolvedValueOnce({ signingIn: false });
    render(<AuthUI />);
    const input = screen.getByRole("textbox", { name: /email address/i });
    fireEvent.change(input, { target: { value: "  learner@example.com  " } });
    fireEvent.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "couldn't send your code",
    );
    expect(input).toHaveValue("learner@example.com");
    fireEvent.click(
      screen.getByRole("button", { name: /continue with email/i }),
    );
    expect(
      await screen.findByRole("textbox", { name: /verification code/i }),
    ).toHaveFocus();
    expect(mockSignIn).toHaveBeenLastCalledWith("resend", {
      email: "learner@example.com",
    });
    expect(
      screen.getByRole("button", { name: /resend in 30s/i }),
    ).toBeDisabled();
  });

  it("accepts a pasted code and preserves the requested destination", async () => {
    mockSignIn.mockResolvedValue({ signingIn: false });
    render(
      <AuthUI
        initialEmail="learner@example.com"
        autoSendCode
        redirectTarget="/study/dashboard"
      />,
    );
    const input = await screen.findByRole("textbox", {
      name: /verification code/i,
    });
    fireEvent.paste(input, {
      clipboardData: { getData: () => "12 34-56" },
    });
    expect(input).toHaveValue("123456");
    fireEvent.click(
      screen.getByRole("button", { name: /verify and continue/i }),
    );
    await waitFor(() =>
      expect(mockSignIn).toHaveBeenLastCalledWith("resend", {
        email: "learner@example.com",
        code: "123456",
        redirectTo: "https://cryonex.app/study/dashboard",
      }),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /verify and continue/i }),
      ).not.toBeDisabled(),
    );
  });

  it("rejects an incomplete code without sending a verification request", async () => {
    mockSignIn.mockResolvedValue({ signingIn: false });
    render(<AuthUI initialEmail="learner@example.com" autoSendCode />);
    fireEvent.change(
      await screen.findByRole("textbox", { name: /verification code/i }),
      { target: { value: "123" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: /verify and continue/i }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "complete six-digit code",
    );
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it("prevents duplicate submissions while an email request is pending", async () => {
    let resolveRequest!: (value: { signingIn: boolean }) => void;
    mockSignIn.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );
    render(<AuthUI initialEmail="learner@example.com" />);
    const submit = screen.getByRole("button", { name: /continue with email/i });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: /sending your code/i }),
    ).toBeDisabled();
    await act(async () => resolveRequest({ signingIn: false }));
    expect(
      screen.getByRole("textbox", { name: /verification code/i }),
    ).toBeInTheDocument();
  });

  it("clears preview flags when anonymous sign-in fails", async () => {
    mockShouldUseDirectGuestPreviewNavigation.mockReturnValue(false);
    mockSignIn.mockRejectedValue(new Error("Offline"));
    render(<AuthUI />);
    fireEvent.click(screen.getByRole("button", { name: /preview workspace/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "preview couldn't open",
    );
    expect(window.localStorage.getItem("kimi_guest_pending")).toBeNull();
    expect(mockDisableGuestPreviewMode).toHaveBeenCalledOnce();
  });
});
