import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./lib/requireAdmin";

function getTrustedUpdateHosts() {
  const hosts = new Set<string>();
  const configured =
    process.env.ALLOWED_UPDATE_HOSTS || process.env.VITE_ALLOWED_UPDATE_HOSTS;

  if (configured) {
    for (const host of configured.split(",")) {
      const normalized = host.trim().toLowerCase();
      if (normalized) {
        hosts.add(normalized);
      }
    }
  }

  for (const source of [process.env.CONVEX_SITE_URL, process.env.SITE_URL]) {
    if (!source) continue;
    try {
      hosts.add(new URL(source).host.toLowerCase());
    } catch {
      // Ignore malformed env values and rely on the remaining hosts.
    }
  }

  return hosts;
}

function assertTrustedUpdateUrl(url: string) {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid update URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Update URL must use HTTPS");
  }

  const allowedHosts = getTrustedUpdateHosts();
  if (allowedHosts.size > 0 && !allowedHosts.has(parsed.host.toLowerCase())) {
    throw new Error("Update URL host is not allowlisted");
  }
}

export const latestVersion = query({
  args: {
    platform: v.union(v.literal("ios"), v.literal("android")),
    currentVersion: v.string(),
  },
  handler: async (ctx, args) => {
    const latest = await ctx.db
      .query("app_versions")
      .withIndex("by_platform_createdAt", (q) => q.eq("platform", args.platform))
      .order("desc")
      .first();

    if (!latest) return null;

    if (latest.version !== args.currentVersion) {
      return {
        version: latest.version,
        url: latest.url,
        notes: latest.notes,
        createdAt: latest.createdAt,
        mandatory: latest.mandatory,
      };
    }
    return null;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const registerVersion = mutation({
  args: {
    version: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android")),
    storageId: v.id("_storage"),
    notes: v.optional(v.string()),
    mandatory: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) throw new Error("Invalid storage ID");

    assertTrustedUpdateUrl(url);

    await ctx.db.insert("app_versions", {
      version: args.version,
      platform: args.platform,
      storageId: args.storageId,
      url,
      notes: args.notes,
      mandatory: args.mandatory,
      createdAt: Date.now(),
    });
  },
});
