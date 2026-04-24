package com.cryonex.app;

import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.accessibility.AccessibilityManager;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Arrays;

public final class FocusShieldStore {
    private static final String PREFS_NAME = "cryonex_focus_shield";
    private static final String KEY_ENABLED = "enabled";
    private static final String KEY_SESSION_ID = "session_id";
    private static final String KEY_SESSION_LABEL = "session_label";
    private static final String KEY_EXPIRES_AT = "expires_at";
    private static final String KEY_PAUSED_UNTIL = "paused_until";
    private static final String KEY_BLOCKED_PACKAGES = "blocked_packages";
    private static final String KEY_ALLOWED_PACKAGES = "allowed_packages";

    public static final class State {
        public final boolean enabled;
        @Nullable public final String sessionId;
        @Nullable public final String sessionLabel;
        public final long expiresAt;
        public final long pausedUntil;
        public final List<String> blockedPackages;
        public final List<String> allowedPackages;

        State(boolean enabled, @Nullable String sessionId, @Nullable String sessionLabel,
              long expiresAt, long pausedUntil, List<String> blockedPackages, List<String> allowedPackages) {
            this.enabled = enabled;
            this.sessionId = sessionId;
            this.sessionLabel = sessionLabel;
            this.expiresAt = expiresAt;
            this.pausedUntil = pausedUntil;
            this.blockedPackages = blockedPackages;
            this.allowedPackages = allowedPackages;
        }
    }

    private FocusShieldStore() {}

    public static void save(
        Context context,
        String sessionId,
        String sessionLabel,
        long expiresAt,
        long pausedUntil,
        List<String> blockedPackages,
        List<String> allowedPackages
    ) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putBoolean(KEY_ENABLED, true)
            .putString(KEY_SESSION_ID, sessionId)
            .putString(KEY_SESSION_LABEL, sessionLabel)
            .putLong(KEY_EXPIRES_AT, expiresAt)
            .putLong(KEY_PAUSED_UNTIL, pausedUntil)
            .putStringSet(KEY_BLOCKED_PACKAGES, new HashSet<>(blockedPackages))
            .putStringSet(KEY_ALLOWED_PACKAGES, new HashSet<>(allowedPackages))
            .apply();
    }

    public static void pause(Context context, String sessionId, long pausedUntil) {
        State state = read(context);
        if (state.sessionId != null && !state.sessionId.equals(sessionId)) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putLong(KEY_PAUSED_UNTIL, pausedUntil).putBoolean(KEY_ENABLED, true).apply();
    }

    public static void resume(Context context, String sessionId) {
        State state = read(context);
        if (state.sessionId != null && !state.sessionId.equals(sessionId)) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putLong(KEY_PAUSED_UNTIL, 0L).putBoolean(KEY_ENABLED, true).apply();
    }

    public static void clear(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().clear().apply();
    }

    public static State read(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return new State(
            prefs.getBoolean(KEY_ENABLED, false),
            prefs.getString(KEY_SESSION_ID, null),
            prefs.getString(KEY_SESSION_LABEL, null),
            prefs.getLong(KEY_EXPIRES_AT, 0L),
            prefs.getLong(KEY_PAUSED_UNTIL, 0L),
            new ArrayList<>(prefs.getStringSet(KEY_BLOCKED_PACKAGES, new HashSet<>())),
            new ArrayList<>(prefs.getStringSet(KEY_ALLOWED_PACKAGES, new HashSet<>()))
        );
    }

    public static boolean isBlockingActive(Context context) {
        State state = read(context);
        long now = System.currentTimeMillis();
        if (!state.enabled) return false;
        if (state.expiresAt > 0L && now >= state.expiresAt) return false;
        if (state.pausedUntil > 0L && now < state.pausedUntil) return false;
        return true;
    }

    public static boolean shouldBlockPackage(Context context, String packageName) {
        if (!isBlockingActive(context) || TextUtils.isEmpty(packageName)) {
            return false;
        }

        State state = read(context);
        if (state.allowedPackages.contains(packageName)) {
            return false;
        }

        return state.blockedPackages.contains(packageName);
    }

    public static boolean isAccessibilityServiceEnabled(Context context) {
        String expected = new ComponentName(context, FocusShieldAccessibilityService.class).flattenToString();
        String enabledServices = Settings.Secure.getString(
            context.getContentResolver(),
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        );

        if (enabledServices == null || enabledServices.isEmpty()) {
            return false;
        }

        return Arrays.asList(enabledServices.split(":")).contains(expected);
    }
}
