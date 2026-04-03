import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, internalQuery } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getCurrentUser } from "./users";

async function requireUserId(ctx: any): Promise<Id<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId) {
    return userId;
  }

  const user = await getCurrentUser(ctx as any);
  return (user?._id as Id<"users"> | undefined) ?? null;
}

function materialToWorkspaceDocument(
  material: any,
  docId: string,
  workspaceRecovered = false,
) {
  const fallbackText =
    material.content ||
    material.url ||
    "Source uploaded. Open this workspace again after extraction finishes.";

  return {
    _id: material._id,
    _creationTime: material._creationTime,
    userId: material.userId,
    docId,
    workspaceRecovered,
    meta: {
      title: material.title,
      pages: 1,
      createdAt: new Date(material._creationTime).toISOString(),
    },
    extracted: {
      text: fallbackText,
      sections: [],
      tables: [],
      figures: [],
    },
    summary: material.summary || {
      short: material.title,
      detailed: fallbackText,
    },
    storageId: material.storageId,
    isSTEM: false,
  };
}

export const listDocuments = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("studyDocuments")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const getDocument = query({
  args: { docId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!userId) {
      return null;
    }

    const document = await ctx.db
      .query("studyDocuments")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    if (document) {
      if (document.userId === userId) {
        return document;
      }

      // 1. Ownership via linked materials with the same docId
      const linkedMaterial = (
        await ctx.db
          .query("studyMaterials")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      ).find((m) => m.docId === args.docId);

      if (linkedMaterial) {
        return document;
      }

      // 2. Secondary check: compare emails between user records
      const currentUser = await ctx.db.get(userId);
      const docOwner = await ctx.db.get(document.userId);
      if (
        currentUser &&
        docOwner &&
        currentUser.email &&
        docOwner.email &&
        currentUser.email.toLowerCase() === docOwner.email.toLowerCase()
      ) {
        return document;
      }

      // 3. Visibility Check (Public/School Hub Sharing)
      // Check if ANY material with this docId is public or shared via school network
      const allMaterialsWithDocId = await ctx.db
        .query("studyMaterials")
        .withIndex("by_visibility", (q) => q.eq("visibility", "public"))
        .collect(); // Start with public ones globally

      // We need to find if there is a material with this docDoc that allows access
      // Since docId index is typically for user-specific queries, we search specifically for the material.
      // Actually, studyMaterials has a docId field. Let's find it.
      const globalMaterials = await ctx.db.query("studyMaterials").collect(); // Small table usually, or use a better index if available
      const specificMaterial = globalMaterials.find(m => m.docId === args.docId);

      if (specificMaterial) {
        if (specificMaterial.visibility === "public" || specificMaterial.isPublic) {
          return document;
        }

        if (specificMaterial.visibility === "school" && specificMaterial.userId !== userId) {
           const user = await ctx.db.get(userId);
           const owner = await ctx.db.get(specificMaterial.userId);
           if (user?.schoolId && user?.schoolNetworkOptIn && owner?.schoolId === user.schoolId && owner?.schoolId) {
             return document;
           }
        }
      }

      // 4. Check studyShares table for an entry linked to this material or the pack containing it
      if (specificMaterial) {
        const share = await ctx.db
          .query("studyShares")
          .withIndex("by_source_material", (q) => q.eq("materialId", specificMaterial._id))
          .first();

        if (share) {
          const user = await ctx.db.get(userId);
          if (share.visibility === "public") return document;
          if (share.visibility === "school" && user?.schoolId && user?.schoolNetworkOptIn && user.schoolId === share.schoolId) {
            return document;
          }
        }
      }

      return null;
    }

    try {
      const linkedMaterial = (
        await ctx.db
          .query("studyMaterials")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      ).find((material) => material.docId === args.docId);

      if (linkedMaterial) {
        return materialToWorkspaceDocument(linkedMaterial, args.docId, true);
      }

      const materialId = ctx.db.normalizeId("studyMaterials", args.docId);
      if (!materialId) {
        return null;
      }

      const material = await ctx.db.get(materialId);
      if (!material) {
        return null;
      }

      if (material.userId === userId) {
         return materialToWorkspaceDocument(material, String(material._id), true);
      }

      // Shared material check for virtual workspace documents
      if (material.visibility === "public" || material.isPublic) {
        return materialToWorkspaceDocument(material, String(material._id), true);
      }

      const user = await ctx.db.get(userId);
      if (material.visibility === "school" && user?.schoolId && user?.schoolNetworkOptIn && material.userId !== userId) {
         const owner = await ctx.db.get(material.userId);
         if (owner?.schoolId === user.schoolId) {
           return materialToWorkspaceDocument(material, String(material._id), true);
         }
      }

      return null;
    } catch {
      return null;
    }
  },
});

export const getDocumentInternal = internalQuery({
  args: { docId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studyDocuments")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();
  },
});

export const getChunks = query({
  args: { docId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    if (!userId) {
      return [];
    }

    const document = await ctx.db
      .query("studyDocuments")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    if (!document) {
      return [];
    }

    // Reuse the same logic as getDocument but return chunks
    if (document.userId !== userId) {
       // Check if shared
       const globalMaterials = await ctx.db.query("studyMaterials").collect();
       const specificMaterial = globalMaterials.find(m => m.docId === args.docId);
       let hasAccess = false;

       if (specificMaterial) {
         if (specificMaterial.visibility === "public" || specificMaterial.isPublic) hasAccess = true;
         const user = await ctx.db.get(userId);
         if (specificMaterial.visibility === "school" && user?.schoolId && user?.schoolNetworkOptIn) {
            const owner = await ctx.db.get(specificMaterial.userId);
            if (owner?.schoolId === user.schoolId) hasAccess = true;
         }

         if (!hasAccess) {
            const share = await ctx.db
              .query("studyShares")
              .withIndex("by_source_material", (q) => q.eq("materialId", specificMaterial._id))
              .first();
            if (share && (share.visibility === "public" || (share.visibility === "school" && user?.schoolId && user?.schoolNetworkOptIn && user.schoolId === share.schoolId))) {
              hasAccess = true;
            }
         }
       }

       if (!hasAccess) return [];
    }

    return await ctx.db
      .query("studyChunks")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .collect();
  },
});

export const getChunksInternal = internalQuery({
  args: { docId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studyChunks")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .collect();
  },
});

export const fetchChunksByIds = internalQuery({
  args: {
    ids: v.array(v.id("studyChunks")),
  },
  handler: async (ctx, args) => {
    const chunks = [];
    for (const id of args.ids) {
      const chunk = await ctx.db.get(id);
      if (chunk !== null) {
        chunks.push(chunk);
      }
    }
    return chunks;
  },
});
