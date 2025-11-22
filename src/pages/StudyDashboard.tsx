import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Clock, Brain, ListChecks, Flame, FileText, Mic, Upload, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
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
      className="flex-1 overflow-y-auto p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Study Hub</h1>
            <p className="text-muted-foreground mt-1">Track your progress and manage study materials.</p>
          </div>
          <div className="flex items-center gap-3">
            <XPBadge level={stats?.level || 1} xp={stats?.totalPoints || 0} />
          </div>
        </div>

        {/* Progress Rail */}
        <ProgressRail percent={0} />

        {/* Usage Meters */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Study packs left this week
                </span>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-2">
                3 / 3
              </div>
              <div className="w-full rounded-full h-2 bg-secondary/50">
                <div className="bg-gradient-to-r from-blue-400 to-purple-600 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Resets in 5 days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Chat turns left
                </span>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-2">
                87 / 100
              </div>
              <div className="w-full rounded-full h-2 bg-secondary/50">
                <div className="bg-gradient-to-r from-purple-400 to-pink-600 h-2 rounded-full" style={{ width: '87%' }} />
              </div>
              <p className="text-xs mt-2 text-muted-foreground">
                Resets daily
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Cards due today
                </span>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-3xl font-bold mb-2">
                12
              </div>
              <Button
                size="sm"
                className="w-full mt-2 bg-gradient-to-r from-orange-400 to-red-600 hover:from-orange-500 hover:to-red-700 text-white border-0"
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
          <TabsList className="bg-muted/50 backdrop-blur-sm border border-border">
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
              <h2 className="text-xl font-semibold mb-4">Recent Materials</h2>
              {!materials || materials.length === 0 ? (
                <Card className="bg-card/50 backdrop-blur-sm border-dashed">
                  <CardContent className="p-12 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No materials yet</h3>
                    <p className="text-sm mb-4 text-muted-foreground">
                      Upload your first document to get started
                    </p>
                    <Button
                      onClick={() => setShowUploadModal(true)}
                      variant="secondary"
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
                      className="bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-colors cursor-pointer"
                      onClick={() => {
                        if (material.type !== "pdf") return;
                        const targetId = (material as any).docId || material._id;
                        navigate(`/study/workspace/${targetId}`);
                      }}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-foreground" />
                          </div>
                          <div>
                            <h3 className="font-medium">{material.title}</h3>
                            <p className="text-sm text-muted-foreground">
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
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Analytics coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <StudyUploadZone onUploadComplete={handleUploadComplete} />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}