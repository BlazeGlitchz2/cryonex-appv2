import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { useAuth } from "@/hooks/use-auth";
import {
  readRedirectTarget,
  resolveAuthenticatedDestination,
} from "@/lib/auth-redirect";
import { AuthUI } from "@/components/ui/auth-fuse";

function describeDestination(redirectTarget: string) {
  try {
    const pathname = new URL(redirectTarget, "https://cryonex.app").pathname;

    if (pathname.startsWith("/study/workspace/")) return "study workspace";
    if (pathname === "/study/dashboard") return "study dashboard";
    if (pathname === "/app") return "assistant";
    if (pathname === "/library") return "library";
    if (pathname === "/affiliate") return "affiliate dashboard";
  } catch {
    return "workspace";
  }

  return "workspace";
}

export default function Auth() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTarget = readRedirectTarget(searchParams);
  const destinationLabel = useMemo(
    () => describeDestination(redirectTarget),
    [redirectTarget],
  );
  const emailHint = searchParams.get("hint") ?? "";
  const autoSendCode = searchParams.get("auto") === "true";

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      navigate(
        resolveAuthenticatedDestination({
          user,
          redirectTarget: readRedirectTarget(location.search),
        }),
        { replace: true },
      );
    }
  }, [isAuthenticated, isLoading, location.search, navigate, user]);

  return (
    <AuthUI
      initialEmail={emailHint}
      autoSendCode={autoSendCode}
      defaultMode="signin"
      redirectTarget={redirectTarget}
      destinationLabel={destinationLabel}
    />
  );
}
