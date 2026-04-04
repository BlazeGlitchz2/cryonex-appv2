import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Globe2,
  Lock,
  School,
  UserPlus,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";

export function visibilityLabel(visibility?: string) {
  if (visibility === "school") return "School";
  if (visibility === "public") return "Public";
  return "Private";
}

function getShareItemKey(item: any, index: number) {
  if (item._id) return String(item._id);
  if (item.shareId) return `share:${item.shareId}`;

  const compositeKey = [
    item.targetUrl,
    item.title,
    item.authorId,
    item.authorName,
    item.schoolId,
    item.region,
    item.visibility,
    item.contentType,
  ]
    .filter(Boolean)
    .join("::");

  return compositeKey || `study-share-item:${index}`;
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
  const navigate = useNavigate();

  return (
    <section
      className={cn(
        "deepshi-panel rounded-[28px] border border-border bg-card/40 p-5 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <Globe2 className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground/80">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-5 rounded-[24px] border border-dashed border-border bg-foreground/[0.025] px-5 py-8 text-sm text-muted-foreground/80">
          {emptyMessage}
        </div>
      ) : (
        <div className="mt-5 flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {items.map((item, index) => (
            <button
              key={getShareItemKey(item, index)}
              type="button"
              onClick={() => {
                if (item.targetUrl) {
                  navigate(item.targetUrl);
                }
              }}
              className={cn(
                "min-w-[270px] max-w-[320px] shrink-0 rounded-[26px] border border-border bg-card/60 p-4 text-left shadow-sm transition-all duration-300",
                item.targetUrl
                  ? "hover:border-primary/30 hover:bg-card/80 hover:shadow-md"
                  : "cursor-default",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-foreground/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {item.visibility === "school" ? (
                    <School className="h-3.5 w-3.5" />
                  ) : item.visibility === "public" ? (
                    <Globe2 className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {visibilityLabel(item.visibility)}
                </span>
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
                  {item.curriculumTag || item.contentType || "Study asset"}
                </span>
              </div>

              <div className="mt-5 rounded-[22px] border border-border bg-foreground/[0.03] p-4">
                <h4 className="text-lg font-semibold tracking-[-0.03em] text-foreground">
                  {item.title}
                </h4>
                <p className="mt-2 line-clamp-4 text-sm leading-6 text-muted-foreground/80">
                  {item.description ||
                    "Shared study material from your network."}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (item.authorProfileUrl) {
                        navigate(item.authorProfileUrl);
                      }
                    }}
                    className={cn(
                      "truncate text-left text-sm font-medium text-foreground",
                      item.authorProfileUrl && "hover:text-primary",
                    )}
                  >
                    {item.authorName || "Cryonex student"}
                  </button>
                  <p className="truncate text-xs text-muted-foreground/60">
                    {item.schoolId || item.region || "Localized"}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  {item.targetUrl ? "Open" : "Explore"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
              {typeof item.flashcardsCount === "number" ||
              typeof item.quizQuestionsCount === "number" ? (
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/60">
                  {typeof item.flashcardsCount === "number" ? (
                    <span className="rounded-full border border-border bg-foreground/[0.05] px-2.5 py-1">
                      {item.flashcardsCount} cards
                    </span>
                  ) : null}
                  {typeof item.quizQuestionsCount === "number" ? (
                    <span className="rounded-full border border-border bg-foreground/[0.05] px-2.5 py-1">
                      {item.quizQuestionsCount} quiz q
                    </span>
                  ) : null}
                </div>
              ) : null}
            </button>
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
  const navigate = useNavigate();

  return (
    <section
      className={cn(
        "deepshi-panel rounded-[28px] border border-border bg-card/40 p-5 backdrop-blur-xl",
        className,
      )}
    >
      <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        Schoolmates
      </div>
      <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground">
        People worth following
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground/80">
        Discover classmates and creators from your school who are sharing useful
        notes and study packs.
      </p>

      <div className="mt-5 space-y-3">
        {students.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-border bg-foreground/[0.025] px-4 py-6 text-sm text-muted-foreground/80">
            No schoolmate suggestions yet. Once more students opt in and share
            assets, they will appear here.
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student._id}
              className="flex flex-col gap-3 rounded-[22px] border border-border/40 bg-card/40 p-4 transition-all duration-300 hover:border-border/60 hover:bg-card/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-muted/20 text-sm font-semibold text-foreground">
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
                  <p className="truncate text-sm font-semibold text-foreground">
                    {student.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground/70">
                    {student.gradeLevel || "Student"}
                    {student.classSection ? ` • Section ${student.classSection}` : ""}
                    {" • "}
                    {student.curriculumTrack || "General"}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50">
                    {student.publicSharesCount || 0} shared study assets
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                {student.profileUrl ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(student.profileUrl)}
                    className="h-8 flex-1 rounded-full border border-border/40 bg-accent/20 px-4 text-xs font-medium text-foreground hover:bg-accent/40 sm:flex-none"
                  >
                    View Profile
                  </Button>
                ) : null}

                {onToggleFollow ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onToggleFollow(student._id)}
                    disabled={pendingUserId === student._id}
                    className={cn(
                      "h-8 flex-1 rounded-full px-4 text-xs font-semibold transition-all duration-200 sm:flex-none",
                      student.isFollowing
                        ? "bg-muted/40 text-foreground hover:bg-muted/60"
                        : "bg-primary text-primary-foreground hover:opacity-90 shadow-sm",
                    )}
                  >
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    {student.isFollowing ? "Following" : "Follow"}
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
