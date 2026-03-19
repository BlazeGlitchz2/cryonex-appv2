import React from "react";
import {
  Sparkles,
  Zap,
  Plus,
  Users,
  Search as SearchIcon,
  Timer,
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
  searchQuery,
  setSearchQuery,
  setIsFocusModeOpen,
  setIsUploadOpen,
}: StudyDashboardHeaderProps) {
  const wallet = useQuery(api.credits.getWallet);
  const creditBalance = Number(wallet?.cryoCredits ?? 0);
  const [isRefuelOpen, setIsRefuelOpen] = React.useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Intelligence Hub Title + Credits */}
        <div className="flex items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            Intelligence Hub <Sparkles className="h-5 w-5 text-yellow-400 fill-yellow-400" />
          </h1>

          <button
            onClick={() => setIsRefuelOpen(true)}
            className="deepshi-panel flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#10B981] border border-[#10B981]/10 rounded-full"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#10B981]/10">
              <Zap className="h-2.5 w-2.5 fill-current text-[#10B981]" />
            </div>
            <span>{creditBalance.toFixed(0)} CRYO</span>
          </button>
        </div>

        {/* Center/Right: Focus, Search, Actions */}
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          {/* Focus & Earn Pill */}
          <button
            onClick={() => setIsFocusModeOpen(true)}
            className="deepshi-panel flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium text-[#10B981] border border-[#10B981]/10 hover:bg-[#10B981]/5 transition-colors"
          >
            <Timer className="h-3.5 w-3.5" />
            <span>Focus & Earn</span>
          </button>

          {/* Minimal Search Button */}
          <div className="relative group/search">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-hover/search:text-white/60 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="deepshi-panel bg-white/[0.04] border-white/[0.06] rounded-full pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/10 w-40 md:w-64 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <Button
              variant="ghost"
              size="sm"
              className="deepshi-panel h-9 rounded-full px-4 text-white hover:bg-white/10"
            >
              <Users className="h-4 w-4 mr-2 text-white/40" />
              Invite
            </Button>

            <Button
              size="sm"
              onClick={() => setIsUploadOpen(true)}
              className="deepshi-panel h-9 rounded-full bg-white text-black hover:bg-white/90 px-4 font-semibold"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Material
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
