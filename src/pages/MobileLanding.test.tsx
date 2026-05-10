import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import MobileLanding from "./MobileLanding";

const navigateMock = vi.fn();
const useAuthMock = vi.fn();

vi.mock("react-router", async () => {
  const actual = await vi.importActual<typeof import("react-router")>(
    "react-router",
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/components/landing/LobeHeader", () => ({
  LobeHeader: () => <div>Header</div>,
}));

vi.mock("@/components/landing/LobeFooter", () => ({
  LobeFooter: () => <div>Footer</div>,
}));

describe("MobileLanding", () => {
  beforeEach(() => {
    navigateMock.mockReset();
  });

  it("sends signed-out visitors to login", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<MobileLanding />);

    const cta = screen.getByRole("button", { name: /start free/i });
    fireEvent.click(cta);

    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("sends authenticated users to the study dashboard", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { _id: "user_123" },
    });

    render(<MobileLanding />);

    const cta = screen.getByRole("button", { name: /open dashboard/i });
    fireEvent.click(cta);

    expect(navigateMock).toHaveBeenCalledWith("/study/dashboard");
  });

  it("shows a source-selected study preview", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    render(<MobileLanding />);

    expect(screen.getByText(/current source set/i)).toBeInTheDocument();
    expect(
      screen.getByText(/answers stay tied to the sources you select/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/lecture pdf/i)).toBeInTheDocument();
    expect(screen.getByText(/exam difficulty/i)).toBeInTheDocument();
    expect(screen.getByText(/weak-topic drill/i)).toBeInTheDocument();
    expect(screen.getByText(/card count/i)).toBeInTheDocument();
    expect(screen.getByText(/10 min review/i)).toBeInTheDocument();
    expect(screen.getByText(/cited answer/i)).toBeInTheDocument();
    expect(screen.getByText("12 flashcards")).toBeInTheDocument();
    expect(screen.getByText("8-question quiz")).toBeInTheDocument();
  });
});
