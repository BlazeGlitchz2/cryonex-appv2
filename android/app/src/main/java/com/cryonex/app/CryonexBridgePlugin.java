package com.cryonex.app;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONException;
import java.util.ArrayList;
import java.util.List;

/**
 * Custom Capacitor plugin providing native Android features
 * for a more native-like messaging experience.
 */
@CapacitorPlugin(name = "CryonexBridge")
public class CryonexBridgePlugin extends Plugin {

    // ========================================
    // HAPTIC FEEDBACK
    // ========================================

    @PluginMethod
    public void hapticLight(PluginCall call) {
        vibrate(new long[]{0, 10}, new int[]{0, 50});
        call.resolve();
    }

    @PluginMethod
    public void hapticMedium(PluginCall call) {
        vibrate(new long[]{0, 20}, new int[]{0, 100});
        call.resolve();
    }

    @PluginMethod
    public void hapticHeavy(PluginCall call) {
        vibrate(new long[]{0, 30}, new int[]{0, 200});
        call.resolve();
    }

    @PluginMethod
    public void hapticSuccess(PluginCall call) {
        // Double pulse for success
        vibrate(new long[]{0, 15, 50, 15}, new int[]{0, 150, 0, 150});
        call.resolve();
    }

    @PluginMethod
    public void hapticWarning(PluginCall call) {
        // Triple short pulse for warning
        vibrate(new long[]{0, 10, 30, 10, 30, 10}, new int[]{0, 100, 0, 100, 0, 100});
        call.resolve();
    }

    @PluginMethod
    public void hapticError(PluginCall call) {
        // Long buzz for error
        vibrate(new long[]{0, 100}, new int[]{0, 255});
        call.resolve();
    }

    @PluginMethod
    public void hapticSelection(PluginCall call) {
        // Very light tap for selection
        vibrate(new long[]{0, 5}, new int[]{0, 30});
        call.resolve();
    }

