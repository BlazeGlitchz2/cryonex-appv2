import { describe, expect, it } from "vitest";

import {
  applyMobileKeyboardState,
  getComposerScrollPadding,
  getPhoneChromeSpacing,
  getMobileRouteChrome,
  getPhoneBottomInset,
  isStudyShellRoute,
  isAssistantRoute,
  isVirtualKeyboardLikelyVisible,
  shouldUseTouchStudyShell,
  usesImmersivePhoneChrome,
} from "./mobile-shell";

describe("mobile shell helpers", () => {
  it("maps dashboard routes to home-focused chrome", () => {
    expect(getMobileRouteChrome("/study/dashboard")).toMatchObject({
      eyebrow: "Study",
      subtitle: "Today in Cryonex",
      title: "Dashboard",
    });
  });

  it("maps library routes to capture-friendly chrome", () => {
    expect(getMobileRouteChrome("/library")).toMatchObject({
      headerAction: "capture",
      eyebrow: "Library",
      title: "Materials",
    });
  });

  it("treats workspace routes as immersive phone surfaces", () => {
    expect(usesImmersivePhoneChrome("/study/workspace/doc-123")).toBe(true);
    expect(usesImmersivePhoneChrome("/study/dashboard")).toBe(false);
  });

  it("detects assistant-owned routes", () => {
    expect(isAssistantRoute("/app")).toBe(true);
    expect(isAssistantRoute("/app/chat/abc")).toBe(true);

    expect(isAssistantRoute("/library")).toBe(false);
  });

  it("marks only study dashboard and workspace as tablet shell routes", () => {
    expect(isStudyShellRoute("/study/dashboard")).toBe(true);
    expect(isStudyShellRoute("/study/workspace/doc-123")).toBe(true);

    expect(isStudyShellRoute("/study/packs/pack-123")).toBe(false);
    expect(isStudyShellRoute("/library")).toBe(false);
  });

  it("routes phones into the touch study shell but keeps tablets, desktop, and smartboards out", () => {
    expect(
      shouldUseTouchStudyShell({
        deviceType: "phone",
        pathname: "/study/dashboard",
      }),
    ).toBe(true);

    expect(
      shouldUseTouchStudyShell({
        deviceType: "tablet",
        pathname: "/study/workspace/doc-123",
      }),
    ).toBe(false);

    expect(
      shouldUseTouchStudyShell({
        deviceType: "desktop",
        pathname: "/study/dashboard",
      }),
    ).toBe(false);

    expect(
      shouldUseTouchStudyShell({
        deviceType: "tablet",
        isSmartboard: true,
        pathname: "/study/dashboard",
      }),
    ).toBe(false);

    expect(
      shouldUseTouchStudyShell({
        deviceType: "tablet",
        pathname: "/library",
      }),
    ).toBe(false);
  });

  it("only reports the virtual keyboard when an input is focused and the viewport shrinks", () => {
    expect(
      isVirtualKeyboardLikelyVisible({
        activeTagName: "TEXTAREA",
        innerHeight: 844,
        viewportHeight: 640,
      }),
    ).toBe(true);

    expect(
      isVirtualKeyboardLikelyVisible({
        activeTagName: "DIV",
        innerHeight: 844,
        isContentEditable: false,
        viewportHeight: 640,
      }),
    ).toBe(false);

    expect(
      isVirtualKeyboardLikelyVisible({
        activeTagName: "INPUT",
        innerHeight: 844,
        viewportHeight: 780,
      }),
    ).toBe(false);
  });

  it("syncs keyboard visibility onto document datasets and CSS vars", () => {
    applyMobileKeyboardState({ visible: true, height: 318 });

    expect(document.body.dataset.mobileKeyboard).toBe("visible");
    expect(document.documentElement.dataset.mobileKeyboard).toBe("visible");
    expect(
      document.documentElement.style.getPropertyValue(
        "--native-keyboard-height",
      ),
    ).toBe("318px");

    applyMobileKeyboardState({ visible: false });

    expect(document.body.dataset.mobileKeyboard).toBe("hidden");
    expect(
      document.documentElement.style.getPropertyValue(
        "--native-keyboard-height",
      ),
    ).toBe("0px");
  });

  it("derives phone bottom insets from dock and keyboard state", () => {
    expect(
      getPhoneBottomInset({
        dockVisible: true,
        keyboardHeight: 0,
        keyboardVisible: false,
        safeAreaBottom: 12,
      }),
    ).toBe(96);

    expect(
      getPhoneBottomInset({
        dockVisible: false,
        keyboardHeight: 0,
        keyboardVisible: false,
        safeAreaBottom: 12,
      }),
    ).toBe(28);

    expect(
      getPhoneBottomInset({
        dockVisible: true,
        keyboardHeight: 318,
        keyboardVisible: true,
        safeAreaBottom: 12,
      }),
    ).toBe(330);
  });

  it("builds message list padding from composer height and phone inset", () => {
    expect(
      getComposerScrollPadding({
        composerHeight: 72,
        phoneBottomInset: 96,
        extraClearance: 12,
      }),
    ).toBe(180);
  });
  it("derives cohesive phone shell spacing from dock visibility", () => {
    expect(
      getPhoneChromeSpacing({
        dockVisible: true,
        keyboardHeight: 0,
        keyboardVisible: false,
        safeAreaBottom: 12,
      }),
    ).toEqual({
      composerInset: 96,
      dockOffset: 96,
      floatingInset: 114,
      pageInset: 168,
    });

    expect(
      getPhoneChromeSpacing({
        dockVisible: false,
        keyboardHeight: 0,
        keyboardVisible: false,
        safeAreaBottom: 12,
      }),
    ).toEqual({
      composerInset: 28,
      dockOffset: 28,
      floatingInset: 40,
      pageInset: 84,
    });
  });

});
