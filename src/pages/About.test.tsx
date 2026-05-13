import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";

import About from "./About";

describe("About", () => {
  it("keeps the page positioned around source-grounded study workflows", () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/source-grounded study workspace/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/find and import/i)).toBeInTheDocument();
    expect(screen.getByText(/offline-ready review/i)).toBeInTheDocument();
    expect(screen.getByText(/choose your source set/i)).toBeInTheDocument();
    expect(screen.getByText(/create active recall/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /get started/i })).toHaveAttribute(
      "href",
      "/login",
    );

    expect(screen.queryByText(/image generation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/video generation/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/sora 2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/choose your model/i)).not.toBeInTheDocument();
  });
});
