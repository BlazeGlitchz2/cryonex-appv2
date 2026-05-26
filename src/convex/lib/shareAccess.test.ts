import { describe, expect, it } from "vitest";

import { canAccessSharedVisibility } from "./shareAccess";

describe("canAccessSharedVisibility", () => {
  it("allows owners and public viewers", () => {
    expect(
      canAccessSharedVisibility(
        { _id: "user-1" },
        { userId: "user-1", visibility: "private" },
      ),
    ).toBe(true);

    expect(
      canAccessSharedVisibility(
        { _id: "user-2" },
        { userId: "user-1", visibility: "public" },
      ),
    ).toBe(true);
  });

  it("requires matching opted-in school membership for school shares", () => {
    const schoolShare = {
      userId: "owner-1",
      visibility: "school",
      schoolId: "school-a",
    };

    expect(
      canAccessSharedVisibility(
        { _id: "viewer-1", schoolId: "school-a", schoolNetworkOptIn: true },
        schoolShare,
      ),
    ).toBe(true);

    expect(
      canAccessSharedVisibility(
        { _id: "viewer-2", schoolId: "school-b", schoolNetworkOptIn: true },
        schoolShare,
      ),
    ).toBe(false);

    expect(
      canAccessSharedVisibility(
        { _id: "viewer-3", schoolId: "school-a", schoolNetworkOptIn: false },
        schoolShare,
      ),
    ).toBe(false);
  });
});
