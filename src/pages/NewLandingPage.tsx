import { useEffect } from "react";

import { HeroSection } from "@/components/ui/hero-section-1";

export default function NewLandingPage() {
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
    window.scrollTo({ top: 0, behavior: "auto" });

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overflowX = previousBodyOverflowX;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.scrollBehavior =
        previousHtmlScrollBehavior;
    };
  }, []);

  return <HeroSection />;
}
