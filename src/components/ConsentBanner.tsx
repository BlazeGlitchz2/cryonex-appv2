import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { isAssistantRoute as isAssistantMobileRoute } from "@/lib/mobile-shell";
import { isNativePlatform } from "@/lib/platform-runtime";
import { useDeviceType } from "@/hooks/use-mobile";

type ConsentWindow = Window &
  typeof globalThis & {
    gtag?: (
      command: "consent",
      action: "update",
      settings: Record<string, string>,
    ) => void;
    openConsentBanner?: () => void;
  };

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const deviceType = useDeviceType();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isAssistantPath = isAssistantMobileRoute(pathname);
  const isAuthLikePath =
    pathname === "/auth" || pathname === "/login" || pathname === "/onboarding";
  const isNativeApp = isNativePlatform();
  const isPhone = deviceType === "phone";

  useEffect(() => {
    try {
      const saved = localStorage.getItem("consent.choice.v1");
      if (!saved) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("openConsentBanner", handler as EventListener);
    (window as ConsentWindow).openConsentBanner = () => setOpen(true);
    return () => {
      window.removeEventListener("openConsentBanner", handler as EventListener);
    };
  }, []);

  const updateConsent = (granted: boolean) => {
    const status = granted ? "granted" : "denied";
    try {
      localStorage.setItem(
        "consent.choice.v1",
        granted ? "accepted" : "denied",
      );
    } catch {
      // Ignore storage errors and still update the in-memory banner state.
    }
    if ((window as ConsentWindow).gtag) {
      (window as ConsentWindow).gtag?.("consent", "update", {
        ad_storage: status,
        ad_user_data: status,
        ad_personalization: status,
        analytics_storage: status,
      });
    }
    setOpen(false);
  };

  if (!open || isAssistantPath || isAuthLikePath || isNativeApp) return null;

  return (
    <div
      className="fixed inset-x-0 z-[1000] px-4"
      style={{
        bottom: isPhone
          ? "calc(env(safe-area-inset-bottom, 0px) + 5.35rem)"
          : "1rem",
      }}
    >
      <div
        className={`mx-auto rounded-2xl border border-white/10 bg-black/70 text-white shadow-2xl shadow-blue-500/10 backdrop-blur-xl ${
          isPhone ? "max-w-[22rem] rounded-[22px] p-3" : "max-w-4xl p-6"
        }`}
      >
        <div
          className={`flex gap-4 ${isPhone ? "flex-col gap-3" : "flex-col sm:flex-row sm:items-center sm:justify-between"}`}
        >
          <p
            className={`${isPhone ? "text-[12px]" : "text-sm"} leading-relaxed text-white/72`}
          >
            {isPhone
              ? "Cookies help fund Cryonex and improve the app. See our "
              : "We use cookies to deliver and measure personalized ads (Google AdSense) and improve the product. See our "}
            <a
              href="/privacy"
              className="underline hover:text-white decoration-blue-400 underline-offset-4"
            >
              Privacy Policy
            </a>
            {isPhone
              ? ". Change this anytime in settings."
              : ". You can change your choice anytime in “Cookie settings”."}
          </p>
          <div
            className={`shrink-0 ${isPhone ? "grid grid-cols-2 gap-3" : "flex items-center gap-3"}`}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateConsent(false)}
              className={`border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white ${
                isPhone ? "h-9 rounded-full px-3 text-[12px]" : ""
              }`}
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => updateConsent(true)}
              className={`bg-white font-medium text-black hover:bg-white/90 ${
                isPhone ? "h-9 rounded-full px-3 text-[12px]" : ""
              }`}
            >
              Accept all
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
