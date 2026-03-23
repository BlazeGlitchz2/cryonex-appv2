import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router";

import PricingSection4 from "@/components/ui/pricing-section-4";

export default function PlansPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#02040c_0%,#050816_40%,#071022_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
        <div className="absolute left-[-10%] top-[-4rem] h-[28rem] w-[28rem] rounded-full bg-cyan-400/12 blur-[120px]" />
        <div className="absolute right-[-6%] top-[18%] h-[30rem] w-[30rem] rounded-full bg-blue-500/10 blur-[140px]" />
      </div>

      <div className="relative z-10">
        <header className="px-5 py-5 sm:px-8 lg:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur-xl">
            <Link
              to="/"
              className="inline-flex items-center gap-3 text-sm font-semibold text-white/88 transition-colors hover:text-white"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/8 shadow-[0_16px_40px_rgba(4,8,22,0.24)]">
                <img
                  src="/assets/cryonex-logo-official.png"
                  alt="Cryonex"
                  className="h-7 w-7 object-contain"
                />
              </div>
              <span>Cryonex pricing</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#050816]"
              >
                Start with Cryonex
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
