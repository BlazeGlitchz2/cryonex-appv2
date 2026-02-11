import { create } from "zustand";

interface OfflineModelState {
    isInitialized: boolean;
    isDownloading: boolean;
    isModelLoading: boolean;
    progress: number;
    progressText: string;
    error: string | null;
    mode: "web" | "native";

    setInitialized: (initialized: boolean) => void;
    setDownloading: (downloading: boolean) => void;
    setModelLoading: (loading: boolean) => void;
    setProgress: (progress: number, text?: string) => void;
    setError: (error: string | null) => void;
    setMode: (mode: "web" | "native") => void;
    reset: () => void;
}

export const useOfflineModelStore = create<OfflineModelState>((set) => ({
    isInitialized: false,
    isDownloading: false,
    isModelLoading: false,
    progress: 0,
    progressText: "",
    error: null,
    mode: "web",

    setInitialized: (initialized) => set({ isInitialized: initialized }),
    setDownloading: (downloading) => set({ isDownloading: downloading }),
    setModelLoading: (loading) => set({ isModelLoading: loading }),
    setProgress: (progress, text) => set({ progress, progressText: text || "" }),
    setError: (error) => set({ error }),
    setMode: (mode) => set({ mode }),
    reset: () => set({
        isInitialized: false,
        isDownloading: false,
        isModelLoading: false,
        progress: 0,
        progressText: "",
        error: null,
        mode: "web"
    }),
}));
