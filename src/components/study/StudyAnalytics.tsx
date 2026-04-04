import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Clock, Flame, Target } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export function StudyAnalytics() {
  const { user } = useAuth();
  const stats = useQuery(api.study.getStats, user ? {} : "skip");
  const initializeStats = useMutation(api.study.initializeStats);

  useEffect(() => {
    if (user && stats === null) {
      initializeStats();
    }
  }, [stats, initializeStats, user]);

  const statCards = [
    {
      title: "Total Study Time",
      value: stats ? `${Math.floor(stats.totalStudyTime / 3600000)}h` : "0h",
      icon: Clock,
      color: "text-blue-400",
    },
    {
      title: "Current Streak",
      value: stats ? `${stats.currentStreak} days` : "0 days",
      icon: Flame,
      color: "text-orange-400",
    },
    {
      title: "Level",
      value: stats ? stats.level : 1,
      icon: Trophy,
      color: "text-yellow-400",
    },
    {
      title: "Total Points",
      value: stats ? stats.totalPoints : 0,
      icon: Target,
      color: "text-blue-400",
    },
  ];

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Sign in required
          </h3>
          <p className="text-sm text-[#6b6b6b]">
            Please sign in to view your study analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Study Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.title}
                  className="bg-[#1a1a1a] border-[#2a2a2a]"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#6b6b6b] flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                      {stat.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Progress Overview
          </h2>
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#6b6b6b]">Materials Completed</span>
                    <span className="text-white">
                      {stats?.materialsCompleted || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#6b6b6b]">Quizzes Completed</span>
                    <span className="text-white">
                      {stats?.quizzesCompleted || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[#6b6b6b]">Flashcards Reviewed</span>
                    <span className="text-white">
                      {stats?.flashcardsReviewed || 0}
                    </span>
                  </div>
                  <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: "0%" }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}
