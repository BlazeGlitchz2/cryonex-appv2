import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  DEFAULT_ALLOWED_APPS,
  DEFAULT_DISTRACTING_APPS,
  deriveFocusSessionState,
  normalizeFocusSessionDuration,
  shouldWarnAboutDistraction,
  type FocusSessionRecord,
} from "@/lib/focus-session";
import { hapticFeedback, hapticNotification, isNativePlatform } from "@/lib/mobile";

type StudyActivityType =
  | "reading"
  | "note_taking"
  | "flashcards"
  | "quiz"
  | "diagram";

function supportsBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

async function sendFocusNotification(title: string, body: string) {
  if (!supportsBrowserNotifications()) return false;

  if (Notification.permission === "default") {
    const nextPermission = await Notification.requestPermission();
    if (nextPermission !== "granted") return false;
  }

  if (Notification.permission !== "granted") return false;

  new Notification(title, { body, tag: "cryonex-focus-session" });
  return true;
}

function mapSessionRecord(session: any): FocusSessionRecord | null {
  if (!session?._id) return null;

  return {
    breakCount: Number(session.breakCount || 0),
    breakDurationMs: Number(session.breakDurationMinutes || 10) * 60 * 1000,
    breakEndsAt: session.breakEndsAt || undefined,
    breakUsed: Boolean(session.breakUsed),
    distractionAttemptCount: Number(session.distractionAttemptCount || 0),
    distractingApps:
      session.distractingApps?.length > 0
        ? session.distractingApps
        : DEFAULT_DISTRACTING_APPS,
    endedAt: session.endTime || undefined,
    id: String(session._id),
    importantApps:
      session.importantApps?.length > 0
        ? session.importantApps
        : DEFAULT_ALLOWED_APPS,
    plannedDurationMs:
      Number(session.plannedDurationMinutes || 45) * 60 * 1000,
    quitEarly: Boolean(session.quitEarly),
    startedAt: Number(session.startTime || Date.now()),
    status: (session.status || "active") as FocusSessionRecord["status"],
  };
}

