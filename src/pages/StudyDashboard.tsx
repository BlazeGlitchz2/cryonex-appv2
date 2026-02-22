import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Sparkles,
  Network,
  BookOpen,
  BrainCircuit,
  Timer,
  Clock,
  Zap,
  Mic,
  ChevronRight,
  Search,
  Bell,
  Play,
  Users,
  Copy,
  Share2,
  Trophy,
  ArchiveRestore,
  ArrowRight,
  Flame,
  GraduationCap,
  X,
  Brain,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FlashcardMode } from "@/components/study/FlashcardMode";
import { QuizGenerator } from "@/components/study/QuizGenerator";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { LectureRecorder } from "@/components/study/LectureRecorder";
import { FocusMode } from "@/components/study/FocusMode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation, useAction } from "convex/react";
import { cn } from "@/lib/utils";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { RegionalTrainer } from "@/components/study/RegionalTrainer";

export default function StudyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<
    "dashboard" | "flashcards" | "quiz" | "regional_trainer"
  >("dashboard");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Data
  const stats = useQuery(api.study.getStats);
  const dailyGoals = useQuery(api.study.getDailyGoals, {
    date: new Date().toISOString().split("T")[0],
  });
  const recommendations = useQuery(api.study.getStudyRecommendations);
  const allFlashcards = useQuery(api.study.listAllFlashcards) || [];
  const weeklyActivity = useQuery(api.study.getWeeklyActivity);
  const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 4 });
  const wallet = useQuery(api.credits.getWallet);
  const allMaterials = useQuery(
    api.study.listMaterials,
    isLibraryOpen ? {} : "skip",
  );

  // Mutations & Actions
  const createGoal = useMutation(api.study.createGoal);
  const completeGoal = useMutation(api.study.completeGoal);
  const initializeStats = useMutation(api.study.initializeStats);
  const createMaterial = useMutation(api.study.createMaterial);
  const generateAssets = useAction(api.autoGenerate.generateAllAssets);
  const generateAffiliateCode = useMutation(api.viral.generateAffiliateCode);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const handleOpenReferral = async () => {
    setIsReferralOpen(true);
    try {
      const code = await generateAffiliateCode();
      setReferralCode(code);
    } catch (e) {
      toast.error("Failed to generate code");
    }
  };

  useEffect(() => {
    if (user && stats === null) initializeStats();
  }, [user, stats, initializeStats]);

  const handleAddGoal = async () => {
    const text = prompt("Enter a new daily goal:");
    if (text) {
      await createGoal({ text, date: new Date().toISOString().split("T")[0] });
      toast.success("Goal added!");
    }
  };

  const handleToggleGoal = async (goalId: any, currentStatus: boolean) => {
    await completeGoal({ goalId, isCompleted: !currentStatus });
  };

  const weeklyData = weeklyActivity || [
    { name: "Sun", hours: 0 },
    { name: "Mon", hours: 0 },
    { name: "Tue", hours: 0 },
    { name: "Wed", hours: 0 },
    { name: "Thu", hours: 0 },
    { name: "Fri", hours: 0 },
    { name: "Sat", hours: 0 },
  ];

  const formatStudyTime = (ms: number) => {
    if (!ms) return "0m";
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  /* ─── Feature card data ─── */
  const featureCards = [
    {
      id: "flashcards" as const,
      title: "Flashcards",
      desc: `${recommendations?.dueFlashcardsCount || 0} cards due today`,
      icon: BookOpen,
      accent: "cyan",
      action: () => setActiveFeature("flashcards"),
      tourId: "study-flashcards",
    },
    {
      id: "quiz" as const,
      title: "AI Quiz",
      desc: "Test your knowledge",
      icon: BrainCircuit,
      accent: "blue",
      action: () => setActiveFeature("quiz"),
      tourId: "study-quiz",
    },
    {
      id: "focus" as const,
      title: "Deep Focus",
      desc: "Pomodoro + ambient",
      icon: Timer,
      accent: "emerald",
      action: () => setIsFocusModeOpen(true),
      tourId: "study-focus",
      live: true,
    },
  ];

  const accentMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    cyan: {
      bg: "bg-cyan-500/8",
      border: "border-cyan-500/15",
      text: "text-cyan-400",
      glow: "group-hover:shadow-[0_0_20px_rgba(34,211,238,0.06)]",
    },
    blue: {
      bg: "bg-blue-500/8",
      border: "border-blue-500/15",
      text: "text-blue-400",
      glow: "group-hover:shadow-[0_0_20px_rgba(59,130,246,0.06)]",
    },
    emerald: {
      bg: "bg-emerald-500/8",
      border: "border-emerald-500/15",
      text: "text-emerald-400",
      glow: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.06)]",
    },
    amber: {
      bg: "bg-amber-500/8",
      border: "border-amber-500/15",
      text: "text-amber-400",
      glow: "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.06)]",
    },
  };

  return (
    <div className="flex-1 h-full w-full relative overflow-y-auto custom-scrollbar bg-[#09090b] text-white selection:bg-cyan-500/20 pb-safe pt-safe overflow-x-hidden">
      {/* Ambient background with animated orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#09090b]">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-cyan-600/15 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.12, 0.2, 0.12] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] -right-[15%] w-[50vw] h-[50vw] max-w-[550px] max-h-[550px] rounded-full bg-blue-600/10 blur-[120px]"
        />
        <div className="absolute -bottom-[15%] left-[25%] w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] rounded-full bg-teal-600/[0.06] blur-[100px]" />
      </div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
          },
        }}
        className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-5 md:py-8 space-y-6 md:space-y-8 pb-28 md:pb-8"
      >
        <OnboardingTour
          tourId="study-dashboard"
          steps={[
            {
              targetId: "study-upload",
              title: "Upload Materials",
              description:
                "Start here! Upload PDFs, videos, or audio to generate flashcards and quizzes.",
              position: "bottom",
            },
            {
              targetId: "study-flashcards",
              title: "Smart Flashcards",
              description:
                "Review generated flashcards with spaced repetition to master concepts.",
              position: "bottom",
            },
            {
              targetId: "study-quiz",
              title: "AI Quiz",
              description:
                "Test your knowledge with dynamic quizzes based on your uploads.",
              position: "bottom",
            },
            {
              targetId: "study-focus",
              title: "Deep Focus",
              description:
                "Use the Pomodoro timer and ambient sounds to stay in the zone.",
              position: "bottom",
            },
          ]}
        />

        {/* ═══ HEADER ═══ */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/15">
              <Brain className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight">
                Study Dashboard
              </h1>
              <p className="text-sm text-white/40 font-medium mt-0.5">
                Your central command for mastery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/40 placeholder:text-white/25 transition-all"
              />
            </div>

            {/* Quick actions */}
            <button
              onClick={() => setIsFocusModeOpen(true)}
              className="hidden sm:flex h-10 px-4 items-center gap-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.06] transition-all"
            >
              <Clock className="w-4 h-4 text-emerald-400" />
              Focus
            </button>

            <LectureRecorder />

            <Button
              onClick={() => setIsUploadOpen(true)}
              className="h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-sm px-5 hover:from-cyan-400 hover:to-blue-400 shadow-lg shadow-cyan-500/15 border-0 transition-all active:scale-[0.97]"
              id="study-upload"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Upload
            </Button>
          </div>
        </motion.div>

        {/* ═══ INLINE STATS BAR ═══ */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          className="flex items-center gap-3 overflow-x-auto no-scrollbar"
        >
          {[
            {
              icon: Clock,
              label: "Study Time",
              value: stats ? formatStudyTime(stats.totalStudyTime) : "0m",
              color: "text-cyan-400",
              bgColor: "bg-cyan-500/8",
            },
            {
              icon: BookOpen,
              label: "Reviewed",
              value: `${stats?.flashcardsReviewed || 0}`,
              color: "text-blue-400",
              bgColor: "bg-blue-500/8",
            },
            {
              icon: Flame,
              label: "Streak",
              value: `${stats?.currentStreak || 0}d`,
              color: "text-amber-400",
              bgColor: "bg-amber-500/8",
            },
            {
              icon: Zap,
              label: "Level",
              value: `Lv ${stats?.level || 1}`,
              color: "text-emerald-400",
              bgColor: "bg-emerald-500/8",
            },
            ...(wallet !== undefined
              ? [
                {
                  icon: ShieldCheck,
                  label: "CRYO",
                  value: `${wallet?.cryoCredits || 0}`,
                  color: "text-teal-400",
                  bgColor: "bg-teal-500/8",
                },
              ]
              : []),
          ].map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0"
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", stat.bgColor)}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-white tabular-nums">
                  {stat.value}
                </span>
                <span className="text-xs text-white/30 font-medium hidden md:inline">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ═══ FEATURE CARDS ═══ */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {featureCards.map((card) => {
            const a = accentMap[card.accent];
            return (
              <div
                key={card.id}
                id={card.tourId}
                onClick={card.action}
                className={cn(
                  "group relative p-5 md:p-6 rounded-2xl border bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] cursor-pointer transition-all duration-300 touch-feedback hover:-translate-y-0.5",
                  "border-white/[0.07] hover:border-white/[0.12]",
                  a.glow,
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", a.bg, a.border)}>
                    <card.icon className={cn("w-5 h-5", a.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white leading-tight">
                      {card.title}
                    </h3>
                  </div>
                  {card.live && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] uppercase font-bold text-emerald-400 tracking-wider">
                        Live
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  {card.desc}
                </p>
                {/* Hover arrow */}
                <ArrowRight className="absolute bottom-5 right-5 w-4 h-4 text-white/0 group-hover:text-white/25 transition-all group-hover:translate-x-0.5" />
              </div>
            );
          })}

          {/* Regional Training — always visible, adapts to user's region */}
          {user?.region && (
            <div
              onClick={() => {
                if (user.region === "ksa" || user.region === "egypt") {
                  setActiveFeature("regional_trainer");
                } else {
                  toast.info("Regional training coming soon for your region!");
                }
              }}
              className={cn(
                "group relative p-5 md:p-6 rounded-2xl border bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] cursor-pointer transition-all duration-300 touch-feedback hover:-translate-y-0.5",
                "border-white/[0.07] hover:border-white/[0.12]",
                "group-hover:shadow-[0_0_20px_rgba(245,158,11,0.06)]",
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-amber-500/8 border-amber-500/15">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white leading-tight">
                    {user.region === "ksa"
                      ? "Qiyas Trainer"
                      : user.region === "egypt"
                        ? "Thanaweyya Amma"
                        : "Exam Trainer"}
                  </h3>
                </div>
                {(user.region === "ksa" || user.region === "egypt") ? (
                  <span className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/15">Ready</span>
                ) : (
                  <span className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/[0.04] text-white/25 border border-white/[0.06]">Soon</span>
                )}
              </div>
              <p className="text-sm text-white/40 leading-relaxed">
                {user.region === "ksa"
                  ? "Master GAT & Tahsili with AI-powered drills"
                  : user.region === "egypt"
                    ? "Ace ministry exams with AI precision"
                    : "Region-specific exam prep coming soon"}
              </p>
              <ArrowRight className="absolute bottom-5 right-5 w-4 h-4 text-white/0 group-hover:text-white/25 transition-all group-hover:translate-x-0.5" />
            </div>
          )}
        </motion.div>

        {/* ═══ RECENT UPLOADS ═══ */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">
              Recent Uploads
            </h2>
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="text-xs text-white/35 hover:text-white/60 font-medium flex items-center gap-1 transition-colors"
            >
              View all
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {recentMaterials?.length === 0 ? (
              <div className="col-span-full py-14 rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.06] flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mb-4">
                  <Plus className="w-5 h-5 text-white/25" />
                </div>
                <p className="text-sm font-medium text-white/50 mb-1">
                  No uploads yet
                </p>
                <p className="text-xs text-white/25 mb-4">
                  Upload a document to start generating study materials
                </p>
                <Button
                  onClick={() => setIsUploadOpen(true)}
                  size="default"
                  className="h-10 px-6 text-sm rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold border-0"
                >
                  Upload
                </Button>
              </div>
            ) : (
              recentMaterials?.map((material) => (
                <div
                  key={material._id}
                  onClick={() => navigate(`/study/${material._id}`)}
                  className="group p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all cursor-pointer touch-feedback hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        material.type === "pdf"
                          ? "bg-red-500/10 text-red-400"
                          : material.type === "video" || material.type === "youtube"
                            ? "bg-blue-500/10 text-blue-400"
                            : material.type === "audio"
                              ? "bg-pink-500/10 text-pink-400"
                              : "bg-cyan-500/10 text-cyan-400",
                      )}
                    >
                      {material.type === "pdf" ? (
                        <BookOpen className="w-4 h-4" />
                      ) : material.type === "video" || material.type === "youtube" ? (
                        <Play className="w-4 h-4" />
                      ) : material.type === "audio" ? (
                        <Mic className="w-4 h-4" />
                      ) : (
                        <Network className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-[10px] text-white/25 uppercase font-bold tracking-wider">
                      {material.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate mb-1">
                    {material.title}
                  </h3>
                  <p className="text-xs text-white/25">
                    {new Date(material._creationTime).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* ═══ BOTTOM GRID: Goals + Chart ═══ */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          className="grid grid-cols-1 lg:grid-cols-5 gap-4"
        >
          {/* Daily Goals — compact */}
          <div className="lg:col-span-2 p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">Daily Goals</h3>
              <button
                onClick={handleAddGoal}
                className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-white/40" />
              </button>
            </div>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto no-scrollbar pr-1">
              {dailyGoals?.length === 0 && (
                <div className="py-8 text-center border border-dashed border-white/[0.06] rounded-xl">
                  <p className="text-sm text-white/35 font-medium">
                    No goals for today
                  </p>
                  <p className="text-xs text-white/20 mt-0.5">
                    Tap + to add one
                  </p>
                </div>
              )}
              {dailyGoals?.map((goal) => (
                <div
                  key={goal._id}
                  onClick={() => handleToggleGoal(goal._id, goal.isCompleted)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer group"
                >
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all",
                      goal.isCompleted
                        ? "bg-cyan-500 border-cyan-500"
                        : "border-white/15 group-hover:border-cyan-400/40",
                    )}
                  >
                    {goal.isCompleted && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium",
                      goal.isCompleted
                        ? "text-white/20 line-through"
                        : "text-white/60",
                    )}
                  >
                    {goal.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Activity Chart */}
          <div className="lg:col-span-3 p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white">
                  Weekly Activity
                </h3>
                <p className="text-xs text-white/25 mt-0.5">
                  Study momentum, last 7 days
                </p>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient
                      id="colorActivity"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.02)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 10 }}
                    dy={8}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111113",
                      borderColor: "rgba(255,255,255,0.06)",
                      borderRadius: "8px",
                      fontSize: "11px",
                      boxShadow: "0 8px 24px -8px rgba(0,0,0,0.5)",
                    }}
                    itemStyle={{ color: "#fff" }}
                    cursor={{
                      stroke: "rgba(34,211,238,0.15)",
                      strokeWidth: 1,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorActivity)"
                    activeDot={{
                      r: 4,
                      strokeWidth: 0,
                      fill: "#22d3ee",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* ═══ LEVEL + LECTURE RECORDER ROW ═══ */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Level Card — compact */}
          <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-amber-500/[0.06] to-orange-500/[0.03] border border-amber-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/[0.06] rounded-full blur-[40px] group-hover:bg-amber-500/[0.08] transition-colors" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">
                    Level {stats?.level || 1}
                  </span>
                </div>
                <span className="text-[10px] text-white/20 font-medium">
                  {stats?.totalPoints || 0} XP
                </span>
              </div>

              {/* XP bar */}
              <div className="relative h-1.5 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "40%" }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="absolute h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                />
              </div>
              <p className="text-[9px] text-white/15 mt-1.5 text-right font-medium">
                960 XP to next level
              </p>
            </div>
          </div>

          {/* Lecture Recorder Card */}
          <div className="p-5 md:p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pink-500/15 transition-all group">
            <div className="flex items-center gap-2.5 mb-3">
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
                  toast.success(
                    "Transcribed! Generating AI study materials...",
                  );
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
          </div>
        </motion.div>
      </motion.div>

      {/* ═══ FEATURE OVERLAYS ═══ */}
      <AnimatePresence>
        {activeFeature === "flashcards" && (
          <FlashcardMode
            cards={allFlashcards.map((f: any) => ({
              id: f._id,
              front: f.front,
              back: f.back,
              difficulty: f.difficulty,
            }))}
            onComplete={(results) => {
              toast.success(`Session Complete! Correct: ${results.correct}`);
              setActiveFeature("dashboard");
            }}
            onClose={() => setActiveFeature("dashboard")}
          />
        )}
        {activeFeature === "quiz" && (
          <div className="fixed inset-0 z-50 bg-[#09090b]/95 backdrop-blur-xl">
            <div className="absolute top-5 right-5 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-white/10 text-white w-8 h-8"
                onClick={() => setActiveFeature("dashboard")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <QuizGenerator
              topic={selectedTopic}
              onClose={() => setActiveFeature("dashboard")}
            />
          </div>
        )}
        {activeFeature === "regional_trainer" && (
          <div className="fixed inset-0 z-50 bg-[#09090b] overflow-y-auto">
            <RegionalTrainer
              region={user?.region as "ksa" | "egypt"}
              curriculum={user?.curriculum || ""}
              onExit={() => setActiveFeature("dashboard")}
            />
          </div>
        )}
      </AnimatePresence>

      <PomodoroTimer />

      {/* ═══ DIALOGS ═══ */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-[#111113]/95 backdrop-blur-2xl border-white/[0.08] text-white sm:max-w-xl rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              Upload Material
            </DialogTitle>
          </DialogHeader>
          <StudyUploadZone onUploadComplete={() => setIsUploadOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
        <DialogContent className="bg-[#111113]/95 backdrop-blur-2xl border-white/[0.08] text-white sm:max-w-md rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Invite Friends
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-3">
            <div className="p-3.5 rounded-xl bg-cyan-500/[0.06] border border-cyan-500/10 text-center">
              <p className="text-cyan-400 font-semibold text-sm mb-0.5">
                Earn 500 Credits per invite!
              </p>
              <p className="text-white/35 text-xs">
                Friends get 50 bonus credits when they join.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-white/30 font-medium uppercase tracking-wider ml-1">
                Your Code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 font-mono text-base tracking-wider text-center select-all text-white/70">
                  {referralCode || "Generating..."}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 rounded-lg border-white/[0.06] hover:bg-white/[0.05]"
                  onClick={() => {
                    navigator.clipboard.writeText(referralCode);
                    toast.success("Code copied!");
                  }}
                  disabled={!referralCode}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-white/30 font-medium uppercase tracking-wider ml-1">
                Share Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/40 truncate">
                  {`${window.location.origin}?ref=${referralCode}`}
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 rounded-lg border-white/[0.06] hover:bg-white/[0.05]"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}?ref=${referralCode}`,
                    );
                    toast.success("Link copied!");
                  }}
                  disabled={!referralCode}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
        <DialogContent className="bg-[#111113]/95 backdrop-blur-2xl border-white/[0.08] text-white sm:max-w-3xl rounded-2xl shadow-2xl overflow-y-auto max-h-[85vh] no-scrollbar pb-safe w-[95vw] md:w-full">
          <DialogHeader className="sticky top-0 bg-[#111113]/95 z-10 pb-3 border-b border-white/[0.06] mb-3 pt-1">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Library
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pb-4">
            {allMaterials === undefined ? (
              <div className="col-span-full py-10 text-center text-white/30 flex flex-col items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mb-3" />
                <span className="text-xs">Loading...</span>
              </div>
            ) : allMaterials?.length === 0 ? (
              <div className="col-span-full py-10 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center mb-3">
                  <ArchiveRestore className="w-5 h-5 text-white/15" />
                </div>
                <p className="text-xs font-medium text-white/35">
                  Library is empty
                </p>
                <p className="text-[10px] text-white/15 mt-0.5">
                  Upload documents to see them here.
                </p>
              </div>
            ) : (
              allMaterials.map((material) => (
                <motion.div
                  key={material._id}
                  whileHover={{ y: -2 }}
                  onClick={() => {
                    setIsLibraryOpen(false);
                    navigate(`/study/${material._id}`);
                  }}
                  className="group p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all cursor-pointer touch-feedback"
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors mb-2.5 mx-auto",
                      material.type === "pdf"
                        ? "bg-red-500/10 text-red-400"
                        : material.type === "video" || material.type === "youtube"
                          ? "bg-blue-500/10 text-blue-400"
                          : material.type === "audio"
                            ? "bg-pink-500/10 text-pink-400"
                            : "bg-cyan-500/10 text-cyan-400",
                    )}
                  >
                    {material.type === "pdf" ? (
                      <BookOpen className="h-5 w-5" />
                    ) : material.type === "video" || material.type === "youtube" ? (
                      <Play className="h-5 w-5" />
                    ) : material.type === "audio" ? (
                      <Mic className="h-5 w-5" />
                    ) : (
                      <Network className="h-5 w-5" />
                    )}
                  </div>
                  <h3 className="font-semibold text-white text-xs w-full truncate text-center mb-0.5">
                    {material.title}
                  </h3>
                  <div className="flex flex-col items-center text-[10px] text-white/20">
                    <span className="uppercase font-bold tracking-wider">
                      {material.type}
                    </span>
                    <span>
                      {new Date(material._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
