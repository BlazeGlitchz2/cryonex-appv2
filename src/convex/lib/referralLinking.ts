export type ReferralUser = {
  _id: string;
  referredBy?: string | null;
};

export type ReferralAffiliate = {
  _id: string;
  userId: string;
};

export function shouldLinkAffiliateReferral(
  user: ReferralUser,
  affiliate: ReferralAffiliate | null,
) {
  if (!affiliate) {
    return false;
  }

  if (affiliate.userId === user._id) {
    return false;
  }

  if (user.referredBy) {
    return false;
  }

  return true;
}
