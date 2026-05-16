import { describe, expect, it } from "vitest";

import {
  buildMobileDashboardBrief,
  buildMobileLearnerProfile,
  buildMobileWorkspaceCoach,
  buildMobileWorkspaceBrief,
  buildMobileWorkspaceToolBriefs,
} from "./mobile-personalization";

describe("mobile personalization helpers", () => {
  it("builds a learner profile from subject, exam, and pace signals", () => {
    const profile = buildMobileLearnerProfile({
      country: "ksa",
      curriculumTrack: "IGCSE",
      name: "Amina Noor",
      schoolId: "riyadh-alpha",
      studyPace: "fast sprint",
      targetExams: ["biology paper 2"],
      targetSubjects: ["biology"],
    });

    expect(profile.firstName).toBe("Amina");
    expect(profile.focusSubject).toBe("Biology");
    expect(profile.checkpoint).toBe("Biology Paper 2");
    expect(profile.paceLabel).toBe("Sprint pace");
    expect(profile.chips).toEqual(["Ksa", "IGCSE", "Riyadh Alpha"]);
  });

  it("prioritizes due recall on the mobile dashboard when flashcards are waiting", () => {
    const brief = buildMobileDashboardBrief({
      dailyGoals: [{ isCompleted: false }],
      recommendations: {
        dueFlashcardsCount: 12,
      },
      recentMaterials: [{ title: "Cells" }, { title: "Photosynthesis" }],
      searchQuery: "cell respiration",
      user: {
        name: "Amina Noor",
        studyPace: "fast",
        targetSubjects: ["biology"],
        targetExams: ["final exam"],
      },
    });

    expect(brief.primaryAction).toMatchObject({
      id: "flashcards",
      label: "Review 12 cards",
    });
    expect(brief.coachPrompt).toContain("cell respiration");
    expect(brief.secondaryAction.label).toBe("1 goal still open");
  });

  it("summarizes the selected mobile source set for grounded review", () => {
    const brief = buildMobileDashboardBrief({
      recentMaterials: [
        { title: "Cell Transport", type: "pdf" },
        { title: "Respiration Lab", type: "text" },
        { title: "Enzyme Notes", type: "pdf" },
      ],
      user: {
        targetSubjects: ["biology"],
      },
    });

    expect(brief.sourceSet).toMatchObject({
      label: "Selected source set",
      value: "3 sources ready",
    });
    expect(brief.sourceSet.detail).toContain("Cell Transport");
    expect(brief.sourceSet.detail).toContain("Respiration Lab");
    expect(brief.sourceSet.detail).toContain("Enzyme Notes");
  });

  it("recommends upload when the learner has no recent source yet", () => {
    const brief = buildMobileDashboardBrief({
      recentMaterials: [],
      user: {
        curriculum: "IB Maths",
        name: "Noor",
      },
    });

    expect(brief.primaryAction.id).toBe("upload");
    expect(brief.insightCards[0].value).toBe("IB Maths");
    expect(brief.sourceSet.value).toBe("No sources selected");
  });

  it("recommends structure-first mobile tools for dense sources", () => {
    const brief = buildMobileWorkspaceBrief({
      hasSummary: true,
      materialType: "pdf",
      sourceTitle: "Forces and Motion",
      sourceWordCount: 2450,
      user: {
        curriculum: "GCSE Physics",
        preferredLanguage: "English",
      },
    });

    expect(brief.recommendedToolId).toBe("mindmap");
    expect(brief.focusLabel).toBe("2,450 words grounded");
  });

  it("produces tool briefs and coach prompts with mobile-ready metrics", () => {
    const briefs = buildMobileWorkspaceToolBriefs({
      sourceTitle: "Forces and Motion",
      sourceWordCount: 920,
      studyTimeSeconds: 780,
      user: {
        studyPace: "steady",
        targetExams: ["midterm"],
        targetSubjects: ["physics"],
        preferredLanguage: "English",
      },
    });
    const coach = buildMobileWorkspaceCoach({
      activeToolLabel: "Flashcards",
      sourceTitle: "Forces and Motion",
      user: {
        studyPace: "steady",
        targetExams: ["midterm"],
        targetSubjects: ["physics"],
      },
    });

    expect(briefs.summary.metric).toBe("920 words");
    expect(briefs.gaps.metric).toBe("13 min live");
    expect(briefs.notes.description.toLowerCase()).toContain("english");
    expect(coach.title).toBe("Flashcards with Physics");
    expect(coach.prompt).toContain("mobile study session");
  });
});
