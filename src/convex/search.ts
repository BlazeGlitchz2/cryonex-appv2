"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { COUNTRIES } from "../lib/countryConfig";

const FRESHNESS_WINDOW_MS = 6 * 60 * 60 * 1000;
const DEFAULT_CONFLICT_LIMIT = 6;
const DEFAULT_LOCAL_LIMIT = 4;
const X_TRUSTED_HANDLES = [
  "ReutersWorld",
  "AP",
  "BBCWorld",
  "AJEnglish",
  "CENTCOM",
] as const;
const X_CIRCUIT_BREAK_MS = 30 * 60 * 1000;
let xCircuitOpenUntil = 0;
let xCircuitStatus:
  | "plan_unavailable"
  | "unauthorized"
  | "rate_limited"
  | "error"
  | null = null;

const SERPAPI_CIRCUIT_BREAK_MS = 60 * 60 * 1000; // 1 hour for search quota
let serpApiCircuitOpenUntil = 0;
let serpApiCircuitStatus: "quota_exceeded" | "error" | null = null;

const MAJOR_NEWS_DOMAINS = [
  "apnews.com",
  "reuters.com",
  "bbc.com",
  "aljazeera.com",
  "npr.org",
  "cnn.com",
  "nytimes.com",
  "ft.com",
  "wsj.com",
  "washingtonpost.com",
  "theguardian.com",
];

const STUDENT_BRIEF_MODES = {
  school: {
    label: "School",
    summary:
      "Prioritizes school closures, exam changes, campus advisories, and remote-learning shifts.",
    keywords: [
      "school",
      "exam",
      "university",
      "campus",
      "class",
      "remote learning",
      "closure",
      "education",
      "student",
    ],
    primaryQuery:
      '"school closure" OR "exam update" OR "university advisory" OR "classes suspended" OR "remote learning"',
    fallbackQuery:
      '"education update" OR "student advisory" OR "campus update" OR "school schedule"',
  },
  safety: {
    label: "Safety",
    summary:
      "Prioritizes official advisories, shelter guidance, curfews, and family safety notices relevant to students.",
    keywords: [
      "advisory",
      "safety",
      "official",
      "shelter",
      "curfew",
      "civil defense",
      "evacuation",
      "warning",
      "student",
    ],
    primaryQuery:
      '"official advisory" OR "civil defense" OR shelter OR curfew OR evacuation OR warning',
    fallbackQuery:
      '"security update" OR "public safety" OR "official statement"',
  },
  mobility: {
    label: "Mobility",
    summary:
      "Prioritizes transport disruption, airport, checkpoint, road, and border updates that can affect getting to school or home.",
    keywords: [
      "transport",
      "airport",
      "road",
      "border",
      "checkpoint",
      "closure",
      "mobility",
      "travel",
      "fuel",
    ],
    primaryQuery:
      'transport OR airport OR "road closure" OR checkpoint OR border OR "travel advisory"',
    fallbackQuery:
      '"travel update" OR "movement advisory" OR "transport disruption"',
  },
} as const;

const PINNED_CONFLICT_QUERIES = [
  '"Iran" ("United States" OR US OR America) (war OR strikes OR attacks OR talks OR ceasefire)',
  '"Iran" (Hormuz OR "Strait of Hormuz" OR Gulf OR shipping OR "regional impact")',
  '"Iran" ("United States" OR US) (missile OR escalation OR diplomacy OR retaliation)',
];

type StudentBriefMode = keyof typeof STUDENT_BRIEF_MODES;

type BriefItem = {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  domain: string;
  publishedAt: number | null;
  publishedLabel: string;
  snippet: string;
  imageUrl?: string;
  sourceType: "news" | "x";
  official: boolean;
  trustLabel: "Official" | "Newsroom" | "X";
  priorityTopic: boolean;
};

type XFetchStatus =
  | "available"
  | "not_configured"
  | "plan_unavailable"
  | "unauthorized"
  | "rate_limited"
  | "error";

class XApiError extends Error {
  statusCode: number;
  status: Exclude<XFetchStatus, "available" | "not_configured">;

  constructor(
    statusCode: number,
    status: Exclude<XFetchStatus, "available" | "not_configured">,
    message: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = status;
  }
}

