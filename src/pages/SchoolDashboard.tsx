import { useEffect, useMemo, useState } from "react";
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
  BookOpen,
  CalendarClock,
  Gauge,
  MessageSquarePlus,
  Globe2,
  Languages,
  Lock,
  Megaphone,
  PartyPopper,
  School,
  ShieldCheck,
  SlidersHorizontal,
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

const STUDY_PACES = [
  { id: "light", label: "Light", helper: "Short, low-pressure review" },
  {
    id: "balanced",
    label: "Balanced",
    helper: "Mix recall, notes, and quizzes",
  },
  {
    id: "intensive",
    label: "Intensive",
    helper: "Exam sprint with tighter loops",
  },
] as const;

const LEARNING_MODES = [
  { id: "visual", label: "Visual", helper: "Diagrams and maps first" },
  { id: "text", label: "Text", helper: "Summaries and notes first" },
  {
    id: "interactive",
    label: "Interactive",
    helper: "Quizzes and practice first",
  },
  { id: "auditory", label: "Auditory", helper: "Voice and explanation first" },
] as const;

const FOCUS_TIMES = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "night", label: "Night" },
] as const;

const LOAD_LEVELS = [
  { id: "light", label: "Light load" },
  { id: "standard", label: "Standard load" },
  { id: "intensive", label: "High load" },
] as const;

const VISIBILITY_OPTIONS = [
  { id: "private", label: "Private" },
  { id: "school", label: "School" },
  { id: "public", label: "Public" },
] as const;

