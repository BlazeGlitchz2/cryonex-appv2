import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Globe,
  Mic,
  Play,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

interface StudyRecentUploadsProps {
  recentMaterials: any[] | undefined;
  setIsUploadOpen: (open: boolean) => void;
  searchQuery?: string;
}

function getMaterialAppearance(type: string) {
  switch (type) {
    case "pdf":
      return {
        icon: BookOpen,
        accent: "border-rose-400/20 bg-rose-400/10 text-rose-200",
        label: "Document",
      };
    case "video":
    case "youtube":
      return {
        icon: Play,
        accent: "border-blue-400/20 bg-blue-400/10 text-blue-200",
        label: "Video",
      };
    case "audio":
      return {
        icon: Mic,
        accent: "border-amber-400/20 bg-amber-400/10 text-amber-200",
        label: "Audio",
      };
    default:
      return {
        icon: Globe,
        accent: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
        label: "Web",
      };
  }
}

export function StudyRecentUploads({
  recentMaterials,
  setIsUploadOpen,
  searchQuery = "",
}: StudyRecentUploadsProps) {
  const navigate = useNavigate();
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

  return (
    <motion.section
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
      className="dashboard-surface rounded-[2rem] p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/75">
            Recently captured
          </p>
          <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-[-0.04em] text-white">
            <Trophy className="h-5 w-5 text-cyan-200" />
            Recent materials
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/library")}
          className="rounded-full px-0 text-sm font-medium text-white/62 hover:bg-transparent hover:text-white"
        >
          Open library
        </Button>
      </div>

      {visibleMaterials.length === 0 ? (
        <div className="mt-5 rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.03] px-5 py-10 text-center">
          <p className="text-lg font-semibold tracking-[-0.03em] text-white">No recent material yet</p>
          <p className="mt-2 max-w-md mx-auto text-sm leading-6 text-white/55">{emptyMessage}</p>
          {!normalizedQuery && (
            <Button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="mt-5 rounded-full bg-[linear-gradient(135deg,#22d3ee,#0f766e)] px-5 text-slate-950 hover:opacity-95"
            >
              Upload your first source
            </Button>
          )}
        </div>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {visibleMaterials.map((material) => {
            const appearance = getMaterialAppearance(material.type);
            const Icon = appearance.icon;

            return (
              <button
                key={material._id}
                type="button"
                onClick={() => navigate(`/study/${material._id}`)}
                className="dashboard-subtle-panel group flex items-start gap-4 rounded-[1.6rem] p-4 text-left transition-transform duration-300 hover:-translate-y-1"
              >
                <div
                  className={cn(
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border",
                    appearance.accent,
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/38">
                      {appearance.label}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/6 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/42">
                      {new Date(material._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-white">
                    {material.title}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-white/55">
                    Open this material and continue from where you left off.
                  </p>
                </div>

                <ArrowRight className="mt-1 h-4.5 w-4.5 shrink-0 text-white/35 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white/70" />
              </button>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}
