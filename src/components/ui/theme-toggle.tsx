"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";

interface ThemeToggleProps {
  className?: string;
  onChange?: (isDark: boolean) => void;
}

export function ThemeToggle({ className, onChange }: ThemeToggleProps) {
  const resolvedMode = useThemeStore((state) => state.resolvedMode);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const isDark = resolvedMode === "dark";

  const handleToggle = () => {
    const nextIsDark = !isDark;
    toggleMode();
    onChange?.(nextIsDark);
  };

  return (
    <div
      className={cn(
        "flex h-8 w-16 cursor-pointer rounded-full border p-1 transition-all duration-300",
        isDark
          ? "border-white/20 bg-zinc-950/80 backdrop-blur-md"
          : "border-rose-200/80 bg-white/80 backdrop-blur-md",
        className,
      )}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300",
          isDark
            ? "translate-x-0 bg-white/20 backdrop-blur-md"
            : "translate-x-8 bg-white shadow-sm backdrop-blur-md",
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-white" strokeWidth={1.5} />
        ) : (
          <Sun className="h-4 w-4 text-yellow-600" strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
}
