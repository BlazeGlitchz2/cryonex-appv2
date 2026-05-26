import { describe, expect, it } from "vitest";

import { canSeeShare } from "./social";

describe("canSeeShare", () => {
  it("does not expose private shares to followers", () => {
    const viewer = { _id: "viewer-1", schoolId: "school-a", schoolNetworkOptIn: true };
    const privateShare = { userId: "owner-1", visibility: "private", schoolId: "school-a" };

    expect(canSeeShare(viewer, privateShare, new Set(["owner-1"]))).toBe(false);
  });

  it("still allows school shares for opted-in schoolmates", () => {
    const viewer = { _id: "viewer-1", schoolId: "school-a", schoolNetworkOptIn: true };
    const schoolShare = { userId: "owner-1", visibility: "school", schoolId: "school-a" };

    expect(canSeeShare(viewer, schoolShare, new Set())).toBe(true);
  });
});
