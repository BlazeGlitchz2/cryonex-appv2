import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeroStage } from "./HeroStage";

vi.mock("@/hooks/use-hero-stage-timeline", () => ({
  useHeroStageTimeline: vi.fn(),
}));

vi.mock("@/hooks/use-mobile", () => ({
  useDeviceInfo: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  }),
}));

vi.mock("@/lib/platform-runtime", () => ({
  isNativePlatform: () => false,
}));

vi.mock("@/lib/platform-flavor", () => ({
  getPlatformFlavor: () => ({
    reduceVisualWeight: false,
  }),
}));

vi.mock("@/lib/stores/performance-store", () => ({
  usePerformanceStore: (selector: (state: any) => unknown) =>
    selector({
      reducedMotion: false,
      disable3D: false,
      disableParticles: false,
      disableShaders: false,
      qualityTier: "full",
      detectedTier: "full",
    }),
}));

vi.mock("@/components/ui/OptimizedImage", () => ({
  OptimizedImage: ({
    src,
    alt,
    imgClassName,
  }: {
    src: string;
    alt: string;
    imgClassName?: string;
  }) => <img src={src} alt={alt} className={imgClassName} />,
}));

const content = {
  eyebrow: "Personalized Student OS",
  title: "Turn your coursework into the next best study action.",
  subtitle: "Source-aware, curriculum-aware, focus-aware review.",
  description: "Grounded outputs for real study sessions.",
  primaryAction: {
    label: "Start free",
    href: "/login",
  },
  secondaryAction: {
    label: "See pricing",
    href: "#pricing",
  },
  proof: [{ label: "Flashcards" }],
  stats: [{ value: "Source-Aware", label: "Study tools rooted in your notes" }],
  media: {
    image: "/marketting/cryonex-study-dashboard.png",
    alt: "Cryonex dashboard overview",
    video: "/assets/Cinematic_premium_sky_1080p_202601102101.mp4",
    poster: "/marketting/cryonex-landing-page-beginning.png",
  },
} satisfies Parameters<typeof HeroStage>[0]["content"];

describe("HeroStage", () => {
  it("removes the ambient video after a load failure so the poster image can carry the hero", () => {
    render(<HeroStage content={content} />);

    const video = screen.getByLabelText("Ambient hero video");

    fireEvent.error(video);

    expect(screen.queryByLabelText("Ambient hero video")).toBeNull();
  });
});
