import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isPlatform } from "@ionic/react";
import { nativeLLM, ModelTier } from "../services/native-llm";

export interface LocalMessage {
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: number;
}

interface LocalAIStore {
    isModelDownloaded: boolean;
    downloadProgress: number; // 0 to 100
    downloadText: string;
    isInitializing: boolean;
    isModelLoading: boolean;
    isGenerating: boolean;
    messages: LocalMessage[];
    chatId: string | null;
    error: string | null;
    currentTier: ModelTier;

    // Actions
    setDownloading: (isDownloading: boolean) => void;
    setProgress: (progress: number, text: string) => void;
    setInitialized: (isInitialized: boolean) => void;
    setModelLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;

    checkModelStatus: () => Promise<void>;
    downloadModel: (tier?: ModelTier) => Promise<void>;
    initChat: (tier?: ModelTier) => Promise<void>;
    sendMessage: (text: string, tier?: ModelTier) => Promise<void>;
    updateLastMessage: (content: string, isFinished: boolean) => void;
    resetChat: () => void;
    deleteModel: () => Promise<void>;
}

export const useOfflineModelStore = create<Omit<LocalAIStore, "messages" | "chatId" | "checkModelStatus" | "downloadModel" | "initChat" | "sendMessage" | "updateLastMessage" | "resetChat" | "deleteModel" | "currentTier"> & { reset: () => void }>(
    (set) => ({
        isModelDownloaded: false,
        downloadProgress: 0,
        downloadText: "",
        isInitializing: false,
        isModelLoading: false,
        isGenerating: false,
        error: null,

        setDownloading: (isDownloading) => set({ isInitializing: isDownloading }),
        setProgress: (progress, text) => set({ downloadProgress: progress, downloadText: text }),
        setInitialized: (isInitialized) => set({ isModelDownloaded: isInitialized, isInitializing: false }),
        setModelLoading: (loading) => set({ isModelLoading: loading }),
        setError: (error) => set({ error }),
        reset: () => set({ isModelDownloaded: false, downloadProgress: 0, downloadText: "", isInitializing: false, isModelLoading: false, error: null })
    })
);

export const useLocalAIStore = create<LocalAIStore>()(
    persist(
        (set, get) => ({
            isModelDownloaded: false,
            downloadProgress: 0,
            downloadText: "",
            isInitializing: false,
            isModelLoading: false,
            isGenerating: false,
            messages: [],
            chatId: null,
            error: null,
            currentTier: "tiny",

            setDownloading: (isDownloading) => set({ isInitializing: isDownloading }),
            setProgress: (progress, text) => set({ downloadProgress: progress, downloadText: text }),
            setInitialized: (isInitialized) => set({ isModelDownloaded: isInitialized, isInitializing: false }),
            setModelLoading: (loading) => set({ isModelLoading: loading }),
            setError: (error) => set({ error }),

            checkModelStatus: async () => {
                if (!isPlatform("hybrid")) return;
                const status = nativeLLM.getStatus();
                if (status.hasCachedModel) {
                    set({ isModelDownloaded: true, currentTier: status.cachedTier as ModelTier || "tiny" });
                }
            },

            downloadModel: async (tier: ModelTier = "tiny") => {
                const { isModelDownloaded, isInitializing } = get();
                if (isModelDownloaded && get().currentTier === tier) return;
                if (isInitializing) return;

                const isNative = isPlatform("hybrid");
                if (!isNative) {
                    set({ error: "Local models only available on native app" });
                    return;
                }

                // Temporary bridging: Subscribe to the offline store updates driven by nativeLLM
                // This ensures UI updates regardless of which store is being triggered
                const unsub = useOfflineModelStore.subscribe((state) => {
                    set({
                        isModelDownloaded: state.isModelDownloaded,
                        downloadProgress: state.downloadProgress,
                        downloadText: state.downloadText,
                        isInitializing: state.isInitializing,
                        isModelLoading: state.isModelLoading,
                        error: state.error
                    });
                });

                try {
                    set({ isInitializing: true, error: null, downloadText: `Starting ${tier} model download...` });
                    // Force redownload if switching tiers or just initiating
                    await nativeLLM.initialize(tier, true);

                    unsub();
                    set({ isModelDownloaded: true, isInitializing: false, currentTier: tier });

                } catch (e: any) {
                    unsub();
                    set({ error: e.message, isInitializing: false });
                }
            },

            initChat: async (tier: ModelTier = "tiny") => {
                try {
                    await nativeLLM.initialize(tier);
                    set({ isModelDownloaded: true, currentTier: tier });
                } catch (e: any) {
                    set({ error: "Failed to init chat: " + e.message });
                }
            },

            sendMessage: async (text: string, tier: ModelTier = "tiny") => {
                set({ isGenerating: true, error: null });

                // Add user message
                const newUserMsg: LocalMessage = {
                    role: "user",
                    content: text,
                    timestamp: Date.now(),
                };

                const { messages } = get();
                const newHistory = [...messages, newUserMsg];
                set({ messages: newHistory });

                // Add placeholder
                const assistantMsgId = Date.now() + 1;
                set((state) => ({
                    messages: [
                        ...state.messages,
                        { role: "assistant", content: "", timestamp: assistantMsgId },
                    ],
                }));

                try {
                    // Ensure initialized
                    if (!nativeLLM.isModelReady()) {
                        await nativeLLM.initialize(tier);
                    }

                    // Stream response
                    let fullContent = "";
                    await nativeLLM.chat(newHistory, (chunk) => {
                        fullContent += chunk;

                        // Real-time update
                        set((state) => {
                            const msgs = [...state.messages];
                            const last = msgs[msgs.length - 1];
                            if (last.role === "assistant") {
                                last.content += chunk;
                                return { messages: msgs };
                            }
                            return state;
                        });
                    });

                    set({ isGenerating: false });

                } catch (err: any) {
                    set({ error: err.message || "Sending failed", isGenerating: false });
                }
            },

            updateLastMessage: (content: string, isFinished: boolean) => {
                // Legacy support if needed, but sendMessage handles streaming now
                set({ isGenerating: !isFinished });
            },

            resetChat: async () => {
                set({ messages: [] });
                await nativeLLM.initialize(get().currentTier); // Reset session
            },

            deleteModel: async () => {
                await nativeLLM.clearCache();
                set({
                    isModelDownloaded: false,
                    downloadProgress: 0,
                    chatId: null,
                    messages: [],
                    currentTier: "tiny"
                });
            }
        }),
        {
            name: "cryonex-local-ai-native",
            partialize: (state) => ({
                isModelDownloaded: state.isModelDownloaded,
                currentTier: state.currentTier,
                messages: state.messages // Persist history?
            }),
        },
    ),
);
