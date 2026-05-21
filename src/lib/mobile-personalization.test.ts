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

  it("turns dashboard state into guided starter prompts", () => {
    const brief = buildMobileDashboardBrief({
      dailyGoals: [{ isCompleted: false }],
      recommendations: {
        dueFlashcardsCount: 7,
      },
      recentMaterials: [{ title: "Cell Transport", type: "pdf" }],
      searchQuery: "osmosis",
      user: {
        studyPace: "fast",
        targetExams: ["biology final"],
        targetSubjects: ["biology"],
      },
    });

    expect(brief.starterPrompts).toHaveLength(3);
    expect(brief.starterPrompts[0]).toContain("osmosis");
    expect(brief.starterPrompts[0]).toContain("diagnostic question");
    expect(brief.starterPrompts[1]).toContain("7 due flashcards");
    expect(brief.starterPrompts[2]).toContain("Cell Transport");
  });

  it("pairs long starter prompts with short mobile chip labels", () => {
    const brief = buildMobileDashboardBrief({
      dailyGoals: [{ isCompleted: false }],
      recommendations: {
        dueFlashcardsCount: 7,
      },
      recentMaterials: [{ title: "Cell Transport", type: "pdf" }],
      searchQuery: "osmosis",
      user: {
        studyPace: "fast",
        targetExams: ["biology final"],
        targetSubjects: ["biology"],
      },
    });

    expect(brief.starterPromptActions).toEqual([
      {
        label: "Ask a diagnostic",
        prompt: brief.starterPrompts[0],
      },
      {
        label: "Clear 7 cards",
        prompt: brief.starterPrompts[1],
      },
      {
        label: "Use Cell Transport",
        prompt: brief.starterPrompts[2],
      },
    ]);
    expect(
      brief.starterPromptActions.every((action) => action.label.length <= 22),
    ).toBe(true);
  });

  it("summarizes grounded source readiness from recommendations", () => {
    const brief = buildMobileDashboardBrief({
      recommendations: {
        dueFlashcardsCount: 0,
        groundedStudy: {
          averageReadiness: 50,
          materialsNeedingAssets: 2,
          totalRecentMaterials: 3,
        },
        primaryAction: {
          title: "Ground Cell Transport",
        },
      },
      recentMaterials: [{ title: "Cell Transport", type: "pdf" }],
      user: {
        targetSubjects: ["biology"],
      },
    });

    expect(brief.groundingStatus).toEqual({
      label: "Grounded readiness",
      value: "50% ready",
      detail: "2 of 3 sources still need study assets.",
      tone: "needs-work",
    });
  });

  it("builds a short mobile study plan from recall, source readiness, and goals", () => {
    const brief = buildMobileDashboardBrief({
      dailyGoals: [{ isCompleted: false }, { isCompleted: true }],
      recommendations: {
        dueFlashcardsCount: 8,
        groundedStudy: {
          averageReadiness: 60,
          materialsNeedingAssets: 1,
          totalRecentMaterials: 2,
        },
      },
      recentMaterials: [{ title: "Cell Transport", type: "pdf" }],
      user: {
        studyPace: "steady",
        targetSubjects: ["biology"],
      },
    });

    expect(brief.microSessionPlan).toEqual({
      label: "Next 10 minutes",
      title: "Clear recall, then finish the source setup",
      steps: [
        "Review 8 due cards.",
        "Build missing assets for 1 source.",
        "Close 1 open goal.",
      ],
      cta: "Start with recall",
    });
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
    expect(coach.prompt).toContain("Ask me one diagnostic question first");
    expect(coach.prompt).toContain("check my understanding");
    expect(coach.prompt).toContain("mobile study session");
  });
});
