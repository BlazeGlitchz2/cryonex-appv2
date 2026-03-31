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
  trustNote?: string;
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
    eyebrow: "Study From Your Own Material",
    title: "Turn class material into an exam-ready study session.",
    subtitle: "Upload once. Review faster. Practice with confidence.",
    description:
      "Upload notes, PDFs, lecture recordings, screenshots, and links. Cryonex turns them into summaries, flashcards, quizzes, and guided review in one calmer workspace.",
    primaryAction: {
      label: "Start free",
      href: "/login",
    },
    secondaryAction: {
      label: "Jump to pricing",
      href: "#pricing",
    },
    proof: [
      { label: "Lecture slides" },
      { label: "Recorded classes" },
      { label: "Flashcards" },
      { label: "Quizzes" },
      { label: "Summaries" },
      { label: "Focused review" },
    ],
    stats: [
      {
        value: "Bring your own sources",
        label: "From messy material to a usable study flow",
      },
      {
        value: "Reach first value fast",
        label: "Summary, flashcards, and quiz in one session",
      },
      {
        value: "Stay in one loop",
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
      value: "Use your own material",
      label: "PDFs, notes, images, links, and recordings",
      detail:
        "Cryonex starts from the sources students already have instead of dropping them into a blank chat.",
    },
    {
      icon: BrainCircuit,
      value: "Review with structure",
      label: "Summaries, flashcards, quizzes, and study flows",
      detail:
        "The product is designed for recall and revision, not one-off answer dumping.",
    },
    {
      icon: ShieldCheck,
      value: "Trust before hype",
      label: "A calmer interface with stronger visual hierarchy",
      detail:
        "The workspace keeps the next action obvious instead of burying it under AI clutter.",
    },
    {
      icon: Gauge,
      value: "Start free",
      label: "See the workflow before you upgrade",
      detail:
        "Students can test real study sessions first, then pay only if the routine sticks.",
    },
  ],
  narrativeSections: [
    {
      eyebrow: "Capture once",
      title: "Bring everything into one focused study workspace.",
      body: "Most students start with scattered lecture notes, PDFs, screenshots, and links. Cryonex pulls them into one workspace so the next useful step is visible immediately.",
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
      body: "Cryonex helps students orient themselves first, then move into the right review format without opening more tools or losing the thread.",
      bullets: [
        "Summaries that orient the student before they dive back in.",
        "Flashcards and concept views that stay legible under pressure.",
        "A product rhythm that feels more serious than generic AI chat tools.",
      ],
      image: "/marketting/cryonex-study-workspace-concept-map.png",
      alt: "Cryonex concept map study workspace",
      align: "left",
    },
    {
      eyebrow: "Practice without drift",
      title: "Stay inside one system until the session is done.",
      body: "Practice, correction, and follow-up prompts stay tied to the same source material so the session feels like one system instead of a bundle of disconnected features.",
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
    eyebrow: "Built for serious students",
    title: "Start with one lecture. End with a real study session.",
    body: "Cryonex works best when the promise stays simple: bring your own class material, start free, and only pay if the workflow actually helps you study better each week.",
    trustNote:
      "Start free. Bring your own material. Paid plans increase allowance and reduce friction; they should not be a surprise.",
    primaryAction: {
      label: "Start free",
      href: "/login",
    },
    secondaryAction: {
      label: "See pricing",
      href: "#pricing",
    },
  },
};

export const trustRailHighlights = [
  {
    icon: Layers3,
    label: "One connected study workflow",
  },
  {
    icon: Sparkles,
    label: "Built around your material",
  },
  {
    icon: WandSparkles,
    label: "Guided AI, not AI hype",
  },
];
