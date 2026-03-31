import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@lobehub/ui";
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
import { ConsentBanner } from "./components/ConsentBanner";
import { Analytics } from "@vercel/analytics/react";
import "./types/global.d.ts";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { StudyRouteDataProvider } from "@/components/study/StudyRouteDataProvider";
import { SmartOptimizer } from "@/components/SmartOptimizer";
import { ThemeController } from "@/components/ThemeController";
import { initializeMobile } from "@/lib/mobile";
import { isNativePlatform } from "@/lib/mobile";
import { useDeviceInfo, useDeviceType } from "@/hooks/use-mobile";
import { usePlatformExperience } from "@/lib/platform-experience";
import {
  buildOnboardingPath,
  resolveOnboardingCompletionDestination,
} from "@/lib/auth-redirect";

// Initialize mobile platform features (status bar, keyboard, etc.)
initializeMobile();

// Lazy Load Pages
import React from "react";
import GlobalError from "./components/GlobalError";

type PreloadableComponent<T extends ComponentType<any>> =
  LazyExoticComponent<T> & {
    preload: () => Promise<unknown>;
  };

function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  const Component = lazy(factory) as PreloadableComponent<T>;
  Component.preload = factory;
  return Component;
}

function scheduleRouteWarmup(loaders: Array<() => Promise<unknown>>) {
  if (typeof window === "undefined") return;

  const run = () => {
    for (const load of loaders) {
      void load();
    }
  };

  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(run, { timeout: 1200 });
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
const StudyCopilotPage = lazyWithPreload(
  () => import("./pages/StudyCopilot.tsx"),
);
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
const NanoBananaMockup = lazy(() => import("./pages/NanoBananaMockup.tsx"));

// Receipts Engine / Vault Routes
const VaultDashboard = lazy(() => import("./pages/VaultDashboard.tsx"));
const VaultEditor = lazy(() => import("./pages/VaultEditor.tsx"));
const VerifyPortal = lazy(() => import("./pages/VerifyPortal.tsx"));

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
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

      // If user is logged in but hasn't completed onboarding
      if (!user.onboardingCompleted) {
        // Redirect to /onboarding unless they are on a public page or already on /onboarding
        if (location.pathname !== "/onboarding" && !isPublicPath) {
          const redirectTarget = `${location.pathname}${location.search}${location.hash}`;
          navigate(buildOnboardingPath(redirectTarget), { replace: true });
        }
      }

      // If user HAS completed onboarding and tries to go to /onboarding, redirect to /app
      if (user.onboardingCompleted && location.pathname === "/onboarding") {
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

const LandingWrapper = () => {
  const deviceInfo = useDeviceInfo();
  const platformExperience = usePlatformExperience();
  const shouldRedirectToStudyShell =
    isNativePlatform() || deviceInfo.isPhone;

  useEffect(() => {
    if (shouldRedirectToStudyShell || platformExperience.shouldReduceWarmup) {
      return;
    }

    scheduleRouteWarmup([
      AppLayout.preload,
      StudyDashboardPage.preload,
      StudyWorkspacePage.preload,
    ]);
  }, [platformExperience.shouldReduceWarmup, shouldRedirectToStudyShell]);

  // Native apps and phones still open the study shell directly.
  if (shouldRedirectToStudyShell) {
    return <Navigate to="/study/dashboard" replace />;
  }

  return <NewLandingPage />;
};

const StudyDashboardWrapper = () => {
  const deviceType = useDeviceType();
  const platformExperience = usePlatformExperience();
  const usesPhoneStudyShell = deviceType === "phone";

  useEffect(() => {
    if (platformExperience.shouldReduceWarmup) {
      return;
    }

    scheduleRouteWarmup([
      AppLayout.preload,
      usesPhoneStudyShell
        ? MobileStudyWorkspacePage.preload
        : StudyWorkspacePage.preload,
    ]);
  }, [platformExperience.shouldReduceWarmup, usesPhoneStudyShell]);

  return (
    <StudyRouteDataProvider>
      {usesPhoneStudyShell ? (
        <MobileStudyDashboardPage />
      ) : (
        <StudyDashboardPage />
      )}
    </StudyRouteDataProvider>
  );
};

const StudyCopilotWrapper = () => {
  return (
    <StudyRouteDataProvider>
      <StudyCopilotPage />
    </StudyRouteDataProvider>
  );
};

const StudyWorkspaceWrapper = () => {
  const deviceType = useDeviceType();
  const platformExperience = usePlatformExperience();
  const usesPhoneStudyShell = deviceType === "phone";

  useEffect(() => {
    if (platformExperience.shouldReduceWarmup) {
      return;
    }

    scheduleRouteWarmup([
      AppLayout.preload,
      StudyDashboardPage.preload,
    ]);
  }, [platformExperience.shouldReduceWarmup]);

  return usesPhoneStudyShell ? (
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
            path: "/study/copilot",
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <StudyCopilotWrapper />
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
            path: "/verify/:id",
            element: (
              <Suspense fallback={<LoadingFallback />}>
                <VerifyPortal />
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

import { OfflineBanner } from "./components/OfflineBanner";
import { OfflineSync } from "./components/OfflineSync";
import { UpdateChecker } from "./components/UpdateChecker";

const shouldLoadAnalytics =
  typeof window !== "undefined" &&
  !/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);

createRoot(document.getElementById("root")!).render(
  <React.Fragment>
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <AuthProvider>
          <ErrorBoundary>
            <ThemeProvider>
              <ThemeController />
              <SmartOptimizer>
                <OfflineBanner />
                <OfflineSync />
                <UpdateChecker />
                <RouterProvider router={router} />
                <Toaster />
                <ConsentBanner />
                {shouldLoadAnalytics ? <Analytics /> : null}
              </SmartOptimizer>
            </ThemeProvider>
          </ErrorBoundary>
        </AuthProvider>
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </React.Fragment>,
);
