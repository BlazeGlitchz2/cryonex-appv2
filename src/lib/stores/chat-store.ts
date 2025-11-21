import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelProvider, inferModelProvider } from '@/lib/utils/model-utils';

interface ChatStore {
  activeModel: string;
  activeModelProvider: ModelProvider;
  setActiveModel: (model: string, provider?: ModelProvider) => void;
  setActiveModelProvider: (provider: ModelProvider) => void;
  activeImageModel: string;
  setActiveImageModel: (model: string) => void;
  activeVideoModel: string;
  setActiveVideoModel: (model: string) => void;
  isWebLLMReady: boolean;
  setWebLLMReady: (ready: boolean) => void;
  webLLMProgress: { text: string; progress: number } | null;
  setWebLLMProgress: (progress: { text: string; progress: number } | null) => void;
  performanceMode: boolean;
  setPerformanceMode: (mode: boolean) => void;

  // Add: current chat selection
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      // Set Auto as the default model for intelligent selection
      activeModel: 'auto',
      activeModelProvider: 'auto',
      setActiveModel: (model, provider) => set({
        activeModel: model,
        activeModelProvider: 'auto',
      }),
      setActiveModelProvider: (provider) => set({ activeModelProvider: 'auto' }),
      activeImageModel: 'auto',
      setActiveImageModel: (model) => set({ activeImageModel: model }),
      activeVideoModel: 'auto',
      setActiveVideoModel: (model) => set({ activeVideoModel: model }),
      isWebLLMReady: false,
      setWebLLMReady: (ready) => set({ isWebLLMReady: ready }),
      webLLMProgress: null,
      setWebLLMProgress: (progress) => set({ webLLMProgress: progress }),
      performanceMode: true,
      setPerformanceMode: (mode) => set({ performanceMode: mode }),

      // Add: default state and setter
      currentChatId: null,
      setCurrentChatId: (id) => set({ currentChatId: id }),
    }),
    {
      name: 'chat-store',
      version: 4,
      migrate: (persisted: any) => {
        return persisted;
      },
    }
  )
);