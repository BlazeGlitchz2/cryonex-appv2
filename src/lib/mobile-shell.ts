import i18n from "@/lib/i18n";
import type { DeviceType } from "@/hooks/use-mobile";

export interface MobileRouteChrome {
  eyebrow: string;
  title: string;
  subtitle: string;
  headerAction: "assistant" | "capture" | "none";
  showsHeader: boolean;
  showsBottomDock: boolean;
  showsQuickCapture: boolean;
}

export interface MobileKeyboardState {
  visible: boolean;
  height?: number;
}

export interface VirtualKeyboardVisibilityArgs {
  activeTagName?: string | null;
  innerHeight: number;
  viewportHeight: number;
  isContentEditable?: boolean;
}

export interface PhoneBottomInsetArgs {
  safeAreaBottom: number;
  dockVisible: boolean;
  keyboardVisible: boolean;
  keyboardHeight: number;
}

export interface TouchStudyShellArgs {
  deviceType: DeviceType;
  isSmartboard?: boolean;
  pathname: string;
}

export interface PhoneChromeSpacing {
  composerInset: number;
  dockOffset: number;
  floatingInset: number;
  pageInset: number;
}

const DEFAULT_ROUTE_CHROME: MobileRouteChrome = {
  eyebrow: i18n.t("mobileShell.default.eyebrow"),
  title: i18n.t("mobileShell.default.title"),
  subtitle: i18n.t("mobileShell.default.subtitle"),
  headerAction: "assistant",
  showsHeader: true,
  showsBottomDock: true,
  showsQuickCapture: true,
};

export function isAssistantRoute(pathname: string) {
  return (
    pathname === "/app" ||
    pathname.startsWith("/app/") ||
    pathname.startsWith("/app")
  );
}

export function isStudyShellRoute(pathname: string) {
  return (
    pathname.startsWith("/study/dashboard") ||
    pathname.startsWith("/study/workspace")
  );
}

export function shouldUseTouchStudyShell({
  deviceType,
  isSmartboard = false,
  pathname,
}: TouchStudyShellArgs) {
  if (!isStudyShellRoute(pathname)) {
    return false;
  }

  return deviceType === "phone" || (deviceType === "tablet" && !isSmartboard);
}

export function normalizeNativePath(pathname: string, search = "", hash = "") {
  if (pathname === "/app/dashboard" || pathname.startsWith("/app/dashboard/")) {
    return `/study/dashboard${search}${hash}`;
  }

  return `${pathname}${search}${hash}`;
}

export function buildNativePath(url: URL) {
  const combinedPath =
    url.protocol.includes("cryonex") && url.host
      ? `/${url.host}${url.pathname === "/" ? "" : url.pathname}`
      : url.pathname;

  return normalizeNativePath(
    combinedPath.replace(/\/{2,}/g, "/"),
    url.search,
    url.hash,
  );
}

export function getActiveMobileNavKey(pathname: string) {
  if (
    pathname.startsWith("/study/dashboard") ||
    pathname.startsWith("/study/packs") ||
    pathname.startsWith("/study/workspace")
  ) {
    return "home";
  }

  if (pathname.startsWith("/library")) {
    return "library";
  }

  if (pathname.startsWith("/settings")) {
    return "profile";
  }

  if (pathname.startsWith("/app")) {
    return "assistant";
  }

  return "home";
}

