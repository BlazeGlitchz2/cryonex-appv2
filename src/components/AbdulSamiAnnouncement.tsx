import { useEffect, useState } from "react";
import { CheckCircle2, Crown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ANNOUNCEMENT_STORAGE_KEY = "cryonex-abdul-sami-co-ceo-announcement-v1";

export function AbdulSamiAnnouncement() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsVisible(
      window.localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) !== "seen",
    );
  }, []);

  const dismiss = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "seen");
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cryonex leadership announcement"
      className={cn(
        "fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-md",
        "rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-slate-950 shadow-2xl shadow-slate-950/15 backdrop-blur-xl",
        "dark:border-white/10 dark:bg-[#07111f]/95 dark:text-white dark:shadow-black/40",
        "sm:inset-x-auto sm:right-5 sm:bottom-5",
      )}
    >
      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={dismiss}
        className="absolute right-3 top-3 rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3 pr-8">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 dark:bg-cyan-400 dark:text-slate-950">
          <Crown className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
            Leadership update
          </p>
          <h2 className="mt-1 text-lg font-black leading-tight tracking-tight">
            Abdul Sami is now Cryonex Co-CEO
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            The app now recognizes Abdul Sami as Cryonex Co-CEO across Cryonex
            AI identity answers.
          </p>
          <Button
            type="button"
            onClick={dismiss}
            className="mt-4 h-10 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Got it
          </Button>
        </div>
      </div>
    </aside>
  );
}
