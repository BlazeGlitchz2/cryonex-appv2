import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelProvider, inferModelProvider } from "@/lib/utils/model-utils";

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
      activeModel: "auto",
      activeModelProvider: "Cryonex",
      activeImageModel: "stabilityai/stable-diffusion-xl-base-1.0",
      activeVideoModel: "stabilityai/stable-video-diffusion",
      activeAudioModel: "facebook/musicgen-small",
      performanceMode: false,
      currentChatId: null,
      isModelBrowserOpen: false,

      setActiveModel: (model, provider) => set({
        activeModel: model,
        activeModelProvider: provider || inferModelProvider(model)
      }),
      setActiveModelProvider: (provider) => set({ activeModelProvider: provider }),
      setActiveImageModel: (model) => set({ activeImageModel: model }),
      setActiveVideoModel: (model) => set({ activeVideoModel: model }),
      setActiveAudioModel: (model) => set({ activeAudioModel: model }),
      setPerformanceMode: (mode) => set({ performanceMode: mode }),
      setCurrentChatId: (id) => set({ currentChatId: id }),
      setModelBrowserOpen: (open) => set({ isModelBrowserOpen: open }),
    }),
    {
      name: "chat-store",
    }
  )
);