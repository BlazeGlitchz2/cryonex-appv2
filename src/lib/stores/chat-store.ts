import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ModelProvider, inferModelProvider } from "@/lib/utils/model-utils";

export const DEFAULT_TEXT_MODEL = "minimax/minimax-m2.5:free";

const LEGACY_MODEL_REDIRECTS: Record<string, string> = {
  "pollinations/claude-airforce": "pollinations/perplexity-fast",
  "pollinations/claude": "pollinations/perplexity-fast",
  "pollinations/minimax": DEFAULT_TEXT_MODEL,
  "pollinations/minimax-01": DEFAULT_TEXT_MODEL,
  "minimax/minimax-m2.5": DEFAULT_TEXT_MODEL,
};

const normalizeModel = (model: string) => LEGACY_MODEL_REDIRECTS[model] || model;
const normalizePersistedModel = (model?: string) => {
  const nextModel = normalizeModel(model || DEFAULT_TEXT_MODEL);
  return nextModel === "auto" ? DEFAULT_TEXT_MODEL : nextModel;
};

interface ChatStore {
  activeModel: string;
  activeModelProvider: ModelProvider;
  activeImageModel: string;
  activeVideoModel: string;
  activeAudioModel: string;
  performanceMode: boolean;
  currentChatId: string | null;
  isModelBrowserOpen: boolean;

  setActiveModel: (model: string, provider?: ModelProvider) => void;
  setActiveModelProvider: (provider: ModelProvider) => void;
  setActiveImageModel: (model: string) => void;
  setActiveVideoModel: (model: string) => void;
  setActiveAudioModel: (model: string) => void;
  setPerformanceMode: (mode: boolean) => void;
  setCurrentChatId: (id: string | null) => void;
  setModelBrowserOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      activeModel: DEFAULT_TEXT_MODEL,
      activeModelProvider: inferModelProvider(DEFAULT_TEXT_MODEL),
      activeImageModel: "auto",
      activeVideoModel: "pollinations/grok-video",
      activeAudioModel: "facebook/musicgen-small",
      performanceMode: false,
      currentChatId: null,
      isModelBrowserOpen: false,

      setActiveModel: (model, provider) =>
        set({
          activeModel: normalizeModel(model),
          activeModelProvider:
            provider || inferModelProvider(normalizeModel(model)),
        }),
      setActiveModelProvider: (provider) =>
        set({ activeModelProvider: provider }),
      setActiveImageModel: (model) => set({ activeImageModel: model }),
      setActiveVideoModel: (model) => set({ activeVideoModel: model }),
      setActiveAudioModel: (model) => set({ activeAudioModel: model }),
      setPerformanceMode: (mode) => set({ performanceMode: mode }),
      setCurrentChatId: (id) => set({ currentChatId: id }),
      setModelBrowserOpen: (open) => set({ isModelBrowserOpen: open }),
    }),
    {
      name: "chat-store",
      migrate: (persistedState: any) => {
        if (!persistedState) {
          return persistedState;
        }

        const nextModel = normalizePersistedModel(persistedState.activeModel);

        return {
          ...persistedState,
          activeModel: nextModel,
          activeModelProvider: inferModelProvider(nextModel),
        };
      },
    },
  ),
);
