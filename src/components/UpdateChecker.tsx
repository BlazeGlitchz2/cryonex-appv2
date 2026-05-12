import { useEffect } from "react";
import { useConvex } from "convex/react";
import { isNativePlatform } from "@/lib/platform-runtime";

export const UpdateChecker = () => {
  const convex = useConvex();

  useEffect(() => {
    if (!isNativePlatform()) {
      return;
    }

    let cancelled = false;
    let timeoutId: number | undefined;
    let idleCallbackId: number | undefined;

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

    const initializeUpdateCheck = async () => {
      if (import.meta.env.DEV) {
        return;
      }

      try {
        const { Device } = await import("@capacitor/device");
        const deviceInfo = await Device.getInfo();

        if (deviceInfo.isVirtual) {
          return;
        }
      } catch (error) {
        console.warn(
          "Failed to determine device type for update checks:",
          error,
        );
      }

      if (cancelled) {
        return;
      }

      if ("requestIdleCallback" in window) {
        idleCallbackId = (
          window as Window &
            typeof globalThis & {
              requestIdleCallback?: (
                callback: IdleRequestCallback,
                options?: IdleRequestOptions,
              ) => number;
            }
        ).requestIdleCallback?.(scheduleCheck, { timeout: 5000 });
        return;
      }

      scheduleCheck();
    };

    void initializeUpdateCheck();

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      if (idleCallbackId !== undefined && "cancelIdleCallback" in window) {
        (
          window as Window &
            typeof globalThis & {
              cancelIdleCallback?: (handle: number) => void;
            }
        ).cancelIdleCallback?.(idleCallbackId);
      }
    };
  }, [convex]);

  return null;
};
