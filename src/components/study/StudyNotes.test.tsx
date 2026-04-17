import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("convex/react", () => ({
  useAction: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {},
}));

vi.mock("@/components/viral/ShareButton", () => ({
  ShareButton: () => <div>ShareButton</div>,
}));

import { StudyNotes } from "./StudyNotes";

describe("StudyNotes", () => {
  it("shows notebook-style helper copy when rendered with generated content", () => {
    render(<StudyNotes content={"# Title"} title="Biology" />);
    expect(screen.getAllByText(/Notebook/i).length).toBeGreaterThan(0);
  });
});
