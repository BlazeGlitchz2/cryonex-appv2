import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useActivityTracking } from "@/hooks/use-activity-tracking";

export type DashboardFeature =
  | "dashboard"
  | "flashcards"
  | "quiz"
  | "regional_trainer"
  | "match";

export interface StudyDashboardTrackingContext {
  source: string;
  section?: string;
  title?: string;
}

export function useStudyDashboardHandlers(
  trackingContext: StudyDashboardTrackingContext = { source: "study_dashboard" },
) {
  const [activeFeature, setActiveFeature] =
    useState<DashboardFeature>("dashboard");
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("General Study");

  const createGoal = useMutation(api.study.createGoal);
  const completeGoal = useMutation(api.study.completeGoal);
  const createMaterial = useMutation(api.study.createMaterial);
  const generateAssets = useAction(api.autoGenerate.generateAllAssets);
  const { trackActivity } = useActivityTracking(trackingContext);
  const hasLoggedViewRef = useRef(false);
  const previousFeatureRef = useRef<DashboardFeature>("dashboard");
  const previousFocusRef = useRef(false);
  const previousUploadRef = useRef(false);

  useEffect(() => {
    if (hasLoggedViewRef.current) return;
    const result = trackActivity({
      eventType: "page_view",
      title: trackingContext.title,
      section: trackingContext.section,
      details: {
        source: trackingContext.source,
        view: "study_dashboard",
      },
    });
    if (result) {
      hasLoggedViewRef.current = true;
    }
  }, [trackActivity, trackingContext.section, trackingContext.source, trackingContext.title]);

  useEffect(() => {
    if (previousFeatureRef.current === activeFeature) return;

    void trackActivity({
      eventType: "feature_opened",
      section: activeFeature,
      details: {
        previousFeature: previousFeatureRef.current,
      },
    });
    previousFeatureRef.current = activeFeature;
  }, [activeFeature, trackActivity]);

  useEffect(() => {
    if (isFocusModeOpen && !previousFocusRef.current) {
      void trackActivity({
        eventType: "focus_mode_opened",
        section: "focus_mode",
      });
    }
    previousFocusRef.current = isFocusModeOpen;
  }, [isFocusModeOpen, trackActivity]);

  useEffect(() => {
    if (isUploadOpen && !previousUploadRef.current) {
      void trackActivity({
        eventType: "capture_lane_opened",
        section: "capture_lane",
      });
    }
    previousUploadRef.current = isUploadOpen;
  }, [isUploadOpen, trackActivity]);

  const handleAddGoal = async (text: string) => {
    if (!text || !text.trim()) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      await createGoal({ text, date: today });
      void trackActivity({
        eventType: "goal_added",
        section: "goals",
        details: {
          textLength: text.trim().length,
        },
      });
      toast.success("Goal added!");
    } catch {
      toast.error("Failed to add goal");
    }
  };

  const handleToggleGoal = async (
    goalId: Id<"dailyGoals">,
    currentStatus: boolean,
  ) => {
    try {
      await completeGoal({ goalId, isCompleted: !currentStatus });
      void trackActivity({
        eventType: currentStatus ? "goal_reopened" : "goal_completed",
        section: "goals",
        details: {
          goalId: String(goalId),
        },
      });
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

  const createTrackedMaterial = async (args: any) => {
    const materialId = await createMaterial(args);
    void trackActivity({
      eventType: "study_material_created",
      section: "capture_lane",
      title: args.title,
      details: {
        type: args.type,
        hasStorageId: Boolean(args.storageId),
        contentLength: typeof args.content === "string" ? args.content.length : 0,
      },
    });
    return materialId;
  };

  const generateTrackedAssets = async (args: any) => {
    const result = await generateAssets(args);
    void trackActivity({
      eventType: "study_assets_generated",
      section: "capture_lane",
      details: {
        materialId: String(args.materialId),
        contentLength: typeof args.content === "string" ? args.content.length : 0,
        hasFocusPrompt: Boolean(args.focusPrompt),
      },
    });
    return result;
  };

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
    createMaterial: createTrackedMaterial,
    generateAssets: generateTrackedAssets,
    trackActivity,
  };
}
