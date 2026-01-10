import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Plus,
  Play,
  CheckCircle2,
  MoreVertical,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { Progress } from "@/components/ui/progress";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { useThemeStore } from "@/lib/stores/theme-store";
import { IconBrain, IconTarget, IconTime, IconData, IconLibrary, IconStudy } from "@/components/ui/icons/Web3Icons";

export default function StudyDashboard() {
  const { theme } = useThemeStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<"dashboard" | "flashcards" | "quiz">("dashboard");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Format helper
  const formatStudyTime = (ms: number) => {
    if (!ms) return "0m";
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  // Data
  const stats = useQuery(api.study.getStats);
  const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 5 });
  const dailyGoals = useQuery(api.study.getDailyGoals, { date: new Date().toISOString().split('T')[0] });
  const recommendations = useQuery(api.study.getStudyRecommendations);
  const allFlashcards = useQuery(api.study.listAllFlashcards) || [];
  const weeklyActivity = useQuery(api.study.getWeeklyActivity);

  // Mutations
  const createGoal = useMutation(api.study.createGoal);
  const completeGoal = useMutation(api.study.completeGoal);
  const initializeStats = useMutation(api.study.initializeStats);

  useEffect(() => {
    if (user && stats === null) initializeStats();
  }, [user, stats, initializeStats]);

  const handleStartQuiz = (topic: string) => {
    setSelectedTopic(topic);
    setActiveFeature("quiz");
  };

  const handleAddGoal = async () => {
    const text = prompt("Enter a new daily quest:");
    if (text) {
      await createGoal({ text, date: new Date().toISOString().split('T')[0] });
      toast.success("Quest added!");
    }
  };

  const handleToggleGoal = async (goalId: any, currentStatus: boolean) => {
    await completeGoal({ goalId, isCompleted: !currentStatus });
    if (!currentStatus) toast.success("Quest Complete! +20 XP");
  };

  const weeklyData = weeklyActivity || [
    { name: "Mon", hours: 0 }, { name: "Tue", hours: 0 }, { name: "Wed", hours: 0 },
    { name: "Thu", hours: 0 }, { name: "Fri", hours: 0 }, { name: "Sat", hours: 0 }, { name: "Sun", hours: 0 },
  ];

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex-1 h-full w-full relative overflow-y-auto custom-scrollbar bg-transparent">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 p-6 md:p-8 max-w-[1600px] mx-auto space-y-8"
      >

        {/* Neural Nexus Header */}
        <motion.div variants={item} className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/40 backdrop-blur-2xl p-8 md:p-12">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-black/50 to-cyan-900/20 pointer-events-none" />
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <IconBrain className="h-6 w-6 text-purple-400" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest text-purple-400">Neural Nexus Online</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">
                Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Sync?</span>
              </h1>
              <p className="text-white/60 max-w-xl text-lg">
                Your knowledge graph is expanding. You have {recommendations?.dueFlashcardsCount || 0} memory nodes to reinforce today.
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setIsUploadOpen(true)}
                className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white backdrop-blur-md transition-all hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" /> Upload Data
              </Button>
              <Button
                onClick={() => navigate("/study")}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-[0_0_30px_rgba(139,92,246,0.3)] border-0 transition-all hover:scale-105"
              >
                <IconBrain className="h-5 w-5 mr-2" /> Generate
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Core Modules (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Module Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Memory Bank (Flashcards) */}
              <motion.div variants={item} onClick={() => setActiveFeature("flashcards")} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-xl p-6 cursor-pointer hover:bg-white/5 transition-all hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-500">
                      <IconData className="h-6 w-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300">
                      {recommendations?.dueFlashcardsCount || 0} Due
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Memory Bank</h3>
                  <p className="text-white/50 text-sm mb-4">Reinforce neural pathways with spaced repetition.</p>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-full w-[65%]" />
                  </div>
                </div>
              </motion.div>

              {/* Deep Focus (Timer) */}
              <motion.div variants={item} onClick={() => toast.info("Focus Mode Initiated")} className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-xl p-6 cursor-pointer hover:bg-white/5 transition-all hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-500">
                      <IconTime className="h-6 w-6" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-300">
                      Ready
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Deep Focus</h3>
                  <p className="text-white/50 text-sm mb-4">Enter flow state with Pomodoro timer.</p>
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold uppercase tracking-wider">
                    Initialize <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Resource Grid */}
            <motion.div variants={item} className="rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <IconLibrary className="h-5 w-5 text-white/50" />
                  Resource Grid
                </h3>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-white/10"><Search className="h-4 w-4 text-white/50" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg hover:bg-white/10"><Filter className="h-4 w-4 text-white/50" /></Button>
                </div>
              </div>

              <div className="space-y-3">
                {recentMaterials?.length === 0 ? (
                  <div className="text-center py-12 text-white/30 border border-dashed border-white/10 rounded-2xl">
                    No data found. Upload to populate grid.
                  </div>
                ) : (
                  recentMaterials?.map((item) => (
                    <div
                      key={item._id}
                      className="group flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer hover:border-white/10"
                      onClick={() => item.docId ? navigate(`/study/workspace/${item.docId}`) : toast.info("No workspace")}
                    >
                      <div className="h-12 w-12 rounded-xl bg-black/40 flex items-center justify-center text-white/50 group-hover:text-white transition-colors border border-white/5">
                        {item.type === "text" || item.type === "pdf" ? <IconStudy className="h-6 w-6" /> :
                          item.type === "youtube" || item.type === "video" ? <Play className="h-6 w-6" /> :
                            <IconBrain className="h-6 w-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-medium text-white truncate group-hover:text-purple-300 transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                          <span className="capitalize px-2 py-0.5 rounded bg-white/5 border border-white/5">{item.type}</span>
                          <span>{formatDistanceToNow(item._creationTime)} ago</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: Stats & Quests (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quest Log */}
            <motion.div variants={item} className="rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <IconTarget className="h-5 w-5 text-orange-400" />
                  Quest Log
                </h3>
                <Button variant="ghost" size="icon" onClick={handleAddGoal} className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                {dailyGoals?.length === 0 && (
                  <div className="text-center py-8 text-white/30 text-xs">No active quests. Initialize one.</div>
                )}
                {dailyGoals?.map((goal) => (
                  <div
                    key={goal._id}
                    onClick={() => handleToggleGoal(goal._id, goal.isCompleted)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group border border-transparent hover:border-white/10"
                  >
                    <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${goal.isCompleted ? "bg-orange-500 border-orange-500" : "border-white/20 group-hover:border-orange-400"}`}>
                      {goal.isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className={`text-sm ${goal.isCompleted ? "text-white/30 line-through" : "text-white/80"}`}>{goal.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Stats Visualization */}
            <motion.div variants={item} className="rounded-[2rem] border border-white/10 bg-black/20 backdrop-blur-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <IconData className="h-5 w-5 text-purple-400" />
                Sync Rate
              </h3>
              <div className="h-[200px] w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} dy={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#0A0A0B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-white/40 mb-1">Total Time</div>
                  <div className="text-lg font-bold text-white">{stats ? formatStudyTime(stats.totalStudyTime) : "0m"}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs text-white/40 mb-1">Streak</div>
                  <div className="text-lg font-bold text-white flex items-center gap-1">
                    {stats?.currentStreak || 0} <span className="text-xs font-normal text-orange-400">Days</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>

      {/* Feature Overlays */}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
            <div className="text-center p-10 rounded-[2rem] border border-white/10 bg-[#0A0A0B] max-w-md w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent pointer-events-none" />
              <IconData className="h-20 w-20 text-purple-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Memory Bank Empty</h2>
              <p className="text-white/50 mb-8 text-lg">Upload data to initialize neural pathways.</p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" className="border-white/10 h-12 px-6 rounded-xl" onClick={() => setActiveFeature("dashboard")}>Cancel</Button>
                <Button className="bg-purple-600 hover:bg-purple-500 h-12 px-6 rounded-xl" onClick={() => navigate("/study")}>Upload Data</Button>
              </div>
            </div>
          </div>
        )}
        {activeFeature === "quiz" && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl">
            <div className="absolute top-6 right-6 z-50">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => setActiveFeature("dashboard")}><Plus className="rotate-45 h-6 w-6" /></Button>
            </div>
            <QuizGenerator topic={selectedTopic} onClose={() => setActiveFeature("dashboard")} />
          </div>
        )}
      </AnimatePresence>

      <PomodoroTimer />

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-[#0A0A0B]/95 backdrop-blur-xl border-white/10 text-white sm:max-w-xl rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Upload Data</DialogTitle>
          </DialogHeader>
          <StudyUploadZone onUploadComplete={() => setIsUploadOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}