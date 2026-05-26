import { getCurrentUser } from "../users";

type AnyId = string;

async function collectStorageOwnersFromDirectTables(ctx: any, storageId: any) {
  const ownerIds = new Set<AnyId>();

  const [users, studyDocuments, studyMaterials, imageOcclusions, generatedAssets] =
    await Promise.all([
      ctx.db
        .query("users")
        .filter((q: any) => q.eq(q.field("imageStorageId"), storageId))
        .collect(),
      ctx.db
        .query("studyDocuments")
        .filter((q: any) => q.eq(q.field("storageId"), storageId))
        .collect(),
      ctx.db
        .query("studyMaterials")
        .filter((q: any) => q.eq(q.field("storageId"), storageId))
        .collect(),
      ctx.db
        .query("imageOcclusions")
        .filter((q: any) => q.eq(q.field("storageId"), storageId))
        .collect(),
      ctx.db
        .query("generatedAssets")
        .filter((q: any) => q.eq(q.field("storageId"), storageId))
        .collect(),
    ]);

  for (const user of users) {
    if (user?._id) ownerIds.add(String(user._id));
  }

  for (const doc of studyDocuments) {
    if (doc?.userId) ownerIds.add(String(doc.userId));
  }

  for (const material of studyMaterials) {
    if (material?.userId) ownerIds.add(String(material.userId));
  }

  for (const occlusion of imageOcclusions) {
    if (occlusion?.userId) ownerIds.add(String(occlusion.userId));
  }

  for (const asset of generatedAssets) {
    if (asset?.userId) ownerIds.add(String(asset.userId));
  }

  return ownerIds;
}

async function collectStorageOwnersFromChatAttachments(ctx: any, storageId: any) {
  const ownerIds = new Set<AnyId>();
  const chats = await ctx.db.query("chats").collect();

  for (const chat of chats) {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q: any) => q.eq("chatId", chat._id))
      .collect();

    for (const message of messages) {
      const hasAttachment = message.attachments?.some(
        (attachment: { storageId: string }) => attachment.storageId === storageId,
      );

      if (hasAttachment && chat.userId) {
        ownerIds.add(String(chat.userId));
      }
    }
  }

  return ownerIds;
}

export async function getStorageOwnerUserIds(ctx: any, storageId: any) {
  const ownerIds = await collectStorageOwnersFromDirectTables(ctx, storageId);
  const attachmentOwnerIds = await collectStorageOwnersFromChatAttachments(
    ctx,
    storageId,
  );

  for (const ownerId of attachmentOwnerIds) {
    ownerIds.add(ownerId);
  }

  return ownerIds;
}

export async function userOwnsStorageId(ctx: any, userId: any, storageId: any) {
  const ownerIds = await getStorageOwnerUserIds(ctx, storageId);
  return ownerIds.has(String(userId));
}

export async function assertStorageClaimableByUser(
  ctx: any,
  userId: any,
  storageId: any,
) {
  const ownerIds = await getStorageOwnerUserIds(ctx, storageId);
  const currentUserId = String(userId);
  const conflictingOwnerIds = [...ownerIds].filter(
    (ownerId) => ownerId !== currentUserId,
  );

  if (conflictingOwnerIds.length > 0) {
    throw new Error("Storage object is already owned by another user");
  }
}

export async function requireOwnedStorageId(
  ctx: any,
  userId: any,
  storageId: any,
) {
  const ownsStorageId = await userOwnsStorageId(ctx, userId, storageId);
  if (!ownsStorageId) {
    throw new Error("Storage object not found or unauthorized");
  }
}

export async function requireCurrentUserOwnedStorageId(ctx: any, storageId: any) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }

  await requireOwnedStorageId(ctx, user._id, storageId);
  return user;
}
