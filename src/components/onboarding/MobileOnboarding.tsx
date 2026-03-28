import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Compass,
  Layers3,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router";
import { isAssistantRoute } from "@/lib/mobile-shell";

interface OnboardingSlide {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  icon: ReactNode;
  bullets: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: "welcome",
    eyebrow: "Study desk",
    title: "Start with one useful source.",
    description:
      "Cryonex works best when you bring in a note, PDF, lecture, or link and let it become something you can actually study from.",
    accent: "from-slate-900 via-teal-950 to-cyan-950",
    icon: <Sparkles className="h-5 w-5" />,
    bullets: [
      "Upload once",
      "Keep the source visible",
      "Turn it into a study lane",
    ],
  },
  {
    id: "library",
    eyebrow: "Library",
    title: "Keep materials organized without extra effort.",
    description:
      "Your uploads stay grouped by topic, so you can return to the same class, chapter, or project without rebuilding your setup every time.",
    accent: "from-stone-950 via-emerald-950 to-teal-950",
    icon: <BookOpen className="h-5 w-5" />,
    bullets: [
      "Recent uploads stay close",
      "Find the right material fast",
      "No scattered notebook chaos",
    ],
  },
  {
    id: "review",
    eyebrow: "Review loop",
    title: "Turn confusion into questions, then check the weak spots.",
    description:
      "Use the study tools to generate flashcards, quizzes, and quick review passes when you need repetition instead of another long chat.",
    accent: "from-slate-950 via-amber-950 to-orange-950",
    icon: <Layers3 className="h-5 w-5" />,
    bullets: [
      "Quiz what matters",
      "Focus on missed ideas",
      "See progress without guessing",
    ],
  },
  {
    id: "finish",
    eyebrow: "Ready",
    title: "Pick up where you left off.",
    description:
      "After this tour, you can jump into chat, study mode, or your library and continue with the same context instead of starting over.",
    accent: "from-slate-950 via-blue-950 to-indigo-950",
    icon: <Compass className="h-5 w-5" />,
    bullets: [
      "Resume faster",
      "Stay in one workflow",
      "Keep the next step obvious",
    ],
  },
];

const SWIPE_THRESHOLD = 50;

export function MobileOnboarding() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isAssistantPath = isAssistantRoute(location.pathname);

    if (!isMobile || !isAssistantPath) {
      setIsVisible(false);
      return;
    }

    const seen = localStorage.getItem("cryonex_mobile_onboarding_seen");
    const optOut = localStorage.getItem("cryonex_tour_opt_out");

    if (!seen && !optOut) {
      const timer = setTimeout(() => setIsVisible(true), 420);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("cryonex_mobile_onboarding_seen", "true");
  };

  const handleSkip = () => {
    handleComplete();
  };

  const goToSlide = (index: number) => {
    if (index < 0 || index >= slides.length) return;
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const { offset, velocity } = info;

    if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      if (currentSlide < slides.length - 1) {
        goToSlide(currentSlide + 1);
      }
    } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
      }
    }
  };

  if (!isVisible) return null;

  const isLastSlide = currentSlide === slides.length - 1;
  const slide = slides[currentSlide];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 42 : -42,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 42 : -42,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] pointer-events-none md:hidden"
        >
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
            className={cn(
              "absolute inset-0 opacity-45 bg-gradient-to-b",
              slide.accent,
            )}
          />

          <div className="absolute inset-0 bg-[rgba(6,9,14,0.74)] backdrop-blur-[8px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.07),transparent_34%),radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.08),transparent_22%),radial-gradient(circle_at_85%_72%,rgba(251,191,36,0.07),transparent_26%)]" />

          <div className="absolute inset-0">
            <div className="absolute left-[-18%] top-[12%] h-56 w-56 rounded-full bg-white/8 blur-3xl" />
            <div className="absolute right-[-16%] top-[38%] h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute bottom-[-10%] left-[10%] h-52 w-52 rounded-full bg-amber-300/8 blur-3xl" />
          </div>

          <div className="relative flex h-full flex-col px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <div className="pointer-events-auto flex items-center justify-between pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-white/74 uppercase">
                {slide.eyebrow}
              </div>
              <button
                onClick={handleSkip}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/10 px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-black/16 hover:text-white"
              >
                Skip
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 items-end justify-center pb-6 pt-8">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 280, damping: 28 },
                    opacity: { duration: 0.18 },
                    scale: { duration: 0.18 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.18}
                  onDragEnd={handleDragEnd}
                  className="pointer-events-auto w-full max-w-sm cursor-grab active:cursor-grabbing"
                >
                  <div className="rounded-[2rem] border border-white/12 bg-[rgba(10,12,18,0.42)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/12 bg-white/8 text-white">
                        {slide.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/50">
                          {currentSlide + 1} of {slides.length}
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-[-0.04em] text-white">
                          {slide.title}
                        </h1>
                      </div>
                    </div>

                    <p className="mt-4 text-[15px] leading-7 text-white/72">
                      {slide.description}
                    </p>

                    <div className="mt-5 grid gap-2">
                      {slide.bullets.map((bullet) => (
                        <div
                          key={bullet}
                          className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-cyan-300/90" />
                          <span className="text-sm text-white/78">
                            {bullet}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="pointer-events-auto space-y-4 pb-1">
              <div className="flex items-center justify-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      idx === currentSlide
                        ? "w-8 bg-white"
                        : "w-2 bg-white/30 hover:bg-white/55",
                    )}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex justify-center">
                {isLastSlide ? (
                  <Button
                    onClick={handleComplete}
                    className="h-14 px-8 rounded-full bg-white text-slate-950 hover:bg-white/92 font-semibold text-base shadow-none"
                  >
                    <span className="flex items-center gap-2">
                      Open Cryonex
                      <Sparkles className="h-4 w-4" />
                    </span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => goToSlide(currentSlide + 1)}
                    className="h-14 px-8 rounded-full border border-white/14 bg-white/10 text-white backdrop-blur-md hover:bg-white/16 font-semibold text-base shadow-none"
                  >
                    <span className="flex items-center gap-2">
                      Next
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </Button>
                )}
              </div>

              <p className="text-center text-[11px] tracking-[0.12em] text-white/45 uppercase">
                Swipe left or tap next
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