export function getMobileRouteChrome(pathname: string): MobileRouteChrome {
  if (pathname.startsWith("/study/workspace")) {
    return {
      eyebrow: i18n.t("mobileShell.studyWorkspace.eyebrow"),
      title: i18n.t("mobileShell.studyWorkspace.title"),
      subtitle: i18n.t("mobileShell.studyWorkspace.subtitle"),
      headerAction: "assistant",
      showsHeader: false,
      showsBottomDock: false,
      showsQuickCapture: false,
    };
  }

  if (pathname.startsWith("/study/dashboard")) {
    return {
      eyebrow: i18n.t("mobileShell.studyDashboard.eyebrow"),
      title: i18n.t("mobileShell.studyDashboard.title"),
      subtitle: i18n.t("mobileShell.studyDashboard.subtitle"),
      headerAction: "assistant",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: true,
    };
  }

  if (pathname.startsWith("/library")) {
    return {
      eyebrow: i18n.t("mobileShell.library.eyebrow"),
      title: i18n.t("mobileShell.library.title"),
      subtitle: i18n.t("mobileShell.library.subtitle"),
      headerAction: "capture",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: true,
    };
  }

  if (pathname.startsWith("/settings")) {
    return {
      eyebrow: i18n.t("mobileShell.settings.eyebrow"),
      title: i18n.t("mobileShell.settings.title"),
      subtitle: i18n.t("mobileShell.settings.subtitle"),
      headerAction: "none",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: false,
    };
  }

  if (pathname.startsWith("/projects")) {
    return {
      eyebrow: i18n.t("mobileShell.projects.eyebrow"),
      title: i18n.t("mobileShell.projects.title"),
      subtitle: i18n.t("mobileShell.projects.subtitle"),
      headerAction: "assistant",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: false,
    };
  }

  if (pathname.startsWith("/gpts")) {
    return {
      eyebrow: i18n.t("mobileShell.gpts.eyebrow"),
      title: i18n.t("mobileShell.gpts.title"),
      subtitle: i18n.t("mobileShell.gpts.subtitle"),
      headerAction: "assistant",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: false,
    };
  }

  if (pathname.startsWith("/media-studio") || pathname.startsWith("/create")) {
    return {
      eyebrow: i18n.t("mobileShell.studio.eyebrow"),
      title: i18n.t("mobileShell.studio.title"),
      subtitle: i18n.t("mobileShell.studio.subtitle"),
      headerAction: "assistant",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: false,
    };
  }

  return DEFAULT_ROUTE_CHROME;
}

export function getMobileShellConfig(pathname: string) {
  return getMobileRouteChrome(pathname);
}

export function usesImmersivePhoneChrome(pathname: string) {
  const chrome = getMobileRouteChrome(pathname);
  return !chrome.showsHeader && !chrome.showsBottomDock;
}

export function getPhoneBottomInset({
  safeAreaBottom,
  dockVisible,
  keyboardVisible,
  keyboardHeight,
}: PhoneBottomInsetArgs) {
  if (keyboardVisible && keyboardHeight > 0) {
    return keyboardHeight + safeAreaBottom;
  }

  return safeAreaBottom + (dockVisible ? 84 : 16);
}

export function getPhoneChromeSpacing(
  args: PhoneBottomInsetArgs,
): PhoneChromeSpacing {
  const dockOffset = getPhoneBottomInset({
    ...args,
    keyboardHeight: 0,
    keyboardVisible: false,
  });
  const composerInset = getPhoneBottomInset(args);

  return {
    composerInset,
    dockOffset,
    floatingInset: composerInset + (args.dockVisible ? 18 : 12),
    pageInset: composerInset + (args.dockVisible ? 72 : 56),
  };
}

export function getComposerScrollPadding({
  composerHeight,
  phoneBottomInset,
  extraClearance = 12,
}: {
  composerHeight: number;
  phoneBottomInset: number;
  extraClearance?: number;
}) {
  return composerHeight + phoneBottomInset + extraClearance;
}

export function isVirtualKeyboardLikelyVisible({
  activeTagName,
  innerHeight,
  isContentEditable = false,
  viewportHeight,
}: VirtualKeyboardVisibilityArgs) {
  const normalizedTagName = (activeTagName || "").toUpperCase();
  const isFocusableField =
    isContentEditable ||
    normalizedTagName === "INPUT" ||
    normalizedTagName === "TEXTAREA" ||
    normalizedTagName === "SELECT";

  if (!isFocusableField) {
    return false;
  }

  return innerHeight - viewportHeight > 120;
}

export function applyMobileKeyboardState(
  state: MobileKeyboardState,
  root: Pick<Document, "body" | "documentElement"> = document,
) {
  const visibility = state.visible ? "visible" : "hidden";
  const keyboardHeight = state.visible ? Math.max(0, state.height ?? 0) : 0;

  root.body.dataset.mobileKeyboard = visibility;
  root.documentElement.dataset.mobileKeyboard = visibility;
  root.documentElement.style.setProperty(
    "--native-keyboard-height",
    `${keyboardHeight}px`,
  );
}
