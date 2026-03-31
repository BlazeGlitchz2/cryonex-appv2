import { useMemo } from "react";

import { FeatureFilmstrip } from "@/components/landing/FeatureFilmstrip";
import { HeroStage } from "@/components/landing/HeroStage";
import { LandingShell } from "@/components/landing/LandingShell";
import { NarrativeSection } from "@/components/landing/NarrativeSection";
import { PricingAndFinalCTA } from "@/components/landing/PricingAndFinalCTA";
import { TrustRail } from "@/components/landing/TrustRail";
import {
  landingContent,
  type LandingContent,
} from "@/components/landing/landing-content";
import { usePlatformExperience } from "@/lib/platform-experience";

function buildLandingContent(
  baseContent: LandingContent,
  platformExperience: ReturnType<typeof usePlatformExperience>,
): LandingContent {
  const platformTitle =
    platformExperience.shell === "smartboard"
      ? "for Android smart boards and shared tablets"
      : platformExperience.shell === "tablet"
        ? "for larger touch screens"
        : "";

  return {
    ...baseContent,
    hero: {
      ...baseContent.hero,
      eyebrow: platformExperience.landingEyebrow,
      title: platformExperience.landingTitle,
      subtitle: platformExperience.shellBadge,
      description: platformExperience.landingDescription,
      primaryAction: {
        ...baseContent.hero.primaryAction,
        label: platformExperience.landingPrimaryLabel,
      },
      secondaryAction: {
        ...baseContent.hero.secondaryAction,
        label: platformExperience.landingSecondaryLabel,
      },
      media: {
        ...baseContent.hero.media,
        video:
          platformExperience.isLowPowerLargeScreen ||
          platformExperience.shell !== "desktop"
            ? undefined
            : baseContent.hero.media.video,
      },
    },
    trustItems: baseContent.trustItems.map((item, index) =>
      index === 0 && platformTitle
        ? {
            ...item,
            detail: `${item.detail} Now tuned ${platformTitle}.`,
          }
        : item,
    ),
    finalCta: {
      ...baseContent.finalCta,
      title:
        platformExperience.platform === "android"
          ? "Start free on Android. Upgrade only if the workflow earns it."
          : platformExperience.platform === "ios"
            ? "Start free on iPhone or iPad. Upgrade only if it earns a place in your routine."
            : "Start free on the web. Upgrade only if the workflow earns it.",
      primaryAction: {
        ...baseContent.finalCta.primaryAction,
        label: platformExperience.landingPrimaryLabel,
      },
    },
  };
}

export default function NewLandingPage() {
  const platformExperience = usePlatformExperience();

  const content = useMemo(
    () => buildLandingContent(landingContent, platformExperience),
    [platformExperience],
  );

  return (
    <LandingShell>
      <HeroStage content={content.hero} />
      <TrustRail items={content.trustItems} />
      {content.narrativeSections.map((section) => (
        <NarrativeSection key={section.title} content={section} />
      ))}
      <FeatureFilmstrip items={content.workflowCards} />
      <PricingAndFinalCTA content={content.finalCta} />
    </LandingShell>
  );
}
