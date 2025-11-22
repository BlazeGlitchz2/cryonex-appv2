import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'cosmic-nebula' | 'liquid-glass';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'cosmic-nebula',
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);
      },
    }),
    {
      name: 'cryonex-theme',
    }
  )
);
