import { SignInPage } from "@/components/ui/sign-in-flow-1";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

export default function AuthPage({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Capture referral code from URL and store in session for onboarding
    const refCode = searchParams.get("ref");
    if (refCode) {
      sessionStorage.setItem("affiliateRef", refCode);
    }

    if (!authLoading && isAuthenticated) {
      const redirect = searchParams.get("redirect") || redirectAfterAuth || "/app";
      navigate(redirect);
    }

    // Smart Preloading: Prefetch App and Studio immediately on Auth page
    // We want this to be ready as soon as the user logs in
    const prefetch = async () => {
      try {
        await import("./App");
        await import("./MediaStudio");
      } catch (e) {
        // Ignore prefetch errors
      }
    };
    // Small delay to let the auth page render first
    const timer = setTimeout(prefetch, 1000);
    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, navigate, redirectAfterAuth, searchParams]);

  // Show the custom sign-in page
  return <SignInPage />;
}