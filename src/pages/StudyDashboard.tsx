import { useEffect, useMemo, useState } from "react";
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
import { BookOpen, BrainCircuit, Timer, Plus, Share2, Sparkles, Zap, Users, ArrowRight, Flame, Target } from "lucide-react";
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,320px]">
          {/* Main Workbench */}
          <div className="space-y-8">
            {/* ═══ 3 Main Cards ═══ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Flashcards Card */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFeature("flashcards")}
                className="deepshi-panel group relative flex flex-col items-start p-6 text-left transition-all border border-white/[0.06] hover:border-purple-500/30"
              >
                <div className="relative mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                    <BookOpen className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Flashcards</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  {allFlashcards.length} cards due for review. Clear the queue now.
                </p>
                <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-wider text-purple-400">
                  Start Session <ArrowRight className="ml-2 h-3 w-3" />
                </div>
              </motion.button>

              {/* AI Quiz Card */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFeature("quiz")}
                className="deepshi-panel group relative flex flex-col items-start p-6 text-left transition-all border border-white/[0.06] hover:border-blue-500/30"
              >
                <div className="relative mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                    <BrainCircuit className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">AI Quiz</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  Test your knowledge with AI questions from your materials.
                </p>
                <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-wider text-blue-400">
                  Generate Quiz <ArrowRight className="ml-2 h-3 w-3" />
                </div>
              </motion.button>

              {/* Focus Mode Card */}
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsFocusModeOpen(true)}
                className="deepshi-panel group relative flex flex-col items-start p-6 text-left transition-all border border-white/[0.06] hover:border-emerald-500/30"
              >
                <div className="relative mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                    <Timer className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Focus Mode</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-6">
                  Pomodoro timer and ambient sounds to keep you in the zone.
                </p>
                <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Open Timer <ArrowRight className="ml-2 h-3 w-3" />
                </div>
              </motion.button>
            </div>

            {/* Recent Uploads Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-bold text-white">Recent Uploads</h2>
                <button className="text-xs font-medium text-white/40 hover:text-white transition-colors flex items-center">
                  View All <ArrowRight className="ml-1.5 h-3 w-3" />
                </button>
              </div>

              <StudyRecentUploads
                recentMaterials={filteredMaterials}
                setIsUploadOpen={setIsUploadOpen}
                searchQuery={searchQuery}
              />
            </div>

            {/* Bottom Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Study Time", value: formatStudyTime(stats?.totalStudyTime || 0), icon: Timer, color: "text-blue-400" },
                { label: "Reviewed", value: `${stats?.flashcardsReviewed || 0}`, icon: BookOpen, color: "text-purple-400" },
                { label: "Streak", value: `${stats?.currentStreak || 0}`, icon: Flame, color: "text-orange-400" },
                { label: "Daily Goals", value: `${dailyGoals.filter(g => g.isCompleted).length}/${dailyGoals.length || 0}`, icon: Target, color: "text-emerald-400" },
              ].map((item, idx) => (
                <div key={idx} className="deepshi-panel p-4 flex items-center gap-4 bg-white/[0.02]">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]", item.color)}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-white/30 font-bold">{item.label}</p>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: Pomodoro + Activity */}
          <div className="space-y-6">
            <div className="deepshi-panel p-6 bg-[#0a0625]/90 min-h-[400px] flex flex-col border border-white/[0.06]">
              <PomodoroTimer />
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
