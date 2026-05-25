import { useMemo } from "react";

import { useDeviceInfo, type DeviceInfo } from "@/hooks/use-mobile";
import { getRuntimePlatform, isNativePlatform } from "@/lib/platform-runtime";

export type PlatformFamily = "web" | "android" | "ios";
export type PlatformShell = "desktop" | "tablet" | "phone" | "smartboard";

export interface PlatformExperience {
  platform: PlatformFamily;
  shell: PlatformShell;
  isNative: boolean;
  isLowPowerLargeScreen: boolean;
  shouldReduceWarmup: boolean;
  shellBadge: string;
  landingEyebrow: string;
  landingTitle: string;
  landingDescription: string;
  landingPrimaryLabel: string;
  landingSecondaryLabel: string;
}

function resolvePlatform(deviceInfo: DeviceInfo): PlatformFamily {
  if (deviceInfo.isAndroid) return "android";
  if (deviceInfo.isIOS) return "ios";

  const platform = getRuntimePlatform();
  if (platform === "android" || platform === "ios") {
    return platform;
  }

  return "web";
}

function resolveShell(deviceInfo: DeviceInfo): PlatformShell {
  if (deviceInfo.isSmartboard) return "smartboard";
  if (deviceInfo.isTablet) return "tablet";
  if (deviceInfo.isPhone) return "phone";
  return "desktop";
}

export function getPlatformExperience(
  deviceInfo: DeviceInfo,
): PlatformExperience {
  const platform = resolvePlatform(deviceInfo);
  const shell = resolveShell(deviceInfo);
  const isNative = isNativePlatform();
  const isLowPowerLargeScreen =
    shell === "smartboard" || (platform === "android" && shell === "tablet");
  const shouldReduceWarmup =
    deviceInfo.isLowPowerDevice || isLowPowerLargeScreen;

  if (platform === "android") {
    return {
      platform,
      shell,
      isNative,
      isLowPowerLargeScreen,
      shouldReduceWarmup,
      shellBadge:
        shell === "smartboard" ? "Android board mode" : "Android focus shell",
      landingEyebrow:
        shell === "smartboard"
          ? "Large-format Android study mode"
          : "Android study deck",
      landingTitle:
        shell === "smartboard"
          ? "Readable study flows for shared Android screens."
          : "An Android study workspace built for calm focus and faster touch response.",
      landingDescription:
        shell === "smartboard"
          ? "Start free, bring in lectures and PDFs, and keep the interface bold, low-latency, and legible on tablets, kiosks, and smart boards."
          : "Start free, upload your own study material, and move through summaries, flashcards, and quizzes in one Android-native rhythm.",
      landingPrimaryLabel:
        shell === "smartboard"
          ? "Open board-ready workspace"
          : "Open Android workspace",
      landingSecondaryLabel: "See pricing",
    };
  }

  if (platform === "ios") {
    return {
      platform,
      shell,
      isNative,
      isLowPowerLargeScreen,
      shouldReduceWarmup,
      shellBadge: shell === "tablet" ? "iPad study canvas" : "iOS fluid shell",
      landingEyebrow:
        shell === "tablet" ? "iPad study canvas" : "iOS study canvas",
      landingTitle:
        shell === "tablet"
          ? "A study canvas tuned for iPad pacing, clearer focus, and real coursework."
          : "A fluid iOS study workspace for notes, PDFs, recordings, and recall loops.",
      landingDescription:
        "Start free, bring your own class material, and keep study sessions inside a cleaner Apple-first workflow instead of a generic chat screen.",
      landingPrimaryLabel:
        shell === "tablet" ? "Open iPad workspace" : "Open iPhone workspace",
      landingSecondaryLabel: "See pricing",
    };
  }

  return {
    platform,
    shell,
    isNative,
    isLowPowerLargeScreen,
    shouldReduceWarmup,
    shellBadge:
      shell === "smartboard"
        ? "Large-screen web mode"
        : shell === "tablet"
          ? "Tablet web canvas"
          : "Web command deck",
    landingEyebrow:
      shell === "smartboard"
        ? "Large-screen web study mode"
        : shell === "tablet"
          ? "Tablet web study canvas"
          : "Editorial study OS",
    landingTitle:
      shell === "smartboard"
        ? "Source-grounded study flows for shared screens."
        : shell === "tablet"
          ? "Source-grounded study tools for tablet review."
          : "Source-grounded study tools for your own material.",
    landingDescription:
      shell === "smartboard"
        ? "Start free, bring in lectures and PDFs, then review with flashcards, quizzes, and readable group-study flows."
        : shell === "tablet"
          ? "Start free on the web, bring your own material, and move through flashcards, quizzes, and summaries without visual clutter."
          : "Start free, upload lectures, PDFs, notes, and links, then move into flashcards, quizzes, and guided review before you upgrade.",
    landingPrimaryLabel:
      shell === "smartboard"
        ? "Launch large-screen workspace"
        : "Launch workspace",
    landingSecondaryLabel: "Jump to pricing",
  };
}

export function usePlatformExperience(): PlatformExperience {
  const deviceInfo = useDeviceInfo();

  return useMemo(
    () => getPlatformExperience(deviceInfo),
    [
      deviceInfo.deviceType,
      deviceInfo.isAndroid,
      deviceInfo.isIOS,
      deviceInfo.isLowPowerDevice,
      deviceInfo.isPhone,
      deviceInfo.isSmartboard,
      deviceInfo.isTablet,
    ],
  );
}
