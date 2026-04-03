import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isGuestPreviewMode } from "@/lib/auth-redirect";
import { needsOnboarding } from "@/lib/onboarding";

export function useChatEffects(
  convex: any,
  user: any,
  handleSend: (text: string) => void,
) {
  const location = useLocation();
  const navigate = useNavigate();
  const [initialMessageProcessed, setInitialMessageProcessed] = useState(false);
  const upgradeToKimi = useMutation(api.users.upgradeToKimiGuest);

  // Keep the native keyboard behavior from src/lib/mobile.ts intact.
  useEffect(() => {
    if (Capacitor.getPlatform() === "ios") {
      Keyboard.setScroll({ isDisabled: false });
    }
  }, []);

  // Initial Message Handling
  useEffect(() => {
    const state = location.state as { initialMessage?: string } | null;
    if (state?.initialMessage && !initialMessageProcessed) {
      setInitialMessageProcessed(true);
      navigate(location.pathname, { replace: true, state: {} });
      handleSend(state.initialMessage);
    }
  }, [
    location.state,
    initialMessageProcessed,
    navigate,
    location.pathname,
    handleSend,
  ]);

  // Onboarding Redirection
  useEffect(() => {
    if (
      needsOnboarding(user) &&
      !isGuestPreviewMode() &&
      !location.pathname.includes("/onboarding")
    ) {
      navigate("/onboarding");
    }
  }, [user, navigate, location.pathname]);

  // KIMI Guest Upgrade
  useEffect(() => {
    if (user && localStorage.getItem("kimi_guest_pending") === "true") {
      upgradeToKimi()
        .then(() => {
          localStorage.removeItem("kimi_guest_pending");
          toast.success("KIMI Guest Mode Activated!");
        })
        .catch((err) => {
          console.error("Failed to upgrade to KIMI guest:", err);
          localStorage.removeItem("kimi_guest_pending");
        });
    }
  }, [user, upgradeToKimi]);
}
