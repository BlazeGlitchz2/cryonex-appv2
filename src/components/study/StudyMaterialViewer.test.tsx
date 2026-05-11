import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudyMaterialViewer } from "./StudyMaterialViewer";

describe("StudyMaterialViewer", () => {
  it("renders raw HTML as text instead of active markup", () => {
    render(
      <StudyMaterialViewer content={'<div data-testid="unsafe-html">Unsafe</div>'} />,
    );

    expect(screen.queryByTestId("unsafe-html")).not.toBeInTheDocument();
    expect(screen.getByText(/unsafe-html/i)).toBeInTheDocument();
  });

  it("wraps wide markdown tables in a horizontal scroll container", () => {
    const { container } = render(
      <StudyMaterialViewer
        content={`| Very long heading | Another very long heading |
| --- | --- |
| A very long value that should not force the workspace wider | Another long value |`}
      />,
    );

    const tableScroller = container.querySelector("[data-study-markdown-table]");
    expect(tableScroller).toBeInTheDocument();
    expect(tableScroller).toHaveClass("overflow-x-auto");
  });
});
