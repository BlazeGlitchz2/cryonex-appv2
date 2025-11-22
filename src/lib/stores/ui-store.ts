import { create } from 'zustand';

interface UIStore {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
}));