function normalizeCountry(country?: string) {
  return String(country || "")
    .trim()
    .toLowerCase();
}

function resolveScopeLabel(country?: string, region?: string) {
  const normalizedCountry = normalizeCountry(country);
  const countryName = COUNTRIES[normalizedCountry]?.name;
  const normalizedRegion = String(region || "")
    .trim()
    .toLowerCase();

  if (countryName) {
    return countryName;
  }

  if (normalizedRegion === "ksa") {
    return "Saudi Arabia";
  }

  if (normalizedRegion === "uae") {
    return "United Arab Emirates";
  }

  if (normalizedRegion === "egypt") {
    return "Egypt";
  }

  if (normalizedRegion) {
    return region!;
  }

  return "your area";
}

function resolveSearchRegion(country?: string) {
  const normalizedCountry = normalizeCountry(country);
  if (normalizedCountry && normalizedCountry.length === 2) {
    return normalizedCountry;
  }

  return "us";
}

function extractDomain(url?: string) {
  if (!url) return "";

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isOfficialSource(domain: string, title: string, snippet: string) {
  const haystack = `${domain} ${title} ${snippet}`.toLowerCase();

  return (
    /\.gov(\.|$)/i.test(domain) ||
    /\.edu(\.|$)/i.test(domain) ||
    /ministry|civildefense|civil defense|redcrescent|red crescent|moi|moe|state department|white house|centcom|police|municipality/.test(
      haystack,
    )
  );
}

function isMajorNewsSource(domain: string) {
  return MAJOR_NEWS_DOMAINS.some(
    (candidate) => domain === candidate || domain.endsWith(`.${candidate}`),
  );
}

function isHighSignalConflictSource(
  domain: string,
  title: string,
  snippet: string,
) {
  return isOfficialSource(domain, title, snippet) || isMajorNewsSource(domain);
}

function scoreResult(
  title: string,
  snippet: string,
  domain: string,
  mode: StudentBriefMode,
  scopeLabel: string,
) {
  const config = STUDENT_BRIEF_MODES[mode];
  const haystack = `${title} ${snippet} ${domain}`.toLowerCase();
  let score = 0;

  if (haystack.includes(scopeLabel.toLowerCase())) {
    score += 3;
  }

  for (const keyword of config.keywords) {
    if (haystack.includes(keyword)) {
      score += 2;
    }
  }

  if (isOfficialSource(domain, title, snippet)) {
    score += 5;
  }

  if (
    /update|today|official|live|alert|closure|advisory|statement/.test(haystack)
  ) {
    score += 1;
  }

  return score;
}

function buildQueries(scopeLabel: string, mode: StudentBriefMode) {
  const config = STUDENT_BRIEF_MODES[mode];

  return [
    `${scopeLabel} (${config.primaryQuery}) (students OR school OR families OR education)`,
    `${scopeLabel} (${config.fallbackQuery})`,
  ];
}

function parseRelativeTime(label?: string | null) {
  if (!label) return null;

  const normalized = label.trim().toLowerCase();
  const now = Date.now();

  if (normalized === "just now") return now;

  const match = normalized.match(
    /^(\d+)\s+(minute|minutes|hour|hours|day|days|week|weeks)\s+ago$/,
  );
  if (!match) return null;

  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = unit.startsWith("minute")
    ? 60 * 1000
    : unit.startsWith("hour")
      ? 60 * 60 * 1000
      : unit.startsWith("day")
        ? 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;

  return now - value * unitMs;
}

function parsePublishedAt(value?: string | null) {
  if (!value) return null;

  const direct = Date.parse(value);
  if (!Number.isNaN(direct)) {
    return direct;
  }

  return parseRelativeTime(value);
}

function formatPublishedLabel(
  publishedAt: number | null,
  fallback?: string | null,
) {
  if (fallback && fallback.trim()) {
    return fallback.trim();
  }

  if (!publishedAt) {
    return "Latest available";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(publishedAt));
}

function compareFreshnessAndTrust(a: BriefItem, b: BriefItem) {
  if (a.publishedAt !== null && b.publishedAt !== null) {
    const withinWindow =
      Math.abs(a.publishedAt - b.publishedAt) <= FRESHNESS_WINDOW_MS;

    if (withinWindow && a.official !== b.official) {
      return a.official ? -1 : 1;
    }

    if (a.publishedAt !== b.publishedAt) {
      return b.publishedAt - a.publishedAt;
    }
  } else if (a.publishedAt !== null || b.publishedAt !== null) {
    return a.publishedAt !== null ? -1 : 1;
  }

  if (a.official !== b.official) {
    return a.official ? -1 : 1;
  }

  return a.title.localeCompare(b.title);
}

function dedupeBriefItems(items: BriefItem[]) {
  const deduped = new Map<string, BriefItem>();

  for (const item of items) {
    const key = item.sourceType === "x" ? item.id : item.url;
    if (!deduped.has(key)) {
      deduped.set(key, item);
    }
  }

  return Array.from(deduped.values());
}

function isBriefItem(item: BriefItem | null): item is BriefItem {
  return item !== null;
}

function blendConflictItems(
  newsItems: BriefItem[],
  xItems: BriefItem[],
  limit: number,
  maxX: number,
) {
  const sortedNews = [...newsItems].sort(compareFreshnessAndTrust);
  const sortedX = [...xItems].sort(compareFreshnessAndTrust);
  const merged: BriefItem[] = [];
  let xUsed = 0;

  if (sortedNews.length > 0) {
    merged.push(sortedNews.shift()!);
  }

  const remainingPool = [...sortedNews, ...sortedX].sort(
    compareFreshnessAndTrust,
  );
  for (const item of remainingPool) {
    if (merged.length >= limit) break;
    if (item.sourceType === "x" && xUsed >= maxX) continue;

    merged.push(item);
    if (item.sourceType === "x") {
      xUsed += 1;
    }
  }

  if (merged.length < limit) {
    for (const item of sortedNews) {
      if (merged.length >= limit) break;
      if (!merged.some((existing) => existing.id === item.id)) {
        merged.push(item);
      }
    }
  }

  if (merged.length < limit) {
    for (const item of sortedX) {
      if (merged.length >= limit || xUsed >= maxX) break;
      if (!merged.some((existing) => existing.id === item.id)) {
        merged.push(item);
        xUsed += 1;
      }
    }
  }

  return merged.slice(0, limit);
}

async function fetchGoogleNewsItems({
  query,
  apiKey,
  gl,
  hl,
  maxResults,
}: {
  query: string;
  apiKey: string;
  gl?: string;
  hl?: "en" | "ar";
  maxResults: number;
}) {
  if (serpApiCircuitOpenUntil > Date.now()) {
    console.warn(`[search] SerpAPI circuit open: ${serpApiCircuitStatus}, using fallback`);
    return [];
  }

  const { getJson } = await import("serpapi");
  try {
    const response = await getJson({
      engine: "google",
      q: query,
      api_key: apiKey,
      tbm: "nws",
      num: maxResults,
      gl,
      hl,
    });

    if (response.error) {
      if (response.error.includes("account has run out of searches")) {
        serpApiCircuitOpenUntil = Date.now() + SERPAPI_CIRCUIT_BREAK_MS;
        serpApiCircuitStatus = "quota_exceeded";
      }
      throw new Error(response.error);
    }

    return (
      response.news_results ||
      response.top_stories ||
      response.organic_results ||
      []
    );
  } catch (error: any) {
    const msg = error?.message || String(error);
    if (msg.includes("account has run out of searches") || msg.includes("quota")) {
      serpApiCircuitOpenUntil = Date.now() + SERPAPI_CIRCUIT_BREAK_MS;
      serpApiCircuitStatus = "quota_exceeded";
    }
    throw error;
  }
}

async function fetchFallbackSearchItems(query: string) {
  const pollKey = process.env.POLLINATIONS_API_KEY;
  const url = `https://text.pollinations.ai/${encodeURIComponent(
    `Latest news about ${query}. Return ONLY a JSON array of objects with keys: title, link, snippet, date, source. Limit to 5 results.`
  )}?model=gemini-search&json=true`;

  try {
    const response = await fetch(url, {
      headers: pollKey ? { Authorization: `Bearer ${pollKey}` } : {},
    });

    if (!response.ok) {
      console.warn(`[search] Fallback search (Pollinations) failed with status ${response.status}`);
      return [];
    }

    const text = await response.text();
    // Use regex to find the JSON array inside the response (in case the AI adds markdown backticks)
    const jsonMatch = text.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
      console.warn("[search] Fallback search (Pollinations) returned no valid JSON", text.slice(0, 100));
      return [];
    }

    const rawItems = JSON.parse(jsonMatch[0]);
    return Array.isArray(rawItems) ? rawItems : [];
  } catch (error) {
    console.error("[search] Fallback search (Pollinations) error:", error);
    return [];
  }
}

