export const CURRENT_ONBOARDING_VERSION = 2;

type OnboardingAwareUser = {
  onboardingCompleted?: boolean | null;
  onboardingVersion?: number | null;
};

export function needsOnboarding(user?: OnboardingAwareUser | null) {
  if (!user) return false;
  if (!user.onboardingCompleted) return true;
  const version = user.onboardingVersion ?? 0;
  return version < CURRENT_ONBOARDING_VERSION;
}
