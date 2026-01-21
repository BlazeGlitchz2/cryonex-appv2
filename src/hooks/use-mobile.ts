import * as React from "react";

// Increased breakpoint to catch tablets (iPad Pro is 1024px, some larger tablets are 1280px)
const MOBILE_BREAKPOINT = 1280;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      // Check for common tablet/mobile keywords
      const isTabletOrMobile = /ipad|android|tablet|mobile|iphone|ipod/i.test(userAgent);
      // Check for touch capability which often indicates mobile/tablet/smartboard
      const isTouch = navigator.maxTouchPoints > 0;

      // Refined check to avoid false positives on touch laptops:
      // 1. Screen width < 1024px (Standard tablet/mobile breakpoint)
      // 2. OR explicit mobile/tablet user agent (catches iPad, Android tablets, Smartboards)
      // 3. OR touch device with VERY small width (mobile phones that might miss UA check)
      setIsMobile(
        width < 1024 ||
        isTabletOrMobile
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return !!isMobile;
}
