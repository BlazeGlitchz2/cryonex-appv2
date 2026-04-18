import { describe, expect, it } from "vitest";

import { buildNativePrompt, getNativeModelSupportProfile } from "./native-llm";
import { getEffectiveOfflineModelTier } from "./offline-model-state";

describe("native llm helpers", () => {
  it("builds a compact transcript from recent messages", () => {
    const prompt = buildNativePrompt([
      { role: "system", content: "Answer like a tutor." },
      { role: "user", content: "What is osmosis?" },
      { role: "assistant", content: "Movement of water across a membrane." },
      { role: "user", content: "Explain it simply." },
    ]);

    expect(prompt).toContain("System instructions:\nAnswer like a tutor.");
    expect(prompt).toContain("User: What is osmosis?");
    expect(prompt).toContain("Assistant: Movement of water across a membrane.");
    expect(prompt).toContain("User: Explain it simply.");
    expect(prompt).toContain("Respond to the final user request.");
  });

  it("limits transcript size to recent messages and trims blanks", () => {
    const prompt = buildNativePrompt([
      { role: "user", content: "one" },
      { role: "assistant", content: "two" },
      { role: "user", content: "three" },
      { role: "assistant", content: "four" },
      { role: "user", content: "five" },
      { role: "assistant", content: "six" },
      { role: "user", content: "   " },
      { role: "user", content: "seven" },
    ]);

    expect(prompt).not.toContain("one");
    expect(prompt).not.toContain("two");
    expect(prompt).toContain("User: three");
    expect(prompt).toContain("Assistant: six");
    expect(prompt).toContain("User: seven");
  });

  it("returns explicit support rules by platform", () => {
    expect(getNativeModelSupportProfile("android")).toMatchObject({
      canDownloadCustomModel: true,
      supportsOfflineChat: true,
    });

    expect(getNativeModelSupportProfile("ios")).toMatchObject({
      canDownloadCustomModel: false,
      supportsOfflineChat: true,
    });
  });

  it("falls back to the cached tier when no new native tier is requested", () => {
    expect(getEffectiveOfflineModelTier(undefined, "small", "tiny")).toBe(
      "small",
    );
    expect(getEffectiveOfflineModelTier(undefined, null, "tiny")).toBe("tiny");
  });
});
