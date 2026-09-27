import { describe, expect, it } from "vitest";

import { shouldLinkAffiliateReferral } from "./referralLinking";

describe("shouldLinkAffiliateReferral", () => {
  it("allows a first-time referral for another user's affiliate", () => {
    expect(
      shouldLinkAffiliateReferral(
        { _id: "user_1", referredBy: null },
        { _id: "affiliate_1", userId: "user_2" },
      ),
    ).toBe(true);
  });

  it("blocks self-referrals", () => {
    expect(
      shouldLinkAffiliateReferral(
        { _id: "user_1", referredBy: null },
        { _id: "affiliate_1", userId: "user_1" },
      ),
    ).toBe(false);
  });

  it("blocks repeated referral linking once a user is already referred", () => {
    expect(
      shouldLinkAffiliateReferral(
        { _id: "user_1", referredBy: "user_9" },
        { _id: "affiliate_1", userId: "user_2" },
      ),
    ).toBe(false);
  });

  it("blocks missing affiliate records", () => {
    expect(
      shouldLinkAffiliateReferral({ _id: "user_1", referredBy: null }, null),
    ).toBe(false);
  });
});
