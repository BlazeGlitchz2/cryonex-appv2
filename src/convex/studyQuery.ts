import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { query, internalQuery } from "./_generated/server";

async function requireUserId(ctx: any) {
  const userId = await getAuthUserId(ctx);
  return userId ?? null;
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
      return document.userId === userId ? document : null;
    }

    try {
      const materialId = ctx.db.normalizeId("studyMaterials", args.docId);
      if (!materialId) {
        return null;
      }

      const material = await ctx.db.get(materialId);
      if (!material || material.userId !== userId) {
        return null;
      }

      return {
        _id: material._id,
        _creationTime: material._creationTime,
        userId: material.userId,
        docId: String(material._id),
        meta: {
          title: material.title,
          pages: 1,
          createdAt: new Date(material._creationTime).toISOString(),
        },
        extracted: {
          text: material.content || material.url || "No content available",
          sections: [],
          tables: [],
          figures: [],
        },
        summary: material.summary || {
          short: material.title,
          detailed: material.content || material.url || "No summary available",
        },
      };
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

    if (!document || document.userId !== userId) {
      return [];
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
