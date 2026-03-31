import React from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  BrainCircuit,
  FileStack,
  GraduationCap,
  Menu,
  Target,
  X,
} from "lucide-react";
import { useOptimization } from "@/components/SmartOptimizer";
import { useDeviceInfo } from "@/hooks/use-mobile";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import { TextRotate } from "@/components/ui/text-rotate";
import { getOptimizedImageUrl } from "@/lib/utils/cdn-optimizer";
import {
  getPlatformDescriptor,
  resolvePlatformFlavor,
} from "@/lib/platform-flavor";
import { cn } from "@/lib/utils";

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

const menuItems = [
  { name: "Why Cryonex", href: "#why" },
  { name: "Workflow", href: "#workflow" },
  { name: "Plans", href: "/plans" },
  { name: "About", href: "/about" },
];

const proofCards = [
  {
    icon: FileStack,
    title: "Capture once",
    description:
      "Bring in PDFs, lecture recordings, screenshots, notes, and links without rebuilding your workflow.",
  },
  {
    icon: BrainCircuit,
    title: "Grounded review",
    description:
      "Generate summaries, flashcards, quizzes, and concept maps from the same source material.",
  },
  {
    icon: Target,
    title: "Practice faster",
    description:
      "Move from raw material to active recall and exam prep in a calmer, more structured flow.",
  },
  {
    icon: GraduationCap,
    title: "Stay in one system",
    description:
      "Cryonex keeps revision, feedback, and follow-up study inside one focused workspace.",
  },
];

const workflowCards = [
  {
    eyebrow: "Dashboard intake",
    title: "Upload the material you already have.",
    description:
      "Cryonex starts with class notes, PDFs, links, or lecture recordings and turns them into a clean next step.",
    image: "/marketting/cryonex-study-dashboard-uploading-pdf.png",
    alt: "Cryonex dashboard upload flow",
  },
  {
    eyebrow: "Active recall",
    title: "Shift into flashcards without losing context.",
    description:
      "Study modes stay connected to the original material, so review feels grounded instead of generic.",
    image: "/marketting/cryonex-study-workspace-flashcards.png",
    alt: "Cryonex flashcards workspace",
  },
  {
    eyebrow: "Exam correction",
    title: "See weak points and fix them faster.",
    description:
      "Quiz and answer-correction flows make it easier to spot gaps before the next study session.",
    image: "/marketting/cryonex-study-workspace-quiz-answer-correction.png",
    alt: "Cryonex quiz correction workspace",
  },
];

