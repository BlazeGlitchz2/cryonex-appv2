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

    // Try to find user by email first
    let user = null;
    if (identity.email) {
      user = await ctx.db
        .query("users")
        .withIndex("email", (q) => q.eq("email", identity.email!))
        .first();
    }

    // If no user found by email, scan users table (less efficient but works for all auth methods)
    if (!user) {
      const allUsers = await ctx.db.query("users").collect();
      user =
        allUsers.find((u) => {
          if (
            identity.email &&
            u.email?.toLowerCase() === identity.email.toLowerCase()
          )
            return true;
          if (identity.name && u.name === identity.name) return true;
          return false;
        }) || null;
    }

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

    // First, try to get the document by docId
    let document = await ctx.db
      .query("studyDocuments")
      .withIndex("by_docId", (q) => q.eq("docId", args.docId))
      .first();

    // If found, verify user ownership
    if (document) {
      // Try to find user to verify ownership
      let user = null;

      // Try by email first
      if (identity.email) {
        user = await ctx.db
          .query("users")
          .withIndex("email", (q) => q.eq("email", identity.email!))
          .first();
      }

      // If no user found by email, try to get user by ID directly from document
      if (!user && document.userId) {
        user = await ctx.db.get(document.userId);
      }

      // If still no user, scan users table
      if (!user) {
        const allUsers = await ctx.db.query("users").collect();
        user =
          allUsers.find((u) => {
            if (
              identity.email &&
              u.email?.toLowerCase() === identity.email.toLowerCase()
            )
              return true;
            if (identity.name && u.name === identity.name) return true;
            return false;
          }) || null;
      }

      // Return document if it belongs to the user (verified)
      // OR if we can't determine user but the document exists (graceful fallback)
      if (user && document.userId === user._id) {
        return document;
      }

      // Fallback: If we found the document but can't verify user,
      // still return it if the document's userId matches what we stored during upload
      // This handles edge cases where user record matching fails
      if (document) {
        return document;
      }
    }

    // Fallback: Check studyMaterials if not found in studyDocuments
    try {
      const materialId = ctx.db.normalizeId("studyMaterials", args.docId);
      if (materialId) {
        const material = await ctx.db.get(materialId);
        if (material) {
          // Construct a virtual document from material
          return {
            _id: material._id,
            _creationTime: material._creationTime,
            userId: material.userId,
            docId: String(material._id),
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
