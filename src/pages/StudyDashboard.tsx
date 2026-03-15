import React from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { DashboardActivity } from "@/components/study/DashboardActivity";
import { LectureRecorder } from "@/components/study/LectureRecorder";
import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { MobileStudyUploadZone } from "@/components/study/MobileStudyUploadZone";
import { useIsMobile } from "@/hooks/use-mobile";

// Modular Imports
import { StudyDashboardHeader } from "@/components/study/StudyDashboardHeader";
import { StudyStatsBar } from "@/components/study/StudyStatsBar";
import { StudyFeatureCards } from "@/components/study/StudyFeatureCards";
import { StudyRecentUploads } from "@/components/study/StudyRecentUploads";
import { StudyLevelCard } from "@/components/study/StudyLevelCard";
import { StudyDashboardOverlays } from "@/components/study/StudyDashboardOverlays";
import { useStudyDashboardHandlers } from "@/hooks/use-study-dashboard-handlers";
import { QuickCaptureBar } from "@/components/ui/QuickCaptureBar";

export default function StudyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Queries
  const stats = useQuery(api.study.getStats);
  const wallet = useQuery(api.credits.getWallet);
  const recommendations = useQuery(api.study.getStudyRecommendations);
  const recentMaterials = useQuery(api.study.getRecentMaterials, {});
  const allFlashcards = useQuery(api.study.listAllFlashcards, {}) || [];
  const today = new Date().toISOString().split('T')[0];
  const dailyGoals = useQuery(api.study.getDailyGoals, { date: today }) || [];
  const weeklyData = useQuery(api.study.getWeeklyActivity, {}) || [];

  // Hooks
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

  return (
    <div className="flex-1 min-h-screen bg-transparent relative overflow-x-hidden overflow-y-auto custom-scrollbar pt-20 pb-24 md:pb-12 px-4 md:px-8 lg:px-12">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
        }}
        className="max-w-7xl mx-auto space-y-8 md:space-y-12"
      >
        {/* ═══ HEADER SECTION ═══ */}
        <StudyDashboardHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsFocusModeOpen={setIsFocusModeOpen}
          setIsUploadOpen={setIsUploadOpen}
        />

        {/* ═══ STATS BAR ═══ */}
        <StudyStatsBar
          stats={stats}
          wallet={wallet}
          formatStudyTime={formatStudyTime}
        />

        {/* ═══ QUICK ACTIONS / FEATURE CARDS ═══ */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            AI Study Tools
          </h2>
          <StudyFeatureCards
            recommendations={recommendations}
            onSetActiveFeature={setActiveFeature as any}
            onSetIsFocusModeOpen={setIsFocusModeOpen}
          />
        </div>

        {/* ═══ RECENT UPLOADS ═══ */}
        <StudyRecentUploads
          recentMaterials={recentMaterials}
          setIsUploadOpen={setIsUploadOpen}
        />

        {/* ═══ BOTTOM GRID: Goals + Chart ═══ */}
        <DashboardActivity
          dailyGoals={dailyGoals}
          weeklyData={weeklyData}
          onAddGoal={() => {
            const text = prompt("Enter new daily goal:");
            if (text) (handleAddGoal as any)(text);
          }}
          onToggleGoal={(goalId) => {
            const goal = dailyGoals.find((g: { _id: string; isCompleted: boolean }) => g._id === (goalId as unknown as string));
            handleToggleGoal(goalId as any, goal?.isCompleted || false);
          }}
        />

        {/* ═══ LEVEL + LECTURE RECORDER ROW ═══ */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          <StudyLevelCard stats={stats} />

          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            className="p-5 md:p-6 glass-panel group hover:border-pink-500/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-pink-500/8 border border-pink-500/15 flex items-center justify-center">
                <Mic className="w-4 h-4 text-pink-400" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white">
                  Lecture Recorder
                </h3>
                <p className="text-[10px] text-white/20">
                  Transcribe class audio instantly
                </p>
              </div>
            </div>
            <LectureRecorder
              onTranscriptionComplete={async ({ text, audioStorageId }) => {
                try {
                  const lectureTitle = `Lecture Audio ${new Date().toLocaleDateString()}`;
                  const materialId = await createMaterial({
                    title: lectureTitle,
                    type: "audio",
                    content: text,
                    storageId: audioStorageId as any,
                  });
                  toast.success("Transcribed! Generating AI study materials...");
                  await generateAssets({
                    materialId: materialId,
                    content: text,
                    title: lectureTitle,
                  });
                  toast.success("Study materials generated!");
                  navigate(`/study/${materialId}`);
                } catch (error) {
                  console.error("Failed to save lecture material", error);
                  toast.error("Failed to process lecture transcript");
                }
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ═══ FEATURE OVERLAYS ═══ */}
      <StudyDashboardOverlays
        activeFeature={activeFeature}
        setActiveFeature={setActiveFeature as any}
        isFocusModeOpen={isFocusModeOpen}
        setIsFocusModeOpen={setIsFocusModeOpen}
        allFlashcards={allFlashcards}
        selectedTopic={selectedTopic}
        user={user as any}
      />

      {/* ═══ UPLOAD DIALOG ═══ */}
      {isUploadOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsUploadOpen(false);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-4xl max-h-[90vh] glass-panel"
          >
            <div className="overflow-y-auto max-h-[90vh] p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Upload Study Material
                  </h2>
                  <p className="text-sm text-white/40 font-medium">
                    PDFs, Images, or Class Recordings
                  </p>
                </div>
                <button
                  onClick={() => setIsUploadOpen(false)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              {isMobile ? (
                <MobileStudyUploadZone />
              ) : (
                <StudyUploadZone onUploadComplete={() => setIsUploadOpen(false)} />
              )}
            </div>
          </motion.div>
        </div>
      )}

      {isMobile && <QuickCaptureBar />}
    </div>
  );
}
