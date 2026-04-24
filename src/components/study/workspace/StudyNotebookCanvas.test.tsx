import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudyNotebookCanvas } from "./StudyNotebookCanvas";
import type { StudyWorkspaceSection } from "./study-workspace-sections";

describe("StudyNotebookCanvas", () => {
  it("renders notebook section headings and tool preview labels", () => {
    const sections: StudyWorkspaceSection[] = [
      {
        id: "overview",
        title: "Overview",
        description: "A quick brief.",
        content: "Summary",
        items: [{ label: "Document", value: "Biology Notes", status: "available" }],
      },
      {
        id: "study-tools",
        title: "Study Tools",
        description: "Power tools nearby.",
        content: "Flashcards",
        items: [{ label: "Flashcards", value: "3 ready", status: "available" }],
      },
    ];

    render(
      <StudyNotebookCanvas
        title="Biology Notes"
        sections={sections}
        activeTool="chat"
        onOpenTool={() => {}}
      />,
    );

    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Study Tools")).toBeInTheDocument();
    expect(screen.getAllByText("Flashcards").length).toBeGreaterThan(0);
  });

  it("opens tools from the notebook action row", () => {
    const sections: StudyWorkspaceSection[] = [
      {
        id: "overview",
        title: "Overview",
        description: "A quick brief.",
        content: "Summary",
        items: [],
      },
    ];
    const openedTools: string[] = [];

    render(
      <StudyNotebookCanvas
        title="Biology Notes"
        sections={sections}
        activeTool="chat"
        onOpenTool={(tool) => openedTools.push(tool)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Quiz" }));

    expect(openedTools).toEqual(["quizzes"]);
  });
});
