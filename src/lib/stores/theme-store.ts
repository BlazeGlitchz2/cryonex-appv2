import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "cosmic";
export type Mode = "light" | "dark";
export type AppearanceMode = Mode | "system";

const STORAGE_KEY = "cryonex-theme-storage";
const SYSTEM_QUERY = "(prefers-color-scheme: dark)";

function getSystemMode(): Mode {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia(SYSTEM_QUERY).matches ? "dark" : "light";
}

function getStoredAppearance(): AppearanceMode {
  if (typeof window === "undefined") return "system";

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return "system";

    const parsed = JSON.parse(raw) as {
      state?: { appearance?: AppearanceMode; mode?: Mode };
    };

    return parsed.state?.appearance ?? parsed.state?.mode ?? "system";
  } catch {
    return "system";
  }
}

function resolveMode(appearance: AppearanceMode): Mode {
  return appearance === "system" ? getSystemMode() : appearance;
}

function applyThemeToDocument(theme: Theme, appearance: AppearanceMode) {
  if (typeof document === "undefined") return;

  const resolvedMode = resolveMode(appearance);
  const root = document.documentElement;

  root.classList.remove("light", "dark", "cosmic");
  root.classList.add(theme, resolvedMode);
  root.dataset.theme = theme;
  root.dataset.appearance = appearance;
  root.dataset.mode = resolvedMode;
  root.style.colorScheme = resolvedMode;
}

const initialTheme: Theme = "cosmic";
const initialAppearance = getStoredAppearance();
const initialResolvedMode = resolveMode(initialAppearance);

applyThemeToDocument(initialTheme, initialAppearance);

interface ThemeState {
  theme: Theme;
  mode: Mode;
  appearance: AppearanceMode;
  resolvedMode: Mode;
  setTheme: (theme: Theme) => void;
  setAppearance: (appearance: AppearanceMode) => void;
  setMode: (mode: Mode) => void;
  syncWithSystem: () => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: initialTheme,
      mode: initialResolvedMode,
      appearance: initialAppearance,
      resolvedMode: initialResolvedMode,
      setTheme: (theme) => {
        const { appearance } = get();
        applyThemeToDocument(theme, appearance);
        set({
          theme,
          mode: resolveMode(appearance),
          resolvedMode: resolveMode(appearance),
        });
      },
      setAppearance: (appearance) => {
        const { theme } = get();
        const resolvedMode = resolveMode(appearance);
        applyThemeToDocument(theme, appearance);
        set({ appearance, mode: resolvedMode, resolvedMode });
      },
      setMode: (mode) => {
        const { theme } = get();
        applyThemeToDocument(theme, mode);
        set({ appearance: mode, mode, resolvedMode: mode });
      },
      syncWithSystem: () => {
        const { appearance, theme } = get();
        const resolvedMode = resolveMode(appearance);
        applyThemeToDocument(theme, appearance);
        set({ mode: resolvedMode, resolvedMode });
      },
      toggleMode: () => {
        const nextMode = get().resolvedMode === "light" ? "dark" : "light";
        const { theme } = get();
        applyThemeToDocument(theme, nextMode);
        set({ appearance: nextMode, mode: nextMode, resolvedMode: nextMode });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        theme: state.theme,
        appearance: state.appearance,
      }),
      merge: (persisted, current) => {
        const typedPersisted = (persisted ?? {}) as Partial<ThemeState>;
        const theme = typedPersisted.theme ?? current.theme;
        const appearance = typedPersisted.appearance ?? current.appearance;
        const resolvedMode = resolveMode(appearance);

        applyThemeToDocument(theme, appearance);

        return {
          ...current,
          ...typedPersisted,
          theme,
          appearance,
          mode: resolvedMode,
          resolvedMode,
        };
      },
    },
  ),
);

export { SYSTEM_QUERY, applyThemeToDocument, getSystemMode, resolveMode };
