import { getCurrentUser } from "../users";

export async function requireAuthenticatedUser(ctx: any) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }

  return user;
}
