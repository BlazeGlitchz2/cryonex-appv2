"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  onChange?: (isDark: boolean) => void;
}

export function ThemeToggle({ className, onChange }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("theme") === "dark" ||
        !localStorage.getItem("theme")
      );
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", isDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", isDark);
      onChange?.(isDark);
    }
  }, [isDark, onChange]);

  const handleToggle = () => {
    setIsDark(!isDark);
  };

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark
          ? "bg-zinc-950/80 backdrop-blur-md border border-white/20"
          : "bg-white/80 backdrop-blur-md border border-gray-300",
        className,
      )}
      onClick={handleToggle}
      role="button"
      tabIndex={0}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div
        className={cn(
          "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
          isDark
            ? "transform translate-x-0 bg-white/20 backdrop-blur-md"
            : "transform translate-x-8 bg-white backdrop-blur-md shadow-sm",
        )}
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-white" strokeWidth={1.5} />
        ) : (
          <Sun className="w-4 h-4 text-yellow-600" strokeWidth={1.5} />
        )}
      </div>
    </div>
  );
}
