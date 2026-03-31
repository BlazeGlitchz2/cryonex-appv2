import { useCallback, useState } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useOfflineStore } from "@/lib/stores/offline-store";
import { WifiOff, RefreshCw, Clock } from "lucide-react";
import { isIOSNative, isNativePlatform } from "@/lib/platform-runtime";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * A fixed banner that appears at the top of the screen when the device is offline.
 * Enhanced with iOS haptics, pending message count, and retry functionality.
 * On iOS mobile, this is hidden because OfflinePage handles the full experience.
 */
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const pendingMessages = useOfflineStore((s) => s.pendingMessages);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      if (isNativePlatform()) {
        const { Network } = await import("@capacitor/network");
        const status = await Network.getStatus();
        if (status.connected) {
          toast.success("Connection restored!", { id: "banner-retry" });
        } else {
          toast.error("Still offline", { id: "banner-retry" });
        }
      } else {
        if (navigator.onLine) {
          toast.success("Connection restored!", { id: "banner-retry" });
        } else {
          toast.error("Still offline", { id: "banner-retry" });
        }
      }
    } catch {
      toast.error("Check failed", { id: "banner-retry" });
    } finally {
      setIsRetrying(false);
    }
  }, []);

  if (isOnline) return null;

  // On iOS native, the full OfflinePage handles the experience
  if (isIOSNative()) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] animate-in slide-in-from-top duration-300"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="mx-auto max-w-lg px-3 pt-2 pb-2">
        <div className="flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 shadow-[0_4px_20px_rgba(239,68,68,0.15)]">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/15">
            <WifiOff className="h-3.5 w-3.5 text-red-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-red-300/90">
              You're offline
            </span>
            {pendingMessages.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-amber-300/70">
                <Clock className="h-2.5 w-2.5" />
                {pendingMessages.length} queued
              </span>
            )}
          </div>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="ml-auto flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Retry connection"
          >
            <RefreshCw
              className={cn(
                "h-3 w-3 text-white/50",
                isRetrying && "animate-spin",
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
