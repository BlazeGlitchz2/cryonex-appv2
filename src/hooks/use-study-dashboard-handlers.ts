import { useState, useCallback } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

export type DashboardFeature =
  | "dashboard"
  | "flashcards"
  | "quiz"
  | "regional_trainer"
  | "match";

export function useStudyDashboardHandlers() {
    const [activeFeature, setActiveFeature] = useState<DashboardFeature>("dashboard");
    const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTopic, setSelectedTopic] = useState("General Study");

    const createGoal = useMutation(api.study.createGoal);
    const completeGoal = useMutation(api.study.completeGoal);
    const createMaterial = useMutation(api.study.createMaterial);
    const generateAssets = useAction(api.autoGenerate.generateAllAssets);

    const handleAddGoal = async (text: string) => {
        if (!text || !text.trim()) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            await createGoal({ text, date: today });
            toast.success("Goal added!");
        } catch {
            toast.error("Failed to add goal");
        }
    };

    const handleToggleGoal = async (goalId: Id<"dailyGoals">, currentStatus: boolean) => {
        try {
            await completeGoal({ goalId, isCompleted: !currentStatus });
        } catch {
            toast.error("Failed to update goal");
        }
    };

    const formatStudyTime = useCallback((ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }, []);

    return {
        activeFeature,
        setActiveFeature,
        isFocusModeOpen,
        setIsFocusModeOpen,
        isUploadOpen,
        setIsUploadOpen,
        searchQuery,
        setSearchQuery,
        selectedTopic,
        setSelectedTopic,
        handleAddGoal,
        handleToggleGoal,
        formatStudyTime,
        createMaterial,
        generateAssets,
    };
}
