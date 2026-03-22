import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
  Compass,
  Gamepad2,
  GraduationCap,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useNavigate } from "react-router";
import { RefuelModal } from "@/components/credits/RefuelModal";
import { cn } from "@/lib/utils";

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
  const location = useLocation();
  const wallet = useQuery(api.credits.getWallet, user ? {} : "skip");
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
      active: location.pathname.startsWith("/study"),
    },
    {
      label: "Library",
      path: "/library",
      icon: BookOpen,
      active: location.pathname.startsWith("/library"),
    },
  ];

  return (
    <>
      {/* Desktop Header */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 hidden md:block">
        <div className="mx-auto flex max-w-[80rem] items-center justify-between gap-4 px-6 pt-5">
          <div className="pointer-events-auto flex items-center gap-2">
            {navItems.map((item) => (
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
                    item.active ? "text-white/82" : "text-white/40",
                  )}
                />
                {item.label}
              </button>
            ))}
          </div>

          <div className="pointer-events-auto">
            <button className="deepshi-panel inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white/[0.05]">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06]">
                <Sparkles className="h-3.5 w-3.5 text-[#7dd3fc]" />
              </span>
              Cryonex Flow
              <ChevronDown className="h-4 w-4 text-white/40" />
            </button>
          </div>

          <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
            <button className="deepshi-panel inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-[#f8d082] transition-colors hover:bg-white/[0.05]">
              Upgrade to Cryonex Pro
            </button>
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
                className="deepshi-panel inline-flex items-center gap-3 px-3.5 py-2 text-white/80 transition-colors hover:bg-white/[0.06]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.06] bg-[#7dd3fc]/10">
                  <Zap className="h-3.5 w-3.5 fill-current text-[#7dd3fc]" />
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
                ? "text-[#7dd3fc]"
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
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-[rgba(9,12,18,0.72)] px-3 py-1.5 text-white/80 backdrop-blur-xl">
            <Zap className="h-3.5 w-3.5 fill-current text-[#7dd3fc]" />
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
