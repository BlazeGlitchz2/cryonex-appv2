package com.cryonex.app;

import android.os.Build;
import android.os.Bundle;
import android.view.Window;

import androidx.core.view.WindowCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Edge-to-edge: content renders behind system bars
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        Window window = getWindow();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Transparent navigation bar for gesture navigation
            window.setNavigationBarColor(android.graphics.Color.TRANSPARENT);
            // Enforce contrast for 3-button navigation (scrim auto-applied)
            window.setNavigationBarContrastEnforced(true);
        }
    }
}
