import { describe, expect, it } from "vitest";

import {
  determineAutoChatModel,
  getOpenAiCompatConfig,
  getModelFallbackChain,
} from "./aiRouting";

describe("aiRouting", () => {
  it("uses Pollinations gemini-fast as the default Auto chat model", () => {
    expect(determineAutoChatModel("explain photosynthesis simply", false)).toBe(
      "pollinations/gemini-fast",
    );
  });

  it("routes current factual queries to the Pollinations search model", () => {
    expect(
      determineAutoChatModel("who is the current supply chain director of Sadara", false),
    ).toBe("pollinations/gemini-search");
  });

  it("routes ambiguous high-stakes analysis to a stronger Pollinations Gemini model", () => {
    expect(
      determineAutoChatModel(
        "I am confused, compare these two legal options and tell me which risk matters most",
        false,
      ),
    ).toBe("pollinations/gemini-large");
  });

  it("keeps Pollinations gemini-fast on the current API model id", () => {
    const config = getOpenAiCompatConfig("pollinations/gemini-fast");

    expect(config.baseURL).toBe("https://gen.pollinations.ai/v1");
    expect(config.model).toBe("gemini-fast");
  });

  it("puts Pollinations first in general chat fallback order", () => {
    expect(getModelFallbackChain("chat-general", "pollinations/gemini-fast").slice(0, 3)).toEqual([
      "pollinations/gemini-fast",
      "pollinations/gemini-search",
      "pollinations/gemini-large",
    ]);
  });
});
