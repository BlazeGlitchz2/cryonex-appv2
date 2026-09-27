import { useEffect, useState } from "react";
import { CheckCircle2, Crown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-mobile";
import { isAssistantRoute as isAssistantMobileRoute } from "@/lib/mobile-shell";
import { isNativePlatform } from "@/lib/platform-runtime";
import { cn } from "@/lib/utils";

const ANNOUNCEMENT_STORAGE_KEY = "cryonex-abdul-sami-co-ceo-announcement-v1";
const CONSENT_STORAGE_KEY = "consent.choice.v1";

function hasConsentChoice() {
  if (typeof window === "undefined") return true;

  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) !== null;
  } catch {
    return true;
  }
}

export function AbdulSamiAnnouncement() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasCookieChoice, setHasCookieChoice] = useState(true);
  const deviceType = useDeviceType();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isAuthLikePath =
    pathname === "/auth" || pathname === "/login" || pathname === "/onboarding";
  const isAssistantPath = isAssistantMobileRoute(pathname);
  const shouldAvoidConsentBanner =
    !hasCookieChoice &&
    !isAuthLikePath &&
    !isAssistantPath &&
    !isNativePlatform();
  const useCompactPhoneCard = deviceType === "phone";
  const useNativeSafeAreaOffset = useCompactPhoneCard && isNativePlatform();

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsVisible(
      window.localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) !== "seen",
    );
    setHasCookieChoice(hasConsentChoice());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncConsentChoice = () => setHasCookieChoice(hasConsentChoice());
    window.addEventListener("storage", syncConsentChoice);
    window.addEventListener("consentChoiceChanged", syncConsentChoice);
    return () => {
      window.removeEventListener("storage", syncConsentChoice);
      window.removeEventListener("consentChoiceChanged", syncConsentChoice);
    };
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "seen");
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cryonex leadership announcement"
      className={cn(
        "fixed inset-x-4 z-[70] mx-auto max-w-md",
        "max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-border bg-card/95 p-4 text-foreground shadow-2xl backdrop-blur-xl",
        useCompactPhoneCard
          ? cn(
              "rounded-xl p-3",
              useNativeSafeAreaOffset
                ? "bottom-auto"
                : shouldAvoidConsentBanner
                  ? "bottom-[8.75rem]"
                  : "bottom-4",
            )
          : shouldAvoidConsentBanner
            ? "bottom-[8.75rem] sm:inset-x-auto sm:right-5 sm:bottom-[7.5rem]"
            : "bottom-4 sm:inset-x-auto sm:right-5 sm:bottom-5",
      )}
      style={
        useNativeSafeAreaOffset
          ? { top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }
          : undefined
      }
    >
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={dismiss}
        className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-10">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
            useCompactPhoneCard ? "h-9 w-9" : "h-11 w-11",
          )}
        >
          <Crown className={cn(useCompactPhoneCard ? "h-4 w-4" : "h-5 w-5")} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">
            Leadership update
          </p>
          <h2
            className={cn(
              "mt-1 font-black leading-tight tracking-tight",
              useCompactPhoneCard ? "text-sm" : "text-lg",
            )}
          >
            Muhammad Abdul Sami is now Cryonex Co-CEO
          </h2>
          <p
            className={cn(
              "mt-2 text-muted-foreground",
              useCompactPhoneCard ? "sr-only" : "text-sm leading-6",
            )}
          >
            An update from the Cryonex team.
          </p>
          <Button
            type="button"
            onClick={dismiss}
            className={cn(
              "tactile-button h-11 rounded-xl px-4 text-sm font-semibold",
              useCompactPhoneCard ? "mt-3" : "mt-4",
            )}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Got it
          </Button>
        </div>
      </div>
    </aside>
  );
}
