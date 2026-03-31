import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type AuthContextValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
  signIn: any;
  signOut: any;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function useProvideAuth(): AuthContextValue {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(
    api.users.currentUser,
    authLoading || !isAuthenticated ? "skip" : {},
  );

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

  return useMemo(
    () => ({
      isLoading,
      isAuthenticated,
      user,
      signIn: rawAuthActions?.signIn,
      signOut: rawAuthActions?.signOut,
    }),
    [isAuthenticated, isLoading, rawAuthActions, user],
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useProvideAuth();
  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
