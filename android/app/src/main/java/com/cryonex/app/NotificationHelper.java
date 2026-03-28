package com.cryonex.app;

import android.Manifest;
import android.app.Activity;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;

import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.Person;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.drawable.IconCompat;

/**
 * Native Android notification helper for message notifications.
 * Supports notification channels, heads-up alerts, and conversation bubbles.
 */
public class NotificationHelper {

    // Notification Channel IDs
    public static final String CHANNEL_MESSAGES = "cryonex_messages";
    public static final String CHANNEL_AI_RESPONSES = "cryonex_ai_responses";
    public static final String CHANNEL_SYSTEM = "cryonex_system";

    // Notification IDs
    private static int notificationIdCounter = 1000;
    private static final int NOTIFICATION_PERMISSION_REQUEST_CODE = 1001;

    private final Context context;
    private final NotificationManager notificationManager;

    public NotificationHelper(Context context) {
        this.context = context;
        this.notificationManager = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannels();
    }

    /**
     * Create notification channels for Android 8.0+
     */
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // AI Response Channel - High priority for heads-up
            NotificationChannel aiChannel = new NotificationChannel(
                CHANNEL_AI_RESPONSES,
                "AI Responses",
                NotificationManager.IMPORTANCE_HIGH
            );
            aiChannel.setDescription("Notifications when AI finishes generating a response");
            aiChannel.enableLights(true);
            aiChannel.setLightColor(Color.parseColor("#06b6d4")); // Cyan
            aiChannel.enableVibration(true);
            aiChannel.setVibrationPattern(new long[]{0, 100, 50, 100});
            aiChannel.setShowBadge(true);
            notificationManager.createNotificationChannel(aiChannel);

            // Messages Channel
            NotificationChannel messagesChannel = new NotificationChannel(
                CHANNEL_MESSAGES,
                "Messages",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            messagesChannel.setDescription("General message notifications");
            messagesChannel.enableLights(true);
            messagesChannel.setLightColor(Color.parseColor("#a855f7")); // Purple
            messagesChannel.setShowBadge(true);
            notificationManager.createNotificationChannel(messagesChannel);

            // System Channel - Low priority
            NotificationChannel systemChannel = new NotificationChannel(
                CHANNEL_SYSTEM,
                "System",
                NotificationManager.IMPORTANCE_LOW
            );
            systemChannel.setDescription("System notifications and updates");
            systemChannel.setShowBadge(false);
            notificationManager.createNotificationChannel(systemChannel);
        }
    }

    /**
     * Show AI response notification with heads-up display
     */
    public void showAIResponseNotification(String title, String message, String conversationId) {
        if (!ensureNotificationPermission()) {
            return;
        }

        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        intent.putExtra("conversationId", conversationId);

        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Create AI person for messaging style
        Person aiPerson = new Person.Builder()
            .setName("Cryonex AI")
            .setKey("cryonex_ai")
            .build();

        // Build messaging style notification
        NotificationCompat.MessagingStyle style = new NotificationCompat.MessagingStyle(aiPerson)
            .setConversationTitle(title)
            .addMessage(message, System.currentTimeMillis(), aiPerson);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_AI_RESPONSES)
            .setSmallIcon(android.R.drawable.ic_dialog_info) // TODO: Replace with cryonex icon
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(style)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setColor(Color.parseColor("#06b6d4")) // Cyan
            .setDefaults(NotificationCompat.DEFAULT_ALL);

        // Show heads-up notification
        notificationManager.notify(getNextNotificationId(), builder.build());
    }

    /**
     * Show a simple message notification
     */
    public void showMessageNotification(String title, String message) {
        if (!ensureNotificationPermission()) {
            return;
        }

        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_MESSAGES)
            .setSmallIcon(android.R.drawable.ic_dialog_email)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setColor(Color.parseColor("#a855f7")); // Purple

        notificationManager.notify(getNextNotificationId(), builder.build());
    }

    /**
     * Show system notification (low priority)
     */
    public void showSystemNotification(String title, String message) {
        if (!ensureNotificationPermission()) {
            return;
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_SYSTEM)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setAutoCancel(true);

        notificationManager.notify(getNextNotificationId(), builder.build());
    }

    /**
     * Cancel all notifications
     */
    public void cancelAll() {
        notificationManager.cancelAll();
    }

    /**
     * Cancel a specific notification
     */
    public void cancel(int notificationId) {
        notificationManager.cancel(notificationId);
    }

    private synchronized int getNextNotificationId() {
        return notificationIdCounter++;
    }

    private boolean ensureNotificationPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            return true;
        }

        if (ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS)
            == PackageManager.PERMISSION_GRANTED) {
            return true;
        }

        if (context instanceof Activity) {
            ActivityCompat.requestPermissions(
                (Activity) context,
                new String[] { Manifest.permission.POST_NOTIFICATIONS },
                NOTIFICATION_PERMISSION_REQUEST_CODE
            );
        }

        return false;
    }
}
