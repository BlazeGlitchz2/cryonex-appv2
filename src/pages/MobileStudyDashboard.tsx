import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  Compass,
  FileText,
  Globe2,
  Mic,
  School,
  Sparkles,
  UploadCloud,
  Users,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { DashboardActivity } from "@/components/study/DashboardActivity";
import { LectureRecorder } from "@/components/study/LectureRecorder";
import { MobileStudyUploadZone } from "@/components/study/MobileStudyUploadZone";
import { StudyStatsBar } from "@/components/study/StudyStatsBar";
import { StudyFeatureCards } from "@/components/study/StudyFeatureCards";
import { StudyPacksSection } from "@/components/study/StudyPacksSection";
import { StudyRecentUploads } from "@/components/study/StudyRecentUploads";
import { StudyLevelCard } from "@/components/study/StudyLevelCard";
import { StudyDashboardOverlays } from "@/components/study/StudyDashboardOverlays";
import { useStudyDashboardHandlers } from "@/hooks/use-study-dashboard-handlers";
import { hapticFeedback, isAndroid, isIOS } from "@/lib/mobile";
import { StudyGuidedNextActions } from "@/components/study/StudyGuidedNextActions";
import { StudyPackComposer } from "@/components/study/StudyPackComposer";
import { useStudyRouterStore } from "@/lib/stores/study-router-store";
import { StudyRouteCard } from "@/components/chat/StudyRouteCard";
import { COUNTRIES } from "@/lib/countryConfig";
import { useStudyRouteData } from "@/components/study/StudyRouteDataProvider";
import { LocalizedStudentBrief } from "@/components/study/LocalizedStudentBrief";
import {
  SuggestedStudentsPanel,
  StudyShareRail,
} from "@/components/study/StudySocialSurfaces";
import {
  buildMobileDashboardBrief,
  buildMobileLearnerProfile,
  type MobileDashboardActionId,
} from "@/lib/mobile-personalization";
import {
  MobileDashboardActionCard,
  MobileDashboardSurface,
} from "@/components/study/mobile-dashboard/MobileDashboardSurface";

const EMPTY_WEEK = [
  { name: "Sun", hours: 0 },
  { name: "Mon", hours: 0 },
  { name: "Tue", hours: 0 },
  { name: "Wed", hours: 0 },
  { name: "Thu", hours: 0 },
  { name: "Fri", hours: 0 },
  { name: "Sat", hours: 0 },
];

interface MobileDailyGoal {
  _id: string;
  text: string;
  isCompleted: boolean;
}

const EMPTY_DAILY_GOALS: MobileDailyGoal[] = [];

