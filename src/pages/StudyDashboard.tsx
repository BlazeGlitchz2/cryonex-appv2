import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import {
  ArrowRight,
  FileText,
  Globe2,
  Mic,
  School,
  ShieldCheck,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useStudyDashboardHandlers } from "@/hooks/use-study-dashboard-handlers";
import { StudyDashboardOverlays } from "@/components/study/StudyDashboardOverlays";
import { StudyStatsBar } from "@/components/study/StudyStatsBar";
import { StudyGuidedNextActions } from "@/components/study/StudyGuidedNextActions";
import { StudyPacksSection } from "@/components/study/StudyPacksSection";
import { StudyRecentUploads } from "@/components/study/StudyRecentUploads";
import { StudyPackComposer } from "@/components/study/StudyPackComposer";
import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { LectureRecorder } from "@/components/study/LectureRecorder";
import { LocalizedStudentBrief } from "@/components/study/LocalizedStudentBrief";
import {
  StudyShareRail,
  SuggestedStudentsPanel,
} from "@/components/study/StudySocialSurfaces";
import { Button } from "@/components/ui/button";
import { COUNTRIES } from "@/lib/countryConfig";
import { useStudyRouterStore } from "@/lib/stores/study-router-store";
import { StudyRouteCard } from "@/components/chat/StudyRouteCard";

const EMPTY_WEEK = [
  { name: "Sun", hours: 0 },
  { name: "Mon", hours: 0 },
  { name: "Tue", hours: 0 },
  { name: "Wed", hours: 0 },
  { name: "Thu", hours: 0 },
  { name: "Fri", hours: 0 },
  { name: "Sat", hours: 0 },
];

const EXAM_FILTERS = [
  "All",
  "Saudi National",
  "British/IGCSE",
  "American",
  "IB",
  "Thanaweya Amma",
];

const STUDY_PROMPT_PRESETS = [
  "Summarize my latest source into the key ideas I need to review first.",
  "Turn my recent material into flashcards with short, exam-ready answers.",
  "Plan a focused 45-minute study session from what I uploaded today.",
  "Explain the hardest concept simply, then test me with three questions.",
];

function normalizeRegion(user: any) {
  return String(user?.region || user?.country || "global").toLowerCase();
}

function inferSchoolName(user: any) {
  const country = user?.country ? COUNTRIES[user.country] : null;
  return (
    country?.schools.find((school) => school.id === user?.schoolId)?.name ||
    user?.schoolId ||
    "Independent learner"
  );
}

