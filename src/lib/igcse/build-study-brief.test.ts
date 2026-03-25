import { describe, expect, it } from "vitest";
import { buildIgcseMaterialTags, buildIgcseStudyBrief } from "@/lib/igcse/build-study-brief";
import { getIgcseTrack } from "@/lib/igcse/catalog";
import type { IgcsePlanDraft } from "@/lib/igcse/types";

describe("buildIgcseStudyBrief", () => {
  it("includes board, page ranges, and paper focus from the selected resources", () => {
    const track = getIgcseTrack("cambridge", "biology");
    const book = track.books[0];
    const paper = track.pastPapers[0];

    const plan: IgcsePlanDraft = {
      title: "Cambridge Biology sprint",
      boardId: track.board.id,
      boardLabel: track.board.label,
      subjectId: track.subject.id,
      subjectLabel: track.subject.label,
      focusTopic: "Cell transport before Paper 4",
      notes: "Keep the summary compact and exam-ready.",
      selectedTopicIds: ["cell-biology"],
      selectedTopicTitles: ["Cell biology and transport"],
      weakTopicIds: ["practical-biology"],
      weakTopicTitles: ["Practical skills and investigations"],
      selectedTemplateIds: [track.templates[0].id],
      selectedTemplateTitles: [track.templates[0].title],
      targetOutcomes: track.templates[0].targetOutcomes,
      totalEstimatedMinutes: 70,
      selectedBooks: [
        {
          resourceId: book.id,
          title: book.title,
          publisher: book.publisher,
          edition: book.edition,
          pageCount: book.pageCount,
          topicIds: book.topicIds,
          startPage: 18,
          endPage: 64,
          summaryFocus: "Prioritize osmosis comparisons and key definitions.",
          selectedPresetId: "foundations",
        },
      ],
      selectedPastPapers: [
        {
          resourceId: paper.id,
          title: paper.title,
          paperCode: paper.paperCode,
          sessionLabel: paper.sessionLabel,
          component: paper.component,
          duration: paper.duration,
          topicIds: paper.topicIds,
          questionFocus: paper.questionFocus,
          markSchemeFocus: paper.markSchemeFocus,
        },
      ],
    };

    const brief = buildIgcseStudyBrief(plan);

    expect(brief).toContain(track.board.label);
    expect(brief).toContain("Pages: 18-64");
    expect(brief).toContain(paper.paperCode);
    expect(brief).toContain("Weak topics to revisit");
    expect(brief).toContain("mark-scheme");
  });

  it("builds stable tags for the pack pipeline", () => {
    const plan: IgcsePlanDraft = {
      title: "",
      boardId: "edexcel",
      boardLabel: "Pearson Edexcel International GCSE",
      subjectId: "mathematics",
      subjectLabel: "Mathematics",
      focusTopic: "",
      notes: "",
      selectedTopicIds: ["number-algebra", "geometry-trigonometry"],
      selectedTopicTitles: ["Number and algebra", "Geometry and trigonometry"],
      weakTopicIds: ["geometry-trigonometry"],
      weakTopicTitles: ["Geometry and trigonometry"],
      selectedTemplateIds: ["exam-sprint"],
      selectedTemplateTitles: ["48-hour exam sprint"],
      targetOutcomes: ["high-yield sheet"],
      totalEstimatedMinutes: 35,
      selectedBooks: [],
      selectedPastPapers: [],
    };

    expect(buildIgcseMaterialTags(plan)).toEqual([
      "igcse",
      "edexcel",
      "mathematics",
      "number-algebra",
      "geometry-trigonometry",
    ]);
  });
});
