export type StudySessionStatus = "active" | "break" | "idle";

export interface StudySession {
  id: string;
  title: string;
  course?: string;
  status: StudySessionStatus;
  startedAt?: string;
  endsAt?: string;
  breakAvailableAt?: string;
  focusTarget?: string;
  nextStep?: string;
}

export interface StudyBoardSnippet {
  id: string;
  title: string;
  summary: string;
  tag: string;
  updatedAt?: string;
}

export interface StudyActivitySnippet {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
}

export interface StudyReminder {
  id: string;
  title: string;
  body: string;
  dueAt?: string;
  priority: "high" | "medium" | "low";
}

export interface StudyAccountabilitySnapshot {
  source: "live" | "fallback";
  session: StudySession | null;
  boardSnippets: StudyBoardSnippet[];
  activitySnippets: StudyActivitySnippet[];
  reminders: StudyReminder[];
  updatedAt: string;
}

declare global {
  interface Window {
    __CRYONEX_STUDY_SNAPSHOT__?:
      | Partial<StudyAccountabilitySnapshot>
      | null
      | undefined;
  }
}

const DEFAULT_BOARD_SNIPPETS: StudyBoardSnippet[] = [
  {
    id: "board-welcome",
    title: "School board feed is ready to connect",
    summary:
      "When the backend publishes board updates, they will appear here with the latest notes and activity.",
    tag: "No live data",
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_ACTIVITY_SNIPPETS: StudyActivitySnippet[] = [
  {
    id: "activity-welcome",
    title: "Recent activity will show here",
    detail:
      "Task completions, submissions, and board interactions can stream into this card when the backend is connected.",
    timestamp: new Date().toISOString(),
  },
];

function minutesFromNow(minutes: number) {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function mergeSnapshot(
  base: StudyAccountabilitySnapshot,
  partial?: Partial<StudyAccountabilitySnapshot> | null,
) {
  if (!partial) {
    return base;
  }

  return {
    ...base,
    ...partial,
    session:
      partial.session === undefined ? base.session : partial.session ?? null,
    boardSnippets: partial.boardSnippets ?? base.boardSnippets,
    activitySnippets: partial.activitySnippets ?? base.activitySnippets,
    reminders: partial.reminders ?? base.reminders,
    source: "live" as const,
    updatedAt: partial.updatedAt ?? base.updatedAt,
  };
}

export function buildFallbackSnapshot(): StudyAccountabilitySnapshot {
  return {
    source: "fallback",
    session: null,
    boardSnippets: DEFAULT_BOARD_SNIPPETS,
    activitySnippets: DEFAULT_ACTIVITY_SNIPPETS,
    reminders: [
      {
        id: "enable-notifications",
        title: "Enable desktop reminders",
        body:
          "Grant notification permission so focus-session nudges can appear outside the app.",
        dueAt: minutesFromNow(1),
        priority: "high",
      },
      {
        id: "check-board",
        title: "Check your board feed",
        body:
          "Open the dashboard to review new board activity when your school backend starts publishing it.",
        dueAt: minutesFromNow(15),
        priority: "medium",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function resolveStudySnapshot(): StudyAccountabilitySnapshot {
  const fallback = buildFallbackSnapshot();

  if (typeof window === "undefined") {
    return fallback;
  }

  return mergeSnapshot(fallback, window.__CRYONEX_STUDY_SNAPSHOT__);
}

export function supportsDesktopNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getDesktopNotificationPermission() {
  if (!supportsDesktopNotifications()) {
    return "unavailable" as const;
  }

  return window.Notification.permission;
}

export async function requestDesktopNotificationPermission() {
  if (!supportsDesktopNotifications()) {
    return "unavailable" as const;
  }

  return window.Notification.requestPermission();
}

export function formatCountdown(targetIso?: string, now = Date.now()) {
  if (!targetIso) {
    return "Not scheduled";
  }

  const target = new Date(targetIso).getTime();
  const remaining = target - now;

  if (Number.isNaN(target)) {
    return "Not scheduled";
  }

  if (remaining <= 0) {
    return "Now";
  }

  const minutes = Math.ceil(remaining / 60_000);
  if (minutes < 60) {
    return `In ${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `In ${hours}h ${mins}m` : `In ${hours}h`;
}

export function formatRelativeTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  const diff = date.getTime() - Date.now();
  const minutes = Math.round(diff / 60_000);

  if (Math.abs(minutes) < 1) {
    return "Just now";
  }

  if (Math.abs(minutes) < 60) {
    return minutes > 0 ? `In ${minutes}m` : `${Math.abs(minutes)}m ago`;
  }

  const hours = Math.round(minutes / 60);
  return hours > 0 ? `In ${hours}h` : `${Math.abs(hours)}h ago`;
}