export function HeroSection() {
  const deviceInfo = useDeviceInfo();
  const { tier, shouldShowHeavyEffects } = useOptimization();
  const platformFlavor = resolvePlatformFlavor(deviceInfo);
  const platformDescriptor = getPlatformDescriptor(
    platformFlavor,
    deviceInfo,
  ) as {
    label: string;
    badge: string;
    landingBody: string;
    landingCta: string;
    landingChips: string[];
  };
  const prefersCalmHero = !shouldShowHeavyEffects;
  const heroImage = getOptimizedImageUrl(
    "/marketting/cryonex-landing-page-beginning.png",
    {
      width: tier === "lite" ? 1280 : 1920,
      quality: tier === "lite" ? 62 : 80,
      format: "webp",
    },
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#050218] text-foreground selection:bg-cyan-300/20">
      <HeroHeader />

      <main className="overflow-hidden">
        {!prefersCalmHero ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[2] isolate hidden opacity-60 lg:block"
          >
            <div className="absolute left-0 top-0 h-[80rem] w-[35rem] -translate-y-[350px] -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,rgba(132,221,255,0.16)_0,rgba(80,72,255,0.04)_50%,rgba(0,0,0,0)_80%)]" />
            <div className="absolute left-0 top-0 h-[80rem] w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(153,214,255,0.12)_0,rgba(113,82,255,0.04)_80%,transparent_100%)] [translate:5%_-50%]" />
            <div className="absolute left-0 top-0 h-[80rem] w-56 -translate-y-[350px] -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(198,244,255,0.08)_0,rgba(113,82,255,0.03)_80%,transparent_100%)]" />
          </div>
        ) : null}

        <section>
          <div className="relative pt-24 md:pt-36">
            {!prefersCalmHero ? (
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        delayChildren: 1,
                      },
                    },
                  },
                  item: {
                    hidden: {
                      opacity: 0,
                      y: 20,
                    },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        type: "spring" as const,
                        bounce: 0.3,
                        duration: 2,
                      },
                    },
                  },
                }}
                className="absolute inset-0 -z-20"
              >
                <img
                  src={heroImage}
                  alt="Cryonex interface background"
                  className="absolute inset-x-0 top-44 -z-20 hidden w-full opacity-30 saturate-[1.2] lg:top-28 lg:block"
                  decoding="async"
                  fetchPriority="high"
                />
              </AnimatedGroup>
            ) : null}

            <div
              aria-hidden
              className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"
            />

            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <a
                    href="#workflow"
                    className="group mx-auto flex w-fit items-center gap-4 rounded-full border border-white/10 bg-white/5 p-1 pl-4 shadow-md shadow-black/20 transition-all duration-300 hover:bg-white/8"
                  >
                    <span className="text-sm text-white/90">
                      {platformDescriptor.badge}
                    </span>
                    <span className="block h-4 w-px bg-white/15" />
                    <div className="size-6 overflow-hidden rounded-full bg-white text-[#050218] duration-500 group-hover:bg-cyan-200">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </a>

                  <h1 className="mx-auto mt-8 max-w-5xl text-balance text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                    Turn every lecture, PDF, and note into
                    <span className="mt-4 flex justify-center">
                      <span className="inline-flex min-h-[1.15em] items-center justify-center rounded-2xl bg-white px-4 py-2 text-[#050218] shadow-[0_20px_80px_rgba(80,190,255,0.18)] sm:px-6">
                        <TextRotate
                          texts={[
                            "flashcards",
                            "quizzes",
                            "summaries",
                            "concept maps",
                          ]}
                          mainClassName="justify-center text-center font-semibold"
                          staggerFrom="last"
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "-120%" }}
                          staggerDuration={0.02}
                          splitLevelClassName="overflow-hidden pb-1"
                          transition={{
                            type: "spring",
                            damping: 30,
                            stiffness: 400,
                          }}
                          rotationInterval={2200}
                        />
                      </span>
                    </span>
                  </h1>

                  <p className="mx-auto mt-8 max-w-3xl text-balance text-lg text-white/70">
                    Cryonex is the AI study workspace that grounds your source
                    material, stages the next best review step, and keeps your
                    exam prep moving without the clutter of a generic chatbot.
                    {" "}
                    {platformDescriptor.landingBody}
                  </p>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-3 md:flex-row"
                >
                  <div className="rounded-[14px] border border-white/10 bg-white/5 p-0.5">
                    <Button
                      asChild
                      size="lg"
                      className="rounded-xl px-5 text-base"
                    >
                      <Link to="/app">
                        <span className="text-nowrap">
                          {platformDescriptor.landingCta}
                        </span>
                      </Link>
                    </Button>
                  </div>
                  <Button
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-10.5 rounded-xl px-5 text-white/80 hover:bg-white/8 hover:text-white"
                  >
                    <a href="#why">
                      <span className="text-nowrap">
                        See why students switch
                      </span>
                    </a>
                  </Button>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.04,
                          delayChildren: 0.95,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-white/60"
                >
                  {platformDescriptor.landingChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2"
                    >
                      {chip}
                    </span>
                  ))}
                </AnimatedGroup>
              </div>
            </div>

            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                <div
                  aria-hidden
                  className="absolute inset-0 z-10 bg-gradient-to-b from-transparent from-35% to-background"
                />
                <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-4 shadow-[0_24px_120px_rgba(2,4,18,0.65)] ring-1 ring-white/10 backdrop-blur">
                  <img
                    className="relative aspect-[15/8] rounded-[1.5rem] object-cover"
                    src={getOptimizedImageUrl(
                      prefersCalmHero
                        ? "/marketting/cryonex-study-dashboard-uploading-pdf.png"
                        : "/marketting/cryonex-study-dashboard.png",
                      {
                        width: 1600,
                        quality: tier === "lite" ? 64 : 82,
                        format: "webp",
                      },
                    )}
                    alt="Cryonex study dashboard"
                    width="2700"
                    height="1440"
                    decoding="async"
                    fetchPriority="high"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>

        <section id="workflow" className="bg-background pb-16 pt-12 md:pb-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
              <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/70">
                      Full workflow
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">
                      One place to capture, review, and practice.
                    </h2>
                  </div>
                  <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60 md:block">
                    Dashboard to exam mode
                  </div>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-white/65 md:text-base">
                  The landing page should show what Cryonex actually feels like
                  in use: a serious study system that keeps your material
                  grounded while helping you move into better review loops
                  faster.
                </p>
                <img
                  src={getOptimizedImageUrl(
                    "/marketting/cryonex-study-dashboard-uploading-pdf.png",
                    {
                      width: 1200,
                      quality: tier === "lite" ? 62 : 78,
                      format: "webp",
                    },
                  )}
                  alt="Cryonex study dashboard upload workflow"
                  className="mt-6 aspect-[16/10] w-full rounded-[1.5rem] border border-white/10 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </article>

              <div className="grid gap-6">
                {workflowCards.slice(1).map((card) => (
                  <article
                    key={card.title}
                    className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-5"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-200/70">
                      {card.eyebrow}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/65">
                      {card.description}
                    </p>
                    <img
                      src={getOptimizedImageUrl(card.image, {
                        width: 1200,
                        quality: tier === "lite" ? 62 : 78,
                        format: "webp",
                      })}
                      alt={card.alt}
                      className="mt-5 aspect-[16/10] w-full rounded-[1.5rem] border border-white/10 object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </article>
                ))}
              </div>
            </div>

            <div
              id="why"
              className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            >
              {proofCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5"
                  >
                    <div className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8">
                      <Icon className="size-5 text-cyan-200" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-white">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-white/60">
                      {card.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(89,186,255,0.08),rgba(255,255,255,0.03))] p-6 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/70">
                  Start studying cleaner
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Bring your material into Cryonex and move into a sharper
                  {` ${platformDescriptor.label.toLowerCase()} study flow.`}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/65">
                  Open the workspace, upload what you already have, and let the
                  product build the next useful step with a surface tuned for
                  the device in front of you.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="rounded-xl px-5">
                  <Link to="/app">{platformDescriptor.landingCta}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-white/15 bg-white/5 px-5 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link to="/plans">Compare plans</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

