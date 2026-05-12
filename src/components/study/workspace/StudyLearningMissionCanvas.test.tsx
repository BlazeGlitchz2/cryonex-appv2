import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { StudyLearningMissionCanvas } from "./StudyLearningMissionCanvas";
import i18n from "@/lib/i18n";

const flushEffects = async () => {
  await act(async () => {
    vi.runOnlyPendingTimers();
    await Promise.resolve();
  });
};

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
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(async () => {
    vi.useRealTimers();
    await i18n.changeLanguage("en");
  });

  it("renders the learning mission, real-life example, recall prompt, and source evidence", async () => {
    await act(async () => {
      render(<StudyLearningMissionCanvas {...baseProps} />);
    });
    await flushEffects();

    expect(screen.getByText("Today's learning mission")).toBeInTheDocument();
    expect(screen.getByText("Understand")).toBeInTheDocument();
    expect(screen.getByText("Example")).toBeInTheDocument();
    expect(screen.getAllByText("Recall").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Exam check").length).toBeGreaterThan(0);
    expect(screen.getByText(/Airport security/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dehydration/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Membrane Transport")).toBeInTheDocument();
  });

  it("opens the primary recommended learning action", async () => {
    const onSelectTab = vi.fn();

    await act(async () => {
      render(
        <StudyLearningMissionCanvas {...baseProps} onSelectTab={onSelectTab} />,
      );
    });
    await flushEffects();

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Create active recall cards/i }),
      );
    });
    await flushEffects();

    expect(onSelectTab).toHaveBeenCalledWith("flashcards");
  });

  it("treats the summary reader as the primary workspace surface", async () => {
    await act(async () => {
      render(<StudyLearningMissionCanvas {...baseProps} />);
    });
    await flushEffects();

    const summaryReader = screen.getByTestId("study-summary-primary");

    expect(summaryReader).toHaveAttribute(
      "aria-label",
      "Primary summary reader",
    );
    expect(summaryReader).toHaveClass("lg:col-span-12");
  });

  it("mirrors the workspace chrome when the app language is Arabic", async () => {
    await i18n.changeLanguage("ar");

    await act(async () => {
      render(
        <StudyLearningMissionCanvas
          {...baseProps}
          user={{ isRTL: false, preferredLanguage: "en" }}
        />,
      );
    });
    await flushEffects();

    expect(screen.getByTestId("study-learning-mission-canvas")).toHaveAttribute(
      "dir",
      "rtl",
    );
    expect(screen.getByText("مهمة التعلم اليوم")).toBeInTheDocument();
  });

  it("uses the app language setting over stale user language fields", async () => {
    await i18n.changeLanguage("en");

    await act(async () => {
      render(
        <StudyLearningMissionCanvas
          {...baseProps}
          user={{ isRTL: true, preferredLanguage: "ar" }}
        />,
      );
    });
    await flushEffects();

    expect(screen.getByTestId("study-learning-mission-canvas")).toHaveAttribute(
      "dir",
      "ltr",
    );
    expect(screen.getByText("Today's learning mission")).toBeInTheDocument();
    expect(screen.queryByText("مهمة التعلم اليوم")).not.toBeInTheDocument();
  });

});