export function useFocusSessionController({
  activityType,
  enabled,
  materialId,
  noteId,
  surfaceLabel,
}: {
  activityType: StudyActivityType;
  enabled: boolean;
  materialId?: Id<"studyMaterials">;
  noteId?: Id<"studyNotes">;
  surfaceLabel: string;
}) {
  const activeSession = useQuery(api.study.getActiveStudySession, enabled ? {} : "skip");
  const startSession = useMutation(api.study.startStudySession);
  const endSession = useMutation(api.study.endStudySession);
  const quitSession = useMutation(api.study.quitStudySession);
  const startBreak = useMutation(api.study.startStudyBreak);
  const resumeSession = useMutation(api.study.resumeStudySession);
  const recordDistractionAttempt = useMutation(api.study.recordDistractionAttempt);
  const recordSchoolActivityEvent = useMutation(api.social.recordSchoolActivityEvent);

  const [selectedDuration, setSelectedDuration] = useState(45);
  const [now, setNow] = useState(Date.now());
  const hiddenWarningRef = useRef(false);
  const lastPhaseRef = useRef<string | null>(null);
  const completionRef = useRef(false);

  const sessionRecord = useMemo(
    () => mapSessionRecord(activeSession),
    [activeSession],
  );
  const sessionState = useMemo(
    () => (sessionRecord ? deriveFocusSessionState(sessionRecord, now) : null),
    [now, sessionRecord],
  );

  useEffect(() => {
    if (!sessionRecord) return;

    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [sessionRecord]);

  useEffect(() => {
    if (!sessionRecord || !sessionState) {
      lastPhaseRef.current = null;
      completionRef.current = false;
      return;
    }

    const lastPhase = lastPhaseRef.current;
    lastPhaseRef.current = sessionState.phase;

    if (lastPhase === sessionState.phase) {
      return;
    }

    if (sessionState.phase === "on_break") {
      toast.info("Force break started. You have up to 10 minutes.");
      void hapticNotification("warning");
    }

    if (sessionState.phase === "completed") {
      toast.success("Focus block completed. Nice work.");
      void hapticNotification("success");
      void sendFocusNotification("Focus block finished", "Cryonex is ready for your next step.");
    }

    if (sessionState.phase === "quit_early") {
      toast.error("Session ended early. School Hub will reflect the early quit.");
      void hapticNotification("error");
    }
  }, [sessionRecord, sessionState]);

  useEffect(() => {
    if (!activeSession || !sessionRecord || !sessionState) return;

    if (
      activeSession.status === "on_break" &&
      activeSession.breakEndsAt &&
      activeSession.breakEndsAt <= now
    ) {
      void resumeSession({ sessionId: activeSession._id }).catch(console.error);
      toast.info("Break finished. Back to studying.");
    }

    if (
      activeSession.status === "active" &&
      sessionState.phase === "completed" &&
      !completionRef.current
    ) {
      completionRef.current = true;
      void completeSession().catch(console.error);
    }
  }, [activeSession, now, resumeSession, sessionRecord, sessionState]);

  useEffect(() => {
    if (!activeSession || !sessionRecord) return;

    const handleVisibilityChange = () => {
      const nextVisibility =
        document.visibilityState === "hidden" ? "hidden" : "visible";

      if (
        nextVisibility === "hidden" &&
        shouldWarnAboutDistraction(sessionRecord, "hidden") &&
        !hiddenWarningRef.current
      ) {
        hiddenWarningRef.current = true;
        void recordDistractionAttempt({
          context: "app_hidden",
          sessionId: activeSession._id,
        }).catch(console.error);
        void sendFocusNotification(
          "Stay in your focus block",
          "Distracting apps are blocked in Cryonex focus mode. Return when you're ready.",
        );
      }

      if (nextVisibility === "visible" && hiddenWarningRef.current) {
        hiddenWarningRef.current = false;
        toast.warning("Back to Cryonex. Keep the focus block alive.");
        if (isNativePlatform()) {
          void hapticFeedback("medium");
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [activeSession, recordDistractionAttempt, sessionRecord]);

  const elapsedSeconds = sessionState
    ? Math.floor(sessionState.elapsedMs / 1000)
    : 0;
  const remainingSeconds = sessionState
    ? Math.ceil(sessionState.remainingMs / 1000)
    : normalizeFocusSessionDuration(selectedDuration) * 60;
  const remainingBreakSeconds = sessionState
    ? Math.ceil(sessionState.remainingBreakMs / 1000)
    : 0;

  const startFocusSession = async () => {
    const duration = normalizeFocusSessionDuration(selectedDuration);
    try {
      const sessionId = await startSession({
        activityType,
        distractingApps: DEFAULT_DISTRACTING_APPS,
        importantApps: DEFAULT_ALLOWED_APPS,
        materialId,
        noteId,
        plannedDurationMinutes: duration,
      });

      await recordSchoolActivityEvent({
        audience: "school",
        description: `Started a ${duration}-minute focus session from ${surfaceLabel}.`,
        eventType: "study_session_started",
        sessionId,
        title: "Started a focus session",
      }).catch(() => null);

      toast.success(`Focus session started for ${duration} minutes.`);
      void hapticNotification("success");
      void sendFocusNotification(
        "Focus session started",
        `Cryonex will guard your next ${duration} minutes.`,
      );
    } catch (error: any) {
      toast.error(error?.message || "Could not start focus session.");
    }
  };

  const startForceBreak = async () => {
    if (!activeSession?._id) return;
    try {
      await startBreak({ breakDurationMinutes: 10, sessionId: activeSession._id });
    } catch (error: any) {
      toast.error(error?.message || "Could not start your force break.");
    }
  };

  const resumeAfterBreak = async () => {
    if (!activeSession?._id) return;
    try {
      await resumeSession({ sessionId: activeSession._id });
      toast.success("Break ended. Back in the focus block.");
      void hapticFeedback("light");
    } catch (error: any) {
      toast.error(error?.message || "Could not resume the session.");
    }
  };

  const completeSession = async () => {
    if (!activeSession?._id) return;
    try {
      await endSession({ sessionId: activeSession._id });
      await recordSchoolActivityEvent({
        audience: "school",
        description: `Completed a focused session after ${Math.max(1, Math.round((sessionState?.elapsedMs || 0) / 60000))} minutes.`,
        durationMs: sessionState?.elapsedMs,
        eventType: "study_session_completed",
        sessionId: activeSession._id,
        title: "Completed a focus session",
      }).catch(() => null);
    } catch (error: any) {
      toast.error(error?.message || "Could not complete the session.");
    }
  };

  const endSessionEarly = async () => {
    if (!activeSession?._id) return;
    try {
      const result = await quitSession({ sessionId: activeSession._id });
      await recordSchoolActivityEvent({
        audience: "school",
        description: `Quit a focus session early after ${Math.max(1, Math.round((result?.duration || 0) / 60000))} minutes.`,
        durationMs: result?.duration,
        eventType: "study_session_quit_early",
        sessionId: activeSession._id,
        title: "Quit a session early",
      }).catch(() => null);
    } catch (error: any) {
      toast.error(error?.message || "Could not end the session early.");
    }
  };

  return {
    activeSession,
    completeSession,
    elapsedSeconds,
    endSessionEarly,
    hasActiveFocusSession: Boolean(sessionRecord),
    remainingBreakSeconds,
    remainingSeconds,
    resumeAfterBreak,
    selectedDuration,
    sessionRecord,
    sessionState,
    setSelectedDuration,
    startFocusSession,
    startForceBreak,
  };
}
