export type RouteWarmupTarget = "app-layout" | "study-dashboard";

type WarmupBudgetSignals = {
  saveData?: boolean;
  effectiveType?: string;
  deviceMemoryGb?: number;
  hardwareConcurrency?: number;
};

export function hasLandingWarmupBudget({
  saveData,
  effectiveType,
  deviceMemoryGb,
  hardwareConcurrency,
}: WarmupBudgetSignals): boolean {
  if (saveData) {
    return false;
  }

  if (effectiveType === "2g" || effectiveType === "slow-2g") {
    return false;
  }

  if (typeof deviceMemoryGb === "number" && deviceMemoryGb < 4) {
    return false;
  }

  if (typeof hardwareConcurrency === "number" && hardwareConcurrency < 4) {
    return false;
  }

  return true;
}

export function getLandingWarmupTargets({
  shouldOpenStudyShell,
  shouldReduceWarmup,
  hasWarmupBudget,
}: {
  shouldOpenStudyShell: boolean;
  shouldReduceWarmup: boolean;
  hasWarmupBudget: boolean;
}): RouteWarmupTarget[] {
  if (shouldOpenStudyShell || shouldReduceWarmup || !hasWarmupBudget) {
    return [];
  }

  return ["app-layout", "study-dashboard"];
}
