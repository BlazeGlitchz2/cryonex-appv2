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
    eyebrow: "The Unified Student Engine",
    title: "Master your curriculum with AI that knows your school.",
    subtitle: "Source-grounded study help. Connected to your campus.",
    description:
      "Cryonex transforms your PDFs, YouTube links, and lecture notes into a high-performance study workspace. Grounded in your sources and tuned for your specific curriculum—from KSA Qudurat to Egypt Thanaweya.",
    primaryAction: {
      label: "Start free",
      href: "/login",
    },
    secondaryAction: {
      label: "Jump to pricing",
      href: "#pricing",
    },
    proof: [
      { label: "School Hubs" },
      { label: "Offline Mode" },
      { label: "Source-Grounded AI" },
      { label: "Study Packs" },
      { label: "KSA/Egypt Tuning" },
      { label: "Active Recall" },
    ],
    stats: [
      {
        value: "Source-Grounded AI",
        label: "Documents, URLs, & YouTube grounded in one chat",
      },
      {
        value: "Regional Mastery",
        label: "AI tuned for KSA, Egypt, UK, & US curriculums",
      },
      {
        value: "Social Study",
        label: "Join your School Hub and share with classmates",
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
      value: "Source-Grounded Answers",
      label: "Grounded in your own material",
      detail:
        "Responses stay anchored in your PDFs, YouTube transcripts, and notes with direct inline citations.",
    },
    {
      icon: BrainCircuit,
      value: "Automated Study Science",
      label: "One-click Study Packs & SRS",
      detail:
        "Instant summaries, flashcards, and quizzes. Smart Spaced Repetition (SRS) handles your active recall automatically.",
    },
    {
      icon: ShieldCheck,
      value: "Unified & Social",
      label: "Your School's AI Network",
      detail:
        "Join decentralized School Hubs to find trending study packs from your campus and share with classmates.",
    },
    {
      icon: Gauge,
      value: "Native & Offline",
      label: "Study anywhere, truly.",
      detail:
        "A premium mobile experience with local AI models and offline sync for study sessions during the commute.",
    },
  ],
  narrativeSections: [
    {
      eyebrow: "Ground your AI",
      title: "Move beyond the blank chat box.",
      body: "Most AIs are generic. Cryonex is personal. It ingests your messy lecture notes, complex PDFs, and even YouTube lecture links to build a unified context for every answer.",
      bullets: [
        "Inline citations back to your specific source pages.",
        "Automatic extraction of tables, figures, and key terms.",
        "YouTube transcript ingestion for video-based learning.",
      ],
      image: "/marketting/cryonex-study-dashboard.png",
      alt: "Cryonex study dashboard overview",
      align: "right",
    },
    {
      eyebrow: "Curriculum-aware practice",
      title: "AI that understands the exam path.",
      body: "Whether it's KSA Qudurat/SAAT, Egypt Thanaweya Amma, or IGCSE/AP boards, Cryonex helps shape practice around the logic and exam patterns of your region.",
      bullets: [
        "Regional Study Packs designed for your specific exam board.",
        "Bilingual Arabic/English support for MENA students.",
        "School-specific content hubs for top-performing campuses.",
      ],
      image: "/marketting/cryonex-study-workspace-concept-map.png",
      alt: "Cryonex curriculum aware study workspace",
      align: "left",
    },
    {
      eyebrow: "Social Intelligence",
      title: "Study with your school, not just alone.",
      body: "Cryonex brings the decentralized school network to life. Access the 'Library of the Campus' where public study packs from your classmates are just a tap away.",
      bullets: [
        "Join your school to see what your classmates are studying.",
        "Follow top Study Curators and clone their best packs.",
        "Public/Private visibility controls for every study asset.",
      ],
      image: "/marketting/cryonex-study-workspace-quiz-answer-correction.png",
      alt: "Cryonex social school hub sharing",
      align: "right",
    },
  ],
  workflowCards: [
    {
      eyebrow: "Ingest",
      title: "Connect your documents and links.",
      outcome:
        "Drop in PDFs, YouTube URLs, or scanned notes and let Cryonex build your unified knowledge base.",
      image: "/marketting/cryonex-study-dashboard-uploading-pdf.png",
      alt: "Uploading resources into the Cryonex engine",
      icon: NotebookPen,
    },
    {
      eyebrow: "Automate",
      title: "Generate your Study Pack instantly.",
      outcome:
        "One click turns raw data into guided summaries, flashcards, and concept maps powered by AI research.",
      image: "/marketting/cryonex-study-workspace-flashcards.png",
      alt: "Cryonex automated study pack generation",
      icon: BookOpenCheck,
    },
    {
      eyebrow: "Master",
      title: "Active recall via SRS & Quizzes.",
      outcome:
        "Stress-test your knowledge with AI-driven quizzes and handle retrieval with our built-in SRS algorithm.",
      image: "/marketting/cryonex-study-workspace-quiz.png",
      alt: "Cryonex active recall and performance tracking",
      icon: GraduationCap,
    },
  ],
  finalCta: {
    eyebrow: "Built for High-Performance Students",
    title: "The Engine for your Curriculum.",
    body: "Cryonex brings source-grounded AI, study science, and social learning into a single workspace for students who want clearer practice loops.",
    trustNote:
      "Start free with study packs, flashcards, and quizzes, then upgrade when the workflow earns a place in your routine.",
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
    label: "Unified Study Engine",
  },
  {
    icon: Sparkles,
    label: "Curriculum-Aware AI",
  },
  {
    icon: WandSparkles,
    label: "Decentralized School Hubs",
  },
];
