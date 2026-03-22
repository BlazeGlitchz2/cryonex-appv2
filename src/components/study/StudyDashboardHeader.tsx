import React from "react";
import {
  BookOpen,
  Compass,
  GraduationCap,
  Menu,
  Network,
  Plus,
  Search as SearchIcon,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { RefuelModal } from "@/components/credits/RefuelModal";
import { useLocation, useNavigate } from "react-router";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/stores/ui-store";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { setMobileSidebarOpen } = useUIStore();
  const wallet = useQuery(api.credits.getWallet);
  const creditBalance = Number(wallet?.cryoCredits ?? 0);
  const [isRefuelOpen, setIsRefuelOpen] = React.useState(false);
  const navItems = [
    {
      label: "Explore",
      path: "/app",
      icon: Compass,
      active:
        location.pathname === "/app" ||
        location.pathname.startsWith("/app/chat/"),
    },
    {
      label: "Study",
      path: "/study/dashboard",
      icon: GraduationCap,
      active:
        location.pathname === "/study" ||
        location.pathname.startsWith("/study/"),
    },
    {
      label: "Library",
      path: "/library",
      icon: BookOpen,
      active: location.pathname.startsWith("/library"),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {compact && (
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="deepshi-panel inline-flex h-10 w-10 items-center justify-center text-white/80"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          )}
          <div className="deepshi-panel inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white/88">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06]">
              <Sparkles className="h-3.5 w-3.5 text-[#7dd3fc]" />
            </span>
            {compact ? "Study" : "Cryonex Study"}
          </div>
          {!compact &&
            navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.path)}
                className={cn(
                  "deepshi-panel inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors",
                  item.active
                    ? "text-white"
                    : "text-white/62 hover:bg-white/[0.05] hover:text-white",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    item.active ? "text-white/78" : "text-white/36",
                  )}
                />
                {item.label}
              </button>
            ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            type="button"
            onClick={() => setIsRefuelOpen(true)}
            className="deepshi-panel flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#7dd3fc]"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#7dd3fc]/10">
              <Zap className="h-2.5 w-2.5 fill-current text-[#7dd3fc]" />
            </div>
            <span>{creditBalance.toFixed(0)} CRYO</span>
          </button>
          <button
            type="button"
            onClick={() => setIsFocusModeOpen(true)}
            className="deepshi-panel flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white/82 transition-colors hover:bg-white/[0.05]"
          >
            <Timer className="h-3.5 w-3.5" />
            <span>Focus lane</span>
          </button>
          <Button
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            className="deepshi-panel h-9 rounded-full bg-white text-black hover:bg-white/90 px-4 font-semibold"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Material
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "dashboard-surface flex flex-col gap-4 rounded-[1.9rem] p-4 sm:p-5",
          compact && "gap-3 rounded-[1.5rem] p-3.5",
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/54">
              <Compass className="h-3.5 w-3.5 text-[#f8d082]" />
              Study launchpad
            </div>
            <h1
              className={cn(
                "mt-4 font-semibold tracking-[-0.045em] text-white",
                compact ? "text-[1.65rem] leading-[1.05]" : "text-[2.2rem] leading-[1.02]",
              )}
            >
              Keep study in the same calm workbench as chat.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/56">
              Search a source, open a lane, or bring in something new without
              breaking the visual rhythm. The dashboard now follows the same
              centered deepshi-style shell as the assistant surface.
            </p>
            {!compact && (
              <button
                type="button"
                onClick={() => navigate("/study/graph")}
                className="deepshi-panel mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/74 transition-colors hover:bg-white/[0.05]"
              >
                <Network className="h-3.5 w-3.5 text-[#7dd3fc]" />
                Knowledge graph
              </button>
            )}
          </div>

          <label className="deepshi-panel relative flex min-h-12 w-full max-w-xl items-center rounded-full pl-10 pr-4 lg:w-[24rem]">
            <SearchIcon className="absolute left-4 h-4 w-4 text-white/30" />
            <input
              type="text"
              placeholder="Search your sources, topics, and study modes"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-full w-full bg-transparent text-sm text-white placeholder:text-white/26 focus:outline-none"
            />
          </label>
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
