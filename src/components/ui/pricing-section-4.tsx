import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  PRICING_NOTES,
  PRICING_PLANS,
  getUnifiedCryoCredits,
  type BillingPeriod,
  type PricingPlan,
} from "@/lib/pricing";

function PricingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
}) {
  const options: BillingPeriod[] = ["monthly", "yearly"];

  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5",
              active ? "text-white" : "text-white/60 hover:text-white/80",
            )}
          >
            {active && (
              <motion.span
                layoutId="pricing-period"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_12px_40px_rgba(34,211,238,0.28)]"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative z-10 capitalize">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

function PlanCard({
  plan,
  period,
  index,
}: {
  plan: PricingPlan;
  period: BillingPeriod;
  index: number;
}) {
  const price = plan.prices[period];
  const isSpotlight = Boolean(plan.spotlight);
  const allowanceCopy = useMemo(() => {
    const totalCryo = getUnifiedCryoCredits(plan.allowance);

    if (plan.id === "FREE") {
      return `${totalCryo} starter credits for real study sessions`;
    }

    if (plan.id === "PLUS") {
      return `${totalCryo} monthly credits for steady weekly study`;
    }

    return `${totalCryo} monthly credits with higher study limits`;
  }, [plan]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: index * 0.08 }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(8,10,20,0.96),rgba(7,11,27,0.92))] py-0 text-white shadow-[0_24px_70px_rgba(3,8,23,0.45)]",
          isSpotlight &&
            "border-cyan-400/40 shadow-[0_28px_90px_rgba(14,165,233,0.28)]",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_38%)]" />

        <CardHeader className="relative gap-4 border-b border-white/8 pb-6 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
                {plan.eyebrow}
              </p>
              <CardTitle className="mt-3 text-3xl tracking-[-0.04em]">
                {plan.name}
              </CardTitle>
            </div>

            {(plan.spotlight || plan.badge) && (
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]",
                  isSpotlight
                    ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-100"
                    : "border-white/12 bg-white/6 text-white/70",
                )}
              >
                {plan.spotlight || plan.badge}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-end gap-3">
              <div className="text-4xl font-semibold tracking-[-0.06em] text-white">
                {price.sar}
              </div>
              <span className="pb-1 text-sm text-white/55">
                {price.cadenceLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-white/55">
              <span>{price.egp}</span>
              {price.usdFallback && <span>• {price.usdFallback} fallback</span>}
            </div>
          </div>

          <CardDescription className="max-w-sm text-sm leading-7 text-white/68">
            {plan.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative flex h-full flex-col gap-6 px-6 pb-6 pt-6">
          <Button
            asChild
            className={cn(
              "h-12 w-full rounded-xl text-sm font-semibold",
              isSpotlight
                ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                : "border border-white/12 bg-white/[0.07] text-white hover:bg-white/[0.12]",
            )}
          >
            <Link to={plan.ctaHref}>
              {plan.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Zap className="h-4 w-4 text-cyan-300" />
              <span>{allowanceCopy}</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-white/50">
              {plan.footnote}
            </p>
          </div>

          <div className="space-y-3">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 p-1">
                  <Check className="h-3 w-3 text-cyan-200" />
                </div>
                <p className="text-sm leading-6 text-white/72">{feature}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PricingSection4() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  return (
    <section
      id="pricing"
      className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#050816] px-5 py-10 text-white shadow-[0_28px_90px_rgba(4,8,22,0.42)] sm:px-8 lg:px-10 lg:py-12"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-cyan-400/14 blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-blue-500/16 blur-[120px]" />

      <div className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/16 bg-cyan-400/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-100/82">
            <Sparkles className="h-4 w-4" />
            Free to start
          </span>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
            Plans built for steady studying, not surprise costs.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-white/66 sm:text-base">
            Start free, upgrade when Cryonex becomes part of your weekly
            routine, and keep expensive image, video, and music tools separate
            from the core study plan.
          </p>

          <div className="mt-7">
            <PricingToggle value={period} onChange={setPeriod} />
          </div>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} period={period} index={index} />
          ))}
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-3">
          {PRICING_NOTES.map((note) => (
            <div
              key={note}
              className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/60"
            >
              {note}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
