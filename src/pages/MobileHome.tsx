import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  LayoutGrid,
  Scan,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { useDeviceInfo } from "@/hooks/use-mobile";
import {
  getPlatformDescriptor,
  resolvePlatformFlavor,
} from "@/lib/platform-flavor";
import { isAndroidNative, isNativePlatform } from "@/lib/platform-runtime";
import { buildMobileLearnerProfile } from "@/lib/mobile-personalization";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

interface QuickAction {
  icon: typeof Scan;
  label: string;
  desc: string;
  meta: string;
  bg: string;
  path?: string;
  prompt?: string;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export default function MobileHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const deviceInfo = useDeviceInfo();
  const platformFlavor = resolvePlatformFlavor(deviceInfo);
  const platformDescriptor = getPlatformDescriptor(platformFlavor, deviceInfo);
  const learnerProfile = buildMobileLearnerProfile(user);
  const greeting = getGreeting();
  const nativeSignals = [
    {
      label: platformDescriptor.label,
      value: platformDescriptor.mobileBody,
    },
    {
      label: "Tablet",
      value:
        platformFlavor === "android"
          ? "Centered content with broader rails for Android tablets and teaching displays."
          : platformFlavor === "ios"
            ? "Wider rails, lighter chrome, and calmer grouping on iPad."
            : "Centered content with a fuller command-surface feel on the web shell.",
    },
    {
      label: "Touch",
      value:
        platformFlavor === "android"
          ? "Larger tap targets and lower visual load for shared touch hardware."
          : "Native-sized tap targets, motion, and safe-area padding.",
    },
  ];

  const contextChips = learnerProfile.chips;
  const mobileRituals = [
    {
      label: "Focus",
      value: learnerProfile.focusSubject,
    },
    {
      label: "Checkpoint",
      value: learnerProfile.checkpoint,
    },
    {
      label: "Pace",
      value: learnerProfile.paceLabel,
    },
  ];

  const quickActions: QuickAction[] = [
    {
      icon: Scan,
      label: "Scan source",
      desc: `Capture ${learnerProfile.focusSubject.toLowerCase()} notes, slides, or a whiteboard.`,
      meta: "Camera ready",
      bg: "bg-gradient-to-br from-cyan-500/18 to-sky-500/8",
      path: "/study/dashboard?action=scan#mobile-capture-lane",
    },
    {
      icon: CheckCircle,
      label: "Start quiz",
      desc: `Pressure-test ${learnerProfile.focusSubject.toLowerCase()} before ${learnerProfile.checkpoint.toLowerCase()}.`,
      meta: "Adaptive check",
      bg: "bg-gradient-to-br from-violet-500/18 to-fuchsia-500/8",
      prompt: `Create a focused ${learnerProfile.focusSubject.toLowerCase()} quiz for ${learnerProfile.checkpoint.toLowerCase()} from my latest study material.`,
    },
    {
      icon: Clock,
      label: "Focus sprint",
      desc: `Plan ${learnerProfile.sessionStyle} around ${learnerProfile.focusSubject.toLowerCase()}.`,
      meta: learnerProfile.paceLabel,
      bg: "bg-gradient-to-br from-emerald-500/18 to-teal-500/8",
      prompt: `Plan a ${learnerProfile.paceTone} mobile study session for ${learnerProfile.focusSubject.toLowerCase()} from my latest material.`,
    },
    {
      icon: BookOpen,
      label: "Build flashcards",
      desc: `Turn one source into recall reps for ${learnerProfile.checkpoint.toLowerCase()}.`,
      meta: "Recall lane",
      bg: "bg-gradient-to-br from-amber-500/18 to-orange-500/8",
      prompt: `Turn my recent study material into short ${learnerProfile.focusSubject.toLowerCase()} flashcards with exam-ready answers for ${learnerProfile.checkpoint.toLowerCase()}.`,
    },
  ];

  const suggestions = [
    {
      icon: Zap,
      color: "text-yellow-300",
      bg: "bg-yellow-500/10",
      text: `Turn my latest source into a ${learnerProfile.paceTone} revision plan for ${learnerProfile.focusSubject.toLowerCase()}`,
    },
    {
      icon: Sparkles,
      color: "text-purple-300",
      bg: "bg-purple-500/10",
      text: `Explain the hardest ${learnerProfile.focusSubject.toLowerCase()} concept simply, then test me with three questions`,
    },
    {
      icon: Wand2,
      color: "text-cyan-300",
      bg: "bg-cyan-500/10",
      text: `Build flashcards from my last upload for ${learnerProfile.checkpoint.toLowerCase()}`,
    },
  ];

