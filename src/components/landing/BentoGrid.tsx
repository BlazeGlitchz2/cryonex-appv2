import {
  Brain,
  Zap,
  Shield,
  Code2,
  Sparkles,
  Image as ImageIcon,
  MessageSquare,
  BookOpen,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GlowingEffect } from "@/components/ui/glowing-effect";

interface BentoCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
  gradient?: string;
  delay?: number;
}

const BentoCard = ({
  title,
  description,
  icon: Icon,
  className,
  gradient,
  delay = 0,
}: BentoCardProps) => (
  <div
    className={cn(
      "relative h-full rounded-[1.25rem] border-[0.75px] border-white/10 p-2 md:rounded-[1.5rem] md:p-3",
      className,
    )}
  >
    <GlowingEffect
      spread={40}
      glow={true}
      disabled={false}
      proximity={64}
      inactiveZone={0.01}
      borderWidth={3}
    />
    <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white/10">
      <div className="relative flex flex-1 flex-col justify-between gap-3">
        <div
          className={cn(
            "w-fit rounded-lg border-[0.75px] border-white/20 bg-white/10 p-2 text-white shadow-lg",
            gradient ? "text-white" : "text-blue-400",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-3">
          <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-white">
            {title}
          </h3>
          <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-white/60">
            {description}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export const BentoGrid = () => {
  return (
    <section className="py-24 relative z-10">
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl lg:text-6xl">
            <span className="text-white">Everything you need to </span>
            <span className="text-white">create</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/50">
            A complete suite of AI-powered tools designed to amplify your
            creativity and productivity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 lg:gap-6 max-w-7xl mx-auto">
          {/* Large Card - Multi-Model Chat */}
          <BentoCard
            title="Multi-Model AI Chat"
            description="Access GPT-4, Claude 3, Gemini, and 50+ open-source models. Switch between them instantly to find the perfect intelligence for your task."
            icon={MessageSquare}
            className="md:col-span-2 md:row-span-2 min-h-[300px]"
            gradient="from-blue-600 to-indigo-600"
            delay={0.1}
          />

          {/* Medium Card - Image Generation */}
          <BentoCard
            title="AI Image Generation"
            description="Create stunning visuals with Midjourney, DALL-E 3, and Stable Diffusion XL."
            icon={ImageIcon}
            className="md:col-span-1 md:row-span-1"
            gradient="from-pink-500 to-rose-500"
            delay={0.2}
          />

          {/* Medium Card - Code Assistant */}
          <BentoCard
            title="Intelligent Coding"
            description="Write, debug, and explain code in any language with context-aware AI assistance."
            icon={Code2}
            className="md:col-span-1 md:row-span-1"
            gradient="from-blue-500 to-cyan-500"
            delay={0.3}
          />

          {/* Small Card - Study Tools */}
          <BentoCard
            title="Smart Study"
            description="Turn PDFs into flashcards and quizzes automatically."
            icon={BookOpen}
            className="md:col-span-1 md:row-span-1"
            gradient="from-emerald-500 to-teal-500"
            delay={0.4}
          />

          {/* Small Card - Privacy */}
          <BentoCard
            title="Privacy First"
            description="Your data stays yours. No training on your conversations."
            icon={Shield}
            className="md:col-span-1 md:row-span-1"
            gradient="from-orange-500 to-amber-500"
            delay={0.5}
          />

          {/* Small Card - Speed */}
          <BentoCard
            title="Lightning Fast"
            description="Edge-optimized inference for near-instant responses."
            icon={Zap}
            className="md:col-span-1 md:row-span-1"
            gradient="from-yellow-500 to-orange-500"
            delay={0.6}
          />
        </div>
      </div>
    </section>
  );
};
