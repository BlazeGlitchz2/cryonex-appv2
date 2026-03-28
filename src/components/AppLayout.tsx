import { lazy, Suspense, useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LiquidSidebar } from "@/components/layout/LiquidSidebar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu, MessageCircleMore, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/lib/stores/chat-store";
import { useUIStore } from "@/lib/stores/ui-store";
import { useSessionTracking } from "@/hooks/use-session-tracking";
import { ActivityDropdown } from "@/components/ui/activity-dropdown";
import { usePerformanceStore } from "@/lib/stores/performance-store";
import { APP_OVERLAY_ROOT_ID } from "@/lib/portal-container";
import { cn } from "@/lib/utils";
import { PerformanceOptimizer } from "@/components/performance/PerformanceOptimizer";
import { StudyModeToggle } from "@/components/study/StudyModeToggle";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileBottomNav } from "@/components/ui/MobileBottomNav";
import { AuroraThemeBackground } from "@/components/ui/background-gradient-glow";
import { useThemeStore } from "@/lib/stores/theme-store";
import {
  getMobileRouteChrome,
  isAssistantRoute as isAssistantMobileRoute,
  isVirtualKeyboardLikelyVisible,
  usesImmersivePhoneChrome,
} from "@/lib/mobile-shell";

const ModelPicker = lazy(() =>
  import("@/components/models/ModelPicker").then((module) => ({
    default: module.ModelPicker,
  })),
);

const GlobalSearch = lazy(() =>
  import("@/components/GlobalSearch").then((module) => ({
    default: module.GlobalSearch,
  })),
);

const SubwaySurfersOverlay = lazy(() =>
  import("@/components/ui/subway-surfers").then((module) => ({
    default: module.SubwaySurfersOverlay,
  })),
);

const OnboardingTour = lazy(() =>
  import("@/components/onboarding/OnboardingTour").then((module) => ({
    default: module.OnboardingTour,
  })),
);

const MobileOnboarding = lazy(() =>
  import("@/components/onboarding/MobileOnboarding").then((module) => ({
    default: module.MobileOnboarding,
  })),
);

const QuickActionsBar = lazy(() =>
  import("@/components/mobile/QuickActionsBar").then((module) => ({
    default: module.QuickActionsBar,
  })),
);

