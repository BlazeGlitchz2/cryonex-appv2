import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  LayoutGrid,
  MessageCircle,
  Scan,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { isAndroid, isNativePlatform } from "@/lib/mobile";
import { QuickCaptureBar } from "@/components/ui/QuickCaptureBar";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export default function MobileHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const greeting = getGreeting();

  const contextChips = [
    user?.country ? user.country.toUpperCase() : "GLOBAL",
    user?.curriculumTrack || user?.curriculum || "GENERAL",
    user?.schoolId || "PRIVATE",
  ].filter(Boolean);

  const quickActions = [
    {
      icon: Scan,
      label: "Scan source",
      desc: "Upload or capture a page",
      bg: "bg-gradient-to-br from-cyan-500/18 to-sky-500/8",
      prompt: "Help me scan and summarize a study source",
    },
    {
      icon: CheckCircle,
      label: "Start quiz",
      desc: "Test your weakest topic",
      bg: "bg-gradient-to-br from-violet-500/18 to-fuchsia-500/8",
      prompt: "Create a focused quiz from my latest study material",
    },
    {
      icon: Clock,
      label: "Focus sprint",
      desc: "25 minute deep work",
      bg: "bg-gradient-to-br from-emerald-500/18 to-teal-500/8",
      prompt: "Start a 25 minute focused study sprint",
    },
    {
      icon: Sparkles,
      label: "Open assistant",
      desc: "Ask Cryonex anything",
      bg: "bg-gradient-to-br from-amber-500/18 to-orange-500/8",
      prompt: "Help me study smarter with the assistant",
    },
  ];

  const suggestions = [
    {
      icon: Zap,
      color: "text-yellow-300",
      bg: "bg-yellow-500/10",
      text: "Turn this week's notes into a 45-minute revision plan",
    },
    {
      icon: BookOpen,
      color: "text-purple-300",
      bg: "bg-purple-500/10",
      text: "Rewrite my notes in simple English and Arabic",
    },
    {
      icon: Wand2,
      color: "text-cyan-300",
      bg: "bg-cyan-500/10",
      text: "Build flashcards from my last upload",
    },
  ];

  const handleQuickAction = async (prompt: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Ignored if not running natively
    }

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
        className="relative z-10 space-y-6 px-5 pb-36"
        style={{
          paddingTop: isNativePlatform()
            ? isAndroid()
              ? "calc(env(safe-area-inset-top, 24px) + 8px)"
              : "calc(env(safe-area-inset-top, 0px) + 24px)"
            : "24px",
        }}
      >
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="deepshi-panel rounded-[30px] border border-white/10 p-5 shadow-[0_24px_64px_rgba(0,0,0,0.28)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
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
                  Mobile assistant home
                </div>
                <h1 className="mt-3 text-[1.9rem] font-semibold tracking-[-0.05em] text-white">
                  {greeting}, {user?.name ? user.name.split(" ")[0] : "Traveler"}.
                </h1>
                <p className="mt-2 max-w-[26rem] text-sm leading-6 text-white/55">
                  Your study OS on mobile. Jump into the assistant, open your dashboard, or capture a source in seconds.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {contextChips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/50"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => navigate("/app")}
              className="h-12 rounded-[18px] bg-white text-black hover:bg-white/92"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Assistant
            </Button>
            <Button
              type="button"
              onClick={() => navigate("/study/dashboard")}
              className="h-12 rounded-[18px] border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
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

          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((item, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.15 + idx * 0.05 }}
                onClick={() => handleQuickAction(item.prompt)}
                whileTap={{ scale: 0.98 }}
                className="flex flex-col items-start gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-left shadow-[0_18px_48px_rgba(0,0,0,0.14)] transition-all duration-150 hover:bg-white/[0.07] active:scale-[0.98]"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.bg} ring-1 ring-white/5`}
                >
                  <item.icon className="h-5 w-5 text-white/90" />
                </div>
                <div className="flex flex-col items-start">
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

          <div className="space-y-3">
            {suggestions.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + i * 0.05 }}
                onClick={() => handleQuickAction(item.text)}
                whileTap={{ scale: 0.98 }}
                className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.98]"
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
          transition={{ duration: 0.55, delay: 0.2 }}
          className="pt-4"
        >
          <button
            onClick={() => navigate("/app")}
            className="flex w-full items-center justify-center gap-3 rounded-[1.5rem] border border-[#D072FF]/20 bg-[linear-gradient(180deg,rgba(208,114,255,0.14),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)] transition-all duration-150 active:scale-[0.98]"
          >
            <MessageCircle className="h-5 w-5 text-white/40" />
            <span className="text-sm font-medium tracking-wide text-white/72">
              Open assistant and start typing
            </span>
          </button>
        </motion.section>
      </div>

      <QuickCaptureBar />
    </div>
  );
}
