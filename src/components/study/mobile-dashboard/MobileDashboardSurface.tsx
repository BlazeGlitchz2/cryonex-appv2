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
        "overflow-hidden rounded-[28px] border border-white/[0.06] bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 shadow-[0_18px_60px_rgba(4,2,18,0.26)] backdrop-blur-xl sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white sm:text-xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/56">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className={cn("mt-4", bodyClassName)}>{children}</div>
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
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={cn(
        "group flex h-full min-h-[156px] flex-col rounded-[24px] border p-4 text-left transition-colors",
        accent
          ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/14"
          : "border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.07]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-2xl border",
            accent
              ? "border-primary/25 bg-primary/15 text-primary"
              : "border-white/[0.08] bg-white/[0.05] text-white/82",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <ArrowRight className="h-4 w-4 text-current/60 transition-transform group-hover:translate-x-0.5" />
      </div>

      <div className="mt-4 flex-1">
        {meta ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-current/42">
            {meta}
          </p>
        ) : null}
        <h3 className="mt-2 text-base font-semibold tracking-[-0.03em] text-current">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-current/64">{description}</p>
      </div>
    </motion.button>
  );
}