type StudyPace = (typeof STUDY_PACES)[number]["id"];
type LearningMode = (typeof LEARNING_MODES)[number]["id"];
type FocusTime = (typeof FOCUS_TIMES)[number]["id"];
type LoadLevel = (typeof LOAD_LEVELS)[number]["id"];
type ProfileVisibility = (typeof VISIBILITY_OPTIONS)[number]["id"];

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
  const [activeTab, setActiveTab] =
    useState<(typeof FEED_TABS)[number]["id"]>("school");
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
  const updateProfile = useMutation(api.users.updateProfile);

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
  const [quickPace, setQuickPace] = useState<StudyPace>("balanced");
  const [quickMode, setQuickMode] = useState<LearningMode>("interactive");
  const [quickFocusTime, setQuickFocusTime] = useState<FocusTime>("afternoon");
  const [quickLoad, setQuickLoad] = useState<LoadLevel>("standard");
  const [quickLanguage, setQuickLanguage] = useState<"en" | "ar">("en");
  const [quickNetworkOptIn, setQuickNetworkOptIn] = useState(false);
  const [quickVisibility, setQuickVisibility] =
    useState<ProfileVisibility>("private");
  const [isSavingPersonalization, setIsSavingPersonalization] = useState(false);

  useEffect(() => {
    if (!user) return;
    setQuickPace((user.studyPace || "balanced") as StudyPace);
    setQuickMode((user.preferredLearningMode || "interactive") as LearningMode);
    setQuickFocusTime((user.peakFocusTime || "afternoon") as FocusTime);
    setQuickLoad((user.cognitiveLoadCapacity || "standard") as LoadLevel);
    setQuickLanguage(
      (user.preferredLanguage || (user.isRTL ? "ar" : "en")) as "en" | "ar",
    );
    setQuickNetworkOptIn(Boolean(user.schoolNetworkOptIn && user.schoolId));
    setQuickVisibility(
      (user.profileVisibility || "private") as ProfileVisibility,
    );
  }, [user]);

  const feedHeadline = useMemo(() => {
    if (activeTab === "school") return `Shared at ${schoolName}`;
    if (activeTab === "curriculum") return "Curriculum-aligned study assets";
    return "Shared by people you follow";
  }, [activeTab, schoolName]);

  const paceLabel =
    STUDY_PACES.find((pace) => pace.id === quickPace)?.label || "Balanced";
  const modeLabel =
    LEARNING_MODES.find((mode) => mode.id === quickMode)?.label ||
    "Interactive";
  const subjectFocus =
    user?.targetSubjects?.length > 0
      ? user.targetSubjects.slice(0, 3).join(", ")
      : user?.curriculumTrack || user?.curriculum || "General study";
  const adaptationSummary = `${paceLabel} pace, ${modeLabel.toLowerCase()} first, ${quickFocusTime} focus`;

  const handleApplyPreset = (preset: "exam" | "lighter" | "visual") => {
    if (preset === "exam") {
      setQuickPace("intensive");
      setQuickMode("interactive");
      setQuickLoad("intensive");
      return;
    }

    if (preset === "lighter") {
      setQuickPace("light");
      setQuickMode("text");
      setQuickLoad("light");
      return;
    }

    setQuickPace("balanced");
    setQuickMode("visual");
    setQuickLoad("standard");
  };

  const handleSavePersonalization = async () => {
    if (!user) return;

    const nextNetworkOptIn = Boolean(user.schoolId && quickNetworkOptIn);
    setIsSavingPersonalization(true);
    try {
      await updateProfile({
        studyPace: quickPace,
        preferredLanguage: quickLanguage,
        preferredLearningMode: quickMode,
        peakFocusTime: quickFocusTime,
        cognitiveLoadCapacity: quickLoad,
        schoolNetworkOptIn: nextNetworkOptIn,
        discoverableInSchool: nextNetworkOptIn,
        profileVisibility: nextNetworkOptIn ? quickVisibility : "private",
      });
      toast.success("School Hub personalization saved.");
    } catch (error) {
      console.error(error);
      toast.error("Could not save personalization.");
    } finally {
      setIsSavingPersonalization(false);
    }
  };

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
                Cryonex keeps the social layer centered on useful study assets.
                Follow classmates, browse curriculum-aligned notes, and surface
                the best public or school-visible packs without turning the app
                into a noisy feed.
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
                  user?.profileVisibility ||
                    dashboardRails?.personalization?.profileVisibility ||
                    "private",
                ],
                [
                  "Network",
                  isNetworkEnabled ? "Enabled" : "Private until opt-in",
                ],
                ["Study pace", paceLabel],
                ["Adaptation", modeLabel],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[22px] border border-border bg-foreground/[0.03] px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground/90">
                    {value}
                  </p>
                </div>
              ))}
            </aside>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            {
              icon: SlidersHorizontal,
              label: "Adaptive lane",
              value: adaptationSummary,
              helper:
                "Feeds and prompts bias toward your current study profile.",
            },
            {
              icon: BookOpen,
              label: "Focus subjects",
              value: subjectFocus,
              helper:
                "School Hub keeps curriculum and shared assets closer to your goals.",
            },
            {
              icon: ShieldCheck,
              label: "Network posture",
              value: isNetworkEnabled ? quickVisibility : "Private",
              helper: isNetworkEnabled
                ? "Discovery is enabled with your selected visibility."
                : "Schoolmate discovery stays off until you opt in.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="deepshi-panel rounded-[24px] border border-border bg-card/40 p-4 backdrop-blur-xl"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-border bg-foreground/[0.04] text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                    {item.label}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-foreground">
                    {item.value}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground/70">
                    {item.helper}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
                  You can still use Cryonex normally, but schoolmate discovery
                  and school-visible feeds remain hidden until you opt into the
                  school network during personalization.
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
                    School Hub now blends posts with accountability events, so
                    the board shows both what people say and what they actually
                    finish.
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
                      No school board activity yet. The first useful check-in
                      can set the tone here.
                    </div>
                  ) : (
                    (schoolBoardFeed?.items || []).map((item: any) => (
                      <article
                        key={`${item.kind}-${item._id}`}
                        className="rounded-[24px] border border-border bg-card/60 p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="rounded-full bg-foreground/[0.06] text-foreground"
                          >
                            {item.kind === "activity" ? "Activity" : "Post"}
                          </Badge>
                          {item.postType ? (
                            <Badge
                              variant="secondary"
                              className="rounded-full bg-foreground/[0.06] text-foreground"
                            >
                              {item.postType}
                            </Badge>
                          ) : null}
                          {item.eventType === "study_session_completed" ? (
                            <Badge
                              variant="secondary"
                              className="rounded-full bg-emerald-500/10 text-emerald-400"
                            >
                              <PartyPopper className="mr-1 h-3 w-3" />
                              Completed
                            </Badge>
                          ) : null}
                          {item.eventType === "study_session_quit_early" ? (
                            <Badge
                              variant="secondary"
                              className="rounded-full bg-rose-500/10 text-rose-400"
                            >
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
                            {item.content ||
                              item.description ||
                              "No additional details."}
                          </p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground/60">
                          <span>
                            {item.classLabel || item.audience || "School"}
                          </span>
                          <span>•</span>
                          <span>
                            {new Date(
                              item.sortAt || item.createdAt,
                            ).toLocaleString()}
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
              eyebrow={
                activeTab === "school"
                  ? "School feed"
                  : activeTab === "curriculum"
                    ? "Curriculum feed"
                    : "Following feed"
              }
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
            <section className="deepshi-panel rounded-[28px] border border-border bg-card/40 p-5 backdrop-blur-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Personalization
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-foreground">
                Tune your school feed
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground/80">
                These controls adjust how Cryonex adapts study prompts, shared
                assets, and school discovery around your current workload.
              </p>

              <div className="mt-5 grid gap-2">
                {[
                  { id: "exam", label: "Exam sprint" },
                  { id: "lighter", label: "Lighter week" },
                  { id: "visual", label: "Visual recall" },
                ].map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      handleApplyPreset(
                        preset.id as "exam" | "lighter" | "visual",
                      )
                    }
                    className="justify-start rounded-2xl border border-border bg-foreground/[0.03] text-foreground hover:bg-foreground/[0.07]"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
                    <Gauge className="h-3.5 w-3.5" />
                    Pace
                  </div>
                  <div className="grid gap-2">
                    {STUDY_PACES.map((pace) => (
                      <button
                        key={pace.id}
                        type="button"
                        onClick={() => setQuickPace(pace.id)}
                        className={cn(
                          "rounded-2xl border px-3 py-2 text-left transition",
                          quickPace === pace.id
                            ? "border-primary/30 bg-primary/10 text-foreground"
                            : "border-border bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.06]",
                        )}
                      >
                        <span className="block text-sm font-semibold">
                          {pace.label}
                        </span>
                        <span className="mt-0.5 block text-xs opacity-70">
                          {pace.helper}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
                    <BookOpen className="h-3.5 w-3.5" />
                    Learning mode
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {LEARNING_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setQuickMode(mode.id)}
                        className={cn(
                          "min-h-[72px] rounded-2xl border px-3 py-2 text-left transition",
                          quickMode === mode.id
                            ? "border-primary/30 bg-primary/10 text-foreground"
                            : "border-border bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.06]",
                        )}
                      >
                        <span className="block text-sm font-semibold">
                          {mode.label}
                        </span>
                        <span className="mt-1 block text-[11px] leading-4 opacity-70">
                          {mode.helper}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Focus time
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {FOCUS_TIMES.map((time) => (
                        <Button
                          key={time.id}
                          type="button"
                          variant="ghost"
                          onClick={() => setQuickFocusTime(time.id)}
                          className={cn(
                            "rounded-full border px-3 text-xs",
                            quickFocusTime === time.id
                              ? "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90"
                              : "border-border bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.07]",
                          )}
                        >
                          {time.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
                      <Languages className="h-3.5 w-3.5" />
                      Language
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "en", label: "English" },
                        { id: "ar", label: "Arabic" },
                      ].map((language) => (
                        <Button
                          key={language.id}
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setQuickLanguage(language.id as "en" | "ar")
                          }
                          className={cn(
                            "rounded-full border px-3 text-xs",
                            quickLanguage === language.id
                              ? "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90"
                              : "border-border bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.07]",
                          )}
                        >
                          {language.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
                    <Gauge className="h-3.5 w-3.5" />
                    Cognitive load
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {LOAD_LEVELS.map((load) => (
                      <Button
                        key={load.id}
                        type="button"
                        variant="ghost"
                        onClick={() => setQuickLoad(load.id)}
                        className={cn(
                          "rounded-full border px-3 text-xs",
                          quickLoad === load.id
                            ? "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.07]",
                        )}
                      >
                        {load.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-border bg-foreground/[0.03] p-4">
                  <button
                    type="button"
                    onClick={() => setQuickNetworkOptIn((value) => !value)}
                    disabled={!user?.schoolId}
                    className="flex w-full items-start justify-between gap-3 text-left disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        School discovery
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground/70">
                        Let classmates find your profile and school-visible
                        shared assets.
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-1 h-6 w-11 rounded-full border p-0.5 transition",
                        quickNetworkOptIn
                          ? "border-primary/30 bg-primary"
                          : "border-border bg-foreground/[0.08]",
                      )}
                    >
                      <span
                        className={cn(
                          "block h-5 w-5 rounded-full bg-white transition",
                          quickNetworkOptIn && "translate-x-5",
                        )}
                      />
                    </span>
                  </button>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {VISIBILITY_OPTIONS.map((option) => (
                      <Button
                        key={option.id}
                        type="button"
                        variant="ghost"
                        disabled={!quickNetworkOptIn}
                        onClick={() => setQuickVisibility(option.id)}
                        className={cn(
                          "rounded-full border px-3 text-xs",
                          quickVisibility === option.id && quickNetworkOptIn
                            ? "border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90"
                            : "border-border bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.07]",
                        )}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSavePersonalization}
                disabled={isSavingPersonalization}
                className="mt-5 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSavingPersonalization ? "Saving..." : "Save adaptation"}
              </Button>
            </section>

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
                v1 social is intentionally lightweight. Share notes or materials
                when they are useful, choose `school` or `public` visibility,
                and let the feed stay asset-first.
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
