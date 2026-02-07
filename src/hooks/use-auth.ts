import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useEffect, useState } from "react";

export function useAuth() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  // @ts-ignore
  const user = useQuery(api.users.currentUser);

  // @ts-ignore - Suppress excessive type instantiation error from library
  const rawAuthActions: any = useAuthActions();

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
  }, [authLoading, isAuthenticated, user]);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn: rawAuthActions?.signIn,
    signOut: rawAuthActions?.signOut,
  };
}
