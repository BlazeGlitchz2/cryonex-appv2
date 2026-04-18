import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  BellOff,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  PauseCircle,
  Radio,
  Sparkles,
  Target,
  TimerReset,
} from "lucide-react";
import {
  formatCountdown,
  formatRelativeTimestamp,
  getDesktopNotificationPermission,
  requestDesktopNotificationPermission,
  resolveStudySnapshot,
  supportsDesktopNotifications,
  type StudyAccountabilitySnapshot,
  type StudyReminder,
} from "../lib/studyAccountability";

function badgeStyles(priority: StudyReminder["priority"]) {
  if (priority === "high") {
    return "border-red-500/30 bg-red-500/10 text-red-200";
  }

  if (priority === "medium") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  }

  return "border-cyan-500/20 bg-cyan-500/10 text-cyan-100";
}

export function StudyAccountabilityPanel() {
  const [snapshot] = useState<StudyAccountabilitySnapshot>(() =>
    resolveStudySnapshot(),
  );
  const [now, setNow] = useState(() => Date.now());
  const [permission, setPermission] = useState(() =>
    getDesktopNotificationPermission(),
  );
  const notifiedIdsRef = useRef(new Set<string>());

  const notificationState = useMemo(() => {
    if (!supportsDesktopNotifications()) {
      return {
        label: "Notifications unavailable",
        detail: "Keep reminders visible in the dashboard.",
        tone: "text-amber-200",
        icon: BellOff,
      };
    }

    if (permission === "granted") {
      return {
        label: "Desktop notifications on",
        detail: "Focus nudges can leave the app when reminders come due.",
        tone: "text-emerald-200",
        icon: Bell,
      };
    }

    if (permission === "denied") {
      return {
        label: "Notifications blocked",
        detail: "Dashboard reminders stay available as the fallback.",
        tone: "text-amber-200",
        icon: BellOff,
      };
    }

    return {
      label: "Notifications not requested",
      detail: "Grant access to move reminders into system notifications.",
      tone: "text-cyan-200",
      icon: Bell,
    };
  }, [permission]);
  const NotificationIcon = notificationState.icon;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!supportsDesktopNotifications() || permission !== "granted") {
      return;
    }

    const timers: number[] = [];
    const schedule = (reminder: StudyReminder) => {
      if (!reminder.dueAt || notifiedIdsRef.current.has(reminder.id)) {
        return;
      }

      const dueAt = new Date(reminder.dueAt).getTime();
      if (Number.isNaN(dueAt)) {
        return;
      }

      const delay = Math.max(dueAt - Date.now(), 0);
      const timer = window.setTimeout(() => {
        if (notifiedIdsRef.current.has(reminder.id)) {
          return;
        }

        notifiedIdsRef.current.add(reminder.id);
        new window.Notification(reminder.title, {
          body: reminder.body,
          tag: reminder.id,
        });
      }, delay);
      timers.push(timer);
    };

    snapshot.reminders.forEach(schedule);

    if (snapshot.session?.endsAt) {
      const sessionEnd = new Date(snapshot.session.endsAt).getTime();
      if (!Number.isNaN(sessionEnd)) {
        const delay = Math.max(sessionEnd - Date.now(), 0);
        const timer = window.setTimeout(() => {
          const reminderId = `session-end-${snapshot.session?.id ?? "session"}`;
          if (notifiedIdsRef.current.has(reminderId)) {
            return;
          }

          notifiedIdsRef.current.add(reminderId);
          new window.Notification("Focus session complete", {
            body:
              snapshot.session?.title ??
              "Your focus block finished. Time to take a break or start the next sprint.",
            tag: reminderId,
          });
        }, delay);
        timers.push(timer);
      }
    }

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [permission, snapshot.reminders, snapshot.session]);

  const handleEnableNotifications = async () => {
    const nextPermission = await requestDesktopNotificationPermission();
    setPermission(nextPermission);
  };

  const sessionProgress = (() => {
    if (!snapshot.session?.startedAt || !snapshot.session?.endsAt) {
      return null;
    }

    const startedAt = new Date(snapshot.session.startedAt).getTime();
    const endsAt = new Date(snapshot.session.endsAt).getTime();
    if (Number.isNaN(startedAt) || Number.isNaN(endsAt) || endsAt <= startedAt) {
      return null;
    }

    const progress = ((now - startedAt) / (endsAt - startedAt)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  })();

  const upcomingReminders = snapshot.reminders.slice(0, 3);
  const boardSnippets = snapshot.boardSnippets.slice(0, 3);
  const activitySnippets = snapshot.activitySnippets.slice(0, 3);

  return (
    <section className="space-y-5">
      <div className="glass-panel rounded-[1.75rem] border border-white/8 p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
              <Sparkles size={12} />
              Study accountability
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Focus session, board updates, and reminders in one place.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                This surface listens for live session and school board data when
                available, while always keeping a dashboard fallback so you can
                stay on track even if notifications or backend feeds are missing.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-white/8 bg-black/20 p-4 md:min-w-[280px]">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/5 p-2 text-cyan-300">
                <NotificationIcon size={16} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${notificationState.tone}`}>
                  {notificationState.label}
                </p>
                <p className="text-xs text-slate-400">{notificationState.detail}</p>
              </div>
            </div>

            <button
              onClick={handleEnableNotifications}
              disabled={permission === "granted" || !supportsDesktopNotifications()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:border-cyan-400/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Bell size={16} />
              {permission === "granted" ? "Notifications enabled" : "Enable notifications"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass-card rounded-[1.5rem] border border-white/8 p-5 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-500/15 p-2 text-violet-300">
                <Target size={18} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Active focus session
                </h3>
                <p className="text-sm text-slate-400">
                  {snapshot.session ? "Live session feed" : "No session feed connected"}
                </p>
              </div>
            </div>
            <div className="rounded-full border border-white/8 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
              {snapshot.session?.status ?? "idle"}
            </div>
          </div>

          {snapshot.session ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Current block
                    </p>
                    <h4 className="mt-1 text-xl font-semibold text-white">
                      {snapshot.session.title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-300">
                      {snapshot.session.course ?? "Study block"} ·{" "}
                      {snapshot.session.focusTarget ?? "Keep the session moving"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">
                      Time left
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {formatCountdown(snapshot.session.endsAt, now)}
                    </p>
                  </div>
                </div>

                {typeof sessionProgress === "number" && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>{sessionProgress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 transition-all duration-300"
                        style={{ width: `${sessionProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-4">
                  <div className="flex items-center gap-2 text-cyan-100">
                    <TimerReset size={16} />
                    <span className="text-sm font-semibold">Break availability</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">
                    {snapshot.session.breakAvailableAt
                      ? `Break opens ${formatCountdown(snapshot.session.breakAvailableAt, now)}`
                      : "Break timing will appear when the backend shares the next break window."}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <CalendarClock size={16} className="text-violet-300" />
                    <span className="text-sm font-semibold">Next step</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">
                    {snapshot.session.nextStep ??
                      "Use this space for the next action when the session feed is connected."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/20 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white/5 p-2 text-slate-300">
                  <PauseCircle size={18} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white">
                    No active focus session connected
                  </h4>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    When the backend exposes a live session, this card will show
                    the current block, remaining time, and next break. Until
                    then, the fallback reminder surface below keeps the dashboard
                    useful.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card rounded-[1.5rem] border border-white/8 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-300">
              <Clock3 size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Reminder surface</h3>
              <p className="text-sm text-slate-400">
                Always visible, even when notifications are denied.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {upcomingReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`rounded-2xl border p-4 ${badgeStyles(reminder.priority)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-current" />
                      <p className="text-sm font-semibold text-white">{reminder.title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 opacity-90">{reminder.body}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-200">
                    {reminder.priority}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-100/80">
                  <Radio size={12} />
                  {formatCountdown(reminder.dueAt, now)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card rounded-[1.5rem] border border-white/8 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/15 p-2 text-cyan-300">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                School board snippets
              </h3>
              <p className="text-sm text-slate-400">
                Pulls in board updates when the backend provides them.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {boardSnippets.map((snippet) => (
              <article
                key={snippet.id}
                className="rounded-2xl border border-white/8 bg-black/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold text-white">{snippet.title}</h4>
                  <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-100">
                    {snippet.tag}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {snippet.summary}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Updated {formatRelativeTimestamp(snippet.updatedAt ?? snapshot.updatedAt)}
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-[1.5rem] border border-white/8 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/15 p-2 text-violet-300">
              <CircleAlert size={18} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Activity snippets</h3>
              <p className="text-sm text-slate-400">
                Recent study activity and board updates can surface here.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {activitySnippets.map((snippet) => (
              <article
                key={snippet.id}
                className="rounded-2xl border border-white/8 bg-black/20 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-violet-500/15 p-2 text-violet-200">
                    <Sparkles size={14} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-white">{snippet.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {snippet.detail}
                    </p>
                    <p className="mt-3 text-xs text-slate-500">
                      {formatRelativeTimestamp(snippet.timestamp)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {snapshot.source === "fallback" && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-50">
          Using fallback study data because no live session or board feed was
          supplied. The dashboard will automatically switch to live data when
          the backend exposes it.
        </div>
      )}
    </section>
  );
}
