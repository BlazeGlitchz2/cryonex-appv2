import { describe, expect, it } from "vitest";

import { matchesChatSearch } from "./chats";

describe("chats search", () => {
  it("matches chat titles by partial normalized text", () => {
    expect(matchesChatSearch("Cryonex Co-CEO information not found", "co ceo")).toBe(true);
    expect(matchesChatSearch("Current Co-CEOs", "current co")).toBe(true);
    expect(matchesChatSearch("Super Bowl 2026 Winner Unknown", "sadara")).toBe(false);
  });
});
