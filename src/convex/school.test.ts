import { describe, expect, it } from "vitest";

import { canViewProfile } from "./school";

describe("canViewProfile", () => {
  it("requires viewer opt-in for school-visible profiles", () => {
    const viewer = { _id: "viewer-1", schoolId: "school-a", schoolNetworkOptIn: false };
    const profileUser = {
      _id: "owner-1",
      schoolId: "school-a",
      schoolNetworkOptIn: true,
      profileVisibility: "school",
    };

    expect(canViewProfile(viewer, profileUser)).toBe(false);
  });

  it("allows opted-in classmates to view school-visible profiles", () => {
    const viewer = { _id: "viewer-1", schoolId: "school-a", schoolNetworkOptIn: true };
    const profileUser = {
      _id: "owner-1",
      schoolId: "school-a",
      schoolNetworkOptIn: true,
      profileVisibility: "school",
    };

    expect(canViewProfile(viewer, profileUser)).toBe(true);
  });
});
