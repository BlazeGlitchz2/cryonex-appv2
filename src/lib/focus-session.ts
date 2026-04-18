export const DEFAULT_DISTRACTING_APPS = [
  "Instagram",
  "TikTok",
  "Snapchat",
  "X",
  "YouTube",
  "Facebook",
  "Reddit",
  "Discord",
];

export const DEFAULT_ALLOWED_APPS = [
  "Phone",
  "Messages",
  "Messenger",
  "WhatsApp",
  "SMS",
  "Calendar",
];

export type FocusSessionStatus =
  | "active"
  | "on_break"
  | "completed"
  | "quit_early";

export interface FocusSessionRecord {
  id: string;
  startedAt: number;
  plannedDurationMs: number;
  status: FocusSessionStatus;
  breakUsed: boolean;
  breakCount: number;
  breakDurationMs: number;
  distractionAttemptCount: number;
  distractingApps: string[];
  importantApps: string[];
  endedAt?: number;
  breakEndsAt?: number;
  quitEarly: boolean;
}

export interface FocusSessionState {
  phase: FocusSessionStatus;
  elapsedMs: number;
  remainingMs: number;
  remainingBreakMs: number;
  canForceBreak: boolean;
  shouldLockDistractions: boolean;
}

export function normalizeFocusSessionDuration(minutes?: number) {
  if (!minutes || Number.isNaN(minutes)) return 45;
  return Math.min(180, Math.max(15, Math.round(minutes)));
}

export function getFocusSessionProgress(
  session: FocusSessionRecord,
  now = Date.now(),
) {
  const elapsedMs = Math.max(0, now - session.startedAt);
  return Math.min(1, elapsedMs / Math.max(1, session.plannedDurationMs));
}

export function deriveFocusSessionState(
  session: FocusSessionRecord,
  now = Date.now(),
): FocusSessionState {
  const elapsedMs = Math.max(0, now - session.startedAt);
  const remainingMs = Math.max(0, session.plannedDurationMs - elapsedMs);
  const remainingBreakMs = Math.max(0, (session.breakEndsAt || 0) - now);
  const isCompletedByClock =
    session.status === "completed" ||
    (!session.endedAt && remainingMs === 0 && session.status === "active");

  if (session.quitEarly || session.status === "quit_early") {
    return {
      canForceBreak: false,
      elapsedMs,
      phase: "quit_early",
      remainingBreakMs: 0,
      remainingMs,
      shouldLockDistractions: false,
    };
  }

  if (session.status === "on_break" && remainingBreakMs > 0) {
    return {
      canForceBreak: false,
      elapsedMs,
      phase: "on_break",
      remainingBreakMs,
      remainingMs,
      shouldLockDistractions: false,
    };
  }

  if (isCompletedByClock || session.endedAt) {
    return {
      canForceBreak: !session.breakUsed,
      elapsedMs,
      phase: "completed",
      remainingBreakMs: 0,
      remainingMs: 0,
      shouldLockDistractions: false,
    };
  }

  return {
    canForceBreak: !session.breakUsed,
    elapsedMs,
    phase: "active",
    remainingBreakMs: 0,
    remainingMs,
    shouldLockDistractions: true,
  };
}

export function shouldWarnAboutDistraction(
  session: FocusSessionRecord,
  visibilityState: "visible" | "hidden",
) {
  if (visibilityState !== "hidden") return false;
  return session.status === "active" && !session.quitEarly && !session.endedAt;
}