export default function MobileStudyDashboard() {
  const { user } = useAuth();
  const { recommendations, recentMaterials: sharedRecentMaterials } =
    useStudyRouteData();
  const recentMaterials = sharedRecentMaterials.slice(0, 4);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const today = new Date().toISOString().split("T")[0];
  const routeJobId = searchParams.get("routeJob");
  const captureAction =
    searchParams.get("action") || searchParams.get("quickCapture");
  const routedStudyJobs = useStudyRouterStore((state) => state.jobs);
  const personalizationSignals = useStudyRouterStore((state) => state.signals);

  const stats = useQuery(api.study.getStats, user ? {} : "skip");
  const wallet = useQuery(api.credits.getWallet, user ? {} : "skip");
  const studyPacks =
    useQuery(api.study.getRecentStudyPacks, user ? { limit: 3 } : "skip") || [];
  const dashboardRails = useQuery(
    api.social.getDashboardRails,
    user ? { limit: 4 } : "skip",
  );
  const schoolmates = useQuery(
    api.social.getSuggestedSchoolmates,
    user ? { limit: 3 } : "skip",
  );
  const localizedTrending =
    useQuery(
      api.social.getLocalizedTrendingAssets,
      user ? { limit: 4 } : "skip",
    ) || [];
  const allFlashcards =
    useQuery(api.study.listAllFlashcards, user ? {} : "skip") || [];
  const dailyGoals =
    useQuery(api.study.getDailyGoals, user ? { date: today } : "skip") ??
    EMPTY_DAILY_GOALS;
  const weeklyData =
    useQuery(api.study.getWeeklyActivity, user ? {} : "skip") || EMPTY_WEEK;
  const normalizedDailyGoals = useMemo(
    () =>
      dailyGoals.map((goal) => ({
        _id: String(goal._id || ""),
        text: goal.text || "Untitled goal",
        isCompleted: Boolean(goal.isCompleted),
      })),
    [dailyGoals],
  );
  const initializeStats = useMutation(api.study.initializeStats);
  const toggleFollowUser = useMutation(api.social.toggleFollowUser);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [isCreatingPaste, setIsCreatingPaste] = useState(false);
  const [materialFilter, setMaterialFilter] = useState("all");
  const [uploadEntryPoint, setUploadEntryPoint] = useState<
    "scan" | "upload" | null
  >(null);
  const [pendingFollowUserId, setPendingFollowUserId] = useState<string | null>(
    null,
  );
  const [activeCommunityRail, setActiveCommunityRail] = useState<
    "school" | "regional" | "following"
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
  const deferredSearchQuery = useDeferredValue(searchQuery);

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

  useEffect(() => {
    if (!captureAction) return;

    if (captureAction === "scan" || captureAction === "upload") {
      setUploadEntryPoint(captureAction === "scan" ? "scan" : "upload");
      setIsUploadOpen(true);
      toast.success(
        captureAction === "scan"
          ? isAndroid()
            ? "Opening camera capture."
            : isIOS()
              ? "Opening photo import."
              : "Ready to capture a source."
          : "Ready to upload a study source.",
      );
    }

    if (captureAction === "voice" || captureAction === "record") {
      requestAnimationFrame(() => {
        document.getElementById("mobile-capture-lane")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      toast.success("Recorder is ready below.");
    }

    const nextParams = new URLSearchParams(location.search);
    nextParams.delete("action");
    nextParams.delete("quickCapture");
    navigate(
      `${location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`,
      { replace: true },
    );
  }, [
    captureAction,
    location.pathname,
    location.search,
    navigate,
    setIsUploadOpen,
  ]);

  const personalization = dashboardRails?.personalization;
  const countryConfig = user?.country ? COUNTRIES[user.country] : null;
  const schoolName =
    countryConfig?.schools.find((school) => school.id === user?.schoolId)
      ?.name ||
    user?.schoolId ||
    "Independent learner";
  const regionalLabel =
    countryConfig?.name ||
    (user?.country ? String(user.country).toUpperCase() : "Global");
  const profile = useMemo(() => buildMobileLearnerProfile(user), [user]);

  const handleOpenCopilot = (seededPrompt?: string) => {
    hapticFeedback("light");
    const initialMessage = seededPrompt?.trim();
    navigate("/app", {
      state: initialMessage ? { initialMessage } : undefined,
    });
  };

  const closeUploadSheet = () => {
    setUploadEntryPoint(null);
    setIsUploadOpen(false);
  };

  const handleOpenAssistant = () => {
    hapticFeedback("light");
    navigate("/app", {
      state: {
        initialMessage:
          searchQuery.trim() ||
          dashboardBrief.coachPrompt ||
          "Help me turn my latest study material into something I can revise from.",
      },
    });
  };

  const filteredMaterials =
    recentMaterials?.filter((material) => {
      const query = deferredSearchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        material.title?.toLowerCase().includes(query) ||
        material.type?.toLowerCase().includes(query)
      );
    }) ?? [];

  const visibleMaterials = filteredMaterials.filter((material) =>
    materialFilter === "all" ? true : material.type === materialFilter,
  );

  const materialFilterChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const material of recentMaterials || []) {
      counts.set(material.type, (counts.get(material.type) || 0) + 1);
    }

    return [
      { id: "all", label: "All", count: recentMaterials?.length ?? 0 },
      ...Array.from(counts.entries()).map(([type, count]) => ({
        id: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
        count,
      })),
    ];
  }, [recentMaterials]);

  const activeRoutedJob = useMemo(() => {
    if (routeJobId) {
      const exactMatch = routedStudyJobs.find((job) => job.id === routeJobId);
      if (exactMatch) {
        return exactMatch;
      }
    }

    return routedStudyJobs.find((job) => job.status === "complete");
  }, [routeJobId, routedStudyJobs]);

  const dashboardBrief = useMemo(
    () =>
      buildMobileDashboardBrief({
        user,
        recommendations,
        dailyGoals,
        recentMaterials,
        searchQuery,
      }),
    [dailyGoals, recentMaterials, recommendations, searchQuery, user],
  );
  const featuredMaterial = recentMaterials?.[0] || null;

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
        storageId: audioStorageId as Id<"_storage">,
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

  const scrollToCaptureLane = () => {
    document.getElementById("mobile-capture-lane")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleToggleFollow = async (userId: string) => {
    setPendingFollowUserId(userId);
    try {
      await toggleFollowUser({ targetUserId: userId as Id<"users"> });
    } catch (error) {
      console.error(error);
      toast.error("Could not update follow state.");
    } finally {
      setPendingFollowUserId(null);
    }
  };

  const handleDashboardBriefAction = (actionId: MobileDashboardActionId) => {
    if (actionId === "flashcards") {
      startTransition(() => setActiveFeature("flashcards"));
      return;
    }

    if (actionId === "quiz") {
      startTransition(() => setActiveFeature("quiz"));
      return;
    }

    if (actionId === "focus") {
      startTransition(() => setIsFocusModeOpen(true));
      return;
    }

    startTransition(() => {
      setUploadEntryPoint("scan");
      setIsUploadOpen(true);
    });
  };

  const heroActionCards = [
    {
      id: "capture",
      title: dashboardBrief.cards[0]?.title || "Bring in a fresh source",
      description:
        dashboardBrief.cards[0]?.description ||
        "Scan notes, worksheets, or a whiteboard before the next review.",
      meta: dashboardBrief.cards[0]?.meta || "Capture lane",
      icon: UploadCloud,
      accent: true,
      action: () =>
        startTransition(() => {
          setUploadEntryPoint("scan");
          setIsUploadOpen(true);
        }),
    },
    {
      id: "flashcards",
      title: dashboardBrief.cards[1]?.title || "Clear the recall queue",
      description:
        dashboardBrief.cards[1]?.description ||
        "Keep the due set within one-thumb reach on mobile.",
      meta: dashboardBrief.cards[1]?.meta || "Recall lane",
      icon: Brain,
      action: () => handleDashboardBriefAction("flashcards"),
    },
    {
      id: "quiz",
      title: dashboardBrief.cards[2]?.title || "Pressure-test the weak spots",
      description:
        dashboardBrief.cards[2]?.description ||
        "Check the concepts that still need a little more heat.",
      meta: dashboardBrief.cards[2]?.meta || "Practice lane",
      icon: Compass,
      action: () => handleDashboardBriefAction("quiz"),
    },
    {
      id: "focus",
      title: dashboardBrief.cards[3]?.title || "Start a clean session",
      description:
        dashboardBrief.cards[3]?.description ||
        "Match the workspace to the pace you actually want today.",
      meta: dashboardBrief.cards[3]?.meta || profile.paceLabel,
      icon: CalendarDays,
      action: () => handleDashboardBriefAction("focus"),
    },
    {
      id: "match",
      title: "Warm-up match game",
      description:
        "Keep recall light with a quick memory loop before a deeper block.",
      meta: "Speed lane",
      icon: Sparkles,
      action: () => startTransition(() => setActiveFeature("match")),
    },
    {
      id: "assistant",
      title: "Open Study Copilot",
      description:
        "Ask for a guided revision plan, a quiz, or a source-linked explanation.",
      meta: "Coach lane",
      icon: ArrowRight,
      accent: true,
      action: () => handleOpenCopilot(dashboardBrief.coachPrompt || searchQuery),
    },
  ];
  const quickJumpItems = [
    {
      id: "continue",
      label: "Continue source",
      action: () =>
        featuredMaterial?._id
          ? openMaterial(String(featuredMaterial._id))
          : scrollToCaptureLane(),
    },
    {
      id: "actions",
      label: "Next actions",
      action: () => scrollToSection("mobile-next-actions"),
    },
    {
      id: "shelf",
      label: "Source shelf",
      action: () => scrollToSection("mobile-source-shelf"),
    },
    {
      id: "packs",
      label: "Study packs",
      action: () => scrollToSection("mobile-study-packs"),
    },
    {
      id: "community",
      label: "Community",
      action: () => scrollToSection("mobile-community"),
    },
    {
      id: "capture",
      label: "Capture lane",
      action: () => scrollToCaptureLane(),
    },
  ];
  const communityTabs = [
    {
      id: "school" as const,
      label: "School",
      icon: School,
      items: dashboardRails?.popularAtSchool || [],
      title: "Popular at your school",
      description: "Shared packs and notes that are active around your school.",
      emptyMessage:
        "School shared study assets will appear here once classmates publish them.",
    },
    {
      id: "regional" as const,
      label: regionalLabel,
      icon: Globe2,
      items:
        dashboardRails?.trendingRegional?.length
          ? dashboardRails.trendingRegional
          : localizedTrending,
      title: `Trending in ${regionalLabel}`,
      description:
        "Localized picks matched to your region, curriculum, and current study lane.",
      emptyMessage:
        "Regional study assets will appear here as your network grows.",
    },
    {
      id: "following" as const,
      label: "Following",
      icon: Users,
      items: dashboardRails?.followingPicks || [],
      title: "From people you follow",
      description:
        "The smaller, higher-signal lane from people you already care about.",
      emptyMessage:
        "Follow classmates and creators to turn this rail into your private signal feed.",
    },
  ];
  const activeCommunityConfig =
    communityTabs.find((tab) => tab.id === activeCommunityRail) ||
    communityTabs[0];

  return (
    <div className="study-dashboard-shell study-dyslexia relative min-h-full overflow-x-hidden px-3 pb-[calc(13rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 md:px-6 md:pt-5">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,114,255,0.08),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(61,193,255,0.08),transparent_24%),linear-gradient(180deg,#07031c_0%,#050218_58%,#040114_100%)]" />
        <div className="absolute left-[-18%] top-[6%] h-72 w-72 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute right-[-14%] top-[24%] h-64 w-64 rounded-full bg-primary/5 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[16%] h-60 w-60 rounded-full bg-foreground/4 blur-[130px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        className="relative z-10 mx-auto max-w-2xl space-y-3 md:max-w-5xl md:space-y-4 lg:max-w-6xl"
      >
        <motion.section
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="overflow-hidden rounded-[32px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(17,10,38,0.88),rgba(7,4,19,0.94))] p-4 shadow-[0_28px_90px_rgba(4,2,18,0.38)] backdrop-blur-2xl sm:p-5 md:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/62">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Personalized phone study OS
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/62">
              {countryConfig?.flag || "🌍"} {regionalLabel}
            </div>
          </div>

          <div className="mt-4 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              {dashboardBrief.greeting}
            </div>
            <h1 className="text-[clamp(2.1rem,7vw,3.2rem)] font-semibold tracking-[-0.07em] text-white leading-[1.02]">
              {dashboardBrief.headline}
            </h1>
            <p className="max-w-xl text-sm leading-6 text-white/72 sm:text-[15px] sm:leading-7">
              {dashboardBrief.subheadline}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              profile.paceLabel,
              profile.focusSubject,
              profile.checkpoint,
              dashboardBrief.momentumLabel,
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-white/72"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {heroActionCards.map((card) => (
              <MobileDashboardActionCard
                key={card.id}
                title={card.title}
                description={card.description}
                meta={card.meta}
                icon={card.icon}
                accent={card.accent}
                onClick={card.action}
              />
            ))}
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
            <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38">
                Coach this lane
              </p>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleOpenCopilot(searchQuery || dashboardBrief.coachPrompt);
                  }
                }}
                aria-label="Tell Cryonex what you want to study next"
                placeholder="I want to study biology, revise math, or turn notes into a quiz..."
                className="mt-2 w-full rounded-2xl border border-white/[0.06] bg-black/10 px-4 py-3 text-[16px] leading-6 text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCopilot(searchQuery || dashboardBrief.coachPrompt)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black"
                >
                  {searchQuery.trim()
                    ? "Send to Study Copilot"
                    : "Open Study Copilot"}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleOpenAssistant}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/88"
                >
                  Open blank chat
                </button>
              </div>

              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {dashboardBrief.cards.slice(0, 3).map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      if (card.id === "capture") {
                        startTransition(() => {
                          setUploadEntryPoint("scan");
                          setIsUploadOpen(true);
                        });
                      } else if (card.id === "flashcards") {
                        handleDashboardBriefAction("flashcards");
                      } else if (card.id === "quiz") {
                        handleDashboardBriefAction("quiz");
                      }
                    }}
                    className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-left text-[11px] text-white/70 transition-colors hover:bg-white/[0.08]"
                  >
                    {card.title}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setIsFocusModeOpen(true)}
                  className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-[11px] font-medium text-primary transition-colors hover:bg-primary/14"
                >
                  {dashboardBrief.secondaryAction.label}
                </button>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38">
                Today on mobile
              </p>
              <div className="mt-3 space-y-2.5">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                    School
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/80">
                    {schoolName}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                    Coach prompt
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/80">
                    {dashboardBrief.coachPrompt}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/38">
                    Mobile behavior
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/80">
                    Safe-area padding, denser taps, one-handed actions, and a
                    tighter path from capture to review.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["Region", regionalLabel],
              ["Curriculum", profile.focusSubject],
              [
                "Privacy",
                personalization?.profileVisibility ||
                  user?.profileVisibility ||
                  "private",
              ],
              ["Language", profile.language],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/36">
                  {label}
                </span>
                <span className="max-w-[55%] truncate text-sm text-white/88">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {activeRoutedJob && (
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
              dashboardUrl: activeRoutedJob.dashboardUrl || "/study/dashboard",
              workspaceUrl: activeRoutedJob.workspaceUrl,
            }}
            className="w-full"
          />
        )}

        <MobileDashboardSurface
          eyebrow="Continue"
          title="Desktop power, phone-sized routing"
          description="The same dashboard jobs from desktop are here on mobile: live context, next actions, source shelf, study packs, community, and capture."
          bodyClassName="space-y-4"
        >
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
            <button
              type="button"
              onClick={() =>
                featuredMaterial?._id
                  ? openMaterial(String(featuredMaterial._id))
                  : setIsUploadOpen(true)
              }
              className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4 text-left transition-colors hover:bg-white/[0.07]"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                Active source
              </p>
              <p className="mt-2 text-base font-semibold text-white">
                {featuredMaterial?.title || "No source loaded yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/60">
                {featuredMaterial
                  ? "Resume the source that your notes, quizzes, and chat already understand."
                  : "Capture one source and the rest of the mobile flow will personalize around it."}
              </p>
            </button>

            <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.04] p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/38">
                Quick jump
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {quickJumpItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.action}
                    className="rounded-full border border-white/[0.08] bg-black/20 px-3 py-2 text-[11px] text-white/72 transition-colors hover:bg-white/[0.08]"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </MobileDashboardSurface>

        <MobileDashboardSurface
          eyebrow="Progress"
          title="Your study rhythm"
          description="A compact snapshot of effort, recall, and the tools you are most likely to use next."
          bodyClassName="grid gap-3 md:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]"
        >
          <StudyStatsBar
            stats={stats}
            wallet={wallet}
            formatStudyTime={formatStudyTime}
            dailyGoals={normalizedDailyGoals}
            weeklyData={weeklyData}
            compact
            layout="dense"
          />

          <StudyFeatureCards
            compact
            recommendations={recommendations}
            onSetActiveFeature={setActiveFeature}
            onSetIsFocusModeOpen={setIsFocusModeOpen}
          />
        </MobileDashboardSurface>

        <motion.section
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="deepshi-panel rounded-[28px] border border-border px-5 py-6"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
              Study Sets
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-foreground sm:text-[2rem]">
              What do you want to master?
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/56 sm:text-[15px]">
              Upload, paste, or record and turn it into focused revision
              material.
            </p>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="rounded-[24px] border border-border bg-foreground/[0.03] p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <UploadCloud className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Upload
              </h3>
              <p className="mt-1 text-sm text-foreground/52">
                PDFs, screenshots, and files.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIsPasteOpen(true)}
              className="rounded-[24px] border border-border bg-foreground/[0.03] p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Paste
              </h3>
              <p className="mt-1 text-sm text-foreground/52">
                Lecture notes, excerpts, bilingual text.
              </p>
            </button>

            <button
              type="button"
              onClick={scrollToCaptureLane}
              className="rounded-[24px] border border-border bg-foreground/[0.03] p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Mic className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                Record
              </h3>
              <p className="mt-1 text-sm text-foreground/52">
                Capture a lecture and build a study pack.
              </p>
            </button>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Quick modes
                </div>
                <h3 className="mt-2 text-xl font-semibold text-foreground">
                  Jump into the next best lane
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground/52">
                  The strongest next action is already above. This lane stays
                  here to keep a quiet reminder visible while you scroll.
                </p>
              </div>
              <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-foreground/78">
                {recommendations?.dueFlashcardsCount ?? 0} due
              </div>
            </div>
          </div>
        </motion.section>

        <div id="mobile-source-shelf" className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/42">
              Explore
            </p>
            <h2 className="mt-2 text-lg font-bold text-foreground">
              Browse your study shelf
            </h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {materialFilterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => setMaterialFilter(chip.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                  materialFilter === chip.id
                    ? "border-white bg-white text-black"
                    : "border-border bg-foreground/[0.03] text-foreground/72"
                }`}
              >
                {chip.label} {chip.count ? `(${chip.count})` : ""}
              </button>
            ))}
          </div>
        </div>

        <div
          id="mobile-next-actions"
          className="grid gap-3 md:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]"
        >
          <StudyGuidedNextActions
            compact
            user={user}
            recommendations={recommendations}
            recentMaterials={recentMaterials || []}
            dailyGoals={dailyGoals}
            onOpenFlashcards={() => setActiveFeature("flashcards")}
            onOpenQuiz={() => setActiveFeature("quiz")}
            onOpenFocus={() => setIsFocusModeOpen(true)}
            onOpenUpload={() => setIsUploadOpen(true)}
            onContinueMaterial={openMaterial}
            onOpenRegionalTrainer={() => setActiveFeature("regional_trainer")}
          />

          <StudyRecentUploads
            compact
            recentMaterials={visibleMaterials}
            setIsUploadOpen={setIsUploadOpen}
            searchQuery={deferredSearchQuery}
            layout="dashboard"
          />
        </div>

        <div id="mobile-study-packs">
          <StudyPacksSection
            compact
            packs={studyPacks}
            onCreateFromNotes={() => setIsPasteOpen(true)}
            onCreateFromSource={scrollToCaptureLane}
          />
        </div>

        <div
          id="mobile-community"
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]"
        >
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/42">
                Community
              </p>
              <h2 className="mt-2 text-lg font-bold text-foreground">
                Browse your shared study network
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {communityTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeCommunityRail;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCommunityRail(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                      isActive
                        ? "border-white bg-white text-black"
                        : "border-border bg-foreground/[0.03] text-foreground/72"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                    <span
                      className={
                        isActive ? "text-[11px] text-black/55" : "text-[11px] text-foreground/38"
                      }
                    >
                      {tab.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            <StudyShareRail
              eyebrow={activeCommunityConfig.label}
              title={activeCommunityConfig.title}
              description={activeCommunityConfig.description}
              items={activeCommunityConfig.items}
              emptyMessage={activeCommunityConfig.emptyMessage}
            />
          </div>

          <SuggestedStudentsPanel
            students={schoolmates || []}
            onToggleFollow={handleToggleFollow}
            pendingUserId={pendingFollowUserId}
            className="border border-border bg-foreground/[0.03]"
          />
        </div>

        <LocalizedStudentBrief
          compact
          country={user?.country}
          region={user?.region}
          preferredLanguage={user?.preferredLanguage}
        />

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <DashboardActivity
            dailyGoals={normalizedDailyGoals}
            weeklyData={weeklyData}
            onAddGoal={handleAddGoal}
            onToggleGoal={(goalId, currentStatus) =>
              handleToggleGoal(goalId as Id<"dailyGoals">, currentStatus)
            }
            compact
          />

          <StudyLevelCard stats={stats} />
        </div>

        <motion.section
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          id="mobile-capture-lane"
          className="dashboard-surface dashboard-hover-lift rounded-[2rem] p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Capture lane
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                Record once, study from it everywhere.
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Mic className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-foreground/58">
            This recorder is now friendlier to device differences, including
            browsers that prefer non-WebM audio formats.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-foreground/78">
              Audio to notes
            </div>
            <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-foreground/78">
              Review-ready output
            </div>
          </div>
          <div className="mt-5">
            <LectureRecorder onTranscriptionComplete={handleLectureComplete} />
          </div>
        </motion.section>
      </motion.div>

      <StudyDashboardOverlays
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        isFocusModeOpen={isFocusModeOpen}
        setIsFocusModeOpen={setIsFocusModeOpen}
        allFlashcards={allFlashcards}
        selectedTopic={selectedTopic}
        user={user}
      />

      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-xl"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeUploadSheet();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            className="dashboard-surface w-full rounded-t-[2rem] px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/75">
                  Add material
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                  Capture your next source
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  closeUploadSheet();
                }}
                className="rounded-full border border-border bg-foreground/6 px-3 py-2 text-sm text-foreground/65"
              >
                Close
              </button>
            </div>
            <MobileStudyUploadZone
              initialAction={uploadEntryPoint}
              onUploadComplete={() => closeUploadSheet()}
            />
          </motion.div>
        </div>
      )}

      <StudyPackComposer
        open={isPasteOpen}
        onOpenChange={setIsPasteOpen}
        onSubmit={handlePasteComplete}
        submitting={isCreatingPaste}
      />
    </div>
  );
}