function matchesFilter(item: any, filter: string) {
  if (filter === "All") return true;
  const haystack = [
    item?.title,
    item?.description,
    item?.subject,
    item?.curriculumTag,
    item?.contentType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(filter.toLowerCase());
}

export default function StudyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date().toISOString().split("T")[0];
  const routeJobId = new URLSearchParams(location.search).get("routeJob");
  const routedStudyJobs = useStudyRouterStore((state) => state.jobs);
  const personalizationSignals = useStudyRouterStore((state) => state.signals);

  const stats = useQuery(api.study.getStats);
  const wallet = useQuery(api.credits.getWallet);
  const recommendations = useQuery(api.study.getStudyRecommendations);
  const studyPacks =
    useQuery(api.study.getRecentStudyPacks, { limit: 4 }) || [];
  const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 6 });
  const allFlashcards = useQuery(api.study.listAllFlashcards, {}) || [];
  const dailyGoals = useQuery(api.study.getDailyGoals, { date: today }) || [];
  const weeklyData = useQuery(api.study.getWeeklyActivity, {}) || EMPTY_WEEK;
  const dashboardRails = useQuery(api.social.getDashboardRails, { limit: 5 });
  const schoolmates = useQuery(api.social.getSuggestedSchoolmates, {
    limit: 4,
  });
  const localizedTrending = useQuery(api.social.getLocalizedTrendingAssets, {
    limit: 5,
  });
  const initializeStats = useMutation(api.study.initializeStats);
  const toggleFollowUser = useMutation(api.social.toggleFollowUser);
  const createEssay = useMutation(api.vault.createEssay);

  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [isCreatingPaste, setIsCreatingPaste] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [pendingFollowUserId, setPendingFollowUserId] = useState<string | null>(
    null,
  );
  const [isStartingEssay, setIsStartingEssay] = useState(false);
  const [activeCommunityRail, setActiveCommunityRail] = useState<
    "school" | "regional" | "curriculum" | "following"
  >("school");

  const {
    activeFeature,
    setActiveFeature,
    isFocusModeOpen,
    setIsFocusModeOpen,
    isUploadOpen,
    setIsUploadOpen,
    searchQuery,
    setSearchQuery,
    selectedTopic,
    handleAddGoal,
    handleToggleGoal,
    formatStudyTime,
    createMaterial,
    generateAssets,
  } = useStudyDashboardHandlers();

  useEffect(() => {
    if (user && stats === null) {
      void initializeStats();
    }
  }, [initializeStats, stats, user]);

  useEffect(() => {
    if (!searchQuery && personalizationSignals[0]?.topic) {
      setSearchQuery(personalizationSignals[0].topic || "");
    }
  }, [personalizationSignals, searchQuery, setSearchQuery]);

  const openMaterial = (materialId: string) => {
    const match = (recentMaterials || []).find(
      (material) => String(material._id) === materialId,
    );

    if (match?.docId) {
      navigate(`/study/workspace/${match.docId}`);
      return;
    }

    navigate("/library");
  };

  const handleLectureComplete = async ({
    text,
    audioStorageId,
  }: {
    text: string;
    audioStorageId: string;
  }) => {
    try {
      const lectureTitle = `Lecture Audio ${new Date().toLocaleDateString()}`;
      const materialId = await createMaterial({
        title: lectureTitle,
        type: "audio",
        content: text,
        storageId: audioStorageId as any,
      });

      toast.success("Transcribed. Building study materials...");
      const result = await generateAssets({
        materialId,
        content: text,
        title: lectureTitle,
      });
      toast.success("Study materials are ready.");
      navigate(result?.packId ? `/study/packs/${result.packId}` : "/library");
    } catch (error) {
      console.error("Failed to save lecture material", error);
      toast.error("Failed to process lecture transcript.");
    }
  };

  const handlePasteComplete = async ({
    title,
    content,
    focusPrompt,
  }: {
    title: string;
    content: string;
    focusPrompt: string;
  }) => {
    setIsCreatingPaste(true);
    try {
      const materialTitle =
        title.trim() || `Pasted Notes ${new Date().toLocaleDateString()}`;
      const materialId = await createMaterial({
        title: materialTitle,
        type: "text",
        content,
      });

      toast.success("Text saved. Building your study pack...");
      const result = await generateAssets({
        materialId,
        content,
        title: materialTitle,
        focusPrompt: focusPrompt.trim() || undefined,
      });
      setIsPasteOpen(false);
      toast.success("Study pack ready.");
      navigate(result?.packId ? `/study/packs/${result.packId}` : "/library");
    } catch (error) {
      console.error("Failed to create pasted material", error);
      toast.error("Failed to build a study pack from this text.");
    } finally {
      setIsCreatingPaste(false);
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

  const handleStartAuthenticityDraft = async () => {
    if (isStartingEssay) return;

    setIsStartingEssay(true);
    try {
      const essayId = await createEssay({
        title: `Authenticity Report Essay - ${new Date().toLocaleDateString()}`,
      });
      toast.success("Opening your verified essay workspace...");
      navigate(`/vault/editor/${essayId}`);
    } catch (error) {
      console.error("Failed to start authenticity draft", error);
      toast.error("Could not open the Cryonex Authenticity Report right now.");
    } finally {
      setIsStartingEssay(false);
    }
  };

  const scrollToCaptureLane = () => {
    setIsUploadOpen(true);
    document.getElementById("capture-lane")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const personalization = dashboardRails?.personalization;
  const region = normalizeRegion(user);
  const countryConfig = user?.country ? COUNTRIES[user.country] : null;
  const schoolName = inferSchoolName(user);
  const displayTrending = dashboardRails?.trendingRegional?.length
    ? dashboardRails.trendingRegional
    : localizedTrending || [];

  const filteredRails = useMemo(() => {
    return {
      popularAtSchool: (dashboardRails?.popularAtSchool || []).filter(
        (item: any) => matchesFilter(item, activeFilter),
      ),
      trendingRegional: displayTrending.filter((item: any) =>
        matchesFilter(item, activeFilter),
      ),
      curriculumPicks: (dashboardRails?.curriculumPicks || []).filter(
        (item: any) => matchesFilter(item, activeFilter),
      ),
      followingPicks: (dashboardRails?.followingPicks || []).filter(
        (item: any) => matchesFilter(item, activeFilter),
      ),
    };
  }, [activeFilter, dashboardRails, displayTrending]);

  const activeRoutedJob = useMemo(() => {
    if (routeJobId) {
      const exactMatch = routedStudyJobs.find((job) => job.id === routeJobId);
      if (exactMatch) {
        return exactMatch;
      }
    }

    return routedStudyJobs.find((job) => job.status === "complete");
  }, [routeJobId, routedStudyJobs]);

  const latestStudySignal = personalizationSignals[0];
  const featuredMaterial = recentMaterials?.[0];
  const currentPrompt =
    searchQuery.trim() ||
    activeRoutedJob?.summary ||
    latestStudySignal?.text ||
    "Bring in a source, set a lane, and Cryonex will turn it into something you can actually revise from.";

  const activeCommunityConfig = useMemo(() => {
    const baseConfigs = {
      school: {
        id: "school" as const,
        label: "School",
        title: user?.schoolId
          ? `Popular at ${schoolName}`
          : "Popular at your school",
        eyebrow: "School rail",
        description:
          "School-visible study assets are grouped here so the dashboard feels social without becoming noisy.",
        items: filteredRails.popularAtSchool,
        emptyMessage:
          "No school-shared assets yet. Once you or your classmates publish study packs to your school, they will appear here.",
      },
      regional: {
        id: "regional" as const,
        label: "Regional",
        title:
          region === "sa" || region === "ksa"
            ? "Trending in Saudi Arabia"
            : region === "eg" || region === "egypt"
              ? "Trending in Egypt"
              : "Localized trending",
        eyebrow: "Regional",
        description:
          "Regional and country-aware picks keep the dashboard aligned with your context instead of showing generic global study cards.",
        items: filteredRails.trendingRegional,
        emptyMessage:
          "No regional public assets yet. Public study packs will surface here as your region grows.",
      },
      curriculum: {
        id: "curriculum" as const,
        label: "Curriculum",
        title: "For your curriculum",
        eyebrow: "Curriculum",
        description:
          "These picks follow your curriculum track and current learning lane.",
        items: filteredRails.curriculumPicks,
        emptyMessage: "No curriculum-matched shared assets yet.",
      },
      following: {
        id: "following" as const,
        label: "Following",
        title: "Because you follow them",
        eyebrow: "Following",
        description: "Recent study assets from the people you chose to follow.",
        items: filteredRails.followingPicks,
        emptyMessage:
          "Follow a few classmates or creators to personalize this rail.",
      },
    };

    return baseConfigs[activeCommunityRail];
  }, [activeCommunityRail, filteredRails, region, schoolName, user?.schoolId]);

  const communityTabs = [
    {
      id: "school" as const,
      label: "School",
      count: filteredRails.popularAtSchool.length,
    },
    {
      id: "regional" as const,
      label: "Regional",
      count: filteredRails.trendingRegional.length,
    },
    {
      id: "curriculum" as const,
      label: "Curriculum",
      count: filteredRails.curriculumPicks.length,
    },
    {
      id: "following" as const,
      label: "Following",
      count: filteredRails.followingPicks.length,
    },
  ];

  const heroContextPills = [
    {
      label: "Region",
      value: countryConfig?.name || "Global",
    },
    {
      label: "Curriculum",
      value:
        personalization?.curriculum ||
        user?.curriculumTrack ||
        user?.curriculum ||
        "General",
    },
    {
      label: "School",
      value: schoolName,
    },
    {
      label: "Privacy",
      value:
        personalization?.profileVisibility ||
        user?.profileVisibility ||
        "private",
    },
  ];

  const openStudyCopilot = () => navigate("/study/copilot");
  const openAssistant = () =>
    navigate("/app", {
      state: {
        initialMessage: currentPrompt,
      },
    });

  return (
    <div className="study-dashboard-shell custom-scrollbar relative h-screen flex-1 overflow-x-hidden overflow-y-auto px-4 pb-14 pt-16 md:px-8 md:pt-20 xl:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_18%,rgba(120,70,255,0.16),transparent_0,transparent_24%),radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.05),transparent_24%),radial-gradient(circle_at_78%_26%,rgba(92,106,255,0.1),transparent_18%),linear-gradient(180deg,#09032f_0%,#060220_55%,#040115_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle,rgba(255,255,255,0.82)_1px,transparent_1.35px)] [background-size:36px_36px]" />
        <div
          className="absolute right-[8%] top-[14%] h-72 w-72 rounded-full blur-[120px]"
          style={{
            background:
              countryConfig?.theme.flagGradient ||
              "linear-gradient(135deg, rgba(44,130,246,0.08) 0%, rgba(210,68,255,0.08) 100%)",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto max-w-[1380px]"
      >
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.22fr)_360px]">
          <section className="deepshi-panel rounded-[32px] border border-white/10 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56 gradient-border">
                <Sparkles className="h-3.5 w-3.5 text-[#D8A2FF]" />
                Your private study intelligence
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/50">
                {countryConfig?.flag || "🌍"} {countryConfig?.name || "Global"}{" "}
                • {schoolName}
              </span>
            </div>

            <h1 className="mt-5 max-w-[13ch] text-[clamp(2.7rem,6vw,4.55rem)] font-semibold leading-[1.02] tracking-[-0.06em] text-white">
              Welcome back{user?.name ? `, ${user.name}` : ""}. Build a tighter
              study flow.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/54 md:text-base">
              Keep one source, one prompt, and one next step in view so the day
              feels like study work instead of tab switching.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {heroContextPills.map((pill) => (
                <div
                  key={pill.label}
                  className="rounded-full border border-white/10 bg-[#161A34E6] px-3 py-1.5 text-xs text-white/75"
                >
                  <span className="text-white/42">{pill.label}:</span>{" "}
                  <span className="text-white/88">{pill.value}</span>
                </div>
              ))}
            </div>

            <div className="deepshi-prompt-panel gradient-border mt-6 flex flex-col gap-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,6,37,0.88),rgba(8,5,25,0.94))] p-4 shadow-[0_26px_70px_rgba(4,2,18,0.34)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="flex-1 rounded-[24px] border border-white/10 bg-black/20 px-5 py-4">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/36">
                    Study prompt
                  </p>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Review biology, turn my notes into a quiz, or plan a 45-minute session..."
                    className="mt-2 w-full bg-transparent text-lg text-white placeholder:text-white/30 focus:outline-none"
                  />
                </div>

                <div className="grid gap-3 md:min-w-[240px]">
                  <Button
                    type="button"
                    onClick={openStudyCopilot}
                    className="h-[58px] rounded-[22px] bg-white px-6 text-sm font-semibold text-black hover:bg-white/92"
                  >
                    Open Study Copilot
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={openAssistant}
                    className="h-[48px] rounded-[20px] border border-white/10 bg-white/[0.04] px-6 text-sm font-semibold text-white hover:bg-white/[0.08]"
                  >
                    Send to Assistant
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {STUDY_PROMPT_PRESETS.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setSearchQuery(prompt)}
                    className="rounded-full border border-white/[0.06] bg-white/[0.03] px-4 py-2 text-sm text-white/72 transition-colors hover:bg-white/[0.08] hover:text-white gradient-border"
                  >
                    {prompt.length > 52 ? `${prompt.slice(0, 52)}...` : prompt}
                  </button>
                ))}
              </div>
            </div>

            {(activeRoutedJob || latestStudySignal) && (
              <div className="mt-5">
                {activeRoutedJob ? (
                  <StudyRouteCard
                    payload={{
                      version: 1,
                      jobId: activeRoutedJob.id,
                      status: activeRoutedJob.status,
                      fileName: activeRoutedJob.fileName,
                      request: activeRoutedJob.request,
                      primaryIntent: activeRoutedJob.primaryIntent,
                      intensity: activeRoutedJob.intensity,
                      intentLabel: activeRoutedJob.intentLabel,
                      summary: activeRoutedJob.summary,
                      topic: activeRoutedJob.topic,
                      dashboardUrl:
                        activeRoutedJob.dashboardUrl || "/study/dashboard",
                      workspaceUrl: activeRoutedJob.workspaceUrl,
                    }}
                    className="mb-0"
                  />
                ) : (
                  <div className="dashboard-surface rounded-[1.6rem] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">
                      Current signal
                    </p>
                    <p className="mt-2 text-base font-semibold text-white">
                      The dashboard is already adapting to your latest request.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/56">
                      {latestStudySignal?.text}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-5">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={scrollToCaptureLane}
                  className="rounded-full bg-white text-black hover:bg-white/92"
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload source
                </Button>
                <Button
                  type="button"
                  onClick={handleStartAuthenticityDraft}
                  disabled={isStartingEssay}
                  className="rounded-full bg-[linear-gradient(135deg,rgba(251,191,36,0.88),rgba(245,158,11,0.88))] text-black hover:opacity-95 disabled:cursor-wait disabled:opacity-70"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  {isStartingEssay
                    ? "Opening tracked draft..."
                    : "Start tracked draft"}
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsPasteOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition-colors hover:bg-white/[0.08]"
                >
                  <FileText className="h-4 w-4 text-violet-200" />
                  Paste notes
                </button>
                <button
                  type="button"
                  onClick={scrollToCaptureLane}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/78 transition-colors hover:bg-white/[0.08]"
                >
                  <Mic className="h-4 w-4 text-emerald-200" />
                  Record lecture
                </button>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <div className="dashboard-surface rounded-[1.9rem] p-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                <Sparkles className="h-3.5 w-3.5" />
                Live context
              </div>

              <div className="mt-4 space-y-3">
                <div className="dashboard-subtle-panel rounded-[1.35rem] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/42">
                    Current prompt
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/80">
                    {currentPrompt}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="dashboard-subtle-panel rounded-[1.35rem] px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/42">
                      Goal input
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() =>
                          handleAddGoal("Finish one focused study sprint")
                        }
                        className="rounded-full bg-white text-black hover:bg-white/92"
                      >
                        Add goal
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const firstOpenGoal = dailyGoals.find(
                            (goal) => !goal.isCompleted,
                          );
                          if (firstOpenGoal) {
                            void handleToggleGoal(firstOpenGoal._id, false);
                          }
                        }}
                        className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                      >
                        Check next
                      </Button>
                    </div>
                  </div>

                  {featuredMaterial ? (
                    <button
                      type="button"
                      onClick={() => openMaterial(String(featuredMaterial._id))}
                      className="dashboard-subtle-panel w-full rounded-[1.35rem] px-4 py-3 text-left"
                    >
                      <p className="text-xs uppercase tracking-[0.16em] text-white/42">
                        Active source
                      </p>
                      <p className="mt-2 text-base font-semibold text-white">
                        {featuredMaterial.title}
                      </p>
                      <p className="mt-1.5 text-sm leading-6 text-white/56">
                        Keep one real source active so review, quiz work, and
                        notes stay connected.
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/56">
                        Continue source
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </button>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => navigate("/school")}
                    className="flex-1 rounded-full bg-white text-black hover:bg-white/92"
                  >
                    <School className="mr-2 h-4 w-4" />
                    School Hub
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/library")}
                    className="rounded-full border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  >
                    Library
                  </Button>
                </div>
              </div>
            </div>

            <LocalizedStudentBrief
              country={user?.country}
              region={user?.region}
              preferredLanguage={user?.preferredLanguage}
              compact
              layout="rail"
            />
          </aside>
        </div>

        <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(300px,0.82fr)]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                  Revision filters
                </p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Narrow the next actions and shared assets to the exam context
                  that matters right now.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXAM_FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeFilter === filter
                        ? "border-white/20 bg-white text-black"
                        : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08]"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <StudyGuidedNextActions
              user={user}
              recommendations={recommendations}
              recentMaterials={recentMaterials || []}
              dailyGoals={dailyGoals}
              onOpenFlashcards={() => setActiveFeature("flashcards")}
              onOpenQuiz={() => setActiveFeature("quiz")}
              onOpenFocus={() => setIsFocusModeOpen(true)}
              onOpenUpload={scrollToCaptureLane}
              onContinueMaterial={openMaterial}
              onOpenRegionalTrainer={() => setActiveFeature("regional_trainer")}
            />
          </div>

          <StudyStatsBar
            stats={stats}
            wallet={wallet}
            formatStudyTime={formatStudyTime}
            dailyGoals={dailyGoals}
            weeklyData={weeklyData}
            layout="dense"
          />
        </div>

        <div className="mt-6">
          <StudyRecentUploads
            recentMaterials={recentMaterials}
            setIsUploadOpen={setIsUploadOpen}
            searchQuery={searchQuery}
            layout="dashboard"
          />
        </div>

        <div className="mt-6">
          <StudyPacksSection
            packs={studyPacks}
            onCreateFromNotes={() => setIsPasteOpen(true)}
            onCreateFromSource={scrollToCaptureLane}
          />
        </div>

        <section
          id="capture-lane"
          className={`mt-6 deepshi-panel rounded-[28px] border border-white/10 p-5 transition-all ${
            isUploadOpen ? "ring-1 ring-white/20" : ""
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                <UploadCloud className="h-3.5 w-3.5" />
                Capture lane
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                Source-first capture, all in one place
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Upload a document or record a lecture. Every capture path feeds
                the same downstream workflow: summaries, notes, flashcards,
                quizzes, and guided next steps.
              </p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/55">
              {user?.schoolNetworkOptIn
                ? "School network enabled"
                : "Private by default"}
            </div>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_320px]">
            <StudyUploadZone
              onUploadComplete={(docId) =>
                navigate(`/study/workspace/${docId}`)
              }
            />

            <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                <Mic className="h-3.5 w-3.5" />
                Lecture capture
              </div>
              <h4 className="mt-4 text-xl font-semibold text-white">
                Record and convert class audio
              </h4>
              <p className="mt-2 text-sm leading-6 text-white/52">
                Use live recording when the material is spoken, then send the
                transcript into the same study pack pipeline.
              </p>
              <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 p-4">
                <LectureRecorder
                  onTranscriptionComplete={handleLectureComplete}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                <Globe2 className="h-3.5 w-3.5" />
                Community + context
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                Explore the parts of your network that matter right now
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Keep the dashboard social, but not noisy. Switch between school,
                regional, curriculum, and followed lanes instead of scrolling a
                long feed of equally weighted rails.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {communityTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCommunityRail(tab.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeCommunityRail === tab.id
                      ? "border-white/20 bg-white text-black"
                      : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/[0.08]"
                  }`}
                >
                  {tab.label}{" "}
                  <span
                    className={
                      activeCommunityRail === tab.id
                        ? "text-black/60"
                        : "text-white/38"
                    }
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <StudyShareRail
              eyebrow={activeCommunityConfig.eyebrow}
              title={activeCommunityConfig.title}
              description={activeCommunityConfig.description}
              items={activeCommunityConfig.items}
              emptyMessage={activeCommunityConfig.emptyMessage}
            />
          </div>

          <aside className="space-y-6">
            <SuggestedStudentsPanel
              students={schoolmates || []}
              onToggleFollow={handleToggleFollow}
              pendingUserId={pendingFollowUserId}
            />
          </aside>
        </section>
      </motion.div>

      <StudyPackComposer
        open={isPasteOpen}
        onOpenChange={setIsPasteOpen}
        submitting={isCreatingPaste}
        onSubmit={handlePasteComplete}
      />

      <StudyDashboardOverlays
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        isFocusModeOpen={isFocusModeOpen}
        setIsFocusModeOpen={setIsFocusModeOpen}
        allFlashcards={allFlashcards}
        selectedTopic={selectedTopic}
        user={user ?? null}
      />
    </div>
  );
}
