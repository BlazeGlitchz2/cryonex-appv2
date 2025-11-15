import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Clock, Brain, ListChecks, Flame, FileText, Mic, Upload, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StudyUploadZone } from "@/components/study/StudyUploadZone";
import { XPBadge } from "@/components/study/XPBadge";
import { ProgressRail } from "@/components/study/ProgressRail";
import { StatCard } from "@/components/study/StatCard";
import { CreateTile } from "@/components/study/CreateTile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";

export default function StudyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = useQuery(api.study.getStats, user ? {} : "skip");
  const materials = useQuery(api.study.listMaterials, {});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Sync with theme toggle
    const checkTheme = () => {
      const theme = localStorage.getItem('theme');
      const isDarkMode = theme === 'dark' || !theme;
      setIsDark(isDarkMode);
    };
    
    checkTheme();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  const handleUploadComplete = (docId: string) => {
    setShowUploadModal(false);
    navigate(`/study/workspace/${docId}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex flex-col relative overflow-hidden"
    >
      {/* Theme-aware gradient background */}
      <div className={`fixed inset-0 -z-10 transition-all duration-500 ${
        isDark 
          ? "bg-gradient-to-br from-zinc-900 via-purple-900/50 to-blue-950" 
          : "bg-gradient-to-br from-orange-100 via-purple-200 to-blue-300"
      }`} />
      
      {/* Top Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 h-16 border-b z-50 transition-all duration-300 ${
        isDark
          ? "border-white/10 bg-white/5 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_40px_rgba(0,0,0,0.25)]"
          : "border-gray-300/30 bg-white/40 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_40px_rgba(0,0,0,0.1)]"
      }`}>
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/app")}
              className={`rounded-lg gap-2 transition-colors ${
                isDark 
                  ? "text-white hover:bg-white/10" 
                  : "text-gray-900 hover:bg-gray-900/10"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className={`font-bold text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                Study Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <XPBadge level={stats?.level || 1} xp={stats?.totalPoints || 0} />
            {user && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                isDark
                  ? "bg-white/10 border-white/20"
                  : "bg-white/60 border-gray-300/40"
              }`}>
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className={`text-sm hidden lg:inline ${isDark ? "text-white" : "text-gray-900"}`}>
                  {user.email?.split('@')[0]}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-8 py-6 space-y-6">
          {/* Progress Rail */}
          <ProgressRail percent={0} />

          {/* Usage Meters */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className={`backdrop-blur-md transition-colors ${
              isDark 
                ? "bg-white/10 border-white/20" 
                : "bg-white/60 border-gray-300/40"
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
                    Study packs left this week
                  </span>
                  <Upload className={`h-4 w-4 ${isDark ? "text-white/60" : "text-gray-600"}`} />
                </div>
                <div className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  3 / 3
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? "bg-white/10" : "bg-gray-300/40"}`}>
                  <div className="bg-gradient-to-r from-blue-400 to-purple-600 h-2 rounded-full" style={{ width: '100%' }} />
                </div>
                <p className={`text-xs mt-2 ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Resets in 5 days
                </p>
              </CardContent>
            </Card>

            <Card className={`backdrop-blur-md transition-colors ${
              isDark 
                ? "bg-white/10 border-white/20" 
                : "bg-white/60 border-gray-300/40"
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
                    Chat turns left
                  </span>
                  <Brain className={`h-4 w-4 ${isDark ? "text-white/60" : "text-gray-600"}`} />
                </div>
                <div className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  87 / 100
                </div>
                <div className={`w-full rounded-full h-2 ${isDark ? "bg-white/10" : "bg-gray-300/40"}`}>
                  <div className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full" style={{ width: '87%' }} />
                </div>
                <p className={`text-xs mt-2 ${isDark ? "text-white/60" : "text-gray-600"}`}>
                  Resets daily
                </p>
              </CardContent>
            </Card>

            <Card className={`backdrop-blur-md transition-colors ${
              isDark 
                ? "bg-white/10 border-white/20" 
                : "bg-white/60 border-gray-300/40"
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
                    Cards due today
                  </span>
                  <Flame className={`h-4 w-4 ${isDark ? "text-white/60" : "text-gray-600"}`} />
                </div>
                <div className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                  12
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-2 bg-gradient-to-r from-orange-400 to-red-600 hover:from-orange-500 hover:to-red-700 text-white"
                  onClick={() => navigate("/study/flashcards")}
                >
                  Review Now
                </Button>
              </CardContent>
            </Card>
          </section>

          {/* Quick Stats */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard 
              title="Study Time" 
              value={stats ? `${Math.floor(stats.totalStudyTime / 60000)}m` : "0m"} 
              icon={Clock} 
            />
            <StatCard 
              title="Flashcards" 
              value={stats?.flashcardsReviewed || 0} 
              icon={Brain} 
            />
            <StatCard 
              title="Quizzes" 
              value={stats?.quizzesCompleted || 0} 
              icon={ListChecks} 
            />
            <StatCard 
              title="Streak" 
              value={`${stats?.currentStreak || 0} days`} 
              icon={Flame} 
            />
          </section>

          {/* Tabs */}
          <Tabs defaultValue="materials" className="w-full">
            <TabsList className={`backdrop-blur-md border transition-colors ${
              isDark 
                ? "bg-white/10 border-white/20" 
                : "bg-white/60 border-gray-300/40"
            }`}>
              <TabsTrigger 
                value="materials" 
                className={`transition-colors ${
                  isDark
                    ? "data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                    : "data-[state=active]:bg-white/80 data-[state=active]:text-gray-900 text-gray-700"
                }`}
              >
                Materials
              </TabsTrigger>
              <TabsTrigger 
                value="analytics" 
                className={`transition-colors ${
                  isDark
                    ? "data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
                    : "data-[state=active]:bg-white/80 data-[state=active]:text-gray-900 text-gray-700"
                }`}
              >
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="materials" className="space-y-6 mt-6">
              {/* Create Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CreateTile
                  title="Blank Document"
                  subtitle="Start with a blank note"
                  icon={FileText}
                  onClick={() => setShowUploadModal(true)}
                />
                <CreateTile
                  title="Record or Upload Audio"
                  subtitle="Transcribe lectures"
                  icon={Mic}
                  onClick={() => setShowUploadModal(true)}
                />
                <CreateTile
                  title="Document Upload"
                  subtitle="PDF, DOC, PPT"
                  icon={Upload}
                  onClick={() => setShowUploadModal(true)}
                />
                <CreateTile
                  title="YouTube Video"
                  subtitle="Extract from video"
                  icon={LinkIcon}
                  onClick={() => setShowUploadModal(true)}
                />
              </div>

              {/* Recent Materials */}
              <div>
                <h2 className={`text-xl font-semibold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
                  Recent Materials
                </h2>
                {!materials || materials.length === 0 ? (
                  <Card className={`backdrop-blur-md transition-colors ${
                    isDark 
                      ? "bg-white/10 border-white/20" 
                      : "bg-white/60 border-gray-300/40"
                  }`}>
                    <CardContent className="p-12 text-center">
                      <Upload className={`h-12 w-12 mx-auto mb-4 ${isDark ? "text-white/60" : "text-gray-600"}`} />
                      <h3 className={`text-lg font-semibold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                        No materials yet
                      </h3>
                      <p className={`text-sm mb-4 ${isDark ? "text-white/70" : "text-gray-700"}`}>
                        Upload your first document to get started
                      </p>
                      <Button
                        onClick={() => setShowUploadModal(true)}
                        className={`rounded-xl backdrop-blur-md border transition-colors ${
                          isDark
                            ? "bg-white/20 hover:bg-white/30 text-white border-white/30"
                            : "bg-white/80 hover:bg-white text-gray-900 border-gray-300/40"
                        }`}
                      >
                        Upload Document
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {materials.slice(0, 10).map((material) => (
                      <Card
                        key={material._id}
                        className={`backdrop-blur-md border transition-colors cursor-pointer ${
                          isDark
                            ? "bg-white/10 border-white/20 hover:border-white/40"
                            : "bg-white/60 border-gray-300/40 hover:border-gray-400/60"
                        }`}
                        onClick={() => {
                          if (material.type !== "pdf") return;
                          const targetId = (material as any).docId || material._id;
                          navigate(`/study/workspace/${targetId}`);
                        }}
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isDark ? "bg-white/20" : "bg-white/80"
                            }`}>
                              <FileText className={`w-5 h-5 ${isDark ? "text-white" : "text-gray-900"}`} />
                            </div>
                            <div>
                              <h3 className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                                {material.title}
                              </h3>
                              <p className={`text-sm ${isDark ? "text-white/70" : "text-gray-700"}`}>
                                Last opened {Math.floor((Date.now() - material._creationTime) / (1000 * 60 * 60 * 24))} days ago
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <Card className={`backdrop-blur-md transition-colors ${
                isDark 
                  ? "bg-white/10 border-white/20" 
                  : "bg-white/60 border-gray-300/40"
              }`}>
                <CardContent className="p-12 text-center">
                  <p className={isDark ? "text-white/70" : "text-gray-700"}>
                    Analytics coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className={`backdrop-blur-xl border max-w-2xl transition-colors ${
          isDark
            ? "bg-white/10 border-white/20"
            : "bg-white/90 border-gray-300/40"
        }`}>
          <DialogHeader>
            <DialogTitle className={isDark ? "text-white" : "text-gray-900"}>
              Upload Document
            </DialogTitle>
          </DialogHeader>
          <StudyUploadZone onUploadComplete={handleUploadComplete} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}