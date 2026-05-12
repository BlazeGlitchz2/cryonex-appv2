import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import {
  useEffect,
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { createRoot } from "react-dom/client";
import {
  RouterProvider,
  createBrowserRouter,
  useLocation,
  Outlet,
  useNavigate,
  useRouteError,
  Navigate,
} from "react-router";
import "./index.css";
import "./lib/i18n"; // Initialize i18n
import "./types/global.d.ts";
import {
  AuthProvider,
  GuestPreviewAuthProvider,
  useAuth,
} from "@/hooks/use-auth";
import { StudyRouteDataProvider } from "@/components/study/StudyRouteDataProvider";
import { SmartOptimizer } from "@/components/SmartOptimizer";
import { ThemeController } from "@/components/ThemeController";
import { AbdulSamiAnnouncement } from "@/components/AbdulSamiAnnouncement";
import { useDeviceInfo, useDeviceType } from "@/hooks/use-mobile";
import { usePlatformExperience } from "@/lib/platform-experience";
import { isNativePlatform } from "@/lib/platform-runtime";
import {
  buildLoginPath,
  canAccessProtectedRoute,
  buildOnboardingPath,
  disableGuestPreviewMode,
  isGuestPreviewMode,
  resolveOnboardingCompletionDestination,
  shouldUseDirectGuestPreviewNavigation,
} from "@/lib/auth-redirect";
import { getLandingEntrySurface } from "@/lib/landing-entry";
import { shouldUseTouchStudyShell } from "@/lib/mobile-shell";
import { needsOnboarding } from "@/lib/onboarding";
import {
  getLandingWarmupTargets,
  hasLandingWarmupBudget,
} from "@/lib/route-warmup";

// Lazy Load Pages
import React from "react";
import GlobalError from "./components/GlobalError";

type PreloadableComponent<T extends ComponentType<Record<string, never>>> =
  LazyExoticComponent<T> & {
    preload: () => Promise<unknown>;
  };

function lazyWithPreload<T extends ComponentType<Record<string, never>>>(
  factory: () => Promise<{ default: T }>,
) {
  const Component = lazy(factory) as PreloadableComponent<T>;
  Component.preload = factory;
  return Component;
}

function scheduleRouteWarmup(loaders: Array<() => Promise<unknown>>) {
  if (typeof window === "undefined") return;
  const idleWindow = window as Window &
    typeof globalThis & {
      requestIdleCallback?: (
        callback: IdleRequestCallback,
        options?: IdleRequestOptions,
      ) => number;
    };

  const run = () => {
    for (const load of loaders) {
      void load();
    }
  };

  if (idleWindow.requestIdleCallback) {
    idleWindow.requestIdleCallback(run, { timeout: 1200 });
    return;
  }

  globalThis.setTimeout(run, 250);
}

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <GlobalError
          error={this.state.error}
          resetErrorBoundary={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}

// Lazy Load Pages
const AppLayout = lazyWithPreload(() => import("./components/AppLayout.tsx"));
const NewLandingPage = lazyWithPreload(
  () => import("./pages/NewLandingPage.tsx"),
);
const PlansPage = lazy(() => import("./pages/Plans.tsx"));
const OnboardingPage = lazy(() => import("./pages/Onboarding.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AppPage = lazyWithPreload(() => import("./pages/App.tsx"));
const LibraryPage = lazy(() => import("./pages/Library.tsx"));
const ProjectsPage = lazy(() => import("./pages/Projects.tsx"));
const GPTsPage = lazy(() => import("./pages/GPTs.tsx"));
const IntegrationsPage = lazy(() => import("./pages/Integrations.tsx"));
const AdminPage = lazy(() => import("./pages/Admin.tsx"));
const PlaygroundPage = lazy(() => import("./pages/Playground.tsx"));
const SettingsPage = lazy(() => import("./pages/Settings.tsx"));
const SetupPage = lazy(() => import("./pages/Setup.tsx"));
const StudyDashboardPage = lazyWithPreload(
  () => import("./pages/StudyDashboard.tsx"),
);
const MobileStudyDashboardPage = lazyWithPreload(
  () => import("./pages/MobileStudyDashboard.tsx"),
);
const IELTSpeakingPage = lazy(() => import("./pages/IELTSpeaking.tsx"));

const StudyPackPage = lazy(() => import("./pages/StudyPack.tsx"));
const StudyWorkspacePage = lazyWithPreload(
  () => import("./pages/StudyWorkspace.tsx"),
);
const MobileStudyWorkspacePage = lazyWithPreload(
  () => import("./pages/MobileStudyWorkspace.tsx"),
);
const PrivacyPage = lazy(() => import("./pages/Privacy.tsx"));
const AboutPage = lazy(() => import("./pages/About.tsx"));
const TermsPage = lazy(() => import("./pages/Terms.tsx"));
const MediaStudio = lazy(() => import("./pages/MediaStudio.tsx"));
const AffiliateDashboardPage = lazy(
  () => import("./pages/AffiliateDashboard.tsx"),
);
const KnowledgeWebPage = lazy(() => import("./pages/KnowledgeWeb.tsx"));
const SharedMaterial = lazy(() => import("./pages/SharedMaterial.tsx"));
const HoverPreviewTest = lazy(() => import("./pages/HoverPreviewTest.tsx"));
const SchoolDashboard = lazyWithPreload(
  () => import("./pages/SchoolDashboard.tsx"),
);
const PublicProfilePage = lazy(() => import("./pages/PublicProfile.tsx"));
const NanoBananaMockup = lazy(() => import("./pages/NanoBananaMockup.tsx"));

// Receipts Engine / Vault Routes
const VaultDashboard = lazy(() => import("./pages/VaultDashboard.tsx"));
const VaultEditor = lazy(() => import("./pages/VaultEditor.tsx"));
const VerifyPortal = lazy(() => import("./pages/VerifyPortal.tsx"));
const GuestStudyDashboard = lazy(
  () => import("./pages/GuestStudyDashboard.tsx"),
);

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function getTrustedFrameOrigins() {
  if (typeof window === "undefined") return new Set<string>();

  const configuredOrigins = String(
    import.meta.env.VITE_TRUSTED_FRAME_ORIGINS || "",
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return new Set([window.location.origin, ...configuredOrigins]);
}

function getParentOrigin() {
  if (typeof document === "undefined" || !document.referrer) return null;

  try {
    return new URL(document.referrer).origin;
  } catch {
    return null;
  }
}

function RouteSyncer() {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.parent === window) return;

    const parentOrigin = getParentOrigin();
    if (!parentOrigin || !getTrustedFrameOrigins().has(parentOrigin)) return;

    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      parentOrigin,
    );
  }, [location.pathname]);

  useEffect(() => {
    if (!isNativePlatform()) {
      return;
    }

    void import("@/lib/mobile").then(({ applyNativeStatusBarForPath }) => {
      void applyNativeStatusBarForPath(location.pathname);
    });
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (!getTrustedFrameOrigins().has(event.origin)) return;
      if (
        typeof event.data !== "object" ||
        event.data === null ||
        event.data.type !== "navigate"
      ) {
        return;
      }

      if (event.data.direction === "back") {
        window.history.back();
      }
      if (event.data.direction === "forward") {
        window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Onboarding Redirection Logic
  useEffect(() => {
    if (!isLoading && user) {
      const publicPaths = ["/privacy", "/terms", "/about"];
      const isPublicPath = publicPaths.includes(location.pathname);
      const guestPreviewMode = isGuestPreviewMode();

      // If user is logged in but hasn't completed onboarding
      if (needsOnboarding(user) && !guestPreviewMode) {
        // Redirect to /onboarding unless they are on a public page or already on /onboarding
        if (location.pathname !== "/onboarding" && !isPublicPath) {
          const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
          navigate(buildOnboardingPath(redirectTarget), { replace: true });
        }
      }

      // If user HAS completed onboarding and tries to go to /onboarding, redirect to /app
      if (!needsOnboarding(user) && location.pathname === "/onboarding") {
        disableGuestPreviewMode();
        navigate(
          resolveOnboardingCompletionDestination(
            new URLSearchParams(location.search).get("redirect"),
          ),
          { replace: true },
        );
      }
    }
  }, [
    user,
    isLoading,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  return <Outlet />;
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="flex flex-col items-center gap-3">
      <div className="h-11 w-11 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
        <div className="h-4 w-4 rounded-md bg-white/20" />
      </div>
      <p className="text-sm text-muted-foreground/80">Loading Cryonex...</p>
    </div>
  </div>
);

const MobileLanding = lazy(() => import("./pages/MobileLanding.tsx"));
const ConsentBanner = lazy(() =>
  import("./components/ConsentBanner")
    .then((module) => ({
      default: module.ConsentBanner,
    }))
    .catch(() => ({ default: () => null })),
);
const OfflineBanner = lazy(() =>
  import("./components/OfflineBanner")
    .then((module) => ({
      default: module.OfflineBanner,
    }))
    .catch(() => ({ default: () => null })),
);
const OfflineSync = lazy(() =>
  import("./components/OfflineSync")
    .then((module) => ({
      default: module.OfflineSync,
    }))
    .catch(() => ({ default: () => null })),
);
const UpdateChecker = lazy(() =>
  import("./components/UpdateChecker")
    .then((module) => ({
      default: module.UpdateChecker,
    }))
    .catch(() => ({ default: () => null })),
);
const VercelAnalytics = lazy(() =>
  import("@vercel/analytics/react")
    .then((module) => ({
      default: module.Analytics,
    }))
    .catch((error) => {
      console.warn("Analytics blocked or failed to load:", error);
      return { default: () => null };
    }),
);

const LandingWrapper = () => {
  const deviceInfo = useDeviceInfo();
  const platformExperience = usePlatformExperience();
  const landingSurface = getLandingEntrySurface({
    deviceInfo,
    isNative: isNativePlatform(),
  });
  const shouldOpenStudyShell = landingSurface === "study-shell";

  useEffect(() => {
    const networkNavigator = navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
      };
      deviceMemory?: number;
    };

    const warmupTargets = getLandingWarmupTargets({
      landingSurface,
      shouldOpenStudyShell,
      shouldReduceWarmup: platformExperience.shouldReduceWarmup,
      hasWarmupBudget: hasLandingWarmupBudget({
        saveData: networkNavigator.connection?.saveData,
        effectiveType: networkNavigator.connection?.effectiveType,
        deviceMemoryGb: networkNavigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
      }),
    });

    if (warmupTargets.length === 0) {
      return;
    }

    const preloaders = {
      "app-layout": AppLayout.preload,
      "study-dashboard": StudyDashboardPage.preload,
    } as const;

    scheduleRouteWarmup(warmupTargets.map((target) => preloaders[target]));
  }, [
    landingSurface,
    platformExperience.shouldReduceWarmup,
    shouldOpenStudyShell,
  ]);

  // Native apps open the study shell directly; mobile web keeps acquisition copy.
  if (shouldOpenStudyShell) {
    return <Navigate to="/study/dashboard" replace />;
  }

  if (landingSurface === "mobile-landing") {
    return <MobileLanding />;
  }

  return <NewLandingPage />;
};

const StudyDashboardWrapper = () => {
  const deviceInfo = useDeviceInfo();
  const deviceType = useDeviceType();
  const platformExperience = usePlatformExperience();
  const guestPreviewMode =
    isGuestPreviewMode() && shouldUseDirectGuestPreviewNavigation();
  const usesTouchStudyShell = shouldUseTouchStudyShell({
    deviceType,
    isSmartboard: deviceInfo.isSmartboard,
    pathname: "/study/dashboard",
  });

  useEffect(() => {
    if (platformExperience.shouldReduceWarmup || guestPreviewMode) {
      return;
    }

    scheduleRouteWarmup([
      AppLayout.preload,
      usesTouchStudyShell
        ? MobileStudyWorkspacePage.preload
        : StudyWorkspacePage.preload,
    ]);
  }, [
    guestPreviewMode,
    platformExperience.shouldReduceWarmup,
    usesTouchStudyShell,
  ]);

  if (guestPreviewMode) {
    return (
      <Suspense fallback={<LoadingFallback />}>
        <GuestStudyDashboard />
      </Suspense>
    );
  }

  return (
    <StudyRouteDataProvider>
      {usesTouchStudyShell ? (
        <MobileStudyDashboardPage />
      ) : (
        <StudyDashboardPage />
      )}
    </StudyRouteDataProvider>
  );
};

const StudyWorkspaceWrapper = () => {
  const deviceInfo = useDeviceInfo();
  const deviceType = useDeviceType();
  const platformExperience = usePlatformExperience();
  const usesTouchStudyShell = shouldUseTouchStudyShell({
    deviceType,
    isSmartboard: deviceInfo.isSmartboard,
    pathname: "/study/workspace",
  });

  useEffect(() => {
    if (platformExperience.shouldReduceWarmup) {
      return;
    }

    scheduleRouteWarmup([AppLayout.preload, StudyDashboardPage.preload]);
  }, [platformExperience.shouldReduceWarmup]);

  return usesTouchStudyShell ? (
    <MobileStudyWorkspacePage />
  ) : (
    <StudyWorkspacePage />
  );
};

function RouterErrorBoundary() {
  const error = useRouteError();
  return (
    <GlobalError
      error={error}
      resetErrorBoundary={() => window.location.reload()}
    />
  );
}

function NativeBootstrap() {
  useEffect(() => {
    if (!isNativePlatform()) {
      return;
    }

    void import("@/lib/mobile").then(({ initializeMobile }) => {
      void initializeMobile();
    });
  }, []);

  return null;
}

function RequireAppAccess() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const guestPreviewMode = isGuestPreviewMode();
  const allowsDirectGuestPreview = shouldUseDirectGuestPreviewNavigation();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (
    !canAccessProtectedRoute({
      pathname: location.pathname,
      isAuthenticated,
      guestPreviewMode,
      allowsDirectGuestPreview,
    })
  ) {
    return (
      <Navigate
        to={buildLoginPath(
          `${location.pathname}${location.search}${location.hash}`,
        )}
        replace
      />
    );
  }

  return <Outlet />;
}

const router = createBrowserRouter([
  {
    element: <RouteSyncer />,
    errorElement: <RouterErrorBoundary />,
    children: [
      {
        path: "/",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <LandingWrapper />
          </Suspense>
        ),
      },
      {
        path: "/plans",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PlansPage />
          </Suspense>
        ),
      },
      {
        path: "/onboarding",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <OnboardingPage />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/auth",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/privacy",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PrivacyPage />
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: "/terms",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <TermsPage />
          </Suspense>
        ),
      },
      {
        path: "/hover-test",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <HoverPreviewTest />
          </Suspense>
        ),
      },
      {
        path: "/share/:type/:shareId",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <SharedMaterial />
          </Suspense>
        ),
      },
      {
        path: "/school/profiles/:profileUserId",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PublicProfilePage />
          </Suspense>
        ),
      },
      {
        path: "/verify/:id",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <VerifyPortal />
          </Suspense>
        ),
      },
      {
        element: <RequireAppAccess />,
        children: [
          {
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <AppLayout />
              </Suspense>
            ),
            children: [
              {
                path: "/app",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <AppPage />
                  </Suspense>
                ),
              },
              {
                path: "/app/chat/:chatId",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <AppPage />
                  </Suspense>
                ),
              },
              {
                path: "/create",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <MediaStudio />
                  </Suspense>
                ),
              },
              {
                path: "/playground",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <PlaygroundPage />
                  </Suspense>
                ),
              },
              {
                path: "/library",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <LibraryPage />
                  </Suspense>
                ),
              },
              {
                path: "/projects",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <ProjectsPage />
                  </Suspense>
                ),
              },
              {
                path: "/gpts",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <GPTsPage />
                  </Suspense>
                ),
              },
              {
                path: "/integrations",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <IntegrationsPage />
                  </Suspense>
                ),
              },
              {
                path: "/admin",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <AdminPage />
                  </Suspense>
                ),
              },
              {
                path: "/setup",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <SetupPage />
                  </Suspense>
                ),
              },
              {
                path: "/settings",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <SettingsPage />
                  </Suspense>
                ),
              },
              {
                path: "/study",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <Navigate to="/study/dashboard" replace />
                  </Suspense>
                ),
              },
              {
                path: "/study/ielts",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <IELTSpeakingPage />
                  </Suspense>
                ),
              },
              {
                path: "/study/packs/:packId",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <StudyPackPage />
                  </Suspense>
                ),
              },
              {
                path: "/school",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <SchoolDashboard />
                  </Suspense>
                ),
              },
              {
                path: "/school/profiles/:profileUserId",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <PublicProfilePage />
                  </Suspense>
                ),
              },
              {
                path: "/study/dashboard",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <StudyDashboardWrapper />
                  </Suspense>
                ),
              },
              {
                path: "/study/workspace/:docId",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <StudyWorkspaceWrapper />
                  </Suspense>
                ),
              },
              {
                path: "/study/graph",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <KnowledgeWebPage />
                  </Suspense>
                ),
              },
              {
                path: "/vault",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <VaultDashboard />
                  </Suspense>
                ),
              },
              {
                path: "/vault/editor/:id",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <VaultEditor />
                  </Suspense>
                ),
              },
              {
                path: "/affiliate",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <AffiliateDashboardPage />
                  </Suspense>
                ),
              },
              {
                path: "/mockup",
                element: (
                  <Suspense fallback={<LoadingFallback />}>
                    <NanoBananaMockup />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },
      {
        path: "*",
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);

const shouldLoadAnalytics =
  typeof window !== "undefined" &&
  !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
const shouldUseGuestPreviewProviders =
  typeof window !== "undefined" &&
  isGuestPreviewMode() &&
  shouldUseDirectGuestPreviewNavigation();

function AppProviders({ children }: { children: React.ReactNode }) {
  if (shouldUseGuestPreviewProviders) {
    return (
      <ConvexAuthProvider client={convex}>
        <GuestPreviewAuthProvider>{children}</GuestPreviewAuthProvider>
      </ConvexAuthProvider>
    );
  }

  return (
    <ConvexAuthProvider client={convex}>
      <AuthProvider>{children}</AuthProvider>
    </ConvexAuthProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.Fragment>
    <InstrumentationProvider>
      <AppProviders>
          <ErrorBoundary>
            <NativeBootstrap />
            <ThemeController />
            <SmartOptimizer>
              <Suspense fallback={null}>
                <OfflineBanner />
                <OfflineSync />
                <UpdateChecker />
              </Suspense>
              <RouterProvider router={router} />
              <AbdulSamiAnnouncement />
              <Toaster />
              <Suspense fallback={null}>
                <ConsentBanner />
                {shouldLoadAnalytics ? <VercelAnalytics /> : null}
              </Suspense>
            </SmartOptimizer>
          </ErrorBoundary>
      </AppProviders>
    </InstrumentationProvider>
  </React.Fragment>,
);
