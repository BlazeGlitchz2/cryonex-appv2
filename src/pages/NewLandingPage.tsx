import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Layers3,
  PlayCircle,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router";

const workflowCards = [
  {
    title: "Capture once",
    description: "Bring in notes, lectures, PDFs, images, or links and let the app generate the useful next step immediately.",
    image: "/marketting/cryonex-study-dashboard-uploading-pdf.png",
  },
  {
    title: "Practice cleanly",
    description: "Move from upload to flashcards, quizzes, and concept maps without getting lost in a noisy interface.",
    image: "/marketting/cryonex-study-workspace-flashcards.png",
  },
  {
    title: "Stay organized",
    description: "Library, review, and dashboard surfaces now feel like one system instead of disconnected experiments.",
    image: "/marketting/cryonex-libary-feature-showcase.png",
  },
];

const deviceCards = [
  {
    icon: Smartphone,
    title: "Mobile-first polish",
    description: "Safer touch targets, calmer spacing, smoother motion, and better support for iPhone, Android, and Huawei-class devices.",
  },
  {
    icon: BrainCircuit,
    title: "Student workflow, not AI clutter",
    description: "The dashboard is centered on the next action that helps you learn, not on random feature spam.",
  },
  {
    icon: ShieldCheck,
    title: "Lighter and more reliable",
    description: "Removed brittle web-only errors, cleaned asset loading, and reduced reliance on fragile remote effects.",
  },
];

export default function NewLandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f6efe5] text-[#112034] selection:bg-cyan-200/70">
      <div className="pointer-events-none fixed inset-0 opacity-40">
        <div className="absolute inset-0 bg-[url('/noise.svg')]" />
        <div className="absolute left-[-10%] top-0 h-[28rem] w-[28rem] rounded-full bg-cyan-300/30 blur-[120px]" />
        <div className="absolute right-[-5%] top-[18%] h-[26rem] w-[26rem] rounded-full bg-amber-200/45 blur-[120px]" />
      </div>

      <header className="relative z-20 px-5 py-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-[#112034]/10 bg-white/70 px-5 py-3 shadow-[0_20px_60px_rgba(17,32,52,0.08)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#112034] shadow-[0_16px_40px_rgba(17,32,52,0.18)]">
              <img
                src="/assets/cryonex-logo-official.png"
                alt="Cryonex"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#112034]/45 uppercase">
                Cryonex
              </p>
              <p className="text-sm font-medium text-[#112034]/80">Focused AI study workspace</p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-[#112034]/70 transition-colors hover:text-[#112034]"
            >
              Sign in
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-full bg-[#112034] px-4 py-2 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(17,32,52,0.22)]"
            >
              Open workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-5 pb-14 pt-4 sm:px-8 lg:px-10 lg:pb-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center">
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="space-y-5"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-[#112034]/12 bg-white/75 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0f766e] shadow-[0_10px_30px_rgba(17,32,52,0.08)]">
                  <Layers3 className="h-4 w-4" />
                  A cleaner student command center
                </span>
                <h1 className="max-w-3xl text-5xl font-semibold leading-[0.94] tracking-[-0.06em] text-[#112034] md:text-7xl">
                  Study with a system that finally looks intentional.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-[#112034]/70">
                  Cryonex turns documents, recordings, notes, and links into a structured review workflow with a calmer dashboard, cleaner mobile UI, and far less AI-generated visual noise.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="flex flex-wrap gap-3"
              >
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 rounded-full bg-[#112034] px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(17,32,52,0.22)]"
                >
                  Open workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/study"
                  className="inline-flex items-center gap-2 rounded-full border border-[#112034]/12 bg-white/80 px-6 py-3 text-sm font-semibold text-[#112034]"
                >
                  View study dashboard
                  <PlayCircle className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.16 }}
                className="grid gap-3 sm:grid-cols-3"
              >
                {[
                  "Upload and generate from one place",
                  "Cleaner mobile study flow",
                  "Better web reliability and polish",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-[#112034]/10 bg-white/75 px-4 py-4 shadow-[0_16px_45px_rgba(17,32,52,0.08)] backdrop-blur-xl"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#0f766e]" />
                    <p className="mt-3 text-sm leading-6 text-[#112034]/72">{item}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -left-8 top-10 hidden h-32 w-32 rounded-full bg-cyan-300/50 blur-[70px] lg:block" />
              <div className="absolute -right-10 bottom-6 hidden h-36 w-36 rounded-full bg-amber-200/80 blur-[80px] lg:block" />

              <div className="relative rounded-[2.25rem] border border-[#112034]/10 bg-[#112034] p-4 shadow-[0_30px_90px_rgba(17,32,52,0.22)]">
                <img
                  src="/marketting/cryonex-study-dashboard.png"
                  alt="Cryonex study dashboard"
                  className="h-auto w-full rounded-[1.5rem] border border-white/10"
                />

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-3">
                    <img
                      src="/marketting/cryonex-study-workspace-flashcards.png"
                      alt="Flashcard workflow"
                      className="h-auto w-full rounded-[1rem] border border-white/10"
                    />
                  </div>
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/6 p-3">
                    <img
                      src="/marketting/cryonex-study-workspace-concept-map.png"
                      alt="Concept map workflow"
                      className="h-auto w-full rounded-[1rem] border border-white/10"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {deviceCards.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="rounded-[1.75rem] border border-[#112034]/10 bg-white/72 p-6 shadow-[0_20px_60px_rgba(17,32,52,0.08)] backdrop-blur-xl"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#112034] text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#112034]">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#112034]/68">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="px-5 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#0f766e]">
                One workflow
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[#112034] md:text-5xl">
                From raw material to review mode without interface chaos.
              </h2>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {workflowCards.map((card, index) => (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="overflow-hidden rounded-[2rem] border border-[#112034]/10 bg-white/76 shadow-[0_20px_60px_rgba(17,32,52,0.08)]"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-64 w-full object-cover"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[#112034]">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#112034]/68">{card.description}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 pt-6 sm:px-8 lg:px-10 lg:pb-24">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#112034] px-6 py-8 text-white shadow-[0_30px_90px_rgba(17,32,52,0.2)] sm:px-8 sm:py-10 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/72">
                  Ready to study
                </p>
                <h2 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                  Open the cleaner Cryonex workspace.
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                  The dashboard, landing experience, mobile flow, and core study interactions have all been pushed toward something calmer, sharper, and more trustworthy.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/app"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#112034]"
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
