import { useNavigate, useLocation } from "react-router";
import {
  LayoutGrid,
  FolderOpen,
  MessageSquare,
  Scan,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  hapticFeedback,
  hapticSelection,
  isIOS,
  isAndroid,
} from "@/lib/mobile";
import { MobileUserMenu } from "@/components/ui/MobileUserMenu";
import { useDeviceType } from "@/hooks/use-mobile";
import { useAppLocale } from "@/hooks/use-app-locale";
import { getActiveMobileNavKey } from "@/lib/mobile-shell";
import { useThemeStore } from "@/lib/stores/theme-store";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  navKey: "home" | "assistant" | "library" | "profile" | "new";
  isCenter?: boolean;
}

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const deviceType = useDeviceType();
  const isiOSDevice = isIOS();
  const isAndroidDevice = isAndroid();
  const mode = useThemeStore((state) => state.mode);
  const { isRTL, t } = useAppLocale();
  const isLight = mode === "light";
  const navBottomPadding =
    "max(var(--safe-area-bottom, env(safe-area-inset-bottom, 0px)), 8px)";
  const navSurfaceClass = isLight
    ? "border-border/30 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(248,250,252,0.84))] shadow-[0_18px_42px_rgba(15,23,42,0.12)] backdrop-blur-[18px]"
    : isiOSDevice
      ? "border-white/[0.08] bg-[linear-gradient(180deg,rgba(11,18,30,0.86),rgba(10,16,28,0.78))] backdrop-blur-[18px]"
      : "border-white/[0.06] bg-[linear-gradient(180deg,rgba(10,16,27,0.94),rgba(10,16,27,0.88))] backdrop-blur-[14px]";

  if (deviceType !== "phone") return null;

  const handleNavClick = async (item: NavItem) => {
    // iOS uses selection haptic for tab switching (matches native UITabBar)
    if (isiOSDevice) {
      hapticSelection();
    } else {
      hapticFeedback("light");
    }

    if (item.isCenter) {
      hapticFeedback("medium");
    }

    navigate(item.path);
  };

  const activeNavKey = getActiveMobileNavKey(location.pathname);
  const navItems: NavItem[] = [
    {
      icon: LayoutGrid,
      label: t("mobileNav.home"),
      path: "/study/dashboard",
      navKey: "home",
    },
    {
      icon: MessageSquare,
      label: t("mobileNav.coach"),
      path: "/app",
      navKey: "assistant",
    },
    {
      icon: Scan,
      label: t("mobileNav.capture"),
      path: "/study/dashboard?action=scan#mobile-capture-lane",
      navKey: "new",
      isCenter: true,
    },
    {
      icon: FolderOpen,
      label: t("mobileNav.library"),
      path: "/library",
      navKey: "library",
    },
    {
      icon: User,
      label: t("mobileNav.profile"),
      path: "/settings",
      navKey: "profile",
    },
  ];

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50",
        "px-3",
        isRTL && "dir-rtl font-arabic",
      )}
      style={{
        paddingBottom: isAndroidDevice
          ? "max(var(--android-nav-height, 24px), 12px)"
          : navBottomPadding,
        transform: "translateZ(0)",
      }}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-10 left-0 right-0 h-10",
          isLight
            ? "bg-gradient-to-t from-background to-transparent"
            : "bg-gradient-to-t from-[#030005] to-transparent",
        )}
      />

      <nav
        className={cn(
          "pointer-events-auto relative mx-auto w-full border",
          "max-w-lg rounded-[1.7rem] px-2.5 py-2.5",
          navSurfaceClass,
        )}
        style={{
          transform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        <div
          className={cn(
            "pointer-events-none absolute inset-x-6 top-0 h-px",
            isLight ? "bg-slate-200/80" : "bg-white/[0.08]",
          )}
        />
        <div className="grid grid-cols-5 items-end gap-1">
          {navItems.map((item) => {
            if (item.label === "Profile") {
              return <MobileUserMenu key={item.path} compact />;
            }

            const active = !item.isCenter && item.navKey === activeNavKey;
            const Icon = item.icon;

            if (item.isCenter) {
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "mobile-native-button relative flex flex-col items-center justify-center no-select group",
                    "-mt-6",
                  )}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                    transform: "translateZ(0)",
                  }}
                >
                  <div
                    className={cn(
                      "absolute inset-[-8px] rounded-full blur-xl opacity-70",
                      isLight
                        ? "bg-gradient-to-tr from-primary/10 to-accent/10"
                        : "bg-gradient-to-tr from-sky-500/16 to-indigo-500/16",
                    )}
                  />
                  <div
                    className={cn(
                      "relative flex items-center justify-center rounded-[1.55rem] border",
                      isLight
                        ? "border-primary/18 bg-white shadow-[0_10px_24px_rgba(37,99,235,0.12)]"
                        : "border-white/[0.12] bg-[linear-gradient(180deg,rgba(24,33,53,0.98),rgba(25,38,69,0.96))] shadow-[0_12px_24px_rgba(0,0,0,0.36)]",
                      "h-[3.25rem] w-[3.25rem]",
                      "active:scale-95 transition-transform duration-150",
                    )}
                    style={{ transform: "translateZ(0)" }}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isLight
                          ? "text-foreground drop-shadow-[0_2px_4px_rgba(255,255,255,0.65)]"
                          : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "mt-1 text-[10px] font-medium tracking-[0.02em]",
                      isLight ? "text-muted-foreground" : "text-white/60",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNavClick(item)}
                className={cn(
                  "mobile-native-button relative flex min-h-[3.6rem] flex-col items-center justify-center no-select transition-all duration-150",
                  "rounded-[1.35rem] px-2 py-2.5",
                  active
                    ? isLight
                      ? "bg-slate-950/[0.04] text-accent-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_20px_rgba(15,23,42,0.08)]"
                      : "bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
                    : isLight
                      ? "text-muted-foreground hover:bg-slate-950/[0.04] hover:text-foreground"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white/80",
                )}
                style={{
                  WebkitTapHighlightColor: "transparent",
                  transform: "translateZ(0)",
                }}
              >
                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  <Icon
                    className={cn(
                      "transition-all duration-150",
                      active
                        ? isLight
                          ? "h-[21px] w-[21px] text-accent-foreground"
                          : "h-[21px] w-[21px] text-white"
                        : "h-5 w-5 text-current",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none tracking-[0.02em]",
                      active
                        ? isLight
                          ? "text-accent-foreground"
                          : "text-white"
                        : isLight
                          ? "text-muted-foreground"
                          : "text-white/60",
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "mt-1 h-1 w-1 rounded-full bg-current transition-opacity duration-150",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
