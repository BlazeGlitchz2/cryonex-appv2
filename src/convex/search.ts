"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { COUNTRIES } from "../lib/countryConfig";

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

type StudentBriefMode = keyof typeof STUDENT_BRIEF_MODES;

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
    /ministry|civildefense|civil defense|redcrescent|red crescent|edu\.|gov\.|moi|moe|police|municipality/.test(
      haystack,
    )
  );
}

function scoreResult(
  result: any,
  mode: StudentBriefMode,
  scopeLabel: string,
) {
  const config = STUDENT_BRIEF_MODES[mode];
  const title = String(result.title || "");
  const snippet = String(result.snippet || "");
  const domain = extractDomain(result.link);
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

  if (/update|today|official|live|alert|closure|advisory|statement/.test(haystack)) {
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

export const deepSearch = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.SERPAPI_API_KEY;

    if (!apiKey) {
      throw new Error("SERPAPI_API_KEY is not configured");
    }

    try {
      const { getJson } = await import("serpapi");

      const response = await getJson({
        engine: "google",
        q: args.query,
        api_key: apiKey,
        num: 5,
      });

      const organicResults = response.organic_results || [];

      // Include optional imageUrl and make domain extraction safe
      return organicResults.slice(0, 5).map((result: any) => {
        let domain = "";
        try {
          domain =
            result.displayed_link ||
            (result.link ? new URL(result.link).hostname : "");
        } catch {
          domain = result.displayed_link || "";
        }

        const imageUrl =
          result.thumbnail ||
          result.thumbnail_url ||
          (result.inline_images && result.inline_images[0]?.thumbnail) ||
          undefined;

        return {
          title: result.title || "",
          url: result.link || "",
          domain,
          snippet: result.snippet || "",
          imageUrl, // new optional field
        };
      });
    } catch (error: any) {
      console.error("SerpAPI error:", error);
      throw new Error(`Search failed: ${error.message}`);
    }
  },
});

export const getLocalizedStudentBrief = action({
  args: {
    mode: v.optional(
      v.union(
        v.literal("school"),
        v.literal("safety"),
        v.literal("mobility"),
      ),
    ),
    country: v.optional(v.string()),
    region: v.optional(v.string()),
    language: v.optional(v.union(v.literal("en"), v.literal("ar"))),
    limit: v.optional(v.number()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.SERPAPI_API_KEY;
    const mode = (args.mode || "school") as StudentBriefMode;
    const scopeLabel = resolveScopeLabel(args.country, args.region);
    const limit = Math.max(2, Math.min(args.limit || 4, 6));

    if (!apiKey) {
      return {
        mode,
        scopeLabel,
        summary: STUDENT_BRIEF_MODES[mode].summary,
        updatedAt: Date.now(),
        items: [],
        officialCount: 0,
        fallback: true,
      };
    }

    try {
      const { getJson } = await import("serpapi");
      const queries = buildQueries(scopeLabel, mode);
      let collectedResults: any[] = [];

      for (const query of queries) {
        const response = await getJson({
          engine: "google",
          q: query,
          api_key: apiKey,
          tbm: "nws",
          num: Math.max(limit * 2, 6),
          gl: resolveSearchRegion(args.country),
          hl: args.language === "ar" ? "ar" : "en",
        });

        const newsResults =
          response.news_results ||
          response.top_stories ||
          response.organic_results ||
          [];

        if (Array.isArray(newsResults) && newsResults.length > 0) {
          collectedResults = newsResults;
          break;
        }
      }

      const deduped = new Map<string, any>();

      for (const result of collectedResults) {
        const url = String(result.link || "").trim();
        const title = String(result.title || "").trim();

        if (!url || !title || deduped.has(url)) continue;

        deduped.set(url, {
          title,
          url,
          snippet: String(result.snippet || "").trim(),
          source: String(result.source || "").trim(),
          publishedLabel: String(
            result.date || result.published || result.published_at || "",
          ).trim(),
          imageUrl: result.thumbnail || result.thumbnail_small || undefined,
        });
      }

      const items = Array.from(deduped.values())
        .sort((a, b) => {
          return (
            scoreResult(b, mode, scopeLabel) - scoreResult(a, mode, scopeLabel)
          );
        })
        .slice(0, limit)
        .map((item) => {
          const domain = extractDomain(item.url);
          const official = isOfficialSource(domain, item.title, item.snippet);

          return {
            ...item,
            domain,
            official,
            trustLabel: official ? "Official" : "Newsroom",
          };
        });

      return {
        mode,
        scopeLabel,
        summary: STUDENT_BRIEF_MODES[mode].summary,
        updatedAt: Date.now(),
        officialCount: items.filter((item) => item.official).length,
        fallback: false,
        items,
      };
    } catch (error: any) {
      console.error("Localized student brief search error:", error);

      return {
        mode,
        scopeLabel,
        summary: STUDENT_BRIEF_MODES[mode].summary,
        updatedAt: Date.now(),
        items: [],
        officialCount: 0,
        fallback: true,
        error: error?.message || "Unable to fetch localized brief",
      };
    }
  },
});
