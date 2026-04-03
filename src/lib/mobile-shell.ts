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

const DEFAULT_ROUTE_CHROME: MobileRouteChrome = {
  eyebrow: "Cryonex",
  title: "Cryonex",
  subtitle: "Private study AI",
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
      eyebrow: "Focus",
      title: "Workspace",
      subtitle: "Review, revise, and submit",
      headerAction: "assistant",
      showsHeader: false,
      showsBottomDock: false,
      showsQuickCapture: false,
    };
  }

  if (pathname.startsWith("/study/dashboard")) {
    return {
      eyebrow: "Study",
      title: "Dashboard",
      subtitle: "Today in Cryonex",
      headerAction: "assistant",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: true,
    };
  }

  if (pathname.startsWith("/library")) {
    return {
      eyebrow: "Library",
      title: "Materials",
      subtitle: "Sources, notes, and packs",
      headerAction: "capture",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: true,
    };
  }

  if (pathname.startsWith("/settings")) {
    return {
      eyebrow: "Profile",
      title: "Settings",
      subtitle: "Account and app preferences",
      headerAction: "none",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: false,
    };
  }

  if (pathname.startsWith("/projects")) {
    return {
      eyebrow: "Build",
      title: "Projects",
      subtitle: "Keep coursework moving",
      headerAction: "assistant",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: false,
    };
  }

  if (pathname.startsWith("/gpts")) {
    return {
      eyebrow: "Assist",
      title: "Assistants",
      subtitle: "Custom study copilots and tools",
      headerAction: "assistant",
      showsHeader: true,
      showsBottomDock: true,
      showsQuickCapture: false,
    };
  }

  if (pathname.startsWith("/media-studio")) {
    return {
      eyebrow: "Create",
      title: "Studio",
      subtitle: "Create visuals, audio, and assets",
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
