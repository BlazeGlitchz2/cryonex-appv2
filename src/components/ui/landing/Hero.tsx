import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type HeroProps = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCTA: () => void;
};

export default function HeroLanding({ title, subtitle, ctaLabel, onCTA }: HeroProps) {
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          {subtitle}
        </p>
        <div className="mt-6">
          <Button
            onClick={onCTA}
            aria-label="Start Studying"
            className="inline-flex items-center rounded-lg px-5 py-3 bg-white text-black hover:bg-white/90 border border-white/20 transition shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            type="button"
          >
            {ctaLabel}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}