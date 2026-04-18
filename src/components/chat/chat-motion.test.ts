import { describe, expect, it } from "vitest";

import { shouldAnimateMessageEntry } from "./chat-motion";

describe("chat message motion", () => {
  it("skips entrance motion for older messages in long transcripts", () => {
    expect(
      shouldAnimateMessageEntry({
        index: 0,
        isReducedMotion: false,
        isStreaming: false,
        totalMessages: 12,
      }),
    ).toBe(false);
  });

  it("keeps motion for recent or streaming assistant updates", () => {
    expect(
      shouldAnimateMessageEntry({
        index: 9,
        isReducedMotion: false,
        isStreaming: false,
        totalMessages: 12,
      }),
    ).toBe(true);

    expect(
      shouldAnimateMessageEntry({
        index: 0,
        isReducedMotion: false,
        isStreaming: true,
        totalMessages: 1,
      }),
    ).toBe(true);
  });

  it("honors reduced-motion preferences", () => {
    expect(
      shouldAnimateMessageEntry({
        index: 11,
        isReducedMotion: true,
        isStreaming: true,
        totalMessages: 12,
      }),
    ).toBe(false);
  });
});
