import { Toaster } from "@/components/ui/sonner";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter, useLocation, Outlet } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppPage from "./pages/App.tsx";
import LibraryPage from "./pages/Library.tsx";
import ProjectsPage from "./pages/Projects.tsx";
import GPTsPage from "./pages/GPTs.tsx";
import IntegrationsPage from "./pages/Integrations.tsx";
import AdminPage from "./pages/Admin.tsx";
import PlaygroundPage from "./pages/Playground.tsx";
import SignInDemo from "./pages/SignInDemo.tsx";
import SpotifyCallbackPage from "./pages/SpotifyCallback.tsx";
import SpotifySearchPage from "./pages/SpotifySearch.tsx";
import SetupPage from "./pages/Setup.tsx";
import StudyDashboardPage from "./pages/StudyDashboard.tsx";
import StudyWorkspacePage from "./pages/StudyWorkspace.tsx";
import NotesPage from "./pages/Notes.tsx";
import NotesIndexPage from "./pages/NotesIndex.tsx";
import PrivacyPage from "./pages/Privacy.tsx";
import AboutPage from "./pages/About.tsx";
import TermsPage from "./pages/Terms.tsx";
import { ConsentBanner } from "./components/ConsentBanner";
import AppLayout from "./components/AppLayout";
import "./types/global.d.ts";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteSyncer() {
  const location = useLocation();
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

  return <Outlet />;
}

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/sign-in-demo", element: <SignInDemo /> },
  { path: "/spotify/callback", element: <SpotifyCallbackPage /> },
  {
    element: <AppLayout />,
    children: [
      { path: "/app", element: <AppPage /> },
      { path: "/playground", element: <PlaygroundPage /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "/gpts", element: <GPTsPage /> },
      { path: "/integrations", element: <IntegrationsPage /> },
      { path: "/admin", element: <AdminPage /> },
      { path: "/setup", element: <SetupPage /> },
      { path: "/spotify/search", element: <SpotifySearchPage /> },
      { path: "/study", element: <StudyDashboardPage /> },
      { path: "/study/dashboard", element: <StudyDashboardPage /> },
      { path: "/study/workspace/:docId", element: <StudyWorkspacePage /> },
    ]
  },
  { path: "*", element: <NotFound /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <RouterProvider router={router} />
        <Toaster />
        <ConsentBanner />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);