import { startTransition, useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  BusFront,
  ExternalLink,
  GraduationCap,
  ImageOff,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { openSafeExternalUrl } from "@/lib/safe-url";
import { cn } from "@/lib/utils";

type BriefMode = "school" | "safety" | "mobility";
type SourceType = "news" | "x";

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
  sourceType: SourceType;
  official: boolean;
  trustLabel: "Official" | "Newsroom" | "X";
  priorityTopic: boolean;
};

type BriefPayload = {
  updatedAt: number;
  pinnedConflict: {
    title: string;
    summary: string;
    items: BriefItem[];
    xEnabled: boolean;
    fallback?: boolean;
    error?: string;
  };
  localBrief: {
    mode: BriefMode;
    scopeLabel: string;
    summary: string;
    items: BriefItem[];
    officialCount: number;
    fallback?: boolean;
    error?: string;
  };
};

interface LocalizedStudentBriefProps {
  country?: string;
  region?: string;
  preferredLanguage?: "en" | "ar";
  compact?: boolean;
  className?: string;
  layout?: "default" | "rail";
}

const MODE_CONFIG: Record<
  BriefMode,
  { label: string; icon: typeof GraduationCap; chipClassName: string }
> = {
  school: {
    label: "School",
    icon: GraduationCap,
    chipClassName:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:border-cyan-300/35 hover:bg-cyan-400/15",
  },
  safety: {
    label: "Safety",
    icon: ShieldAlert,
    chipClassName:
      "border-rose-300/20 bg-rose-300/10 text-rose-100 hover:border-rose-200/35 hover:bg-rose-300/15",
  },
  mobility: {
    label: "Mobility",
    icon: BusFront,
    chipClassName:
      "border-amber-300/20 bg-amber-300/10 text-amber-100 hover:border-amber-200/35 hover:bg-amber-300/15",
  },
};

function buildAssistantPrompt(brief: BriefPayload, mode: BriefMode) {
  const prioritized = [
    ...brief.pinnedConflict.items.slice(0, 3),
    ...brief.localBrief.items.slice(0, 2),
  ]
    .map(
      (item, index) =>
        `${index + 1}. ${item.title} (${item.sourceType === "x" ? "X" : item.domain || item.sourceName})`,
    )
    .join("\n");

  return [
    `Summarize the latest ${brief.pinnedConflict.title.toLowerCase()} updates for students, then connect them to ${MODE_CONFIG[mode].label.toLowerCase()} decisions in ${brief.localBrief.scopeLabel}.`,
    "Keep it calm, concise, newest-first, and practical for students or families.",
    "",
    "Priority items:",
    prioritized || "No live items were available.",
  ].join("\n");
}

function fallbackArt(item: BriefItem) {
  if (item.sourceType === "x") {
    return "from-[#10182e] via-[#0f2747] to-[#0f1726]";
  }

  if (item.official) {
    return "from-[#10241f] via-[#12392f] to-[#0a1320]";
  }

  return "from-[#1b1636] via-[#1c2748] to-[#0d1326]";
}

function BriefCard({
  item,
  compact = false,
  layout = "default",
}: {
  item: BriefItem;
  compact?: boolean;
  layout?: "default" | "rail";
}) {
  if (layout === "rail") {
    return (
      <button
        type="button"
        onClick={() => openSafeExternalUrl(item.url)}
        className="dashboard-subtle-panel group w-full rounded-[1.35rem] px-4 py-3.5 text-left"
      >
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/42">
          <span
            className={cn(
              "rounded-full border px-2.5 py-1",
              item.sourceType === "x"
                ? "border-sky-300/20 bg-sky-300/10 text-sky-100"
                : item.official
                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                  : "border-white/10 bg-white/[0.05] text-white/55",
            )}
          >
            {item.sourceType === "x" ? "X" : item.trustLabel}
          </span>
          <span>{item.sourceName || item.domain || "Live source"}</span>
          <span>{item.publishedLabel || "Latest available"}</span>
        </div>

        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-[15px] font-semibold leading-6 text-white">
              {item.title}
            </p>
            {item.snippet ? (
              <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-white/58">
                {item.snippet}
              </p>
            ) : null}
          </div>
          <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-white/38 transition-colors group-hover:text-white/72" />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openSafeExternalUrl(item.url)}
      className="w-full overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] text-left transition-colors hover:bg-white/[0.06]"
    >
      <div className="aspect-video overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center bg-gradient-to-br",
              fallbackArt(item),
            )}
          >
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs uppercase tracking-[0.18em] text-white/60">
              <ImageOff className="h-3.5 w-3.5" />
              Image pending
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
          <span
            className={cn(
              "rounded-full border px-2.5 py-1",
              item.sourceType === "x"
                ? "border-sky-300/20 bg-sky-300/10 text-sky-100"
                : item.official
                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                  : "border-white/10 bg-white/[0.05] text-white/55",
            )}
          >
            {item.sourceType === "x" ? "X / Trusted account" : item.trustLabel}
          </span>
          <span>{item.sourceName || item.domain || "Live source"}</span>
          <span>{item.publishedLabel || "Latest available"}</span>
        </div>

        <p
          className={cn(
            "mt-3 font-semibold leading-6 text-white",
            compact ? "text-[15px]" : "text-base",
          )}
        >
          {item.title}
        </p>

        {item.snippet ? (
          <p className="mt-2 text-sm leading-6 text-white/58">{item.snippet}</p>
        ) : null}

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/70">
          {item.sourceType === "x" ? "Open post" : "Open source"}
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
    </button>
  );
}

