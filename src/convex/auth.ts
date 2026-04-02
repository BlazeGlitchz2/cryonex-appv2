// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import Google from "@auth/core/providers/google";
import { emailOtp } from "./auth/emailOtp";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function normalizeOrigin(value?: string | null) {
  if (!value) return null;

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLoopbackUrl(value: string) {
  try {
    return LOOPBACK_HOSTS.has(new URL(value).hostname);
  } catch {
    return false;
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, emailOtp, Anonymous],
  callbacks: {
    async redirect({ redirectTo }) {
      const appOrigin = normalizeOrigin(
        process.env.SITE_URL ||
          process.env.APP_URL ||
          process.env.PUBLIC_APP_URL ||
          process.env.NEXT_PUBLIC_SITE_URL,
      );
      const convexOrigin = normalizeOrigin(process.env.CONVEX_SITE_URL);

      // Allow deep linking to mobile app
      if (redirectTo.startsWith("cryonex://")) {
        return redirectTo;
      }
      // Resolve relative paths against the real frontend origin when available.
      if (redirectTo.startsWith("/")) {
        if (appOrigin || convexOrigin) {
          return new URL(redirectTo, appOrigin || convexOrigin!).toString();
        }
        return redirectTo;
      }

      const allowedOrigins = new Set(
        [appOrigin, convexOrigin].filter(
          (origin): origin is string => !!origin,
        ),
      );

      if (allowedOrigins.size > 0) {
        try {
          const candidateOrigin = new URL(redirectTo).origin;
          if (allowedOrigins.has(candidateOrigin)) {
            return redirectTo;
          }
        } catch {
          return appOrigin || convexOrigin || redirectTo;
        }
      }

      if (isLoopbackUrl(redirectTo)) {
        return redirectTo;
      }

      return appOrigin || convexOrigin || redirectTo;
    },
  },
});
