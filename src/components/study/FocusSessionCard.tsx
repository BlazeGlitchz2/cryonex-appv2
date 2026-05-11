import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlarmClockCheck,
  Ban,
  Coffee,
  Hourglass,
  ShieldAlert,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function formatClock(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const DURATION_OPTIONS = [25, 45, 60, 90];

export function FocusSessionCard({
  allowedApps,
  blockedApps,
  androidBlockingReady = true,
  onEnableAndroidBlocking,
  compact = false,
  distractionCount,
  elapsedSeconds,
  hasActiveFocusSession,
  onComplete,
  onEndEarly,
  onResume,
  onSetDuration,
  onStart,
  onStartBreak,
  remainingBreakSeconds,
  remainingSeconds,
  selectedDuration,
  sessionPhase,
  canForceBreak,
}: {
  allowedApps: string[];
  blockedApps: string[];
  androidBlockingReady?: boolean;
  onEnableAndroidBlocking?: () => void;
  compact?: boolean;
  distractionCount: number;
  elapsedSeconds: number;
  hasActiveFocusSession: boolean;
  onComplete: () => void;
  onEndEarly: () => void;
  onResume: () => void;
  onSetDuration: (minutes: number) => void;
  onStart: () => void;
  onStartBreak: () => void;
  remainingBreakSeconds: number;
  remainingSeconds: number;
  selectedDuration: number;
  sessionPhase: "active" | "on_break" | "completed" | "quit_early" | "idle";
  canForceBreak: boolean;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isBreak = sessionPhase === "on_break";
  const isComplete = sessionPhase === "completed";
  const isQuitEarly = sessionPhase === "quit_early";

  // Auto-collapse when session starts
  useEffect(() => {
    if (hasActiveFocusSession) {
      setIsCollapsed(true);
    } else {
      setIsCollapsed(false);
    }
  }, [hasActiveFocusSession]);

  const toneClass = compact
    ? "rounded-[24px] p-4"
    : "rounded-[28px] p-5 md:p-6";

  return (
    <section
      className={cn(
        "border border-border bg-card/60 shadow-sm backdrop-blur-xl transition-all duration-300",
        toneClass,
        isCollapsed && hasActiveFocusSession && "sticky top-0 z-30 bg-card/90 backdrop-blur-2xl shadow-lg border-b-0 rounded-b-none",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-foreground/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5" />
            Focus shield
          </div>
          {hasActiveFocusSession && (
             <Badge variant="secondary" className="rounded-full bg-blue-500/10 text-blue-400 border-blue-500/20 px-2 py-0 text-[10px]">
               {sessionPhase === "on_break" ? "On break" : sessionPhase.replace("_", " ")}
             </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 rounded-full p-0 text-muted-foreground hover:bg-foreground/5"
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence initial={false} mode="wait">
        {isCollapsed ? (
          <motion.div
            key="collapsed"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">
                    {isBreak ? "Break Left" : "Time Left"}
                  </span>
                  <span className="text-xl font-bold tracking-tight text-foreground">
                    {formatClock(isBreak ? remainingBreakSeconds : remainingSeconds)}
                  </span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/60">
                    Distractions
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {distractionCount}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isBreak ? (
                  <Button
                    size="sm"
                    onClick={onResume}
                    className="h-8 rounded-full bg-primary text-[11px] font-bold text-primary-foreground hover:bg-primary/90"
                  >
                    Resume
                  </Button>
                ) : canForceBreak ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onStartBreak}
                    className="h-8 rounded-full text-[11px] font-bold"
                  >
                    <Coffee className="mr-1.5 h-3.5 w-3.5" />
                    Break
                  </Button>
                ) : null}

                {!isBreak && !isQuitEarly && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={onComplete}
                    className="h-8 rounded-full text-[11px] font-bold"
                  >
                    Complete
                  </Button>
                )}

                {!isQuitEarly && !isComplete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={onEndEarly}
                    className="h-8 rounded-full text-[11px] font-bold"
                  >
                    End
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-foreground">
                  {hasActiveFocusSession
                    ? isBreak
                      ? "Force break is running"
                      : isComplete
                        ? "Focus block complete"
                        : isQuitEarly
                          ? "Session ended early"
                          : "Protected study session"
                    : "Start a protected study session"}
                </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground/80">
        {hasActiveFocusSession
          ? "Cryonex keeps distracting apps on the blocked list and lets only one force break through."
          : "Choose how long you want to study, then Cryonex will guard the block and keep school accountability visible."}
      </p>
    </div>

              <div className="rounded-[20px] border border-border bg-foreground/[0.03] px-4 py-3 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/55">
                  {isBreak ? "Break left" : "Time left"}
                </p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                  {formatClock(isBreak ? remainingBreakSeconds : remainingSeconds)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  {hasActiveFocusSession
                    ? `${Math.max(0, Math.floor(elapsedSeconds / 60))} min already studied`
                    : `${selectedDuration} minute target`}
                </p>
      </div>
      </div>

      {!androidBlockingReady && onEnableAndroidBlocking ? (
        <div className="mt-5 rounded-[22px] border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          Android accessibility is not enabled yet. Turn it on once so Cryonex
          can enforce app blocking at the OS level.
          <Button
            type="button"
            variant="outline"
            onClick={onEnableAndroidBlocking}
            className="mt-3 rounded-full border-amber-300 bg-white text-amber-900 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-300/10 dark:text-amber-50 dark:hover:bg-amber-300/20"
          >
            Open Android blocking settings
          </Button>
        </div>
      ) : null}

      {!hasActiveFocusSession ? (
        <>
                <div className="mt-5 flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((duration) => (
                    <Button
                      key={duration}
                      type="button"
                      variant="ghost"
                      onClick={() => onSetDuration(duration)}
                      className={cn(
                        "rounded-full border px-4 text-sm",
                        selectedDuration === duration
                          ? "border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90"
                          : "border-border bg-foreground/[0.04] text-muted-foreground hover:bg-foreground/[0.08]",
                      )}
                    >
                      {duration} min
                    </Button>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[22px] border border-border bg-foreground/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Ban className="h-4 w-4 text-rose-400" />
                      Distracting apps
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground/80">
                      {blockedApps.join(", ")}
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-border bg-foreground/[0.03] p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Smartphone className="h-4 w-4 text-emerald-400" />
                      Important apps still allowed
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground/80">
                      {allowedApps.join(", ")}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={onStart}
                  className="mt-5 w-full rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <AlarmClockCheck className="mr-2 h-4 w-4" />
                  Start {selectedDuration}-minute focus block
                </Button>
              </>
            ) : (
              <>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full bg-foreground/[0.06] text-foreground">
                    <Hourglass className="mr-1 h-3 w-3" />
                    {sessionPhase === "on_break" ? "On break" : sessionPhase.replace("_", " ")}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full bg-foreground/[0.06] text-foreground">
                    <ShieldAlert className="mr-1 h-3 w-3" />
                    {distractionCount} distraction attempts
                  </Badge>
                  <Badge variant="secondary" className="rounded-full bg-foreground/[0.06] text-foreground">
                    <Coffee className="mr-1 h-3 w-3" />
                    {canForceBreak ? "Force break available" : "Force break already used"}
                  </Badge>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[22px] border border-border bg-foreground/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
                      Blocked for this session
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground/80">
                      {blockedApps.join(", ")}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-border bg-foreground/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/60">
                      Still allowed
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground/80">
                      {allowedApps.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {isBreak ? (
                    <Button
                      type="button"
                      onClick={onResume}
                      className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Resume studying now
                    </Button>
                  ) : canForceBreak ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onStartBreak}
                      className="rounded-full"
                    >
                      <Coffee className="mr-2 h-4 w-4" />
                      Use force break
                    </Button>
                  ) : null}

                  {!isBreak && !isQuitEarly ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={onComplete}
                      className="rounded-full"
                    >
                      Mark session complete
                    </Button>
                  ) : null}

                  {!isQuitEarly && !isComplete ? (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={onEndEarly}
                      className="rounded-full"
                    >
                      End session early
                    </Button>
                  ) : null}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
