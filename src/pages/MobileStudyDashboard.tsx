import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Mic,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
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
import { LocalizedStudentBrief } from "@/components/study/LocalizedStudentBrief";
import { IGCSEStudioPanel } from "@/components/study/IGCSEStudioPanel";
import {
  SuggestedStudentsPanel,
  StudyShareRail,
} from "@/components/study/StudySocialSurfaces";

const EMPTY_WEEK = [
  { name: "Sun", hours: 0 },
  { name: "Mon", hours: 0 },
  { name: "Tue", hours: 0 },
  { name: "Wed", hours: 0 },
  { name: "Thu", hours: 0 },
  { name: "Fri", hours: 0 },
  { name: "Sat", hours: 0 },
];

export default function MobileStudyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const today = new Date().toISOString().split("T")[0];
  const routeJobId = searchParams.get("routeJob");
  const captureAction =
    searchParams.get("action") || searchParams.get("quickCapture");
  const routedStudyJobs = useStudyRouterStore((state) => state.jobs);
  const personalizationSignals = useStudyRouterStore((state) => state.signals);

  const stats = useQuery(api.study.getStats);
  const wallet = useQuery(api.credits.getWallet);
  const recommendations = useQuery(api.study.getStudyRecommendations);
  const studyPacks =
    useQuery(api.study.getRecentStudyPacks, { limit: 3 }) || [];
  const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 4 });
  const dashboardRails = useQuery(
    api.social.getDashboardRails,
    user ? { limit: 4 } : "skip",
  );
  const recentIgcsePlans =
    useQuery(api.igcse.listRecentPlans, { limit: 2 }) || [];
  const schoolmates = useQuery(
    api.social.getSuggestedSchoolmates,
    user ? { limit: 3 } : "skip",
  );
  const localizedTrending =
    useQuery(
      api.social.getLocalizedTrendingAssets,
      user ? { limit: 4 } : "skip",
    ) || [];
  const allFlashcards = useQuery(api.study.listAllFlashcards, {}) || [];
  const dailyGoals = useQuery(api.study.getDailyGoals, { date: today }) || [];
  const weeklyData = useQuery(api.study.getWeeklyActivity, {}) || EMPTY_WEEK;
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

  const handleOpenCopilot = () => {
    hapticFeedback("light");
    navigate("/study/copilot");
  };
  const handleOpenIgcseStudio = () => {
    hapticFeedback("light");
    navigate("/study/igcse");
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
          "Help me turn my latest study material into something I can revise from.",
      },
    });
  };

  const filteredMaterials =
    recentMaterials?.filter((material) => {
      const query = searchQuery.trim().toLowerCase();
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

  const scrollToCaptureLane = () => {
    document.getElementById("mobile-capture-lane")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  return (
    <div className="study-dashboard-shell study-dyslexia relative min-h-full overflow-x-hidden px-3 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 md:px-6 md:pt-5">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(210,114,255,0.08),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(61,193,255,0.08),transparent_24%),linear-gradient(180deg,#07031c_0%,#050218_58%,#040114_100%)]" />
        <div className="absolute left-[-18%] top-[6%] h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-[-14%] top-[24%] h-64 w-64 rounded-full bg-amber-400/10 blur-[130px]" />
        <div className="absolute bottom-[10%] left-[16%] h-60 w-60 rounded-full bg-white/4 blur-[130px]" />
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
          className="deepshi-panel overflow-hidden rounded-[30px] border border-white/10 p-4 sm:p-5 md:p-6"
        >
          <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(260px,0.85fr)] md:gap-5">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  <Sparkles className="h-3.5 w-3.5 text-[#D8A2FF]" />
                  Deepshi-inspired mobile study OS
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
                  {countryConfig?.flag || "🌍"} {regionalLabel}
                </div>
              </div>

              <div className="max-w-xl">
                <h1 className="text-3xl font-semibold tracking-[-0.06em] text-white sm:text-[2.25rem] lg:text-[2.65rem]">
                  Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
                  .
                </h1>
                <p className="mt-2 text-sm leading-6 text-white/56 sm:text-[15px] md:text-[16px] md:leading-7">
                  Build your next study lane, launch Copilot, or jump straight
                  into a focused revision sprint.
                </p>
              </div>
            </div>

            <div className="grid gap-2 rounded-[24px] border border-white/10 bg-white/[0.03] p-3 md:p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Study context
                </p>
                <span className="rounded-full border border-white/8 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/45">
                  Native shell
                </span>
              </div>
              <div className="grid gap-2">
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/36">
                    School
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/88">
                    {schoolName}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/36">
                    Curriculum
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/88">
                    {personalization?.curriculum ||
                      user?.curriculumTrack ||
                      user?.curriculum ||
                      "General"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/36">
                    Mode
                  </p>
                  <p className="mt-1 text-sm font-medium text-white/88">
                    Mobile-first with tablet breathing room
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="deepshi-prompt-panel mt-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,6,37,0.88),rgba(8,5,25,0.94))] p-3 shadow-[0_20px_60px_rgba(4,2,18,0.32)] md:mt-5 md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] md:gap-3 md:p-4">
            <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">
                Study prompt
              </p>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleOpenCopilot();
                  }
                }}
                placeholder="I want to study biology, revise math, or turn notes into a quiz..."
                className="mt-2 w-full bg-transparent text-[17px] leading-7 text-white placeholder:text-white/30 focus:outline-none"
              />

              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                <button
                  type="button"
                  onClick={handleOpenCopilot}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-black"
                >
                  Open Study Copilot
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleOpenAssistant}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white"
                >
                  Open Assistant
                </button>
                {[
                  ["Focus", "Launch a deep work session"],
                  ["Flashcards", "Review weak topics"],
                  ["Quiz", "Test me quickly"],
                  ["Upload", "Capture new material"],
                  ["IGCSE", "Open the board and paper studio"],
                ].map(([label, description]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      if (label === "Upload") {
                        setIsUploadOpen(true);
                      } else if (label === "Focus") {
                        setIsFocusModeOpen(true);
                      } else if (label === "Flashcards") {
                        setActiveFeature("flashcards");
                      } else if (label === "Quiz") {
                        setActiveFeature("quiz");
                      } else if (label === "IGCSE") {
                        handleOpenIgcseStudio();
                      }
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left"
                  >
                    <p className="text-[12px] font-semibold text-white/88">
                      {label}
                    </p>
                    <p className="mt-1 text-[10px] leading-4 text-white/40">
                      {description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4 md:mt-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/34">
                Quick briefing
              </p>
              <div className="mt-3 space-y-2">
                <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/36">
                    Best on tablet
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    Wider screens keep the action grid readable without
                    stretching the page.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/36">
                    Native behavior
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    Safe-area padding, denser touch targets, and lower visual
                    noise.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/20 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/36">
                    Your lane
                  </p>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    {selectedTopic ||
                      searchQuery ||
                      "Turn notes, sources, and lectures into revision material."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["Country", countryConfig?.name || "Global"],
              [
                "Privacy",
                personalization?.profileVisibility ||
                  user?.profileVisibility ||
                  "private",
              ],
              [
                "Network",
                user?.schoolNetworkOptIn
                  ? "School network on"
                  : "Private by default",
              ],
              ["Grade", user?.gradeLevel || "Not set"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/36">
                  {label}
                </span>
                <span className="max-w-[55%] truncate text-sm text-white/86">
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

        <div className="grid gap-3">
          <StudyStatsBar
            stats={stats}
            wallet={wallet}
            formatStudyTime={formatStudyTime}
            dailyGoals={dailyGoals}
            weeklyData={weeklyData}
            compact
          />
        </div>

        <motion.section
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="deepshi-panel rounded-[28px] border border-white/10 px-5 py-6"
        >
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D072FF]/30 bg-[#D072FF]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E6CBFF]">
              Study Sets
            </div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-white sm:text-[2rem]">
              What do you want to master?
            </h2>
              <p className="mt-3 text-sm leading-6 text-white/56 sm:text-[15px]">
                Upload, paste, or record and turn it into focused revision
                material.
              </p>
            </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                <UploadCloud className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Upload</h3>
              <p className="mt-1 text-sm text-white/52">
                PDFs, screenshots, and files.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setIsPasteOpen(true)}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-200">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Paste</h3>
              <p className="mt-1 text-sm text-white/52">
                Lecture notes, excerpts, bilingual text.
              </p>
            </button>

            <button
              type="button"
              onClick={scrollToCaptureLane}
              className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 text-left"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                <Mic className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">Record</h3>
              <p className="mt-1 text-sm text-white/52">
                Capture a lecture and build a study pack.
              </p>
            </button>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                  Quick modes
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Jump into the next best lane
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/52">
                  The strongest next action is already above. This lane stays
                  here to keep a quiet reminder visible while you scroll.
                </p>
              </div>
              <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
                {recommendations?.dueFlashcardsCount ?? 0} due
              </div>
            </div>
          </div>
        </motion.section>

        <IGCSEStudioPanel
          plans={recentIgcsePlans}
          compact
          onOpenStudio={handleOpenIgcseStudio}
          onContinuePlan={(planId) => navigate(`/study/igcse?planId=${planId}`)}
          onOpenArtifact={(plan) => {
            if (plan.packId) {
              navigate(`/study/packs/${plan.packId}`);
              return;
            }

            if (plan.docId) {
              navigate(`/study/workspace/${plan.docId}`);
            }
          }}
        />

        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
              Explore
            </p>
            <h2 className="mt-2 text-lg font-bold text-white">
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
                    : "border-white/10 bg-white/[0.03] text-white/72"
                }`}
              >
                {chip.label} {chip.count ? `(${chip.count})` : ""}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
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
            searchQuery={searchQuery}
          />
        </div>

        <StudyPacksSection
          compact
          packs={studyPacks}
          onCreateFromNotes={() => setIsPasteOpen(true)}
          onCreateFromSource={scrollToCaptureLane}
        />

        <StudyFeatureCards
          compact
          recommendations={recommendations}
          onSetActiveFeature={setActiveFeature}
          onSetIsFocusModeOpen={setIsFocusModeOpen}
        />

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)]">
          <div className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">
                Community
              </p>
              <h2 className="mt-2 text-lg font-bold text-white">
                Browse your shared study network
              </h2>
            </div>

            <StudyShareRail
              eyebrow="School"
              title="Popular at your school"
              description="What your classmates are sharing right now."
              items={dashboardRails?.popularAtSchool || []}
              emptyMessage="School shared study assets will appear here once classmates publish them."
            />

            <StudyShareRail
              eyebrow="Regional"
              title={`Trending in ${regionalLabel}`}
              description="Localized picks for your country and curriculum."
              items={
                dashboardRails?.trendingRegional?.length
                  ? dashboardRails.trendingRegional
                  : localizedTrending
              }
              emptyMessage="Regional study assets will appear here as your network grows."
            />
          </div>

          <SuggestedStudentsPanel
            students={schoolmates || []}
            onToggleFollow={handleToggleFollow}
            pendingUserId={pendingFollowUserId}
            className="border border-white/10 bg-white/[0.03]"
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
            dailyGoals={dailyGoals}
            weeklyData={weeklyData}
            onAddGoal={handleAddGoal}
            onToggleGoal={(goalId, currentStatus) =>
              handleToggleGoal(goalId as any, currentStatus)
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
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                Capture lane
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                Record once, study from it everywhere.
              </h2>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-100">
              <Mic className="h-4.5 w-4.5" />
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/58">
            This recorder is now friendlier to device differences, including
            browsers that prefer non-WebM audio formats.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
              Audio to notes
            </div>
            <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
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
        user={user as any}
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/75">
                  Add material
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Capture your next source
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  hapticFeedback("light");
                  closeUploadSheet();
                }}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm text-white/65"
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