const HeroHeader = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState ? "active" : "inactive"}
        className="group fixed z-20 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "max-w-4xl rounded-2xl border border-white/10 bg-background/60 backdrop-blur-lg lg:px-5",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                to="/"
                aria-label="Cryonex home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState((current) => !current)}
                aria-label={menuState ? "Close menu" : "Open menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto size-6 duration-200 group-data-[state=active]:scale-0 group-data-[state=active]:rotate-180 group-data-[state=active]:opacity-0" />
                <X className="absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200 group-data-[state=active]:scale-100 group-data-[state=active]:rotate-0 group-data-[state=active]:opacity-100" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    {item.href.startsWith("/") ? (
                      <Link
                        to={item.href}
                        className="block text-white/60 duration-150 hover:text-white"
                      >
                        <span>{item.name}</span>
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className="block text-white/60 duration-150 hover:text-white"
                      >
                        <span>{item.name}</span>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6 hidden w-full flex-wrap items-center justify-end rounded-3xl border border-white/10 bg-background/95 p-6 shadow-2xl shadow-black/30 group-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      {item.href.startsWith("/") ? (
                        <Link
                          to={item.href}
                          className="block text-white/65 duration-150 hover:text-white"
                          onClick={() => setMenuState(false)}
                        >
                          <span>{item.name}</span>
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          className="block text-white/65 duration-150 hover:text-white"
                          onClick={() => setMenuState(false)}
                        >
                          <span>{item.name}</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className={cn(
                    "border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white",
                    isScrolled && "lg:hidden",
                  )}
                >
                  <Link to="/login">
                    <span>Sign in</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled && "lg:hidden")}
                >
                  <Link to="/app">
                    <span>Open app</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                >
                  <Link to="/app">
                    <span>Launch Cryonex</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-10 items-center justify-center rounded-2xl border border-white/10 bg-white/6">
        <img
          src="/assets/cryonex-logo-official.png"
          alt="Cryonex"
          className="size-6 object-contain"
        />
      </div>
      <div className="leading-none">
        <span className="block font-orbitron text-[0.72rem] uppercase tracking-[0.28em] text-white">
          Cryonex
        </span>
        <span className="mt-1 block text-xs text-white/55">
          AI study workspace
        </span>
      </div>
    </div>
  );
};
