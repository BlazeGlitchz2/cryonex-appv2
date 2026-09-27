import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";

import PricingSection4 from "@/components/ui/pricing-section-4";
import { BrandMark } from "@/components/BrandMark";
import { AppearanceToggle } from "@/components/AppearanceToggle";

export default function PlansPage() {
  return (
    <div className="cx-plans-page h-[100dvh] overflow-y-auto overflow-x-hidden text-foreground">
      <div className="relative z-10">
        <header className="px-5 py-5 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-3xl border border-border bg-card/80 px-4 py-3 backdrop-blur-xl sm:rounded-full sm:px-5">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-sm font-semibold text-foreground"
            >
              <BrandMark />
              <span className="hidden sm:inline">Cryonex pricing</span>
            </Link>

            <div className="flex items-center gap-3">
              <AppearanceToggle />
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:px-4"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <Link
                to="/login"
                className="cx-solid-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <main className="px-5 pb-12 pt-2 sm:px-8 lg:px-10 lg:pb-16">
          <div className="mx-auto max-w-7xl">
            <PricingSection4 />
          </div>
        </main>
      </div>
    </div>
  );
}
