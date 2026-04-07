import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const surfaceVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

interface MobileDashboardSurfaceProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function MobileDashboardSurface({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: MobileDashboardSurfaceProps) {
  return (
    <motion.section
      variants={surfaceVariants}
      className={cn(
        "mobile-premium-surface overflow-hidden rounded-[30px] p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400/60">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-[1.2rem] font-bold tracking-[-0.04em] text-white sm:text-[1.45rem]">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-white/48">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className={cn("relative z-10 mt-5", bodyClassName)}>{children}</div>
    </motion.section>
  );
}

interface MobileDashboardActionCardProps {
  title: string;
  description: string;
  meta?: string;
  icon: LucideIcon;
  onClick: () => void;
  accent?: boolean;
  className?: string;
}

export function MobileDashboardActionCard({
  title,
  description,
  meta,
  icon: Icon,
  onClick,
  accent = false,
  className,
}: MobileDashboardActionCardProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group mobile-premium-surface flex h-full min-h-[156px] flex-col rounded-[26px] p-4 text-left transition-all duration-200",
        accent
          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/5 hover:bg-cyan-500/15"
          : "text-white hover:border-white/[0.12]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors",
            accent
              ? "border-cyan-500/40 bg-cyan-500 text-white"
              : "border-white/[0.08] bg-white/[0.05] text-white/50 group-hover:text-white",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight
          className={cn(
            "h-4 w-4 transition-transform group-hover:translate-x-1",
            accent
              ? "text-cyan-400"
              : "text-white/20 group-hover:text-white/50",
          )}
        />
      </div>

      <div className="relative z-10 mt-4 flex-1">
        {meta ? (
          <p
            className={cn(
              "text-[9px] font-bold uppercase tracking-[0.2em]",
              accent ? "text-cyan-400/50" : "text-white/20",
            )}
          >
            {meta}
          </p>
        ) : null}
        <h3 className="mt-2 text-base font-bold tracking-tight text-current">
          {title}
        </h3>
        <p
          className={cn(
            "mt-1.5 text-[12px] leading-relaxed",
            accent ? "text-cyan-200/40" : "text-white/40",
          )}
        >
          {description}
        </p>
      </div>
    </motion.button>
  );
}
