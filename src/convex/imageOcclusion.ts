import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper to get user ID
async function getUserId(ctx: any) {
  return await getAuthUserId(ctx);
}

export const saveOcclusion = mutation({
  args: {
    materialId: v.optional(v.id("studyMaterials")),
    storageId: v.id("_storage"),
    title: v.string(),
    masks: v.array(
      v.object({
        id: v.string(),
        x: v.number(),
        y: v.number(),
        width: v.number(),
        height: v.number(),
        label: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("Authentication required");

    // Check if exists
    const existing = await ctx.db
      .query("imageOcclusions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first();

    if (existing) {
      return await ctx.db.patch(existing._id, {
        masks: args.masks,
        title: args.title,
      });
    }

    return await ctx.db.insert("imageOcclusions", {
      userId,
      materialId: args.materialId,
      storageId: args.storageId,
      title: args.title,
      masks: args.masks,
    });
  },
});

export const getOcclusion = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("imageOcclusions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("storageId"), args.storageId))
      .first();
  },
});

export const listOcclusions = query({
  args: { materialId: v.optional(v.id("studyMaterials")) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx);
    if (!userId) return [];

    if (args.materialId) {
      return await ctx.db
        .query("imageOcclusions")
        .withIndex("by_material", (q) => q.eq("materialId", args.materialId))
        .collect();
    }

    return await ctx.db
      .query("imageOcclusions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const detectLabels = action({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Image not found");

    const geminiKey =
      process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!geminiKey) throw new Error("Gemini API key not configured");

    // Fetch image data
    const imageRes = await fetch(url);
    const imageBuffer = await imageRes.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // Call Gemini Vision
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Detect all text labels or anatomical parts in this diagram. Return a JSON object with a \'labels\' array. Each item should have: \'text\' (the label), \'box_2d\' (array [ymin, xmin, ymax, xmax] normalized 0-1000). Example: {"labels": [{"text": "Nucleus", "box_2d": [100, 200, 150, 300]}]}',
                },
                { inline_data: { mime_type: "image/jpeg", data: base64Image } },
              ],
            },
          ],
          generationConfig: { response_mime_type: "application/json" },
        }),
      },
    );

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) throw new Error("Failed to detect labels");

    try {
      const result = JSON.parse(content);
      // Convert Gemini box [ymin, xmin, ymax, xmax] (0-1000) to our format {x, y, width, height} (0-100)
      return result.labels.map((l: any, i: number) => ({
        id: `auto-${i}`,
        label: l.text,
        y: l.box_2d[0] / 10,
        x: l.box_2d[1] / 10,
        height: (l.box_2d[2] - l.box_2d[0]) / 10,
        width: (l.box_2d[3] - l.box_2d[1]) / 10,
      }));
    } catch (e) {
      console.error("Failed to parse Gemini response", content);
      return [];
    }
  },
});
