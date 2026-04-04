import { ArrowRight, BookOpen, Globe, Mic, Play, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

interface StudyRecentUploadsProps {
  recentMaterials: any[] | undefined;
  setIsUploadOpen: (open: boolean) => void;
  searchQuery?: string;
  compact?: boolean;
  layout?: "default" | "dashboard";
}

function getMaterialAppearance(type: string) {
  switch (type) {
    case "pdf":
      return {
        icon: BookOpen,
        accent: "border-rose-500/30 bg-rose-500/5 text-rose-400",
        label: "Document",
        badge:
          "rounded-full border border-rose-500/20 bg-rose-500/8 text-rose-400",
      };
    case "video":
    case "youtube":
      return {
        icon: Play,
        accent: "border-blue-500/30 bg-blue-500/5 text-blue-400",
        label: "Video",
        badge:
          "rounded-full border border-blue-500/20 bg-blue-500/8 text-blue-400",
      };
    case "audio":
      return {
        icon: Mic,
        accent: "border-amber-500/30 bg-amber-500/5 text-amber-400",
        label: "Audio",
        badge:
          "rounded-full border border-amber-500/20 bg-amber-500/8 text-amber-400",
      };
    default:
      return {
        icon: Globe,
        accent: "border-cyan-500/30 bg-cyan-500/5 text-cyan-400",
        label: "Web",
        badge:
          "rounded-full border border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
      };
  }
}

export function StudyRecentUploads({
  recentMaterials,
  setIsUploadOpen,
  searchQuery = "",
  compact = false,
  layout = "default",
}: StudyRecentUploadsProps) {
  const navigate = useNavigate();
  const isDashboardLayout = layout === "dashboard";
  const openMaterial = (material: any) => {
    if (material?.docId) {
      navigate(`/study/workspace/${material.docId}`);
      return;
    }
    navigate("/library");
  };
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleMaterials =
    recentMaterials?.filter((material) => {
      if (!normalizedQuery) return true;
      return (
        material.title?.toLowerCase().includes(normalizedQuery) ||
        material.type?.toLowerCase().includes(normalizedQuery)
      );
    }) ?? [];

  const emptyMessage = normalizedQuery
    ? "Nothing in recent uploads matches this search yet."
    : "Upload a source once and the whole dashboard starts working for you.";
  const [featuredMaterial, ...secondaryMaterials] = visibleMaterials;

  return (
    <section
      className={cn(
        isDashboardLayout
          ? "rounded-[32px] border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6 backdrop-blur-3xl"
          : "rounded-2xl border border-white/[0.06] bg-card/80 p-5 backdrop-blur-xl sm:p-6",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-3">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
              isDashboardLayout
                ? "border border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                : "border border-cyan-500/20 bg-cyan-500/8 text-cyan-400",
            )}
          >
            <Trophy className="h-3.5 w-3.5" />
            Recently captured
          </div>
          <div>
            <h2
              className={cn(
                "tracking-tight text-white font-bold",
                isDashboardLayout
                  ? "text-xl"
                  : "text-lg",
              )}
            >
              Continue from latest sources
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-white/40 max-w-xl">
              {normalizedQuery
                ? `Showing materials matching "${searchQuery.trim()}".`
                : "Resume sources instantly. All notes and follow-up tools stay linked."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/library")}
            className="rounded-full h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:bg-white/[0.05] hover:text-white"
          >
            Library
          </Button>
        </div>
      </div>

      {visibleMaterials.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-white/[0.1] bg-white/[0.02] px-5 py-10 text-center">
          <p className="text-lg font-bold tracking-tight text-white/50">
            No recent material
          </p>
          <p className="mt-2 max-w-xs mx-auto text-[13px] leading-relaxed text-white/30">
            {emptyMessage}
          </p>
          {!normalizedQuery && (
            <Button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="mt-6 rounded-full bg-cyan-600 text-white shadow-lg shadow-cyan-600/20 hover:bg-cyan-500 h-10 px-6 font-bold uppercase tracking-widest text-[11px]"
            >
              Upload first source
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "mt-6 grid gap-3",
            compact
              ? "grid-cols-1"
              : isDashboardLayout
                ? "xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]"
                : "xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]",
          )}
        >
          {featuredMaterial &&
            (() => {
              const appearance = getMaterialAppearance(featuredMaterial.type);
              const FeaturedIcon = appearance.icon;

              return (
                <button
                  type="button"
                  onClick={() => openMaterial(featuredMaterial)}
                  className={cn(
                    "group flex flex-col justify-between rounded-[24px] border border-white/[0.06] bg-white/[0.03] p-5 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.06] active:scale-[0.985] shadow-sm",
                    isDashboardLayout
                      ? "gap-4 p-5 sm:p-6"
                      : "min-h-[280px] sm:p-6",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "px-3 py-1 text-[9px] font-bold uppercase tracking-widest",
                        appearance.badge,
                      )}
                    >
                      {appearance.label}
                    </span>
                    <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-white/30">
                      {new Date(
                        featuredMaterial._creationTime,
                      ).toLocaleDateString()}
                    </span>
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-cyan-400/60">
                      Active
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-start justify-between gap-4",
                      isDashboardLayout ? "" : "mt-8",
                    )}
                  >
                    <div className="min-w-0">
                      <h3
                        className={cn(
                          "tracking-tight text-white font-bold leading-tight",
                          isDashboardLayout
                            ? "text-lg sm:text-xl"
                            : "text-2xl sm:text-3xl",
                        )}
                      >
                        {featuredMaterial.title}
                      </h3>
                      <p
                        className={cn(
                          "max-w-lg text-[13px] leading-relaxed text-white/40",
                          isDashboardLayout ? "mt-2" : "mt-3 sm:text-[15px]",
                        )}
                      >
                        {isDashboardLayout
                          ? "Resume work from this source. All contexts are preserved."
                          : "Everything connects back here. Notes, cards, and practice stay tethered to this source."}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform group-hover:scale-110",
                        appearance.accent,
                      )}
                    >
                      <FeaturedIcon className="h-5 w-5" />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-5",
                      isDashboardLayout ? "mt-0" : "mt-8",
                    )}
                  >
                    <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-tight text-white/20">
                      <span className="border border-white/[0.06] bg-white/[0.02] rounded-full px-3 py-1">
                        Resume Session
                      </span>
                      {isDashboardLayout ? (
                        <span className="border border-white/[0.06] bg-white/[0.02] rounded-full px-3 py-1">
                          Context Preserved
                        </span>
                      ) : (
                        <span className="border border-white/[0.06] bg-white/[0.02] rounded-full px-3 py-1">
                          Ready for practice
                        </span>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-cyan-400 group-hover:text-cyan-300">
                      Open Source
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              );
            })()}

          <div className="space-y-3">
            {secondaryMaterials
              .slice(
                0,
                compact ? secondaryMaterials.length : isDashboardLayout ? 3 : 4,
              )
              .map((material) => {
                const appearance = getMaterialAppearance(material.type);
                const Icon = appearance.icon;

                return (
                  <button
                    key={material._id}
                    type="button"
                    onClick={() => openMaterial(material)}
                    className="group flex items-start gap-4 rounded-[20px] border border-white/[0.04] bg-white/[0.02] p-4 text-left transition-all hover:bg-white/[0.05] hover:border-white/[0.08] active:scale-[0.98]"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform group-hover:scale-105",
                        appearance.accent,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest",
                            appearance.badge,
                          )}
                        >
                          {appearance.label}
                        </span>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-tight">
                          {new Date(
                            material._creationTime,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="mt-2 truncate text-[15px] font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                        {material.title}
                      </h3>
                      <p className="mt-1 text-[12px] leading-relaxed text-white/30 line-clamp-1">
                        Resume analysis and connected study tools.
                      </p>
                    </div>

                    <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-white/10 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/40" />
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </section>
  );
}
