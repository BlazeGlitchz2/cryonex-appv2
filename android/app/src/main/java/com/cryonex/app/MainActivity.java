package com.cryonex.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register custom plugins BEFORE super.onCreate()
        registerPlugin(CryonexBridgePlugin.class);

        super.onCreate(savedInstanceState);

        // Enable hardware acceleration
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        // Edge-to-edge display for immersive experience
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
        }

        // Configure WebView for optimal performance
        configureWebView();
    }

    private void configureWebView() {
        // Access the WebView from Capacitor's bridge
        WebView webView = getBridge().getWebView();
        if (webView == null) return;

        WebSettings settings = webView.getSettings();

        // --- Performance Optimizations ---
        
        // Enable hardware acceleration for WebView layer
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        
        // Enable DOM storage for offline data
        settings.setDomStorageEnabled(true);
        
        // Enable database storage
        settings.setDatabaseEnabled(true);
        
        // Enable app cache for faster loads
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Set high render priority (deprecated but still works)
        settings.setRenderPriority(WebSettings.RenderPriority.HIGH);
        
        // Enable smooth scrolling
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setVerticalScrollBarEnabled(false);
        webView.setHorizontalScrollBarEnabled(false);
        
        // Enable mixed content for HTTPS + HTTP resources
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Enable JavaScript (required for React)
        settings.setJavaScriptEnabled(true);
        
        // Enable zooming but hide controls for native feel
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        
        // Use wide viewport for responsive design
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        
        // Enable accelerated 2D canvas for smooth animations
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            webView.setRendererPriorityPolicy(WebView.RENDERER_PRIORITY_IMPORTANT, false);
        }
        
        // Allow file access for local resources
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // Reduce memory pressure on low-end devices
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // Enable geolocation
        settings.setGeolocationEnabled(true);
        
        // Text encoding
        settings.setDefaultTextEncodingName("UTF-8");
        
        // --- Native-like Scrolling ---
        webView.setNestedScrollingEnabled(true);
        
        // Disable bounce overscroll for native feel
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
    }

    @Override
    public void onResume() {
        super.onResume();
        // Resume WebView when app comes to foreground
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    public void onPause() {
        super.onPause();
        // Pause WebView when app goes to background to save battery
        WebView webView = getBridge().getWebView();
        if (webView != null) {
            webView.onPause();
        }
    }
}
