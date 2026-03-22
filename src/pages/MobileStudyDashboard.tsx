import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Mic, Sparkles } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { DashboardActivity } from "@/components/study/DashboardActivity";
import { LectureRecorder } from "@/components/study/LectureRecorder";
import { MobileStudyUploadZone } from "@/components/study/MobileStudyUploadZone";
import { StudyDashboardHeader } from "@/components/study/StudyDashboardHeader";
import { StudyStatsBar } from "@/components/study/StudyStatsBar";
import { StudyFeatureCards } from "@/components/study/StudyFeatureCards";
import { StudyRecentUploads } from "@/components/study/StudyRecentUploads";
import { StudyLevelCard } from "@/components/study/StudyLevelCard";
import { StudyDashboardOverlays } from "@/components/study/StudyDashboardOverlays";
import { useStudyDashboardHandlers } from "@/hooks/use-study-dashboard-handlers";
import { hapticFeedback } from "@/lib/mobile";

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
  const today = new Date().toISOString().split("T")[0];

  const stats = useQuery(api.study.getStats);
  const wallet = useQuery(api.credits.getWallet);
  const recommendations = useQuery(api.study.getStudyRecommendations);
  const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 4 });
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

  return (
    <div className="study-dashboard-shell study-dyslexia relative min-h-full overflow-x-hidden px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-4">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.08),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(251,191,36,0.08),transparent_22%)]" />
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
        className="relative z-10 mx-auto max-w-2xl space-y-4"
      >
        <StudyDashboardHeader
          compact
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsFocusModeOpen={setIsFocusModeOpen}
          setIsUploadOpen={setIsUploadOpen}
          userName={user?.name}
          recommendations={recommendations}
          dailyGoals={dailyGoals}
          stats={stats}
        />

        <motion.section
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="dashboard-surface rounded-[2rem] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/56">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Capture first
              </div>
              <h2 className="mt-3 text-[1.7rem] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                Start with the source, then let the dashboard do the rest.
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/56">
                This is the fastest path into notes, flashcards, quiz, and
                focus.
              </p>
            </div>
          </div>
          <div className="mt-5">
            <MobileStudyUploadZone
              onUploadComplete={(docId) => navigate(`/study/workspace/${docId}`)}
            />
          </div>
        </motion.section>

        <StudyRecentUploads
          compact
          recentMaterials={filteredMaterials}
          setIsUploadOpen={setIsUploadOpen}
          searchQuery={searchQuery}
        />

        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                Quick modes
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">
                Jump into the next clean lane
              </h2>
            </div>
            <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
              {recommendations?.dueFlashcardsCount ?? 0} due
            </div>
          </div>
          <StudyFeatureCards
            compact
            recommendations={recommendations}
            onSetActiveFeature={setActiveFeature}
            onSetIsFocusModeOpen={setIsFocusModeOpen}
          />
        </div>

        <StudyStatsBar
          stats={stats}
          wallet={wallet}
          formatStudyTime={formatStudyTime}
          dailyGoals={dailyGoals}
          weeklyData={weeklyData}
          compact
        />

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

        <motion.section
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="dashboard-surface rounded-[2rem] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Study queue
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-white">
                Keep the next move obvious.
              </h2>
            </div>
            <div className="glass-stat-chip rounded-full px-3 py-2 text-sm text-white/78">
              {dailyGoals.length || 0} goals
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[
              "Capture your next source.",
              "Resume the strongest active material.",
              "Use a review lane before switching context.",
            ].map((item, index) => (
              <div
                key={item}
                className="dashboard-subtle-panel flex items-center justify-between rounded-[1.35rem] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-xs font-semibold text-white/70">
                    {index + 1}
                  </span>
                  <span className="text-sm text-white/76">{item}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-white/26" />
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
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
          className="fixed inset-0 z-50 flex items-end bg-[#05070c]/86 backdrop-blur-xl"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsUploadOpen(false);
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
                  setIsUploadOpen(false);
                }}
                className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-sm text-white/65"
              >
                Close
              </button>
            </div>
            <MobileStudyUploadZone
              onUploadComplete={() => setIsUploadOpen(false)}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
