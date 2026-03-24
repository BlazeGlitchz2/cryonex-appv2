import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Layers3,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Stars,
  Telescope,
  Workflow,
} from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";

import { CinematicHero } from "@/components/ui/cinematic-landing-hero";
import PricingSection4 from "@/components/ui/pricing-section-4";

const focusSignals = [
  {
    icon: BrainCircuit,
    title: "Intentional learning flow",
    description:
      "The UI now stages the next useful move instead of dumping tools, widgets, and AI noise into one canvas.",
  },
  {
    icon: ShieldCheck,
    title: "More trustworthy polish",
    description:
      "Calmer interactions, sturdier visual hierarchy, and cleaner motion make the product feel sharper on first contact.",
  },
  {
    icon: Workflow,
    title: "One connected system",
    description:
      "Uploads, review loops, dashboards, and generation surfaces feel closer to one study stack instead of scattered demos.",
  },
];

const showcaseCards = [
  {
    eyebrow: "Dashboard",
    title: "A control room for actual study momentum.",
    description:
      "See progress, return to recent material, and move into the next session without the usual interface drift.",
    image: "/marketting/cryonex-study-dashboard.png",
  },
  {
    eyebrow: "Workspace",
    title: "Practice surfaces that stay legible under pressure.",
    description:
      "Flashcards, summaries, and concept views now feel cleaner, more directed, and easier to scan during long sessions.",
    image: "/marketting/cryonex-study-workspace-flashcards.png",
  },
  {
    eyebrow: "Library",
    title: "Saved material that feels organized, not archived.",
    description:
      "The asset system is framed more like a living study collection with clearer retrieval and less visual friction.",
    image: "/marketting/cryonex-libary-feature-showcase.png",
  },
];

const cinematicRail = [
  "Upload PDFs, notes, images, or lecture recordings",
  "Generate cleaner review assets from one place",
  "Continue in a calmer mobile and desktop flow",
];

