package com.cryonex.app;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.AccessibilityServiceInfo;
import android.content.Intent;
import android.view.accessibility.AccessibilityEvent;

public class FocusShieldAccessibilityService extends AccessibilityService {
    private long lastLaunchAt = 0L;
    private String lastBlockedPackage = "";

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();

        AccessibilityServiceInfo info = new AccessibilityServiceInfo();
        info.eventTypes =
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
                | AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED;
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC;
        info.flags =
            AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
                | AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS;
        info.notificationTimeout = 100;
        setServiceInfo(info);
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        if (event == null || event.getPackageName() == null) {
            return;
        }

        String packageName = String.valueOf(event.getPackageName());
        if (getPackageName().equals(packageName)) {
            return;
        }

        if (!FocusShieldStore.shouldBlockPackage(this, packageName)) {
            return;
        }

        long now = System.currentTimeMillis();
        if (packageName.equals(lastBlockedPackage) && now - lastLaunchAt < 1500L) {
            return;
        }

        lastBlockedPackage = packageName;
        lastLaunchAt = now;

        Intent intent = new Intent(this, FocusShieldBlockActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        intent.putExtra("blockedPackage", packageName);
        startActivity(intent);
    }

    @Override
    public void onInterrupt() {
        // No-op. The service only guards focus sessions.
    }
}
