import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Simple hash function for query normalization
const hashQuery = (query: string): string => {
    let hash = 0;
    for (let i = 0; i < query.length; i++) {
        const char = query.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
};

// Normalize query for consistent caching
const normalizeQuery = (query: string): string => {
    return query
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ")           // Collapse multiple spaces
        .replace(/[?!.,]+$/g, "");      // Remove trailing punctuation
};

// Common greetings and simple queries that are good cache candidates
const CACHEABLE_PATTERNS = [
    /^(hi|hello|hey|yo|sup|hiya|howdy)$/i,
    /^(hi|hello|hey) there$/i,
    /^how are you/i,
    /^what('s| is) up/i,
    /^good (morning|afternoon|evening|night)$/i,
    /^who (is|was) [a-z\s]+$/i,
    /^what (is|are) [a-z\s]+$/i,
    /^when (was|did|is) [a-z\s]+$/i,
    /^where (is|was|are) [a-z\s]+$/i,
];

// Check if a query is cacheable
const isCacheableQuery = (normalized: string): boolean => {
    // Short queries are more likely to be cacheable
    if (normalized.length > 100) return false;

    // Check against known patterns
    return CACHEABLE_PATTERNS.some(pattern => pattern.test(normalized));
};

// Get cached response for a query
export const getCachedResponse = query({
    args: { query: v.string() },
    handler: async (ctx, args) => {
        const normalized = normalizeQuery(args.query);
        const hash = hashQuery(normalized);

        const cached = await ctx.db
            .query("responseCache")
            .withIndex("by_queryHash", q => q.eq("queryHash", hash))
            .first();

        if (!cached || cached.responses.length === 0) {
            return null;
        }

        // Return a random response from the cache for variety
        const randomIndex = Math.floor(Math.random() * cached.responses.length);
        return {
            response: cached.responses[randomIndex],
            cacheId: cached._id,
            hitCount: cached.hitCount,
        };
    },
});

// Save a response to cache
export const saveCachedResponse = mutation({
    args: {
        query: v.string(),
        response: v.string(),
    },
    handler: async (ctx, args) => {
        const normalized = normalizeQuery(args.query);

        // Only cache if it matches cacheable patterns
        if (!isCacheableQuery(normalized)) {
            return { cached: false, reason: "Query not cacheable" };
        }

        const hash = hashQuery(normalized);

        const existing = await ctx.db
            .query("responseCache")
            .withIndex("by_queryHash", q => q.eq("queryHash", hash))
            .first();

        if (existing) {
            // Update existing cache entry
            const responses = [...existing.responses];

            // Add new response if we have fewer than 3
            if (responses.length < 3) {
                responses.push(args.response);
            } else {
                // Replace the oldest (first) response with new one
                responses.shift();
                responses.push(args.response);
            }

            await ctx.db.patch(existing._id, {
                responses,
                lastUsedAt: Date.now(),
            });

            return { cached: true, isNew: false };
        } else {
            // Create new cache entry
            await ctx.db.insert("responseCache", {
                queryHash: hash,
                normalizedQuery: normalized,
                responses: [args.response],
                hitCount: 0,
                lastUsedAt: Date.now(),
            });

            return { cached: true, isNew: true };
        }
    },
});

// Increment hit count when cache is used
export const incrementHitCount = mutation({
    args: { cacheId: v.id("responseCache") },
    handler: async (ctx, args) => {
        const cached = await ctx.db.get(args.cacheId);
        if (cached) {
            await ctx.db.patch(args.cacheId, {
                hitCount: cached.hitCount + 1,
                lastUsedAt: Date.now(),
            });
        }
    },
});

// Get cache stats (for debugging/monitoring)
export const getCacheStats = query({
    args: {},
    handler: async (ctx) => {
        const allCached = await ctx.db.query("responseCache").collect();

        return {
            totalCachedQueries: allCached.length,
            totalHits: allCached.reduce((sum, c) => sum + c.hitCount, 0),
            topQueries: allCached
                .sort((a, b) => b.hitCount - a.hitCount)
                .slice(0, 10)
                .map(c => ({
                    query: c.normalizedQuery,
                    hitCount: c.hitCount,
                    responseCount: c.responses.length,
                })),
        };
    },
});