export function LocalizedStudentBrief({
  country,
  region,
  preferredLanguage = "en",
  compact = false,
  className,
  layout = "default",
}: LocalizedStudentBriefProps) {
  const navigate = useNavigate();
  const getLocalizedStudentBrief = useAction(
    api.search.getLocalizedStudentBrief,
  );
  const requestIdRef = useRef(0);
  const [activeMode, setActiveMode] = useState<BriefMode>("school");
  const [brief, setBrief] = useState<BriefPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBrief = async (mode: BriefMode, refresh = false) => {
    const requestId = ++requestIdRef.current;

    if (!brief || refresh) {
      setIsLoading(true);
    }
    if (refresh) {
      setIsRefreshing(true);
    }

    setError(null);

    try {
      const payload = (await getLocalizedStudentBrief({
        mode,
        country,
        region,
        language: preferredLanguage,
        pinnedLimit: compact ? 3 : 6,
        localLimit: compact ? 3 : 4,
      })) as BriefPayload;

      if (requestId !== requestIdRef.current) {
        return;
      }

      startTransition(() => {
        setBrief(payload);
      });

      if (payload.pinnedConflict.error || payload.localBrief.error) {
        setError(
          payload.pinnedConflict.error || payload.localBrief.error || null,
        );
      }
    } catch (fetchError: any) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(fetchError?.message || "Unable to load the local brief.");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void loadBrief(activeMode);
  }, [activeMode, country, region, preferredLanguage]);

  const activeConfig = MODE_CONFIG[activeMode];
  const localBrief = brief?.localBrief;
  const pinnedConflict = brief?.pinnedConflict;
  const isRailLayout = layout === "rail";
  const pinnedItems = isRailLayout
    ? pinnedConflict?.items?.slice(0, 1) || []
    : pinnedConflict?.items || [];
  const localItems = isRailLayout
    ? localBrief?.items?.slice(0, 3) || []
    : localBrief?.items || [];
  const hasMorePinned =
    isRailLayout && (pinnedConflict?.items?.length || 0) > pinnedItems.length;
  const hasMoreLocal =
    isRailLayout && (localBrief?.items?.length || 0) > localItems.length;

  return (
    <section
      className={cn(
        isRailLayout
          ? "dashboard-surface rounded-[1.9rem] p-5"
          : "deepshi-panel rounded-[28px] border border-white/10 p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            <ShieldAlert className="h-3.5 w-3.5" />
            {isRailLayout ? "Context rail" : "Local brief"}
          </div>
          <h3
            className={cn(
              "mt-3 font-semibold tracking-[-0.04em] text-white",
              isRailLayout
                ? "text-[1.35rem]"
                : compact
                  ? "text-xl"
                  : "text-2xl",
            )}
          >
            {isRailLayout
              ? `Student-safe updates for ${localBrief?.scopeLabel || "your area"}`
              : `Student-safe updates for ${localBrief?.scopeLabel || "your area"}`}
          </h3>
          {!isRailLayout ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              Pinned conflict coverage stays first. The rest of the brief stays
              localized and calm for school, safety, and mobility decisions.
            </p>
          ) : (
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/55">
              Keep the latest student-relevant movement, closure, and safety
              updates in one compact rail.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void loadBrief(activeMode, true)}
          disabled={isRefreshing}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-60"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </button>
      </div>

      <div
        className={cn(
          "mt-5 rounded-[24px] border border-amber-300/15 p-4",
          isRailLayout
            ? "bg-[linear-gradient(180deg,rgba(251,191,36,0.09),rgba(255,255,255,0.03))]"
            : "bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.16),transparent_55%),rgba(255,255,255,0.03)]",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100">
              <ShieldAlert className="h-3.5 w-3.5" />
              {isRailLayout
                ? "Priority update"
                : pinnedConflict?.title || "Iran-US conflict"}
            </div>
            <p className="mt-3 text-sm leading-6 text-white/58">
              {(isRailLayout
                ? "Keep the highest-priority regional update visible before anything else."
                : pinnedConflict?.summary) ||
                "Latest first. Trusted war coverage for Iran-US escalation and regional impact."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
              Latest first
            </div>
            {pinnedConflict?.xEnabled ? (
              <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
                X blended in
              </div>
            ) : (
              <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
                Trusted news only right now
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: isRailLayout ? 1 : compact ? 2 : 3 }).map(
              (_, index) => (
                <div
                  key={`conflict-skeleton-${index}`}
                  className={cn(
                    "rounded-[22px] border border-white/10 bg-white/[0.03]",
                    isRailLayout ? "p-4" : "overflow-hidden",
                  )}
                >
                  {isRailLayout ? (
                    <div className="space-y-3">
                      <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
                      <div className="h-5 w-full animate-pulse rounded-full bg-white/10" />
                      <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/8" />
                    </div>
                  ) : (
                    <>
                      <div className="aspect-video animate-pulse bg-white/8" />
                      <div className="space-y-3 p-4">
                        <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
                        <div className="h-5 w-4/5 animate-pulse rounded-full bg-white/10" />
                        <div className="h-4 w-full animate-pulse rounded-full bg-white/8" />
                      </div>
                    </>
                  )}
                </div>
              ),
            )}
          </div>
        ) : pinnedItems.length ? (
          <div className="mt-4 space-y-3">
            {pinnedItems.map((item) => (
              <BriefCard
                key={item.id}
                item={item}
                compact={compact}
                layout={isRailLayout ? "rail" : "default"}
              />
            ))}
            {hasMorePinned ? (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => openSafeExternalUrl(pinnedConflict?.items?.[0]?.url)}
                  className="text-xs font-semibold uppercase tracking-[0.16em] text-white/52 transition-colors hover:text-white/78"
                >
                  More priority coverage
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-base font-semibold text-white">
              No conflict updates surfaced right now
            </p>
            <p className="mt-2 text-sm leading-6 text-white/58">
              The pinned lane stays reserved for Iran-US conflict coverage and
              will refill on refresh. Your localized brief still appears below.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
            Local context
          </p>
          <p className="mt-2 text-sm leading-6 text-white/55">
            {localBrief?.summary ||
              "Localized school, safety, and mobility updates stay underneath the pinned conflict lane."}
          </p>
        </div>
        <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
          {localBrief?.officialCount
            ? `${localBrief.officialCount} official source${localBrief.officialCount === 1 ? "" : "s"}`
            : "Official sources prioritized"}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(MODE_CONFIG) as BriefMode[]).map((mode) => {
          const modeConfig = MODE_CONFIG[mode];
          const Icon = modeConfig.icon;
          const isActive = activeMode === mode;

          return (
            <button
              key={mode}
              type="button"
              onClick={() => setActiveMode(mode)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
                isActive
                  ? modeConfig.chipClassName
                  : "border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.08]",
              )}
            >
              <Icon className="h-4 w-4" />
              {modeConfig.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: isRailLayout ? 3 : compact ? 2 : 3 }).map(
            (_, index) => (
              <div
                key={`local-skeleton-${index}`}
                className={cn(
                  "rounded-[22px] border border-white/10 bg-white/[0.03]",
                  isRailLayout ? "p-4" : "overflow-hidden",
                )}
              >
                {isRailLayout ? (
                  <div className="space-y-3">
                    <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
                    <div className="h-5 w-full animate-pulse rounded-full bg-white/10" />
                    <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/8" />
                  </div>
                ) : (
                  <>
                    <div className="aspect-video animate-pulse bg-white/8" />
                    <div className="space-y-3 p-4">
                      <div className="h-3 w-28 animate-pulse rounded-full bg-white/10" />
                      <div className="h-5 w-4/5 animate-pulse rounded-full bg-white/10" />
                      <div className="h-4 w-full animate-pulse rounded-full bg-white/8" />
                    </div>
                  </>
                )}
              </div>
            ),
          )}
        </div>
      ) : localItems.length ? (
        <div className="mt-4 space-y-3">
          {localItems.map((item) => (
            <BriefCard
              key={item.id}
              item={item}
              compact={compact}
              layout={isRailLayout ? "rail" : "default"}
            />
          ))}
          {hasMoreLocal ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void loadBrief(activeMode, true)}
                className="text-xs font-semibold uppercase tracking-[0.16em] text-white/52 transition-colors hover:text-white/78"
              >
                Refresh for more
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-base font-semibold text-white">
            No local updates surfaced right now
          </p>
          <p className="mt-2 text-sm leading-6 text-white/58">
            Try refreshing in a moment. The brief is still filtering for
            location-aware student updates rather than showing a generic feed.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
            Latest first
          </div>
          <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
            {activeConfig.label} mode
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            navigate("/app", {
              state: {
                initialMessage: buildAssistantPrompt(
                  brief || {
                    updatedAt: Date.now(),
                    pinnedConflict: {
                      title: "Iran-US conflict",
                      summary: "",
                      items: [],
                      xEnabled: false,
                    },
                    localBrief: {
                      mode: activeMode,
                      scopeLabel: "my area",
                      summary: "",
                      items: [],
                      officialCount: 0,
                    },
                  },
                  activeMode,
                ),
              },
            })
          }
          className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        >
          Ask Cryonex
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="mt-3 text-xs leading-5 text-white/42">
        Use official instructions over headlines whenever movement, closures, or
        evacuation guidance affects your area.
        {error ? ` ${error}` : ""}
      </p>
    </section>
  );
}
