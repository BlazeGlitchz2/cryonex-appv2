import { describe, expect, it } from "vitest";

import { buildStudyWorkspaceSections } from "./study-workspace-sections";

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
});
