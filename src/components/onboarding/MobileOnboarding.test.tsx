import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MobileOnboarding, mobileOnboardingSlides } from "./MobileOnboarding";

const originalInnerWidth = window.innerWidth;

function setMobileViewport() {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 390,
  });
}

describe("MobileOnboarding", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    setMobileViewport();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("teaches selected-source scope and tunable review on mobile assistant routes", async () => {
    render(
      <MemoryRouter initialEntries={["/app"]}>
        <MobileOnboarding />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(450);
    });

    expect(
      screen.getAllByText(/select only the sources you need/i).length,
    ).toBeGreaterThan(0);

    const reviewSlide = mobileOnboardingSlides.find(
      (slide) => slide.id === "review",
    );

    expect(reviewSlide?.bullets).toContain("Choose card count");
    expect(reviewSlide?.bullets).toContain("Set quiz difficulty");
  });

  it("exposes mobile onboarding controls with stable accessible names and current slide state", async () => {
    render(
      <MemoryRouter initialEntries={["/app"]}>
        <MobileOnboarding />
      </MemoryRouter>,
    );

    await act(async () => {
      vi.advanceTimersByTime(450);
    });

    expect(
      screen.getByRole("button", { name: /skip mobile onboarding/i }),
    ).toBeInTheDocument();

    const currentSlideDot = screen.getByRole("button", {
      name: /slide 1: start with the sources that matter/i,
    });

    expect(currentSlideDot).toHaveAttribute("aria-current", "step");
    expect(
      screen.getByRole("button", { name: /continue mobile onboarding/i }),
    ).toBeInTheDocument();
  });
});
