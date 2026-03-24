import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Coins, Sparkles, TriangleAlert, Zap } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { RefuelModal } from "./RefuelModal";

interface CreditIndicatorProps {
  type: "main" | "study";
  className?: string;
}

export function CreditIndicator({ type, className }: CreditIndicatorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const wallet = useQuery(api.credits.getWallet);
  const recentActivity =
    useQuery(api.credits.getRecentActivity, { limit: 1 }) ?? [];

  const balance =
    type === "study"
      ? Number(wallet?.studyCredits ?? 0)
      : Number(wallet?.cryoCredits ?? 0);

  const status = useMemo(() => {
    if (balance <= 0) {
      return {
        label: "Empty",
        helper:
          type === "study"
            ? "Refill to keep study sessions flowing"
            : "Premium media balance is empty",
        tone: "border-red-400/20 text-red-100 shadow-[0_16px_36px_rgba(239,68,68,0.16)]",
        fill: "from-red-400 via-orange-300 to-amber-200",
      };
    }

    if (balance < 10) {
      return {
        label: "Low",
        helper:
          type === "study"
            ? "Open Study Energy to watch and refill +10"
            : "You are close to your premium media floor",
        tone: "border-amber-300/20 text-amber-50 shadow-[0_16px_36px_rgba(251,191,36,0.14)]",
        fill: "from-amber-300 via-orange-200 to-yellow-100",
      };
    }

    return {
      label: "Healthy",
      helper:
        type === "study"
          ? "Enough runway for the next study session"
          : "Enough premium media runway for the next creation",
      tone: "border-[#6a5d78]/24 text-cyan-50 shadow-[0_16px_36px_rgba(34,211,238,0.1)]",
      fill: "from-cyan-300 via-sky-300 to-indigo-200",
    };
  }, [balance]);

  const recentLabel = recentActivity[0]?.description
    ? recentActivity[0].description
    : type === "study"
      ? "PDF extraction costs 10 study credits. Open Study Energy to refill."
      : "Cryo credits power image, video, and premium media";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "group relative flex min-w-[212px] items-center gap-3 overflow-hidden rounded-[1.45rem] border px-3.5 py-3 text-left transition-all duration-300",
          "bg-[linear-gradient(180deg,rgba(24,18,31,0.94),rgba(12,9,18,0.92))]",
          "hover:-translate-y-0.5 hover:border-white/16",
          status.tone,
          className,
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_38%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          {type === "study" ? (
            <Coins className="h-5 w-5 text-amber-100" />
          ) : (
            <Zap className="h-5 w-5 fill-current text-[#63a5ff]" />
          )}
        </div>

        <div className="relative min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold tracking-[0.02em] text-white/50">
              {type === "study" ? "Study energy" : "Cryo credits"}
            </p>
            {balance < 10 ? (
              <TriangleAlert className="h-3.5 w-3.5 text-amber-200" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 text-cyan-200" />
            )}
          </div>

          <div className="mt-1 flex items-end gap-2">
            <span className="text-2xl font-semibold tracking-[-0.05em] text-white tabular-nums">
              {balance.toFixed(2)}
            </span>
            <span className="pb-1 text-xs font-medium text-white/42">
              {type === "study" ? "energy" : "media"}
            </span>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className={cn(
                "h-full rounded-full bg-gradient-to-r",
                status.fill,
              )}
              style={{ width: `${Math.min(Math.max(balance, 4), 100)}%` }}
            />
          </div>

          <p className="mt-2 truncate text-xs text-white/48">
            {recentActivity[0]
              ? `${status.helper} • ${recentLabel}`
              : recentLabel}
          </p>
        </div>

        {balance < 10 && (
          <div className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.85)]" />
        )}
      </button>

      <RefuelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={type}
      />
    </>
  );
}
