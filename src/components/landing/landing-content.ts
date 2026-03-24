import type { LucideIcon } from "lucide-react";
import {
  BookOpenCheck,
  BrainCircuit,
  FileStack,
  Gauge,
  GraduationCap,
  Layers3,
  NotebookPen,
  ShieldCheck,
  Sparkles,
  WandSparkles,
} from "lucide-react";

export interface LandingAction {
  label: string;
  href: string;
}

export interface HeroProofItem {
  label: string;
}

export interface HeroStatItem {
  label: string;
  value: string;
}

export interface LandingHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  primaryAction: LandingAction;
  secondaryAction: LandingAction;
  proof: HeroProofItem[];
  stats: HeroStatItem[];
  media: {
    image: string;
    alt: string;
    video?: string;
    poster?: string;
  };
}

export interface TrustItem {
  icon: LucideIcon;
  value: string;
  label: string;
  detail: string;
}

export interface NarrativeSectionContent {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  image: string;
  alt: string;
  align: "left" | "right";
}

export interface WorkflowCardContent {
  eyebrow: string;
  title: string;
  outcome: string;
  image: string;
  alt: string;
  icon: LucideIcon;
}

export interface FinalCtaContent {
  eyebrow: string;
  title: string;
  body: string;
  primaryAction: LandingAction;
  secondaryAction: LandingAction;
}

export interface LandingContent {
  hero: LandingHeroContent;
  trustItems: TrustItem[];
  narrativeSections: NarrativeSectionContent[];
  workflowCards: WorkflowCardContent[];
  finalCta: FinalCtaContent;
}

export const landingContent: LandingContent = {
  hero: {
    eyebrow: "Editorial Product Film",
    title: "Turn your study chaos into a calm system.",
    subtitle: "Cinematic clarity for serious students.",
    description:
      "Cryonex turns lectures, PDFs, notes, and links into a guided review flow with real visual discipline, faster exam prep, and less AI clutter.",
    primaryAction: {
      label: "Launch workspace",
      href: "/app",
    },
    secondaryAction: {
      label: "Jump to pricing",
      href: "#pricing",
    },
    proof: [
      { label: "PDFs" },
      { label: "Lecture recordings" },
      { label: "Flashcards" },
      { label: "Quizzes" },
      { label: "Summaries" },
      { label: "Concept maps" },
    ],
    stats: [
      { value: "Capture once", label: "From messy inputs to study-ready flow" },
      {
        value: "Practice better",
        label: "Review, quiz, and revise in one place",
      },
      {
        value: "Stay in rhythm",
        label: "Less context switching before the exam",
      },
    ],
    media: {
      image: "/marketting/cryonex-study-dashboard-uploading-pdf.png",
      alt: "Cryonex dashboard transforming a PDF into a guided study workspace",
      video: "/assets/Cinematic_premium_sky_1080p_202601102101.mp4",
      poster: "/marketting/cryonex-landing-page-beginning.png",
    },
  },
  trustItems: [
    {
      icon: FileStack,
      value: "Upload once",
      label: "PDFs, notes, images, links, and recordings",
      detail: "Built around the material students already have.",
    },
    {
      icon: BrainCircuit,
      value: "Guided review",
      label: "Summaries, flashcards, quizzes, and study flows",
      detail: "More understanding and recall, less answer dumping.",
    },
    {
      icon: ShieldCheck,
      value: "Product clarity",
      label: "A calmer interface with stronger visual hierarchy",
      detail: "Designed to feel trustworthy instead of over-generated.",
    },
    {
      icon: Gauge,
      value: "Faster prep",
      label: "Move from raw material to active practice in minutes",
      detail: "Optimized for momentum before the next exam session.",
    },
  ],
  narrativeSections: [
    {
      eyebrow: "Capture once",
      title: "Bring everything into one focused study workspace.",
      body: "Cryonex starts with the reality of student work: scattered PDFs, lecture notes, screenshots, and links. The landing should prove that the product immediately gives structure back.",
      bullets: [
        "One intake point for the messy material students already have.",
        "The dashboard frames the next useful step instead of flooding the screen.",
        "Real screenshots make the product feel grounded and believable.",
      ],
      image: "/marketting/cryonex-study-dashboard.png",
      alt: "Cryonex study dashboard overview",
      align: "right",
    },
    {
      eyebrow: "Review with guidance",
      title: "Turn raw material into cleaner review loops.",
      body: "The strongest story is not that Cryonex does everything with AI. It is that the product helps students move into better review modes with less friction and less context switching.",
      bullets: [
        "Summaries that orient the student before they dive back in.",
        "Flashcards and concept views that stay legible under pressure.",
        "A product rhythm that feels more serious than generic AI tools.",
      ],
      image: "/marketting/cryonex-study-workspace-concept-map.png",
      alt: "Cryonex concept map study workspace",
      align: "left",
    },
    {
      eyebrow: "Practice without drift",
      title: "Stay inside one system until the session is done.",
      body: "Cryonex should feel like a real learning system, not a bundle of disconnected features. The page needs to show that practice, correction, and iteration all happen in one product world.",
      bullets: [
        "Quiz and answer-correction flows that keep momentum high.",
        "Library and dashboard surfaces that feel connected to the workspace.",
        "An experience that favors progress and recall over spectacle.",
      ],
      image: "/marketting/cryonex-study-workspace-quiz-answer-correction.png",
      alt: "Cryonex quiz correction workflow",
      align: "right",
    },
  ],
  workflowCards: [
    {
      eyebrow: "Upload",
      title: "Start with the material you already have.",
      outcome:
        "Import notes, lectures, PDFs, images, or links and let Cryonex stage the next action cleanly.",
      image: "/marketting/cryonex-study-dashboard-uploading-pdf.png",
      alt: "Uploading a PDF into the Cryonex study dashboard",
      icon: NotebookPen,
    },
    {
      eyebrow: "Review",
      title: "Move into guided summaries and flashcards.",
      outcome:
        "Use one workspace to scan the material, build recall, and reinforce concepts without changing tools.",
      image: "/marketting/cryonex-study-workspace-flashcards.png",
      alt: "Cryonex flashcard study workflow",
      icon: BookOpenCheck,
    },
    {
      eyebrow: "Practice",
      title: "Stress-test understanding before the exam.",
      outcome:
        "Quiz flows, corrections, and progress cues keep study sessions active instead of passive.",
      image: "/marketting/cryonex-study-workspace-quiz.png",
      alt: "Cryonex quiz workflow",
      icon: GraduationCap,
    },
  ],
  finalCta: {
    eyebrow: "Built for students",
    title: "A sharper study workflow, not another generic AI app.",
    body: "Cryonex is positioned as one connected workspace for capture, review, and practice. The new landing should feel premium, focused, and immediately credible.",
    primaryAction: {
      label: "Launch workspace",
      href: "/app",
    },
    secondaryAction: {
      label: "Sign in",
      href: "/login",
    },
  },
};

export const trustRailHighlights = [
  {
    icon: Layers3,
    label: "One connected workflow",
  },
  {
    icon: Sparkles,
    label: "Premium editorial framing",
  },
  {
    icon: WandSparkles,
    label: "Guided AI, not AI hype",
  },
];
