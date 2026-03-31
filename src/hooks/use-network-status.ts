import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { isNativePlatform } from "@/lib/platform-runtime";

interface NetworkStatus {
  /** Whether the device currently has internet connectivity */
  isOnline: boolean;
  /** Connection type: 'wifi', 'cellular', 'none', or 'unknown' */
  connectionType: string;
}

/**
 * Hook to reactively track network connectivity status.
 * Uses @capacitor/network on native platforms (Android/iOS)
 * and falls back to navigator.onLine + window events on web.
 */
export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState("unknown");
  const [hasInitialized, setHasInitialized] = useState(false);

  const handleOnline = useCallback(
    (online: boolean, connType?: string) => {
      const wasOffline = !isOnline;
      setIsOnline(online);
      if (connType) setConnectionType(connType);

      // Only show "back online" toast if we were previously offline AND already initialized
      if (online && wasOffline && hasInitialized) {
        void import("@/lib/mobile").then(({ hapticNotification }) => {
          hapticNotification("success");
        });
        toast.success("You're back online!", {
          id: "network-status",
          duration: 3000,
        });
      }

      // Show "went offline" toast (only after initial check)
      if (!online && hasInitialized) {
        void import("@/lib/mobile").then(({ hapticNotification }) => {
          hapticNotification("warning");
        });
        toast.error("You're offline", {
          id: "network-status",
          duration: 5000,
          description: "Some features are unavailable",
        });
      }
    },
    [isOnline, hasInitialized],
  );

  useEffect(() => {
    if (isNativePlatform()) {
      // — Native (Android / iOS) —
      let disposed = false;
      let removeListener: (() => void) | null = null;

      void import("@capacitor/network")
        .then(async ({ Network }) => {
          if (disposed) return;

          const status = await Network.getStatus();
          if (disposed) return;

          setIsOnline(status.connected);
          setConnectionType(status.connectionType);
          setHasInitialized(true);

          const listener = await Network.addListener(
            "networkStatusChange",
            (nextStatus) => {
              handleOnline(nextStatus.connected, nextStatus.connectionType);
            },
          );

          if (disposed) {
            await listener.remove();
            return;
          }

          removeListener = () => {
            void listener.remove();
          };
        })
        .catch(() => {
          if (disposed) return;
          setIsOnline(navigator.onLine);
          setConnectionType(navigator.onLine ? "wifi" : "none");
          setHasInitialized(true);
        });

      return () => {
        disposed = true;
        removeListener?.();
      };
    } else {
      // — Web fallback —
      setIsOnline(navigator.onLine);
      setConnectionType(navigator.onLine ? "wifi" : "none");
      setHasInitialized(true);

      const goOnline = () => handleOnline(true, "wifi");
      const goOffline = () => handleOnline(false, "none");

      window.addEventListener("online", goOnline);
      window.addEventListener("offline", goOffline);

      return () => {
        window.removeEventListener("online", goOnline);
        window.removeEventListener("offline", goOffline);
      };
    }
  }, [handleOnline]);

  return { isOnline, connectionType };
}
