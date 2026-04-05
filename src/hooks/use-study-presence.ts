import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@/hooks/use-auth";
import { useDeviceInfo, useDeviceType } from "@/hooks/use-mobile";

export interface StudyPresenceState {
  source: string;
  route: string;
  currentActivity?: string;
  currentSection?: string;
  title?: string;
  subject?: string;
  materialId?: Id<"studyMaterials">;
  docId?: string;
  sessionId?: Id<"studySessions">;
  enabled?: boolean;
  details?: Record<string, unknown>;
}

const PRESENCE_PULSE_MS = 20_000;

export function useStudyPresence({
  source,
  route,
  currentActivity,
  currentSection,
  title,
  subject,
  materialId,
  docId,
  sessionId,
  enabled = true,
  details,
}: StudyPresenceState) {
  const { user } = useAuth();
  const deviceInfo = useDeviceInfo();
  const deviceType = useDeviceType();
  const pulsePresence = useMutation(api.study.pulseStudyPresence);
  const clearPresence = useMutation(api.study.clearStudyPresence);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !user) return;

    const platform = deviceInfo.isAndroid
      ? "android"
      : deviceInfo.isIOS
        ? "ios"
        : "web";

    const ping = () =>
      pulsePresence({
        source,
        route,
        currentActivity,
        currentSection,
        title,
        subject,
        materialId,
        docId,
        sessionId,
        platform,
        deviceType,
        details,
      });

    void ping();

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(() => {
      void ping();
    }, PRESENCE_PULSE_MS);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void ping();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
      void clearPresence({
        source,
        route,
        sessionId,
      });
    };
  }, [
    clearPresence,
    currentActivity,
    currentSection,
    details,
    deviceInfo.isAndroid,
    deviceInfo.isIOS,
    deviceType,
    docId,
    enabled,
    materialId,
    pulsePresence,
    route,
    sessionId,
    source,
    subject,
    title,
    user,
  ]);
}
