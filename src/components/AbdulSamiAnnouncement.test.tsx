import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";

import { AbdulSamiAnnouncement } from "./AbdulSamiAnnouncement";

describe("AbdulSamiAnnouncement", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the Co-CEO announcement once and remembers dismissal", () => {
    const { unmount } = render(<AbdulSamiAnnouncement />);

    expect(
      screen.getByText("Muhammad Abdul Sami is now Cryonex Co-CEO"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /got it/i }));
    expect(
      screen.queryByText("Muhammad Abdul Sami is now Cryonex Co-CEO"),
    ).not.toBeInTheDocument();

    unmount();
    render(<AbdulSamiAnnouncement />);

    expect(
      screen.queryByText("Muhammad Abdul Sami is now Cryonex Co-CEO"),
    ).not.toBeInTheDocument();
  });
});
