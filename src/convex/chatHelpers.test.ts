import { afterEach, describe, expect, it, vi } from "vitest";

import { preprocessQuery } from "./chatHelpers";

describe("chatHelpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.POLLINATIONS_API_KEY;
    delete process.env.SERPAPI_API_KEY;
  });

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

  it("uses Pollinations search when SerpAPI is unavailable", async () => {
    process.env.POLLINATIONS_API_KEY = "test-pollinations-key";
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                organic_results: [
                  {
                    title: "Sadara leadership page",
                    link: "https://example.com/sadara",
                    snippet: "Sadara executive leadership source.",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const ctx = {
      runMutation: vi.fn().mockResolvedValue(undefined),
      runQuery: vi.fn().mockResolvedValue(null),
    };

    const result = await preprocessQuery(
      ctx,
      "[Search] who is the current CEO of Sadara",
      "message-id",
      [],
      "pollinations/gemini-fast",
    );

    expect(fetchMock).toHaveBeenCalledWith(
      "https://gen.pollinations.ai/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-pollinations-key",
        }),
      }),
    );
    expect(result.searchQuery).toBe("the current CEO of Sadara");
    expect(result.searchResults?.[0]).toMatchObject({
      title: "Sadara leadership page",
      url: "https://example.com/sadara",
    });
    expect(result.systemInstruction).toContain("SEARCH RESULTS");
  });
});