  const handleQuickAction = async (action: QuickAction | { text: string }) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Ignored if not running natively
    }

    if ("path" in action && action.path) {
      navigate(action.path);
      return;
    }

    const prompt = "text" in action ? action.text : action.prompt;
    if (!prompt) return;
    navigate("/app", { state: { initialMessage: prompt } });
  };

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto mobile-scroll-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,114,255,0.10),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(61,193,255,0.10),transparent_24%),linear-gradient(180deg,#07031c_0%,#050218_56%,#040115_100%)]" />
        <div className="absolute left-[-18%] top-[8%] h-72 w-72 rounded-full bg-[#7e40ff]/10 blur-[120px]" />
        <div className="absolute right-[-12%] top-[28%] h-64 w-64 rounded-full bg-cyan-400/10 blur-[130px]" />
      </div>

      <div
        className="relative z-10 mx-auto w-full max-w-md space-y-5 px-4 pb-0 md:max-w-5xl md:space-y-6 md:px-6"
        style={{
          paddingTop: isNativePlatform()
            ? isAndroidNative()
              ? "calc(env(safe-area-inset-top, 24px) + 92px)"
              : "calc(env(safe-area-inset-top, 0px) + 104px)"
            : "104px",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 9rem)",
        }}
      >
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="deepshi-panel rounded-[28px] border border-white/10 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.28)] md:p-5 lg:p-6"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)] md:items-stretch">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-[#D072FF]/20 blur-xl" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl">
                  <img
                    src="/assets/cryonex-logo-official.png"
                    alt="Cryonex"
                    className="h-8 w-8 object-contain drop-shadow-[0_0_12px_rgba(208,114,255,0.35)]"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/52">
                  {platformDescriptor.badge}
                </div>
                <h1 className="mt-3 text-[1.75rem] font-semibold tracking-[-0.05em] text-white md:text-[2.15rem] lg:text-[2.45rem]">
                  {greeting}, {learnerProfile.firstName}.
                </h1>
                <p className="mt-2 max-w-[26rem] text-[13px] leading-6 text-white/55 md:text-sm md:leading-7">
                  {platformDescriptor.mobileHeadline}{" "}
                  {learnerProfile.profileSummary}
                </p>
              </div>
            </div>

            <div className="grid gap-2 rounded-[24px] border border-white/10 bg-black/20 p-3 md:p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                  Native feel
                </p>
                <span className="rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                  Responsive
                </span>
              </div>
              <div className="space-y-2">
                {nativeSignals.map((signal) => (
                  <div
                    key={signal.label}
                    className="rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-3"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/52">
                      {signal.label}
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-white/70 md:text-[13px]">
                      {signal.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {contextChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/50"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <Button
              type="button"
              onClick={() =>
                navigate("/study/dashboard?action=scan#mobile-capture-lane")
              }
              className="h-11 rounded-[18px] bg-white text-black hover:bg-white/92 md:h-12 md:rounded-[20px]"
            >
              <Scan className="mr-2 h-4 w-4" />
              Capture source
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/study/dashboard")}
              className="h-11 rounded-[18px] border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] md:h-12 md:rounded-[20px]"
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>

          <div className="mt-3 rounded-[22px] border border-white/8 bg-black/20 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
              Study signature
            </p>
            <p className="mt-2 text-[12px] leading-5 text-white/64 md:text-[13px]">
              {learnerProfile.profileTitle}. Start with one source, then keep
              the rest of the flow pointed at{" "}
              {learnerProfile.checkpoint.toLowerCase()}.
            </p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {mobileRituals.map((item) => (
              <div
                key={item.label}
                className="rounded-[22px] border border-white/8 bg-black/20 px-4 py-3"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                  {item.label}
                </p>
                <p className="mt-2 text-[13px] leading-5 text-white/78">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
              Quick study actions
            </h2>
            <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
              Mobile ready
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {quickActions.map((item, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.32, delay: 0.12 + idx * 0.04 }}
                onClick={() => handleQuickAction(item)}
                whileTap={{ scale: 0.98 }}
                className="flex min-h-[10.5rem] flex-col items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.14)] transition-all duration-150 hover:bg-white/[0.07] active:scale-[0.98] md:min-h-[11.5rem] md:p-5"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.bg} ring-1 ring-white/5`}
                >
                  <item.icon className="h-5 w-5 text-white/90" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">
                    {item.meta}
                  </span>
                  <span className="text-[14px] font-semibold text-white/92">
                    {item.label}
                  </span>
                  <span className="text-[11px] leading-5 text-white/42">
                    {item.desc}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
            Try next
          </h2>

          <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
            {suggestions.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.05 }}
                onClick={() => handleQuickAction(item)}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.98] md:min-h-[6.75rem] md:p-5"
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${item.bg} ring-1 ring-white/5`}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="flex-1 text-[13px] font-medium leading-relaxed text-white/70">
                  {item.text}
                </p>
                <ArrowRight className="h-4 w-4 flex-shrink-0 text-white/20" />
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16 }}
          className="pt-4"
        >
          <button
            onClick={() => navigate("/study/dashboard")}
            className="mx-auto flex w-full max-w-2xl items-center justify-center gap-3 rounded-[1.4rem] border border-[#D072FF]/20 bg-[linear-gradient(180deg,rgba(208,114,255,0.14),rgba(255,255,255,0.03))] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)] transition-all duration-150 active:scale-[0.98] md:p-5"
          >
            <LayoutGrid className="h-5 w-5 text-white/40" />
            <span className="text-sm font-medium tracking-wide text-white/72">
              Open dashboard and continue from your latest source
            </span>
          </button>
        </motion.section>
      </div>
    </div>
  );
}
