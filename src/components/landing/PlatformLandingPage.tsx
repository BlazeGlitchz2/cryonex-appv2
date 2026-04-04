import { Capacitor } from "@capacitor/core";
import { ArrowRight, Layers3, Sparkles, TabletSmartphone } from "lucide-react";
import { Link } from "react-router";

import { LandingShell } from "@/components/landing/LandingShell";
import { useOptimization } from "@/components/SmartOptimizer";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { useDeviceInfo } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type ExperienceProfile =
  | "desktop-web"
  | "tablet-web"
  | "smartboard-web"
  | "phone-web"
  | "android-native"
  | "ios-native";

type LandingCopy = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  statPrefix: string;
  platformLabel: string;
  accentClass: string;
  panelClass: string;
};

const workflowCards = [
  {
    eyebrow: "Source intake",
    title:
      "Bring in lecture notes, slides, and recordings without reorganizing first.",
    description:
      "Cryonex keeps the raw material grounded, then stages the next best study action instead of dropping you into a blank chat.",
    image: "/marketting/cryonex-study-dashboard-uploading-pdf.png",
    alt: "Cryonex study dashboard upload flow",
  },
  {
    eyebrow: "Recall loop",
    title:
      "Move from summaries to flashcards, quizzes, and corrections in one path.",
    description:
      "The workspace keeps every mode tied to the same source material, so review stays coherent on desktop, tablet, and native shells.",
    image: "/marketting/cryonex-study-workspace-flashcards.png",
    alt: "Cryonex flashcards workspace",
  },
  {
    eyebrow: "Exam repair",
    title: "Turn weak spots into next steps with less friction.",
    description:
      "Corrections, follow-up prompts, and study guidance stay visible so the session keeps moving on slower classroom hardware too.",
    image: "/marketting/cryonex-study-workspace-quiz-answer-correction.png",
    alt: "Cryonex quiz correction workspace",
  },
];

const platformNotes = [
  {
    title: "Desktop web",
    body: "Editorial, roomy, and presentation-first for conversion and deep study sessions.",
  },
  {
    title: "Android touch surfaces",
    body: "Higher-contrast, lower-effects, and larger targets for tablets and smart boards.",
  },
  {
    title: "iOS native",
    body: "Softer glass, calmer spacing, and a more polished studio feel across iPhone and iPad.",
  },
];

