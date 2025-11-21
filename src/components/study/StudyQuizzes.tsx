import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Play, Trophy, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";

interface StudyQuizzesProps {
  autoContent?: string;
}

export function StudyQuizzes({ autoContent }: StudyQuizzesProps) {
  const [isLoading, setIsLoading] = useState(false);
  // const generateQuiz = useAction(api.studyAI.generateQuiz);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // await generateQuiz();
      toast.info("AI quiz generation is currently disabled.");
    } catch (error) {
      toast.error("Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Quizzes</h2>
          <p className="text-sm text-[#6b6b6b]">Test your knowledge with AI-generated quizzes</p>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading} className="bg-white text-black hover:bg-white/90">
          <Plus className="h-4 w-4 mr-2" />
          Generate Quiz
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Play className="h-12 w-12 text-[#6b6b6b] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No active quiz</h3>
          <p className="text-sm text-[#6b6b6b] mb-4">
            Generate a quiz from your notes or materials to get started
          </p>
        </div>
      </ScrollArea>
    </div>
  );
}