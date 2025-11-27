import { v } from "convex/values";
import { query, internalQuery } from "./_generated/server";

export const listDocuments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    // Require authentication - no guest access
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      return [];
    }

    // Only return documents belonging to this user
    return await ctx.db
      .query("studyDocuments")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const getDocument = query({
  args: { docId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    // Require authentication
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email!))
      .first();

    if (!user) {
      return null;
    }

    // Get document and verify ownership
    let document = await ctx.db
      .query("studyDocuments")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    // Fallback: Check studyMaterials if not found in studyDocuments
    if (!document) {
      // Try to parse as ID, if fails, it's just a string docId that wasn't found
      try {
        const materialId = ctx.db.normalizeId("studyMaterials", args.docId);
        if (materialId) {
          const material = await ctx.db.get(materialId);
          if (material && material.userId === user._id) {
            // Construct a virtual document from material
            return {
              _id: material._id,
              _creationTime: material._creationTime,
              userId: material.userId,
              docId: material._id,
              meta: {
                title: material.title,
                author: "User",
                pageCount: 1,
              },
              extracted: {
                text: material.content || material.url || "No content available",
                sections: [],
              },
              summary: {
                short: "Material",
                detailed: material.content || "",
              },
              processingStatus: "completed",
            };
          }
        }
      } catch (e) {
        // Ignore invalid ID errors
      }
    }

    // Only return if document belongs to this user
    if (document && document.userId === user._id) {
      return document;
    }

    return null;
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
    // Allow guest access - no auth check
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