import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useDeviceInfo, useDeviceType } from "@/hooks/use-mobile";

const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;
const originalUserAgent = navigator.userAgent;
const originalMaxTouchPoints = navigator.maxTouchPoints;

function setViewport(width: number, height = 844) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    value: height,
  });
}

function setNavigatorState(userAgent: string, maxTouchPoints: number) {
  Object.defineProperty(window.navigator, "userAgent", {
    configurable: true,
    value: userAgent,
  });
  Object.defineProperty(window.navigator, "maxTouchPoints", {
    configurable: true,
    value: maxTouchPoints,
  });
}

describe("use-mobile", () => {
  afterEach(() => {
    setViewport(originalInnerWidth, originalInnerHeight);
    setNavigatorState(originalUserAgent, originalMaxTouchPoints);
  });

  it("classifies an iPhone-sized viewport as a phone", () => {
    setViewport(390, 844);
    setNavigatorState(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      5,
    );

    const { result } = renderHook(() => useDeviceType());

    expect(result.current).toBe("phone");
  });

  it("does not misclassify a narrow touch macintosh viewport as iPadOS", () => {
    setViewport(390, 844);
    setNavigatorState("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5);

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.isTablet).toBe(false);
    expect(result.current.deviceType).toBe("phone");
  });

  it("classifies a touch iPad viewport as a tablet", () => {
    setViewport(1024, 1366);
    setNavigatorState("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5);

    const { result } = renderHook(() => useDeviceInfo());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.deviceType).toBe("tablet");
  });

  it("updates the shell from desktop to phone when the viewport shrinks", () => {
    setViewport(1280, 800);
    setNavigatorState("Mozilla/5.0 (X11; Linux x86_64)", 0);

    const { result } = renderHook(() => useDeviceType());
    expect(result.current).toBe("desktop");

    act(() => {
      setViewport(430, 932);
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe("phone");
  });
});
