import { describe, expect, it } from "vitest";

import {
  DEFAULT_ALLOWED_APPS,
  DEFAULT_DISTRACTING_APPS,
  deriveFocusSessionState,
  getFocusSessionProgress,
  normalizeFocusSessionDuration,
  shouldWarnAboutDistraction,
  type FocusSessionRecord,
} from "./focus-session";

function buildSession(overrides: Partial<FocusSessionRecord> = {}): FocusSessionRecord {
  return {
    breakCount: 0,
    breakDurationMs: 10 * 60 * 1000,
    breakUsed: false,
    distractionAttemptCount: 0,
    distractingApps: DEFAULT_DISTRACTING_APPS,
    endedAt: undefined,
    id: "session-1",
    importantApps: DEFAULT_ALLOWED_APPS,
    plannedDurationMs: 45 * 60 * 1000,
    quitEarly: false,
    startedAt: 10_000,
    status: "active",
    ...overrides,
  };
}

describe("focus-session helpers", () => {
  it("normalizes unsupported durations into a calm default", () => {
    expect(normalizeFocusSessionDuration(undefined)).toBe(45);
    expect(normalizeFocusSessionDuration(7)).toBe(15);
    expect(normalizeFocusSessionDuration(320)).toBe(180);
  });

  it("tracks active progress before the session finishes", () => {
    const session = buildSession();

    expect(getFocusSessionProgress(session, 25 * 60 * 1000 + session.startedAt)).toBeCloseTo(
      25 / 45,
      2,
    );
  });

  it("marks a session as completed when planned time elapses", () => {
    const session = buildSession();

    expect(deriveFocusSessionState(session, session.startedAt + 46 * 60 * 1000)).toMatchObject({
      canForceBreak: true,
      phase: "completed",
      shouldLockDistractions: false,
    });
  });

  it("allows only one force break and caps it at ten minutes", () => {
    const session = buildSession({
      breakCount: 1,
      breakEndsAt: 20_000,
      breakUsed: true,
      status: "on_break",
    });

    expect(deriveFocusSessionState(session, 15_000)).toMatchObject({
      canForceBreak: false,
      phase: "on_break",
      remainingBreakMs: 5_000,
    });
  });

  it("surfaces quit-early sessions as public accountability states", () => {
    const session = buildSession({
      endedAt: 30_000,
      quitEarly: true,
      status: "quit_early",
    });

    expect(deriveFocusSessionState(session, 30_000)).toMatchObject({
      canForceBreak: false,
      phase: "quit_early",
      shouldLockDistractions: false,
    });
  });

  it("warns when the learner leaves during an active block", () => {
    const session = buildSession();

    expect(shouldWarnAboutDistraction(session, "hidden")).toBe(true);
    expect(shouldWarnAboutDistraction(buildSession({ status: "on_break" }), "hidden")).toBe(false);
  });
});
