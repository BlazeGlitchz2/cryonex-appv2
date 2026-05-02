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
    eyebrow: "Personalized Student OS",
    title: "Turn your coursework into the next best study action.",
    subtitle:
      "A source-aware, curriculum-aware, focus-aware layer for notes, recall, and exam prep.",
    description:
      "Cryonex transforms PDFs, YouTube links, and lecture notes into cited summaries, flashcards, quizzes, and review plans. Choose the exact sources for each session, see where your knowledge is thin, and keep study momentum clear before an exam, commute, or classroom recap.",
    primaryAction: {
      label: "Start free",
      href: "/login",
    },
    secondaryAction: {
      label: "Jump to pricing",
      href: "#pricing",
    },
    proof: [
      { label: "Personalized Student OS" },
      { label: "Source Selection" },
      { label: "Flashcards" },
      { label: "Practice Tests" },
      { label: "Cited Answers" },
      { label: "Mobile Review" },
      { label: "Focus Mode" },
    ],
    stats: [
      {
        value: "Source-Aware",
        label: "Documents, URLs, and YouTube grounded in one study context",
      },
      {
        value: "Next Best Action",
        label: "Move from upload to summaries, cards, quizzes, and focused review",
      },
      {
        value: "Focus-Aware",
        label: "Review flashcards and quiz weak spots in short mobile sessions",
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
      value: "Source-Aware Answers",
      label: "Grounded in your own coursework",
      detail:
        "Responses stay anchored in the PDFs, YouTube transcripts, and notes you select, with direct inline citations.",
    },
    {
      icon: BrainCircuit,
      value: "Next-Best-Action Study",
      label: "Guides, cards, quizzes, and gaps",
      detail:
        "Turn long material into editable summaries, flashcards, practice tests, and knowledge-gap review so study starts with retrieval, not busywork.",
    },
    {
      icon: ShieldCheck,
      value: "Curriculum-Aware Practice",
      label: "Review shaped around the exam path",
      detail:
        "Frame quizzes and study packs around regional exam patterns while keeping the work tied to the material you actually uploaded.",
    },
    {
      icon: Gauge,
      value: "Focus-Aware Mobile Review",
      label: "Keep short sessions moving",
      detail:
        "Use mobile review, focus tools, and short recall loops when you need a study session that fits the time you have.",
    },
  ],
  narrativeSections: [
    {
      eyebrow: "Source-aware",
      title: "Move beyond the blank chat box.",
      body: "Generic chat starts with an empty prompt. Cryonex starts from your class material, then lets you select which sources should drive the next explanation, flashcard set, quiz, or note.",
      bullets: [
        "Inline citations back to specific source pages.",
        "Source selection for focused review before a test.",
        "Automatic extraction of tables, figures, and key terms.",
      ],
      image: "/marketting/cryonex-study-dashboard.png",
      alt: "Cryonex study dashboard overview",
      align: "right",
    },
    {
      eyebrow: "Curriculum-aware practice",
      title: "Practice shaped around your exam path.",
      body: "Whether it's KSA Qudurat/SAAT, Egypt Thanaweya Amma, or IGCSE/AP boards, Cryonex helps frame practice around regional exam patterns while keeping each session connected to your uploaded material.",
      bullets: [
        "Regional study packs designed for your specific exam board.",
        "Bilingual Arabic/English support for MENA students.",
        "Quiz and flashcard flows that stay close to the selected sources.",
      ],
      image: "/marketting/cryonex-study-workspace-concept-map.png",
      alt: "Cryonex curriculum aware study workspace",
      align: "left",
    },
    {
      eyebrow: "Focus-aware",
      title: "Know what to do next.",
      body: "Cryonex turns the workspace into a student operating layer: upload material, turn it into notes and recall, spot weak areas, then pick the next focused review action.",
      bullets: [
        "Knowledge-gap review after quizzes and drills.",
        "Focus sessions for short, deliberate study blocks.",
        "Mobile review for commutes, breaks, and last-minute recap.",
      ],
      image: "/marketting/cryonex-study-workspace-quiz-answer-correction.png",
      alt: "Cryonex focus-aware quiz correction and knowledge gap review",
      align: "right",
    },
  ],
  workflowCards: [
    {
      eyebrow: "Ingest",
      title: "Connect sources to your student OS.",
      outcome:
        "Drop in PDFs, YouTube URLs, or scanned notes and let Cryonex build a source set you can narrow for each study session.",
      image: "/marketting/cryonex-study-dashboard-uploading-pdf.png",
      alt: "Uploading resources into the Cryonex engine",
      icon: NotebookPen,
    },
    {
      eyebrow: "Automate",
      title: "Generate the next study action.",
      outcome:
        "Turn selected material into summaries, flashcards, practice tests, notes, and concept maps for focused review.",
      image: "/marketting/cryonex-study-workspace-flashcards.png",
      alt: "Cryonex automated study pack generation",
      icon: BookOpenCheck,
    },
    {
      eyebrow: "Review",
      title: "Close the knowledge gaps.",
      outcome:
        "Stress-test your knowledge with source-linked questions, short-answer drills, and quiz review loops that show what needs attention next.",
      image: "/marketting/cryonex-study-workspace-quiz.png",
      alt: "Cryonex active recall and performance tracking",
      icon: GraduationCap,
    },
  ],
  finalCta: {
    eyebrow: "Built as a student operating layer",
    title: "Start with one source set. Leave with the next best action.",
    body: "Cryonex brings source-grounded AI, curriculum-aware practice, focus tools, and mobile recall into a single workspace for students who want clearer study loops.",
    trustNote:
      "Start free with study guides, flashcards, and practice tests, then upgrade when the workflow earns a place in your routine.",
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
    label: "Personalized Student OS",
  },
  {
    icon: Sparkles,
    label: "Curriculum-Aware AI",
  },
  {
    icon: WandSparkles,
    label: "Next-Best-Action Review",
  },
];
