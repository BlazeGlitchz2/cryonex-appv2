import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.cryonex.app",
  appName: "Cryonex",
  webDir: "dist",

  // Server configuration for optimal performance
  server: {
    // Use HTTPS scheme for security
    androidScheme: "https",
    // Allow cleartext for development (disable in production)
    cleartext: true,
    // Enable error handling
    errorPath: "/error",
  },

  // Android-specific configuration for native-like experience
  android: {
    // Allow mixed content for API calls
    allowMixedContent: true,
    // Enable WebView debugging (disable in production)
    webContentsDebuggingEnabled: true,
    // Use dark background for loading
    backgroundColor: "#0a0a0a",
    // Append user agent for analytics
    appendUserAgent: "CryonexApp/1.0",
    // Use WebView file access
    useLegacyBridge: false,
  },

  // iOS-specific configuration
  ios: {
    // Allow mixed content
    contentInset: "automatic",
    // Scrolling behavior
    scrollEnabled: true,
    // Dark mode support
    backgroundColor: "#0a0a0a",
    // Prefer system colors
    preferredContentMode: "mobile",
  },

  // Plugins configuration
  plugins: {
    // Splash screen configuration
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: "#0a0a0a",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    // Keyboard configuration for better input handling
    Keyboard: {
      resize: "body",
      resizeOnFullScreen: true,
      // Hide accessory bar for cleaner look
      style: "dark",
    },
    // Status bar configuration
    StatusBar: {
      style: "dark",
      backgroundColor: "#0a0a0a",
      // Overlay WebView for edge-to-edge
      overlaysWebView: false,
    },
    // Haptics configuration
    Haptics: {
      // Use impact style for haptics
      selectionChangeHapticEffect: "light",
    },
    // Network configuration
    Network: {
      // Monitor network changes
      requiresWifi: false,
    },
    // App configuration
    App: {
      // Handle app state changes
      allowUrlOpen: true,
    },
  },

  // Logging (disable in production)
  loggingBehavior: "debug",
};

export default config;
