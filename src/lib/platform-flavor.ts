import type { DeviceInfo } from "@/hooks/use-mobile";

export type PlatformFamily = "web" | "android" | "ios";

export interface PlatformFlavor {
  family: PlatformFamily;
  label: string;
  shortLabel: string;
  shellTone: "editorial" | "board" | "liquid";
  landingEyebrow: string;
  landingSubtitle: string;
  appEyebrow: string;
  appDescription: string;
  reduceVisualWeight: boolean;
}

interface PlatformFlavorArgs {
  deviceInfo: Pick<
    DeviceInfo,
    "isAndroid" | "isIOS" | "isTablet" | "isSmartboard" | "isLowPowerDevice"
  >;
  isNative: boolean;
}

export type PlatformDescriptor = {
  label: string;
  badge: string;
  landingBody: string;
  landingCta: string;
  landingChips: string[];
  mobileHeadline: string;
  mobileBody: string;
  workspaceBadge: string;
  workspaceTitle: string;
  workspaceBody: string;
  quickPrompts: Array<{ label: string; prompt: string }>;
};

export function getPlatformFlavor({
  deviceInfo,
  isNative,
}: PlatformFlavorArgs): PlatformFlavor {
  if (deviceInfo.isIOS) {
    return {
      family: "ios",
      label: deviceInfo.isTablet ? "iPad Desk" : "iPhone Flow",
      shortLabel: "iOS",
      shellTone: "liquid",
      landingEyebrow: "Native Apple study desk",
      landingSubtitle: "Calm glass, lighter motion, stronger focus.",
      appEyebrow: deviceInfo.isTablet ? "iPad study desk" : "iPhone study flow",
      appDescription:
        "Keep the workspace airy, tactile, and readable without losing the Cryonex identity.",
      reduceVisualWeight: deviceInfo.isLowPowerDevice,
    };
  }

  if (deviceInfo.isAndroid || (isNative && !deviceInfo.isIOS)) {
    const isSharedScreen = deviceInfo.isSmartboard || deviceInfo.isTablet;
    return {
      family: "android",
      label: isSharedScreen ? "Android Board" : "Android Flow",
      shortLabel: "Android",
      shellTone: "board",
      landingEyebrow: isSharedScreen
        ? "Large-format Android classroom shell"
        : "Android study shell",
      landingSubtitle: "High contrast, faster paint, larger targets.",
      appEyebrow: isSharedScreen ? "Board mode" : "Android flow",
      appDescription:
        "Favor legibility, flatter layers, and lower GPU cost for long sessions on shared displays and tablets.",
      reduceVisualWeight: true,
    };
  }

  return {
    family: "web",
    label: "Web Workspace",
    shortLabel: "Web",
    shellTone: "editorial",
    landingEyebrow: "Editorial web workspace",
    landingSubtitle: "Richer atmosphere, sharper storytelling, same product core.",
    appEyebrow: "Web workspace",
    appDescription:
      "Use the web surface for the most cinematic framing while keeping the workspace structured and fast.",
    reduceVisualWeight: false,
  };
}

export function resolvePlatformFlavor(
  deviceInfo: PlatformFlavorArgs["deviceInfo"],
  isNative = deviceInfo.isAndroid || deviceInfo.isIOS,
): PlatformFamily {
  return getPlatformFlavor({ deviceInfo, isNative }).family;
}

export function getPlatformDescriptor(
  platformFlavor: PlatformFamily,
  deviceInfo: PlatformFlavorArgs["deviceInfo"],
): PlatformDescriptor {
  const flavor = getPlatformFlavor({
    deviceInfo,
    isNative: platformFlavor !== "web",
  });

  return {
    label: flavor.label,
    badge: flavor.appEyebrow,
    landingBody:
      platformFlavor === "android"
        ? "On Android, Cryonex leans into clearer tap targets, flatter layers, and steadier performance for tablets, boards, and shared study hardware."
        : platformFlavor === "ios"
          ? "On iOS, Cryonex keeps the same workflow but shifts toward calmer spacing, lighter chrome, and a more fluid reading rhythm."
          : "On the web, Cryonex can hold more context at once and feel more like a full study command surface without losing focus.",
    landingCta:
      platformFlavor === "android"
        ? "Open Android workspace"
        : platformFlavor === "ios"
          ? "Open iOS workspace"
          : "Open web workspace",
    landingChips:
      platformFlavor === "android"
        ? [
            "Large touch targets",
            "Lower GPU overhead",
            "Classroom-safe contrast",
          ]
        : platformFlavor === "ios"
          ? [
              "Calmer reading flow",
              "Lighter glass chrome",
              "Native-feeling rhythm",
            ]
          : [
              "Wide study rails",
              "Full workspace context",
              "Desktop command surface",
            ],
    mobileHeadline: flavor.landingSubtitle,
    mobileBody: flavor.appDescription,
    workspaceBadge: flavor.appEyebrow,
    workspaceTitle:
      platformFlavor === "android"
        ? "Study faster on every touch surface"
        : platformFlavor === "ios"
          ? "A calmer study flow for every session"
          : "Your full Cryonex workspace, ready to think",
    workspaceBody: flavor.appDescription,
    quickPrompts: [
      ...(platformFlavor === "android"
        ? [
            {
              label: "Scan and simplify",
              prompt:
                "Scan this source, simplify the key ideas, and tell me what to study first.",
            },
            {
              label: "Quiz weakest topic",
              prompt:
                "Build a short quiz from this material and prioritize the areas I am weakest in.",
            },
            {
              label: "Board recap",
              prompt:
                "Turn this material into a teacher-friendly recap I can review on a large screen.",
            },
            {
              label: "Plan 30 minutes",
              prompt:
                "Plan a clear 30-minute study block from this material with one concrete outcome.",
            },
          ]
        : platformFlavor === "ios"
          ? [
              {
                label: "Clarify this concept",
                prompt:
                  "Explain this concept simply, then ask me three questions to check if I really understand it.",
              },
              {
                label: "Build clean notes",
                prompt:
                  "Rewrite this source into concise study notes with headings and memorable takeaways.",
              },
              {
                label: "Make recall cards",
                prompt:
                  "Turn this material into clean flashcards with brief answers and no filler.",
              },
              {
                label: "Prepare review",
                prompt:
                  "Prepare a focused review session from this material with a calm sequence of steps.",
              },
            ]
          : [
              {
                label: "Map the whole topic",
                prompt:
                  "Map this topic into its key ideas, dependencies, and the best order to learn it.",
              },
              {
                label: "Build revision system",
                prompt:
                  "Turn this material into a revision system with summaries, flashcards, quizzes, and next steps.",
              },
              {
                label: "Compare source gaps",
                prompt:
                  "Compare these notes for gaps, contradictions, and what I should verify next.",
              },
              {
                label: "Create dashboard",
                prompt:
                  "Create a focused dashboard view of this material with the top priorities and actions.",
              },
            ]),
    ],
  };
}
