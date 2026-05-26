import { getAuthUserId } from "@convex-dev/auth/server";

import { getCurrentUser } from "../users";
import { ROLES } from "../schema";

export async function resolveAuthenticatedUserRecord(ctx: any) {
  let userId = await getAuthUserId(ctx);
  let user = userId ? await ctx.db.get(userId) : null;

  if (!user) {
    user = await getCurrentUser(ctx as any);
    userId = user?._id ?? null;
  }

  if (!userId || !user) {
    throw new Error("Not authenticated");
  }

  return { userId, user };
}

export async function requireAdmin(ctx: any) {
  const { userId, user } = await resolveAuthenticatedUserRecord(ctx);

  if (user.role !== ROLES.ADMIN) {
    throw new Error("Access denied: Admin privileges required");
  }

  return { userId, user };
}

export async function isAdmin(ctx: any) {
  try {
    const { user } = await resolveAuthenticatedUserRecord(ctx);
    return user.role === ROLES.ADMIN;
  } catch {
    return false;
  }
}
