import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { LEGACY_SCHOOL_ID_ALIASES } from "../lib/schoolConfig";
import { requireAdmin } from "./lib/requireAdmin";

const LEGACY_SCHOOL_MIGRATION_CONFIRMATION = "MOVE_JUBAIL_TO_AHIS_JUBAIL";

export const migrateLegacySchoolIds = mutation({
  args: {
    confirm: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (args.confirm !== LEGACY_SCHOOL_MIGRATION_CONFIRMATION) {
      throw new Error("Invalid migration confirmation token.");
    }

    const migrated: Record<string, number> = {};

    for (const [legacySchoolId, targetSchoolId] of Object.entries(
      LEGACY_SCHOOL_ID_ALIASES,
    )) {
      if (legacySchoolId === targetSchoolId) continue;

      const users = await ctx.db
        .query("users")
        .withIndex("by_schoolId", (q) => q.eq("schoolId", legacySchoolId))
        .collect();
      for (const user of users) {
        await ctx.db.patch(user._id, { schoolId: targetSchoolId });
      }
      if (users.length > 0) migrated[`users:${legacySchoolId}`] = users.length;

      const memberships = await ctx.db
        .query("schoolMemberships")
        .withIndex("by_school", (q) => q.eq("schoolId", legacySchoolId))
        .collect();
      for (const membership of memberships) {
        await ctx.db.patch(membership._id, { schoolId: targetSchoolId });
      }
      if (memberships.length > 0) {
        migrated[`schoolMemberships:${legacySchoolId}`] = memberships.length;
      }

      const studyPacks = await ctx.db
        .query("studyPacks")
        .withIndex("by_school_updatedAt", (q) =>
          q.eq("schoolId", legacySchoolId),
        )
        .collect();
      for (const pack of studyPacks) {
        await ctx.db.patch(pack._id, { schoolId: targetSchoolId });
      }
      if (studyPacks.length > 0) {
        migrated[`studyPacks:${legacySchoolId}`] = studyPacks.length;
      }

      const studyShares = await ctx.db
        .query("studyShares")
        .withIndex("by_school_createdAt", (q) =>
          q.eq("schoolId", legacySchoolId),
        )
        .collect();
      for (const share of studyShares) {
        await ctx.db.patch(share._id, { schoolId: targetSchoolId });
      }
      if (studyShares.length > 0) {
        migrated[`studyShares:${legacySchoolId}`] = studyShares.length;
      }

      const studySessions = await ctx.db
        .query("studySessions")
        .withIndex("by_school_startTime", (q) =>
          q.eq("schoolId", legacySchoolId),
        )
        .collect();
      for (const session of studySessions) {
        await ctx.db.patch(session._id, { schoolId: targetSchoolId });
      }
      if (studySessions.length > 0) {
        migrated[`studySessions:${legacySchoolId}`] = studySessions.length;
      }

      const quizAttempts = await ctx.db
        .query("quizAttempts")
        .withIndex("by_school_completedAt", (q) =>
          q.eq("schoolId", legacySchoolId),
        )
        .collect();
      for (const attempt of quizAttempts) {
        await ctx.db.patch(attempt._id, { schoolId: targetSchoolId });
      }
      if (quizAttempts.length > 0) {
        migrated[`quizAttempts:${legacySchoolId}`] = quizAttempts.length;
      }
    }

    return {
      confirmation: LEGACY_SCHOOL_MIGRATION_CONFIRMATION,
      migrated,
    };
  },
});
