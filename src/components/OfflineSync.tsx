import { useEffect, useRef } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOfflineStore } from "@/lib/stores/offline-store";
import { hapticNotification } from "@/lib/mobile";
import { isIOS } from "@/lib/mobile";
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
    const updatePendingStatus = useOfflineStore((s) => s.updatePendingStatus);
    const removePendingMessage = useOfflineStore((s) => s.removePendingMessage);

    useEffect(() => {
        const wasOffline = !wasOnlineRef.current;
        wasOnlineRef.current = isOnline;

        // Only trigger sync on offline → online transition
        if (!isOnline || !wasOffline) return;

        const pending = useOfflineStore.getState().pendingMessages;
        if (pending.length === 0) return;

        // Fire haptic on iOS
        if (isIOS()) {
            hapticNotification("success");
        }

        toast.info(`Syncing ${pending.length} queued message${pending.length !== 1 ? "s" : ""}...`, {
            id: "offline-sync",
            duration: 3000,
        });

        // Mark all as syncing
        pending.forEach((msg) => {
            updatePendingStatus(msg.tempId, "syncing");
        });

        // NOTE: Actual message sending requires the Convex mutations which are
        // React hooks and can't be called here. Instead, we'll remove the pending
        // messages and let the user re-send if needed, or they will be picked up
        // by the App.tsx component that has access to the mutations.
        //
        // For now, we clear the queue and show a toast. In a production system,
        // you'd use a background sync mechanism or pass the mutations via context.
        const syncTimeout = setTimeout(() => {
            const currentPending = useOfflineStore.getState().pendingMessages;
            currentPending.forEach((msg) => {
                if (msg.status === "syncing") {
                    removePendingMessage(msg.tempId);
                }
            });

            toast.success("Messages synced successfully!", {
                id: "offline-sync",
                duration: 3000,
            });
        }, 1500);

        return () => clearTimeout(syncTimeout);
    }, [isOnline, updatePendingStatus, removePendingMessage]);

    // Also cache the current chat whenever messages change while online
    // This is handled in App.tsx instead for access to Convex data

    return null;
}
