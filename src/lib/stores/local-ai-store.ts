import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CapgoLLM, TextFromAiEvent } from "@capgo/capacitor-llm";
import { isPlatform } from "@ionic/react";

// Native Model Configuration (Gemma 3 270M)
// Note: filename is important for the plugin to detect type if not explicit
const MODEL_URL = "https://cryonex-ai.b-cdn.net/gemma-3-tflite-gemma-3-270m-it-int8-v1/model.task";
const MODEL_FILENAME = "model.task";

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
    isGenerating: boolean;
    messages: LocalMessage[];
    chatId: string | null;
    error: string | null;

    // Actions
    checkModelStatus: () => Promise<void>;
    downloadModel: () => Promise<void>;
    initChat: () => Promise<void>;
    sendMessage: (text: string) => Promise<void>;
    updateLastMessage: (content: string, isFinished: boolean) => void;
    resetChat: () => void;
    deleteModel: () => Promise<void>;
}

export const useLocalAIStore = create<LocalAIStore>()(
    persist(
        (set, get) => ({
            isModelDownloaded: false,
            downloadProgress: 0,
            downloadText: "",
            isInitializing: false,
            isGenerating: false,
            messages: [],
            chatId: null,
            error: null,

            checkModelStatus: async () => {
                if (!isPlatform("hybrid")) return;

                // We can't easily check for file existence without Filesystem, 
                // but we can try to get readiness or just rely on persisted state.
                // For robustness, we could use Filesystem.stat here, but let's trust our download flow for now.
                // Assuming if isModelDownloaded is true, the file is there.
            },

            downloadModel: async () => {
                const { isModelDownloaded, isInitializing } = get();
                // On iOS/Android, re-checking status might be good, but don't block if already true
                if (isModelDownloaded || isInitializing) return;

                const isNative = isPlatform("hybrid");
                if (!isNative) {
                    set({ error: "Local models only available on native app" });
                    return;
                }

                set({ isInitializing: true, error: null, downloadText: "Starting download..." });

                // Setup listener for download progress
                let progressListener: any;

                try {
                    progressListener = await CapgoLLM.addListener('downloadProgress', (event) => {
                        if (event.progress) {
                            set({
                                downloadProgress: event.progress * 100,
                                downloadText: `Downloading: ${Math.round(event.progress * 100)}%`
                            });
                        }
                    });

                    set({ downloadText: "Requesting download..." });

                    const result = await CapgoLLM.downloadModel({
                        url: MODEL_URL,
                        filename: MODEL_FILENAME
                    });

                    // Download complete
                    set({
                        downloadText: "Initializing model...",
                        downloadProgress: 100,
                        isModelDownloaded: true
                    });


                    // Set the model
                    try {
                        console.log("[LocalAI] Setting model path:", result.path);
                        await CapgoLLM.setModel({
                            path: result.path,
                            modelType: "gemma" // Explicitly set to gemma for the plugin
                        });
                    } catch (e: any) {
                        console.error("[LocalAI] Failed to set model:", e);
                        set({
                            isModelDownloaded: false,
                            error: "Failed to load model file: " + e.message
                        });
                        return;
                    }

                    // Pre-create chat session
                    const chatFunc = get().initChat;
                    await chatFunc();

                    set({ isInitializing: false });

                } catch (err: any) {
                    console.error("Model Download Failed:", err);
                    set({
                        isInitializing: false,
                        error: err.message || "Failed to download model"
                    });
                } finally {
                    if (progressListener) progressListener.remove();
                }
            },

            initChat: async () => {
                try {
                    // Create a new chat session
                    const { id } = await CapgoLLM.createChat();
                    set({ chatId: id });

                    // Set up listener for AI responses IF not already set up globally?
                    // Zustand stores are singular, so we can set up the listener once or here.
                    // Doing it here is safer to ensure we capture the current chat ID context if needed.
                    // However, we need to handle multiple listeners if we call this multiple times.
                    // Ideally, we set up listener once in the component or store init. 
                    // Let's rely on the global listener setup below via a separate init function or effect in component.
                    // Actually, let's just handle it here and remove old ones if we could, but the API 
                    // returns a remove function. We need to store that reference if we want cleanup.
                    // For simplicity in this iteration, we'll assume the component handles the subscription or we add a one-time setup.

                } catch (e: any) {
                    console.error("Failed to init chat", e);
                    set({ error: "Failed to initialize chat session" });
                }
            },

            sendMessage: async (text: string) => {
                const { chatId } = get();
                if (!chatId) {
                    // Try to init if missing
                    await get().initChat();
                    if (!get().chatId) {
                        set({ error: "No active chat session" });
                        return;
                    }
                }

                const currentChatId = get().chatId!;

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

                try {
                    // Add placeholder
                    const assistantMsgId = Date.now() + 1;
                    set((state) => ({
                        messages: [
                            ...state.messages,
                            { role: "assistant", content: "", timestamp: assistantMsgId },
                        ],
                    }));

                    await CapgoLLM.sendMessage({
                        chatId: currentChatId,
                        message: text
                    });

                    // The actual text updates come via the 'textFromAi' event listener.
                    // We need to ensure that listener is active.

                } catch (err: any) {
                    set({ error: err.message || "Sending failed" });
                    set({ isGenerating: false });
                }
            },

            updateLastMessage: (content: string, isFinished: boolean) => {
                set((state) => {
                    if (state.messages.length === 0) return state;

                    const newMessages = [...state.messages];
                    const lastMsg = newMessages[newMessages.length - 1];

                    if (lastMsg.role === "assistant") {
                        // Append if it's a chunk, but CapgoLLM usually gives partial text chunks
                        // We need to append.
                        lastMsg.content += content;
                        return { messages: newMessages, isGenerating: !isFinished };
                    }
                    return state;
                });
            },

            resetChat: async () => {
                // To reset, we basically create a new chat session
                set({ messages: [] });
                await get().initChat();
            },

            deleteModel: async () => {
                set({
                    isModelDownloaded: false,
                    downloadProgress: 0,
                    chatId: null,
                    messages: [],
                });
                // Current Plugin API doesn't show deleteModel, so we just reset state.
                // Filesystem delete could be done if we knew the path, but 'downloadModel' abstraction hides it partially.
            }
        }),
        {
            name: "cryonex-local-ai-native",
            partialize: (state) => ({
                isModelDownloaded: state.isModelDownloaded
            }),
        },
    ),
);
