import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

async function userOwnsStorageId(ctx: any, userId: any, storageId: any) {
  const user = await ctx.db.get(userId);
  if (user?.imageStorageId === storageId) return true;

  const studyDocument = await ctx.db
    .query("studyDocuments")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("storageId"), storageId))
    .first();
  if (studyDocument) return true;

  const studyMaterial = await ctx.db
    .query("studyMaterials")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("storageId"), storageId))
    .first();
  if (studyMaterial) return true;

  const imageOcclusion = await ctx.db
    .query("imageOcclusions")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("storageId"), storageId))
    .first();
  if (imageOcclusion) return true;

  const generatedAsset = await ctx.db
    .query("generatedAssets")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .filter((q: any) => q.eq(q.field("storageId"), storageId))
    .first();
  if (generatedAsset) return true;

  const chats = await ctx.db
    .query("chats")
    .withIndex("by_user", (q: any) => q.eq("userId", userId))
    .collect();

  for (const chat of chats) {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q: any) => q.eq("chatId", chat._id))
      .collect();

    for (const message of messages) {
      if (
        message.attachments?.some(
          (attachment: { storageId: string }) =>
            attachment.storageId === storageId,
        )
      ) {
        return true;
      }
    }
  }

  return false;
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

export const saveAvatarStorageId = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(userId, {
      imageStorageId: args.storageId,
    });

    const url = await ctx.storage.getUrl(args.storageId);
    return url;
  },
});

export const getUrl = query({
  args: { storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    if (!args.storageId) return null;
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ownsStorageId = await userOwnsStorageId(ctx, userId, args.storageId);
    if (!ownsStorageId) return null;

    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getPublicUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const ownsStorageId = await userOwnsStorageId(ctx, userId, args.storageId);
    if (!ownsStorageId) throw new Error("Storage object not found or unauthorized");

    return await ctx.storage.getUrl(args.storageId);
  },
});
