import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
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
import { useStudyPresence } from "@/hooks/use-study-presence";
import { DashboardActivity } from "@/components/study/DashboardActivity";
import { LectureRecorder } from "@/components/study/LectureRecorder";
import { MobileStudyUploadZone } from "@/components/study/MobileStudyUploadZone";
import { StudyStatsBar } from "@/components/study/StudyStatsBar";
import { StudyFeatureCards } from "@/components/study/StudyFeatureCards";
import { StudyPacksSection } from "@/components/study/StudyPacksSection";
import { StudyRecentUploads } from "@/components/study/StudyRecentUploads";
import { StudyLevelCard } from "@/components/study/StudyLevelCard";
import { StudyDashboardOverlays } from "@/components/study/StudyDashboardOverlays";
import { StudyGuidedNextActions } from "@/components/study/StudyGuidedNextActions";
import { useStudyDashboardHandlers } from "@/hooks/use-study-dashboard-handlers";
import { hapticFeedback, isAndroid, isIOS } from "@/lib/mobile";
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
import { AuroraThemeBackground } from "@/components/ui/background-gradient-glow";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useDeviceType } from "@/hooks/use-mobile";

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
  const deviceType = useDeviceType();
  const isTablet = deviceType === "tablet";
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
  const [selectedTopic] = useState<string>("");
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
    handleAddGoal,
    handleToggleGoal,
    formatStudyTime,
    createMaterial,
    generateAssets,
    trackActivity,
  } = useStudyDashboardHandlers({
    source: "mobile_study_dashboard",
    section: "mobile",
    title: "Mobile Study Dashboard",
  });
  useStudyPresence({
    source: "mobile_study_dashboard",
    route: "/study/dashboard",
    currentActivity: activeFeature,
    currentSection: activeFeature,
    title: searchQuery || "Mobile Study Dashboard",
    subject: selectedTopic,
    enabled: Boolean(user),
    details: {
      searchQuery: searchQuery || undefined,
      activeFeature,
      activeCommunityRail,
    },
  });
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

    if (captureAction === "paste") {
      setIsPasteOpen(true);
    }

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
  const regionalLabel =
    countryConfig?.name ||
    (user?.country ? String(user.country).toUpperCase() : "Global");
  const profile = useMemo(() => buildMobileLearnerProfile(user), [user]);

  const handleOpenCopilot = (seededPrompt?: string) => {
    hapticFeedback("light");
    const initialMessage = seededPrompt?.trim();
    void trackActivity({
      eventType: "study_copilot_opened",
      section: "hero_actions",
      details: {
        promptLength: initialMessage?.length || 0,
      },
    });
    navigate("/app", {
      state: initialMessage ? { initialMessage } : undefined,
    });
  };

  const closeUploadSheet = () => {
    setUploadEntryPoint(null);
    setIsUploadOpen(false);
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
  const latestStudySignal = personalizationSignals[0];
  const schoolLabel =
    countryConfig?.schools.find((school) => school.id === user?.schoolId)
      ?.name ||
    user?.schoolId ||
    "Independent";
  const currentPrompt =
    searchQuery.trim() ||
    activeRoutedJob?.summary ||
    latestStudySignal?.text ||
    dashboardBrief.coachPrompt;
  const heroContextPills = [
    {
      label: "Region",
      value: regionalLabel,
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
      value: schoolLabel,
    },
    {
      label: "Pace",
      value: profile.paceLabel,
    },
  ];

  const openMaterial = (materialId: string) => {
    const match = (recentMaterials || []).find(
      (material) => String(material._id) === materialId,
    );

    void trackActivity({
      eventType: "material_opened",
      section: "resume_activity",
      details: {
        materialId,
        hasWorkspace: Boolean(match?.docId),
      },
    });

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
    void trackActivity({
      eventType: "capture_lane_opened",
      section: "capture_lane",
    });
    document.getElementById("mobile-capture-lane")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToSection = (sectionId: string) => {
    void trackActivity({
      eventType: "section_jump",
      section: sectionId,
    });
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
      void trackActivity({
        eventType: "feature_opened",
        section: "hero_actions",
        details: {
          feature: "flashcards",
        },
      });
      startTransition(() => setActiveFeature("flashcards"));
      return;
    }

    if (actionId === "quiz") {
      void trackActivity({
        eventType: "feature_opened",
        section: "hero_actions",
        details: {
          feature: "quiz",
        },
      });
      startTransition(() => setActiveFeature("quiz"));
      return;
    }

    if (actionId === "focus") {
      void trackActivity({
        eventType: "focus_mode_requested",
        section: "hero_actions",
      });
      startTransition(() => setIsFocusModeOpen(true));
      return;
    }

    void trackActivity({
      eventType: "capture_lane_opened",
      section: "hero_actions",
    });
    startTransition(() => {
      setUploadEntryPoint("scan");
      setIsUploadOpen(true);
    });
  };

  const heroActionCards = [
    {
      id: "capture",
      title: dashboardBrief.cards[0]?.title || "Capture Source",
      description:
        dashboardBrief.cards[0]?.description ||
        "Scan notes or whiteboard to start.",
      meta: dashboardBrief.cards[0]?.meta || "Capture",
      icon: UploadCloud,
      accent: true,
      action: () =>
        startTransition(() => {
          void trackActivity({
            eventType: "capture_lane_opened",
            section: "hero_card",
            details: {
              card: "capture",
            },
          });
          setUploadEntryPoint("scan");
          setIsUploadOpen(true);
        }),
    },
    {
      id: "flashcards",
      title: dashboardBrief.cards[1]?.title || "Daily Recall",
      description:
        dashboardBrief.cards[1]?.description ||
        "Keep your recall streak alive.",
      meta: dashboardBrief.cards[1]?.meta || "Recall",
      icon: Brain,
      action: () => handleDashboardBriefAction("flashcards"),
    },
    {
      id: "quiz",
      title: dashboardBrief.cards[2]?.title || "Mock Exam",
      description:
        dashboardBrief.cards[2]?.description || "Test your latest concepts.",
      meta: dashboardBrief.cards[2]?.meta || "Practice",
      icon: Compass,
      action: () => handleDashboardBriefAction("quiz"),
    },
    {
      id: "focus",
      title: dashboardBrief.cards[3]?.title || "Deep Work",
      description:
        dashboardBrief.cards[3]?.description || "Start a guided study session.",
      meta: dashboardBrief.cards[3]?.meta || profile.paceLabel,
      icon: CalendarDays,
      action: () => handleDashboardBriefAction("focus"),
    },
  ];

  const quickJumpItems = [
    {
      id: "continue",
      label: "Continue",
      action: () =>
        featuredMaterial?._id
          ? openMaterial(String(featuredMaterial._id))
          : scrollToCaptureLane(),
    },
    {
      id: "actions",
      label: "Goals",
      action: () => scrollToSection("mobile-next-actions"),
    },
    {
      id: "shelf",
      label: "Shelf",
      action: () => scrollToSection("mobile-source-shelf"),
    },
    {
      id: "community",
      label: "Society",
      action: () => scrollToSection("mobile-community"),
    },
  ];

  const communityTabs = [
    {
      id: "school" as const,
      label: "School",
      icon: School,
      items: dashboardRails?.popularAtSchool || [],
      title: "School Network",
      description: "Shared packs from your classmates.",
      emptyMessage: "No shared assets in your school yet.",
    },
    {
      id: "regional" as const,
      label: regionalLabel,
      icon: Globe2,
      items: dashboardRails?.trendingRegional?.length
        ? dashboardRails.trendingRegional
        : localizedTrending,
      title: `Trending: ${regionalLabel}`,
      description: "Picks matched to your curriculum.",
      emptyMessage: "Regional trends will appear soon.",
    },
    {
      id: "following" as const,
      label: "Following",
      icon: Users,
      items: dashboardRails?.followingPicks || [],
      title: "Circle Picks",
      description: "High-signal lane from your follows.",
      emptyMessage: "Follow creators to see their packs.",
    },
  ];

  const activeCommunityConfig =
    communityTabs.find((tab) => tab.id === activeCommunityRail) ||
    communityTabs[0];

  const mode = useThemeStore((state) => state.mode);
  const isLight = mode === "light";

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-background font-sans text-foreground">
      {/* Background Decor */}
      <AuroraThemeBackground
        className="fixed inset-0 z-0 pointer-events-none"
        contentClassName="hidden"
      />

      <div
        className={cn(
          "relative z-10 flex flex-1 flex-col overflow-hidden px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 md:px-6",
          isTablet && "mx-auto w-full max-w-[1180px] px-5 pb-8 pt-4 lg:px-8",
        )}
      >
        <div className="custom-scrollbar flex-1 overflow-y-auto pb-32 [-webkit-overflow-scrolling:touch]">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="mx-auto max-w-4xl space-y-4"
          >
            {/* Header Hero */}
            <motion.section
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              className={cn(
                "mobile-premium-surface relative overflow-hidden rounded-[34px] p-5 sm:p-7",
                isLight
                  ? "border-primary/10 bg-white/50"
                  : "border-border bg-card/40",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors",
                    isLight
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Learning OS
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {regionalLabel}
                </div>
              </div>

              <div className="relative z-10 mt-6 max-w-2xl space-y-3">
                <p
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.3em] transition-colors",
                    isLight ? "text-primary/60" : "text-cyan-500/60",
                  )}
                >
                  {dashboardBrief.greeting}
                </p>
                <h1 className="max-w-[14ch] text-[2.15rem] font-bold leading-[1.04] text-foreground sm:max-w-2xl sm:text-5xl lg:text-6xl">
                  {dashboardBrief.headline}
                </h1>
                <p className="max-w-xl text-[15px] leading-7 text-muted-foreground">
                  {dashboardBrief.subheadline}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {[
                  profile.paceLabel,
                  profile.focusSubject,
                  dashboardBrief.momentumLabel,
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-border bg-foreground/[0.03] px-4 py-2 text-[11px] font-bold text-muted-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-2">
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

              <div className="mobile-premium-surface relative z-10 mt-6 rounded-[28px] p-4">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Coach Assistant
                  </p>
                  <Sparkles
                    className={cn(
                      "h-3.5 w-3.5 transition-colors",
                      isLight ? "text-primary/50" : "text-cyan-400/50",
                    )}
                  />
                </div>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleOpenCopilot(
                        searchQuery || dashboardBrief.coachPrompt,
                      );
                    }
                  }}
                  placeholder="I want to revise..."
                  className={cn(
                    "mt-3 w-full rounded-2xl border border-border bg-foreground/[0.05] px-5 py-4 text-[16px] text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 transition-all",
                    isLight
                      ? "focus:ring-primary/30"
                      : "focus:ring-cyan-500/30",
                  )}
                />
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {quickJumpItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="shrink-0 rounded-full border border-border bg-foreground/[0.03] px-4 py-2 text-[11px] font-bold text-muted-foreground hover:bg-foreground/[0.08] active:scale-95 transition-all"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
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
                  dashboardUrl:
                    activeRoutedJob.dashboardUrl || "/study/dashboard",
                  workspaceUrl: activeRoutedJob.workspaceUrl,
                }}
                className="w-full"
              />
            )}

            <MobileDashboardSurface
              eyebrow="Live Context"
              title="Desktop rhythm, tuned for mobile"
              description="Keep one prompt, one source, and one next move visible so the phone dashboard feels like the same study system as desktop."
              bodyClassName="space-y-4"
            >
              <div className="grid gap-4">
                <div className="mobile-premium-surface rounded-[26px] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-cyan-400/60">
                      Current prompt
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenCopilot(currentPrompt)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors",
                        isLight
                          ? "border-primary/15 bg-primary/5 text-primary hover:bg-primary/10"
                          : "border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/15",
                      )}
                    >
                      Open Copilot
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/78">
                    {currentPrompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {heroContextPills.map((pill) => (
                    <div
                      key={pill.label}
                      className="mobile-premium-surface rounded-[22px] p-3"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/38">
                        {pill.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {pill.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {dashboardBrief.starterPromptActions.map((action) => (
                    <button
                      key={action.prompt}
                      type="button"
                      aria-label={`Use coach prompt: ${action.prompt}`}
                      title={action.prompt}
                      onClick={() => setSearchQuery(action.prompt)}
                      className="shrink-0 rounded-full border border-border bg-foreground/[0.03] px-4 py-2 text-[11px] font-semibold text-foreground/72 transition-colors hover:bg-foreground/[0.08]"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>

                {featuredMaterial ? (
                  <button
                    type="button"
                    onClick={() => openMaterial(String(featuredMaterial._id))}
                    className="mobile-premium-surface flex items-start justify-between gap-4 rounded-[26px] p-4 text-left transition-transform active:scale-[0.99]"
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/38">
                        Active source
                      </p>
                      <p className="mt-2 truncate text-base font-semibold text-foreground">
                        {featuredMaterial.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Continue the material your dashboard is already routing
                        around.
                      </p>
                      <div className="mt-3 rounded-2xl border border-border bg-foreground/[0.03] px-3 py-2">
                        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-foreground/38">
                          {dashboardBrief.sourceSet.label}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-foreground/80">
                          {dashboardBrief.sourceSet.value}
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                          {dashboardBrief.sourceSet.detail}
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        isLight
                          ? "bg-primary text-white"
                          : "bg-cyan-500 text-white",
                      )}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </button>
                ) : null}
              </div>
            </MobileDashboardSurface>

            <div id="mobile-next-actions">
              <StudyGuidedNextActions
                compact
                user={user}
                recommendations={recommendations}
                recentMaterials={recentMaterials}
                dailyGoals={normalizedDailyGoals}
                onOpenFlashcards={() =>
                  startTransition(() => setActiveFeature("flashcards"))
                }
                onOpenQuiz={() =>
                  startTransition(() => setActiveFeature("quiz"))
                }
                onOpenFocus={() =>
                  startTransition(() => setIsFocusModeOpen(true))
                }
                onOpenUpload={() => {
                  setUploadEntryPoint("scan");
                  setIsUploadOpen(true);
                }}
                onContinueMaterial={openMaterial}
                onOpenRegionalTrainer={() =>
                  startTransition(() => setActiveFeature("regional_trainer"))
                }
              />
            </div>

            {/* Quick Summary / Featured */}
            <MobileDashboardSurface
              eyebrow="Resonance"
              title="Resume Activity"
              description="Pick up exactly where you left off. Your latest source and connected insights are ready."
              bodyClassName="space-y-4"
              className={cn(
                isLight ? "bg-primary/[0.02]" : "bg-cyan-500/[0.02]",
              )}
            >
              <button
                type="button"
                onClick={() =>
                  featuredMaterial?._id
                    ? openMaterial(String(featuredMaterial._id))
                    : setIsUploadOpen(true)
                }
                className={cn(
                  "mobile-premium-surface group relative w-full overflow-hidden rounded-[28px] p-5 text-left transition-all active:scale-[0.99]",
                  isLight
                    ? "border-primary/10 bg-white/40 hover:bg-white/60"
                    : "border-cyan-500/10 bg-cyan-500/[0.03] hover:bg-cyan-500/[0.06]",
                )}
              >
                <div
                  className={cn(
                    "absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl transition-colors",
                    isLight
                      ? "bg-primary/10 group-hover:bg-primary/20"
                      : "bg-cyan-500/5 group-hover:bg-cyan-500/10",
                  )}
                />
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-colors",
                    isLight ? "text-primary/50" : "text-cyan-500/50",
                  )}
                >
                  Latest Source
                </p>
                <p className="mt-2 text-xl font-bold text-foreground">
                  {featuredMaterial?.title || "Start a new session"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {featuredMaterial
                    ? "Resume deep analysis and build mastery through connected study tools."
                    : "Capture your first source to build a personalized study network."}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-6 w-6 rounded-full border border-background transition-colors",
                          isLight ? "bg-primary/20" : "bg-cyan-500/20",
                        )}
                      />
                    ))}
                  </div>
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg transition-all",
                      isLight
                        ? "bg-primary shadow-primary/20"
                        : "bg-cyan-500 shadow-cyan-500/20",
                    )}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </button>
            </MobileDashboardSurface>

            {/* Stats & Tools */}
            <MobileDashboardSurface
              eyebrow="Analytics"
              title="Study Momentum"
              description="Effort tracking and recall metrics distilled for mobile navigation."
              bodyClassName="grid gap-4 sm:grid-cols-2"
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

            {/* Capture Lane */}
            <motion.section
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 },
              }}
              className={cn(
                "rounded-[40px] border p-1 backdrop-blur-3xl transition-all duration-300",
                isLight
                  ? "border-primary/10 bg-white/40 shadow shadow-primary/5"
                  : "border-border bg-card/40 shadow-sm",
              )}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest transition-colors",
                        isLight
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
                      )}
                    >
                      Quick Capture
                    </div>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground leading-tight">
                      Sync your physical notes.
                    </h2>
                  </div>
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-all",
                      isLight
                        ? "bg-primary text-white shadow-primary/20"
                        : "bg-cyan-600 text-white shadow-cyan-600/20",
                    )}
                  >
                    <Mic className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Capture lectures, whiteboards, or handouts. We turn them into
                  high-signal study packs in seconds.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 rounded-3xl border py-8 transition-all active:scale-95",
                      isLight
                        ? "border-primary/10 bg-white/40 hover:bg-white/60 text-primary"
                        : "border-border bg-foreground/[0.03] hover:bg-foreground/[0.06] text-cyan-400",
                    )}
                  >
                    <UploadCloud className="h-6 w-6" />
                    <span
                      className={cn(
                        "text-xs font-bold transition-colors",
                        isLight ? "text-primary/60" : "text-muted-foreground",
                      )}
                    >
                      Upload PDF
                    </span>
                  </button>
                  <button
                    onClick={() => setIsPasteOpen(true)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-3 rounded-3xl border py-8 transition-all active:scale-95",
                      isLight
                        ? "border-primary/10 bg-white/40 hover:bg-white/60 text-primary"
                        : "border-border bg-foreground/[0.03] hover:bg-foreground/[0.06] text-cyan-400",
                    )}
                  >
                    <FileText className="h-6 w-6" />
                    <span
                      className={cn(
                        "text-xs font-bold transition-colors",
                        isLight ? "text-primary/60" : "text-muted-foreground",
                      )}
                    >
                      Paste Notes
                    </span>
                  </button>
                </div>
                <div className="mt-6">
                  <LectureRecorder
                    onTranscriptionComplete={handleLectureComplete}
                  />
                </div>
              </div>
            </motion.section>

            {/* Social / Community */}
            <div id="mobile-community" className="space-y-4">
              <div className="px-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Cryonex Society
                </p>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
                  The Signal Stream
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                {communityTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = tab.id === activeCommunityRail;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        hapticFeedback("light");
                        setActiveCommunityRail(tab.id);
                      }}
                      className={cn(
                        "inline-flex shrink-0 items-center gap-2.5 rounded-full border px-5 py-3 text-[13px] font-bold transition-all active:scale-95",
                        isActive
                          ? isLight
                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                            : "border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                          : isLight
                            ? "border-border bg-white/40 text-muted-foreground hover:bg-white/60"
                            : "border-border bg-foreground/[0.03] text-muted-foreground hover:bg-foreground/[0.06]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                      <span
                        className={cn(
                          "text-[10px] ml-1 transition-opacity",
                          isActive
                            ? "opacity-60 text-white"
                            : "opacity-20 text-foreground",
                        )}
                      >
                        {tab.items.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <StudyShareRail
                  eyebrow={activeCommunityConfig.label}
                  title={activeCommunityConfig.title}
                  description={activeCommunityConfig.description}
                  items={activeCommunityConfig.items}
                  emptyMessage={activeCommunityConfig.emptyMessage}
                  className={cn(
                    "transition-colors duration-300",
                    isLight ? "bg-primary/[0.02]" : "bg-white/[0.02]",
                  )}
                />
                <SuggestedStudentsPanel
                  students={schoolmates || []}
                  onToggleFollow={handleToggleFollow}
                  pendingUserId={pendingFollowUserId}
                  className={cn(
                    "rounded-[32px] border transition-colors duration-300",
                    isLight
                      ? "border-primary/10 bg-white/40"
                      : "border-white/[0.06] bg-white/[0.02]",
                  )}
                />
              </div>
            </div>

            {/* Shelf & Packs */}
            <div id="mobile-source-shelf" className="grid gap-6">
              <div className="space-y-4">
                <div className="px-1">
                  <p
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest transition-colors",
                      isLight ? "text-muted-foreground/40" : "text-white/30",
                    )}
                  >
                    Library Shelf
                  </p>
                  <h2
                    className={cn(
                      "mt-1 text-xl font-bold tracking-tight transition-colors",
                      isLight ? "text-foreground" : "text-white",
                    )}
                  >
                    Recent Sources
                  </h2>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {materialFilterChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => {
                        hapticFeedback("light");
                        setMaterialFilter(chip.id);
                      }}
                      className={cn(
                        "shrink-0 rounded-full border px-4 py-2 text-[11px] font-bold transition-all active:scale-95",
                        materialFilter === chip.id
                          ? isLight
                            ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
                            : "border-white bg-white text-black shadow-md"
                          : isLight
                            ? "border-border bg-white/40 text-muted-foreground hover:bg-white/60"
                            : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:bg-white/[0.06]",
                      )}
                    >
                      {chip.label} {chip.count ? `(${chip.count})` : ""}
                    </button>
                  ))}
                </div>
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
            </div>

            <LocalizedStudentBrief
              compact
              country={user?.country}
              region={user?.region}
              preferredLanguage={user?.preferredLanguage}
            />

            <div className="grid gap-4 md:grid-cols-2">
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
          </motion.div>
        </div>
      </div>

      {/* Persistent Floating Navigation / Actions Overlay */}
      <StudyDashboardOverlays
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature}
        isFocusModeOpen={isFocusModeOpen}
        setIsFocusModeOpen={setIsFocusModeOpen}
        allFlashcards={allFlashcards}
        selectedTopic={selectedTopic}
        user={user}
      />

      {/* Floating Action Menu for Mobile */}
      {!isTablet && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-gradient-to-t from-background via-background/95 to-transparent pb-[env(safe-area-inset-bottom)] pt-12">
          <div className="flex justify-center px-6 pb-6">
            <div
              className={cn(
                "flex min-w-[280px] max-w-sm items-center justify-between rounded-full border p-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-inset transition-all",
                isLight
                  ? "border-primary/10 bg-white/80 ring-primary/5 shadow-primary/10"
                  : "border-white/[0.12] bg-white/[0.04] ring-white/[0.08] shadow-black/40",
              )}
            >
              <button
                onClick={() => handleOpenCopilot(dashboardBrief.coachPrompt)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg active:scale-90 transition-all",
                  isLight
                    ? "bg-primary shadow-primary/30"
                    : "bg-cyan-600 shadow-cyan-600/30",
                )}
              >
                <Sparkles className="h-5 w-5" />
              </button>
              <div className="flex flex-1 items-center justify-around gap-2 px-4">
                <button
                  onClick={() => scrollToSection("mobile-next-actions")}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-colors",
                    isLight
                      ? "text-primary/60 hover:text-primary"
                      : "text-white/40 hover:text-white",
                  )}
                >
                  Goals
                </button>
                <div
                  className={cn(
                    "h-4 w-px",
                    isLight ? "bg-primary/20" : "bg-white/10",
                  )}
                />
                <button
                  onClick={() => scrollToSection("mobile-study-packs")}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-colors",
                    isLight
                      ? "text-primary/60 hover:text-primary"
                      : "text-white/40 hover:text-white",
                  )}
                >
                  Packs
                </button>
                <div
                  className={cn(
                    "h-4 w-px",
                    isLight ? "bg-primary/20" : "bg-white/10",
                  )}
                />
                <button
                  onClick={() => scrollToSection("mobile-community")}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-colors",
                    isLight
                      ? "text-primary/60 hover:text-primary"
                      : "text-white/40 hover:text-white",
                  )}
                >
                  Social
                </button>
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border transition-all active:scale-95",
                  isLight
                    ? "border-primary/10 bg-white/60 text-primary hover:bg-white/80"
                    : "border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.1]",
                )}
              >
                <UploadCloud className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {isUploadOpen && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex bg-black/60 backdrop-blur-xl",
            isTablet ? "items-center justify-center p-6" : "items-end",
          )}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeUploadSheet();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "w-full px-6 pt-6 shadow-2xl transition-colors duration-500",
              isTablet
                ? "max-w-3xl rounded-[40px] border px-7 pb-8"
                : "rounded-t-[40px] border-t pb-[calc(2rem+env(safe-area-inset-bottom))]",
              isLight
                ? "border-primary/10 bg-white/95 backdrop-blur-3xl"
                : "border-white/[0.12] bg-[#0a0625]/95 backdrop-blur-2xl",
            )}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest transition-colors",
                    isLight ? "text-primary" : "text-cyan-400",
                  )}
                >
                  Quick Ingress
                </p>
                <h2
                  className={cn(
                    "mt-2 text-2xl font-bold tracking-tight transition-colors",
                    isLight ? "text-foreground" : "text-white",
                  )}
                >
                  Add Study Material
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  closeUploadSheet();
                }}
                className={cn(
                  "h-10 w-10 flex items-center justify-center rounded-full border transition-all",
                  isLight
                    ? "border-primary/10 bg-primary/5 text-primary"
                    : "border-white/[0.08] bg-white/[0.02] text-white/40",
                )}
              >
                ✕
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
