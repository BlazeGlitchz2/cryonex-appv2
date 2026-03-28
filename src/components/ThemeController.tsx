import { useEffect } from "react";
import { SYSTEM_QUERY, useThemeStore } from "@/lib/stores/theme-store";

export function ThemeController() {
  const appearance = useThemeStore((state) => state.appearance);
  const syncWithSystem = useThemeStore((state) => state.syncWithSystem);

  useEffect(() => {
    if (typeof window === "undefined") return;

    syncWithSystem();

    const mediaQuery = window.matchMedia(SYSTEM_QUERY);
    const handleChange = () => {
      if (useThemeStore.getState().appearance === "system") {
        syncWithSystem();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [appearance, syncWithSystem]);

  return null;
}
