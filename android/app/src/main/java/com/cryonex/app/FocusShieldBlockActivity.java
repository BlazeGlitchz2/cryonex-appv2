package com.cryonex.app;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

public class FocusShieldBlockActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        }

        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                | WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        getWindow().setStatusBarColor(Color.parseColor("#030010"));
        getWindow().setNavigationBarColor(Color.parseColor("#030010"));

        String blockedPackage = getIntent().getStringExtra("blockedPackage");
        String blockedLabel = resolveAppLabel(blockedPackage);

        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#030010"));
        root.setPadding(48, 80, 48, 48);

        TextView eyebrow = new TextView(this);
        eyebrow.setText("Cryonex Focus Shield");
        eyebrow.setTextColor(Color.parseColor("#67e8f9"));
        eyebrow.setTextSize(12f);

        TextView title = new TextView(this);
        title.setText("Continue studying");
        title.setTextColor(Color.WHITE);
        title.setTextSize(30f);
        title.setPadding(0, 20, 0, 18);

        TextView body = new TextView(this);
        body.setText(
            blockedLabel + " is blocked during this study session.\nReturn to Cryonex and keep your focus block alive."
        );
        body.setTextColor(Color.parseColor("#cbd5e1"));
        body.setTextSize(17f);
        body.setLineSpacing(0f, 1.35f);

        TextView packageLabel = new TextView(this);
        packageLabel.setText("Blocked app: " + blockedLabel);
        packageLabel.setTextColor(Color.parseColor("#a5f3fc"));
        packageLabel.setTextSize(14f);
        packageLabel.setPadding(0, 28, 0, 0);

        Button openCryonex = new Button(this);
        openCryonex.setText("Open Cryonex");
        openCryonex.setAllCaps(false);
        openCryonex.setBackgroundColor(Color.parseColor("#06b6d4"));
        openCryonex.setTextColor(Color.BLACK);
        openCryonex.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            intent.putExtra("openFocusControls", true);
            startActivity(intent);
            finish();
        });

        Button dismiss = new Button(this);
        dismiss.setText("Keep studying here");
        dismiss.setAllCaps(false);
        dismiss.setTextColor(Color.WHITE);
        dismiss.setBackgroundColor(Color.parseColor("#1f2937"));
        dismiss.setOnClickListener(v -> finish());

        LinearLayout buttonRow = new LinearLayout(this);
        buttonRow.setOrientation(LinearLayout.VERTICAL);
        buttonRow.setPadding(0, 40, 0, 0);
        buttonRow.addView(openCryonex);
        buttonRow.addView(dismiss);

        ScrollView scrollView = new ScrollView(this);
        scrollView.addView(root);
        root.addView(eyebrow);
        root.addView(title);
        root.addView(body);
        root.addView(packageLabel);
        root.addView(buttonRow);

        setContentView(scrollView);
    }

    private String resolveAppLabel(String packageName) {
        if (packageName == null || packageName.isEmpty()) {
            return "This app";
        }

        try {
            PackageManager packageManager = getPackageManager();
            return String.valueOf(packageManager.getApplicationLabel(
                packageManager.getApplicationInfo(packageName, 0)
            ));
        } catch (Exception ignored) {
            return packageName;
        }
    }
}
