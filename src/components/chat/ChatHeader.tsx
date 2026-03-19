import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ChevronDown, Gamepad2, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { RefuelModal } from "@/components/credits/RefuelModal";

interface ChatHeaderProps {
  toggleSubwaySurfers: () => void;
  showSubwaySurfers: boolean;
  isMobile: boolean;
}

export function ChatHeader({
  toggleSubwaySurfers,
  showSubwaySurfers,
  isMobile,
}: ChatHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const wallet = useQuery(api.credits.getWallet, user ? {} : "skip");
  const creditBalance = Number(wallet?.cryoCredits ?? 0);
  const [isRefuelOpen, setIsRefuelOpen] = React.useState(false);

  return (
    <>
      {/* Desktop Header */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 hidden md:block">
        <div className="mx-auto flex max-w-[74rem] items-center justify-between gap-4 px-6 pt-5">
          <div className="pointer-events-auto">
            <button className="deepshi-panel inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white/90 transition-colors">
              Cryonex Flow
              <ChevronDown className="h-4 w-4 text-white/50" />
            </button>
          </div>
          <div className="pointer-events-auto">
            <button className="deepshi-panel inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-[#D244FF] border border-[#D244FF]/20 shadow-[0_10px_30px_rgba(210,68,255,0.15)] transition-colors hover:opacity-95">
              Upgrade to Cryonex Pro
            </button>
          </div>
          <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
            {!user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="rounded-full border border-transparent px-4 text-sm font-medium text-white/72 hover:bg-white/[0.05] hover:text-white"
                >
                  Log in
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="rounded-full border border-white/[0.06] bg-white/[0.06] px-4 text-sm font-semibold text-white hover:bg-white/[0.1]"
                >
                  Sign up
                </Button>
              </>
            )}
            {user && (
              <button
                type="button"
                onClick={() => setIsRefuelOpen(true)}
                className="deepshi-panel inline-flex items-center gap-3 px-3.5 py-2 text-white/80 transition-colors hover:bg-white/[0.08]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-[#D244FF]/10">
                  <Zap className="h-3.5 w-3.5 fill-current text-[#D244FF]" />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/38">
                  Credits
                </span>
                <span className="text-sm font-semibold tabular-nums text-white">
                  {creditBalance.toFixed(1)}
                </span>
              </button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSubwaySurfers}
              className={`deepshi-panel px-4 py-2 text-xs font-medium transition-colors ${showSubwaySurfers
                ? "text-[#D244FF]"
                : "text-white/62 hover:text-white"
                }`}
            >
              <Gamepad2 className="h-4 w-4" />
              <span className="hidden xl:inline">
                {showSubwaySurfers ? "Focus on" : "Focus view"}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <RefuelModal
        isOpen={isRefuelOpen}
        onClose={() => setIsRefuelOpen(false)}
        type="main"
      />

      {isMobile && user && (
        <button
          onClick={() => setIsRefuelOpen(true)}
          className="absolute right-3 top-3 z-20 md:hidden"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-[rgba(10,6,37,0.72)] px-3 py-1.5 text-white/80 backdrop-blur-xl">
            <Zap className="h-3.5 w-3.5 fill-current text-[#9dc1ff]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/38">
              Credits
            </span>
            <span className="text-xs font-semibold tabular-nums text-white">
              {creditBalance.toFixed(1)}
            </span>
          </div>
        </button>
      )}
    </>
  );
}
