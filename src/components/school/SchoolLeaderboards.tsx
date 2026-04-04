import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Clock3,
  Filter,
  Medal,
  Target,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router";

type BoardTimeframe = "all-time" | "weekly" | "daily";
type BoardView = "overall" | "class" | "individual";

function formatStudyMinutes(studyMinutes?: number) {
  const minutes = Math.round(studyMinutes || 0);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

export function SchoolLeaderboards({
  schoolName,
  boards,
  classSections,
  selectedClassSection,
  onClassSectionChange,
}: {
  schoolName: string;
  boards: any[];
  classSections: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  selectedClassSection?: string;
  onClassSectionChange?: (value: string) => void;
}) {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<BoardTimeframe>("all-time");
  const [view, setView] = useState<BoardView>("overall");

  const activeBoard = useMemo(
    () =>
      boards.find(
        (board) => board.timeframe === timeframe && board.view === view,
      ) || null,
    [boards, timeframe, view],
  );

  const visibleEntries = useMemo(() => {
    if (!activeBoard?.entries) return [];
    if (!selectedClassSection) return activeBoard.entries;

    return activeBoard.entries.filter(
      (entry: any) => entry.classSection === selectedClassSection,
    );
  }, [activeBoard, selectedClassSection]);

  return (
    <section className="deepshi-panel rounded-[28px] border border-border bg-card/40 p-5 backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <Medal className="h-3.5 w-3.5" />
            {schoolName} leaderboards
          </div>
          <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Daily, weekly, and all-time school performance
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground/80">
            Rankings combine study packs created, total study time, and quiz
            questions answered correctly. Switch between school-wide, class, and
            individual lanes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { id: "all-time", label: "All time" },
            { id: "weekly", label: "Weekly" },
            { id: "daily", label: "Daily" },
          ].map((option) => (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              onClick={() => setTimeframe(option.id as BoardTimeframe)}
              className={cn(
                "rounded-full border px-4 text-sm",
                timeframe === option.id
                  ? "border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08]",
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {[
          { id: "overall", label: "Overall", icon: Trophy },
          { id: "class", label: "Class performance", icon: Users },
          { id: "individual", label: "Individual performance", icon: UserRound },
        ].map((option) => (
          <Button
            key={option.id}
            type="button"
            variant="ghost"
            onClick={() => setView(option.id as BoardView)}
            className={cn(
              "rounded-full border px-4 text-sm",
              view === option.id
                ? "border-white/20 bg-white text-black hover:bg-white/92"
                : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
            )}
          >
            <option.icon className="mr-2 h-4 w-4" />
            {option.label}
          </Button>
        ))}
      </div>

      {classSections.length > 0 ? (
        <div className="mt-4 rounded-[24px] border border-border bg-foreground/[0.03] p-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            Section filter
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onClassSectionChange?.("")}
              className={cn(
                "rounded-full border px-4 text-sm",
                !selectedClassSection
                  ? "border-white/20 bg-white text-black hover:bg-white/92"
                  : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
              )}
            >
              All sections
            </Button>
            {classSections.map((section) => (
              <Button
                key={section.id}
                type="button"
                variant="ghost"
                onClick={() => onClassSectionChange?.(section.id)}
                className={cn(
                  "rounded-full border px-4 text-sm",
                  selectedClassSection === section.id
                    ? "border-white/20 bg-white text-black hover:bg-white/92"
                    : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
                )}
              >
                Section {section.label}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        {activeBoard ? (
          <>
            <h4 className="text-lg font-semibold text-foreground">
              {activeBoard.title}
            </h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground/80">
              {activeBoard.description}
            </p>
          </>
        ) : null}
      </div>

      <div className="mt-5 space-y-3">
        {visibleEntries.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.025] px-5 py-8 text-sm text-white/55">
            No leaderboard entries match the current filters yet.
          </div>
        ) : (
          visibleEntries.map((entry: any) => (
            <div
              key={`${activeBoard?.timeframe}-${activeBoard?.view}-${entry.userId}`}
              className="rounded-[24px] border border-border bg-card/40 p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-foreground/[0.05] text-sm font-semibold text-foreground">
                  #{entry.rank}
                </div>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    disabled={!entry.profilePath}
                    onClick={() => entry.profilePath && navigate(entry.profilePath)}
                    className={cn(
                      "truncate text-left text-sm font-semibold text-foreground",
                      entry.profilePath && "hover:text-primary",
                    )}
                  >
                    {entry.name}
                  </button>
                  <p className="truncate text-xs text-muted-foreground/60">
                    {entry.classSection
                      ? `${entry.gradeLevel || "Student"} • Section ${entry.classSection}`
                      : entry.gradeLevel || entry.schoolName || "School"}
                  </p>
                </div>

                <div className="grid min-w-[300px] flex-1 gap-2 sm:grid-cols-4">
                  {[
                    {
                      label: "Overall",
                      value: `${entry.scores?.overall || 0}/100`,
                      icon: Trophy,
                    },
                    {
                      label: "Packs",
                      value: `${entry.metrics?.studyPacksCreated || 0}`,
                      icon: BookOpen,
                    },
                    {
                      label: "Time",
                      value: formatStudyMinutes(entry.metrics?.studyMinutes || 0),
                      icon: Clock3,
                    },
                    {
                      label: "Quiz right",
                      value: `${entry.metrics?.quizQuestionsCorrect || 0}`,
                      icon: Target,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-border bg-foreground/[0.03] px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground/60">
                        <span>{item.label}</span>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="mt-2 text-sm font-semibold text-foreground">
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
