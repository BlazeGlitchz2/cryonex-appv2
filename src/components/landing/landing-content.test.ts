import { landingContent } from "./landing-content";

describe("landing content", () => {
  it("keeps student-facing positioning credible and specific", () => {
    const allCopy = JSON.stringify(landingContent).toLowerCase();

    expect(allCopy).not.toContain("zero-hallucination");
    expect(allCopy).not.toContain("dominating");
    expect(allCopy).not.toContain("built-in srs algorithm");
    expect(allCopy).not.toContain("ai that knows your school");
    expect(allCopy).not.toContain("ai that understands");
    expect(allCopy).not.toContain("decentralized");
    expect(allCopy).not.toContain("private study ai");
    expect(allCopy).toContain("source-grounded");
    expect(allCopy).toContain("personalized student os");
    expect(allCopy).toContain("source-aware");
    expect(allCopy).toContain("curriculum-aware");
    expect(allCopy).toContain("focus-aware");
    expect(allCopy).toContain("next best action");
    expect(allCopy).toContain("source selection");
    expect(allCopy).toContain("flashcards");
    expect(allCopy).toContain("practice tests");
    expect(allCopy).toContain("knowledge-gap");
    expect(allCopy).toContain("cited");
  });
});
