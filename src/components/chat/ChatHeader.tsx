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
import { useAppLocale } from "@/hooks/use-app-locale";

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
  const { isRTL, t } = useAppLocale();
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
    { label: t("assistant"), href: "/app", icon: Sparkles },
    { label: t("study"), href: "/study/dashboard", icon: BookOpen },
    { label: t("library"), href: "/library", icon: Library },
    { label: t("projects"), href: "/projects", icon: FolderKanban },
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
                        ? "border-border/50 bg-background/50 text-foreground hover:bg-background"
                        : "border-white/[0.08] bg-[rgba(10,6,37,0.72)] text-white/90 hover:bg-white/[0.08]",
                    )}
                  >
                    {t("chatHeader.flow")}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4",
                        isLight ? "text-muted-foreground" : "text-white/50",
                      )}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className={cn(
                    "w-56 backdrop-blur-xl",
                    isLight
                      ? "border-border bg-background text-foreground shadow-xl shadow-primary/10"
                      : "border-white/[0.08] bg-[#09090b]/95 text-white shadow-2xl shadow-black/60",
                  )}
                >
                  <DropdownMenuLabel
                    className={cn(
                      "text-xs",
                      isLight ? "text-muted-foreground" : "text-white/50",
                    )}
                  >
                    {t("chatHeader.switchWorkspace")}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator
                    className={cn(
                      isLight ? "bg-border/50" : "bg-white/[0.08]",
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
                              ? "bg-accent text-accent-foreground"
                              : "bg-white/[0.06] text-white"
                            : isLight
                              ? "text-muted-foreground hover:bg-accent/50"
                              : "text-white/80"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1">{item.label}</span>
                        {isActive ? (
                          <span
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-[0.18em]",
                              isLight ? "text-muted-foreground/60" : "text-white/40",
                            )}
                          >
                            {t("common.active")}
                          </span>
                        ) : null}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator
                    className={cn(
                      isLight ? "bg-border/50" : "bg-white/[0.08]",
                    )}
                  />
                  <DropdownMenuItem
                    onSelect={() => openUpgrade()}
                    className="cursor-pointer text-[#2563eb]"
                  >
                    <Crown className="h-4 w-4" />
                    <span>{t("chatHeader.upgradeToPro")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="pointer-events-auto">
              <button
                onClick={openUpgrade}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium text-[#2563eb] backdrop-blur-xl transition-colors hover:opacity-95",
                  isLight
                    ? "border-primary/20 bg-background/50 shadow-[0_10px_30px_rgba(var(--primary-rgb),0.12)]"
                    : "border-[#2563eb]/20 bg-[rgba(10,6,37,0.72)] shadow-[0_10px_30px_rgba(37,99,235,0.15)]",
                )}
              >
                <Crown className="h-4 w-4" />
                <span>{t("chatHeader.upgradeToCryonexPro")}</span>
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
                        ? "text-muted-foreground hover:bg-accent hover:text-foreground"
                        : "text-white/72 hover:bg-white/[0.05] hover:text-white",
                    )}
                  >
                    {t("chatHeader.logIn")}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate("/login")}
                    className={cn(
                      "rounded-full border px-4 text-sm font-semibold",
                      isLight
                        ? "border-border/50 bg-background/50 text-foreground hover:bg-background"
                        : "border-white/[0.06] bg-white/[0.06] text-white hover:bg-white/[0.1]",
                    )}
                  >
                    {t("chatHeader.signUp")}
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
                      ? "border-border/50 bg-background/50 text-foreground hover:bg-background"
                      : "border-white/[0.08] bg-[rgba(10,6,37,0.72)] text-white/80 hover:bg-white/[0.08]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border",
                      isLight
                        ? "border-primary/20 bg-primary/10"
                        : "border-white/[0.06] bg-[#2563eb]/10",
                    )}
                  >
                    <Zap className="h-3.5 w-3.5 fill-current text-[#2563eb]" />
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase tracking-[0.18em]",
                      isLight ? "text-muted-foreground" : "text-white/38",
                    )}
                  >
                    {t("common.credits")}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      isLight ? "text-foreground" : "text-white",
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
                    ? "border-border/50 bg-background/50"
                    : "border-white/[0.08] bg-[rgba(10,6,37,0.72)]",
                  showSubwaySurfers
                    ? "text-[#2563eb]"
                    : isLight
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/62 hover:text-white",
                )}
              >
                  <Gamepad2 className="h-4 w-4" />
                  <span className="hidden xl:inline">
                    {showSubwaySurfers
                      ? t("chatHeader.focusOn")
                      : t("chatHeader.focusView")}
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
          className={cn(
            "absolute z-20",
            isTablet
              ? isRTL
                ? "left-5 top-4"
                : "right-5 top-4"
              : isRTL
                ? "left-3 top-3"
                : "right-3 top-3",
            isRTL && "dir-rtl font-arabic",
          )}
        >
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-xl",
              isLight
                ? "border-border/50 bg-background/50 text-foreground"
                : "border-white/[0.06] bg-[rgba(10,6,37,0.72)] text-white/80",
            )}
          >
            <Zap className="h-3.5 w-3.5 fill-current text-[#9dc1ff]" />
            <span
              className={cn(
                "text-[10px] font-semibold uppercase tracking-[0.16em]",
                isLight ? "text-muted-foreground" : "text-white/38",
              )}
            >
              {t("common.credits")}
            </span>
            <span
              className={cn(
                "text-xs font-semibold tabular-nums",
                isLight ? "text-foreground" : "text-white",
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
