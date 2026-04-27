import { landingContent } from "./landing-content";

describe("landing content", () => {
  it("keeps student-facing positioning credible and specific", () => {
    const allCopy = JSON.stringify(landingContent).toLowerCase();

    expect(allCopy).not.toContain("zero-hallucination");
    expect(allCopy).not.toContain("dominating");
    expect(allCopy).toContain("source-grounded");
    expect(allCopy).toContain("flashcards");
    expect(allCopy).toContain("quizzes");
  });
});
