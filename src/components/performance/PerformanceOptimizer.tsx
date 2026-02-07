import { useEffect } from "react";
import { usePerformance } from "@/hooks/use-performance";
import { usePerformanceStore } from "@/lib/stores/performance-store";

export function PerformanceOptimizer() {
  const { tier, metrics, isDetecting } = usePerformance();
  const setDetectedTier = usePerformanceStore((state) => state.setDetectedTier);

  // Sync detected tier to store
  useEffect(() => {
    if (!isDetecting && tier) {
      console.log("[PerformanceOptimizer] Detected Tier:", tier, metrics);
      setDetectedTier(tier);
    }
  }, [tier, isDetecting, setDetectedTier, metrics]);

  // Render nothing - silent optimization
  return null;
}