export default function AppLayout() {
  const mode = useThemeStore((state) => state.mode);
  const { isModelBrowserOpen, setModelBrowserOpen } = useChatStore();
  const {
    showSubwaySurfers,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
  } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const qualityTier = usePerformanceStore((state) => state.qualityTier);
  const isLite = qualityTier === "lite";
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [shouldLoadEnhancements, setShouldLoadEnhancements] = useState(false);
  const isAssistantRoute = isAssistantMobileRoute(location.pathname);
  const mobileRouteChrome = getMobileRouteChrome(location.pathname);

  useSessionTracking();
  const deviceType = useDeviceType();
  const isPhone = deviceType === "phone";
  const isTablet = deviceType === "tablet";
  const usesImmersivePhoneShell = usesImmersivePhoneChrome(location.pathname);
  const showPhoneHeader =
    isPhone &&
    !isAssistantRoute &&
    !usesImmersivePhoneShell &&
    mobileRouteChrome.showsHeader;
  const showPhoneDock =
    isPhone &&
    !isAssistantRoute &&
    !usesImmersivePhoneShell &&
    !isKeyboardOpen &&
    mobileRouteChrome.showsBottomDock;
  // Smart tablet optimization: use reduced backdrop-filter complexity
  const useTabletOptimizations = isTablet;
  const phoneDockPadding = showPhoneDock
    ? "calc(env(safe-area-inset-bottom, 0px) + 8.75rem)"
    : "calc(env(safe-area-inset-bottom, 0px) + 1.25rem)";
  const phoneContentStyle = isPhone
    ? {
        ...(useTabletOptimizations ? { willChange: "opacity" as const } : {}),
        ...(!isAssistantRoute ? { paddingBottom: phoneDockPadding } : {}),
      }
    : undefined;

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, setMobileSidebarOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const idleWindow = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
      };

    const enableEnhancements = () => {
      setShouldLoadEnhancements(true);
    };

    if (isPhone) {
      const warmOnInteraction = () => {
        enableEnhancements();
        window.removeEventListener("pointerdown", warmOnInteraction);
        window.removeEventListener("keydown", warmOnInteraction);
      };

      window.addEventListener("pointerdown", warmOnInteraction, {
        passive: true,
      });
      window.addEventListener("keydown", warmOnInteraction);

      const timeoutId = globalThis.setTimeout(enableEnhancements, 2500);

      return () => {
        window.removeEventListener("pointerdown", warmOnInteraction);
        window.removeEventListener("keydown", warmOnInteraction);
        globalThis.clearTimeout(timeoutId);
      };
    }

    const warmAdjacentRoutes = () => {
      enableEnhancements();
      void import("@/components/GlobalSearch");
      void import("@/components/onboarding/OnboardingTour");

      if (isAssistantRoute) {
        void import("@/pages/StudyDashboard");
        return;
      }

      if (isPhone) {
        void import("@/pages/MobileStudyDashboard");
        void import("@/pages/MobileStudyWorkspace");
      } else {
        void import("@/pages/StudyDashboard");
        void import("@/pages/StudyWorkspace");
      }
    };

    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(warmAdjacentRoutes, {
        timeout: 1200,
      });
      return;
    }

    const timeoutId = globalThis.setTimeout(warmAdjacentRoutes, 250);
    return () => globalThis.clearTimeout(timeoutId);
  }, [isAssistantRoute, isPhone]);

  useEffect(() => {
    if (!isPhone || typeof window === "undefined") return;

    const syncKeyboardState = () => {
      const activeElement = document.activeElement as HTMLElement | null;
      const viewportHeight =
        window.visualViewport?.height ?? window.innerHeight;

      setIsKeyboardOpen(
        isVirtualKeyboardLikelyVisible({
          activeTagName: activeElement?.tagName,
          innerHeight: window.innerHeight,
          isContentEditable: activeElement?.isContentEditable,
          viewportHeight,
        }),
      );
    };

    const syncAfterFocusShift = () => {
      window.setTimeout(syncKeyboardState, 0);
    };

    syncKeyboardState();
    window.visualViewport?.addEventListener("resize", syncKeyboardState);
    window.addEventListener("focusin", syncKeyboardState);
    window.addEventListener("focusout", syncAfterFocusShift);

    return () => {
      window.visualViewport?.removeEventListener("resize", syncKeyboardState);
      window.removeEventListener("focusin", syncKeyboardState);
      window.removeEventListener("focusout", syncAfterFocusShift);
    };
  }, [isPhone]);

  const handlePhoneHeaderAction = () => {
    if (mobileRouteChrome.headerAction === "capture") {
      navigate("/study/dashboard?action=scan#mobile-capture-lane");
      return;
    }

    if (mobileRouteChrome.headerAction === "assistant") {
      navigate("/app");
    }
  };

  const PhoneHeaderActionIcon =
    mobileRouteChrome.headerAction === "capture" ? Upload : Sparkles;
  const phoneHeaderActionLabel =
    mobileRouteChrome.headerAction === "capture"
      ? "Capture a study source"
      : "Open assistant";
  const isLight = mode === "light";
  const routeKey = `${location.pathname}${location.search}`;
  const shouldReduceMotion = useReducedMotion();
  const shouldAnimateRoutes = !isLite && !shouldReduceMotion;

  return (
    <div
      className={cn(
        "relative flex h-[100dvh] overflow-hidden selection:text-white",
        isLight
          ? "bg-[radial-gradient(circle_at_20%_10%,rgba(248,197,220,0.38),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(255,233,209,0.32),transparent_26%),linear-gradient(180deg,#fff8fb_0%,#f6f1ff_52%,#edf3ff_100%)] text-slate-900 selection:bg-fuchsia-300/40"
          : "bg-[radial-gradient(circle_at_20%_10%,rgba(115,69,255,0.24),transparent_34%),radial-gradient(circle_at_76%_18%,rgba(210,68,255,0.18),transparent_24%),linear-gradient(180deg,#09041d_0%,#060217_52%,#03010d_100%)] text-white selection:bg-[#D244FF]/25",
      )}
    >
      <AuroraThemeBackground
        className="fixed inset-0 z-0 min-h-0 pointer-events-none"
        contentClassName="hidden"
      />
      <div className="fixed inset-0 z-0 pointer-events-none">
        {!isPhone && (
          <>
            <div
              className={cn(
                "absolute inset-0",
                isLight
                  ? "opacity-[0.14] [background-image:radial-gradient(circle,rgba(255,255,255,0.95)_1px,transparent_1.6px)] [background-size:40px_40px]"
                  : "opacity-[0.11] [background-image:radial-gradient(circle,rgba(255,255,255,0.85)_1px,transparent_1.4px)] [background-size:36px_36px]",
              )}
            />
            <div
              className={cn(
                "absolute inset-0",
                isLight
                  ? "opacity-[0.06] [background-image:radial-gradient(circle,rgba(255,255,255,0.92)_1px,transparent_1.2px)] [background-position:20px_20px] [background-size:68px_68px]"
                  : "opacity-[0.05] [background-image:radial-gradient(circle,rgba(255,255,255,0.75)_1px,transparent_1.2px)] [background-position:18px_18px] [background-size:62px_62px]",
              )}
            />
            <div
              className={cn(
                "absolute left-[58%] top-[38%] h-[1px] w-44 rotate-[-28deg] bg-gradient-to-r from-transparent to-transparent",
                isLight ? "via-fuchsia-500/15 opacity-60" : "via-white/18 opacity-45",
              )}
            />
          </>
        )}
      </div>

      <div className="fixed inset-0 z-[1] pointer-events-none">
        {!showSubwaySurfers && (
          <>
            <div
              className={cn(
                "absolute inset-0",
                useTabletOptimizations
                  ? isLight
                    ? "bg-white/20"
                    : "bg-[#050218]/50"
                  : isPhone
                    ? isLight
                      ? "bg-[rgba(255,248,252,0.42)] backdrop-blur-[1.25px]"
                      : "bg-[rgba(4,6,18,0.18)] backdrop-blur-[0.75px]"
                    : isLight
                      ? "bg-[rgba(255,248,252,0.42)] backdrop-blur-[1.25px]"
                      : "bg-[rgba(5,2,24,0.28)] backdrop-blur-[1.5px]",
              )}
              style={
                useTabletOptimizations ? { willChange: "auto" } : undefined
              }
            />
            <div
              className={cn(
                "absolute inset-0",
                isLight
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.2),transparent_28%,rgba(248,197,220,0.12)_100%)]"
                  : "bg-[linear-gradient(180deg,rgba(255,255,255,0.015),transparent_22%,rgba(0,0,0,0.22))]",
              )}
            />
          </>
        )}
      </div>

      {!isPhone && (
        <div
          className={cn(
            "relative z-20 hidden md:block h-full shrink-0",
            isTablet ? "p-3" : "p-4",
          )}
        >
          <LiquidSidebar className="h-full" isTablet={isTablet} />
        </div>
      )}

      {isPhone && (
        <Sheet open={isMobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent
            side="left"
            className={cn(
              "overflow-hidden p-0",
              isTablet ? "w-[340px]" : "w-[280px]",
              isLight
                ? "border-r border-rose-200/70 bg-[rgba(255,248,252,0.82)]"
                : "border-r border-white/[0.06] bg-[#0a0625]/96",
            )}
          >
            <div
              className={cn(
                "absolute left-0 top-0 z-0 h-[30%] w-[80%] rounded-full blur-[80px] pointer-events-none",
                isLight ? "bg-fuchsia-300/18" : "bg-[#D244FF]/12",
              )}
            />
            <div
              className={cn(
                "absolute bottom-0 right-0 z-0 h-[30%] w-[80%] rounded-full blur-[80px] pointer-events-none",
                isLight ? "bg-sky-300/18" : "bg-[#4f4297]/12",
              )}
            />
            <LiquidSidebar
              isMobile
              isTablet={isTablet}
              className="h-full w-full border-none bg-transparent relative z-10"
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 min-w-0 overflow-hidden">
        {showPhoneHeader && (
          <header
            className={cn(
              "safe-top z-40 flex shrink-0 items-center justify-between border-b",
              isTablet ? "min-h-18 px-5 pb-3 pt-2" : "min-h-16 px-4 pb-3 pt-2",
              isAssistantRoute
                ? "absolute inset-x-0 top-0 border-b-0 bg-transparent backdrop-blur-0"
                : isLight
                  ? "border-rose-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,248,252,0.72))] backdrop-blur-2xl"
                  : "border-white/[0.06] bg-[linear-gradient(180deg,rgba(9,12,30,0.94),rgba(9,12,30,0.78))] backdrop-blur-2xl",
            )}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSidebarOpen(true)}
                className={cn(
                  "rounded-xl touch-feedback",
                  isLight
                    ? "text-slate-700 hover:bg-slate-900/5"
                    : "text-white hover:bg-white/10",
                  isTablet ? "h-11 w-11" : "h-10 w-10",
                )}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]",
                      isLight
                        ? "border border-rose-200/80 bg-white/55 text-slate-500"
                        : "border border-white/10 bg-white/[0.04] text-white/48",
                    )}
                  >
                    {mobileRouteChrome.eyebrow}
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-2 font-semibold tracking-tight",
                    isLight ? "text-slate-900" : "text-white",
                    isTablet ? "text-lg" : "text-base",
                  )}
                >
                  {mobileRouteChrome.title}
                </p>
                <p
                  className={cn(
                    "max-w-[16rem] text-[11px] leading-5",
                    isLight
                      ? "text-slate-600"
                      : "text-white/44",
                    isAssistantRoute && (isLight ? "text-slate-500" : "text-white/28"),
                  )}
                >
                  {mobileRouteChrome.subtitle}
                </p>
              </div>
            </div>
            {mobileRouteChrome.headerAction === "none" ? (
              <div className={cn(isTablet ? "h-11 w-11" : "h-10 w-10")} />
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-xl border touch-feedback transition-all",
                  isLight
                    ? "border-rose-200/80 bg-white/55 text-slate-600 hover:bg-white/75 hover:text-slate-900"
                    : "border-white/[0.08] bg-white/[0.05] text-white/72 hover:bg-white/[0.1] hover:text-white",
                  isTablet ? "h-11 w-11" : "h-10 w-10",
                )}
                aria-label={phoneHeaderActionLabel}
                onClick={handlePhoneHeaderAction}
              >
                <PhoneHeaderActionIcon className="h-5 w-5" />
              </Button>
            )}
          </header>
        )}

        {/* Desktop/Tablet Header / Activity Bar */}
        {!isPhone && !isAssistantRoute && (
          <div
            className={cn(
              "absolute z-50",
              isTablet ? "top-3 right-3" : "top-6 right-6", // Smaller offset for tablets
            )}
          >
            <div
              className={cn("flex items-center", isTablet ? "gap-2" : "gap-3")}
            >
              <div id="onboarding-study-toggle">
                <StudyModeToggle />
              </div>
              <div
                id="onboarding-activity-dropdown"
                className={cn(
                  "rounded-2xl border backdrop-blur-xl",
                  isLight
                    ? "border-rose-200/70 bg-[rgba(255,255,255,0.7)] shadow-[0_10px_30px_rgba(236,72,153,0.08)]"
                    : "border-white/[0.06] bg-[#0a0625]/72",
                )}
              >
                <ActivityDropdown />
              </div>
            </div>
          </div>
        )}

        <main
          className={cn(
            "flex-1 overflow-hidden relative w-full",
            isPhone
              ? "p-0"
              : isAssistantRoute
                ? "p-0 md:px-5 md:pb-5 md:pt-3"
                : "p-0 md:p-0 md:pr-4 md:py-4",
          )}
        >
          <div
              className={cn(
                "h-full w-full overflow-hidden relative",
                isAssistantRoute
                  ? "rounded-none border-0 bg-transparent"
                  : isPhone
                    ? "rounded-none border-0"
                    : "border md:rounded-[28px]",
                !isPhone && !isLite && !isAssistantRoute && "glass-panel",
                isLite && (isLight ? "bg-white/72" : "bg-[#0a0625]"),
              )}
              style={
                !isPhone && !isAssistantRoute
                  ? {
                    background: isLight
                      ? "rgba(255, 255, 255, 0.65)"
                      : "rgba(10, 6, 37, 0.88)",
                    borderColor: isLight
                      ? "rgba(244, 114, 182, 0.18)"
                      : "rgba(210, 68, 255, 0.1)",
                    boxShadow: isLight
                      ? "0 24px 80px rgba(244, 114, 182, 0.08)"
                      : "0 24px 80px rgba(4, 2, 18, 0.45)",
                  }
                : undefined
            }
          >
            <div
              className={cn(
                "h-full w-full overflow-y-auto custom-scrollbar mobile-scroll-thin",
                isPhone && !isAssistantRoute && "pb-0",
                isLight ? "text-slate-900" : "text-white",
              )}
              style={phoneContentStyle}
            >
              {shouldAnimateRoutes ? (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={routeKey}
                    className="h-full w-full"
                    initial={{ opacity: 0.9, y: 10, scale: 0.995 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        duration: 0.38,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.992,
                      filter: "blur(2px)",
                      transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
                    }}
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <Outlet />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation & Quick Actions */}
      {showPhoneDock &&
        mobileRouteChrome.showsQuickCapture &&
        shouldLoadEnhancements && (
        <Suspense fallback={null}>
          <QuickActionsBar />
        </Suspense>
      )}
      {showPhoneDock && <MobileBottomNav />}

      {isAssistantRoute && (
        <button
          type="button"
          className={cn(
            "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full border text-white transition-transform hover:scale-[1.03]",
            isLight
              ? "border-fuchsia-200 bg-[linear-gradient(180deg,rgba(244,114,182,0.92),rgba(168,85,247,0.88))] shadow-[0_20px_40px_rgba(190,24,93,0.18)]"
              : "border-white/[0.08] bg-[linear-gradient(180deg,rgba(146,73,229,0.9),rgba(96,45,161,0.92))] shadow-[0_20px_40px_rgba(54,18,91,0.35)]",
          )}
          aria-label="Open support chat"
        >
          <MessageCircleMore className="h-6 w-6" />
        </button>
      )}

      {/* Mobile Onboarding */}
      {isPhone && shouldLoadEnhancements && (
        <Suspense fallback={null}>
          <MobileOnboarding />
        </Suspense>
      )}

      {isModelBrowserOpen && (
        <Suspense fallback={null}>
          <ModelPicker
            open={isModelBrowserOpen}
            onOpenChange={setModelBrowserOpen}
          />
        </Suspense>
      )}
      {shouldLoadEnhancements && !isPhone && (
        <Suspense fallback={null}>
          <GlobalSearch />
        </Suspense>
      )}
      {showSubwaySurfers && (
        <Suspense fallback={null}>
          <SubwaySurfersOverlay />
        </Suspense>
      )}
      <div id={APP_OVERLAY_ROOT_ID} aria-hidden="true" />
      {!isModelBrowserOpen &&
        !isPhone &&
        !isAssistantRoute &&
        shouldLoadEnhancements && (
          <Suspense fallback={null}>
            <OnboardingTour
              tourId="main-app"
              steps={[
                {
                  targetId: "onboarding-sidebar-search",
                  title: "Global Search",
                  description:
                    "Press Cmd+K to search your chats, libraries, and tools instantly.",
                  position: "right",
                },
                {
                  targetId: "onboarding-nav-assistant",
                  title: "AI Assistant",
                  description:
                    "Chat with our advanced AI models. Switch between models seamlessly.",
                  position: "right",
                },
                {
                  targetId: "onboarding-nav-studio",
                  title: "Creative Studio",
                  description:
                    "Generate images, videos, and music in the Media Studio.",
                  position: "right",
                },
                {
                  targetId: "onboarding-study-toggle",
                  title: "Focus Mode",
                  description:
                    "Toggle distraction-free mode for deep work and study sessions.",
                  position: "bottom",
                },
                {
                  targetId: "onboarding-activity-dropdown",
                  title: "Activity Hub",
                  description:
                    "Track your usage, storage, and recent AI interactions here.",
                  position: "bottom",
                },
                {
                  targetId: "onboarding-pro-card",
                  title: "Upgrade to Pro",
                  description:
                    "Unlock infinite generation limits and exclusive models.",
                  position: "right",
                },
              ]}
            />
          </Suspense>
        )}
      <PerformanceOptimizer />
    </div>
  );
}
