import HeroStage from "@/components/landing/HeroStage";
import LandingShell from "@/components/landing/LandingShell";
import FeatureFilmstrip from "@/components/landing/FeatureFilmstrip";
import NarrativeSection from "@/components/landing/NarrativeSection";
import PricingAndFinalCTA from "@/components/landing/PricingAndFinalCTA";
import TrustRail from "@/components/landing/TrustRail";
import { landingContent } from "@/components/landing/landing-content";

export default function NewLandingPage() {
  return (
    <LandingShell>
      <HeroStage content={landingContent.hero} />
      <TrustRail items={landingContent.trustItems} />

      {landingContent.narrativeSections.map((section) => (
        <NarrativeSection key={section.title} content={section} />
      ))}

      <FeatureFilmstrip items={landingContent.workflowCards} />
      <PricingAndFinalCTA content={landingContent.finalCta} />
    </LandingShell>
  );
}
