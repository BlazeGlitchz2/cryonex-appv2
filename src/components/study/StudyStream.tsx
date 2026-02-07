import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, SkipForward, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { ScrollArea } from "@/components/ui/scroll-area";

type ActivityType = "summary" | "flashcard" | "quiz";

interface Activity {
  type: ActivityType;
  content: any;
  completed: boolean;
}

export function StudyStream() {
  const notes = useQuery(api.study.listNotes, {});
  const flashcards = useQuery(api.study.listFlashcards, {});

  const [activities, setActivities] = useState<Activity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (notes && flashcards) {
      const stream: Activity[] = [];

      // Add note summaries
      notes.slice(0, 3).forEach((note) => {
        stream.push({
          type: "summary",
          content: { title: note.title, text: note.content.substring(0, 500) },
          completed: false,
        });
      });

      // Add flashcards
      flashcards.slice(0, 5).forEach((card) => {
        stream.push({
          type: "flashcard",
          content: card,
          completed: false,
        });
      });

      setActivities(stream);
    }
  }, [notes, flashcards]);

  const currentActivity = activities[currentIndex];
  const progress =
    activities.length > 0 ? ((currentIndex + 1) / activities.length) * 100 : 0;

  const handleNext = () => {
    if (currentIndex < activities.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      toast.success("Study stream completed!");
      setIsActive(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    const updated = [...activities];
    updated[currentIndex].completed = true;
    setActivities(updated);

    toast.success(correct ? "Correct!" : "Keep practicing!");
    setTimeout(handleNext, 1000);
  };

  if (!isActive) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl bg-[#1a1a1a] border-[#2a2a2a]">
          <CardHeader>
            <CardTitle>Study Stream</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[#6b6b6b]">
              Study Stream combines passive review (summaries) and active recall
              (flashcards) into one continuous session for optimal learning.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-white">This session includes:</p>
              <ul className="text-sm text-[#6b6b6b] space-y-1">
                <li>• {notes?.length || 0} note summaries</li>
                <li>• {flashcards?.length || 0} flashcards</li>
              </ul>
            </div>
            <Button
              onClick={() => setIsActive(true)}
              className="w-full bg-white text-black hover:bg-white/90"
              disabled={activities.length === 0}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Study Stream
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentActivity) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#6b6b6b]">No study materials available</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#6b6b6b]">
            Activity {currentIndex + 1} of {activities.length}
          </span>
          <span className="text-sm text-[#6b6b6b]">
            {Math.round(progress)}% Complete
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="flex-1 bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden flex flex-col">
        <ScrollArea className="flex-1">
          <CardContent className="p-8">
            {currentActivity.type === "summary" && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">
                  {currentActivity.content.title}
                </h3>
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{currentActivity.content.text}</ReactMarkdown>
                </div>
                <Button
                  onClick={handleNext}
                  className="w-full bg-white text-black hover:bg-white/90"
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            )}

            {currentActivity.type === "flashcard" && (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-xl text-white mb-4">
                    {currentActivity.content.front}
                  </p>
                  {showAnswer && (
                    <div className="mt-6 p-4 bg-[#2a2a2a] rounded-lg">
                      <p className="text-lg text-white">
                        {currentActivity.content.back}
                      </p>
                    </div>
                  )}
                </div>

                {!showAnswer ? (
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="w-full bg-white text-black hover:bg-white/90"
                  >
                    Show Answer
                  </Button>
                ) : (
                  <div className="flex gap-4">
                    <Button
                      onClick={() => handleAnswer(false)}
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Incorrect
                    </Button>
                    <Button
                      onClick={() => handleAnswer(true)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Correct
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </ScrollArea>
      </Card>
    </div>
  );
}
