declare module '@capgo/capacitor-llm' {
    export interface TextFromAiEvent {
        text: string;
        chatId: string;
        isChunk?: boolean;
    }

    export interface AiFinishedEvent {
        chatId: string;
    }

    export interface DownloadProgressEvent {
        progress: number;
        totalBytes?: number;
        downloadedBytes?: number;
    }

    export interface ReadinessChangeEvent {
        readiness: string;
    }

    export interface ModelOptions {
        path: string;
        modelType?: string;
        maxTokens?: number;
        topk?: number;
        temperature?: number;
        randomSeed?: number;
    }

    export interface DownloadModelOptions {
        url: string;
        companionUrl?: string;
        filename?: string;
    }

    export interface DownloadModelResult {
        path: string;
        companionPath?: string;
    }

    export interface LLMPlugin {
        createChat(): Promise<{ id: string; instructions?: string }>;
        sendMessage(options: { chatId: string; message: string }): Promise<void>;
        getReadiness(): Promise<{ readiness: string }>;
        setModel(options: ModelOptions): Promise<void>;
        downloadModel(options: DownloadModelOptions): Promise<DownloadModelResult>;
        addListener(eventName: 'textFromAi', listenerFunc: (event: TextFromAiEvent) => void): Promise<{ remove: () => Promise<void> }>;
        addListener(eventName: 'aiFinished', listenerFunc: (event: AiFinishedEvent) => void): Promise<{ remove: () => Promise<void> }>;
        addListener(eventName: 'downloadProgress', listenerFunc: (event: DownloadProgressEvent) => void): Promise<{ remove: () => Promise<void> }>;
        addListener(eventName: 'readinessChange', listenerFunc: (event: ReadinessChangeEvent) => void): Promise<{ remove: () => Promise<void> }>;
        getPluginVersion(): Promise<{ version: string }>;
    }

    export const CapgoLLM: LLMPlugin;
}
