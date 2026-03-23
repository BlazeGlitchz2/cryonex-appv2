import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Globe2, Lock, School, UserPlus, Users } from "lucide-react";

export function visibilityLabel(visibility?: string) {
  if (visibility === "school") return "School";
  if (visibility === "public") return "Public";
  return "Private";
}

export function StudyShareRail({
  title,
  eyebrow,
  description,
  items,
  emptyMessage,
  className,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  items: any[];
  emptyMessage: string;
  className?: string;
}) {
  return (
    <section className={cn("deepshi-panel rounded-[28px] border border-white/10 p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
            <Globe2 className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] px-5 py-8 text-sm text-white/55">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {items.map((item) => (
            <article
              key={item._id || item.shareId || item.title}
              className="min-w-[270px] max-w-[320px] shrink-0 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_20px_50px_rgba(4,2,18,0.28)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                  {item.visibility === "school" ? (
                    <School className="h-3.5 w-3.5" />
                  ) : item.visibility === "public" ? (
                    <Globe2 className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {visibilityLabel(item.visibility)}
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                  {item.curriculumTag || item.contentType || "Study asset"}
                </span>
              </div>

              <div className="mt-5 rounded-[22px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(120,117,255,0.18),transparent_58%),rgba(10,6,37,0.8)] p-4">
                <h4 className="text-lg font-semibold tracking-[-0.03em] text-white">
                  {item.title}
                </h4>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/58">
                  {item.description || "Shared study material from your network."}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/88">
                    {item.authorName || "Cryonex student"}
                  </p>
                  <p className="truncate text-xs text-white/40">
                    {item.schoolId || item.region || "Localized"}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/42">
                  Explore
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function SuggestedStudentsPanel({
  students,
  onToggleFollow,
  pendingUserId,
  className,
}: {
  students: any[];
  onToggleFollow?: (userId: string) => void;
  pendingUserId?: string | null;
  className?: string;
}) {
  return (
    <section className={cn("deepshi-panel rounded-[28px] border border-white/10 p-5", className)}>
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
        <Users className="h-3.5 w-3.5" />
        Schoolmates
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
        People worth following
      </h3>
      <p className="mt-2 text-sm leading-6 text-white/55">
        Discover classmates and creators from your school who are sharing useful notes and study packs.
      </p>

      <div className="mt-5 space-y-3">
        {students.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-white/10 bg-white/[0.025] px-4 py-6 text-sm text-white/55">
            No schoolmate suggestions yet. Once more students opt in and share assets, they will appear here.
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student._id}
              className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.035] p-3"
            >
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-sm font-semibold text-white/80">
                {student.image ? (
                  <img
                    src={student.image}
                    alt={student.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  student.name?.slice(0, 2)?.toUpperCase() || "ST"
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {student.name}
                </p>
                <p className="truncate text-xs text-white/45">
                  {student.gradeLevel || "Student"} • {student.curriculumTrack || "General"}
                </p>
                <p className="text-[11px] text-white/35">
                  {student.publicSharesCount || 0} shared study assets
                </p>
              </div>

              {onToggleFollow ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onToggleFollow(student._id)}
                  disabled={pendingUserId === student._id}
                  className={cn(
                    "rounded-full px-4 text-xs font-semibold",
                    student.isFollowing
                      ? "bg-white/10 text-white hover:bg-white/14"
                      : "bg-white text-black hover:bg-white/92",
                  )}
                >
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  {student.isFollowing ? "Following" : "Follow"}
                </Button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