function normalizeNewsItem(raw: any, priorityTopic: boolean): BriefItem | null {
  const url = String(raw.link || "").trim();
  const title = String(raw.title || "").trim();
  if (!url || !title) return null;

  const sourceName = String(raw.source || extractDomain(url) || "News").trim();
  const snippet = String(raw.snippet || "").trim();
  const publishedAt = parsePublishedAt(
    raw.date || raw.published || raw.published_at || "",
  );
  const domain = extractDomain(url);
  const official = isOfficialSource(domain, title, snippet);

  return {
    id: `news:${url}`,
    title,
    url,
    sourceName,
    domain,
    publishedAt,
    publishedLabel: formatPublishedLabel(
      publishedAt,
      raw.date || raw.published || raw.published_at || "",
    ),
    snippet,
    imageUrl:
      raw.thumbnail ||
      raw.thumbnail_small ||
      raw.thumbnail_url ||
      raw.image ||
      undefined,
    sourceType: "news" as const,
    official,
    trustLabel: official ? "Official" : "Newsroom",
    priorityTopic,
  } satisfies BriefItem;
}

async function fetchPinnedConflictNews(apiKey: string, limit: number) {
  const rawResults: any[] = [];

  for (const query of PINNED_CONFLICT_QUERIES) {
    try {
      const batch = await fetchGoogleNewsItems({
        query,
        apiKey,
        gl: "us",
        hl: "en",
        maxResults: Math.max(limit * 2, 8),
      });
      rawResults.push(...batch);
    } catch (error) {
      console.error("Pinned conflict search query failed", query, error);
      
      // Fallback to Pollinations search if SerpAPI fails
      try {
        const fallback = await fetchFallbackSearchItems(query);
        if (fallback && fallback.length > 0) {
          rawResults.push(...fallback);
        }
      } catch (e) {
        console.error("Fallback search failed for query", query, e);
      }
    }
  }

  const normalized = dedupeBriefItems(
    rawResults
      .map((item): BriefItem | null => normalizeNewsItem(item, true))
      .filter(isBriefItem)
      .filter((item) =>
        isHighSignalConflictSource(item.domain, item.title, item.snippet),
      ),
  ).sort(compareFreshnessAndTrust);

  return normalized.slice(0, Math.max(limit * 2, 8));
}

