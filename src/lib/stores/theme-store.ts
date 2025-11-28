import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'cosmic' | 'liquid';
export type Mode = 'light' | 'dark';

interface ThemeState {
    theme: Theme;
    mode: Mode;
    setTheme: (theme: Theme) => void;
    setMode: (mode: Mode) => void;
    toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'cosmic',
            mode: 'dark',
            setTheme: (theme) => {
                set({ theme });
                // Apply theme class to document
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.remove('cosmic', 'liquid');
                    document.documentElement.classList.add(theme);
                }
            },
            setMode: (mode) => {
                set({ mode });
                // Apply mode class to document
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(mode);
                }
            },
            toggleMode: () => set((state) => {
                const newMode = state.mode === 'light' ? 'dark' : 'light';
                if (typeof document !== 'undefined') {
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(newMode);
                }
                return { mode: newMode };
            }),
        }),
        {
            name: 'cryonex-theme-storage',
        }
    )
);