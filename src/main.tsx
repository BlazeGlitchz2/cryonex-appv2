import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter, useLocation, Outlet, useNavigate } from "react-router";
import "./index.css";
import { ConsentBanner } from "./components/ConsentBanner";
import AppLayout from "./components/AppLayout";
import "./types/global.d.ts";
import { useAuth } from "@/hooks/use-auth";

// Lazy Load Pages
import React from "react";
import GlobalError from "./components/GlobalError";

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
      return <GlobalError error={this.state.error} resetErrorBoundary={() => window.location.reload()} />;
    }
    return this.props.children;
  }
}

// Lazy Load Pages
const NewLandingPage = lazy(() => import("./pages/NewLandingPage.tsx"));
const OnboardingPage = lazy(() => import("./pages/Onboarding.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AppPage = lazy(() => import("./pages/App.tsx"));
const LibraryPage = lazy(() => import("./pages/Library.tsx"));
const ProjectsPage = lazy(() => import("./pages/Projects.tsx"));
const GPTsPage = lazy(() => import("./pages/GPTs.tsx"));
const IntegrationsPage = lazy(() => import("./pages/Integrations.tsx"));
const AdminPage = lazy(() => import("./pages/Admin.tsx"));
const PlaygroundPage = lazy(() => import("./pages/Playground.tsx"));
const SettingsPage = lazy(() => import("./pages/Settings.tsx"));
const SetupPage = lazy(() => import("./pages/Setup.tsx"));
const StudyDashboardPage = lazy(() => import("./pages/StudyDashboard.tsx"));
const StudyWorkspacePage = lazy(() => import("./pages/StudyWorkspace.tsx"));
const PrivacyPage = lazy(() => import("./pages/Privacy.tsx"));
const AboutPage = lazy(() => import("./pages/About.tsx"));
const TermsPage = lazy(() => import("./pages/Terms.tsx"));
const MediaStudio = lazy(() => import("./pages/MediaStudio.tsx"));
const AffiliateDashboardPage = lazy(() => import("./pages/AffiliateDashboard.tsx"));
const KnowledgeWebPage = lazy(() => import("./pages/KnowledgeWeb.tsx"));

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
      const publicPaths = ["/", "/privacy", "/terms", "/about"];
      const isPublicPath = publicPaths.includes(location.pathname);

      // If user is logged in but hasn't completed onboarding
      if (!user.onboardingCompleted) {
        // Redirect to /onboarding unless they are on a public page or already on /onboarding
        if (location.pathname !== "/onboarding" && !isPublicPath) {
          navigate("/onboarding");
        }
      }

      // If user HAS completed onboarding and tries to go to /onboarding, redirect to /app
      if (user.onboardingCompleted && location.pathname === "/onboarding") {
        navigate("/app");
      }
    }
  }, [user, isLoading, location.pathname, navigate]);

  return <Outlet />;
}

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse">
        <div className="h-6 w-6 bg-white/20 rounded-md" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading Cryonex...</p>
    </div>
  </div>
);

const router = createBrowserRouter([
  {
    element: <RouteSyncer />,
    children: [
      { path: "/", element: <Suspense fallback={<LoadingFallback />}><NewLandingPage /></Suspense> },
      { path: "/onboarding", element: <Suspense fallback={<LoadingFallback />}><OnboardingPage /></Suspense> },
      { path: "/login", element: <Suspense fallback={<LoadingFallback />}><Login /></Suspense> },
      { path: "/privacy", element: <Suspense fallback={<LoadingFallback />}><PrivacyPage /></Suspense> },
      { path: "/about", element: <Suspense fallback={<LoadingFallback />}><AboutPage /></Suspense> },
      { path: "/terms", element: <Suspense fallback={<LoadingFallback />}><TermsPage /></Suspense> },
      {
        element: <AppLayout />,
        children: [
          { path: "/app", element: <Suspense fallback={<LoadingFallback />}><AppPage /></Suspense> },
          { path: "/create", element: <Suspense fallback={<LoadingFallback />}><MediaStudio /></Suspense> },
          { path: "/playground", element: <Suspense fallback={<LoadingFallback />}><PlaygroundPage /></Suspense> },
          { path: "/library", element: <Suspense fallback={<LoadingFallback />}><LibraryPage /></Suspense> },
          { path: "/projects", element: <Suspense fallback={<LoadingFallback />}><ProjectsPage /></Suspense> },
          { path: "/gpts", element: <Suspense fallback={<LoadingFallback />}><GPTsPage /></Suspense> },
          { path: "/integrations", element: <Suspense fallback={<LoadingFallback />}><IntegrationsPage /></Suspense> },
          { path: "/admin", element: <Suspense fallback={<LoadingFallback />}><AdminPage /></Suspense> },
          { path: "/setup", element: <Suspense fallback={<LoadingFallback />}><SetupPage /></Suspense> },
          { path: "/settings", element: <Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense> },
          { path: "/study", element: <Suspense fallback={<LoadingFallback />}><StudyDashboardPage /></Suspense> },
          { path: "/study/dashboard", element: <Suspense fallback={<LoadingFallback />}><StudyDashboardPage /></Suspense> },
          { path: "/study/workspace/:docId", element: <Suspense fallback={<LoadingFallback />}><StudyWorkspacePage /></Suspense> },
          { path: "/study/graph", element: <Suspense fallback={<LoadingFallback />}><KnowledgeWebPage /></Suspense> },
          { path: "/affiliate", element: <Suspense fallback={<LoadingFallback />}><AffiliateDashboardPage /></Suspense> },
        ]
      },
      { path: "*", element: <Suspense fallback={<LoadingFallback />}><NotFound /></Suspense> },
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <ErrorBoundary>
          <RouterProvider router={router} />
          <Toaster />
          <ConsentBanner />
        </ErrorBoundary>
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);