export default function NewLandingPage() {
  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    if (window.location.hash === "#pricing") {
      requestAnimationFrame(() => {
        document.getElementById("pricing")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#030712] text-white selection:bg-cyan-300/30">
      <div className="pointer-events-none fixed inset-0 opacity-90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_24%),radial-gradient(circle_at_80%_14%,rgba(251,146,60,0.08),transparent_18%),linear-gradient(180deg,#030712_0%,#040a17_48%,#06111f_100%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,rgba(255,255,255,0.75)_1px,transparent_1.2px)] [background-size:34px_34px]" />
        <div className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-cyan-400/12 blur-[110px]" />
        <div className="absolute bottom-[8%] right-[8%] h-80 w-80 rounded-full bg-amber-400/10 blur-[130px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-40 px-5 py-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-slate-950/55 px-5 py-3 shadow-[0_25px_80px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200/15 bg-white/5 shadow-[0_16px_40px_rgba(6,182,212,0.12)]">
              <img
                src="/assets/cryonex-logo-official.png"
                alt="Cryonex"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/55">
                Cryonex
              </p>
              <p className="text-sm font-medium text-white/70">
                Cinematic AI study workspace
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#pricing"
              className="rounded-full px-4 py-2 text-sm font-medium text-white/65 transition-colors hover:text-white"
            >
              Pricing
            </a>
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-white/65 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(6,182,212,0.16)]"
            >
              Open workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <CinematicHero
          brandName="Cryonex"
          tagline1="Study with"
          tagline2="cinematic clarity."
          cardHeading="A deeper visual system for serious learning."
          cardDescription={
            <>
              <span className="font-semibold text-white">Cryonex</span> is now
              framed like a polished command center: real hierarchy, calmer
              motion, and clearer transitions from upload to review to mastery.
            </>
          }
          metricValue={96}
          metricLabel="Flow Score"
          ctaHeading="A landing experience with actual gravity."
          ctaDescription="The top fold now feels more premium, more confident, and more Deepshi-adjacent while staying unmistakably Cryonex."
          primaryCtaLabel="Launch workspace"
          primaryCtaHref="/app"
          secondaryCtaLabel="Jump to pricing"
          secondaryCtaHref="#pricing"
          phoneImageSrc="/marketting/cryonex-app1.png"
          phoneImageAlt="Cryonex study app preview"
        />

        <section className="relative -mt-28 px-5 pb-10 sm:px-8 lg:px-10 lg:pb-14">
          <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5 }}
              className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.44)] backdrop-blur-2xl sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-100">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/58">
                    New direction
                  </p>
                  <h2 className="text-2xl font-semibold tracking-[-0.05em] text-white sm:text-3xl">
                    Built to feel less like a template and more like a product
                    world.
                  </h2>
                </div>
              </div>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
                The landing page now opens with a high-drama hero, a darker
                cinematic palette, stronger depth, and a clearer story about why
                Cryonex is different from generic AI study apps.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {cinematicRail.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-white/8 bg-slate-950/55 px-4 py-4"
                  >
                    <CheckCircle2 className="h-5 w-5 text-cyan-200" />
                    <p className="mt-3 text-sm leading-6 text-white/72">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 16 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: 0.06 }}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#071120] shadow-[0_28px_80px_rgba(2,6,23,0.5)]"
            >
              <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/56">
                    Live surface
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-[-0.04em] text-white">
                    Study dashboard showcase
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-cyan-200/12 bg-cyan-400/8 px-3 py-1 text-xs font-semibold text-cyan-100/74">
                  <Sparkles className="h-3.5 w-3.5" />
                  Revamped
                </div>
              </div>

              <img
                src="/marketting/cryonex-study-dashboard-uploading-pdf.png"
                alt="Cryonex dashboard uploading flow"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {focusSignals.map((item, index) => (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.32)] backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-100">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-white">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-white/66">
                  {item.description}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100/58">
                Product surfaces
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                A full landing narrative instead of a single flashy hero.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/68">
                The supporting sections now carry the same darker tone, glassier
                depth, and sharper pacing so the page feels like one coherent
                release.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {showcaseCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 shadow-[0_24px_80px_rgba(2,6,23,0.36)]"
                >
                  <div className="relative">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-64 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(3,7,18,0.55))]" />
                  </div>
                  <div className="p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-100/52">
                      {card.eyebrow}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-white/66">
                      {card.description}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-4 sm:px-8 lg:px-10 lg:py-8">
          <div className="mx-auto grid max-w-7xl gap-6 rounded-[2.5rem] border border-white/10 bg-[#071120]/92 p-6 shadow-[0_30px_100px_rgba(2,6,23,0.46)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/12 bg-cyan-400/8 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100/72">
                <Stars className="h-4 w-4" />
                Why it lands better
              </div>
              <h2 className="mt-5 text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
                The new hero gives Cryonex a stronger first impression, but the
                real win is the continuity afterward.
              </h2>
              <p className="mt-4 text-base leading-8 text-white/66">
                Every section after the pin sequence now reinforces the same
                premium story: calmer intelligence, bolder framing, and a study
                workflow that feels more deliberate than the average AI product.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: Telescope,
                  title: "Sharper framing",
                  text: "Large typography, stronger contrast, and deliberate depth make the value proposition easier to understand quickly.",
                },
                {
                  icon: PlayCircle,
                  title: "Better pacing",
                  text: "The scroll sequence introduces the product in stages instead of exhausting the user in the first viewport.",
                },
                {
                  icon: BrainCircuit,
                  title: "Clearer product story",
                  text: "Cryonex is presented as a focused study system rather than a generic everything app.",
                },
                {
                  icon: ShieldCheck,
                  title: "More premium feel",
                  text: "The darker palette, glass treatment, and cinematic transitions push the brand closer to premium productivity software.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.6rem] border border-white/8 bg-white/5 p-5"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 text-cyan-100">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/64">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/4 p-2 shadow-[0_28px_90px_rgba(2,6,23,0.32)] backdrop-blur-xl">
            <PricingSection4 />
          </div>
        </section>

        <section className="px-5 pb-20 pt-6 sm:px-8 lg:px-10 lg:pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.7rem] border border-white/10 bg-[linear-gradient(135deg,rgba(8,15,35,0.96),rgba(8,24,39,0.92))] px-6 py-8 text-white shadow-[0_36px_110px_rgba(2,6,23,0.46)] sm:px-8 sm:py-10 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100/64">
                  Ready to launch
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                  Open the new Cryonex landing flow and push it live.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                  The page now opens with a much heavier cinematic hero, a more
                  intentional dark palette, and follow-through sections that
                  feel built for the same world.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950"
                >
                  Launch workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-white/14 px-6 py-3 text-sm font-semibold text-white/88"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
