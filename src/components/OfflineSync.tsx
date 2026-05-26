import { useEffect, useRef } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOfflineStore } from "@/lib/stores/offline-store";
import { isIOSNative } from "@/lib/platform-runtime";
import { hapticNotification } from "@/lib/mobile";
import { toast } from "sonner";

/**
 * Invisible component that watches network status transitions
 * and automatically syncs queued messages when connectivity returns.
 *
 * Renders nothing — mount in the provider tree (main.tsx).
 */
export function OfflineSync() {
  const { isOnline } = useNetworkStatus();
  const wasOnlineRef = useRef(isOnline);
  const pendingMessages = useOfflineStore((s) => s.pendingMessages);

  useEffect(() => {
    const wasOffline = !wasOnlineRef.current;
    wasOnlineRef.current = isOnline;

    // Only trigger sync on offline → online transition
    if (!isOnline || !wasOffline || pendingMessages.length === 0) return;

    // Fire haptic on iOS
    if (isIOSNative()) {
      void hapticNotification("success");
    }

    toast.info(
      "Connection restored. Queued messages are ready to resend.",
      {
        id: "offline-sync",
        duration: 3000,
      },
    );
  }, [isOnline, pendingMessages.length]);

  // Also cache the current chat whenever messages change while online
  // This is handled in App.tsx instead for access to Convex data

  return null;
}