async function fetchXHandlePosts(handle: string, token: string) {
  const query =
    `from:${handle} (Iran OR "United States" OR US OR Hormuz OR Gulf OR strikes OR talks OR ceasefire) ` +
    `-is:retweet -is:reply`;

  const params = new URLSearchParams({
    query,
    max_results: "6",
    expansions: "author_id,attachments.media_keys",
    "tweet.fields": "created_at,attachments,text",
    "user.fields": "name,username,profile_image_url,verified",
    "media.fields": "preview_image_url,url,type",
  });

  const response = await fetch(
    `https://api.x.com/2/tweets/search/recent?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    const status =
      response.status === 402
        ? "plan_unavailable"
        : response.status === 401 || response.status === 403
          ? "unauthorized"
          : response.status === 429
            ? "rate_limited"
            : "error";
    throw new XApiError(
      response.status,
      status,
      `X API returned ${response.status} for ${handle}`,
    );
  }

  return (await response.json()) as any;
}

function normalizeXItems(payload: any) {
  const users = new Map<string, any>();
  const media = new Map<string, any>();

  for (const user of payload?.includes?.users || []) {
    users.set(String(user.id), user);
  }

  for (const item of payload?.includes?.media || []) {
    media.set(String(item.media_key), item);
  }

  return (payload?.data || [])
    .map((tweet: any) => {
      const author = users.get(String(tweet.author_id));
      const mediaKey = tweet.attachments?.media_keys?.[0];
      const mediaAsset = mediaKey ? media.get(String(mediaKey)) : null;
      const title = String(tweet.text || "")
        .replace(/\s+/g, " ")
        .trim();

      if (!title || !author?.username) return null;

      const url = `https://x.com/${author.username}/status/${tweet.id}`;
      const publishedAt = parsePublishedAt(tweet.created_at || "");

      return {
        id: `x:${tweet.id}`,
        title,
        url,
        sourceName: author.name || author.username,
        domain: "x.com",
        publishedAt,
        publishedLabel: formatPublishedLabel(publishedAt, null),
        snippet: `From @${author.username}`,
        imageUrl: mediaAsset?.url || mediaAsset?.preview_image_url || undefined,
        sourceType: "x" as const,
        official: Boolean(author.verified),
        trustLabel: "X" as const,
        priorityTopic: true,
      } satisfies BriefItem;
    })
    .filter(Boolean) as BriefItem[];
}

