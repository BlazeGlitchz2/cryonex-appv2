import { create } from "zustand";
import { Capacitor } from "@capacitor/core";

import {
  createDefaultOfflineModelState,
  type OfflineModelMode,
  type OfflineModelStateSnapshot,
  type OfflineModelTier,
} from "../services/offline-model-state";

interface OfflineModelState extends OfflineModelStateSnapshot {
  setInitialized: (initialized: boolean) => void;
  setDownloading: (downloading: boolean) => void;
  setModelLoading: (loading: boolean) => void;
  setProgress: (progress: number, text?: string) => void;
  setError: (error: string | null) => void;
  setMode: (mode: OfflineModelMode) => void;
  setCurrentTier: (tier: OfflineModelTier) => void;
  setCachedModel: (path: string | null, tier?: OfflineModelTier) => void;
  applySnapshot: (snapshot: Partial<OfflineModelStateSnapshot>) => void;
  reset: (overrides?: Partial<OfflineModelStateSnapshot>) => void;
}

const getDefaultState = (overrides: Partial<OfflineModelStateSnapshot> = {}) =>
  createDefaultOfflineModelState({
    mode: Capacitor.isNativePlatform() ? "native" : "web",
    ...overrides,
  });

export const useOfflineModelStore = create<OfflineModelState>((set) => ({
  ...getDefaultState(),

  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setDownloading: (downloading) => set({ isDownloading: downloading }),
  setModelLoading: (loading) => set({ isModelLoading: loading }),
  setProgress: (progress, text) => set({ progress, progressText: text || "" }),
  setError: (error) => set({ error }),
  setMode: (mode) => set({ mode }),
  setCurrentTier: (currentTier) => set({ currentTier }),
  setCachedModel: (path, tier) =>
    set((state) => ({
      hasCachedModel: !!path,
      cachedModelPath: path,
      currentTier: tier || state.currentTier,
    })),
  applySnapshot: (snapshot) => set((state) => ({ ...state, ...snapshot })),
  reset: (overrides) => set(getDefaultState(overrides)),
}));
