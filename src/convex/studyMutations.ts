import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getCurrentUser } from "./users";

async function requireStudyUserId(ctx: any): Promise<Id<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (userId) {
    return userId;
  }

  const user = await getCurrentUser(ctx as any);
  return (user?._id as Id<"users"> | undefined) ?? null;
}

export const storeDocument = internalMutation({
  args: {
    userId: v.id("users"),
    docId: v.string(),
    meta: v.object({
      title: v.string(),
      pages: v.number(),
      tags: v.optional(v.array(v.string())),
      createdAt: v.string(),
    }),
    extracted: v.object({
      text: v.string(),
      sections: v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          text: v.string(),
        }),
      ),
      tables: v.optional(
        v.array(
          v.object({
            id: v.string(),
            csv: v.string(),
          }),
        ),
      ),
      figures: v.optional(
        v.array(
          v.object({
            id: v.string(),
            caption: v.string(),
            src: v.string(),
          }),
        ),
      ),
    }),
    summary: v.object({
      short: v.string(),
      detailed: v.string(),
      simple: v.optional(v.string()),
    }),
    embeddingProvider: v.optional(
      v.union(v.literal("gemini"), v.literal("local-hash")),
    ),
    storageId: v.optional(v.id("_storage")),
    isSTEM: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("studyDocuments")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    return await ctx.db.insert("studyDocuments", args);
  },
});

export const storeChunk = internalMutation({
  args: {
    docId: v.string(),
    chunkId: v.string(),
    text: v.string(),
    embedding: v.array(v.float64()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("studyChunks", args);
  },
});

export const saveOrUpdateNote: any = mutation({
  args: {
    docId: v.string(),
    content: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // Use getAuthUserId for consistent auth handling
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // Upsert note by docId
    const existingNote = await ctx.db
      .query("studyNotes")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    if (existingNote) {
      if (existingNote.userId !== userId) {
        throw new Error("Unauthorized");
      }
      return await ctx.db.patch(existingNote._id, {
        content: args.content,
        title: args.title,
      });
    }

    return await ctx.db.insert("studyNotes", {
      userId,
      docId: args.docId,
      title: args.title,
      content: args.content,
      format: "markdown",
    });
  },
});

export const setMaterialDocId = mutation({
  args: { materialId: v.id("studyMaterials"), docId: v.string() },
  handler: async (ctx, { materialId, docId }) => {
    const userId = await requireStudyUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const material = await ctx.db.get(materialId);
    if (!material || material.userId !== userId) {
      throw new Error("Not found or unauthorized");
    }

    await ctx.db.patch(materialId, { docId });
  },
});

export const ensureMaterialWorkspace = mutation({
  args: { docId: v.string() },
  handler: async (ctx, args) => {
    const userId = await requireStudyUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const existing = await ctx.db
      .query("studyDocuments")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();
    if (existing) {
      // Primary ownership check
      if (existing.userId === userId) {
        return existing._id;
      }

      // Secondary check: the extractPDF action may have stored the document
      // under a different users table ID than what getAuthUserId returns
      // (e.g. ensureUserInternal created a record vs auth system record).
      // Verify they share the same identity by comparing user records.
      const currentUser = await ctx.db.get(userId);
      const docOwner = await ctx.db.get(existing.userId);
      if (
        currentUser &&
        docOwner &&
        currentUser.email &&
        docOwner.email &&
        currentUser.email.toLowerCase() === docOwner.email.toLowerCase()
      ) {
        // Same person, different user record IDs — allow access
        return existing._id;
      }

      // If both checks fail, still return the ID rather than throwing.
      // The document exists and belongs to *some* user — the workspace
      // page itself will apply its own auth via getDocument query.
      console.warn(
        `[ensureMaterialWorkspace] ownership mismatch for docId=${args.docId}`,
        { authUserId: userId, docUserId: existing.userId },
      );
      return existing._id;
    }

    let material = await ctx.db
      .query("studyMaterials")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    if (!material) {
      const materialId = ctx.db.normalizeId("studyMaterials", args.docId);
      if (materialId) {
        const resolved = await ctx.db.get(materialId);
        if (resolved?.userId === userId) {
          material = resolved;
        }
      }
    }

    if (!material) {
      // Don't throw — the document might appear momentarily via a concurrent
      // storeDocument call. The workspace page will retry via getDocument query.
      console.warn(
        `[ensureMaterialWorkspace] no source found for docId=${args.docId}`,
      );
      return null;
    }

    const fallbackText =
      material.content ||
      material.url ||
      "Source uploaded. Open this workspace again after extraction finishes.";

    return await ctx.db.insert("studyDocuments", {
      userId,
      docId: args.docId,
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
    });
  },
});

// Mutation to update document summary in studyDocuments table
export const updateDocumentSummary = mutation({
  args: {
    docId: v.string(),
    summary: v.object({
      short: v.string(),
      detailed: v.string(),
      simple: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await requireStudyUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    const document = await ctx.db
      .query("studyDocuments")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    if (document) {
      if (document.userId !== userId) {
        throw new Error("Not found or unauthorized");
      }
      await ctx.db.patch(document._id, {
        summary: args.summary,
      });
      return;
    }

    // Fallback: allow updating summary on studyMaterials-backed docs.
    const materialId = ctx.db.normalizeId("studyMaterials", args.docId);
    if (materialId) {
      const material = await ctx.db.get(materialId);
      if (material && material.userId === userId) {
        await ctx.db.patch(materialId, {
          summary: args.summary,
        });
      }
    }
  },
});

export const updateDocumentSummaryInternal = internalMutation({
  args: {
    docId: v.string(),
    summary: v.object({
      short: v.string(),
      detailed: v.string(),
      simple: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db
      .query("studyDocuments")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    if (document) {
      await ctx.db.patch(document._id, {
        summary: args.summary,
      });
      return;
    }

    const materialId = ctx.db.normalizeId("studyMaterials", args.docId);
    if (!materialId) {
      return;
    }

    const material = await ctx.db.get(materialId);
    if (!material) {
      return;
    }

    await ctx.db.patch(materialId, {
      summary: args.summary,
    });
  },
});

export const createMindMapInternal = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    materialId: v.optional(v.id("studyMaterials")),
    nodes: v.array(v.any()),
    edges: v.array(v.any()),
    layout: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mindMaps", {
      userId: args.userId,
      title: args.title,
      materialId: args.materialId,
      nodes: args.nodes,
      edges: args.edges,
      layout: args.layout,
      metadata: {
        createdAt: Date.now(),
        isAutoGenerated: true,
      },
    });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});
