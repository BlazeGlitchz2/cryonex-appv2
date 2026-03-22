import { useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { DashboardActivity } from "@/components/study/DashboardActivity";
import { LectureRecorder } from "@/components/study/LectureRecorder";
import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { StudyDashboardHeader } from "@/components/study/StudyDashboardHeader";
import { StudyRecentUploads } from "@/components/study/StudyRecentUploads";
import { StudyDashboardOverlays } from "@/components/study/StudyDashboardOverlays";
import { useStudyDashboardHandlers } from "@/hooks/use-study-dashboard-handlers";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Flame,
  Mic,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const creditBalance = Number(wallet?.cryoCredits ?? 0);
  const weeklyHours =
    Math.round(
      (weeklyData || []).reduce((sum, item) => sum + (item.hours || 0), 0) * 10,
    ) / 10;

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
      navigate(`/study/${materialId}`);
    } catch (error) {
      console.error("Failed to save lecture material", error);
      toast.error("Failed to process lecture transcript.");
    }
  };

  return (
    <div className="study-dashboard-shell relative flex-1 h-screen overflow-y-auto overflow-x-hidden px-4 pb-20 pt-24 md:px-8 xl:px-10 custom-scrollbar">
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

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(320px,0.82fr)]">
          <section className="dashboard-surface rounded-[2rem] p-6 sm:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
              <div className="max-w-2xl">
                <div className="reference-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  Today
                  <Sparkles className="h-3.5 w-3.5 text-[#dfe7ff]" />
                </div>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white sm:text-[3.4rem]">
                  Turn your next source into a clean study sprint.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-white/56 sm:text-[15px]">
                  The dashboard now keeps capture, review, focus, and progress in
                  one loop so you can move from intake to practice without
                  hunting through the app.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="reference-primary-button h-11 rounded-[1rem] px-5 font-semibold hover:opacity-95"
                  >
                    Add a source
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsFocusModeOpen(true)}
                    className="reference-outline-button h-11 rounded-[1rem] px-5 font-semibold hover:bg-white/[0.06]"
                  >
                    Open focus lane
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:w-[22rem]">
                {[
                  {
                    label: "Weekly hours",
                    value: `${weeklyHours}h`,
                    icon: Timer,
                    tone: "text-[#dfe7ff]",
                  },
                  {
                    label: "Due flashcards",
                    value: `${recommendations?.dueFlashcardsCount ?? allFlashcards.length}`,
                    icon: BookOpen,
                    tone: "text-cyan-200",
                  },
                  {
                    label: "Current streak",
                    value: `${stats?.currentStreak || 0} days`,
                    icon: Flame,
                    tone: "text-amber-200",
                  },
                  {
                    label: "Credits",
                    value: `${creditBalance.toFixed(0)} CRYO`,
                    icon: Zap,
                    tone: "text-emerald-200",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="dashboard-subtle-panel rounded-[1.35rem] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/36">
                        {item.label}
                      </p>
                      <item.icon className={cn("h-4 w-4", item.tone)} />
                    </div>
                    <p className="mt-4 text-xl font-semibold text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {[
                {
                  title: "Flashcards",
                  description: `${allFlashcards.length} cards ready for spaced review.`,
                  icon: BookOpen,
                  action: "Start review",
                  onClick: () => setActiveFeature("flashcards"),
                },
                {
                  title: "AI quiz",
                  description: "Generate questions directly from your recent sources.",
                  icon: BrainCircuit,
                  action: "Create quiz",
                  onClick: () => setActiveFeature("quiz"),
                },
                {
                  title: "Focus mode",
                  description: "Keep the timer, ambient sound, and deep-work state close.",
                  icon: Timer,
                  action: "Start timer",
                  onClick: () => setIsFocusModeOpen(true),
                },
              ].map((item) => (
                <motion.button
                  key={item.title}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={item.onClick}
                  className="dashboard-subtle-panel group rounded-[1.5rem] p-5 text-left"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#dfe7ff]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white/54">
                    {item.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white/76">
                    {item.action}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          <section className="dashboard-surface rounded-[2rem] p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="reference-chip inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  Live pulse
                </div>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
                  Keep the next action obvious.
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/56">
                  The right rail keeps your review queue, weekly rhythm, and
                  today goals visible without taking over the whole page.
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[
                `Daily goals: ${dailyGoals.filter((goal) => goal.isCompleted).length}/${dailyGoals.length || 0}`,
                `Study time: ${formatStudyTime(stats?.totalStudyTime || 0)}`,
                `Recent sources: ${filteredMaterials.length}`,
              ].map((item) => (
                <div
                  key={item}
                  className="reference-chip flex items-center justify-between rounded-[1.15rem] px-4 py-3 text-sm text-white/76"
                >
                  <span>{item}</span>
                  <span className="text-white/32">•</span>
                </div>
              ))}
            </div>
            <div className="mt-6 dashboard-subtle-panel rounded-[1.5rem] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/36">
                Recommended next step
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {recommendations?.dueFlashcardsCount
                  ? "Clear the due flashcards queue before adding more material."
                  : "Capture one fresh source and route it straight into review."}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/54">
                This keeps the dashboard acting like a control room instead of a
                passive report.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-6">
          <StudyRecentUploads
            recentMaterials={filteredMaterials}
            setIsUploadOpen={setIsUploadOpen}
            searchQuery={searchQuery}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
          <DashboardActivity
            dailyGoals={dailyGoals}
            weeklyData={weeklyData}
            onAddGoal={handleAddGoal}
            onToggleGoal={(goalId, currentStatus) =>
              handleToggleGoal(goalId as any, currentStatus)
            }
          />

          <div className="space-y-6">
            <div className="dashboard-surface rounded-[2rem] p-6 min-h-[400px]">
              <PomodoroTimer />
            </div>
            <div className="dashboard-surface rounded-[2rem] p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="reference-chip inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60">
                    Capture lane
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
                    Record once, turn it into notes and review.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/56">
                    Lecture capture now sits inside the same dashboard loop as
                    uploads, flashcards, and focus mode.
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#dfe7ff]">
                  <Mic className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-5">
                <LectureRecorder onTranscriptionComplete={handleLectureComplete} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 p-4 backdrop-blur-xl"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsUploadOpen(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="dashboard-surface w-full max-w-5xl rounded-[2rem] p-6 sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/40">
                  Add material
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-white">
                  Bring a source into the study loop.
                </h2>
              </div>
              <Button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="reference-outline-button rounded-full px-4 hover:bg-white/[0.06]"
              >
                Close
              </Button>
            </div>
            <StudyUploadZone />
          </motion.div>
        </div>
      )}

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#050218]/90 backdrop-blur-xl p-4 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsUploadOpen(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-4xl overflow-hidden bg-[#0a0625]/95 border border-white/[0.06] p-6 sm:p-8 rounded-2xl backdrop-blur-xl"
          >
            <div className="mb-8 flex items-start justify-between gap-4 border-b border-white/[0.06] pb-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#D244FF]/20 bg-[#D244FF]/8 px-3 py-0.5 text-xs font-medium uppercase tracking-wider text-[#D244FF]">
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
