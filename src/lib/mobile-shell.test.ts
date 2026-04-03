import { describe, expect, it } from "vitest";

import {
  applyMobileKeyboardState,
  getMobileRouteChrome,
  isAssistantRoute,
  isVirtualKeyboardLikelyVisible,
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
      document.documentElement.style.getPropertyValue("--native-keyboard-height"),
    ).toBe("318px");

    applyMobileKeyboardState({ visible: false });

    expect(document.body.dataset.mobileKeyboard).toBe("hidden");
    expect(
      document.documentElement.style.getPropertyValue("--native-keyboard-height"),
    ).toBe("0px");
  });
});
