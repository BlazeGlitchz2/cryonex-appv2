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
    <div className="inline-flex rounded-full border border-border bg-muted p-1">
      {options.map((option) => {
        const active = value === option;
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option)}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm font-medium transition-colors sm:px-5",
              active
                ? "cx-solid-button-text"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="pricing-period"
                className="absolute inset-0 rounded-full cx-solid-button"
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
          "relative h-full overflow-hidden rounded-[28px] border-border bg-card py-0 text-foreground shadow-sm",
          isSpotlight && "border-primary/50 shadow-lg shadow-primary/10",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_38%)]" />

        <CardHeader className="relative gap-4 border-b border-border pb-6 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
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
                    ? "border-primary/25 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground",
                )}
              >
                {plan.spotlight || plan.badge}
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-end gap-3">
              <div className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
                {price.sar}
              </div>
              <span className="pb-1 text-sm text-muted-foreground">
                {price.cadenceLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{price.egp}</span>
              {price.usdFallback && <span>• {price.usdFallback} fallback</span>}
            </div>
          </div>

          <CardDescription className="max-w-sm text-sm leading-7 text-muted-foreground">
            {plan.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="relative flex h-full flex-col gap-6 px-6 pb-6 pt-6">
          <Button
            asChild
            className={cn(
              "h-12 w-full rounded-full text-sm font-semibold",
              isSpotlight
                ? "cx-solid-button hover:opacity-90"
                : "border border-border bg-muted text-foreground hover:bg-accent",
            )}
          >
            <Link to={plan.ctaHref}>
              {plan.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <div className="rounded-2xl border border-border bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Zap className="h-4 w-4 text-cyan-300" />
              <span>{allowanceCopy}</span>
            </div>
            <p className="mt-2 text-xs leading-6 text-muted-foreground">
              {plan.footnote}
            </p>
          </div>

          <div className="space-y-3">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full border border-primary/20 bg-primary/10 p-1">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <p className="text-sm leading-6 text-foreground">{feature}</p>
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
      className="relative overflow-hidden rounded-[32px] border border-border bg-card/60 px-5 py-10 text-foreground sm:px-8 lg:px-10 lg:py-12"
    >
      <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-cyan-400/14 blur-[100px]" />
      <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary/8 blur-[120px]" />

      <div className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
            <Sparkles className="h-4 w-4" />
            Free to start
          </span>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground md:text-5xl">
            Choose your Cryonex plan.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-muted-foreground sm:text-base">
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
              className="rounded-2xl border border-border bg-muted/50 px-4 py-4 text-sm leading-7 text-muted-foreground"
            >
              {note}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
