import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SourceGroundingPanel } from "./SourceGroundingPanel";

describe("SourceGroundingPanel", () => {
  it("explains that grounding is scoped to the selected source material", () => {
    render(
      <SourceGroundingPanel
        summary="Photosynthesis turns light energy into chemical energy."
        sourceText="Photosynthesis turns light energy into chemical energy in plants."
      />,
    );

    expect(screen.getByText("Selected-source scope")).toBeInTheDocument();
    expect(
      screen.getByText(/Only the material currently selected for this study session/i),
    ).toBeInTheDocument();
  });
});
