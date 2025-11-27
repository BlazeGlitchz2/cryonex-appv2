import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";

import { useEffect, useState } from "react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const { signIn, signOut } = useAuthActions();

  const [isLoading, setIsLoading] = useState(true);

  const ensureUser = useMutation(api.users.ensureUser);

  // This effect updates the loading state once auth is loaded and user data is available
  // It ensures we only show content when both authentication state and user data are ready
  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated && user === null) {
        // User is authenticated but record is missing - try to fix
        ensureUser().catch(console.error);
      }
      if (user !== undefined) {
        setIsLoading(false);
      }
    }
  }, [isAuthLoading, isAuthenticated, user, ensureUser]);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
