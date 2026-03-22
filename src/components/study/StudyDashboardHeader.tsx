import React from "react";
import {
  Zap,
  Plus,
  Search as SearchIcon,
  Timer,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RefuelModal } from "@/components/credits/RefuelModal";

interface StudyDashboardHeaderProps {
  compact?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setIsFocusModeOpen: (open: boolean) => void;
  setIsUploadOpen: (open: boolean) => void;
  userName?: string;
  recommendations?: unknown;
  dailyGoals?: unknown[];
  stats?: unknown;
}

export function StudyDashboardHeader({
  compact = false,
  searchQuery,
  setSearchQuery,
  setIsFocusModeOpen,
  setIsUploadOpen,
}: StudyDashboardHeaderProps) {
  const wallet = useQuery(api.credits.getWallet);
  const creditBalance = Number(wallet?.cryoCredits ?? 0);
  const [isRefuelOpen, setIsRefuelOpen] = React.useState(false);

  return (
    <div className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-3">
          <div className="reference-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/60">
            Study cockpit
            <Sparkles className="h-3.5 w-3.5 text-[#dfe7ff]" />
          </div>
          <div className="max-w-3xl">
            <h1
              className={
                compact
                  ? "text-[2rem] font-semibold tracking-[-0.05em] text-white"
                  : "text-[2.7rem] font-semibold tracking-[-0.06em] text-white md:text-[3.4rem]"
              }
            >
              Run your whole study loop from one place.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/54 md:text-[15px]">
              Capture a source, route it into review, and keep the next action
              visible without the dashboard turning into clutter.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <button
            onClick={() => setIsFocusModeOpen(true)}
            className="reference-toolbar-pill inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white/82 transition-colors hover:bg-white/[0.06]"
          >
            <Timer className="h-3.5 w-3.5" />
            <span>Focus lane</span>
          </button>
          <button
            onClick={() => setIsRefuelOpen(true)}
            className="reference-toolbar-pill inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white/82 transition-colors hover:bg-white/[0.06]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/8 bg-white/6">
              <Zap className="h-3 w-3 fill-current text-[#dfe7ff]" />
            </span>
            <span>{creditBalance.toFixed(0)} CRYO</span>
          </button>
        </div>
      </div>

      <div className="dashboard-surface rounded-[1.8rem] p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="dashboard-subtle-panel group/search flex h-12 flex-1 items-center rounded-[1.1rem] px-4">
            <SearchIcon className="h-4 w-4 text-white/30 group-hover/search:text-white/60 transition-colors" />
            <input
              type="text"
              placeholder="Search materials, notes, or formats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-3 h-full w-full bg-transparent text-sm text-white placeholder:text-white/24 focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <div className="reference-chip inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              1 dashboard
            </div>
            <div className="reference-chip inline-flex rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
              0 context loss
            </div>
            <Button
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="reference-primary-button h-12 rounded-[1.1rem] px-5 font-semibold hover:opacity-95"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New material
            </Button>
          </div>
        </div>
      </div>

      <RefuelModal
        isOpen={isRefuelOpen}
        onClose={() => setIsRefuelOpen(false)}
        type="study"
      />
    </div>
  );
}
