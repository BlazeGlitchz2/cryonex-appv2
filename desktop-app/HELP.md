# Troubleshooting Build Errors

## Error: `link.exe` failed (exit code: 1)

This error occurs because the **C++ Build Tools** are missing or not correctly configured on your Windows machine. Rust requires these tools to link the application.

### How to Fix:

1.  **Open Visual Studio Installer**:

    - Search for "Visual Studio Installer" in your Windows Start menu.
    - If you don't have it, download "Build Tools for Visual Studio 2022" from [visualstudio.microsoft.com/downloads](https://visualstudio.microsoft.com/downloads/).

2.  **Modify Installation**:

    - Click **Modify** on your installed version (e.g., Visual Studio Community 2022 or Build Tools 2022).

3.  **Select Workload**:

    - Go to the **Workloads** tab.
    - Check **"Desktop development with C++"**.
    - Ensure the following are selected in the right-hand pane (Installation details):
      - MSVC v143 - VS 2022 C++ x64/x86 build tools (Latest)
      - Windows 11 SDK (or Windows 10 SDK)

4.  **Install**:

    - Click **Modify** or **Install** to apply changes.
    - **Restart your computer** after installation.

5.  **Clean & Rebuild**:
    - Open your terminal in `desktop-app`.
    - Run:
      ```bash
      cargo clean
      pnpm tauri dev
      ```

## Alternative: Run Frontend Only

If you cannot install the build tools right now, you can still work on the UI (without system features) by running:

```bash
pnpm dev
```

This runs the app in the browser.
