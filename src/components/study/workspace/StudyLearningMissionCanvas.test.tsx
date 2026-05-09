import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StudyLearningMissionCanvas } from "./StudyLearningMissionCanvas";

const baseProps = {
  title: "Cell Structure",
  user: null,
  isSimpleMode: false,
  setIsSimpleMode: vi.fn(),
  isDeepFocus: false,
  isEditing: false,
  setIsEditing: vi.fn(),
  summaryContent:
    "# Cell Membrane\nThe cell membrane controls what enters and leaves the cell.\n\n## Mitochondria\nMitochondria produce ATP.",
  setSummaryContent: vi.fn(),
  handleSaveSummary: vi.fn(),
  handleCreatePack: vi.fn(),
  isGeneratingPack: false,
  openImproveDialog: vi.fn(),
  onSelectTab: vi.fn(),
  sourceWordCount: 96,
  transcriptText:
    "During dehydration, cells lose water by osmosis. The cell membrane regulates movement. Mitochondria produce ATP.",
  flashcards: [],
  quizzes: [],
  showPlaybooks: false,
  setShowPlaybooks: vi.fn(),
  showGrounding: false,
  setShowGrounding: vi.fn(),
  applyPlaybookInstruction: vi.fn(),
  sourceSections: [
    {
      id: "membrane",
      title: "Membrane Transport",
      text: "Membranes regulate water and dissolved particles during dehydration.",
    },
  ],
};

describe("StudyLearningMissionCanvas", () => {
  it("renders the learning mission, real-life example, recall prompt, and source evidence", () => {
    render(<StudyLearningMissionCanvas {...baseProps} />);

    expect(screen.getByText("Today's learning mission")).toBeInTheDocument();
    expect(screen.getByText("Understand")).toBeInTheDocument();
    expect(screen.getByText("Example")).toBeInTheDocument();
    expect(screen.getAllByText("Recall").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Exam check").length).toBeGreaterThan(0);
    expect(screen.getByText(/Airport security/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dehydration/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Membrane Transport")).toBeInTheDocument();
  });

  it("opens the primary recommended learning action", () => {
    const onSelectTab = vi.fn();

    render(
      <StudyLearningMissionCanvas {...baseProps} onSelectTab={onSelectTab} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Create active recall cards/i }),
    );

    expect(onSelectTab).toHaveBeenCalledWith("flashcards");
  });
});
