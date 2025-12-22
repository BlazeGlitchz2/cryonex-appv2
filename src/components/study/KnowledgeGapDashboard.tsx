import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export function KnowledgeGapDashboard({ materialId }: { materialId: any }) {
    const gaps = useQuery(api.knowledgeGaps.getKnowledgeGaps);
    const generateReview = useAction(api.knowledgeGaps.generateTargetedReview);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reviewContent, setReviewContent] = useState<string | null>(null);

    if (!gaps) return <div className="text-center p-4 text-muted-foreground">Loading analysis...</div>;

    const weakTopics = gaps.filter(g => g.status === "weak").map(g => g.topic);

    const handleGenerateReview = async () => {
        if (weakTopics.length === 0) return;

        setIsGenerating(true);
        try {
            const content = await generateReview({
                topics: weakTopics,
                materialId: materialId as any,
            });
            setReviewContent(content);
            toast.success("Targeted review generated!");
        } catch (error) {
            toast.error("Failed to generate review");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {gaps.map((gap, i) => (
                    <Card key={i} className="bg-[#1a1a1a] border-[#2a2a2a]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-200 flex justify-between items-center">
                                {gap.topic}
                                {gap.status === "strong" && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {gap.status === "average" && <TrendingUp className="w-4 h-4 text-yellow-500" />}
                                {gap.status === "weak" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Mastery</span>
                                    <span>{gap.score}%</span>
                                </div>
                                <Progress
                                    value={gap.score}
                                    className={`h-2 ${gap.status === "strong" ? "bg-green-900/20 [&>div]:bg-green-500" :
                                        gap.status === "average" ? "bg-yellow-900/20 [&>div]:bg-yellow-500" :
                                            "bg-red-900/20 [&>div]:bg-red-500"
                                        }`}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {weakTopics.length > 0 && (
                <Card className="bg-red-500/5 border-red-500/20">
                    <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2">
                                <Brain className="w-5 h-5" />
                                Knowledge Gaps Detected
                            </h3>
                            <p className="text-sm text-gray-400">
                                You're struggling with: <span className="text-white font-medium">{weakTopics.join(", ")}</span>.
                                {materialId ? " Generate a targeted guide to close these gaps." : " Go to the relevant study material to generate a review guide."}
                            </p>
                        </div>
                        {materialId && (
                            <Button
                                onClick={handleGenerateReview}
                                disabled={isGenerating}
                                className="bg-red-600 hover:bg-red-700 text-white shrink-0"
                            >
                                {isGenerating ? "Generating..." : "Generate Targeted Review"}
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {reviewContent && (
                <Card className="bg-[#1a1a1a] border-[#2a2a2a] animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                        <CardTitle>Targeted Review Guide</CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none">
                        <ReactMarkdown>{reviewContent}</ReactMarkdown>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
