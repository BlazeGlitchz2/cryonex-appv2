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
import { getActiveMobileNavKey } from "@/lib/mobile-shell";
import { useThemeStore } from "@/lib/stores/theme-store";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  navKey: "home" | "assistant" | "library" | "profile" | "new";
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutGrid, label: "Home", path: "/study/dashboard", navKey: "home" },
  {
    icon: MessageSquare,
    label: "Coach",
    path: "/app",
    navKey: "assistant",
  },
  {
    icon: Scan,
    label: "Capture",
    path: "/study/dashboard?action=scan#mobile-capture-lane",
    navKey: "new",
    isCenter: true,
  },
  { icon: FolderOpen, label: "Library", path: "/library", navKey: "library" },
  { icon: User, label: "Profile", path: "/settings", navKey: "profile" },
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const deviceType = useDeviceType();
  const isiOSDevice = isIOS();
  const isAndroidDevice = isAndroid();
  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";
  const navBottomPadding = "calc(env(safe-area-inset-bottom, 0px) + 0.5rem)";
  const navSurfaceClass = isiOSDevice
    ? isLight
      ? "border-rose-200/75 bg-[rgba(255,252,254,0.88)] shadow-[0_20px_60px_rgba(236,72,153,0.1)] backdrop-blur-[28px]"
      : "border-white/[0.08] bg-[rgba(9,12,30,0.72)] backdrop-blur-[28px]"
    : isLight
      ? "border-rose-200/75 bg-[rgba(255,252,254,0.9)] shadow-[0_20px_60px_rgba(236,72,153,0.1)] backdrop-blur-xl"
      : "border-white/[0.06] bg-[rgba(9,12,30,0.92)] backdrop-blur-xl";

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

  return (
    <div
      className={cn("fixed inset-x-0 bottom-0 z-50", "px-3")}
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
            ? "bg-gradient-to-t from-[#fff7fb] to-transparent"
            : "bg-gradient-to-t from-[#030005] to-transparent",
        )}
      />

      <nav
        className={cn(
          "pointer-events-auto mx-auto w-full border shadow-[0_20px_60px_rgba(0,0,0,0.42)]",
          "max-w-lg rounded-[1.85rem] px-2.5 py-2.5",
          navSurfaceClass,
        )}
        style={{
          transform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
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
                    "relative flex flex-col items-center justify-center no-select group",
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
                        ? "bg-gradient-to-tr from-fuchsia-400/18 to-cyan-400/18"
                        : "bg-gradient-to-tr from-sky-500/16 to-indigo-500/16",
                    )}
                  />
                  <div
                    className={cn(
                      "relative flex items-center justify-center rounded-[1.55rem] border",
                      isLight
                        ? "border-fuchsia-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,197,220,0.34))] shadow-[0_10px_28px_rgba(236,72,153,0.16)]"
                        : "border-white/[0.12] bg-[linear-gradient(180deg,rgba(26,33,57,0.98),rgba(31,46,89,0.96))] shadow-[0_10px_28px_rgba(0,0,0,0.45)]",
                      "h-12 w-12",
                      "active:scale-95 transition-transform duration-150",
                    )}
                    style={{ transform: "translateZ(0)" }}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isLight
                          ? "text-slate-950 drop-shadow-[0_2px_4px_rgba(255,255,255,0.65)]"
                          : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "mt-1 text-[10px] font-medium tracking-[0.02em]",
                      isLight ? "text-slate-600" : "text-white/60",
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
                  "relative flex min-h-[3.55rem] flex-col items-center justify-center no-select transition-all duration-150",
                  "rounded-[1.3rem] px-2 py-2",
                  active
                    ? isLight
                      ? "bg-white text-slate-950 shadow-[0_8px_24px_rgba(236,72,153,0.1)]"
                      : "bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                    : isLight
                      ? "text-slate-500 hover:bg-white/70 hover:text-slate-950"
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
                          ? "h-[21px] w-[21px] text-slate-950"
                          : "h-[21px] w-[21px] text-white"
                        : "h-5 w-5 text-current",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none tracking-[0.02em]",
                      active
                        ? isLight
                          ? "text-slate-950"
                          : "text-white"
                        : isLight
                          ? "text-slate-500"
                          : "text-white/42",
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
