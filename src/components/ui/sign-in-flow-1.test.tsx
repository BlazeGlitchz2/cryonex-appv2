import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SignInPage } from "./sign-in-flow-1";

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="mock-canvas" />,
  useFrame: vi.fn(),
  useThree: () => ({
    size: { width: 390, height: 844 },
    viewport: { width: 390, height: 844 },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>("react-router");
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams()],
    Link: ({ children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
      <a {...props}>{children}</a>
    ),
  };
});

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    signIn: vi.fn(),
  }),
}));

vi.mock("@/lib/mobile", () => ({
  isNativePlatform: () => false,
}));

vi.mock("@/lib/auth-redirect", () => ({
  buildBrowserAuthRedirect: () => "https://cryonex.app/study/dashboard",
  buildNativeAuthRedirect: () => "cryonex://study/dashboard",
  enableGuestPreviewMode: vi.fn(),
  shouldUseDirectGuestPreviewNavigation: () => true,
  GUEST_PREVIEW_WORKSPACE_REDIRECT: "/study/workspace/test-doc",
  readRedirectTarget: () => null,
}));

describe("SignInPage mobile safe area", () => {
  it("keeps the floating navbar and auth form below the iOS notch", () => {
    const { container } = render(<SignInPage />);

    const header = container.querySelector("header");

    screen.getByRole("heading", { name: /welcome student/i });

    expect(header?.className).toContain("top-[max(1rem,env(safe-area-inset-top))]");
    expect(container.innerHTML).toContain(
      "pt-[calc(env(safe-area-inset-top,0px)+5.5rem)]",
    );
  });
});
