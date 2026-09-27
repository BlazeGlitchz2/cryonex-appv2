import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/lib/stores/theme-store";
import { cn } from "@/lib/utils";

export function AppearanceToggle({ className }: { className?: string }) {
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const label =
    mode === "light" ? "Switch to dark mode" : "Switch to light mode";
  return (
    <button
      type="button"
      onClick={toggleMode}
      className={cn("cx-icon-button", className)}
      aria-label={label}
      title={label}
    >
      {mode === "light" ? <Moon /> : <Sun />}
    </button>
  );
}
