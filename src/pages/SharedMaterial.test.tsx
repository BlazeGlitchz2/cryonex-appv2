import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SharedMaterial from "./SharedMaterial";

const useQueryMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    viral: {
      getPublicMaterial: "viral:getPublicMaterial",
    },
  },
}));

describe("SharedMaterial", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
  });

  it("surfaces active recall payloads on public study pack shares", () => {
    useQueryMock.mockReturnValue({
      _id: "pack_123",
      sourceDocId: "doc_123",
      title: "Cell Transport Review",
      description: "Source-grounded review for membrane transport.",
      packStyle: "Exam review",
      estimatedMinutes: 28,
      flashcardsCount: 12,
      quizQuestionsCount: 8,
      summary: {
        simple: "## Core idea\nCells regulate movement across membranes.",
      },
      keyPoints: ["Diffusion follows concentration gradients."],
      practicePlan: ["Explain osmosis in your own words."],
    });

    render(
      <MemoryRouter initialEntries={["/share/pack/cell-transport"]}>
        <Routes>
          <Route path="/share/:type/:shareId" element={<SharedMaterial />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/study kit/i)).toBeInTheDocument();
    expect(screen.getByText(/12 flashcards/i)).toBeInTheDocument();
    expect(screen.getByText(/8 quiz questions/i)).toBeInTheDocument();
    expect(screen.getByText(/28 min plan/i)).toBeInTheDocument();
    expect(screen.getByText(/source-grounded summary/i)).toBeInTheDocument();
  });
});
