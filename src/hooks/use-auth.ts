import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";

type AuthActions = {
  signIn: (provider: string, params?: any) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const rawAuthActions = useAuthActions();
  const [isLoading, setIsLoading] = useState(true);
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user === null) {
        ensureUser().catch(console.error);
      }
      if (user !== undefined) {
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user, ensureUser]);

  const authActions = rawAuthActions as unknown as AuthActions;

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn: authActions.signIn,
    signOut: authActions.signOut,
  };
}
