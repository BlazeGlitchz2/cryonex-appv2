import { motion } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { toast } from "sonner";
import {
  buildCurriculumPersonalization,
  hasEnhancedRegionalTrainer,
} from "@/lib/curriculumPersonalization";

export interface FeatureCard {
  id: string;
  title: string;
  desc: string;
  icon: any;
  accent: string;
  action: () => void;
  tourId?: string;
  live?: boolean;
}

export const accentMap: Record<
  string,
  { bg: string; border: string; text: string; glow: string }
> = {
  cyan: {
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    glow: "group-hover:shadow-[0_4px_20px_rgba(34,211,238,0.1)]",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    glow: "group-hover:shadow-[0_4px_20px_rgba(59,130,246,0.1)]",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "group-hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)]",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    text: "text-amber-400",
    glow: "group-hover:shadow-[0_4px_20px_rgba(245,158,11,0.1)]",
  },
};

export function DashboardFeatureCards({
  cards,
  user,
  onActivateRegional,
}: {
  cards: FeatureCard[];
  user: any;
  onActivateRegional: () => void;
}) {
  const regionalReady = hasEnhancedRegionalTrainer({
    country: user?.country,
    region: user?.region,
  });
  const trainerBlueprint = buildCurriculumPersonalization({
    country: user?.country,
    region: user?.region,
    curriculum: user?.curriculum,
    curriculumTrack: user?.curriculumTrack,
    gradeLevel: user?.gradeLevel,
    targetSubjects: user?.targetSubjects,
    targetExams: user?.targetExams,
    studyPace: user?.studyPace,
    preferredLanguage: user?.preferredLanguage,
  });

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {cards.map((card) => {
        const a = accentMap[card.accent];
        return (
          <motion.div
            key={card.id}
            id={card.tourId}
            onClick={card.action}
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "group p-5 md:p-6 glass-feature-card haptic-press hover:border-white/10 z-0",
              a.glow,
            )}
          >
            {/* Dynamic subtle gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4 mb-5">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner transition-colors duration-300",
                  a.bg,
                  a.border,
                  "group-hover:bg-opacity-20",
                )}
              >
                <card.icon className={cn("w-6 h-6", a.text)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-white leading-tight">
                    {card.title}
                  </h3>
                  {card.live && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="relative z-10 text-sm text-white/50 leading-relaxed font-medium">
              {card.desc}
            </p>
            {/* Hover arrow */}
            <div className="absolute top-6 right-6 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className={cn("w-5 h-5", a.text)} />
            </div>
          </motion.div>
        );
      })}

      {/* Regional Training — always visible, adapts to user's region */}
      {(user?.region || user?.country) && (
        <motion.div
          whileHover={{ y: -2, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={async () => {
            try {
              await Haptics.impact({ style: ImpactStyle.Light });
            } catch (e) {}
            if (regionalReady) {
              onActivateRegional();
            } else {
              toast.info("Regional training coming soon for your region!");
            }
          }}
          className={cn(
            "group p-5 md:p-6 glass-feature-card haptic-press hover:border-amber-500/30",
            "group-hover:shadow-[0_4px_20px_rgba(245,158,11,0.1)]",
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4 mb-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center border bg-amber-500/10 border-amber-500/20 shadow-inner group-hover:bg-amber-500/20 transition-colors duration-300">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white leading-tight">
                {trainerBlueprint.trainerTitle}
              </h3>
            </div>
            {regionalReady ? (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                Ready
              </span>
            ) : (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30 border border-white/10">
                Soon
              </span>
            )}
          </div>
          <p className="relative z-10 text-sm text-white/50 leading-relaxed font-medium">
            {regionalReady
              ? trainerBlueprint.trainerDescription
              : "Region-specific exam prep coming soon"}
          </p>
          <div className="absolute top-6 right-6 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight className="w-5 h-5 text-amber-400" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
