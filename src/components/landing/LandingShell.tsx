import { useEffect, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import "@/components/landing/landing.css";
import { usePlatformExperience } from "@/lib/platform-experience";

interface LandingShellProps {
  children: ReactNode;
}

export function LandingShell({ children }: LandingShellProps) {
  const platformExperience = usePlatformExperience();

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverflowX = document.body.style.overflowX;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlScrollBehavior =
      document.documentElement.style.scrollBehavior;

    document.body.style.overflow = "auto";
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflow = "auto";
    document.documentElement.style.scrollBehavior = "smooth";

    if (window.location.hash === "#pricing") {
      requestAnimationFrame(() => {
        document.getElementById("pricing")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overflowX = previousBodyOverflowX;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.scrollBehavior =
        previousHtmlScrollBehavior;
    };
  }, []);

  return (
    <div className="landing-shell landing-film-grain relative min-h-screen overflow-x-hidden text-white selection:bg-cyan-300/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="landing-grid absolute inset-0 opacity-90" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 px-5 py-5 sm:px-8 lg:px-10">
        <div className="editorial-panel mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 py-3 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-100/14 bg-white/6">
              <img
                src="/assets/cryonex-logo-official.png"
                alt="Cryonex"
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100/55">
                Cryonex
              </p>
              <p className="text-sm font-medium text-white/70">
                {platformExperience.shellBadge}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#pricing"
              className="rounded-full px-4 py-2 text-sm font-medium text-white/65 transition-colors hover:text-white"
            >
              Pricing
            </a>
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-white/65 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-100/14 bg-white/8 px-4 py-2 text-sm font-semibold text-white"
            >
              {platformExperience.landingPrimaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>
    </div>
  );
}

export default LandingShell;
