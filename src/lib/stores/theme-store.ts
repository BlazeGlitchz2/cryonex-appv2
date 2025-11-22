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
            setTheme: (theme) => set({ theme }),
            setMode: (mode) => set({ mode }),
            toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
        }),
        {
            name: 'cryonex-theme-storage',
        }
    )
);
