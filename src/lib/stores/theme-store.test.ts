import { afterEach, describe, expect, it, vi } from "vitest";

const STORAGE_KEY = "cryonex-theme-storage";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalNavigator = globalThis.navigator;

async function importThemeStore() {
  vi.resetModules();
  return import("./theme-store");
}

describe("theme-store", () => {
  afterEach(() => {
    vi.unstubAllGlobals();

    if (originalWindow) {
      Object.defineProperty(originalWindow, "matchMedia", {
        configurable: true,
        value:
          originalWindow.matchMedia ??
          vi.fn().mockReturnValue({
            matches: false,
            media: "",
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            addListener: vi.fn(),
            removeListener: vi.fn(),
            dispatchEvent: vi.fn(),
          }),
      });
      originalWindow.localStorage.clear();
    }

    if (originalDocument) {
      originalDocument.documentElement.className = "";
      originalDocument.documentElement.removeAttribute("data-theme");
      originalDocument.documentElement.removeAttribute("data-appearance");
      originalDocument.documentElement.removeAttribute("data-mode");
      originalDocument.body.className = "";
      originalDocument.body.removeAttribute("data-theme");
      originalDocument.body.removeAttribute("data-appearance");
      originalDocument.body.removeAttribute("data-mode");
    }
  });

  it("defaults to light when there is no stored preference", async () => {
    vi.stubGlobal("window", undefined);
    vi.stubGlobal("document", undefined);
    vi.stubGlobal("navigator", undefined);

    const { useThemeStore } = await importThemeStore();

    expect(useThemeStore.getState().appearance).toBe("light");
    expect(useThemeStore.getState().resolvedMode).toBe("light");
  });

  it("keeps a persisted dark appearance", async () => {
    originalWindow.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { theme: "cosmic", appearance: "dark" },
        version: 0,
      }),
    );

    Object.defineProperty(originalWindow, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }),
    });

    vi.stubGlobal("window", originalWindow);
    vi.stubGlobal("document", originalDocument);
    vi.stubGlobal("navigator", originalNavigator);

    const { useThemeStore } = await importThemeStore();

    expect(useThemeStore.getState().appearance).toBe("dark");
    expect(useThemeStore.getState().resolvedMode).toBe("dark");
  });
});
