// THIS FILE IS READ ONLY. Do not touch this file unless you are correctly adding a new auth provider in accordance to the vly auth documentation

import { convexAuth } from "@convex-dev/auth/server";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import Google from "@auth/core/providers/google";
import { emailOtp } from "./auth/emailOtp";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, emailOtp, Anonymous],
  callbacks: {
    callbacks: {
      async redirect({ redirectTo }) {
        // Allow deep linking to mobile app
        if (redirectTo.startsWith("cryonex://")) {
          return redirectTo;
        }
        // Allow relative paths
        if (redirectTo.startsWith("/")) {
          return redirectTo;
        }
        // Allow site URL or fallback
        const siteUrl = process.env.CONVEX_SITE_URL || "";
        if (siteUrl && redirectTo.startsWith(siteUrl)) {
          return redirectTo;
        }
        return siteUrl; // Fallback to home
      },
    },
  },
});
