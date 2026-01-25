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
  MoreHorizontal,
  Search,
  Bell,
  Play,
  Users,
  Copy,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import {
  AreaChart,
  Area,
  XAxis,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { cn } from "@/lib/utils";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

export default function StudyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<"dashboard" | "flashcards" | "quiz">("dashboard");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Data
  const stats = useQuery(api.study.getStats);
  const dailyGoals = useQuery(api.study.getDailyGoals, { date: new Date().toISOString().split('T')[0] });
  const recommendations = useQuery(api.study.getStudyRecommendations);
  const allFlashcards = useQuery(api.study.listAllFlashcards) || [];
  const weeklyActivity = useQuery(api.study.getWeeklyActivity);
  const recentMaterials = useQuery(api.study.getRecentMaterials, { limit: 4 });

  // Mutations
  const createGoal = useMutation(api.study.createGoal);
  const completeGoal = useMutation(api.study.completeGoal);
  const initializeStats = useMutation(api.study.initializeStats);
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
      await createGoal({ text, date: new Date().toISOString().split('T')[0] });
      toast.success("Goal added!");
    }
  };

  const handleToggleGoal = async (goalId: any, currentStatus: boolean) => {
    await completeGoal({ goalId, isCompleted: !currentStatus });
  };

  const weeklyData = weeklyActivity || [
    { name: "Sun", hours: 0 }, { name: "Mon", hours: 0 }, { name: "Tue", hours: 0 },
    { name: "Wed", hours: 0 }, { name: "Thu", hours: 0 }, { name: "Fri", hours: 0 }, { name: "Sat", hours: 0 },
  ];

  // Format helper
  const formatStudyTime = (ms: number) => {
    if (!ms) return "0m";
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="flex-1 h-full w-full relative overflow-y-auto custom-scrollbar bg-[#030014] text-white selection:bg-purple-500/30">

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-pink-900/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
        <OnboardingTour
          tourId="study-dashboard"
          steps={[
            {
              targetId: "study-upload",
              title: "Upload Materials",
              description: "Start here! Upload PDFs, videos, or audio to generate flashcards and quizzes.",
              position: "bottom"
            },
            {
              targetId: "study-flashcards",
              title: "Smart Flashcards",
              description: "Review generated flashcards with spaced repetition to master concepts.",
              position: "bottom"
            },
            {
              targetId: "study-quiz",
              title: "AI Quiz",
              description: "Test your knowledge with dynamic quizzes based on your uploads.",
              position: "bottom"
            },
            {
              targetId: "study-focus",
              title: "Deep Focus",
              description: "Use the Pomodoro timer and ambient sounds to stay in the zone.",
              position: "bottom"
            }
          ]}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">Study Center</span>
            </h1>
            <p className="text-white/60 font-light">Master your subjects with AI-powered tools.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search materials..."
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all w-64"
              />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full bg-white/5 hover:bg-white/10 text-white border border-white/10"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleOpenReferral}
              className="rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 ml-2"
            >
              <Users className="h-4 w-4 mr-2" /> Invite
            </Button>
            <div className="h-8 w-[1px] bg-white/10 mx-2" />
            <Button
              onClick={() => setIsUploadOpen(true)}
              className="rounded-full bg-white text-black hover:bg-white/90 font-medium px-6"
              id="study-upload"
            >
              <Plus className="h-4 w-4 mr-2" /> New Material
            </Button>
          </div>
        </div>

        {/* Feature Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Flashcards */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => setActiveFeature("flashcards")}
            id="study-flashcards"
            className="group p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-purple-500/50 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Flashcards</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                {recommendations?.dueFlashcardsCount || 0} cards due for review. Master your topics with spaced repetition.
              </p>
              <div className="flex items-center text-purple-300 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Start Session <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </motion.div>

          {/* AI Quiz */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => setActiveFeature("quiz")}
            id="study-quiz"
            className="group p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-500/50 hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                <BrainCircuit className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">AI Quiz</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Test your knowledge with AI-generated questions tailored to your materials.
              </p>
              <div className="flex items-center text-blue-300 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Generate Quiz <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </motion.div>

          {/* Focus Mode */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => toast.info("Focus Mode Initiated")}
            id="study-focus"
            className="group p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] transition-all duration-300 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <Timer className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Focus Mode</h3>
              <p className="text-white/50 text-sm mb-6 leading-relaxed">
                Enter a flow state with the Pomodoro timer and ambient sounds.
              </p>
              <div className="flex items-center text-emerald-300 text-sm font-medium group-hover:translate-x-1 transition-transform">
                Open Timer <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Uploads Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-white">Recent Uploads</h2>
            <Button variant="link" className="text-white/50 hover:text-white" onClick={() => navigate("/study")}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentMaterials?.length === 0 ? (
              <div className="col-span-full p-8 rounded-[2rem] bg-white/5 border border-dashed border-white/10 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                  <Plus className="h-6 w-6 text-white/30" />
                </div>
                <p className="text-white/50 font-medium">No uploads yet</p>
                <p className="text-white/30 text-sm mb-4">Upload your first document to get started</p>
                <Button
                  onClick={() => setIsUploadOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-full"
                >
                  Upload Material
                </Button>
              </div>
            ) : (
              recentMaterials?.map((material) => (
                <motion.div
                  key={material._id}
                  whileHover={{ y: -3 }}
                  onClick={() => navigate(`/study/${material._id}`)}
                  className="group p-4 rounded-[1.5rem] bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                      material.type === 'pdf' ? "bg-red-500/20 text-red-400 group-hover:bg-red-500/30" :
                        material.type === 'video' || material.type === 'youtube' ? "bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30" :
                          material.type === 'audio' ? "bg-pink-500/20 text-pink-400 group-hover:bg-pink-500/30" :
                            "bg-purple-500/20 text-purple-400 group-hover:bg-purple-500/30"
                    )}>
                      {material.type === 'pdf' ? <BookOpen className="h-5 w-5" /> :
                        material.type === 'video' || material.type === 'youtube' ? <Play className="h-5 w-5" /> :
                          material.type === 'audio' ? <Mic className="h-5 w-5" /> :
                            <Network className="h-5 w-5" />}
                    </div>
                    <div className="px-2 py-1 rounded-full bg-black/20 text-[10px] font-medium text-white/50 uppercase tracking-wider border border-white/5">
                      {material.type}
                    </div>
                  </div>

                  <h3 className="font-bold text-white truncate mb-1 pr-2">{material.title}</h3>
                  <p className="text-white/40 text-xs">
                    {new Date(material._creationTime).toLocaleDateString()}
                  </p>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Stats & Goals Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                  <Clock className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white/60">Study Time</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats ? formatStudyTime(stats.totalStudyTime) : "0m"}</div>
            </div>

            <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white/60">Reviewed</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats?.flashcardsReviewed || 0}</div>
            </div>

            <div className="p-6 rounded-[2rem] bg-white/5 backdrop-blur-md border border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-white/60">Streak</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats?.currentStreak || 0}</div>
            </div>
          </div>

          {/* Daily Goals */}
          <div className="lg:col-span-1 p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">Daily Goals</h3>
              <Button variant="ghost" size="icon" onClick={handleAddGoal} className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/20 text-white">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
              {dailyGoals?.length === 0 && (
                <div className="flex flex-col items-center justify-center h-32 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                  <span>No goals for today</span>
                  <span className="text-xs mt-1">Add one to start tracking</span>
                </div>
              )}
              {dailyGoals?.map((goal) => (
                <div
                  key={goal._id}
                  onClick={() => handleToggleGoal(goal._id, goal.isCompleted)}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/5"
                >
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${goal.isCompleted ? "bg-purple-500 border-purple-500" : "border-white/20 group-hover:border-purple-500"}`}>
                    {goal.isCompleted && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                  </div>
                  <span className={`text-sm font-medium ${goal.isCompleted ? "text-white/30 line-through" : "text-white/80"}`}>{goal.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row: Chart & Level */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity Chart */}
          <div className="lg:col-span-2 p-8 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-white text-lg">Weekly Activity</h3>
                <p className="text-white/40 text-sm">Your study momentum over the last 7 days</p>
              </div>
              <select className="bg-black/20 border border-white/10 text-xs text-white/70 rounded-lg px-3 py-1.5 outline-none focus:border-purple-500/50 transition-colors">
                <option>This Week</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
                    dy={10}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A0A0B', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ stroke: 'rgba(168,85,247,0.2)', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="hours"
                    stroke="#a855f7"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorActivity)"
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Level & Voice Note */}
          <div className="space-y-6">
            {/* Level Card */}
            <div className="p-8 rounded-[2rem] bg-gradient-to-br from-yellow-500/10 to-orange-600/10 backdrop-blur-xl border border-yellow-500/20 relative overflow-hidden group">
              <div className="absolute top-[-20%] right-[-20%] w-[150px] h-[150px] bg-yellow-500/20 rounded-full blur-[60px] group-hover:bg-yellow-500/30 transition-colors duration-500" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider bg-yellow-500/10 px-2 py-1 rounded-md border border-yellow-500/20">Current Level</div>
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>

                <h3 className="text-4xl font-bold text-white mb-2">Level {stats?.level || 1}</h3>
                <p className="text-white/60 text-sm mb-6">{stats?.totalPoints || 0} XP Total</p>

                <div className="relative h-3 bg-black/40 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/40 font-medium uppercase tracking-wide">
                  <span>Progress</span>
                  <span>960 XP to next</span>
                </div>
              </div>
            </div>

            {/* Voice Note Button */}
            <button className="w-full p-6 rounded-[2rem] bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-pink-500/30 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mic className="h-6 w-6 text-pink-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Voice Note</div>
                  <div className="text-xs text-white/50">Record a quick thought</div>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Plus className="h-4 w-4" />
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* Feature Overlays */}
      <AnimatePresence>
        {activeFeature === "flashcards" && (
          <FlashcardMode
            cards={allFlashcards.map((f: any) => ({ id: f._id, front: f.front, back: f.back, difficulty: f.difficulty }))}
            onComplete={(results) => {
              toast.success(`Session Complete! Correct: ${results.correct}`);
              setActiveFeature("dashboard");
            }}
            onClose={() => setActiveFeature("dashboard")}
          />
        )}
        {activeFeature === "quiz" && (
          <div className="fixed inset-0 z-50 bg-[#030014]/90 backdrop-blur-xl">
            <div className="absolute top-6 right-6 z-50">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 text-white" onClick={() => setActiveFeature("dashboard")}><Plus className="rotate-45 h-6 w-6" /></Button>
            </div>
            <QuizGenerator topic={selectedTopic} onClose={() => setActiveFeature("dashboard")} />
          </div>
        )}
      </AnimatePresence>

      <PomodoroTimer />

      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="bg-[#0A0A0B]/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-xl rounded-[2rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Upload Data</DialogTitle>
          </DialogHeader>
          <StudyUploadZone onUploadComplete={() => setIsUploadOpen(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={isReferralOpen} onOpenChange={setIsReferralOpen}>
        <DialogContent className="bg-[#0A0A0B]/95 backdrop-blur-2xl border-white/10 text-white sm:max-w-md rounded-[2rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              Invite Friends
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
              <p className="text-purple-300 font-medium mb-1">Earn 500 Credits per invite!</p>
              <p className="text-white/60 text-sm">Friends get 50 bonus credits when they join.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60 font-medium ml-1">Your Referral Code</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-lg tracking-wider text-center select-all">
                  {referralCode || "Generating..."}
                </div>
                <Button size="icon" variant="outline" className="h-12 w-12 rounded-xl border-white/10 hover:bg-white/5" onClick={() => { navigator.clipboard.writeText(referralCode); toast.success("Code copied!"); }} disabled={!referralCode}>
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-white/60 font-medium ml-1">Share Link</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/60 truncate">
                  {`${window.location.origin}?ref=${referralCode}`}
                </div>
                <Button size="icon" variant="outline" className="h-12 w-12 rounded-xl border-white/10 hover:bg-white/5" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?ref=${referralCode}`); toast.success("Link copied!"); }} disabled={!referralCode}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}