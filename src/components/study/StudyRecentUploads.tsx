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
          ? "dashboard-surface rounded-[1.9rem] p-5 sm:p-6"
          : "rounded-2xl border border-border.06] bg-card/80 p-5 backdrop-blur-xl sm:p-6",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-3">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-0.5 text-xs font-medium uppercase tracking-wider",
              isDashboardLayout
                ? "border border-border bg-foreground/[0.04] text-foreground/62"
                : "border border-[#D244FF]/20 bg-[#D244FF]/8 text-[#D244FF]",
            )}
          >
            <Trophy className="h-4 w-4" />
            Recently captured
          </div>
          <div>
            <h2
              className={cn(
                "tracking-tight text-foreground/92",
                isDashboardLayout
                  ? "text-[1.35rem] font-semibold"
                  : "text-xl font-medium",
              )}
            >
              Continue from your latest sources
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/50">
              {normalizedQuery
                ? `Showing the materials that still match "${searchQuery.trim()}".`
                : "Keep your current sources visible, resumable, and one tap away from the tools that use them."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="border border-border.06] bg-foreground/[0.04] rounded-full px-3 py-1.5 text-xs font-medium text-foreground/80">
            {visibleMaterials.length} in view
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/library")}
            className="rounded-full px-0 text-sm font-medium uppercase tracking-wider text-foreground/60 hover:bg-transparent hover:text-foreground"
          >
            Open library
          </Button>
        </div>
      </div>

      {visibleMaterials.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-foreground/[0.03] px-5 py-10 text-center">
          <p className="text-lg font-medium tracking-tight text-foreground/90">
            No recent material yet
          </p>
          <p className="mt-2 max-w-md mx-auto text-sm leading-relaxed text-foreground/50">
            {emptyMessage}
          </p>
          {!normalizedQuery && (
            <Button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="mt-5 rounded-full bg-[#D244FF] text-foreground hover:opacity-90 px-5 font-medium uppercase tracking-wider text-xs"
            >
              Upload your first source
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "mt-5 grid gap-3",
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
                    "group flex flex-col justify-between rounded-2xl border border-border.06] bg-foreground/[0.03] p-5 text-left transition-colors hover:border-border hover:bg-foreground/[0.06]",
                    isDashboardLayout
                      ? "gap-4 p-4 sm:p-5"
                      : "min-h-[280px] sm:p-6",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "px-3 py-0.5 text-xs font-medium uppercase tracking-wider",
                        appearance.badge,
                      )}
                    >
                      {appearance.label}
                    </span>
                    <span className="rounded-full border border-border.06] bg-foreground/[0.04] px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-foreground/50">
                      {new Date(
                        featuredMaterial._creationTime,
                      ).toLocaleDateString()}
                    </span>
                    <span className="rounded-full border border-border.06] bg-foreground/[0.04] px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-foreground/60">
                      Active source
                    </span>
                  </div>

                  <div
                    className={cn(
                      "flex items-start justify-between gap-4",
                      isDashboardLayout ? "" : "mt-8",
                    )}
                  >
                    <div className="max-w-xl">
                      {!isDashboardLayout ? (
                        <p className="text-xs font-mono uppercase tracking-wider text-foreground/40">
                          Source shelf
                        </p>
                      ) : null}
                      <h3
                        className={cn(
                          "tracking-tight text-foreground/92",
                          isDashboardLayout
                            ? "text-lg font-semibold sm:text-[1.35rem]"
                            : "text-2xl font-medium sm:text-3xl",
                        )}
                      >
                        {featuredMaterial.title}
                      </h3>
                      <p
                        className={cn(
                          "max-w-lg text-sm leading-relaxed text-foreground/54",
                          isDashboardLayout ? "mt-2" : "mt-3 sm:text-base",
                        )}
                      >
                        {isDashboardLayout
                          ? "Resume notes, review, or quiz work from the same source without losing your place."
                          : "This is the best place to continue because the notes, review cards, and follow-up practice can all stay attached to the same source instead of scattering across the app."}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border",
                        appearance.accent,
                      )}
                    >
                      <FeaturedIcon className="h-6 w-6" />
                    </div>
                  </div>

                  <div
                    className={cn(
                      "flex flex-wrap items-center justify-between gap-3 border-t border-border.06] pt-4",
                      isDashboardLayout ? "mt-0" : "mt-8",
                    )}
                  >
                    <div className="flex flex-wrap gap-2 text-xs font-medium text-foreground/40">
                      <span className="border border-border.06] bg-foreground/[0.04] rounded-full px-3 py-1">
                        One-tap resume
                      </span>
                      {isDashboardLayout ? (
                        <span className="border border-border.06] bg-foreground/[0.04] rounded-full px-3 py-1">
                          Flashcards + notes linked
                        </span>
                      ) : (
                        <>
                          <span className="border border-border.06] bg-foreground/[0.04] rounded-full px-3 py-1">
                            Notes + review linked
                          </span>
                          <span className="border border-border.06] bg-foreground/[0.04] rounded-full px-3 py-1">
                            Ready for quiz or focus
                          </span>
                        </>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/80">
                      Continue source
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
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
                    className="group flex items-start gap-4 rounded-2xl border border-border.06] bg-foreground/[0.03] p-4 text-left transition-colors hover:bg-foreground/[0.06] hover:border-border"
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                        appearance.accent,
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "px-3 py-0.5 text-[11px] font-medium uppercase tracking-wider",
                            appearance.badge,
                          )}
                        >
                          {appearance.label}
                        </span>
                        <span className="rounded-full border border-border.06] bg-foreground/[0.04] px-3 py-0.5 text-[11px] font-medium uppercase tracking-wider text-foreground/40">
                          {new Date(
                            material._creationTime,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="mt-2 line-clamp-1 text-base font-medium tracking-tight text-foreground/90">
                        {material.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-foreground/50">
                        Jump back into review, notes, or practice without
                        breaking flow.
                      </p>
                    </div>

                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-foreground/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-foreground/70" />
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </section>
  );
}
