import { CheckCircle2, ExternalLink, LayoutGrid, Sparkles } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { StudyRouteCardPayload } from "@/lib/study-routing";
import { useStudyRouterStore } from "@/lib/stores/study-router-store";

interface StudyRouteCardProps {
  payload: StudyRouteCardPayload;
  className?: string;
}

export function StudyRouteCard({
  payload,
  className,
}: StudyRouteCardProps) {
  const navigate = useNavigate();

  const openRoute = (url?: string) => {
    if (!url) return;
    useStudyRouterStore.getState().markOpened(payload.jobId);
    navigate(url);
  };

  return (
    <div
      className={cn(
        "mb-4 overflow-hidden rounded-[1.6rem] border border-emerald-400/16 bg-[linear-gradient(180deg,rgba(19,65,42,0.28),rgba(9,25,22,0.72))] shadow-[0_18px_60px_rgba(0,0,0,0.22)]",
        className,
      )}
    >
      <div className="flex items-start gap-4 border-b border-white/8 px-4 py-4 sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-400/12 text-emerald-300">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
              PDF done
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] text-white/58">
              <Sparkles className="h-3.5 w-3.5 text-[#D8A2FF]" />
              {payload.intentLabel}
            </span>
          </div>

          <p className="mt-3 truncate text-base font-semibold text-white">
            {payload.fileName}
          </p>
          <p className="mt-1 text-sm leading-6 text-white/62">
            {payload.summary}
          </p>
          {payload.topic && (
            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-white/42">
              Focus: {payload.topic}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 py-4 sm:px-5">
        <Button
          type="button"
          onClick={() => openRoute(payload.dashboardUrl)}
          className="rounded-full bg-white text-black hover:bg-white/92"
        >
          <LayoutGrid className="mr-2 h-4 w-4" />
          Open study dashboard
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => openRoute(payload.workspaceUrl)}
          className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Open prepared PDF
        </Button>
      </div>
    </div>
  );
}
