import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import Logo3D from "@/components/Logo3D";
import { useRef } from "react";
import { ArrowRight, Sparkles, Zap, Globe } from "lucide-react";

type HeroProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCTA: () => void;
};

export default function HeroLanding({
  title,
  subtitle,
  ctaLabel,
  onCTA,
}: HeroProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  return (
    <div
      ref={targetRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-10"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div style={{ opacity, y }} className="text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-200">
              Next Gen Learning
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl sm:text-7xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200"
          >
            {title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-white/90 max-w-lg leading-relaxed"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              onClick={onCTA}
              className="h-12 px-8 bg-white text-black hover:bg-white/90 rounded-full text-lg font-medium transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {ctaLabel} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 border-white/20 bg-transparent text-white hover:bg-white/10 rounded-full text-lg font-medium backdrop-blur-sm"
            >
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex items-center gap-8 text-white/80 pt-4"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              <span>Fast AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <span>Global Access</span>
            </div>
          </motion.div>
        </motion.div>

        {/* 3D Interactive Element */}
        <motion.div
          style={{ scale }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative h-full min-h-[400px] flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 to-transparent blur-3xl" />
          <Logo3D />

          {/* Floating Cards */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-10 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl w-48 hidden md:block"
          >
            <div className="h-2 w-24 bg-white/20 rounded mb-2" />
            <div className="h-2 w-32 bg-white/10 rounded" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            className="absolute bottom-20 left-0 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl w-48 hidden md:block"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="h-2 w-20 bg-white/20 rounded" />
            </div>
            <div className="h-2 w-full bg-white/10 rounded" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
