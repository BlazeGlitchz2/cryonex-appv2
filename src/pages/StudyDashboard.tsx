import { useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { DashboardActivity } from "@/components/study/DashboardActivity";
import { LectureRecorder } from "@/components/study/LectureRecorder";
import { StudyDashboardHeader } from "@/components/study/StudyDashboardHeader";
import { StudyFeatureCards } from "@/components/study/StudyFeatureCards";
import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { StudyRecentUploads } from "@/components/study/StudyRecentUploads";
import { StudyDashboardOverlays } from "@/components/study/StudyDashboardOverlays";
import { useStudyDashboardHandlers } from "@/hooks/use-study-dashboard-handlers";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { StudyStatsBar } from "@/components/study/StudyStatsBar";
import { StudyLevelCard } from "@/components/study/StudyLevelCard";
import {
  ArrowRight,
  BrainCircuit,
  ChevronRight,
  Clock3,
  Link2,
  Mic,
  PlayCircle,
  Sparkles,
  Timer,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY_WEEK = [
  { name: "Sun", hours: 0 },
  { name: "Mon", hours: 0 },
  { name: "Tue", hours: 0 },
  { name: "Wed", hours: 0 },
  { name: "Thu", hours: 0 },
  { name: "Fri", hours: 0 },
  { name: "Sat", hours: 0 },
];

export default function StudyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const stats = useQuery(api.study.getStats);
  const wallet = useQuery(api.credits.getWallet);
  const recommendations = useQuery(api.study.getStudyRecommendations);
  const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 6 });
  const allFlashcards = useQuery(api.study.listAllFlashcards, {}) || [];
  const dailyGoals = useQuery(api.study.getDailyGoals, { date: today }) || [];
  const weeklyData = useQuery(api.study.getWeeklyActivity, {}) || EMPTY_WEEK;
  const initializeStats = useMutation(api.study.initializeStats);
  const completedGoals = dailyGoals.filter((goal) => goal.isCompleted).length;

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

  const filteredMaterials =
    recentMaterials?.filter((material) => {
      const query = searchQuery.trim().toLowerCase();
      if (!query) return true;
      return (
        material.title?.toLowerCase().includes(query) ||
        material.type?.toLowerCase().includes(query)
      );
    }) ?? [];

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
      await generateAssets({
        materialId,
        content: text,
        title: lectureTitle,
      });
      toast.success("Study materials are ready.");
      navigate(`/study/workspace/${materialId}`);
    } catch (error) {
      console.error("Failed to save lecture material", error);
      toast.error("Failed to process lecture transcript.");
    }
  };

  const launchpadActions = [
    {
      label: "Upload source",
      description: "PDF, slides, notes, images, or files",
      icon: Upload,
      onClick: () => setIsUploadOpen(true),
    },
    {
      label: "Paste a link",
      description: "Web pages, YouTube, or copied text",
      icon: Link2,
      onClick: () => setIsUploadOpen(true),
    },
    {
      label: "Record a lecture",
      description: "Capture audio and turn it into study assets",
      icon: Mic,
      onClick: () => setIsUploadOpen(true),
    },
    {
      label: "Run review mode",
      description: "Start with flashcards or a generated quiz",
      icon: BrainCircuit,
      onClick: () => setActiveFeature("flashcards"),
    },
  ];
  const quickResume = filteredMaterials.slice(0, 3);

  return (
    <div className="study-dashboard-shell relative min-h-full overflow-x-hidden px-4 pb-20 pt-24 md:px-8 xl:px-10">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(125,211,252,0.12),transparent_22%),radial-gradient(circle_at_88%_14%,rgba(251,191,36,0.08),transparent_18%),radial-gradient(circle_at_52%_82%,rgba(16,185,129,0.07),transparent_24%)]" />
        <div className="dashboard-orb dashboard-orb-cyan" />
        <div className="dashboard-orb dashboard-orb-amber" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        className="relative z-10 mx-auto max-w-7xl animate-in fade-in duration-500"
      >
        <StudyDashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsFocusModeOpen={setIsFocusModeOpen}
          setIsUploadOpen={setIsUploadOpen}
        />

        <div className="mt-8 space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.22fr)_360px]">
            <section className="dashboard-surface rounded-[2.25rem] p-6 sm:p-7">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56">
                      <Sparkles className="h-3.5 w-3.5 text-[#7dd3fc]" />
                      Study cockpit
                    </div>
                    <h1 className="mt-5 text-[2.7rem] font-semibold leading-[0.98] tracking-[-0.06em] text-white sm:text-[3.8rem]">
                      Turn your next source into a full study system.
                    </h1>
                    <p className="mt-4 max-w-2xl text-[15px] leading-8 text-white/56 sm:text-base">
                      The dashboard is now capture-first. Drop in notes,
                      lectures, slides, or links once, then move straight into
                      review, quiz, and focus without changing surfaces.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {[
                        "PDFs, links, audio, images",
                        "One source -> every study mode",
                        "Private, source-grounded workspace",
                      ].map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/58"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="w-full max-w-sm space-y-3">
                    {[
                      {
                        label: "Due now",
                        value: `${recommendations?.dueFlashcardsCount ?? 0} cards`,
                        tone: "text-cyan-200",
                        helper: "best first move",
                      },
                      {
                        label: "Goals today",
                        value: `${completedGoals}/${dailyGoals.length || 0} complete`,
                        tone: "text-amber-200",
                        helper: "keep the queue small",
                      },
                      {
                        label: "Focus streak",
                        value: `${stats?.currentStreak ?? 0} day run`,
                        tone: "text-emerald-200",
                        helper: "consistency > intensity",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="dashboard-subtle-panel rounded-[1.5rem] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">
                              {item.label}
                            </p>
                            <p className={cn("mt-2 text-xl font-semibold", item.tone)}>
                              {item.value}
                            </p>
                          </div>
                          <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/42">
                            {item.helper}
                          </span>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setIsFocusModeOpen(true)}
                      className="dashboard-subtle-panel flex w-full items-center justify-between rounded-[1.5rem] px-4 py-4 text-left"
                    >
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/38">
                          Focus mode
                        </p>
                        <p className="mt-2 text-base font-semibold text-white">
                          Start a quiet 25-minute block
                        </p>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                        <Timer className="h-4.5 w-4.5" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.06fr)_320px]">
                  <div className="dashboard-subtle-panel rounded-[1.9rem] p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                          Capture workspace
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                          Start with the source, not the tool.
                        </h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {launchpadActions.slice(0, 3).map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            className="rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/64 transition-colors hover:bg-white/[0.06] hover:text-white"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5">
                      <StudyUploadZone
                        onUploadComplete={(docId) =>
                          navigate(`/study/workspace/${docId}`)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="dashboard-subtle-panel rounded-[1.9rem] p-4">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                        <Clock3 className="h-3.5 w-3.5 text-[#f8d082]" />
                        Quick resume
                      </div>
                      <div className="mt-4 space-y-3">
                        {quickResume.length > 0 ? (
                          quickResume.map((material) => (
                            <button
                              key={material._id}
                              type="button"
                              onClick={() =>
                                navigate(`/study/workspace/${material._id}`)
                              }
                              className="dashboard-surface dashboard-hover-lift flex w-full items-center justify-between rounded-[1.4rem] px-4 py-4 text-left"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">
                                  {material.title}
                                </p>
                                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/40">
                                  {material.type}
                                </p>
                              </div>
                              <ChevronRight className="h-4 w-4 shrink-0 text-white/34" />
                            </button>
                          ))
                        ) : (
                          <div className="rounded-[1.4rem] border border-dashed border-white/12 bg-white/[0.02] px-4 py-5 text-sm leading-6 text-white/50">
                            Your latest sources will show up here for one-tap
                            resume.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="dashboard-subtle-panel rounded-[1.9rem] p-4">
                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                        <PlayCircle className="h-3.5 w-3.5 text-[#7dd3fc]" />
                        Review lanes
                      </div>
                      <div className="mt-4 space-y-3">
                        {launchpadActions.map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={action.onClick}
                            className="dashboard-surface dashboard-hover-lift flex w-full items-center justify-between rounded-[1.4rem] px-4 py-3.5 text-left"
                          >
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {action.label}
                              </p>
                              <p className="mt-1 text-xs text-white/44">
                                {action.description}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-white/28" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-6">
              <div className="dashboard-surface rounded-[2.25rem] p-6">
                <PomodoroTimer />
              </div>

              <section className="dashboard-surface rounded-[2.25rem] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/56">
                    <Mic className="h-3.5 w-3.5 text-[#f8d082]" />
                    Capture lane
                  </div>
                  <div>
                    <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
                      Record once, study from it everywhere.
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-white/56">
                      Save a lecture, generate assets, and move straight into
                      review without rebuilding the context by hand.
                    </p>
                  </div>
                </div>
                <div className="mt-5">
                  <LectureRecorder onTranscriptionComplete={handleLectureComplete} />
                </div>
              </div>
            </section>
            </div>
          </div>

          <StudyStatsBar
            stats={stats}
            wallet={wallet}
            formatStudyTime={formatStudyTime}
            dailyGoals={dailyGoals}
            weeklyData={weeklyData}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_360px]">
            <StudyFeatureCards
              recommendations={recommendations}
              onSetActiveFeature={setActiveFeature}
              onSetIsFocusModeOpen={setIsFocusModeOpen}
            />

            <div className="space-y-6">
              <StudyLevelCard stats={stats} />

              <div className="dashboard-surface rounded-[2rem] p-4 sm:p-5">
                <div className="dashboard-subtle-panel rounded-[1.75rem] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                    Mission
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                    Keep the next move obvious.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/56">
                    The dashboard should reduce switching costs. Capture once,
                    resume fast, and keep the review loop inside one surface.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
                      {recommendations?.dueFlashcardsCount ?? 0} due now
                    </div>
                    <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
                      {allFlashcards.length} total cards
                    </div>
                    <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
                      {dailyGoals.length || 0} goals on deck
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
            <StudyRecentUploads
              recentMaterials={filteredMaterials}
              setIsUploadOpen={setIsUploadOpen}
              searchQuery={searchQuery}
            />

            <div className="dashboard-surface rounded-[2.25rem] p-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                    Study queue
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                    Use the dashboard like a workbench.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-white/56">
                    Capture, resume, review, and track progress without leaving
                    this surface. That is the combined Turbo + Deepshi direction.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    "Bring in the next source.",
                    "Generate review assets automatically.",
                    "Return to the strongest active source.",
                    "Close the loop with goals and streaks.",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="dashboard-subtle-panel flex items-center gap-3 rounded-[1.3rem] px-4 py-3"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-white/70">
                        {index + 1}
                      </span>
                      <span className="text-sm text-white/76">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DashboardActivity
            dailyGoals={dailyGoals}
            weeklyData={weeklyData}
            onAddGoal={handleAddGoal}
            onToggleGoal={(goalId, currentStatus) =>
              handleToggleGoal(goalId as any, currentStatus)
            }
          />
        </div>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090d]/88 p-4 backdrop-blur-xl sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsUploadOpen(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="dashboard-surface w-full max-w-4xl overflow-hidden rounded-[2rem] p-6 sm:p-8"
          >
            <div className="mb-8 flex items-start justify-between gap-4 border-b border-white/[0.06] pb-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7dd3fc]/20 bg-[#7dd3fc]/8 px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-[#7dd3fc]">
                  Add material
                </div>
                <h2 className="mt-4 text-xl font-medium tracking-tight text-white/90">
                  Bring in your next source
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  PDFs, images, recordings, and links all feed the same study
                  workflow.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="rounded-full border border-white/[0.06] bg-white/[0.04] px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-white/60 transition-colors hover:bg-white/[0.08] hover:text-white"
              >
                Close
              </button>
            </div>
            <StudyUploadZone onUploadComplete={() => setIsUploadOpen(false)} />
          </motion.div>
        </div>
      )}
    </div>
  );
}
