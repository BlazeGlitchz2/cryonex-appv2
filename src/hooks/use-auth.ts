import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";

export function useAuth() {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  // @ts-ignore
  const user = useQuery(api.users.currentUser);

  // @ts-ignore - Suppress excessive type instantiation error from library
  const rawAuthActions: any = useAuthActions();

  const [isLoading, setIsLoading] = useState(true);
  const [isEnsuringUser, setIsEnsuringUser] = useState(false);
  const ensureRequestedRef = useRef(false);
  const ensureUser = useMutation(api.users.ensureUser);

  useEffect(() => {
    if (!isAuthenticated) {
      ensureRequestedRef.current = false;
      setIsEnsuringUser(false);
      return;
    }

    if (
      authLoading ||
      user !== null ||
      isEnsuringUser ||
      ensureRequestedRef.current
    ) {
      return;
    }

    ensureRequestedRef.current = true;
    setIsEnsuringUser(true);

    ensureUser()
      .catch(console.error)
      .finally(() => {
        setIsEnsuringUser(false);
      });
  }, [authLoading, ensureUser, isAuthenticated, isEnsuringUser, user]);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    if (user === undefined || user === null || isEnsuringUser) {
      setIsLoading(true);
      return;
    }

    ensureRequestedRef.current = false;
    setIsLoading(false);
  }, [authLoading, isAuthenticated, isEnsuringUser, user]);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn: rawAuthActions?.signIn,
    signOut: rawAuthActions?.signOut,
  };
}
