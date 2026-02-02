# 📱 Cryonex Mobile App Deployment Guide

This guide explains how to build and deploy Cryonex as a native Android and iOS app using Capacitor.

## ✅ Setup Complete

The following has been configured:

- ✅ Capacitor Core packages installed
- ✅ Android platform added (`/android` folder)
- ✅ iOS platform added (`/ios` folder)
- ✅ Mobile initialization utility created (`src/lib/mobile.ts`)
- ✅ Native plugins installed (StatusBar, Keyboard, Haptics, SplashScreen, App, Network)
- ✅ Viewport and safe area support configured
- ✅ NPM scripts added for easy building

---

## 🚀 Quick Commands

```bash
# Build and sync to both platforms
npm run mobile:sync

# Build and open Android Studio
npm run mobile:android

# Build and open Xcode (Mac only)
npm run mobile:ios

# Build and run directly on connected Android device
npm run mobile:run:android

# Build and run directly on connected iOS device (Mac only)
npm run mobile:run:ios
```

---

## 📦 Android Deployment

### Prerequisites

1. **Install Android Studio**: [Download here](https://developer.android.com/studio)
2. **Install Java JDK 17+**: Android Studio should prompt you to install this
3. **Set up Android SDK**: Android Studio will guide you through this on first run

### Building the APK

1. Run the build command:
   ```bash
   npm run mobile:android
   ```

2. This will open Android Studio with your project

3. In Android Studio:
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - Or for Play Store: **Build > Generate Signed Bundle / APK**

4. The APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Testing on Device

1. Enable **Developer Options** on your Android phone
2. Enable **USB Debugging**
3. Connect your phone via USB
4. Run:
   ```bash
   npm run mobile:run:android
   ```

### Publishing to Google Play Store

1. Generate a signing key:
   ```bash
   keytool -genkey -v -keystore cryonex-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias cryonex
   ```

2. In Android Studio, go to **Build > Generate Signed Bundle / APK**

3. Select **Android App Bundle** (recommended for Play Store)

4. Upload to [Google Play Console](https://play.google.com/console)

---

## 🍎 iOS Deployment

### Prerequisites (Mac Only)

1. **Xcode**: Install from Mac App Store
2. **Apple Developer Account**: $99/year for App Store publishing
3. **CocoaPods**: 
   ```bash
   sudo gem install cocoapods
   ```

### Building for iOS

1. Run the build command:
   ```bash
   npm run mobile:ios
   ```

2. This will open Xcode with your project

3. In Xcode:
   - Select your development team under **Signing & Capabilities**
   - Select a real device or simulator
   - Click **Run** (▶️)

### Testing on Device

1. Connect your iPhone via USB
2. Trust the computer on your iPhone
3. In Xcode, select your iPhone from the device list
4. Click **Run**

### Publishing to App Store

1. In Xcode, go to **Product > Archive**
2. Use the **Organizer** to upload to App Store Connect
3. Complete the submission in [App Store Connect](https://appstoreconnect.apple.com)

---

## 🎨 Customization

### App Icon

Replace the icons in these locations:

**Android:**
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Use [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)

**iOS:**
- `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
- Use Xcode's Asset Catalog or a tool like [App Icon Generator](https://appicon.co/)

### Splash Screen

1. Place your splash image at:
   - **Android**: `android/app/src/main/res/drawable/splash.png`
   - **iOS**: `ios/App/App/Assets.xcassets/Splash.imageset/`

2. Configure in `capacitor.config.ts`:
   ```typescript
   plugins: {
     SplashScreen: {
       launchShowDuration: 2000,
       backgroundColor: '#0a0a0a',
       // ... other options
     }
   }
   ```

### App Name & ID

Edit `capacitor.config.ts`:
```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.cryonex',  // Change this
  appName: 'Cryonex',                 // Change this
  // ...
};
```

Then run `npx cap sync` to apply changes.

---

## 🔧 Troubleshooting

### "Android SDK not found"
- Open Android Studio > SDK Manager
- Install the required SDK version
- Set `ANDROID_HOME` environment variable

### "Xcode signing error"
- Go to Xcode > Preferences > Accounts
- Add your Apple ID
- Select your team in the project settings

### "Build failed - JDK version"
- Ensure you have JDK 17+ installed
- Set `JAVA_HOME` environment variable

### Changes not showing in app
- Always run `npm run mobile:sync` after making web changes
- For hot reload during development, use [Capacitor Live Reload](https://capacitorjs.com/docs/guides/live-reload)

---

## 🔄 Development Workflow

1. **Make changes** to your React code
2. **Build the web app**: `npm run build`
3. **Sync to native**: `npx cap sync`
4. **Run on device/emulator**: `npx cap run android` or `npx cap run ios`

Or use the all-in-one commands:
- `npm run mobile:run:android`
- `npm run mobile:run:ios`

---

## 📚 Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [iOS Developer Guide](https://developer.apple.com/documentation/)
- [Play Store Publishing Guide](https://support.google.com/googleplay/android-developer/answer/9859152)
- [App Store Publishing Guide](https://developer.apple.com/app-store/submitting/)
