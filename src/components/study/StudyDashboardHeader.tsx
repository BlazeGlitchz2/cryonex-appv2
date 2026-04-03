import React from "react";
import { Sparkles, Zap, Plus, Search as SearchIcon, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RefuelModal } from "@/components/credits/RefuelModal";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils";

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
  searchQuery,
  setSearchQuery,
  setIsFocusModeOpen,
  setIsUploadOpen,
  compact = false,
  userName,
}: StudyDashboardHeaderProps) {
  const navigate = useNavigate();
  const wallet = useQuery(api.credits.getWallet);
  const cryoBalance = Number(wallet?.cryoCredits ?? 0);
  const [isRefuelOpen, setIsRefuelOpen] = React.useState(false);

  return (
    <div className={cn("flex w-full flex-col", compact ? "gap-4" : "gap-6")}>
      <div
        className={cn(
          "flex flex-col gap-3",
          compact
            ? "sm:flex-row sm:items-end sm:justify-between"
            : "md:flex-row md:items-center md:justify-between",
        )}
      >
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-foreground/[0.04]">
            <Sparkles className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          </div>
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Intelligence Hub
            </h1>
            <p className="mt-1 max-w-xl text-sm leading-6 text-foreground/52">
              {userName ? `Welcome back, ${userName}. ` : ""}
              Your study lanes, credits, and focus tools stay in one calm place.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRefuelOpen(true)}
          className="deepshi-panel inline-flex items-center gap-2 self-start rounded-full border border-[#10B981]/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#10B981]"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981]/10">
            <Zap className="h-2.5 w-2.5 fill-current text-[#10B981]" />
          </div>
          <span>{cryoBalance.toFixed(0)} Cryo Credits</span>
        </button>
      </div>

      <div
        className={cn(
          "grid gap-3",
          compact
            ? "grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto]"
            : "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto]",
        )}
      >
        <button
          onClick={() => setIsFocusModeOpen(true)}
          className="deepshi-panel inline-flex items-center justify-center gap-2 rounded-2xl border border-[#10B981]/10 px-4 py-3 text-sm font-medium text-[#10B981] transition-colors hover:bg-[#10B981]/5"
        >
          <Timer className="h-3.5 w-3.5" />
          <span>Focus Mode</span>
        </button>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative group/search min-w-0">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/30 transition-colors group-hover/search:text-foreground/60" />
            <input
              type="text"
              placeholder="Search study material"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="deepshi-panel w-full rounded-2xl border border-border.06] bg-foreground/[0.04] py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground/25 focus:outline-none focus:ring-1 focus:ring-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/study/copilot")}
              className="deepshi-panel h-11 rounded-2xl px-4 text-foreground hover:bg-foreground/10"
            >
              <Sparkles className="mr-2 h-4 w-4 text-foreground/40" />
              Copilot
            </Button>

            <Button
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="deepshi-panel h-11 rounded-2xl bg-white px-4 font-semibold text-black hover:bg-foreground/90"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Material
            </Button>
          </div>
        </div>
      </div>

      <RefuelModal
        isOpen={isRefuelOpen}
        onClose={() => setIsRefuelOpen(false)}
        type="main"
      />
    </div>
  );
}
