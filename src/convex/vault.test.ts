import { describe, expect, it } from "vitest";

import { canAccessEssayPlayback } from "./vault";

describe("canAccessEssayPlayback", () => {
  it("allows the owning user", () => {
    expect(
      canAccessEssayPlayback("user-1", {
        userId: "user-1",
      }),
    ).toBe(true);
  });

  it("rejects anonymous and non-owner viewers", () => {
    expect(
      canAccessEssayPlayback(null, {
        userId: "user-1",
      }),
    ).toBe(false);

    expect(
      canAccessEssayPlayback("user-2", {
        userId: "user-1",
      }),
    ).toBe(false);
  });
});
