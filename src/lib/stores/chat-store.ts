import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatStore {
  activeModel: string;
  setActiveModel: (model: string) => void;
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
      setActiveModel: (model) => set({ activeModel: model }),
      activeImageModel: 'replicate/black-forest-labs/flux-schnell',
      setActiveImageModel: (model) => set({ activeImageModel: model }),
      activeVideoModel: 'replicate/minimax/video-01',
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
      // Add a versioned migration to move old default (Qwen) to GPT‑4o
      version: 2,
      migrate: (persisted: any) => {
        if (!persisted) return persisted;
        if (!persisted.activeModel || persisted.activeModel === 'Qwen/Qwen2.5-14B-Instruct' || persisted.activeModel === 'openai/gpt-4o') {
          persisted.activeModel = 'auto';
        }
        return persisted;
      },
    }
  )
);