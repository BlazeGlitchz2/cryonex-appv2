import { create } from 'zustand';

interface UIStore {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  isGlobalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
  toggleGlobalSearch: () => void;
  showSubwaySurfers: boolean;
  toggleSubwaySurfers: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  isGlobalSearchOpen: false,
  setGlobalSearchOpen: (open) => set({ isGlobalSearchOpen: open }),
  toggleGlobalSearch: () => set((state) => ({ isGlobalSearchOpen: !state.isGlobalSearchOpen })),
  showSubwaySurfers: false,
  toggleSubwaySurfers: () => set((state) => ({ showSubwaySurfers: !state.showSubwaySurfers })),
}));