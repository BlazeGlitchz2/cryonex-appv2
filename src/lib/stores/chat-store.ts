import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelProvider, inferModelProvider } from "@/lib/utils/model-utils";

interface ChatState {
  activeModel: string;
  activeModelProvider: ModelProvider;
  activeImageModel: string;
  activeVideoModel: string;
  performanceMode: boolean;
  
  setActiveModel: (model: string) => void;
  setActiveImageModel: (model: string) => void;
  setActiveVideoModel: (model: string) => void;
  setPerformanceMode: (mode: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      activeModel: "openai/gpt-4-turbo",
      activeModelProvider: "OpenAI",
      activeImageModel: "stabilityai/stable-diffusion-xl-base-1.0",
      activeVideoModel: "stabilityai/stable-video-diffusion",
      performanceMode: false,

      setActiveModel: (model) => set({ 
        activeModel: model,
        activeModelProvider: inferModelProvider(model)
      }),
      setActiveImageModel: (model) => set({ activeImageModel: model }),
      setActiveVideoModel: (model) => set({ activeVideoModel: model }),
      setPerformanceMode: (mode) => set({ performanceMode: mode }),
    }),
    {
      name: "chat-storage",
    }
  )
);