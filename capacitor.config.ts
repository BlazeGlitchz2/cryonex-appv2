import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cryonex.app",
  appName: "Cryonex",
  webDir: "dist",

  // Server configuration for better performance
  server: {
    // Allow mixed content for API calls
    androidScheme: "https",
    // Enable cleartext traffic for development
    cleartext: true,
  },

  // Android-specific configuration
  android: {
    // Allow mixed content
    allowMixedContent: true,
    // Capture all external links in the app
    captureExternalLinks: true,
    // Disable WebView caching issues
    webContentsDebuggingEnabled: true,
  },

  // iOS-specific configuration
  ios: {
    // Allow mixed content
    contentInset: "automatic",
    // Scrolling behavior
    scrollEnabled: true,
  },

  // Plugins configuration
  plugins: {
    // Splash screen configuration
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0a0a0a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    // Keyboard configuration for better input handling
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
    },
    // Status bar configuration
    StatusBar: {
      style: "dark",
      backgroundColor: "#0a0a0a",
    },
  },
};

export default config;
