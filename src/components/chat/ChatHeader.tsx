import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ChevronDown,
  Crown,
  FolderKanban,
  Gamepad2,
  Library,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useNavigate } from "react-router";
import { RefuelModal, type RefuelTab } from "@/components/credits/RefuelModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThemeStore } from "@/lib/stores/theme-store";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  toggleSubwaySurfers: () => void;
  showSubwaySurfers: boolean;
  usesTouchShell: boolean;
  isTablet?: boolean;
}

export function ChatHeader({
  toggleSubwaySurfers,
  showSubwaySurfers,
  usesTouchShell,
  isTablet = false,
}: ChatHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useQuery(api.credits.getWallet, user ? {} : "skip");
  const creditBalance = Number(wallet?.cryoCredits ?? 0);
  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";
  const [isRefuelOpen, setIsRefuelOpen] = React.useState(false);
  const [refuelInitialTab, setRefuelInitialTab] =
    React.useState<RefuelTab>("view");

  const openRefuel = (tab: RefuelTab) => {
    setRefuelInitialTab(tab);
    setIsRefuelOpen(true);
  };

  const openUpgrade = () => {
    if (user) {
      openRefuel("upgrade");
      return;
    }
    navigate("/plans#pricing");
  };

  const flowItems: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { label: "Assistant", href: "/app", icon: Sparkles },
    { label: "Study", href: "/study", icon: BookOpen },
    { label: "Library", href: "/library", icon: Library },
    { label: "Projects", href: "/projects", icon: FolderKanban },
  ];

  return (
    <>
      {!usesTouchShell && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-20 hidden md:block">
          <div className="mx-auto flex w-full items-center justify-between gap-4 px-6 pt-5 lg:px-8">
            <div className="pointer-events-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-semibold backdrop-blur-xl transition-colors",
                      isLight
                        ? "border-slate-300/75 bg-white/78 text-slate-900 hover:bg-white"
                        : "border-white/[0.08] bg-[rgba(10,6,37,0.72)] text-white/90 hover:bg-white/[0.08]",
                    )}
                  >
                    Cryonex Flow
                    <ChevronDown
                      className={cn(
                        "h-4 w-4",
                        isLight ? "text-slate-500" : "text-white/50",
                      )}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={cn(
                    "w-56 backdrop-blur-xl",
                    isLight
                      ? "border-slate-300/80 bg-white/95 text-slate-950 shadow-xl shadow-rose-200/30"
                      : "border-white/[0.08] bg-[#09090b]/95 text-white shadow-2xl shadow-black/60",
                  )}
                >
                  <DropdownMenuLabel
                    className={cn(
                      "text-xs",
                      isLight ? "text-slate-500" : "text-white/50",
                    )}
                  >
                    Switch workspace
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator
                    className={cn(
                      isLight ? "bg-slate-200" : "bg-white/[0.08]",
                    )}
                  />
                  {flowItems.map((item) => {
                    const isActive =
                      location.pathname === item.href ||
                      location.pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem
                        key={item.href}
                        onSelect={() => navigate(item.href)}
                        className={`cursor-pointer ${
                          isActive
                            ? isLight
                              ? "bg-slate-100 text-slate-950"
                              : "bg-white/[0.06] text-white"
                            : isLight
                              ? "text-slate-700"
                              : "text-white/80"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{item.label}</span>
                        {isActive ? (
                          <span
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-[0.18em]",
                              isLight ? "text-slate-400" : "text-white/40",
                            )}
                          >
                            Active
                          </span>
                        ) : null}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator
                    className={cn(
                      isLight ? "bg-slate-200" : "bg-white/[0.08]",
                    )}
                  />
                  <DropdownMenuItem
                    onSelect={() => openUpgrade()}
                    className="cursor-pointer text-[#D244FF]"
                  >
                    <Crown className="h-4 w-4" />
                    <span>Upgrade to Pro</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="pointer-events-auto">
              <button
                onClick={openUpgrade}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium text-[#D244FF] backdrop-blur-xl transition-colors hover:opacity-95",
                  isLight
                    ? "border-fuchsia-200/80 bg-white/76 shadow-[0_10px_30px_rgba(210,68,255,0.12)]"
                    : "border-[#D244FF]/20 bg-[rgba(10,6,37,0.72)] shadow-[0_10px_30px_rgba(210,68,255,0.15)]",
                )}
              >
                <Crown className="h-4 w-4" />
                <span>Upgrade to Cryonex Pro</span>
              </button>
            </div>
            <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
              {!user && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/login")}
                    className={cn(
                      "rounded-full border border-transparent px-4 text-sm font-medium",
                      isLight
                        ? "text-slate-700 hover:bg-slate-900/5 hover:text-slate-950"
                        : "text-white/72 hover:bg-white/[0.05] hover:text-white",
                    )}
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/login")}
                    className={cn(
                      "rounded-full border px-4 text-sm font-semibold",
                      isLight
                        ? "border-slate-300/80 bg-white/78 text-slate-950 hover:bg-white"
                        : "border-white/[0.06] bg-white/[0.06] text-white hover:bg-white/[0.1]",
                    )}
                  >
                    Sign up
                  </Button>
                </>
              )}
              {user && (
                <button
                  type="button"
                  onClick={() => openRefuel("view")}
                  className={cn(
                    "inline-flex items-center gap-3 rounded-full border px-3.5 py-2 backdrop-blur-xl transition-colors",
                    isLight
                      ? "border-slate-300/80 bg-white/78 text-slate-900 hover:bg-white"
                      : "border-white/[0.08] bg-[rgba(10,6,37,0.72)] text-white/80 hover:bg-white/[0.08]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border",
                      isLight
                        ? "border-fuchsia-200/80 bg-fuchsia-100"
                        : "border-white/[0.06] bg-[#D244FF]/10",
                    )}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current text-[#D244FF]" />
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.18em]",
                      isLight ? "text-slate-500" : "text-white/38",
                    )}
                  >
                    Credits
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isLight ? "text-slate-950" : "text-white",
                    )}
                  >
                    {creditBalance.toFixed(1)}
                  </span>
                </button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSubwaySurfers}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium backdrop-blur-xl transition-colors",
                  isLight
                    ? "border-slate-300/80 bg-white/76"
                    : "border-white/[0.08] bg-[rgba(10,6,37,0.72)]",
                  showSubwaySurfers
                    ? "text-[#D244FF]"
                    : isLight
                      ? "text-slate-700 hover:text-slate-950"
                      : "text-white/62 hover:text-white",
                )}
              >
                  <Gamepad2 className="h-4 w-4" />
                  <span className="hidden xl:inline">
                    {showSubwaySurfers ? "Focus on" : "Focus view"}
                  </span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <RefuelModal
        isOpen={isRefuelOpen}
        onClose={() => setIsRefuelOpen(false)}
        type="main"
        initialTab={refuelInitialTab}
      />

      {usesTouchShell && user && (
        <button
          onClick={() => openRefuel("view")}
          className={`absolute z-20 ${isTablet ? "right-5 top-4" : "right-3 top-3"}`}
        >
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-xl",
              isLight
                ? "border-slate-300/80 bg-white/82 text-slate-900"
                : "border-white/[0.06] bg-[rgba(10,6,37,0.72)] text-white/80",
            )}
          >
            <Zap className="h-3.5 w-3.5 fill-current text-[#9dc1ff]" />
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.16em]",
                isLight ? "text-slate-500" : "text-white/38",
              )}
            >
              Credits
            </span>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                isLight ? "text-slate-950" : "text-white",
              )}
            >
              {creditBalance.toFixed(1)}
            </span>
          </div>
        </button>
      )}
    </>
  );
}
