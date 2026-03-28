import { useEffect } from "react";
import { useConvex } from "convex/react";
import { Capacitor } from "@capacitor/core";

export const UpdateChecker = () => {
  const convex = useConvex();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;

    const scheduleCheck = () => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        import("../services/UpdateService")
          .then(({ UpdateService }) => {
            if (cancelled) {
              return;
            }

            const updateService = new UpdateService(convex);
            void updateService.checkForUpdates();
          })
          .catch((err) => {
            console.error("Failed to load UpdateService:", err);
          });
      }, 15000);
    };

    if ("requestIdleCallback" in window) {
      (window as Window & typeof globalThis & {
        requestIdleCallback?: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
      }).requestIdleCallback?.(scheduleCheck, { timeout: 5000 });
    } else {
      scheduleCheck();
    }

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [convex]);

  return null;
};
