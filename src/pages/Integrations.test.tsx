import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import type { RequestForQueries } from "convex/react";

import IntegrationsPage from "./Integrations";

const mocks = vi.hoisted(() => ({
  auth: { isAuthenticated: false, isLoading: false },
  queries: vi.fn(),
  realQueries: false,
}));

vi.mock("@/hooks/use-auth", () => ({ useAuth: () => mocks.auth }));
vi.mock("convex/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("convex/react")>();
  return {
    ...actual,
    useQueries: (queries: RequestForQueries) =>
      mocks.realQueries ? actual.useQueries(queries) : mocks.queries(queries),
  };
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <IntegrationsPage />
    </MemoryRouter>,
  );

describe("Integrations connection status", () => {
  beforeEach(() => {
    mocks.auth = { isAuthenticated: false, isLoading: false };
    mocks.realQueries = false;
    mocks.queries.mockReset().mockReturnValue({});
  });

  it("renders a skipped status request with the actual reactive query hook", async () => {
    mocks.realQueries = true;
    const client = new ConvexReactClient("https://ui-check.convex.cloud");
    const page = render(
      <MemoryRouter>
        <ConvexProvider client={client}>
          <IntegrationsPage />
        </ConvexProvider>
      </MemoryRouter>,
    );
    try {
      expect(
        screen.getByText("Sign in to view connection status"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Your AI connections" }),
      ).toBeInTheDocument();
    } finally {
      page.unmount();
      await client.close();
    }
  });

  it("keeps guest navigation usable without making an authenticated status request", () => {
    renderPage();

    expect(mocks.queries).toHaveBeenCalledWith({});
    expect(
      screen.getByText("Sign in to view connection status"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Disconnected")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your AI connections" }),
    ).toBeInTheDocument();
  });

  it("keeps connection details usable when the status service fails", () => {
    mocks.auth = { isAuthenticated: true, isLoading: false };
    mocks.queries.mockReturnValue({
      providerStatus: new Error("Status service failed"),
    });
    renderPage();

    expect(
      screen.getByText("Connection status unavailable"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Disconnected")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Advanced Providers"));
    fireEvent.keyDown(
      screen.getByRole("button", { name: "View Groq connection details" }),
      { key: "Enter" },
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Configure Groq/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the returned provider status for signed-in users", () => {
    mocks.auth = { isAuthenticated: true, isLoading: false };
    mocks.queries.mockReturnValue({
      providerStatus: {
        providers: Object.fromEntries(
          [
            "groq",
            "sambanova",
            "cerebras",
            "google",
            "openrouter",
            "huggingface",
            "pollinations",
            "mistral",
          ].map((name) => [name, { configured: name === "groq", env: "" }]),
        ),
      },
    });
    renderPage();

    expect(mocks.queries).toHaveBeenCalledWith({
      providerStatus: expect.objectContaining({ args: {} }),
    });
    expect(screen.getByText("1 connected")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Advanced Providers"));
    expect(screen.getByText("Connected")).toBeInTheDocument();
    expect(screen.queryByText("Checking…")).not.toBeInTheDocument();
  });
});