const copyByProfile: Record<ExperienceProfile, LandingCopy> = {
  "desktop-web": {
    eyebrow: "Editorial AI study workspace",
    title:
      "Turn class material into a guided study system that actually keeps moving.",
    description:
      "Cryonex is built for focused AI-assisted learning: ingest the source, generate the right review format, and stay in one composed workspace instead of hopping between tools.",
    primaryLabel: "Open workspace",
    secondaryLabel: "See plans",
    statPrefix: "Desktop web",
    platformLabel: "Poster-like landing, richer atmosphere, faster preload path.",
    accentClass: "from-cyan-300/30 via-sky-400/12 to-amber-200/18",
    panelClass: "border-cyan-100/16 bg-slate-950/50",
  },
  "tablet-web": {
    eyebrow: "Large-format touch workflow",
    title:
      "A calmer study board for tablets that need reach, clarity, and less chrome.",
    description:
      "On web tablets, Cryonex shifts toward larger touch targets, lighter visuals, and stronger contrast so study sessions stay smooth even on classroom hardware.",
    primaryLabel: "Open dashboard",
    secondaryLabel: "View plans",
    statPrefix: "Tablet web",
    platformLabel: "Wider controls, lighter motion, stronger contrast hierarchy.",
    accentClass: "from-emerald-300/24 via-cyan-300/12 to-sky-300/16",
    panelClass: "border-emerald-100/14 bg-slate-950/56",
  },
  "smartboard-web": {
    eyebrow: "Classroom board mode",
    title:
      "Built to stay readable and responsive on Android smart boards and shared displays.",
    description:
      "Cryonex trims decorative work, boosts touch ergonomics, and keeps the path obvious so group study, teaching, and revision still feel crisp on large touch screens.",
    primaryLabel: "Launch board view",
    secondaryLabel: "View plans",
    statPrefix: "Smart board",
    platformLabel: "Large targets, reduced effects, edge-cached assets.",
    accentClass: "from-teal-300/24 via-cyan-300/12 to-lime-200/14",
    panelClass: "border-teal-100/14 bg-slate-950/62",
  },
  "phone-web": {
    eyebrow: "Compact study shell",
    title:
      "A tighter Cryonex surface for phones without losing the core study flow.",
    description:
      "The mobile experience keeps the same study system, but compresses motion and chrome so the workspace stays fast and obvious in hand.",
    primaryLabel: "Open mobile workspace",
    secondaryLabel: "See plans",
    statPrefix: "Phone web",
    platformLabel:
      "Compact shell, simplified ambient effects, quicker action paths.",
    accentClass: "from-violet-300/24 via-blue-300/12 to-cyan-300/16",
    panelClass: "border-blue-100/16 bg-slate-950/58",
  },
  "android-native": {
    eyebrow: "Android native touch shell",
    title:
      "Faster, sturdier, and easier to operate on Android tablets and phones.",
    description:
      "The Android flavor of Cryonex leans into stronger edges, clearer touch affordances, and a lower-overhead visual stack so the native shell stays reliable on mid-range hardware.",
    primaryLabel: "Open Android workspace",
    secondaryLabel: "See plans",
    statPrefix: "Android native",
    platformLabel:
      "Touch-first polish, more grounded contrast, lighter rendering path.",
    accentClass: "from-emerald-300/26 via-teal-300/10 to-cyan-300/14",
    panelClass: "border-emerald-100/14 bg-slate-950/60",
  },
  "ios-native": {
    eyebrow: "iOS native study studio",
    title:
      "A softer native Cryonex surface with clearer rhythm on iPhone and iPad.",
    description:
      "The iOS shell keeps the same system and information architecture, but presents it with quieter glass, cleaner pacing, and motion that feels more native to Apple hardware.",
    primaryLabel: "Open iOS workspace",
    secondaryLabel: "See plans",
    statPrefix: "iOS native",
    platformLabel: "Softer glass, calmer pacing, polished native feel.",
    accentClass: "from-sky-200/28 via-indigo-200/12 to-white/14",
    panelClass: "border-sky-100/18 bg-slate-950/48",
  },
};

function getExperienceProfile(deviceInfo: ReturnType<typeof useDeviceInfo>) {
  if (Capacitor.isNativePlatform()) {
    return Capacitor.getPlatform() === "ios" ? "ios-native" : "android-native";
  }

  if (deviceInfo.isSmartboard) return "smartboard-web";
  if (deviceInfo.isTablet) return "tablet-web";
  if (deviceInfo.isPhone) return "phone-web";
  return "desktop-web";
}

