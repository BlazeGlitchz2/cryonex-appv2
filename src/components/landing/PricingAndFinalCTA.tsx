import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import type { FinalCtaContent } from "@/components/landing/landing-content";
import PricingSection4 from "@/components/ui/pricing-section-4";

interface PricingAndFinalCTAProps {
  content: FinalCtaContent;
}

export function PricingAndFinalCTA({ content }: PricingAndFinalCTAProps) {
  return (
    <>
      <section
        id="pricing"
        className="scroll-mt-28 px-5 py-8 sm:px-8 lg:px-10 lg:py-12"
      >
        <div className="editorial-panel mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] p-2">
          <PricingSection4 />
        </div>
      </section>

      <section className="px-5 pb-20 pt-6 sm:px-8 lg:px-10 lg:pb-24">
        <div className="editorial-panel mx-auto max-w-7xl rounded-[2.7rem] px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-100/64">
                {content.eyebrow}
              </p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-white md:text-5xl">
                {content.title}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/68">
                {content.body}
              </p>
              {content.trustNote ? (
                <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-cyan-100/72">
                  {content.trustNote}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to={content.primaryAction.href}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950"
              >
                {content.primaryAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to={content.secondaryAction.href}
                className="inline-flex items-center gap-2 rounded-full border border-white/14 px-6 py-3 text-sm font-semibold text-white/88"
              >
                {content.secondaryAction.label}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default PricingAndFinalCTA;
