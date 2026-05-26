import { describe, expect, it } from "vitest";

import {
  buildStudyWorkspaceLearningPlan,
  buildStudyWorkspaceSections,
} from "./study-workspace-sections";

describe("buildStudyWorkspaceSections", () => {
  it("returns overview, notes, tools, and evidence sections in notebook order", () => {
    const sections = buildStudyWorkspaceSections({
      summary: "Summary",
      transcriptText: "Cell biology transcript",
      flashcardCount: 3,
      quizCount: 2,
      title: "Biology Notes",
    });

    expect(sections.map((section) => section.id)).toEqual([
      "overview",
      "key-ideas",
      "notes",
      "study-tools",
      "evidence",
    ]);
  });

  it("marks tool previews as unavailable when counts are empty", () => {
    const sections = buildStudyWorkspaceSections({
      summary: "",
      transcriptText: "",
      flashcardCount: 0,
      quizCount: 0,
      title: "Empty Notes",
    });

    const tools = sections.find((section) => section.id === "study-tools");
    expect(tools?.items.map((item) => item.status)).toEqual([
      "unavailable",
      "unavailable",
      "available",
      "available",
    ]);
  });

  it("builds a learning mission with real-life examples and active recall checkpoints", () => {
    const plan = buildStudyWorkspaceLearningPlan({
      title: "Cell Structure",
      summary:
        "# Cell Membrane\nThe cell membrane controls movement in and out of cells.\n\n## Mitochondria\nMitochondria produce ATP for the cell.",
      transcriptText:
        "During dehydration, cells lose water by osmosis. Membrane transport controls what enters and leaves the cell. Mitochondria produce ATP, but cells still need glucose and oxygen.",
      flashcardCount: 0,
      reviewedFlashcardCount: 0,
      masteredFlashcardCount: 0,
      quizCount: 0,
      quizQuestionCount: 0,
      sourceSections: [
        {
          id: "membrane",
          title: "Membrane Transport",
          text: "Membranes regulate water, ions, glucose, and waste in everyday situations like dehydration.",
        },
      ],
    });

    expect(plan.missionSteps.map((step) => step.id)).toEqual([
      "understand",
      "example",
      "recall",
      "exam-check",
    ]);
    expect(plan.realLifeExamples[0].title.toLowerCase()).toContain(
      "airport security",
    );
    expect(plan.realLifeExamples[0].situation.toLowerCase()).toContain(
      "dehydration",
    );
    expect(plan.recallPrompts[0].prompt.toLowerCase()).toContain(
      "cell membrane",
    );
    expect(plan.examChecks[0].question.toLowerCase()).toContain("dehydration");
    expect(plan.sourceEvidence[0].sectionTitle).toBe("Membrane Transport");
    expect(plan.primaryAction.targetTab).toBe("flashcards");
  });

  it("moves learners toward weak-spot repair after review and quiz assets exist", () => {
    const plan = buildStudyWorkspaceLearningPlan({
      title: "Cell Structure",
      summary: "Mitochondria produce ATP. Ribosomes synthesize proteins.",
      transcriptText:
        "Mitochondria release energy from glucose. Ribosomes synthesize proteins using instructions from RNA.",
      flashcardCount: 8,
      reviewedFlashcardCount: 8,
      masteredFlashcardCount: 5,
      quizCount: 1,
      quizQuestionCount: 6,
    });

    expect(plan.primaryAction.targetTab).toBe("gaps");
    expect(plan.weakSpots.map((spot) => spot.label)).toContain(
      "Mitochondria misconception",
    );
    expect(plan.missionSteps.find((step) => step.id === "recall")?.status).toBe(
      "done",
    );
    expect(plan.missionSteps.find((step) => step.id === "exam-check")?.status).toBe(
      "current",
    );
  });

  it("keeps source evidence visible when only a summary is available", () => {
    const plan = buildStudyWorkspaceLearningPlan({
      title: "Photosynthesis Notes",
      summary:
        "Photosynthesis converts light energy into chemical energy. Chlorophyll captures light while carbon dioxide and water become glucose and oxygen.",
      transcriptText: "",
      flashcardCount: 0,
      reviewedFlashcardCount: 0,
      masteredFlashcardCount: 0,
      quizCount: 0,
      quizQuestionCount: 0,
    });

    expect(plan.sourceEvidence).toEqual([
      {
        id: "summary",
        sectionTitle: "Photosynthesis Notes summary",
        snippet:
          "Photosynthesis converts light energy into chemical energy. Chlorophyll captures light while carbon dioxide and water become glucose and oxygen.",
      },
    ]);
  });
});
