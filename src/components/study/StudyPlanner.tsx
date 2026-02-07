import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export function StudyPlanner() {
  const stats = useQuery(api.study.getStats, {});
  const recordSession = useMutation(api.study.recordStudySession);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsTimerActive(false);
    toast.success("🎉 Pomodoro session complete! Great work!");

    if (sessionStartTime) {
      const duration = Date.now() - sessionStartTime;
      try {
        await recordSession({
          duration,
          date: new Date().toISOString(),
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to record session");
      }
    }
  };

  const handleStartPause = () => {
    if (!isTimerActive) {
      setSessionStartTime(Date.now());
      setIsTimerActive(true);
      toast.info("Timer started! Focus for 25 minutes.");
    } else {
      setIsTimerActive(false);
      toast.info("Timer paused");
    }
  };

  const handleReset = () => {
    setIsTimerActive(false);
    setTimeLeft(25 * 60);
    setSessionStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Mock weekly data (replace with real data from stats)
  const weeklyData = [
    { day: "Mon", minutes: 45 },
    { day: "Tue", minutes: 60 },
    { day: "Wed", minutes: 30 },
    { day: "Thu", minutes: 75 },
    { day: "Fri", minutes: 50 },
    { day: "Sat", minutes: 90 },
    { day: "Sun", minutes: 40 },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Study Planner
          </h2>
          <p className="text-sm text-[#6b6b6b]">
            Track your study sessions and maintain your streak
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pomodoro Timer */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-400" />
                Pomodoro Timer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-white mb-6">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleStartPause}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    {isTimerActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start 25-min Session
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-[#2a2a2a]"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#2a2a2a]">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {stats?.currentStreak || 0}
                  </p>
                  <p className="text-xs text-[#6b6b6b]">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {stats ? Math.floor(stats.totalStudyTime / 3600000) : 0}h
                  </p>
                  <p className="text-xs text-[#6b6b6b]">Total Time</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {stats?.level || 1}
                  </p>
                  <p className="text-xs text-[#6b6b6b]">Level</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardHeader>
              <CardTitle>Study Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border-[#2a2a2a]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Weekly Study Chart */}
        <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle>Weekly Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="day" stroke="#6b6b6b" />
                <YAxis stroke="#6b6b6b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="minutes" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
