import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Brain,
  Clock,
  Trophy,
  Target,
  Zap,
  Calendar,
  ChevronRight,
  Sparkles,
  Plus,
  Mic,
  Link as LinkIcon,
  Play,
  GraduationCap,
  Timer,
  Lightbulb,
  CheckCircle2,
  Network
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FlashcardMode } from "@/components/study/FlashcardMode";
import { QuizGenerator } from "@/components/study/QuizGenerator";
import { PomodoroTimer } from "@/components/study/PomodoroTimer";
import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { KnowledgeGapDashboard } from "@/components/study/KnowledgeGapDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";

import { useThemeStore } from "@/lib/stores/theme-store";

export default function StudyDashboard() {
  const { theme } = useThemeStore();
  const isLiquid = theme === 'liquid';
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<"dashboard" | "flashcards" | "quiz">("dashboard");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // totalStudyTime is stored in milliseconds from the database
  const formatStudyTime = (ms: number) => {
    if (!ms) return "0m";
    const totalMinutes = Math.floor(ms / 60000); // Convert ms to minutes
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Real Data Queries
  const stats = useQuery(api.study.getStats);
  const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 3 });
  const dailyGoals = useQuery(api.study.getDailyGoals, { date: new Date().toISOString().split('T')[0] });
  const recommendations = useQuery(api.study.getStudyRecommendations);
  const allFlashcards = useQuery(api.study.listAllFlashcards) || [];
  console.log("All Flashcards:", allFlashcards);

  // Mutations
  const createGoal = useMutation(api.study.createGoal);
  const completeGoal = useMutation(api.study.completeGoal);
  const initializeStats = useMutation(api.study.initializeStats);

  // Initialize stats if needed
  useEffect(() => {
    if (user && stats === null) {
      initializeStats();
    }
  }, [user, stats, initializeStats]);

  const handleStartQuiz = (topic: string) => {
    setSelectedTopic(topic);
    setActiveFeature("quiz");
  };

  const handleAddGoal = async () => {
    const text = prompt("Enter a new daily goal:");
    if (text) {
      await createGoal({
        text,
        date: new Date().toISOString().split('T')[0]
      });
      toast.success("Goal added!");
    }
  };

  const handleToggleGoal = async (goalId: any, currentStatus: boolean) => {
    await completeGoal({ goalId, isCompleted: !currentStatus });
    if (!currentStatus) toast.success("Goal completed! +20 XP");
  };

  // Weekly Activity Data (real)
  const weeklyActivity = useQuery(api.study.getWeeklyActivity);
  const weeklyData = weeklyActivity || [
    { name: "Mon", hours: 0 },
    { name: "Tue", hours: 0 },
    { name: "Wed", hours: 0 },
    { name: "Thu", hours: 0 },
    { name: "Fri", hours: 0 },
    { name: "Sat", hours: 0 },
    { name: "Sun", hours: 0 },
  ];

  return (
    <div className="flex-1 h-full w-full relative overflow-y-auto custom-scrollbar bg-transparent">
      <div className="relative z-10 p-6 md:p-10 max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Center</span>
            </h1>
            <p className="text-white/50 mt-1">Master your subjects with AI-powered tools.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md"
              onClick={() => setIsUploadOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> New Material
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              onClick={() => navigate("/study")}
            >
              <Sparkles className="h-4 w-4 mr-2" /> AI Generate
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
              onClick={() => navigate("/study/graph")}
            >
              <Network className="h-4 w-4 mr-2" /> Knowledge Web
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-3xl border p-6 cursor-pointer glass-card border-white/10"
            onClick={() => setActiveFeature("flashcards")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Flashcards</h3>
              <p className="text-sm text-white/50 mb-4">
                {recommendations?.dueFlashcardsCount
                  ? `${recommendations.dueFlashcardsCount} cards due for review`
                  : "Review concepts with spaced repetition"}
              </p>
              <div className="flex items-center text-xs font-medium text-purple-400">
                Start Session <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-3xl border p-6 cursor-pointer glass-card border-white/10"
            onClick={() => handleStartQuiz("General Knowledge")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">AI Quiz</h3>
              <p className="text-sm text-white/50 mb-4">Test your knowledge with generated questions.</p>
              <div className="flex items-center text-xs font-medium text-blue-400">
                Generate Quiz <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-3xl border p-6 cursor-pointer glass-card border-white/10"
            onClick={() => toast.info("Timer started automatically!")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-green-500/20 flex items-center justify-center mb-4 text-green-400 group-hover:scale-110 transition-transform">
                <Timer className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Focus Mode</h3>
              <p className="text-sm text-white/50 mb-4">Stay productive with the Pomodoro timer.</p>
              <div className="flex items-center text-xs font-medium text-green-400">
                Open Timer <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Progress & Activity (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Study Time",
                  value: stats ? formatStudyTime(stats.totalStudyTime) : "0m",
                  icon: Clock,
                  color: "text-blue-400",
                  bg: "bg-blue-500/10"
                },
                {
                  label: "Cards Reviewed",
                  value: stats?.flashcardsReviewed || "0",
                  icon: BookOpen,
                  color: "text-purple-400",
                  bg: "bg-purple-500/10"
                },
                {
                  label: "Day Streak",
                  value: stats?.currentStreak || "0",
                  icon: Zap,
                  color: "text-yellow-400",
                  bg: "bg-yellow-500/10"
                },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border p-4 flex items-center gap-4 glass-panel border-white/10">
                  <div className={`h-10 w-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-white/40">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Weekly Progress Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border p-6 glass-panel border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Weekly Activity</h3>
                <select className="bg-white/5 border border-white/10 rounded-lg text-xs text-white px-2 py-1 outline-none">
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0A0A0B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorHours)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Knowledge Gaps */}
            <KnowledgeGapDashboard materialId={undefined} />

            {/* Recent Materials List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white px-1">Recent Materials</h3>
              <div className="grid gap-3">
                {recentMaterials?.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm border border-dashed border-white/10 rounded-2xl">
                    No materials yet. Upload or generate one!
                  </div>
                ) : (
                  recentMaterials?.map((item) => (
                    <div
                      key={item._id}
                      className="group flex items-center gap-4 p-4 rounded-2xl border transition-colors cursor-pointer glass-panel border-white/10 hover:bg-white/5"
                      onClick={() => {
                        if (item.docId) {
                          navigate(`/study/workspace/${item.docId}`);
                        } else {
                          toast.info("This material doesn't have a workspace yet. Re-upload to create one.");
                        }
                      }}
                    >
                      <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white transition-colors">
                        {item.type === "text" || item.type === "pdf" ? <BookOpen className="h-5 w-5" /> :
                          item.type === "youtube" || item.type === "video" ? <Play className="h-5 w-5" /> :
                            <Brain className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                          <span className="capitalize">{item.type}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(item._creationTime)} ago</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-white/30 hover:text-white">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Daily Goals & Tips (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Daily Goals */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="rounded-3xl border p-6 glass-panel border-white/10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Daily Goals</h3>
                <Button variant="ghost" size="icon" onClick={handleAddGoal} className="h-6 w-6 rounded-full hover:bg-white/10">
                  <Plus className="h-4 w-4 text-white/50" />
                </Button>
              </div>
              <div className="space-y-3">
                {dailyGoals?.length === 0 && (
                  <div className="text-center py-4 text-white/30 text-xs">No goals for today. Add one!</div>
                )}
                {dailyGoals?.map((goal) => (
                  <div
                    key={goal._id}
                    onClick={() => handleToggleGoal(goal._id, goal.isCompleted)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center transition-colors ${goal.isCompleted ? "bg-green-500 border-green-500" : "border-white/20"}`}>
                      {goal.isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className={`text-sm ${goal.isCompleted ? "text-white/30 line-through" : "text-white/80"}`}>{goal.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* XP & Level Card */}
            <div className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Trophy className="h-24 w-24 text-yellow-500 rotate-12" />
              </div>
              <div className="relative z-10">
                <div className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-2">Current Level</div>
                <div className="text-3xl font-bold text-white mb-1">Level {stats?.level || 1}</div>
                <div className="text-sm text-white/50 mb-4">{stats?.totalPoints || 0} XP Total</div>
                <Progress value={(stats?.totalPoints || 0) % 1000 / 10} className="h-2 bg-black/20" />
                <p className="text-xs text-white/40 mt-3">{1000 - ((stats?.totalPoints || 0) % 1000)} XP to next level</p>
              </div>
            </div>

            {/* Quick Tools */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20">
                <Mic className="h-5 w-5 text-pink-400" />
                <span className="text-xs text-white/70">Voice Note</span>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20">
                <LinkIcon className="h-5 w-5 text-cyan-400" />
                <span className="text-xs text-white/70">Save Link</span>
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {activeFeature === "flashcards" && Array.isArray(allFlashcards) && allFlashcards.length > 0 && (
          <FlashcardMode
            cards={allFlashcards.map((f: any) => ({ id: f._id, front: f.front, back: f.back, difficulty: f.difficulty }))}
            onComplete={(results) => {
              toast.success(`Session Complete! Correct: ${results.correct}`);
              setActiveFeature("dashboard");
            }}
            onClose={() => setActiveFeature("dashboard")}
          />
        )}
        {activeFeature === "flashcards" && Array.isArray(allFlashcards) && allFlashcards.length === 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="text-center p-8 rounded-3xl glass-panel max-w-md">
              <GraduationCap className="h-16 w-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Flashcards Yet</h2>
              <p className="text-white/50 mb-6">Upload a document first to generate flashcards automatically!</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => setActiveFeature("dashboard")}>Go Back</Button>
                <Button onClick={() => navigate("/study")}>Upload Document</Button>
              </div>
            </div>
          </div>
        )}
        {activeFeature === "quiz" && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="absolute top-4 right-4 z-50">
              <Button variant="ghost" onClick={() => setActiveFeature("dashboard")}><Plus className="rotate-45" /></Button>
            </div>
            <QuizGenerator topic={selectedTopic} onClose={() => setActiveFeature("dashboard")} />
          </div>
        )}
      </AnimatePresence>

      <PomodoroTimer />

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="glass-modal border-white/10 text-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Upload Study Material</DialogTitle>
          </DialogHeader>
          <StudyUploadZone onUploadComplete={(docId) => {
            setIsUploadOpen(false);
            // navigate(`/study/workspace/${docId}`); // StudyUploadZone handles redirect now
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}