# Deployment Instructions

## Windows
1. Ensure you have "C++ build tools" and "WebView2" installed.
2. Run:
   ```bash
   pnpm tauri build
   ```
3. The installer will be located at:
   `src-tauri/target/release/bundle/msi/desktop-app_0.1.0_x64_en-US.msi`
   or
   `src-tauri/target/release/bundle/nsis/desktop-app_0.1.0_x64-setup.exe`

## macOS
1. Ensure you have Xcode Command Line Tools installed.
2. Run:
   ```bash
   pnpm tauri build
   ```
3. The `.dmg` or `.app` will be in `src-tauri/target/release/bundle/dmg/`.

## Linux
1. Ensure you have system dependencies installed (`libwebkit2gtk-4.0-dev`, `build-essential`, `curl`, `wget`, `file`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`).
2. Run:
   ```bash
   pnpm tauri build
   ```
3. The `.deb` or `.AppImage` will be in `src-tauri/target/release/bundle/`.

## CI/CD
You can use GitHub Actions to build automatically. See `.github/workflows/release.yml` (if created) or Tauri documentation for CI setup.