    private void vibrate(long[] timings, int[] amplitudes) {
        Context context = getContext();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vibratorManager = (VibratorManager) context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            Vibrator vibrator = vibratorManager.getDefaultVibrator();
            vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1));
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1));
        } else {
            Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            vibrator.vibrate(timings, -1);
        }
    }

    // ========================================
    // CLIPBOARD
    // ========================================

    @PluginMethod
    public void copyToClipboard(PluginCall call) {
        String text = call.getString("text", "");
        String label = call.getString("label", "Cryonex");

        ClipboardManager clipboard = (ClipboardManager) getContext().getSystemService(Context.CLIPBOARD_SERVICE);
        ClipData clip = ClipData.newPlainText(label, text);
        clipboard.setPrimaryClip(clip);

        // Haptic feedback for copy
        hapticLight(call);

        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }

    // ========================================
    // NATIVE SHARE
    // ========================================

    @PluginMethod
    public void shareText(PluginCall call) {
        String text = call.getString("text", "");
        String title = call.getString("title", "Share from Cryonex");

        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, text);

        Intent chooser = Intent.createChooser(shareIntent, title);
        getActivity().startActivity(chooser);

        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }

    @PluginMethod
    public void shareMessage(PluginCall call) {
        String message = call.getString("message", "");
        String context = call.getString("context", "");
        
        String shareText = message;
        if (!context.isEmpty()) {
            shareText = context + "\n\n" + message;
        }
        shareText += "\n\n— Shared from Cryonex AI";

        Intent shareIntent = new Intent(Intent.ACTION_SEND);
        shareIntent.setType("text/plain");
        shareIntent.putExtra(Intent.EXTRA_TEXT, shareText);
        shareIntent.putExtra(Intent.EXTRA_SUBJECT, "AI Response from Cryonex");

        Intent chooser = Intent.createChooser(shareIntent, "Share AI Response");
        getActivity().startActivity(chooser);

        // Haptic feedback
        hapticLight(call);

        JSObject result = new JSObject();
        result.put("success", true);
        call.resolve(result);
    }

    // ========================================
    // KEYBOARD MANAGEMENT
    // ========================================

    @PluginMethod
    public void hideKeyboard(PluginCall call) {
        android.view.inputmethod.InputMethodManager imm = 
            (android.view.inputmethod.InputMethodManager) getContext().getSystemService(Context.INPUT_METHOD_SERVICE);
        
        if (getActivity().getCurrentFocus() != null) {
            imm.hideSoftInputFromWindow(getActivity().getCurrentFocus().getWindowToken(), 0);
        }
        
        call.resolve();
    }

    // ========================================
    // DEVICE INFO
    // ========================================

    @PluginMethod
    public void getDeviceInfo(PluginCall call) {
        JSObject result = new JSObject();
        result.put("manufacturer", Build.MANUFACTURER);
        result.put("model", Build.MODEL);
        result.put("sdkVersion", Build.VERSION.SDK_INT);
        result.put("isLowRamDevice", isLowRamDevice());
        result.put("supportsHaptics", supportsHaptics());
        call.resolve(result);
    }

    private boolean isLowRamDevice() {
        android.app.ActivityManager am = (android.app.ActivityManager) getContext().getSystemService(Context.ACTIVITY_SERVICE);
        return am.isLowRamDevice();
    }

    private boolean supportsHaptics() {
        Vibrator vibrator;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            VibratorManager vibratorManager = (VibratorManager) getContext().getSystemService(Context.VIBRATOR_MANAGER_SERVICE);
            vibrator = vibratorManager.getDefaultVibrator();
        } else {
            vibrator = (Vibrator) getContext().getSystemService(Context.VIBRATOR_SERVICE);
        }
        return vibrator != null && vibrator.hasVibrator();
    }

    // ========================================
    // PERFORMANCE MODE
    // ========================================

    @PluginMethod
    public void enablePerformanceMode(PluginCall call) {
        boolean enable = call.getBoolean("enable", true);
        
        // Set WebView layer type based on performance mode
        getBridge().getWebView().post(() -> {
            if (enable) {
                getBridge().getWebView().setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null);
            } else {
                getBridge().getWebView().setLayerType(android.view.View.LAYER_TYPE_SOFTWARE, null);
            }
        });

        JSObject result = new JSObject();
        result.put("performanceMode", enable);
        call.resolve(result);
    }

    // ========================================
    // FOCUS SHIELD
    // ========================================

    @PluginMethod
    public void configureFocusShield(PluginCall call) {
        String sessionId = call.getString("sessionId", "");
        String sessionLabel = call.getString("sessionLabel", "Study session");
        long expiresAt = call.getLong("expiresAt", 0L);
        List<String> blockedPackages = getStringList(call.getArray("blockedPackages"));
        List<String> allowedPackages = getStringList(call.getArray("allowedPackages"));
        boolean serviceEnabled = FocusShieldStore.isAccessibilityServiceEnabled(getContext());

        FocusShieldStore.save(
            getContext(),
            sessionId,
            sessionLabel,
            expiresAt,
            0L,
            blockedPackages,
            allowedPackages
        );

        NotificationHelper helper = new NotificationHelper(getContext(), getActivity());
        helper.showFocusShieldNotification(
            "Focus block active",
            sessionLabel + " is protecting distracting apps until the session ends."
        );

        JSObject result = new JSObject();
        result.put("enabled", true);
        result.put("serviceEnabled", serviceEnabled);
        call.resolve(result);
    }

    @PluginMethod
    public void pauseFocusShield(PluginCall call) {
        String sessionId = call.getString("sessionId", "");
        long pausedUntil = call.getLong("pausedUntil", 0L);

        FocusShieldStore.pause(getContext(), sessionId, pausedUntil);

        JSObject result = new JSObject();
        result.put("enabled", true);
        result.put("serviceEnabled", FocusShieldStore.isAccessibilityServiceEnabled(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void resumeFocusShield(PluginCall call) {
        String sessionId = call.getString("sessionId", "");

        FocusShieldStore.resume(getContext(), sessionId);

        JSObject result = new JSObject();
        result.put("enabled", true);
        result.put("serviceEnabled", FocusShieldStore.isAccessibilityServiceEnabled(getContext()));
        call.resolve(result);
    }

    @PluginMethod
    public void clearFocusShield(PluginCall call) {
        FocusShieldStore.clear(getContext());
        NotificationHelper helper = new NotificationHelper(getContext(), getActivity());
        helper.cancelFocusShieldNotification();

        JSObject result = new JSObject();
        result.put("enabled", false);
        call.resolve(result);
    }

    @PluginMethod
    public void getFocusShieldStatus(PluginCall call) {
        FocusShieldStore.State state = FocusShieldStore.read(getContext());

        JSObject result = new JSObject();
        result.put("enabled", state.enabled);
        result.put("serviceEnabled", FocusShieldStore.isAccessibilityServiceEnabled(getContext()));
        result.put("sessionId", state.sessionId);
        result.put("sessionLabel", state.sessionLabel);
        result.put("expiresAt", state.expiresAt);
        result.put("pausedUntil", state.pausedUntil);
        result.put("blockedPackages", new ArrayList<>(state.blockedPackages));
        result.put("allowedPackages", new ArrayList<>(state.allowedPackages));
        call.resolve(result);
    }

    @PluginMethod
    public void openFocusShieldSettings(PluginCall call) {
        Intent intent = new Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);

        JSObject result = new JSObject();
        result.put("opened", true);
        call.resolve(result);
    }

    private List<String> getStringList(JSArray array) {
        List<String> values = new ArrayList<>();
        if (array == null) {
            return values;
        }

        try {
            for (int i = 0; i < array.length(); i++) {
                String value = array.getString(i);
                if (value != null && !value.trim().isEmpty()) {
                    values.add(value.trim());
                }
            }
        } catch (JSONException ignored) {
            return values;
        }

        return values;
    }
}
