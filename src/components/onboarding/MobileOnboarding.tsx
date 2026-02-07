import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  Sparkles,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Rocket,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingSlide {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
}

const slides: OnboardingSlide[] = [
  {
    id: "welcome",
    icon: <Sparkles className="h-10 w-10" />,
    title: "Welcome to Cryonex",
    description:
      "Your AI-powered companion for learning, creating, and discovering. Let's take a quick tour!",
    gradient: "from-purple-600 via-indigo-600 to-blue-600",
    iconBg: "bg-white/20",
  },
  {
    id: "chat",
    icon: <MessageSquare className="h-10 w-10" />,
    title: "Smart AI Chat",
    description:
      "Chat with multiple AI models. Get instant answers, generate content, and brainstorm ideas.",
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    iconBg: "bg-cyan-400/20",
  },
  {
    id: "library",
    icon: <BookOpen className="h-10 w-10" />,
    title: "Your Library",
    description:
      "Upload PDFs, documents, and notes. Organize your materials and chat with them using AI.",
    gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    iconBg: "bg-emerald-400/20",
  },
  {
    id: "study",
    icon: <GraduationCap className="h-10 w-10" />,
    title: "Study Mode",
    description:
      "Focus tools for learning. Create flashcards, take quizzes, and track your progress.",
    gradient: "from-orange-500 via-pink-600 to-purple-600",
    iconBg: "bg-orange-400/20",
  },
  {
    id: "start",
    icon: <Rocket className="h-10 w-10" />,
    title: "You're All Set!",
    description:
      "Swipe up on the center button to start a new chat, or explore the navigation below.",
    gradient: "from-fuchsia-500 via-purple-600 to-indigo-600",
    iconBg: "bg-fuchsia-400/20",
  },
];

const SWIPE_THRESHOLD = 50;

export function MobileOnboarding() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Only show on mobile
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;

    // Check if already seen
    const seen = localStorage.getItem("cryonex_mobile_onboarding_seen");
    const optOut = localStorage.getItem("cryonex_tour_opt_out");

    if (!seen && !optOut) {
      // Small delay for smooth appearance
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

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
      // Swiped left - next slide
      if (currentSlide < slides.length - 1) {
        goToSlide(currentSlide + 1);
      }
    } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      // Swiped right - previous slide
      if (currentSlide > 0) {
        goToSlide(currentSlide - 1);
      }
    }
  };

  const isLastSlide = currentSlide === slides.length - 1;

  if (!isVisible) return null;

  const slide = slides[currentSlide];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] md:hidden"
        >
          {/* Dynamic Gradient Background */}
          <motion.div
            key={slide.id + "-bg"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={cn("absolute inset-0 bg-gradient-to-br", slide.gradient)}
          />

          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-40 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>

          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-12 right-6 z-10 flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm font-medium"
          >
            Skip
            <X className="h-4 w-4" />
          </button>

          {/* Content Container */}
          <div className="relative h-full flex flex-col justify-between px-8 pt-24 pb-12 safe-top safe-bottom">
            {/* Slide Content */}
            <div className="flex-1 flex items-center justify-center">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="w-full text-center cursor-grab active:cursor-grabbing"
                >
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1,
                    }}
                    className={cn(
                      "mx-auto w-24 h-24 rounded-3xl flex items-center justify-center mb-8 text-white shadow-2xl",
                      slide.iconBg,
                    )}
                  >
                    {slide.icon}
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-3xl font-bold text-white mb-4"
                  >
                    {slide.title}
                  </motion.h1>

                  {/* Description */}
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/80 text-lg leading-relaxed max-w-sm mx-auto"
                  >
                    {slide.description}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Section */}
            <div className="space-y-6">
              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToSlide(idx)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      idx === currentSlide
                        ? "w-8 bg-white"
                        : "w-2 bg-white/30 hover:bg-white/50",
                    )}
                  />
                ))}
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                {isLastSlide ? (
                  <Button
                    onClick={handleComplete}
                    className="h-14 px-10 rounded-full bg-white text-gray-900 hover:bg-white/90 font-semibold text-base shadow-xl"
                  >
                    <span className="flex items-center gap-2">
                      Get Started
                      <Rocket className="h-5 w-5" />
                    </span>
                  </Button>
                ) : (
                  <Button
                    onClick={() => goToSlide(currentSlide + 1)}
                    className="h-14 px-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 font-semibold text-base"
                  >
                    <span className="flex items-center gap-2">
                      Next
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </Button>
                )}
              </div>

              {/* Swipe Hint */}
              <p className="text-center text-white/40 text-xs">
                Swipe to navigate
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
