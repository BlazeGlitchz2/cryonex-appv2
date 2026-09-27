import { getAuthUserId } from "@convex-dev/auth/server";
import { getCurrentUser } from "../users";

// Works in actions too: actions have no ctx.db, so resolve the auth user id
// from the identity and only read the full user row when a db context exists.
export async function requireAuthenticatedUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  if (typeof ctx?.db?.get === "function") {
    const user = await getCurrentUser(ctx);
    if (user) {
      return user;
    }
  }

  return { _id: userId };
}
