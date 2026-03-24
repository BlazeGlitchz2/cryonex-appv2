import { startTransition, useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  BusFront,
  ExternalLink,
  GraduationCap,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BriefMode = "school" | "safety" | "mobility";

type BriefItem = {
  title: string;
  url: string;
  snippet: string;
  source?: string;
  domain?: string;
  publishedLabel?: string;
  official?: boolean;
  trustLabel?: string;
};

type BriefPayload = {
  mode: BriefMode;
  scopeLabel: string;
  summary: string;
  updatedAt: number;
  officialCount: number;
  fallback?: boolean;
  error?: string;
  items: BriefItem[];
};

interface LocalizedStudentBriefProps {
  country?: string;
  region?: string;
  preferredLanguage?: "en" | "ar";
  compact?: boolean;
  className?: string;
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
  const lines = brief.items
    .slice(0, 3)
    .map((item, index) => `${index + 1}. ${item.title} (${item.domain || item.source || "source"})`)
    .join("\n");

  return [
    `Summarize the latest ${MODE_CONFIG[mode].label.toLowerCase()} updates for students in ${brief.scopeLabel}.`,
    "Focus on what a student or family should practically know right now, especially anything that affects studying, school attendance, movement, or safety.",
    "Keep it calm, concise, and actionable.",
    "",
    "Headlines:",
    lines || "No live headlines were available.",
  ].join("\n");
}

export function LocalizedStudentBrief({
  country,
  region,
  preferredLanguage = "en",
  compact = false,
  className,
}: LocalizedStudentBriefProps) {
  const navigate = useNavigate();
  const getLocalizedStudentBrief = useAction(api.search.getLocalizedStudentBrief);
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
        limit: compact ? 3 : 4,
      })) as BriefPayload;

      if (requestId !== requestIdRef.current) {
        return;
      }

      startTransition(() => {
        setBrief(payload);
      });

      if (payload.error) {
        setError(payload.error);
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

  return (
    <section
      className={cn(
        "deepshi-panel rounded-[28px] border border-white/10 p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            <ShieldAlert className="h-3.5 w-3.5" />
            Local brief
          </div>
          <h3
            className={cn(
              "mt-3 font-semibold tracking-[-0.04em] text-white",
              compact ? "text-xl" : "text-2xl",
            )}
          >
            Student-safe updates for {brief?.scopeLabel || "your area"}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            {brief?.summary ||
              "A calm, localized stream for school, safety, and mobility updates when conditions are unstable."}
          </p>
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
          {Array.from({ length: compact ? 2 : 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-5 w-4/5 animate-pulse rounded-full bg-white/10" />
              <div className="mt-2 h-4 w-full animate-pulse rounded-full bg-white/8" />
              <div className="mt-2 h-4 w-2/3 animate-pulse rounded-full bg-white/8" />
            </div>
          ))}
        </div>
      ) : brief?.items?.length ? (
        <div className="mt-4 space-y-3">
          {brief.items.map((item) => (
            <button
              key={item.url}
              type="button"
              onClick={() => window.open(item.url, "_blank", "noopener,noreferrer")}
              className="w-full rounded-[22px] border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:bg-white/[0.06]"
            >
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/45">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1",
                    item.official
                      ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                      : "border-white/10 bg-black/20 text-white/55",
                  )}
                >
                  {item.trustLabel || "Source"}
                </span>
                <span>{item.domain || item.source || "Live source"}</span>
                {item.publishedLabel ? <span>{item.publishedLabel}</span> : null}
              </div>
              <p className="mt-3 text-base font-semibold leading-6 text-white">
                {item.title}
              </p>
              {item.snippet ? (
                <p className="mt-2 text-sm leading-6 text-white/58">
                  {item.snippet}
                </p>
              ) : null}
              <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/70">
                Open source
                <ExternalLink className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-base font-semibold text-white">
            No live updates surfaced right now
          </p>
          <p className="mt-2 text-sm leading-6 text-white/58">
            The brief will retry when you refresh. If you need help quickly,
            ask Cryonex to summarize the latest local situation for students.
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
            {brief?.officialCount
              ? `${brief.officialCount} official source${brief.officialCount === 1 ? "" : "s"}`
              : "Official sources prioritized"}
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
                    mode: activeMode,
                    scopeLabel: "my area",
                    summary: "",
                    updatedAt: Date.now(),
                    officialCount: 0,
                    items: [],
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
