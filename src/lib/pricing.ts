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
    eyebrow: "Ad-supported start",
    description:
      "Begin with the current Cryonex flow: free access, rewarded refills, and a low-friction path for students who need the basics to stay accessible.",
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
      "Ad-supported study workflow with rewarded refills",
      "Referrals and focus sessions help refill your study balance",
      "Cheapest provider routing for everyday chat and study tasks",
      "Premium media stays metered with Cryo credits",
    ],
    footnote:
      "Best for students who want to start free and trade a few interruptions for continued access.",
  },
  {
    id: "PLUS",
    name: "Plus",
    eyebrow: "Best value for students",
    description:
      "A low-cost MENA-friendly plan for smoother studying: fewer interruptions, predictable monthly capacity, and better throughput for notes, quizzes, flashcards, and summaries.",
    ctaLabel: "See Plus plan",
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
      "Ad-free or ad-light study flow for normal text and study usage",
      "500 monthly study credits included for core learning workflows",
      "100 monthly Cryo credits included for premium media experiments",
      "Priority limits before refill prompts appear",
    ],
    footnote:
      "Built for affordable everyday studying in KSA, Egypt, and the wider MENA student market.",
  },
  {
    id: "PRO",
    name: "Pro",
    eyebrow: "Soft-unlimited study help",
    description:
      "For heavy students and power users who want near-unlimited text and study support, stronger limits, and access to premium workspace perks without pretending media is free to run.",
    ctaLabel: "Explore Pro",
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
      "Soft-unlimited text and study usage backed by fair-use guardrails",
      "250 monthly Cryo credits included before premium media is re-metered",
      "Offline mode and current PRO-only workspace perks stay mapped here",
      "Fastest path through search, study generation, and heavy review sessions",
    ],
    footnote:
      "Pro is designed as near-unlimited study help, not unlimited image, video, or music generation.",
  },
];

export const PRICING_NOTES = [
  "Subscriptions cover low-cost text and study workflows.",
  "Image, video, and music generation stay credit-metered because API costs spike there.",
  "Rewarded ads are positioned around refilling study flow, not premium media.",
];
