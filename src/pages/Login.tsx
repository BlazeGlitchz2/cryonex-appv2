import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { SignInPage } from "@/components/ui/sign-in-flow-1";
import { useAuth } from "@/hooks/use-auth";
import {
  readRedirectTarget,
  resolveAuthenticatedDestination,
} from "@/lib/auth-redirect";

export default function Login() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  return <SignInPage />;
}
