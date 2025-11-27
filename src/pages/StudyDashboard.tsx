import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Clock, Brain, ListChecks, Flame, FileText, Mic, Upload, Link as LinkIcon, Play, TrendingUp, Target, Trophy, CheckCircle, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { XPBadge } from "@/components/study/XPBadge";
import { ProgressRail } from "@/components/study/ProgressRail";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { toast } from "sonner";

// Mock Data for Chart (Backend integration for sessions to be added later)
const weeklyData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.8 },
  { day: "Wed", hours: 1.5 },
  { day: "Thu", hours: 4.2 },
  { day: "Fri", hours: 3.0 },
  { day: "Sat", hours: 5.5 },
  { day: "Sun", hours: 2.0 },
];

export default function StudyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const stats = useQuery(api.study.getStats, user ? {} : "skip");
  const materials = useQuery(api.study.listMaterials, {});
  const dailyGoals = useQuery(api.study.getDailyGoals, user ? { date: todayStr } : "skip");

  const completeGoal = useMutation(api.study.completeGoal);
  const createGoal = useMutation(api.study.createGoal);
  const generateDailyGoals = useAction(api.study.generateDailyGoals);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  const toggleGoal = async (id: any, currentStatus: boolean) => {
    try {
      await completeGoal({ goalId: id, isCompleted: !currentStatus });
    } catch (error) {
      toast.error("Failed to update goal");
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    try {
      await createGoal({ text: newGoalText, date: todayStr });
      setNewGoalText("");
      setIsAddingGoal(false);
      toast.success("Goal added");
    } catch (error) {
      toast.error("Failed to add goal");
    }
  };

  const handleGenerateGoals = async () => {
    setIsGenerating(true);
    try {
      await generateDailyGoals({ date: todayStr });
      toast.success("Daily goals generated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate goals");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUploadComplete = (docId: string) => {
    setShowUploadModal(false);
    navigate(`/study/workspace/${docId}`);
  };

  // Link Saving
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const createMaterial = useMutation(api.study.createMaterial);

  const handleSaveLink = async () => {
    if (!linkUrl || !linkTitle) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await createMaterial({
        title: linkTitle,
        type: "link",
        url: linkUrl,
        tags: ["link"],
      });
      toast.success("Link saved!");
      setShowLinkModal(false);
      setLinkUrl("");
      setLinkTitle("");
    } catch (error) {
      toast.error("Failed to save link");
    }
  };

  // Voice Note Recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const generateUploadUrl = useMutation(api.study.generateUploadUrl);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        await handleVoiceUpload(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.info("Recording started...");
    } catch (error) {
      toast.error("Microphone access denied");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
      toast.info("Processing recording...");
    }
  };

  const handleVoiceUpload = async (blob: Blob) => {
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      const { storageId } = await result.json();

      await createMaterial({
        title: `Voice Note ${new Date().toLocaleString()}`,
        type: "audio",
        storageId,
        tags: ["voice-note"],
      });
      toast.success("Voice note saved!");
    } catch (error) {
      toast.error("Failed to save voice note");
    }
  };

  // Calculate XP progress (1000 XP per level)
  const currentXP = stats?.totalPoints || 0;
  const levelXP = 1000;
  const xpProgress = (currentXP % levelXP) / levelXP * 100;
  const xpToNextLevel = levelXP - (currentXP % levelXP);

  return (
    <div className="flex-1 h-full overflow-hidden relative bg-[#050014] text-white selection:bg-purple-500/30">
      {/* Super Liquid Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-pink-600/10 rounded-full blur-[80px] animate-float-cosmic" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 h-full overflow-y-auto p-6 md:p-8 custom-scrollbar"
      >
        <div className="max-w-7xl mx-auto space-y-8 pb-20">

          {/* Header Section */}
          <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] border border-white/10 backdrop-blur-xl">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 drop-shadow-sm">
                    Study Hub
                  </h1>
                  <p className="text-sm text-white/60 font-medium flex items-center gap-2 mt-1">
                    Master your knowledge <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500" /> Level {stats?.level || 1}
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)] transition-all hover:scale-105"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>
          </header>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Column: Progress & Activity (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-2 text-white/60">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Study Time</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{Math.floor((stats?.totalStudyTime || 0) / 60)}<span className="text-sm text-white/40 font-normal ml-1">hrs</span></div>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-2 text-white/60">
                    <ListChecks className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Cards</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats?.flashcardsReviewed || 0}</div>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-2 text-white/60">
                    <Trophy className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wider">Streak</span>
                  </div>
                  <div className="text-3xl font-bold text-white flex items-center gap-2">
                    {stats?.currentStreak || 0}
                    <Flame className="h-5 w-5 text-orange-500 fill-orange-500 animate-pulse" />
                  </div>
                </motion.div>
              </div>

              {/* Weekly Progress Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl p-6 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                    Weekly Activity
                  </h3>
                  <div className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-full">Last 7 Days</div>
                </div>

                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
                        dy={10}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 8 }}
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                      />
                      <Bar
                        dataKey="hours"
                        fill="#8b5cf6"
                        radius={[6, 6, 6, 6]}
                        barSize={32}
                        activeBar={{ fill: '#a78bfa' }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Recent Materials List */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white px-1">Continue Learning</h3>
                <div className="grid gap-3">
                  {!materials || materials.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-10 text-center">
                      <p className="text-white/40">No materials yet. Upload your first document!</p>
                    </div>
                  ) : (
                    materials.slice(0, 3).map((material, i) => (
                      <motion.div
                        key={material._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all cursor-pointer"
                        onClick={() => {
                          const targetId = (material as any).docId || material._id;
                          navigate(`/study/workspace/${targetId}`);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white group-hover:text-blue-300 transition-colors">{material.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-white/40 mt-1">
                              <span>PDF Document</span>
                              <span>•</span>
                              <span>Last accessed today</span>
                            </div>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-white/30 hover:text-white rounded-full">
                          <Play className="h-4 w-4 fill-current" />
                        </Button>
                      </motion.div>
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
                transition={{ delay: 0.5 }}
                className="rounded-3xl border border-white/10 bg-[#0a0a0a] p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold flex items-center gap-2 text-white">
                    <Target className="h-5 w-5 text-red-400" />
                    Daily Goals
                  </h3>
                  <span className="text-xs font-medium text-white/40">
                    {dailyGoals ? dailyGoals.filter(g => g.isCompleted).length : 0}/{dailyGoals ? dailyGoals.length : 0}
                  </span>
                </div>

                <div className="space-y-3">
                  {!dailyGoals || dailyGoals.length === 0 ? (
                    <div className="text-center py-8 text-white/30 text-sm">
                      <p>No goals for today.</p>
                      <p className="text-xs mt-1">Generate or add one!</p>
                    </div>
                  ) : (
                    dailyGoals.map((goal) => (
                      <div
                        key={goal._id}
                        onClick={() => toggleGoal(goal._id, goal.isCompleted)}
                        className={`group flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer ${goal.isCompleted ? 'bg-white/5 opacity-60' : 'bg-white/5 hover:bg-white/10'}`}
                      >
                        <div className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${goal.isCompleted ? 'bg-green-500 border-green-500' : 'border-white/20 group-hover:border-white/40'}`}>
                          {goal.isCompleted && <CheckCircle className="h-3.5 w-3.5 text-black" />}
                        </div>
                        <span className={`text-sm leading-snug ${goal.isCompleted ? 'text-white/40 line-through' : 'text-white/90'}`}>{goal.text}</span>
                      </div>
                    ))
                  )}
                </div>

                {isAddingGoal ? (
                  <form onSubmit={handleAddGoal} className="mt-4 flex gap-2">
                    <Input
                      value={newGoalText}
                      onChange={(e) => setNewGoalText(e.target.value)}
                      placeholder="New goal..."
                      className="bg-white/5 border-white/10 h-9 text-sm"
                      autoFocus
                    />
                    <Button type="submit" size="sm" className="h-9 bg-white text-black hover:bg-white/90">Add</Button>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      onClick={() => setIsAddingGoal(true)}
                      variant="ghost"
                      className="text-xs text-white/40 hover:text-white border border-dashed border-white/10 hover:bg-white/5 h-9 rounded-xl"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Goal
                    </Button>
                    <Button
                      onClick={handleGenerateGoals}
                      disabled={isGenerating}
                      variant="ghost"
                      className="text-xs text-purple-400 hover:text-purple-300 border border-dashed border-purple-500/20 hover:bg-purple-500/10 h-9 rounded-xl"
                    >
                      {isGenerating ? <Sparkles className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      AI Generate
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* XP & Level Card */}
              <div className="rounded-3xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-white/70">Level Progress</span>
                  <span className="text-xs font-mono text-white/40">{currentXP} XP Total</span>
                </div>
                <div className="mb-4">
                  <ProgressRail percent={xpProgress} />
                </div>
                <p className="text-xs text-white/50 text-center">
                  {xpToNextLevel} XP to reach <span className="text-purple-300 font-medium">Level {stats ? stats.level + 1 : 2}</span>
                </p>
              </div>

              {/* Quick Tools */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 text-sm font-medium group ${isRecording ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80 hover:text-white'}`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-pink-500/20'}`}>
                    <Mic className={`h-5 w-5 ${isRecording ? 'text-white' : 'text-pink-400'}`} />
                  </div>
                  {isRecording ? "Stop Recording" : "Voice Note"}
                </button>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 text-sm font-medium text-white/80 hover:text-white group"
                >
                  <div className="h-10 w-10 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <LinkIcon className="h-5 w-5 text-cyan-400" />
                  </div>
                  Save Link
                </button>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Upload Study Material</DialogTitle>
          </DialogHeader>
          <StudyUploadZone onUploadComplete={handleUploadComplete} />
        </DialogContent>
      </Dialog>

      {/* Save Link Modal */}
      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent className="bg-[#0a0a0a] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">URL</label>
              <Input
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Article Title"
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                className="bg-white/5 border-white/10"
              />
            </div>
            <Button onClick={handleSaveLink} className="w-full bg-white text-black hover:bg-white/90">
              Save to Library
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}