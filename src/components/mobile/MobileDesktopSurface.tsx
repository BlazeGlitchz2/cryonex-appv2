import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileDesktopPage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-h-full overflow-x-hidden px-3 pt-3 sm:px-4 md:px-6 md:pt-5",
        className,
      )}
      style={{
        paddingBottom:
          "calc(var(--phone-page-bottom, env(safe-area-inset-bottom, 0px) + 9.5rem) + 2.25rem)",
      }}
    >
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_26%),radial-gradient(circle_at_82%_14%,rgba(56,189,248,0.08),transparent_22%),linear-gradient(180deg,#08111d_0%,#08111c_42%,#060c15_100%)]" />
        <div className="absolute left-[-18%] top-[4%] h-72 w-72 rounded-full bg-cyan-400/6 blur-[110px]" />
        <div className="absolute right-[-14%] top-[22%] h-64 w-64 rounded-full bg-sky-300/5 blur-[118px]" />
        <div className="absolute bottom-[10%] left-[16%] h-60 w-60 rounded-full bg-white/[0.03] blur-[124px]" />
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
        }}
        className="relative z-10 mx-auto max-w-2xl space-y-3 md:max-w-5xl md:space-y-4 lg:max-w-6xl"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function MobileDesktopHero({
  badge,
  title,
  description,
  meta,
  children,
}: {
  badge: ReactNode;
  title: ReactNode;
  description: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <motion.section
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
      }}
      className="deepshi-panel overflow-hidden rounded-[30px] border border-border p-4 sm:p-5 md:p-6"
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.16fr)_minmax(250px,0.84fr)] md:gap-5">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/60">
            {badge}
          </div>
          <div className="space-y-3">
            <h1 className="max-w-[12ch] text-[2.15rem] font-semibold leading-[0.95] tracking-[-0.07em] text-foreground sm:text-[2.45rem] lg:text-[2.85rem]">
              {title}
            </h1>
            <p className="max-w-xl text-[14px] leading-6 text-foreground/72 sm:text-[15px] md:text-[16px] md:leading-7">
              {description}
            </p>
          </div>
          {children}
        </div>

        {meta ? (
          <div className="mobile-premium-surface rounded-[24px] p-3 md:p-4">
            {meta}
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

export function MobileDesktopMetaList({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; value: string; detail?: string }>;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/40">
          {title}
        </p>
        <span className="rounded-full border border-border bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/60">
          Desktop parity
        </span>
      </div>
      <div className="grid gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-border bg-foreground/[0.04] px-3 py-3"
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-foreground/36">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground/88">
              {item.value}
            </p>
            {item.detail ? (
              <p className="mt-1 text-[12px] leading-5 text-foreground/52">
                {item.detail}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileDesktopJumpRail({
  title,
  actions,
  className,
}: {
  title: string;
  actions: Array<{
    label: string;
    detail: string;
    onClick: () => void;
    accent?: boolean;
  }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[26px] border border-border bg-card/80 p-3 shadow-[0_20px_60px_rgba(4,2,18,0.32)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-foreground/34">
          {title}
        </p>
        <span className="rounded-full border border-border bg-foreground/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-foreground/50">
          Quick jump
        </span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={cn(
              "mobile-native-button rounded-[22px] border px-4 py-3 text-left transition-colors",
              action.accent
                ? "border-primary/25 bg-primary/10 text-primary"
                : "border-border bg-foreground/[0.03] text-foreground hover:bg-foreground/[0.06]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold">{action.label}</p>
                <p
                  className={cn(
                    "mt-1 text-[11px] leading-5",
                    action.accent ? "text-primary/80" : "text-foreground/52",
                  )}
                >
                  {action.detail}
                </p>
              </div>
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export function MobileDesktopSectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/42">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-lg font-bold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-foreground/56">{description}</p>
    </div>
  );
}
