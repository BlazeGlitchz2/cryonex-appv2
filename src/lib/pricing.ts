export type BillingPeriod = "monthly" | "yearly";
export type AppTier = "FREE" | "PLUS" | "PRO";

export interface PlanPriceSet {
  sar: string;
  egp: string;
  usdFallback?: string;
  cadenceLabel: string;
}

export interface PlanAllowance {
  studyCredits: number | null;
  cryoCredits: number | null;
  fairUseStudyCredits?: number | null;
}

export interface PricingPlan {
  id: AppTier;
  name: string;
  eyebrow: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  spotlight?: string;
  badge?: string;
  allowance: PlanAllowance;
  prices: Record<BillingPeriod, PlanPriceSet>;
  features: string[];
  footnote: string;
}

export function getUnifiedCryoCredits(
  allowance?: PlanAllowance | null,
): number {
  return Math.max(
    0,
    Number(allowance?.cryoCredits ?? 0) + Number(allowance?.studyCredits ?? 0),
  );
}

export const PLAN_ALLOWANCES: Record<AppTier, PlanAllowance> = {
  FREE: {
    studyCredits: 50,
    cryoCredits: 50,
    fairUseStudyCredits: null,
  },
  PLUS: {
    studyCredits: 500,
    cryoCredits: 100,
    fairUseStudyCredits: null,
  },
  PRO: {
    studyCredits: 2500,
    cryoCredits: 250,
    fairUseStudyCredits: 2500,
  },
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "FREE",
    name: "Free",
    eyebrow: "Prove the workflow first",
    description:
      "Start without paying and test Cryonex on real class material before you decide whether it deserves a place in your weekly routine.",
    ctaLabel: "Start free",
    ctaHref: "/login",
    badge: "Default",
    allowance: PLAN_ALLOWANCES.FREE,
    prices: {
      monthly: {
        sar: "Free",
        egp: "Free",
        usdFallback: "Free",
        cadenceLabel: "forever",
      },
      yearly: {
        sar: "Free",
        egp: "Free",
        usdFallback: "Free",
        cadenceLabel: "forever",
      },
    },
    features: [
      "Free access to uploads, summaries, flashcards, quizzes, and source-grounded help",
      "Optional refill ads are available if you want more usage without upgrading yet",
      "Best for testing whether Cryonex fits your real study routine",
      "Not designed to cover unlimited heavy generation every day",
    ],
    footnote:
      "Free is meant to prove the workflow with real material, not trap you in upgrade friction.",
  },
  {
    id: "PLUS",
    name: "Plus",
    eyebrow: "Best for steady weekly study",
    description:
      "Built for students who come back several times each week and want enough room to study without constantly thinking about refills.",
    ctaLabel: "Choose Plus",
    ctaHref: "/login",
    spotlight: "Most Popular",
    allowance: PLAN_ALLOWANCES.PLUS,
    prices: {
      monthly: {
        sar: "12 SAR",
        egp: "79 EGP",
        usdFallback: "$2.99",
        cadenceLabel: "per month",
      },
      yearly: {
        sar: "119 SAR",
        egp: "799 EGP",
        usdFallback: "$29.99",
        cadenceLabel: "per year",
      },
    },
    features: [
      "Designed for students who study several times each week",
      "600 monthly credits across study and premium media workflows",
      "More room for uploads, quizzes, notes, and revision sessions",
      "Lower friction once Cryonex becomes part of your normal routine",
    ],
    footnote:
      "Plus should feel like the default paid plan once Cryonex becomes a steady habit.",
  },
  {
    id: "PRO",
    name: "Pro",
    eyebrow: "Best for heavy exam prep",
    description:
      "For power users in intense study periods who want higher limits, fewer interruptions, and more room for long review weeks.",
    ctaLabel: "Choose Pro",
    ctaHref: "/login",
    badge: "Fair-use protected",
    allowance: PLAN_ALLOWANCES.PRO,
    prices: {
      monthly: {
        sar: "24 SAR",
        egp: "149 EGP",
        usdFallback: "$5.99",
        cadenceLabel: "per month",
      },
      yearly: {
        sar: "239 SAR",
        egp: "1,499 EGP",
        usdFallback: "$59.99",
        cadenceLabel: "per year",
      },
    },
    features: [
      "Higher limits for exam weeks and heavy review cycles",
      "2,750 monthly credits included across the full product",
      "Fair-use study help for long text sessions and deeper revision",
      "Best for power users who do most of their studying inside Cryonex",
    ],
    footnote:
      "Pro is for sustained serious use without pretending expensive media generation can be infinite.",
  },
];

export const PRICING_NOTES = [
  "Start free first. Upgrade only if Cryonex becomes part of your weekly study routine.",
  "Core text and study workflows are priced lower than image, video, and music generation because those APIs cost much more.",
  "Paid plans buy consistency and headroom, not confusing unlock bait.",
];
