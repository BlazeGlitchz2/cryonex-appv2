export const ANDROID_FOCUS_BLOCKED_PACKAGES = [
  "com.instagram.android",
  "com.zhiliaoapp.musically",
  "com.snapchat.android",
  "com.facebook.katana",
  "com.twitter.android",
  "com.reddit.frontpage",
  "com.discord",
  "com.instagram.threadsapp",
  "com.google.android.youtube",
];

export const ANDROID_FOCUS_ALLOWED_PACKAGES = [
  "com.google.android.dialer",
  "com.android.dialer",
  "com.samsung.android.dialer",
  "com.google.android.apps.messaging",
  "com.android.mms",
  "com.android.messaging",
  "com.samsung.android.messaging",
  "com.facebook.orca",
  "com.whatsapp",
];

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function pickOrFallback(primary: string[], fallback: string[]) {
  const values = unique([...primary, ...fallback]);
  return values.length > 0 ? values : fallback;
}

export function buildAndroidFocusShieldPayload({
  now = Date.now(),
  durationMinutes,
  sessionId,
  sessionLabel,
  blockedPackages = ANDROID_FOCUS_BLOCKED_PACKAGES,
  allowedPackages = ANDROID_FOCUS_ALLOWED_PACKAGES,
}: {
  now?: number;
  durationMinutes: number;
  sessionId: string;
  sessionLabel: string;
  blockedPackages?: string[];
  allowedPackages?: string[];
}) {
  const normalizedDurationMinutes = Math.min(180, Math.max(15, Math.round(durationMinutes)));

  return {
    allowedPackages: pickOrFallback(allowedPackages, ANDROID_FOCUS_ALLOWED_PACKAGES),
    blockedPackages: pickOrFallback(blockedPackages, ANDROID_FOCUS_BLOCKED_PACKAGES),
    expiresAt: now + normalizedDurationMinutes * 60 * 1000,
    sessionId,
    sessionLabel,
  };
}
