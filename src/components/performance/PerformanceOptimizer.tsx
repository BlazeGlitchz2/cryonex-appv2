import { useEffect } from "react";
import { usePerformance } from "@/hooks/use-performance";
import { usePerformanceStore } from "@/lib/stores/performance-store";

export function PerformanceOptimizer() {
  const { tier, metrics, isDetecting } = usePerformance();
  const setDetectedTier = usePerformanceStore((state) => state.setDetectedTier);

  // Sync detected tier to store and apply optimizations
  useEffect(() => {
    if (!isDetecting && tier) {
      console.log("[PerformanceOptimizer] Detected Tier:", tier, metrics);
      setDetectedTier(tier);

      // Active Optimization
      if (tier === "lite") {
        document.documentElement.classList.add("lite-mode");
      } else {
        document.documentElement.classList.remove("lite-mode");
      }
    }
  }, [tier, isDetecting, setDetectedTier, metrics]);

  // Render nothing - silent optimization
  return null;
}
