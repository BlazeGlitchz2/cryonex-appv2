import { getAuthUserId } from "@convex-dev/auth/server";

import { getCurrentUser } from "../users";
import { ROLES } from "../schema";

const LEGACY_ADMIN_EMAILS = new Set([
  "viralcentral092@gmail.com",
  "ratrampage324@gmail.com",
]);

export function isLegacyAdminEmail(email?: string | null) {
  return Boolean(email && LEGACY_ADMIN_EMAILS.has(email.toLowerCase()));
}

function isPrivilegedAdmin(user: { role?: string | null; email?: string | null }) {
  return user.role === ROLES.ADMIN || isLegacyAdminEmail(user.email);
}

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

  if (!isPrivilegedAdmin(user)) {
    throw new Error("Access denied: Admin privileges required");
  }

  return { userId, user };
}

export async function isAdmin(ctx: any) {
  try {
    const { user } = await resolveAuthenticatedUserRecord(ctx);
    return isPrivilegedAdmin(user);
  } catch {
    return false;
  }
}
