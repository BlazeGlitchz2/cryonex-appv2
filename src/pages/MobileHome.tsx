import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  LayoutGrid,
  Scan,
  Sparkles,
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
import {
  MobileDesktopHero,
  MobileDesktopPage,
  MobileDesktopSectionIntro,
} from "@/components/mobile/MobileDesktopSurface";

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
      bg: "bg-gradient-to-br from-violet-500/18 to-blue-500/8",
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
      color: "text-blue-300",
      bg: "bg-blue-500/10",
      text: `Explain the hardest ${learnerProfile.focusSubject.toLowerCase()} concept simply, then test me with three questions`,
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
      <MobileDesktopPage className="pb-[calc(env(safe-area-inset-bottom,0px)+9rem)]">
        <div
          style={{
            paddingTop: isNativePlatform()
              ? isAndroidNative()
                ? "calc(env(safe-area-inset-top, 24px) + 92px)"
                : "calc(env(safe-area-inset-top, 0px) + 104px)"
              : "104px",
          }}
        >
          <MobileDesktopHero
            badge={
              <>
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {platformDescriptor.badge}
              </>
            }
            title={
              <>
                {greeting}, {learnerProfile.firstName}.
              </>
            }
            description={
              <>
                {platformDescriptor.mobileHeadline}{" "}
                {learnerProfile.profileSummary}
              </>
            }
            meta={
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                    Today
                  </p>
                  <span className="rounded-full border border-border bg-foreground/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/50">
                    {platformDescriptor.label}
                  </span>
                </div>
                <div className="grid gap-2">
                  {mobileRituals.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-border bg-foreground/[0.04] px-3 py-3"
                    >
                      <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/36">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground/84">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <p className="text-[13px] leading-6 text-foreground/60 md:text-sm md:leading-7">
              {learnerProfile.profileTitle}. Start with a source, then use the
              smaller actions below when you need a quiz or a sprint.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={() =>
                  navigate("/study/dashboard?action=scan#mobile-capture-lane")
                }
                className="tactile-button h-11 rounded-[18px] md:h-12 md:rounded-[20px]"
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
                Open dashboard
              </Button>
            </div>
          </MobileDesktopHero>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <MobileDesktopSectionIntro
            eyebrow="Quick actions"
            title="Three useful next moves"
            description="Keep the home view focused: capture first, then test or plan from your latest material."
          />

          <div className="grid gap-3 md:grid-cols-3">
            {quickActions.map((item, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.32, delay: 0.12 + idx * 0.04 }}
                onClick={() => handleQuickAction(item)}
                whileTap={{ scale: 0.98 }}
                className="mobile-native-button cyber-tactile-card flex min-h-[8.75rem] flex-col items-start gap-3 rounded-[1.25rem] p-4 text-left transition-all duration-150 hover:bg-white/[0.07] active:scale-[0.98] md:min-h-[9.5rem]"
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
          <MobileDesktopSectionIntro
            eyebrow="Suggested prompts"
            title="Use only when you want the copilot"
            description="Two personalized prompts are enough to get unstuck without turning home into a menu."
          />

          <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
            {suggestions.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.05 }}
                onClick={() => handleQuickAction(item)}
                whileTap={{ scale: 0.98 }}
                className="mobile-native-button cyber-tactile-card flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.98] md:min-h-[6.75rem] md:p-5"
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
      </MobileDesktopPage>
    </div>
  );
}
