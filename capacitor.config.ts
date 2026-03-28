import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cryonex.app",
  appName: "Cryonex",
  webDir: "dist",

  // Server configuration for better performance
  server: {
    // Allow mixed content for API calls
    androidScheme: "https",
    iosScheme: "capacitor",
    // Disabled cleartext traffic for production security
    cleartext: false,
  },

  // Android-specific configuration
  android: {
    // Keep the student app on HTTPS-only subresources.
    allowMixedContent: false,
    // Disable WebView caching issues & debug mode for production security
    webContentsDebuggingEnabled: false,
    // Match app background to prevent white flashes during load
    backgroundColor: "#030010",
  },

  // iOS-specific configuration — optimized for native feel
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
    // Force mobile content mode for consistent layout
    preferredContentMode: "mobile",
    // Disable 3D Touch link previews — reduces memory & prevents accidental triggers
    allowsLinkPreview: false,
    // Match app background to prevent white flashes during load
    backgroundColor: "#030010",
    // Restrict navigations for security & performance
    // ⚠️ PRODUCTION: Consider setting to true and whitelisting allowed domains
    limitsNavigationsToAppBoundDomains: false,
  },

  // Plugins configuration
  plugins: {
    // Splash screen — slightly longer on iOS for smoother perceived cold start
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#030010",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashImmersive: true,
      splashFullScreen: true,
    },
    // Keyboard — use body resize for proper layout without webview shrinking
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    // Status bar configuration
    StatusBar: {
      style: "dark",
      backgroundColor: "#030010",
      overlay: true,
    },
  },
};

export default config;
