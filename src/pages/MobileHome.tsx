import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Image as ImageIcon,
  FileText,
  Brain,
  Zap,
  Code2,
  ArrowRight,
  Wand2,
  MessageCircle,
  Scan,
  CheckCircle,
  Clock,
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

  const quickActions = [
    {
      icon: Scan,
      label: "Scan PDF",
      desc: "Digitize Notes",
      gradient: "from-pink-500 via-rose-500 to-orange-400",
      bg: "bg-gradient-to-br from-pink-500/20 to-rose-500/10",
      prompt: "Help me scan and summarize a PDF",
    },
    {
      icon: CheckCircle,
      label: "Start Quiz",
      desc: "Test Knowledge",
      gradient: "from-blue-500 via-cyan-500 to-teal-400",
      bg: "bg-gradient-to-br from-blue-500/20 to-cyan-500/10",
      prompt: "Help me start a new quiz",
    },
    {
      icon: Clock,
      label: "Focus Timer",
      desc: "Deep Work",
      gradient: "from-emerald-500 via-green-500 to-lime-400",
      bg: "bg-gradient-to-br from-emerald-500/20 to-green-500/10",
      prompt: "Open focus timer",
    },
    {
      icon: Sparkles,
      label: "Generate AI",
      desc: "Smart Assist",
      gradient: "from-orange-500 via-amber-500 to-yellow-400",
      bg: "bg-gradient-to-br from-orange-500/20 to-amber-500/10",
      prompt: "Help me brainstorm ideas",
    },
  ];

  const suggestions = [
    {
      icon: Zap,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      text: "Create an AI-powered tool",
    },
    {
      icon: Sparkles,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      text: "Design a mobile app concept",
    },
    {
      icon: Wand2,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      text: "Generate a creative story",
    },
  ];

  const handleQuickAction = async (prompt: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Ignored if not running natively
    }
    navigate("/app", { state: { initialMessage: prompt } });
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto mobile-scroll-hidden relative">
      {/* Background Ambient Mesh */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-cyan-900/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[-20%] w-[140%] h-[60%] bg-indigo-900/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-[40%] left-[20%] w-[100%] h-[40%] bg-teal-900/5 blur-[100px] rounded-full pointer-events-none" />

      <div
        className="px-5 pb-36 space-y-8 relative z-10"
        style={{
          paddingTop: isNativePlatform()
            ? isAndroid()
              ? 'calc(env(safe-area-inset-top, 24px) + 8px)'
              : 'calc(env(safe-area-inset-top, 0px) + 24px)'
            : '24px',
        }}
      >
        {/* Minimal Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse-glow group-hover:bg-cyan-500/30 transition-colors" />
              <div className="relative h-14 w-14 rounded-2xl bg-[#09090b] flex items-center justify-center glass-card ring-1 ring-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                <img
                  src="/assets/cryonex-logo-official.png"
                  alt="Cryonex"
                  className="h-8 w-8 object-contain drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex flex-col">
                <span className="text-lg font-medium text-white/50">
                  {greeting},
                </span>
                <span>{user?.name ? user.name.split(" ")[0] : "Traveler"}</span>
              </h1>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - Clean Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em]">
              Start Creating
            </h2>
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
                className="flex flex-col items-start gap-3 p-5 rounded-[1.5rem] glass-card active:scale-[0.98] transition-all duration-150 hover:bg-white/[0.04]"
              >
                <div
                  className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ring-1 ring-white/5`}
                >
                  <item.icon className="h-6 w-6 text-white/90" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[15px] font-semibold text-white/90">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-white/40">{item.desc}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Suggestions - Minimal List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-5"
        >
          <h2 className="text-[11px] font-bold text-white/40 uppercase tracking-[0.2em] px-1">
            Suggestions
          </h2>

          <div className="space-y-3">
            {suggestions.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.35 + i * 0.05 }}
                onClick={() => handleQuickAction(item.text)}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl glass-card active:scale-[0.98] transition-all duration-150 text-left hover:bg-white/[0.04]"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 ring-1 ring-white/5`}
                >
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="text-[13px] text-white/70 flex-1 font-medium leading-relaxed">
                  {item.text}
                </p>
                <ArrowRight className="h-4 w-4 text-white/20 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Start Chat CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-4"
        >
          <button
            onClick={() => navigate("/app")}
            className="w-full flex items-center justify-center gap-3 p-5 rounded-[1.5rem] bg-gradient-to-r from-white/[0.04] to-white/[0.02] border border-white/[0.06] active:scale-[0.98] transition-all duration-150"
          >
            <MessageCircle className="h-5 w-5 text-white/40" />
            <span className="text-sm text-white/50 font-medium tracking-wide">
              Or just start typing...
            </span>
          </button>
        </motion.div>
      </div>
      <QuickCaptureBar />
    </div>
  );
}
