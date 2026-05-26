import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Login from "./Login";

const navigateMock = vi.fn();
const readRedirectTargetMock = vi.fn();
const authUiMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({
      pathname: "/login",
      search: "?redirect=%2Fstudy%2Fdashboard",
      hash: "",
    }),
    useSearchParams: () => [
      new URLSearchParams("redirect=%2Fstudy%2Fdashboard&hint=learner%40mail.com&auto=true"),
    ],
  };
});

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    user: null,
  }),
}));

vi.mock("@/lib/auth-redirect", () => ({
  DEFAULT_WEB_ORIGIN: "https://www.cryonex.app",
  readRedirectTarget: (...args: unknown[]) => readRedirectTargetMock(...args),
  resolveAuthenticatedDestination: vi.fn(),
}));

vi.mock("@/components/ui/auth-fuse", () => ({
  AuthUI: (props: Record<string, unknown>) => {
    authUiMock(props);
    return <div>Auth UI Surface</div>;
  },
}));

describe("Login", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    readRedirectTargetMock.mockReset();
    authUiMock.mockReset();
    readRedirectTargetMock.mockReturnValue("/study/dashboard");
  });

  it("renders the production auth UI with redirect context", () => {
    render(<Login />);

    expect(screen.getByText("Auth UI Surface")).toBeInTheDocument();
    expect(authUiMock).toHaveBeenCalledWith(
      expect.objectContaining({
        autoSendCode: true,
        defaultMode: "signin",
        destinationLabel: "study dashboard",
        initialEmail: "learner@mail.com",
        redirectTarget: "/study/dashboard",
      }),
    );
  });
});
