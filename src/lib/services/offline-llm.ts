// WebLLM Engine type only for TypeScript (no runtime impact)
import type { MLCEngine } from "@mlc-ai/web-llm";

import { useOfflineModelStore } from "../stores/offline-model-store";
import { Capacitor } from "@capacitor/core";
import { nativeLLM } from "./native-llm";

// Using Llama 3.2 1B Instruct - very efficient for mobile (Web Version)
const WEB_MODEL_ID = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

export interface WebGpuDiagnostics {
    isSupported: boolean;
    adapterName: string;
    hasMemory: boolean;
    issues: string[];
}

class OfflineLLMService {
    private engine: MLCEngine | null = null;
    private initializing = false;
    private isNative = Capacitor.isNativePlatform();

    constructor() {
        if (this.isNative) {
            useOfflineModelStore.getState().setMode("native");
        }
    }

    /**
     * Check if the offline model is ready to chat
     */
    isReady(): boolean {
        if (this.isNative) return useOfflineModelStore.getState().isInitialized;
        return !!this.engine;
    }

    /**
     * Check if a cached model exists on disk
     */
    hasCachedModel(): boolean {
        if (this.isNative) return !!localStorage.getItem("cryonex_native_model_path");
        return false; // Web doesn't support persistent cache check
    }

    /**
     * Silently preload the cached model without showing any download UI.
     * Returns true if the model was successfully preloaded.
     */
    async preload(): Promise<boolean> {
        if (this.isNative) {
            try {
                await nativeLLM.initialize();
                return true;
            } catch {
                return false;
            }
        }
        return false; // Web preloading not supported
    }

    async runDiagnostics(): Promise<WebGpuDiagnostics> {
        const diagnostics: WebGpuDiagnostics = {
            isSupported: false,
            adapterName: "Unknown",
            hasMemory: true,
            issues: []
        };

        if (this.isNative) {
            // Native mode is supported via @capgo/capacitor-llm
            diagnostics.isSupported = true;
            diagnostics.adapterName = "Native Accelerator (MediaPipe/CoreML)";
            return diagnostics;
        }

        if (!navigator.gpu) {
            diagnostics.issues.push("WebGPU not supported by this browser.");
            return diagnostics;
        }

        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                diagnostics.issues.push("No WebGPU adapter found. Check flags.");
                return diagnostics;
            }

            // info.device might be missing in some type definitions, fallback to simple string
            const info = await (adapter as any).requestAdapterInfo?.() || {};
            diagnostics.adapterName = info.device || info.vendor || "Generic WebGPU Adapter";
            diagnostics.isSupported = true;

            // Specific check for Mali GPUs
            if (diagnostics.adapterName.includes("Mali")) {
                console.log("Mali GPU detected - Optimizing for mobile.");
            }

            return diagnostics;
        } catch (error) {
            diagnostics.issues.push(`Adapter Request Failed: ${error}`);
            return diagnostics;
        }
    }

    async initialize(forceRedownload = false) {
        // Route to Native
        if (this.isNative) {
            return nativeLLM.initialize("tiny", forceRedownload);
        }

        // WEB IMPLEMENTATION
        if (this.engine) return;
        if (this.initializing) {
            while (this.initializing) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            if (this.engine) return;
        }

        const { setDownloading, setProgress, setInitialized, setError } = useOfflineModelStore.getState();

        // WebGPU Support Check
        if (!navigator.gpu) {
            const errorMsg = "WebGPU is not supported on this device. Offline mode is unavailable.";
            setError(errorMsg);
            setDownloading(false);
            return;
        }

        this.initializing = true;
        setDownloading(true);
        setProgress(0, "Initializing WebGPU Engine...");

        try {
            // DYNAMICALLY IMPORT HEAVY LIBRARY ONLY WHEN NEEDED
            const { CreateMLCEngine } = await import("@mlc-ai/web-llm");

            this.engine = await CreateMLCEngine(WEB_MODEL_ID, {
                initProgressCallback: (report: any) => {
                    const percent = Math.round(report.progress * 100);
                    setProgress(percent, report.text);
                },
                logLevel: "INFO",
            });

            setInitialized(true);
            setDownloading(false);
            setProgress(100, "Ready");
        } catch (error: any) {
            console.error("Failed to initialize Offline LLM:", error);
            setError(error.message || "Failed to load offline model.");
            setDownloading(false);
            throw error;
        } finally {
            this.initializing = false;
        }
    }

    async chat(messages: any[], onStream: (chunk: string) => void) {
        // Route to Native
        if (this.isNative) {
            return nativeLLM.chat(messages, onStream);
        }

        // WEB IMPLEMENTATION
        if (!this.engine) {
            await this.initialize();
            if (!this.engine) throw new Error("Offline Engine failed to initialize");
        }

        try {
            const completion = await this.engine?.chat.completions.create({
                messages,
                stream: true,
                temperature: 0.7,
                max_tokens: 1024,
            });

            if (completion) {
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content || "";
                    if (content) onStream(content);
                }
            }
        } catch (error) {
            console.error("Offline Chat Error:", error);
            throw error;
        }
    }
}

export const offlineLLM = new OfflineLLMService();


