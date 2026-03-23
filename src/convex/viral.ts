import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

// --- Referrals ---

export const redeemCode = mutation({
  args: {
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.referredBy) {
      throw new Error("You have already redeemed a referral code");
    }

    // Find referrer
    const referrer = await ctx.db
      .query("users")
      .withIndex("by_affiliateCode", (q) => q.eq("affiliateCode", args.code))
      .first();

    if (!referrer) {
      throw new Error("Invalid referral code");
    }

    if (referrer._id === userId) {
      throw new Error("Cannot refer yourself");
    }

    // Link users
    await ctx.db.patch(userId, {
      referredBy: referrer._id,
    });

    // Award Credits
    // Referrer gets 500
    const referrerCredits = referrer.credits || 0;
    await ctx.db.patch(referrer._id, {
      credits: referrerCredits + 500,
    });

    // Referee gets 50
    const userCredits = user.credits || 0;
    await ctx.db.patch(userId, {
      credits: userCredits + 50,
    });

    return { success: true, referrerName: referrer.name };
  },
});

// --- Affiliate ---

export const generateAffiliateCode = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    if (user.affiliateCode) {
      return user.affiliateCode;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    await ctx.db.patch(userId, {
      affiliateCode: code,
    });

    return code;
  },
});

// --- Sharing ---

export const publishMaterial = mutation({
  args: {
    id: v.union(v.id("studyMaterials"), v.id("studyNotes")),
    type: v.union(v.literal("material"), v.literal("note")),
    visibility: v.optional(
      v.union(v.literal("private"), v.literal("school"), v.literal("public")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const visibility = args.visibility || "public";
    const shareId = Math.random().toString(36).substring(2, 15);
    if (args.type === "material") {
      const material = await ctx.db.get(args.id);

      if (!material || material.userId !== userId) {
        throw new Error("Not found or unauthorized");
      }

      await ctx.db.patch(args.id, {
        isPublic: visibility === "public",
        shareId: visibility === "public" ? shareId : undefined,
        visibility,
      });

      const existingShare = await ctx.db
        .query("studyShares")
        .withIndex("by_source_material", (q) =>
          q.eq("materialId", args.id as Id<"studyMaterials">),
        )
        .first();

      const sharePayload: any = {
        userId,
        sourceType: "material" as const,
        materialId: args.id as Id<"studyMaterials">,
        title: material.title,
        description:
          (material as any).summary?.short ||
          (material.content ? String(material.content).slice(0, 180) : undefined),
        curriculumTag: user.curriculumTrack || user.curriculum || "general",
        region: String(user.region || user.country || "global").toLowerCase(),
        country: user.country,
        schoolId: user.schoolId,
        visibility,
        createdAt: Date.now(),
        shareId: visibility === "public" ? shareId : undefined,
        authorName: user.name,
        authorImage: user.image,
        contentType: (material as any).type,
      };

      if (existingShare) {
        await ctx.db.patch(existingShare._id, sharePayload);
      } else {
        await ctx.db.insert("studyShares", sharePayload);
      }
    } else {
      const note = await ctx.db.get(args.id);

      if (!note || note.userId !== userId) {
        throw new Error("Not found or unauthorized");
      }

      await ctx.db.patch(args.id, {
        isPublic: visibility === "public",
        shareId: visibility === "public" ? shareId : undefined,
        visibility,
      });

      const existingShare = await ctx.db
        .query("studyShares")
        .withIndex("by_source_note", (q) =>
          q.eq("noteId", args.id as Id<"studyNotes">),
        )
        .first();

      const sharePayload: any = {
        userId,
        sourceType: "note" as const,
        noteId: args.id as Id<"studyNotes">,
        title: note.title,
        description: String(note.content || "").slice(0, 180) || undefined,
        curriculumTag: user.curriculumTrack || user.curriculum || "general",
        region: String(user.region || user.country || "global").toLowerCase(),
        country: user.country,
        schoolId: user.schoolId,
        visibility,
        createdAt: Date.now(),
        shareId: visibility === "public" ? shareId : undefined,
        authorName: user.name,
        authorImage: user.image,
        contentType: (note as any).format,
      };

      if (existingShare) {
        await ctx.db.patch(existingShare._id, sharePayload);
      } else {
        await ctx.db.insert("studyShares", sharePayload);
      }
    }

    return shareId;
  },
});

export const getPublicMaterial = query({
  args: {
    shareId: v.string(),
    type: v.union(v.literal("material"), v.literal("note")),
  },
  handler: async (ctx, args) => {
    // No auth check required for public materials

    if (args.type === "material") {
      const material = await ctx.db
        .query("studyMaterials")
        .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
        .first();

      if (!material || !material.isPublic) return null;
      return material;
    } else {
      const note = await ctx.db
        .query("studyNotes")
        .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
        .first();

      if (!note || !note.isPublic) return null;
      return note;
    }
  },
});
