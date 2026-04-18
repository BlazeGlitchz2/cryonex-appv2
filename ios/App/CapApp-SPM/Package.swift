// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.0.0"),
        .package(name: "CapacitorCommunityAdmob", path: "../../../../cryonex-appv2-main/node_modules/@capacitor-community/admob"),
        .package(name: "CapacitorApp", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/app"),
        .package(name: "CapacitorCamera", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/camera"),
        .package(name: "CapacitorDevice", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/device"),
        .package(name: "CapacitorDialog", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/dialog"),
        .package(name: "CapacitorFilesystem", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/filesystem"),
        .package(name: "CapacitorHaptics", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/haptics"),
        .package(name: "CapacitorKeyboard", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/keyboard"),
        .package(name: "CapacitorNetwork", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/network"),
        .package(name: "CapacitorSplashScreen", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/splash-screen"),
        .package(name: "CapacitorStatusBar", path: "../../../../cryonex-appv2-main/node_modules/@capacitor/status-bar"),
        .package(name: "CapgoCapacitorLlm", path: "../../../../cryonex-appv2-main/node_modules/@capgo/capacitor-llm"),
        .package(name: "CapgoCapacitorUpdater", path: "../../../../cryonex-appv2-main/node_modules/@capgo/capacitor-updater")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorCommunityAdmob", package: "CapacitorCommunityAdmob"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorCamera", package: "CapacitorCamera"),
                .product(name: "CapacitorDevice", package: "CapacitorDevice"),
                .product(name: "CapacitorDialog", package: "CapacitorDialog"),
                .product(name: "CapacitorFilesystem", package: "CapacitorFilesystem"),
                .product(name: "CapacitorHaptics", package: "CapacitorHaptics"),
                .product(name: "CapacitorKeyboard", package: "CapacitorKeyboard"),
                .product(name: "CapacitorNetwork", package: "CapacitorNetwork"),
                .product(name: "CapacitorSplashScreen", package: "CapacitorSplashScreen"),
                .product(name: "CapacitorStatusBar", package: "CapacitorStatusBar"),
                .product(name: "CapgoCapacitorLlm", package: "CapgoCapacitorLlm"),
                .product(name: "CapgoCapacitorUpdater", package: "CapgoCapacitorUpdater")
            ]
        )
    ]
)