async function fetchPinnedConflictX(token: string, limit: number) {
  if (!token) {
    return {
      items: [] as BriefItem[],
      status: "not_configured" as const,
    };
  }

  if (xCircuitOpenUntil > Date.now() && xCircuitStatus) {
    return {
      items: [] as BriefItem[],
      status: xCircuitStatus,
      reason: "Temporarily skipping X after a recent upstream failure.",
    };
  }

  const items: BriefItem[] = [];
  let aggregateStatus: XFetchStatus = "available";
  let aggregateReason: string | undefined;

  for (const handle of X_TRUSTED_HANDLES) {
    try {
      const payload = await fetchXHandlePosts(handle, token);
      items.push(...normalizeXItems(payload));
    } catch (error: any) {
      if (error instanceof XApiError) {
        aggregateStatus = error.status;
        aggregateReason = error.message;

        if (
          error.status === "plan_unavailable" ||
          error.status === "unauthorized" ||
          error.status === "rate_limited"
        ) {
          xCircuitOpenUntil = Date.now() + X_CIRCUIT_BREAK_MS;
          xCircuitStatus = error.status;
          break;
        }
      } else {
        aggregateStatus = "error";
        aggregateReason =
          error instanceof Error ? error.message : String(error);
      }
    }
  }

  const normalizedItems = dedupeBriefItems(items)
    .sort(compareFreshnessAndTrust)
    .slice(0, Math.max(limit * 2, 6));

  if (normalizedItems.length > 0) {
    xCircuitOpenUntil = 0;
    xCircuitStatus = null;
    return {
      items: normalizedItems,
      status: "available" as const,
    };
  }

  if (aggregateStatus !== "available") {
    console.warn("[search] X blend unavailable", {
      status: aggregateStatus,
      reason: aggregateReason,
    });
  }

  return {
    items: normalizedItems,
    status: aggregateStatus,
    reason: aggregateReason,
  };
}

async function fetchLocalBriefItems({
  apiKey,
  mode,
  scopeLabel,
  country,
  language,
  localLimit,
}: {
  apiKey: string;
  mode: StudentBriefMode;
  scopeLabel: string;
  country?: string;
  language?: "en" | "ar";
  localLimit: number;
}) {
  const queries = buildQueries(scopeLabel, mode);
  const rawResults: any[] = [];

  for (const query of queries) {
    try {
      const batch = await fetchGoogleNewsItems({
        query,
        apiKey,
        gl: resolveSearchRegion(country),
        hl: language === "ar" ? "ar" : "en",
        maxResults: Math.max(localLimit * 2, 6),
      });
      rawResults.push(...batch);
    } catch (error) {
      console.error("Local brief search query failed", query, error);

      // Fallback to Pollinations search if SerpAPI fails
      try {
        const fallback = await fetchFallbackSearchItems(query);
        if (fallback && fallback.length > 0) {
          rawResults.push(...fallback);
        }
      } catch (e) {
        console.error("Fallback search failed for query", query, e);
      }
    }
  }

  const items = dedupeBriefItems(
    rawResults
      .map((item): BriefItem | null => normalizeNewsItem(item, false))
      .filter(isBriefItem),
  )
    .sort((a, b) => {
      const freshnessOrder = compareFreshnessAndTrust(a, b);
      if (freshnessOrder !== 0) {
        return freshnessOrder;
      }

      return (
        scoreResult(b.title, b.snippet, b.domain, mode, scopeLabel) -
        scoreResult(a.title, a.snippet, a.domain, mode, scopeLabel)
      );
    })
    .slice(0, localLimit);

  return items;
}

