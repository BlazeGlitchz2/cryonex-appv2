import { Button } from "@/components/ui/button";
import { Sparkles, Image as ImageIcon, FileText, Brain, Zap, Code2, ArrowRight, Wand2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function MobileHome() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const quickActions = [
    {
      icon: ImageIcon,
      label: "Image",
      desc: "AI Visuals",
      gradient: "from-pink-500 via-rose-500 to-orange-400",
      bg: "bg-gradient-to-br from-pink-500/20 to-rose-500/10",
      prompt: "generate an image of a golden robot"
    },
    {
      icon: FileText,
      label: "Write",
      desc: "Content",
      gradient: "from-blue-500 via-cyan-500 to-teal-400",
      bg: "bg-gradient-to-br from-blue-500/20 to-cyan-500/10",
      prompt: "Help me write content"
    },
    {
      icon: Code2,
      label: "Code",
      desc: "Development",
      gradient: "from-emerald-500 via-green-500 to-lime-400",
      bg: "bg-gradient-to-br from-emerald-500/20 to-green-500/10",
      prompt: "Help me write code"
    },
    {
      icon: Brain,
      label: "Think",
      desc: "Ideation",
      gradient: "from-orange-500 via-amber-500 to-yellow-400",
      bg: "bg-gradient-to-br from-orange-500/20 to-amber-500/10",
      prompt: "Help me brainstorm ideas"
    },
  ];

  const suggestions = [
    { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-500/10", text: "Create an AI-powered tool" },
    { icon: Sparkles, color: "text-purple-400", bg: "bg-purple-500/10", text: "Design a mobile app concept" },
    { icon: Wand2, color: "text-cyan-400", bg: "bg-cyan-500/10", text: "Generate a creative story" }
  ];

  const handleQuickAction = (prompt: string) => {
    navigate('/app', { state: { initialMessage: prompt } });
  };

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto mobile-scroll-hidden">
      <div className="px-5 pt-4 pb-36 space-y-8">

        {/* Minimal Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full animate-breathe" />
              <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg">
                <img src="/assets/cryonex-logo-official.png" alt="Cryonex" className="h-9 w-9 object-contain" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Hey{user?.name ? `, ${user.name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-sm text-white/40 font-medium">What's on your mind?</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions - Clean Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Quick Start</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((item, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.15 + idx * 0.05 }}
                onClick={() => handleQuickAction(item.prompt)}
                className="flex flex-row items-center gap-3 p-4 rounded-2xl mobile-card-premium active:scale-95 transition-transform"
              >
                <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className="h-6 w-6 text-white/90" />
                </div>
                <span className="text-sm font-semibold text-white/90">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Hero Pro Card - Refined */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl"
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-indigo-600/90 to-blue-700/90" />

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-400/10 rounded-full blur-2xl -ml-12 -mb-12" />

          {/* Content */}
          <div className="relative z-10 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-white text-sm font-bold">Cryonex Pro</span>
                  <p className="text-white/60 text-xs">Unlimited Power</p>
                </div>
              </div>
            </div>

            <p className="text-white/80 text-sm mb-5 leading-relaxed">
              Unlock unlimited AI generations, priority processing, and exclusive models.
            </p>

            <Button
              className="w-full bg-white text-indigo-700 hover:bg-white/95 rounded-2xl font-bold h-12 text-sm shadow-xl shadow-black/20"
              onClick={() => navigate('/settings')}
            >
              <span className="flex items-center gap-2">
                Upgrade Now
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </motion.div>

        {/* Suggestions - Minimal List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Try These</h2>

          <div className="space-y-2">
            {suggestions.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                onClick={() => handleQuickAction(item.text)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl mobile-card-premium active:scale-[0.98] transition-transform text-left"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <p className="text-sm text-white/80 flex-1 font-medium">{item.text}</p>
                <ArrowRight className="h-4 w-4 text-white/20 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Start Chat CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-2"
        >
          <button
            onClick={() => navigate('/app')}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 active:scale-[0.98] transition-transform"
          >
            <MessageCircle className="h-5 w-5 text-white/40" />
            <span className="text-sm text-white/50 font-medium">Or just start typing...</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
