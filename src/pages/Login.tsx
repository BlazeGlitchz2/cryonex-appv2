import { LoginNew } from "./LoginNew";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  readRedirectTarget,
  resolveAuthenticatedDestination,
} from "@/lib/auth-redirect";

export default function Login() {
  const { isLoading: authLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(
        resolveAuthenticatedDestination({
          user,
          redirectTarget: readRedirectTarget(location.search),
        }),
        { replace: true },
      );
    }
  }, [authLoading, isAuthenticated, location.search, navigate, user]);

  return <LoginNew />;
}