export default function PlatformLandingPage() {
  const deviceInfo = useDeviceInfo();
  const { tier, reducedMotion } = useOptimization();
  const profile = getExperienceProfile(deviceInfo);
  const copy = copyByProfile[profile];
  const isLite = tier === "lite" || reducedMotion || deviceInfo.isSmartboard;

  return (
    <LandingShell>
      <section className="relative px-5 pb-16 pt-28 sm:px-8 lg:px-10 lg:pb-24 lg:pt-32">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <div className="relative z-10 max-w-2xl">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80",
                copy.panelClass,
              )}
            >
              <Sparkles className="h-4 w-4" />
              {copy.eyebrow}
            </div>

            <h1 className="mt-7 text-balance text-5xl font-semibold tracking-[-0.08em] text-white sm:text-6xl lg:text-[5.35rem] lg:leading-[0.92]">
              {copy.title}
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300/82">
              {copy.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 text-sm text-white/72">
              <span
                className={cn("rounded-full border px-4 py-2", copy.panelClass)}
              >
                {copy.platformLabel}
              </span>
              <span
                className={cn("rounded-full border px-4 py-2", copy.panelClass)}
              >
                {isLite
                  ? "Reduced motion and lighter visuals"
                  : "Enhanced atmosphere on capable hardware"}
              </span>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/app"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5"
              >
                {copy.primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/plans"
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold text-white/88 transition-colors hover:bg-white/10",
                  copy.panelClass,
                )}
              >
                {copy.secondaryLabel}
              </Link>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {[
                "Study dashboard",
                "Flashcards and quizzes",
                "Native + web shells",
              ].map((label) => (
                <div
                  key={label}
                  className={cn(
                    "rounded-[1.35rem] border px-4 py-4 text-sm text-white/78",
                    copy.panelClass,
                  )}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/58">
                    {copy.statPrefix}
                  </p>
                  <p className="mt-3 leading-6">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <div
              aria-hidden
              className={cn(
                "absolute inset-x-[8%] top-[8%] h-[72%] rounded-[2.5rem] bg-gradient-to-br blur-3xl",
                copy.accentClass,
              )}
            />

            <div
              className={cn(
                "relative overflow-hidden rounded-[2rem] border p-3 shadow-[0_28px_120px_rgba(2,6,23,0.48)]",
                copy.panelClass,
              )}
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.4rem] border border-white/10">
                <OptimizedImage
                  src="/marketting/cryonex-study-dashboard.png"
                  alt="Cryonex study dashboard"
                  fill
                  priority
                  quality={isLite ? 62 : 82}
                  className="rounded-[1.4rem]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.54))]" />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div
                  className={cn(
                    "rounded-[1.2rem] border px-4 py-4",
                    copy.panelClass,
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/52">
                    Platform character
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/74">
                    Shared information architecture, but tuned visuals and
                    interaction density per platform.
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-[1.2rem] border px-4 py-4",
                    copy.panelClass,
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/52">
                    Delivery path
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/74">
                    Edge-cached static assets through Vercel for lighter repeat
                    loads across the marketing site and app shell.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="px-5 pb-8 sm:px-8 lg:px-10"
        style={{ contentVisibility: "auto", containIntrinsicSize: "960px" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center gap-3 text-sm uppercase tracking-[0.28em] text-cyan-100/58">
            <Layers3 className="h-4 w-4" />
            Workflow
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {workflowCards.map((card) => (
              <article
                key={card.title}
                className={cn(
                  "overflow-hidden rounded-[1.8rem] border",
                  copy.panelClass,
                )}
              >
                <div className="relative aspect-[16/11] overflow-hidden">
                  <OptimizedImage
                    src={card.image}
                    alt={card.alt}
                    fill
                    quality={isLite ? 60 : 78}
                    className="rounded-none"
                  />
                </div>
                <div className="px-5 py-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/55">
                    {card.eyebrow}
                  </p>
                  <h2 className="mt-3 text-xl font-semibold text-white">
                    {card.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    {card.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="px-5 pb-20 pt-6 sm:px-8 lg:px-10"
        style={{ contentVisibility: "auto", containIntrinsicSize: "720px" }}
      >
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div className={cn("rounded-[1.8rem] border p-6", copy.panelClass)}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/76">
              <TabletSmartphone className="h-4 w-4" />
              Platform system
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-white">
              Similar product language, different platform posture.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
              Cryonex now leans into a shared structure with distinct platform
              accents: desktop stays more editorial, Android gets bolder touch
              ergonomics, and iOS keeps a softer studio feel.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {platformNotes.map((note) => (
              <div
                key={note.title}
                className={cn("rounded-[1.5rem] border p-5", copy.panelClass)}
              >
                <h3 className="text-lg font-semibold text-white">
                  {note.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LandingShell>
  );
}
