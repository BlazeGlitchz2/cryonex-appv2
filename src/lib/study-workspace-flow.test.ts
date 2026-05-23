import { describe, expect, it } from "vitest";

import { buildStudyWorkspaceFlow } from "./study-workspace-flow";

describe("buildStudyWorkspaceFlow", () => {
  it("prefers a calmer summary lane when Student OS detects fatigue", () => {
    const flow = buildStudyWorkspaceFlow({
      hasSummary: true,
      osState: { flowState: "fatigue" },
      recommendations: {
        dueFlashcardsCount: 8,
        primaryAction: {
          action: "open_flashcards",
          description: "Review due cards now.",
          title: "Review due cards",
        },
      },
      sourceWordCount: 1800,
      sourceTitle: "Cell Respiration",
    });

    expect(flow.targetTab).toBe("summary");
    expect(flow.label).toContain("Simple");
  });

  it("maps recommendation actions into concrete workspace tabs", () => {
    const flow = buildStudyWorkspaceFlow({
      hasSummary: true,
      recommendations: {
        nextActions: [
          {
            action: "generate_flashcards",
            description: "Turn this source into quick recall reps.",
            title: "Build flashcards",
          },
        ],
      },
      sourceWordCount: 1200,
      sourceTitle: "Forces and Motion",
    });

    expect(flow.targetTab).toBe("flashcards");
    expect(flow.label).toBe("Build flashcards");
  });

  it("moves a summarized source into active recall before chat fallback", () => {
    const flow = buildStudyWorkspaceFlow({
      hasSummary: true,
      sourceWordCount: 900,
      sourceTitle: "Cell Transport",
      flashcardsCount: 0,
      reviewedFlashcardsCount: 0,
      masteredFlashcardsCount: 0,
      quizzesCount: 0,
      quizQuestionCount: 0,
    });

    expect(flow.targetTab).toBe("flashcards");
    expect(flow.label).toBe("Create active recall cards");
    expect(flow.badge).toBe("Retrieval practice");
  });
});
