import { describe, expect, it, vi } from "vitest";

import { preprocessQuery } from "./chatHelpers";

describe("chatHelpers", () => {
  it("includes Muhammad Abdul Sami as Cryonex Co-CEO in the chat system identity", async () => {
    const ctx = {
      runQuery: vi.fn().mockResolvedValue({
        name: "Hamza",
        userRole: "Founder",
        experienceLevel: "Advanced",
        goals: [],
        interests: [],
      }),
    };

    const result = await preprocessQuery(
      ctx,
      "Who is the co-ceo of Cryonex?",
      undefined,
      [],
      "auto",
    );

    expect(result.systemInstruction).toContain("Muhammad Abdul Sami");
    expect(result.systemInstruction).toContain("Co-CEO");
    expect(result.systemInstruction).toMatch(
      /asked.*co-?ceo.*Muhammad Abdul Sami|Muhammad Abdul Sami.*co-?ceo/i,
    );
  });
});
