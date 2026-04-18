import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { COUNTRIES } from "@/lib/countryConfig";
import {
  SuggestedStudentsPanel,
  StudyShareRail,
} from "@/components/study/StudySocialSurfaces";
import { SchoolLeaderboards } from "@/components/school/SchoolLeaderboards";
import {
  Compass,
  MessageSquarePlus,
  Globe2,
  Lock,
  Megaphone,
  PartyPopper,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";

const FEED_TABS = [
  { id: "school", label: "My School" },
  { id: "curriculum", label: "My Curriculum" },
  { id: "following", label: "Following" },
] as const;

function getSchoolName(user: any) {
  const country = user?.country ? COUNTRIES[user.country] : null;
  return (
    country?.schools.find((school) => school.id === user?.schoolId)?.name ||
    user?.schoolId ||
    "Independent learner"
  );
}

export default function SchoolDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedClassSection, setSelectedClassSection] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof FEED_TABS)[number]["id"]>(
    "school",
  );
  const [pendingFollowUserId, setPendingFollowUserId] = useState<string | null>(
    null,
  );

  const schoolFeed = useQuery(
    api.social.getSchoolFeed,
    user
      ? {
          scope: activeTab,
          limit: 12,
        }
      : "skip",
  );
  const suggestedSchoolmates = useQuery(
    api.social.getSuggestedSchoolmates,
    user ? { limit: 6 } : "skip",
  );
  const dashboardRails = useQuery(
    api.social.getDashboardRails,
    user ? { limit: 4 } : "skip",
  );
  const schoolBoardFeed = useQuery(
    api.social.getSchoolBoardFeed,
    user ? { activityLimit: 8, limit: 8 } : "skip",
  );
  const leaderboardSnapshot = useQuery(
    api.school.getSchoolLeaderboards,
    user?.schoolId ? { limit: 50 } : "skip",
  );
  const toggleFollowUser = useMutation(api.social.toggleFollowUser);
  const createSchoolBoardPost = useMutation(api.social.createSchoolBoardPost);

  const countryConfig = user?.country ? COUNTRIES[user.country] : null;
  const schoolName = getSchoolName(user);
  const isNetworkEnabled = user?.schoolNetworkOptIn && user?.schoolId;
  const [boardDraft, setBoardDraft] = useState("");
  const [boardAudience, setBoardAudience] = useState<"school" | "class">(
    "school",
  );
  const [boardPostType, setBoardPostType] = useState<
    "update" | "check_in" | "question" | "celebration" | "accountability"
  >("accountability");
  const [isPostingToBoard, setIsPostingToBoard] = useState(false);

  const feedHeadline = useMemo(() => {
    if (activeTab === "school") return `Shared at ${schoolName}`;
    if (activeTab === "curriculum") return "Curriculum-aligned study assets";
    return "Shared by people you follow";
  }, [activeTab, schoolName]);

  const handleToggleFollow = async (userId: string) => {
    setPendingFollowUserId(userId);
    try {
      await toggleFollowUser({ targetUserId: userId as any });
    } catch (error) {
      console.error(error);
      toast.error("Could not update follow state.");
    } finally {
      setPendingFollowUserId(null);
    }
  };

  const handleCreateBoardPost = async () => {
    const content = boardDraft.trim();
    if (!content) {
      toast.error("Write a quick school board update first.");
      return;
    }

    setIsPostingToBoard(true);
    try {
      await createSchoolBoardPost({
        audience: boardAudience,
        content,
        postType: boardPostType,
        title:
          boardPostType === "celebration"
            ? "New achievement"
            : boardPostType === "question"
              ? "Study question"
              : "School hub update",
      });
      setBoardDraft("");
      toast.success("Posted to the school board.");
    } catch (error) {
      console.error(error);
      toast.error("Could not post to the school board.");
    } finally {
      setIsPostingToBoard(false);
    }
  };

  return (
    <div className="study-dashboard-shell text-foreground relative min-h-full overflow-x-hidden px-4 pb-10 pt-6 md:px-8 xl:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-background/50 dark:bg-[#07031c]/50" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:url('/noise.svg')]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1500px] space-y-6">
        <section className="deepshi-panel rounded-[32px] border border-border bg-card/40 p-6 md:p-8 backdrop-blur-xl shadow-sm">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_320px]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <School className="h-3.5 w-3.5" />
                School Social Hub
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-foreground md:text-5xl">
                Discover what your school is actually studying.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground/80 md:text-base">
                Cryonex keeps the social layer centered on useful study assets. Follow classmates, browse curriculum-aligned notes, and surface the best public or school-visible packs without turning the app into a noisy feed.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {FEED_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "border-primary/20 bg-primary text-primary-foreground"
                        : "border-border bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08]",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <aside className="space-y-3">
              {[
                ["Country", countryConfig?.name || "Global"],
                ["School", schoolName],
                [
                  "Visibility",
                  user?.profileVisibility || dashboardRails?.personalization?.profileVisibility || "private",
                ],
                [
                  "Network",
                  isNetworkEnabled ? "Enabled" : "Private until opt-in",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-border bg-foreground/[0.03] px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground/90">{value}</p>
                </div>
              ))}
            </aside>
          </div>
        </section>

        {!isNetworkEnabled ? (
          <section className="deepshi-panel rounded-[28px] border border-border bg-card/40 p-5 backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" />
                  Privacy first
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  Your school network is still private
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground/80">
                  You can still use Cryonex normally, but schoolmate discovery and school-visible feeds remain hidden until you opt into the school network during personalization.
                </p>
              </div>
              <Button
                type="button"
                onClick={() => navigate("/study/dashboard")}
                className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Compass className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_360px]">
          <div className="space-y-6">
            <section className="deepshi-panel rounded-[28px] border border-border bg-card/40 p-5 backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    <Megaphone className="h-3.5 w-3.5" />
                    School board
                  </div>
                  <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                    What students are doing and achieving right now
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground/80">
                    School Hub now blends posts with accountability events, so the board shows both what people say and what they actually finish.
                  </p>
                </div>
                <div className="rounded-[22px] border border-border bg-foreground/[0.03] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
                    Feed items
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {schoolBoardFeed?.items?.length || 0}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <div className="rounded-[24px] border border-border bg-foreground/[0.03] p-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "school", label: "Whole school" },
                      { id: "class", label: "My class" },
                    ].map((option) => (
                      <Button
                        key={option.id}
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setBoardAudience(option.id as "school" | "class")
                        }
                        className={cn(
                          "rounded-full border px-4 text-sm",
                          boardAudience === option.id
                            ? "border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08]",
                        )}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      ["accountability", "Check-in"],
                      ["celebration", "Achievement"],
                      ["question", "Question"],
                      ["update", "Update"],
                    ].map(([id, label]) => (
                      <Button
                        key={id}
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          setBoardPostType(
                            id as
                              | "update"
                              | "check_in"
                              | "question"
                              | "celebration"
                              | "accountability",
                          )
                        }
                        className={cn(
                          "rounded-full border px-4 text-sm",
                          boardPostType === id
                            ? "border-white/20 bg-white text-black hover:bg-white/92"
                            : "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
                        )}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>

                  <Textarea
                    value={boardDraft}
                    onChange={(event) => setBoardDraft(event.target.value)}
                    placeholder="Post a progress update, ask a study question, or share an achievement with School Hub."
                    className="mt-4 min-h-[140px] rounded-[20px] border-border bg-background/70 text-foreground placeholder:text-muted-foreground/40"
                  />

                  <Button
                    type="button"
                    onClick={handleCreateBoardPost}
                    disabled={isPostingToBoard}
                    className="mt-4 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <MessageSquarePlus className="mr-2 h-4 w-4" />
                    {isPostingToBoard ? "Posting..." : "Post to School Hub"}
                  </Button>
                </div>

                <div className="space-y-3">
                  {(schoolBoardFeed?.items || []).length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-border bg-foreground/[0.02] px-5 py-8 text-sm text-muted-foreground/70">
                      No school board activity yet. The first useful check-in can set the tone here.
                    </div>
                  ) : (
                    (schoolBoardFeed?.items || []).map((item: any) => (
                      <article
                        key={`${item.kind}-${item._id}`}
                        className="rounded-[24px] border border-border bg-card/60 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="rounded-full bg-foreground/[0.06] text-foreground">
                            {item.kind === "activity" ? "Activity" : "Post"}
                          </Badge>
                          {item.postType ? (
                            <Badge variant="secondary" className="rounded-full bg-foreground/[0.06] text-foreground">
                              {item.postType}
                            </Badge>
                          ) : null}
                          {item.eventType === "study_session_completed" ? (
                            <Badge variant="secondary" className="rounded-full bg-emerald-500/10 text-emerald-400">
                              <PartyPopper className="mr-1 h-3 w-3" />
                              Completed
                            </Badge>
                          ) : null}
                          {item.eventType === "study_session_quit_early" ? (
                            <Badge variant="secondary" className="rounded-full bg-rose-500/10 text-rose-400">
                              Quit early
                            </Badge>
                          ) : null}
                        </div>

                        <div className="mt-3">
                          <p className="text-sm font-semibold text-foreground">
                            {item.authorName || "Student"}
                          </p>
                          <p className="mt-1 text-base font-medium text-foreground/90">
                            {item.title || "School update"}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground/80">
                            {item.content || item.description || "No additional details."}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground/60">
                          <span>{item.classLabel || item.audience || "School"}</span>
                          <span>•</span>
                          <span>
                            {new Date(item.sortAt || item.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </div>
            </section>

            <SchoolLeaderboards
              schoolName={leaderboardSnapshot?.schoolName || schoolName}
              boards={leaderboardSnapshot?.boards || []}
              classSections={leaderboardSnapshot?.classSections || []}
              selectedClassSection={selectedClassSection || undefined}
              onClassSectionChange={setSelectedClassSection}
            />

            <StudyShareRail
              eyebrow={activeTab === "school" ? "School feed" : activeTab === "curriculum" ? "Curriculum feed" : "Following feed"}
              title={feedHeadline}
              description="Only study assets are shown here in v1: notes, study packs, and shared source materials."
              items={schoolFeed || []}
              emptyMessage={
                activeTab === "following"
                  ? "Follow a few classmates to personalize this lane."
                  : "No study assets have been shared in this lane yet."
              }
            />

            <StudyShareRail
              eyebrow="Regional"
              title="Localized momentum"
              description="Public assets trending in your country or region keep the school hub grounded in real local study patterns."
              items={dashboardRails?.trendingRegional || []}
              emptyMessage="No regional public assets yet."
            />
          </div>

          <aside className="space-y-6">
            <SuggestedStudentsPanel
              students={suggestedSchoolmates || []}
              onToggleFollow={handleToggleFollow}
              pendingUserId={pendingFollowUserId}
            />

            <section className="deepshi-panel rounded-[28px] border border-border bg-card/40 p-5 backdrop-blur-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                Share flow
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground">
                Publish from real study work
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground/80">
                v1 social is intentionally lightweight. Share notes or materials when they are useful, choose `school` or `public` visibility, and let the feed stay asset-first.
              </p>
              <div className="mt-5 flex gap-2">
                <Button
                  type="button"
                  onClick={() => navigate("/library")}
                  className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Open Library
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/study/dashboard")}
                  className="rounded-full border border-border bg-foreground/[0.04] text-foreground hover:bg-foreground/[0.08]"
                >
                  <Globe2 className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