export const deepSearch = action({
  args: {
    query: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      throw new Error("SERPAPI_API_KEY is not configured");
    }

    try {
      const rawItems = await fetchGoogleNewsItems({
        query: args.query,
        apiKey,
        maxResults: 5,
      });

      return rawItems
        .map((item: any): BriefItem | null => normalizeNewsItem(item, false))
        .filter(isBriefItem)
        .slice(0, 5)
        .map((item: BriefItem) => ({
          title: item.title,
          url: item.url,
          domain: item.domain,
          snippet: item.snippet,
          imageUrl: item.imageUrl,
        }));
    } catch (error: any) {
      console.error("SerpAPI error:", error);
      throw new Error(`Search failed: ${error.message}`);
    }
  },
});

export const getLocalizedStudentBrief = action({
  args: {
    mode: v.optional(
      v.union(v.literal("school"), v.literal("safety"), v.literal("mobility")),
    ),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    limit: v.optional(v.number()),
    pinnedLimit: v.optional(v.number()),
    localLimit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.SERPAPI_API_KEY;
    const xToken =
      process.env.X_BEARER_TOKEN ||
      process.env.X_TOKEN ||
      process.env.TWITTER_BEARER_TOKEN ||
      process.env.TWITTER_API_BEARER_TOKEN;
    const mode = (args.mode || "school") as StudentBriefMode;
    const scopeLabel = resolveScopeLabel(args.country, args.region);
    const pinnedLimit = Math.max(
      3,
      Math.min(args.pinnedLimit || DEFAULT_CONFLICT_LIMIT, 6),
    );
    const localLimit = Math.max(
      3,
      Math.min(args.localLimit || args.limit || DEFAULT_LOCAL_LIMIT, 4),
    );

    const basePayload = {
      updatedAt: Date.now(),
      pinnedConflict: {
        title: "Iran-US conflict",
        summary:
          "Latest first. Trusted war coverage for Iran-US escalation, regional impact, and Gulf disruption.",
        items: [] as BriefItem[],
        xEnabled: false,
        fallback: !apiKey,
      },
      localBrief: {
        mode,
        scopeLabel,
        summary: STUDENT_BRIEF_MODES[mode].summary,
        items: [] as BriefItem[],
        officialCount: 0,
        fallback: !apiKey,
      },
    };

    if (!apiKey) {
      return basePayload;
    }

    try {
      const [conflictNews, localItems, xResult] = await Promise.all([
        fetchPinnedConflictNews(apiKey, pinnedLimit),
        fetchLocalBriefItems({
          apiKey,
          mode,
          scopeLabel,
          country: args.country,
          language: args.language,
          localLimit,
        }),
        fetchPinnedConflictX(xToken || "", pinnedLimit),
      ]);

      const pinnedItems = blendConflictItems(
        conflictNews,
        xResult.items,
        pinnedLimit,
        pinnedLimit <= 3 ? 1 : 2,
      );

      return {
        updatedAt: Date.now(),
        pinnedConflict: {
          title: "Iran-US conflict",
          summary:
            "Latest first. Trusted war coverage for Iran-US escalation, regional impact, and Gulf disruption.",
          items: pinnedItems,
          xEnabled: xResult.status === "available" && xResult.items.length > 0,
          fallback: pinnedItems.length === 0,
        },
        localBrief: {
          mode,
          scopeLabel,
          summary: STUDENT_BRIEF_MODES[mode].summary,
          items: localItems,
          officialCount: localItems.filter((item) => item.official).length,
          fallback: localItems.length === 0,
        },
      };
    } catch (error: any) {
      console.error("Localized student brief search error:", error);

      return {
        ...basePayload,
        pinnedConflict: {
          ...basePayload.pinnedConflict,
          fallback: true,
          error: error?.message || "Unable to fetch pinned conflict coverage",
        },
        localBrief: {
          ...basePayload.localBrief,
          fallback: true,
          error: error?.message || "Unable to fetch localized brief",
        },
      };
    }
  },
});
