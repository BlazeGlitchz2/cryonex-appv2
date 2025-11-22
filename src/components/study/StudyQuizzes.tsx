import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Play, Trophy, Clock, Sparkles, ChevronRight } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface StudyQuizzesProps {
  materialId?: Id<"studyMaterials">;
  autoContent?: string;
  title?: string;
}

export function StudyQuizzes({ materialId, autoContent, title }: StudyQuizzesProps) {
  const [isLoading, setIsLoading] = useState(false);
  const quizzes = useQuery(api.study.listQuizzes, materialId ? { materialId } : "skip") || [];
  const generateAllAssets = useAction(api.autoGenerate.generateAllAssets);

  const handleGenerate = async () => {
    if (!materialId || !autoContent || !title) {
        toast.error("Missing information for generation");
        return;
    }
    setIsLoading(true);
    try {
      await generateAllAssets({
        materialId,
        content: autoContent,
        title
      });
      toast.success("Quiz generated successfully!");
    } catch (error) {
      toast.error("Failed to generate quiz");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-border flex items-center justify-between bg-card/30">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Quizzes</h2>
          <p className="text-sm text-muted-foreground">Test your knowledge with AI-generated quizzes</p>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? (
            "Generating..."
          ) : (
            <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate New Quiz
            </>
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-6">
        {quizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No quizzes yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Generate a quiz from your notes or materials to test your understanding and track progress.
            </p>
            <Button onClick={handleGenerate} variant="outline" disabled={isLoading}>
                Generate Your First Quiz
            </Button>
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz: any) => (
                    <Card key={quiz._id} className="hover:bg-muted/50 transition-colors cursor-pointer border-border/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-medium truncate pr-4">
                                {quiz.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>5 mins</span>
                                </div>
                                <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                                    {quiz.difficulty}
                                </div>
                            </div>
                            <Button className="w-full" variant="secondary">
                                <Play className="h-3 w-3 mr-2" />
                                Start Quiz
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
      </ScrollArea>
    </div>
  );
}
